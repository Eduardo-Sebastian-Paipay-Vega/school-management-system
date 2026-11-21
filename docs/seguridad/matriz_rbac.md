# Matriz RBAC inicial del Core

La fuente ejecutable son `permisos_core` y `rol_permisos_core` por tenant. `AuthService` relee permisos en cada petición. Cambiar la matriz incrementa `auth_version` y revoca las sesiones afectadas. `SUPERADMIN` es administrador TI del plantel.

| Rol | Lectura Core | Gestión Core | Permisos académicos previstos |
| --- | --- | --- | --- |
| SUPERADMIN | Todos | Todos | Según módulo |
| DIRECTIVO | Usuarios, roles, configuración, auditoría | Alta y edición de cuentas ordinarias, importación, configuración, apoderados, avisos | Reportes |
| SECRETARIA | Usuarios, roles, configuración | Importación, apoderados, avisos | — |
| COORDINADOR_ACADEMICO | Usuarios, configuración | Configuración | Notas y reportes |
| DOCENTE / DOCENTE_CONTRATADO | Perfil y avisos propios | Perfil propio | Notas, asistencia y reportes |
| ESTUDIANTE / APODERADO | Perfil y avisos propios | Perfil propio | Notas y asistencia de su ámbito |

La operación de edición no puede agregar ni retirar `roles:manage`, `users:assign-roles`, `users:unmask`, `audit:read` ni `audit:export` a roles ordinarios. `DIRECTIVO` conserva los dos permisos de auditoría concedidos inicialmente. Las rutas de escritura escolar exigen `school:manage`; las altas, cambios e invitaciones de cuentas exigen `users:manage` además del rol autorizado. El apoderado requiere vínculo activo y consentimiento además de rol; los otros squads deben validar sección, curso o estudiante además del permiso general.

## Permisos del Squad 2 (migración `20261107001000_s2_permisos_asistencia_matricula.sql`)

| Permiso | Ruta | Roles concedidos por plantel | Justificación |
| --- | --- | --- | --- |
| `attendance:correct` | `PATCH /api/v1/attendance/{id}/correction` | SUPERADMIN, COORDINADOR_ACADEMICO, AUXILIAR | RF-22, actor principal «Coordinación Académica / Auxiliares»; el rol AUXILIAR se describe como «Tardanzas, justificaciones y apoyo en aula». |
| `enrollments:create` | `POST /api/v1/enrollments` | SUPERADMIN, SECRETARIA, COORDINADOR_ACADEMICO | RF-16, actor principal «Secretaría Académica / Coordinación». |
| `guardian-records:publish` | `POST /api/v1/enrollments/guardian-records` y `POST /api/v1/enrollments/guardian-records/{id}/revoke` | SUPERADMIN, DIRECTIVO | RF-15, actor «Secretaría Académica / Dirección». SECRETARIA queda fuera por separación de funciones: ya vincula con `guardians:manage`, y el contrato RF-15 → RF-75 exige que quien vincula no fabrique la fuente. |

Los planteles existentes reciben estas concesiones en la migración; los nuevos, con `trg_seed_permisos_s2` (`AFTER INSERT ON instituciones`), que complementa a `trg_seed_permisos_plantel` sin modificarlo. Ningún permiso nuevo está en la lista protegida de la edición de la matriz: un rol ordinario puede recibirlo o perderlo con `roles:manage`. La corrección de asistencia y la filiación verificada no confían solo en el permiso: las funciones `SECURITY DEFINER` comprueban el tenant y escriben la auditoría en la misma transacción.
