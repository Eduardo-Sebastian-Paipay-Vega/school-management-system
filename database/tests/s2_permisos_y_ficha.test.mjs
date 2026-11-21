// Squad 2 (20261107001000): permisos de asistencia, matrícula y filiación verificada, y
// funciones fn_publicar_ficha_apoderado() / fn_revocar_ficha_apoderado() (RF-15 -> RF-75).
// Mismo método que migraciones.test.mjs: cada migración en su transacción, en orden.
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const DIR = new URL('../migrations/', import.meta.url);
const archivos = (await readdir(DIR)).filter((f) => f.endsWith('.sql')).sort();
const S2 = '20261107001000_s2_permisos_asistencia_matricula.sql';

const nuevaBase = () => new PGlite({ extensions: { pg_trgm, uuid_ossp, pgcrypto } });

async function aplicar(db, lista) {
  for (const f of lista) {
    const sql = await readFile(new URL(f, DIR), 'utf8');
    try {
      await db.exec(`BEGIN;\n${sql}\nCOMMIT;`);
    } catch (e) {
      await db.exec('ROLLBACK').catch(() => {});
      throw new Error(`${f}: ${e.message}`);
    }
  }
}

async function enContexto(db, { tenant, usuario, comoApp = false }, fn) {
  await db.exec('BEGIN');
  try {
    if (comoApp) await db.exec('SET LOCAL ROLE sms_app');
    await db.query(`SELECT set_config('app.tenant_id', $1, true), set_config('app.user_id', $2, true)`,
      [tenant ?? '', usuario ?? '']);
    const r = await fn();
    await db.exec('COMMIT');
    return r;
  } catch (e) {
    await db.exec('ROLLBACK').catch(() => {});
    throw e;
  }
}

const uno = async (db, sql, params = []) => (await db.query(sql, params)).rows[0];
const sistemaDe = async (db, tenant) =>
  (await uno(db, `SELECT id FROM usuarios WHERE tenant_id = $1 AND username = 'sistema'`, [tenant])).id;
const nuevaInstitucion = async (db, codigo) =>
  (await uno(db, `INSERT INTO instituciones (codigo_modular, nombre, nivel_educativo)
                  VALUES ($1, $2, 'PRIMARIA') RETURNING id`, [codigo, `IE ${codigo}`])).id;

const ESPERADO = {
  'attendance:correct': ['AUXILIAR', 'COORDINADOR_ACADEMICO', 'SUPERADMIN'],
  'enrollments:create': ['COORDINADOR_ACADEMICO', 'SECRETARIA', 'SUPERADMIN'],
  'guardian-records:publish': ['DIRECTIVO', 'SUPERADMIN'],
};
async function concesiones(db, tenant) {
  const r = await db.query(`SELECT rp.permiso_codigo AS p, r.codigo::text AS rol FROM rol_permisos_core rp
    JOIN roles r ON r.id = rp.rol_id WHERE rp.tenant_id = $1 AND rp.permiso_codigo = ANY($2::text[])
    ORDER BY 1, 2`, [tenant, Object.keys(ESPERADO)]);
  const out = {};
  for (const row of r.rows) (out[row.p] ??= []).push(row.rol);
  return out;
}

describe('S2: matriz de permisos de asistencia, matrícula y ficha', () => {
  it('concede los permisos a planteles existentes y a planteles nuevos', async () => {
    const db = await nuevaBase();
    await aplicar(db, archivos.filter((f) => f < S2));
    const previo = await nuevaInstitucion(db, '0000071');
    await aplicar(db, archivos.filter((f) => f >= S2));
    assert.deepEqual(await concesiones(db, previo), ESPERADO);
    // Sin trg_seed_permisos_s2, un plantel nuevo solo tendría la concesión de SUPERADMIN.
    const nuevo = await nuevaInstitucion(db, '0000072');
    assert.deepEqual(await concesiones(db, nuevo), ESPERADO);
    const catalogo = await db.query(`SELECT codigo FROM permisos_core WHERE codigo = ANY($1::text[])`,
      [Object.keys(ESPERADO)]);
    assert.equal(catalogo.rows.length, 3);
  });
});

