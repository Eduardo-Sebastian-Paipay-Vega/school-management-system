// Pruebas de las migraciones del núcleo (ADR-003, ADR-004, modelo de datos canónico).
// Cada migración se aplica en su propia transacción y en orden de nombre, como lo hace
// node-pg-migrate. PGlite es PostgreSQL real compilado a WebAssembly: no requiere servidor.
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const DIR = new URL('../migrations/', import.meta.url);
const archivos = (await readdir(DIR)).filter((f) => f.endsWith('.sql')).sort();
const BASELINE = archivos.filter((f) => f.includes('_baseline_'));
const NUCLEO = archivos.filter((f) => !f.includes('_baseline_'));

async function nuevaBase() {
  return new PGlite({ extensions: { pg_trgm, uuid_ossp, pgcrypto } });
}

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

// Ejecuta fn dentro de una transacción con el contexto de ADR-003, opcionalmente como sms_app.
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

async function nuevaInstitucion(db, codigo) {
  return (await uno(db, `INSERT INTO instituciones (codigo_modular, nombre, nivel_educativo)
                         VALUES ($1, $2, 'PRIMARIA') RETURNING id`, [codigo, `IE ${codigo}`])).id;
}

describe('Base nueva: línea base + núcleo', () => {
  let db, T1, T2, S1, S2;

  before(async () => {
    db = await nuevaBase();
    await aplicar(db, archivos);
    T1 = await nuevaInstitucion(db, '0000001');
    T2 = await nuevaInstitucion(db, '0000002');
    S1 = await sistemaDe(db, T1);
    S2 = await sistemaDe(db, T2);
  });

  it('crea el usuario sistema y la configuración al dar de alta una institución', async () => {
    const u = await uno(db, `SELECT u.estado, p.nombres FROM usuarios u JOIN personas p ON p.id = u.persona_id WHERE u.id = $1`, [S1]);
    assert.equal(u.estado, 'INACTIVO');
    assert.equal(u.nombres, 'Sistema');
    const c = await uno(db, `SELECT zona_horaria, created_by FROM configuracion_institucional WHERE tenant_id = $1`, [T1]);
    assert.equal(c.zona_horaria, 'America/Lima');
    assert.equal(c.created_by, S1);
  });

  it('el usuario sistema no puede autenticarse con una clave vacía ni conocida', async () => {
    const r = await uno(db, `SELECT password_hash = crypt('', password_hash) AS vacia,
                                    password_hash = crypt('sistema', password_hash) AS conocida
                             FROM usuarios WHERE id = $1`, [S1]);
    assert.deepEqual(r, { vacia: false, conocida: false });
  });

  it('siembra la matriz RBAC por institución y aísla las concesiones', async () => {
    const own = await enContexto(db, { tenant: T1, usuario: S1, comoApp: true }, async () =>
      uno(db, `SELECT count(*)::int AS total FROM rol_permisos_core WHERE tenant_id=$1`, [T1]));
    assert.ok(own.total > 0);
    const grants = await enContexto(db, { tenant: T1, usuario: S1, comoApp: true }, async () =>
      db.query(`SELECT r.codigo::text AS rol FROM rol_permisos_core rp
        JOIN roles r ON r.id=rp.rol_id WHERE rp.tenant_id=$1 AND rp.permiso_codigo='users:manage'`, [T1]));
    assert.deepEqual(grants.rows.map((row) => row.rol).sort(), ['DIRECTIVO', 'SUPERADMIN']);
    const other = await enContexto(db, { tenant: T1, usuario: S1, comoApp: true }, async () =>
      uno(db, `SELECT count(*)::int AS total FROM rol_permisos_core WHERE tenant_id=$1`, [T2]));
    assert.equal(other.total, 0);
  });

  it('aísla sesiones, enlaces y notificaciones por tenant', async () => {
    const link = await enContexto(db, { tenant: T1, usuario: S1 }, async () => {
      await db.query(`INSERT INTO sesiones_usuario(tenant_id,usuario_id,refresh_hash,access_jti,version_auth,expira_en)
        VALUES($1,$2,$3,gen_random_uuid(),1,now()+interval '1 day')`, [T1,S1,'b'.repeat(64)]);
      await db.query(`INSERT INTO enlaces_acceso(tenant_id,usuario_id,proposito,token_hash,expira_en)
        VALUES($1,$2,'ACTIVACION',$3,now()+interval '1 day')`, [T1,S1,'c'.repeat(64)]);
      return (await uno(db, `INSERT INTO notificaciones(tenant_id,usuario_id,categoria,titulo,mensaje)
        VALUES($1,$2,'SEGURIDAD','Aviso','Mensaje') RETURNING id`, [T1,S1])).id;
    });
    const hidden = await enContexto(db, { tenant: T2, usuario: S2, comoApp: true }, async () =>
      uno(db, `SELECT
        (SELECT count(*)::int FROM sesiones_usuario WHERE tenant_id=$1) AS sesiones,
        (SELECT count(*)::int FROM enlaces_acceso WHERE tenant_id=$1) AS enlaces,
        (SELECT count(*)::int FROM notificaciones WHERE id=$2) AS avisos`, [T1,link]));
    assert.deepEqual(hidden,{sesiones:0,enlaces:0,avisos:0});
  });

  describe('restricciones del núcleo', () => {
    let A2026, A2027, SEC, EST;

    before(async () => {
      await enContexto(db, { tenant: T1, usuario: S1 }, async () => {
        A2026 = (await uno(db, `INSERT INTO anios_lectivos (tenant_id, anio, fecha_inicio, fecha_fin, activo)
                                VALUES ($1, 2026, '2026-03-01', '2026-12-20', true) RETURNING id`, [T1])).id;
        A2027 = (await uno(db, `INSERT INTO anios_lectivos (tenant_id, anio, fecha_inicio, fecha_fin)
                                VALUES ($1, 2027, '2027-03-01', '2027-12-20') RETURNING id`, [T1])).id;
        SEC = (await uno(db, `INSERT INTO grados_secciones (tenant_id, anio_lectivo_id, nivel, grado, seccion)
                              VALUES ($1, $2, 'PRIMARIA', 3, 'B') RETURNING id`, [T1, A2026])).id;
        EST = (await uno(db, `INSERT INTO personas (tenant_id, tipo_documento, documento_cifrado, documento_hash,
                                                    documento_ultimos4, nombres, apellido_paterno)
                              VALUES ($1, 'DNI', '\\x00', $2, '5678', 'Ana', 'Quispe') RETURNING id`, [T1, 'a'.repeat(64)])).id;
      });
    });

    const falla = (fn, patron) => assert.rejects(fn, patron);
    const ctx1 = (fn) => enContexto(db, { tenant: T1, usuario: S1 }, fn);

    it('rechaza una inserción sin contexto (created_by nulo)', () =>
      falla(() => db.query(`INSERT INTO sedes (tenant_id, nombre) VALUES ($1, 'Sin contexto')`, [T1]),
        /null value in column "created_by"/));

    it('rechaza matricular en una sección de otro año lectivo', () =>
      falla(() => ctx1(() => db.query(`INSERT INTO matriculas (tenant_id, anio_lectivo_id, estudiante_id, seccion_id)
                                         VALUES ($1, $2, $3, $4)`, [T1, A2027, EST, SEC])), /fk_matriculas_seccion/));

    it('rechaza matricular a una persona de otra institución', async () => {
      const ajena = await enContexto(db, { tenant: T2, usuario: S2 }, async () =>
        (await uno(db, `INSERT INTO personas (tenant_id, tipo_documento, nombres, apellido_paterno)
                        VALUES ($1, 'SIN_DOCUMENTO', 'Luis', 'Mamani') RETURNING id`, [T2])).id);
      await falla(() => ctx1(() => db.query(`INSERT INTO matriculas (tenant_id, anio_lectivo_id, estudiante_id, seccion_id)
                                              VALUES ($1, $2, $3, $4)`, [T1, A2026, ajena, SEC])), /fk_matriculas_estudiante/);
    });

    it('acepta una matrícula válida y exige fecha al retirar', async () => {
      await ctx1(() => db.query(`INSERT INTO matriculas (tenant_id, anio_lectivo_id, estudiante_id, seccion_id)
                                 VALUES ($1, $2, $3, $4)`, [T1, A2026, EST, SEC]));
      await falla(() => ctx1(() => db.query(`UPDATE matriculas SET estado = 'RETIRADO' WHERE estudiante_id = $1`, [EST])),
        /ck_matriculas_retiro/);
    });

    it('permite un solo año activo por institución', () =>
      falla(() => ctx1(() => db.query(`UPDATE anios_lectivos SET activo = true WHERE id = $1`, [A2027])),
        /uq_anios_lectivos_activo/));

    it('exige hash y cifrado para un DNI, y lo hace único', async () => {
      await falla(() => ctx1(() => db.query(`INSERT INTO personas (tenant_id, tipo_documento, nombres, apellido_paterno)
                                              VALUES ($1, 'DNI', 'X', 'Y')`, [T1])), /ck_personas_documento/);
      await falla(() => ctx1(() => db.query(`INSERT INTO personas (tenant_id, tipo_documento, documento_cifrado, documento_hash, nombres, apellido_paterno)
                                              VALUES ($1, 'DNI', '\\x01', $2, 'Otra', 'Persona')`, [T1, 'a'.repeat(64)])), /uq_personas_documento/);
    });

    it('mantiene updated_at en cada UPDATE', async () => {
      const antes = await uno(db, `SELECT updated_at FROM personas WHERE id = $1`, [EST]);
      await ctx1(() => db.query(`UPDATE personas SET telefono = '999' WHERE id = $1`, [EST]));
      const despues = await uno(db, `SELECT updated_at FROM personas WHERE id = $1`, [EST]);
      assert.ok(despues.updated_at > antes.updated_at);
    });

    it('valida la escala al pasarla a VIGENTE', async () => {
      const escala = await ctx1(async () => (await uno(db, `INSERT INTO escalas_calificacion (tenant_id, anio_lectivo_id, nivel, modalidad)
                                                           VALUES ($1, $2, 'SECUNDARIA', 'DUAL_VIGESIMAL') RETURNING id`, [T1, A2026])).id);
      const vigente = () => ctx1(() => db.query(`UPDATE escalas_calificacion SET estado = 'VIGENTE', aprobada_en = now() WHERE id = $1`, [escala]));
      await falla(vigente, /no tiene rangos/);
      await ctx1(() => db.query(`INSERT INTO rangos_escala (tenant_id, escala_id, nivel_logro, nota_minima, nota_maxima, descripcion)
                                 VALUES ($1, $2, 'A', 14, 17, 'Logro esperado'), ($1, $2, 'AD', 17, 20, 'Logro destacado')`, [T1, escala]));
      await falla(vigente, /solapados/);
    });

    it('un docente vigente por curso y sección', async () => {
      const asignar = (curso) => ctx1(() => db.query(
        `INSERT INTO carga_lectiva (tenant_id, seccion_id, curso_id, docente_id, horas_semanales) VALUES ($1, $2, $3, $4, 5)`,
        [T1, SEC, curso, S1]));
      const curso = await ctx1(async () => (await uno(db,
        `INSERT INTO cursos (tenant_id, nivel, nombre, codigo_cneb) VALUES ($1, 'PRIMARIA', 'Matemática', 'MAT') RETURNING id`, [T1])).id);
      await asignar(curso);
      await falla(() => asignar(curso), /uq_carga_vigente/);
    });
  });

  describe('aislamiento con RLS (ADR-003)', () => {
    const contar = (tenant) => enContexto(db, { tenant, comoApp: true }, async () =>
      (await uno(db, `SELECT count(*)::int AS n FROM personas`)).n);

    it('cada institución ve solo sus personas', async () => {
      const n1 = await contar(T1);
      const n2 = await contar(T2);
      const total = (await uno(db, `SELECT count(*)::int AS n FROM personas`)).n;
      assert.ok(n1 > 0 && n2 > 0);
      assert.equal(n1 + n2, total);
    });

    it('sin contexto no ve ninguna fila (falla cerrada)', async () => {
      assert.equal(await contar(null), 0);
    });

    it('no puede insertar en otra institución', () =>
      assert.rejects(enContexto(db, { tenant: T1, usuario: S1, comoApp: true }, () =>
        db.query(`INSERT INTO personas (tenant_id, tipo_documento, nombres, apellido_paterno)
                  VALUES ($1, 'SIN_DOCUMENTO', 'X', 'Y')`, [T2])), /row-level security/));

    it('instituciones solo muestra la propia', async () => {
      const n = await enContexto(db, { tenant: T1, comoApp: true }, async () =>
        (await uno(db, `SELECT count(*)::int AS n FROM instituciones`)).n);
      assert.equal(n, 1);
    });

    it('sms_app no es dueño de nada ni tiene BYPASSRLS', async () => {
      const r = await uno(db, `SELECT rolbypassrls,
                                      (SELECT count(*)::int FROM pg_class WHERE relowner = r.oid) AS objetos
                               FROM pg_roles r WHERE rolname = 'sms_app'`);
      assert.deepEqual(r, { rolbypassrls: false, objetos: 0 });
    });

    it('toda tabla de public con tenant_id tiene RLS y política', async () => {
      const r = await db.query(`
        SELECT c.relname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = 'tenant_id' AND NOT a.attisdropped
        WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relispartition
          AND (NOT c.relrowsecurity OR NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = c.relname))`);
      assert.deepEqual(r.rows, []);
    });

    it('ninguna vista materializada ni partición es legible por sms_app', async () => {
      const r = await db.query(`
        SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND (c.relkind = 'm' OR c.relispartition)
          AND has_table_privilege('sms_app', c.oid, 'SELECT')`);
      assert.deepEqual(r.rows, []);
    });

    it('toda vista aplica RLS del invocador o filtra por tenant', async () => {
      const r = await db.query(`
        SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'v'
          AND NOT ('security_invoker=true' = ANY (coalesce(c.reloptions, '{}'))
                   OR ('security_barrier=true' = ANY (coalesce(c.reloptions, '{}'))
                       AND pg_get_viewdef(c.oid) LIKE '%app_tenant_id()%'))`);
      assert.deepEqual(r.rows, []);
    });
  });

  describe('auditoría (DM-08)', () => {
    const comoApp = (tenant, usuario, fn) => enContexto(db, { tenant, usuario, comoApp: true }, fn);
    const registrar = (accion) => db.query(
      `SELECT fn_registrar_auditoria('core', $1, '10.0.0.1'::inet, 'usuarios', '1', NULL, '{"x":1}'::jsonb) AS id`, [accion]);
    const verificar = () => uno(db, `SELECT * FROM fn_verificar_cadena_auditoria()`);

    it('encadena los registros y la verificación es íntegra', async () => {
      await comoApp(T1, S1, async () => { await registrar('LOGIN'); await registrar('UPDATE'); await registrar('LOGOUT'); });
      const v = await comoApp(T1, S1, verificar);
      assert.deepEqual(v, { total_registros: 3, cadena_integra: true, primer_id_invalido: null });
      const enlace = await uno(db, `SELECT count(*)::int AS n FROM logs_auditoria a JOIN logs_auditoria b
                                    ON b.hash_previo = a.hash_registro WHERE a.tenant_id = $1`, [T1]);
      assert.equal(enlace.n, 2);
    });

    it('la otra institución no ve esos registros', async () => {
      const v = await comoApp(T2, S2, verificar);
      assert.equal(v.total_registros, 0);
      const n = await comoApp(T2, S2, async () => (await uno(db, `SELECT count(*)::int AS n FROM logs_auditoria`)).n);
      assert.equal(n, 0);
    });

    it('la aplicación no puede insertar ni modificar directamente', async () => {
      await assert.rejects(comoApp(T1, S1, () => db.query(
        `INSERT INTO logs_auditoria (tenant_id, modulo, accion, ip_origen, hash_registro) VALUES ($1, 'x', 'x', '1.1.1.1', $2)`,
        [T1, 'f'.repeat(64)])), /permission denied/);
      await assert.rejects(comoApp(T1, S1, () => db.query(`UPDATE logs_auditoria SET accion = 'X'`)), /permission denied/);
    });

    it('ni el dueño puede modificar, borrar ni vaciar (tabla y partición)', async () => {
      await assert.rejects(db.query(`UPDATE logs_auditoria SET accion = 'X'`), /solo inserción/);
      await assert.rejects(db.query(`DELETE FROM logs_auditoria`), /solo inserción/);
      await assert.rejects(db.query(`TRUNCATE logs_auditoria`), /solo inserción/);
      const p = (await uno(db, `SELECT inhrelid::regclass::text AS p FROM pg_inherits WHERE inhparent = 'logs_auditoria'::regclass LIMIT 1`)).p;
      await assert.rejects(db.query(`TRUNCATE ${p}`), /solo inserción/);
    });

    it('detecta una manipulación hecha saltándose los triggers', async () => {
      const id = (await uno(db, `SELECT min(id) AS id FROM logs_auditoria WHERE tenant_id = $1`, [T1])).id;
      await db.exec(`BEGIN; SET LOCAL session_replication_role = replica;`);
      await db.query(`UPDATE logs_auditoria SET payload_nuevo = '{"x":2}' WHERE id = $1`, [id]);
      await db.exec('COMMIT');
      const v = await comoApp(T1, S1, verificar);
      assert.equal(v.cadena_integra, false);
      assert.equal(v.primer_id_invalido, id);
    });
  });
});

