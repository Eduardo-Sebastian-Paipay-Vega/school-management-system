import { pool, withTenant } from '../config/database';
import { documentHash, encryptDocument, randomToken, tokenHash } from '../core/identity-crypto';

const TENANT_ID = 'ac5f0d3a-4bf5-428c-bcd0-0742cabc82c5'; // Guamán Poma de Ayala
const ADMIN_ID = '7a7dae05-091a-49dd-9b16-4a35b2039fc3';  // admin.gpa
const DOCENTE_ID = '3482a6b2-b629-4a21-836c-7489146117dc'; // docente.gpa

const ESTUDIANTES_RAW = [
  { nombres: 'Luciana Sofía', apPaterno: 'Alarcón', apMaterno: 'Mendoza', dni: '74125896', c1: 'AD', c2: 'A', c3: 'AD' },
  { nombres: 'Rodrigo Alonso', apPaterno: 'Barrientos', apMaterno: 'Quispe', dni: '75236984', c1: 'A', c2: 'A', c3: 'B' },
  { nombres: 'Valeria Nicole', apPaterno: 'Cárdenas', apMaterno: 'Huamán', dni: '76347012', c1: 'AD', c2: 'AD', c3: 'A' },
  { nombres: 'Mateo Sebastián', apPaterno: 'Gómez', apMaterno: 'Palomino', dni: '77458123', c1: 'B', c2: 'B', c3: 'A' },
  { nombres: 'Camila Fernanda', apPaterno: 'López', apMaterno: 'Huaccachi', dni: '78569234', c1: 'A', c2: 'AD', c3: 'A' },
  { nombres: 'Bryan Alexander', apPaterno: 'Huamán', apMaterno: 'Quispe', dni: '79670345', c1: 'AD', c2: 'A', c3: 'A' },
  { nombres: 'Andrea Celeste', apPaterno: 'Navarro', apMaterno: 'Sulca', dni: '71234567', c1: 'A', c2: 'B', c3: 'B' },
  { nombres: 'Joaquín Gabriel', apPaterno: 'Rojas', apMaterno: 'Contreras', dni: '72345678', c1: 'AD', c2: 'AD', c3: 'AD' },
  { nombres: 'Fabiana Beatriz', apPaterno: 'Valdez', apMaterno: 'Gutiérrez', dni: '73456789', c1: 'A', c2: 'A', c3: 'AD' },
  { nombres: 'Diego Alonso', apPaterno: 'Zamora', apMaterno: 'Paucar', dni: '70123456', c1: 'B', c2: 'A', c3: 'A' },
];

