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