describe('Actualización de una base existente con datos', () => {
  let db, T, U, A, SEC, M;

  before(async () => {
    db = await nuevaBase();
    await aplicar(db, BASELINE);
    T = (await uno(db, `INSERT INTO instituciones (codigo_modular, nombre, nivel_educativo) VALUES ('1234567', 'IE Legado', 'PRIMARIA') RETURNING id`)).id;
    U = (await uno(db, `INSERT INTO usuarios (tenant_id, username, dni, email, password_hash, nombres, apellidos)
                        VALUES ($1, 'ana', '12345678', 'ana@ie.pe', 'x', 'Ana', 'Quispe Huamán') RETURNING id`, [T])).id;
    await db.query(`INSERT INTO usuario_roles (usuario_id, rol_id) SELECT $1, id FROM roles WHERE codigo = 'ESTUDIANTE'`, [U]);
    A = (await uno(db, `INSERT INTO anios_lectivos (tenant_id, anio, fecha_inicio, fecha_fin, activo) VALUES ($1, 2026, '2026-03-01', '2026-12-20', true) RETURNING id`, [T])).id;
    SEC = (await uno(db, `INSERT INTO grados_secciones (tenant_id, nivel, grado, seccion) VALUES ($1, 'PRIMARIA', 3, 'A') RETURNING id`, [T])).id;
    M = (await uno(db, `INSERT INTO matriculas (tenant_id, anio_lectivo_id, estudiante_id, seccion_id) VALUES ($1, $2, $3, $4) RETURNING id`, [T, A, U, SEC])).id;
    await db.query(`INSERT INTO logs_auditoria (tenant_id, usuario_id, modulo, accion, ip_origen, hash_registro)
                    VALUES ($1, $2, 'core', 'LOGIN', '10.0.0.9', $3)`, [T, U, 'c'.repeat(64)]);
    await aplicar(db, NUCLEO);
  });

  it('crea una persona con el mismo UUID para cada usuario', async () => {
    const p = await uno(db, `SELECT p.nombres, p.apellido_paterno, p.tipo_documento, u.persona_id
                             FROM personas p JOIN usuarios u ON u.persona_id = p.id WHERE u.id = $1`, [U]);
    assert.deepEqual(p, { nombres: 'Ana', apellido_paterno: 'Quispe Huamán', tipo_documento: 'SIN_DOCUMENTO', persona_id: U });
  });

  it('conserva el DNI en usuarios hasta la fase contract', async () => {
    assert.equal((await uno(db, `SELECT dni FROM usuarios WHERE id = $1`, [U])).dni, '12345678');
  });

  it('migra la asignación de roles con tenant e historial', async () => {
    const r = await uno(db, `SELECT tenant_id, activo, created_by FROM usuario_roles WHERE usuario_id = $1`, [U]);
    assert.equal(r.tenant_id, T);
    assert.equal(r.activo, true);
    assert.equal(r.created_by, await sistemaDe(db, T));
  });

  it('asigna la sección al año activo y la matrícula sigue válida', async () => {
    assert.equal((await uno(db, `SELECT anio_lectivo_id FROM grados_secciones WHERE id = $1`, [SEC])).anio_lectivo_id, A);
    const m = await uno(db, `SELECT p.nombres FROM matriculas m JOIN personas p ON p.id = m.estudiante_id WHERE m.id = $1`, [M]);
    assert.equal(m.nombres, 'Ana');
  });

  it('copia la auditoría anterior y la marca como fuera de la cadena', async () => {
    const r = await uno(db, `SELECT count(*)::int AS n, host(min(ip_origen)) AS ip FROM logs_auditoria WHERE tenant_id = $1`, [T]);
    assert.deepEqual(r, { n: 1, ip: '10.0.0.9' });
    const v = await enContexto(db, { tenant: T, comoApp: true }, () => uno(db, `SELECT * FROM fn_verificar_cadena_auditoria()`));
    assert.equal(v.cadena_integra, false);
  });
});

describe('Base creada por el init de Docker (línea base ya aplicada una vez)', () => {
  it('la línea base es reejecutable y el núcleo se aplica encima', async () => {
    const db = await nuevaBase();
    await aplicar(db, [BASELINE[0]]);
    await aplicar(db, archivos);
    const n = await uno(db, `SELECT count(*)::int AS n FROM pg_tables WHERE schemaname = 'public' AND tablename = 'personas'`);
    assert.equal(n.n, 1);
  });
});

describe('Migración bloqueada por datos que no puede resolver sola', () => {
  it('se detiene si una sección no tiene año activo', async () => {
    const db = await nuevaBase();
    await aplicar(db, BASELINE);
    const t = (await uno(db, `INSERT INTO instituciones (codigo_modular, nombre, nivel_educativo) VALUES ('7654321', 'IE Sin año', 'PRIMARIA') RETURNING id`)).id;
    await db.query(`INSERT INTO grados_secciones (tenant_id, nivel, grado, seccion) VALUES ($1, 'PRIMARIA', 1, 'A')`, [t]);
    await assert.rejects(aplicar(db, NUCLEO), /secciones sin año lectivo/);
  });
});
