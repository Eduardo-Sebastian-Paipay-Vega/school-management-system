-- S6-01 (hallazgo H1 de docs/core/PLAN_IMPLEMENTACION_S6_S9.md).
-- 20261022010500 aplica la política RLS estándar solo a tablas con tenant_id, pero su
-- GRANT ON ALL TABLES y los privilegios por defecto también dieron acceso a sms_app sobre
-- tablas sin tenant_id. Sin RLS, esas filas eran legibles y modificables entre tenants.
-- Al 2026-11-07 ningún código de backend/src lee estas tablas: M8 usa el esquema squad3.
-- Cada squad dueño devuelve el privilegio en su propia migración, junto con tenant_id,
-- FK compuesta y política RLS. La prueba de database/tests impide volver a abrir el hueco.
-- asistencias_alumnos y avisos_inasistencia reciben tenant_id en la migración siguiente.
REVOKE ALL ON
    asistencias_practicantes,
    calificaciones,
    evaluaciones,
    conclusiones_descriptivas,
    carnes_escolares,
    expedientes_adjuntos,
    expedientes_movimientos,
    metricas_impacto_ssu,
    noticias_galeria
FROM sms_app;

-- Catálogo global de permisos: solo lectura, igual que roles y banco_conclusiones_cneb.
-- Una escritura desde un tenant cambiaría el catálogo de todos.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON permisos_core FROM sms_app;

-- Historial de node-pg-migrate: solo lo usa el rol migrador. No existe cuando las
-- migraciones se aplican sin node-pg-migrate (pruebas con PGlite).
DO $$
BEGIN
    IF to_regclass('public.pgmigrations') IS NOT NULL THEN
        EXECUTE 'REVOKE ALL ON public.pgmigrations FROM sms_app';
    END IF;
    IF to_regclass('public.pgmigrations_id_seq') IS NOT NULL THEN
        EXECUTE 'REVOKE ALL ON SEQUENCE public.pgmigrations_id_seq FROM sms_app';
    END IF;
END $$;