export async function seedAcademicData() {
  console.log('--- Iniciando Seed Académico 2026 para Guamán Poma en Supabase ---');
  await withTenant(TENANT_ID, ADMIN_ID, async (client) => {
    // 1. Sede Principal
    let sedeRes = await client.query<{ id: string }>('SELECT id FROM sedes WHERE tenant_id = $1 LIMIT 1', [TENANT_ID]);
    let sedeId: string;
    if (sedeRes.rows.length === 0) {
      const insSede = await client.query<{ id: string }>(`
        INSERT INTO sedes (tenant_id, nombre, direccion, activo, created_by)
        VALUES ($1, 'Sede Central Guamán Poma', 'Av. Independencia s/n, Huamanga, Ayacucho', true, $2)
        RETURNING id
      `, [TENANT_ID, ADMIN_ID]);
      sedeId = insSede.rows[0].id;
      console.log('✓ Sede Central creada:', sedeId);
    } else {
      sedeId = sedeRes.rows[0].id;
      console.log('✓ Sede existente:', sedeId);
    }

    // 2. Año Lectivo 2026
    let anioRes = await client.query<{ id: string }>(
      'SELECT id FROM anios_lectivos WHERE tenant_id = $1 AND anio = 2026', [TENANT_ID]
    );
    let anioId: string;
    if (anioRes.rows.length === 0) {
      const insAnio = await client.query<{ id: string }>(`
        INSERT INTO anios_lectivos (tenant_id, anio, fecha_inicio, fecha_fin, activo, created_by)
        VALUES ($1, 2026, '2026-03-02', '2026-12-18', true, $2)
        RETURNING id
      `, [TENANT_ID, ADMIN_ID]);
      anioId = insAnio.rows[0].id;
      console.log('✓ Año Lectivo 2026 creado:', anioId);
    } else {
      anioId = anioRes.rows[0].id;
      console.log('✓ Año Lectivo 2026 ya existe:', anioId);
    }

    // 3. Periodos Académicos (4 Bimestres)
    const bimestres = [
      { num: 1, ini: '2026-03-02', fin: '2026-05-08', lim: '2026-05-15 23:59:59+00' },
      { num: 2, ini: '2026-05-18', fin: '2026-07-24', lim: '2026-07-31 23:59:59+00' },
      { num: 3, ini: '2026-08-10', fin: '2026-10-09', lim: '2026-10-16 23:59:59+00' },
      { num: 4, ini: '2026-10-19', fin: '2026-12-18', lim: '2026-12-23 23:59:59+00' }
    ];
    let primerPeriodoId = '';
    for (const b of bimestres) {
      const pRes = await client.query<{ id: string }>(`
        INSERT INTO periodos_academicos (tenant_id, anio_lectivo_id, tipo, numero, fecha_inicio, fecha_fin, fecha_limite_notas, cerrado, created_by)
        VALUES ($1, $2, 'BIMESTRE', $3, $4, $5, $6, false, $7)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [TENANT_ID, anioId, b.num, b.ini, b.fin, b.lim, ADMIN_ID]);
      if (pRes.rows[0]?.id && !primerPeriodoId) primerPeriodoId = pRes.rows[0].id;
    }
    if (!primerPeriodoId) {
      const pExist = await client.query<{ id: string }>(
        'SELECT id FROM periodos_academicos WHERE tenant_id = $1 AND anio_lectivo_id = $2 AND numero = 1',
        [TENANT_ID, anioId]
      );
      primerPeriodoId = pExist.rows[0]?.id;
    }
    console.log('✓ 4 Bimestres configurados. Periodo activo:', primerPeriodoId);

    // 4. Grado y Sección: Secundaria 3° B
    let seccionId: string;
    const secRes = await client.query<{ id: string }>(`
      INSERT INTO grados_secciones (tenant_id, anio_lectivo_id, sede_id, nivel, grado, seccion, aforo_maximo, tutor_id, created_by)
      VALUES ($1, $2, $3, 'SECUNDARIA', 3, 'B', 35, $4, $5)
      ON CONFLICT (tenant_id, anio_lectivo_id, nivel, grado, seccion) DO UPDATE SET aforo_maximo = 35
      RETURNING id
    `, [TENANT_ID, anioId, sedeId, DOCENTE_ID, ADMIN_ID]);
    seccionId = secRes.rows[0].id;
    console.log('✓ Sección Secundaria 3° B configurada:', seccionId);

    // 5. Cursos CNEB y Competencias
    const cursos = [
      {
        nombre: 'Matemática', cod: 'MAT-SEC',
        comps: [
          'Resuelve problemas de cantidad',
          'Resuelve problemas de regularidad, equivalencia y cambio',
          'Resuelve problemas de forma, movimiento y localización',
          'Resuelve problemas de gestión de datos e incertidumbre'
        ]
      },
      {
        nombre: 'Comunicación', cod: 'COM-SEC',
        comps: [
          'Se comunica oralmente en su lengua materna',
          'Lee diversos tipos de textos escritos',
          'Escribe diversos tipos de textos'
        ]
      },
      {
        nombre: 'Ciencia y Tecnología', cod: 'CYT-SEC',
        comps: [
          'Indaga mediante métodos científicos',
          'Explica el mundo físico basándose en conocimientos científicos',
          'Diseña y construye soluciones tecnológicas'
        ]
      }
    ];

    let cursoMateId = '';
    for (const c of cursos) {
      const cRes = await client.query<{ id: string }>(`
        INSERT INTO cursos (tenant_id, nivel, nombre, codigo_cneb, es_taller, activo, created_by)
        VALUES ($1, 'SECUNDARIA', $2, $3, false, true, $4)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [TENANT_ID, c.nombre, c.cod, ADMIN_ID]);
      const cid = cRes.rows[0]?.id || (await client.query<{ id: string }>('SELECT id FROM cursos WHERE tenant_id = $1 AND codigo_cneb = $2', [TENANT_ID, c.cod])).rows[0].id;
      if (c.cod === 'MAT-SEC') cursoMateId = cid;

      for (let i = 0; i < c.comps.length; i++) {
        await client.query(`
          INSERT INTO competencias (tenant_id, curso_id, nombre, orden, activo, created_by)
          VALUES ($1, $2, $3, $4, true, $5)
          ON CONFLICT DO NOTHING
        `, [TENANT_ID, cid, c.comps[i], i + 1, ADMIN_ID]);
      }
    }
    console.log('✓ Cursos CNEB y competencias creados. Curso principal Matemática:', cursoMateId);

    // 6. Evaluación Bimestre I
    let evaluacionId: string;
    const evExist = await client.query<{ id: string }>(
      'SELECT id FROM evaluaciones WHERE seccion_id = $1 AND curso_id = $2 AND periodo_id = $3 LIMIT 1',
      [seccionId, cursoMateId, primerPeriodoId]
    );
    if (evExist.rows.length === 0) {
      const evRes = await client.query<{ id: string }>(`
        INSERT INTO evaluaciones (seccion_id, curso_id, docente_id, periodo_id, nombre, peso, cerrada)
        VALUES ($1, $2, $3, $4, 'Bimestre I — Registro Continuo', 1.0, false)
        RETURNING id
      `, [seccionId, cursoMateId, DOCENTE_ID, primerPeriodoId]);
      evaluacionId = evRes.rows[0].id;
    } else {
      evaluacionId = evExist.rows[0].id;
    }
    console.log('✓ Evaluación activa creada:', evaluacionId);

    // 7. Estudiantes, Matrículas, Carnés QR y Calificaciones Reales
    const rolEstudiante = (await client.query<{ id: number }>('SELECT id FROM roles WHERE codigo = \'ESTUDIANTE\'')).rows[0].id;

    for (let idx = 0; idx < ESTUDIANTES_RAW.length; idx++) {
      const est = ESTUDIANTES_RAW[idx];
      const docH = documentHash(est.dni);
      const docCif = encryptDocument(est.dni);
      const ult4 = est.dni.slice(-4);

      // Persona (el estudiante)
      const pRes = await client.query<{ id: string }>(`
        INSERT INTO personas (tenant_id, tipo_documento, documento_hash, documento_cifrado, documento_ultimos4, nombres, apellido_paterno, apellido_materno, email, created_by)
        VALUES ($1, 'DNI', $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (tenant_id, tipo_documento, documento_hash) DO UPDATE SET nombres = EXCLUDED.nombres
        RETURNING id
      `, [TENANT_ID, docH, docCif, ult4, est.nombres, est.apPaterno, est.apMaterno, `estudiante.${est.dni}@guamanpoma.edu.pe`, ADMIN_ID]);
      const personaId = pRes.rows[0].id;

      // Usuario para el estudiante
      const uRes = await client.query<{ id: string }>(`
        INSERT INTO usuarios (tenant_id, persona_id, username, password_hash, estado, ambito_silencioso, created_by)
        VALUES ($1, $2, $3, crypt('GuamanPoma2026!', gen_salt('bf', 12)), 'ACTIVO', 'ESTUDIANTIL', $4)
        ON CONFLICT (persona_id) DO UPDATE SET estado = 'ACTIVO'
        RETURNING id
      `, [TENANT_ID, personaId, `est.${est.dni}`, ADMIN_ID]);
      const usuarioId = uRes.rows[0].id;

      // Rol Estudiante
      const urExist = await client.query(
        'SELECT id FROM usuario_roles WHERE tenant_id = $1 AND usuario_id = $2 AND rol_id = $3',
        [TENANT_ID, usuarioId, rolEstudiante]
      );
      if (urExist.rows.length === 0) {
        await client.query(`
          INSERT INTO usuario_roles (tenant_id, usuario_id, rol_id, activo)
          VALUES ($1, $2, $3, true)
        `, [TENANT_ID, usuarioId, rolEstudiante]);
      }

      // Matrícula (estudiante_id es personaId)
      let matriculaId: string;
      const matExist = await client.query<{ id: string }>(
        'SELECT id FROM matriculas WHERE tenant_id = $1 AND anio_lectivo_id = $2 AND estudiante_id = $3',
        [TENANT_ID, anioId, personaId]
      );
      if (matExist.rows.length === 0) {
        const matRes = await client.query<{ id: string }>(`
          INSERT INTO matriculas (tenant_id, anio_lectivo_id, estudiante_id, seccion_id, estado, fecha_matricula, created_by)
          VALUES ($1, $2, $3, $4, 'REGULAR', '2026-03-02', $5)
          RETURNING id
        `, [TENANT_ID, anioId, personaId, seccionId, ADMIN_ID]);
        matriculaId = matRes.rows[0].id;
      } else {
        matriculaId = matExist.rows[0].id;
      }

      // Carné QR
      const rawToken = randomToken();
      await client.query(`
        INSERT INTO carnes_escolares (estudiante_id, codigo_qr_token, fecha_emision, activo)
        VALUES ($1, $2, CURRENT_DATE, true)
        ON CONFLICT (codigo_qr_token) DO NOTHING
      `, [personaId, rawToken]);

      // Calificación real inicial (C1, convertida a escala vigesimal aproximada)
      const lit = est.c1 as 'AD' | 'A' | 'B' | 'C';
      const vig = lit === 'AD' ? 19 : lit === 'A' ? 16 : lit === 'B' ? 13 : 9;
      await client.query(`
        INSERT INTO calificaciones (evaluacion_id, matricula_id, nota_vigesimal, nota_literal, version_lock, registrado_por)
        VALUES ($1, $2, $3, $4, 1, $5)
        ON CONFLICT (evaluacion_id, matricula_id) DO UPDATE SET nota_literal = EXCLUDED.nota_literal, nota_vigesimal = EXCLUDED.nota_vigesimal
      `, [evaluacionId, matriculaId, vig, lit, DOCENTE_ID]);

      // Asistencia de hoy
      const estadoAsist = idx === 3 ? 'TARDANZA_JUSTIFICADA' : 'PRESENTE';
      const horaIngreso = idx === 3 ? '08:05:14' : '07:46:22';
      await client.query(`
        INSERT INTO asistencias_alumnos (matricula_id, fecha, hora_registro, estado, origen, justificada, observacion)
        VALUES ($1, CURRENT_DATE, $2, $3, 'KIOSCO_PORTERIA', $4, $5)
        ON CONFLICT (matricula_id, fecha) DO UPDATE SET estado = EXCLUDED.estado
      `, [matriculaId, horaIngreso, estadoAsist, idx === 3, idx === 3 ? 'Cita médica justificada' : null]);
    }

    console.log(`✓ ${ESTUDIANTES_RAW.length} estudiantes matriculados en 3° B con calificaciones y asistencias de hoy en Supabase.`);
  });
  console.log('--- Seed Académico completado con éxito ---');
}

if (require.main === module) {
  seedAcademicData().then(() => process.exit(0)).catch((err) => {
    console.error('Error en seed:', err);
    process.exit(1);
  });
}