describe('S2: publicación y revocación de la filiación verificada', () => {
  let db, T1, T2, S1, S2u, EST1, EST2;
  const HASH = 'c'.repeat(64);
  const MOTIVO = 'Corrección de la ficha: parentesco mal registrado';
  const comoApp = (tenant, usuario, fn) => enContexto(db, { tenant, usuario, comoApp: true }, fn);
  const publicar = (est, parentesco = 'MADRE', hash = HASH, ip = '10.0.0.9') => uno(db,
    `SELECT * FROM fn_publicar_ficha_apoderado(gen_random_uuid(), $1, $2, $3, $4::inet)`,
    [est, hash, parentesco, ip]);
  const revocar = (id, motivo = MOTIVO, ip = '10.0.0.9') => uno(db,
    `SELECT * FROM fn_revocar_ficha_apoderado($1, $2, $3::inet)`, [id, motivo, ip]);
  const eventos = (accion) => uno(db,
    `SELECT count(*)::int AS n FROM logs_auditoria WHERE accion = $1`, [accion]).then((r) => r.n);

  before(async () => {
    db = await nuevaBase();
    await aplicar(db, archivos);
    T1 = await nuevaInstitucion(db, '0000081');
    T2 = await nuevaInstitucion(db, '0000082');
    S1 = await sistemaDe(db, T1);
    S2u = await sistemaDe(db, T2);
    const persona = (tenant) => uno(db, `INSERT INTO personas (tenant_id, tipo_documento, nombres, apellido_paterno)
      VALUES ($1, 'SIN_DOCUMENTO', 'Escolar', 'Ficticio') RETURNING id`, [tenant]).then((r) => r.id);
    EST1 = await enContexto(db, { tenant: T1, usuario: S1 }, () => persona(T1));
    EST2 = await enContexto(db, { tenant: T2, usuario: S2u }, () => persona(T2));
  });

  it('sms_app sigue sin escribir directamente en la tabla', () =>
    assert.rejects(comoApp(T1, S1, () => db.query(`INSERT INTO fichas_apoderados_verificados
      (tenant_id, fuente_ficha_id, estudiante_id, apoderado_documento_hash, parentesco, verificado_en)
      VALUES ($1, gen_random_uuid(), $2, $3, 'MADRE', now())`, [T1, EST1, HASH])), /permission denied/));

  it('rechaza publicar sin contexto, sin IP, con datos inválidos o con estudiante de otro tenant', async () => {
    await assert.rejects(comoApp(T1, '', () => publicar(EST1)), /GUARDIAN_RECORD_CONTEXT_REQUIRED/);
    await assert.rejects(comoApp(T1, S1, () => publicar(EST1, 'MADRE', HASH, null)), /GUARDIAN_RECORD_IP_REQUIRED/);
    await assert.rejects(comoApp(T1, S1, () => publicar(EST1, 'MADRE', '12345678')), /GUARDIAN_RECORD_INVALID/);
    await assert.rejects(comoApp(T1, S1, () => publicar(EST1, 'TIO')), /GUARDIAN_RECORD_INVALID/);
    await assert.rejects(comoApp(T1, S1, () => publicar(EST2)), /GUARDIAN_RECORD_STUDENT_NOT_FOUND/);
    assert.equal(await comoApp(T1, S1, () => eventos('GUARDIAN_RECORD_PUBLISHED')), 0);
  });

  it('publica con auditoría sin el hash del documento y rechaza la misma filiación activa', async () => {
    // Revertida junto con la transacción del consumidor.
    await assert.rejects(comoApp(T1, S1, async () => {
      await publicar(EST1);
      throw new Error('fallo posterior del consumidor');
    }), /fallo posterior/);
    assert.equal(await comoApp(T1, S1, () => eventos('GUARDIAN_RECORD_PUBLISHED')), 0);

    const fila = await comoApp(T1, S1, () => publicar(EST1));
    assert.equal(fila.tenant_id, T1);
    assert.equal(fila.revocado_en, null);
    assert.ok(fila.verificado_en);
    const evento = await comoApp(T1, S1, () => uno(db, `SELECT usuario_id, modulo, registro_id, payload_nuevo
      FROM logs_auditoria WHERE accion = 'GUARDIAN_RECORD_PUBLISHED'`));
    assert.equal(evento.usuario_id, S1);
    assert.equal(evento.modulo, 'academics');
    assert.equal(evento.registro_id, fila.id);
    assert.equal(evento.payload_nuevo.parentesco, 'MADRE');
    assert.ok(!JSON.stringify(evento.payload_nuevo).includes(HASH));
    await assert.rejects(comoApp(T1, S1, () => publicar(EST1)), /uq_ficha_apoderado_activa/);
    assert.equal(await comoApp(T2, S2u, () => eventos('GUARDIAN_RECORD_PUBLISHED')), 0);
    const cadena = await comoApp(T1, S1, () => uno(db, 'SELECT * FROM fn_verificar_cadena_auditoria()'));
    assert.equal(cadena.cadena_integra, true);
  });

  it('revoca sin reutilizar la fila y exige motivo, tenant propio y fila vigente', async () => {
    const fila = await comoApp(T1, S1, () => publicar(EST1, 'PADRE', 'd'.repeat(64)));
    await assert.rejects(comoApp(T1, S1, () => revocar(fila.id, 'corto')), /GUARDIAN_RECORD_REASON_REQUIRED/);
    await assert.rejects(comoApp(T1, S1, () => revocar(fila.id, MOTIVO, null)), /GUARDIAN_RECORD_IP_REQUIRED/);
    await assert.rejects(comoApp(T2, S2u, () => revocar(fila.id)), /GUARDIAN_RECORD_NOT_FOUND/);
    await assert.rejects(comoApp(T1, '', () => revocar(fila.id)), /GUARDIAN_RECORD_CONTEXT_REQUIRED/);
    const revocada = await comoApp(T1, S1, () => revocar(fila.id));
    assert.equal(revocada.id, fila.id);
    assert.ok(revocada.revocado_en);
    await assert.rejects(comoApp(T1, S1, () => revocar(fila.id)), /GUARDIAN_RECORD_ALREADY_REVOKED/);
    const evento = await comoApp(T1, S1, () => uno(db, `SELECT payload_anterior, payload_nuevo
      FROM logs_auditoria WHERE accion = 'GUARDIAN_RECORD_REVOKED' AND registro_id = $1`, [fila.id]));
    assert.equal(evento.payload_anterior.revocadoEn, null);
    assert.equal(evento.payload_nuevo.motivo, MOTIVO);
    // La corrección publica una fila nueva: la revocada queda como historial.
    const nueva = await comoApp(T1, S1, () => publicar(EST1, 'PADRE', 'd'.repeat(64)));
    assert.notEqual(nueva.id, fila.id);
    const historial = await comoApp(T1, S1, () => uno(db, `SELECT count(*)::int AS total,
      count(*) FILTER (WHERE revocado_en IS NULL)::int AS vigentes FROM fichas_apoderados_verificados
      WHERE estudiante_id = $1 AND parentesco = 'PADRE'`, [EST1]));
    assert.deepEqual(historial, { total: 2, vigentes: 1 });
  });
});
