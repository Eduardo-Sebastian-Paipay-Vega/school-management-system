---
name: reporte-semanal-resumen
description: Arma el texto del informe semanal del ERP BI COMPUSUR para la persona que lo invoca — primero avances principales anteriores, avances del actual reporte, próximas tareas e incidencias; después el resumen por módulo y submódulo (tarea, responsable, subtareas/funcionalidades, avance %), incluyendo Generalidades y Superadmin. Lee el trabajo real de esa persona en git (domingo a sábado) con un solo script y lo redacta en lenguaje de gerencia, listo para copiar y pegar. Se invoca manualmente (/reporte-semanal-resumen [fecha opcional]) — nunca se dispara sola y no crea archivos ni documentos nuevos; solo edita, si el usuario lo pide, sus propias filas en un Google Doc existente (Paso 4).
---

# Reporte semanal — resumen por persona

Produce el texto de la parte del **INFORME SEMANAL DEL DESARROLLO DEL ERP BI COMPUSUR** que le toca a quien invoca, sacado de su trabajo real en git, para copiar y pegar.

**Rápido por diseño:** un solo comando junta todo; no leer `nav.config.ts`, planes ni diffs salvo en los casos puntuales que se indican abajo.

Reglas fijas (decididas por el usuario el 2026-10-24):

- **Solo la persona que invoca** — nada de lo que hicieron otros.
- **Semana = domingo a sábado**, por fecha de autoría del commit (lo resuelve el script). Si el documento del equipo usa otro rango, avisar la diferencia; no cambiar sus fechas sin confirmación.
- **Solo texto en el chat** — sin archivos, documentos nuevos ni artifacts. La única excepción es editar las filas propias en un Google Doc existente que el usuario indique (Paso 4).
- **Lenguaje de gerente**: qué puede hacer ahora el negocio. Prohibido: archivos, endpoints, componentes, migraciones, ramas, nombres técnicos.
- **No inventar**: todo sale de la salida del script (o de un `git show` puntual).

## Paso 1 — Un solo comando

```bash
python .claude/skills/reporte-semanal-resumen/recolectar.py [AAAA-MM-DD]
```

(La fecha es cualquier día de la semana a reportar; por defecto, hoy. `--sin-fetch` si no hay red.) Imprime en ~2 s:

- `PERSONA`, `FECHA` y `HORA DE CORTE` ya en el formato del informe.
- `=== ACTUAL` y `=== ANTERIOR`: commits de la persona (todos sus correos, ver `ALIAS` en el script) con sus **zonas** entre corchetes. Los commits solo de documentación ya vienen omitidos.
- `=== SIN COMMITEAR`: zonas con trabajo en curso en esta carpeta.
- `=== SIGUIENTE TRABAJO`: lo pendiente que declaran los planes tocados en la semana.

Si sale `PERSONA: DESCONOCIDA`, preguntar al usuario su nombre para el informe y agregar su correo a `ALIAS` en `recolectar.py` (única edición permitida sin pedido explícito).

Solo si el asunto de un commit **no** deja claro qué cambió para el usuario, correr `git show --stat --format=%B <hash>` de ese commit (máximo 3 por reporte). No leer diffs completos.

## Paso 2 — Clasificar por zona (sin abrir el menú)

| Zona | Módulo → submódulo |
| --- | --- |
| `front:recursos-humanos/<x>`, `front:configuracion/{asistencia,marcar-asistencia,reglas-asistencia,justificaciones-asistencia}`, `front:reclutamiento/*`, `front:ventas/pendientes`, `back:{asistencia,rrhh,planillas,reclutamiento,pendientes}` | RECURSOS HUMANOS → el submódulo por nombre (Asistencia, Marcar asistencia, Reclutamiento, Reglas de asistencia, Justificaciones, Resumen de horas, Personal, Remuneración, Planillas, Mis boletas, Ausencias, Pendientes) |
| `front:ventas/{ordenes-compra,pedidos,ensamblaje,envio,contacto}`, `back:{ventas,pedidos,ensamblaje,envios,catalogo_electronico}` | GANADAS X EJECUTAR → Ordenes Ganadas, Pedidos, Ensamblaje, Envios Bajo Penalidad, Contacto Entidades |
| `front:ventas/{control-recibidas,control-atendidas,control-canceladas,penalizadas,resueltas,pagos-retrasados}` | CONTROL O/C |
| `front:cotizador/*`, `back:{proformas,catalogo_importadores,documentacion_tecnica,contrataciones}` | COTIZADOR (contrataciones/carta fianza → SE@CE) |
| `front:factura/*`, `back:facturacion` | VENTAS |
| `front:compras/*`, `back:compras` | COMPRAS |
| `front:tienda-fisica/*`, `back:{mi_tienda,inventario_marcas}` | TIENDA FÍSICA |
| `front:contabilidad-general/*`, `front:pago_sunat`, `front:{costos-liquidaciones,integracion-liquidacion}` | CONTABILIDAD |
| `front:tramites-documentarios/*`, `back:correos` | DOCUMENTOS |
| `front:configuracion/{usuario,parametros}` | CONFIGURACIÓN |
| `front:plataforma`, `back:{plataforma,licencias,ambito_empresarial}`, `front:configuracion/mantenimiento`, `infra` (plano de control) | **SUPERADMIN** → BI ERP ADMINISTRATOR, LICENCIAS Y MÓDULOS, EMPRESAS, MANTENIMIENTO |
| `front:{shared/*,core/*,app,auth,home,mensajeria}`, `back:{backend,asistente,usuarios,bi_app,comun,raiz}`, `frontend`, `scripts` | **GENERALIDADES** → ASISTENTE ABI, INICIO DE SESIÓN, MENÚ, TABLERO, CHAT, RESPONSIVIDAD… |

- Un commit con varias zonas va al submódulo de su zona principal (la que nombra el asunto); lo general solo cuenta aparte si tiene peso propio.
- Commits `test`, `chore`, `refactor` y `docs` no son avances visibles: ignorarlos salvo que el asunto describa algo que el usuario note.
- Solo si una zona no está en la tabla, buscarla con `grep -n "<ruta>" frontend/src/app/features/home/nav.config.ts`.

## Paso 3 — Entregar el texto

Responder en el chat con exactamente estas dos partes, sin introducción. Español, frases cortas, impersonal ("Se creó…").

### PARTE 1

```
FECHA: <del script>
HORA DE CORTE: <del script>

AVANCES PRINCIPALES ANTERIORES:
• <UNA SOLA ORACIÓN EN MAYÚSCULAS: LO MÁS IMPORTANTE DE LA SEMANA ANTERIOR> - <NOMBRE>

AVANCES PRINCIPALES DEL ACTUAL REPORTE:
• <UNA SOLA ORACIÓN EN MAYÚSCULAS: LO MÁS IMPORTANTE DE ESTA SEMANA> - <NOMBRE>

PRINCIPALES TAREAS PRÓXIMAS PARA HACER:
• <UNA SOLA ORACIÓN EN MAYÚSCULAS: LO MÁS IMPORTANTE QUE SIGUE> - <NOMBRE>

INCIDENCIAS:
• <qué pasó, a qué afectó y cómo se resolvió>
```

- Anteriores, actuales y próximas: **exactamente una viñeta cada una**. Si hubo varios frentes, elegir el de mayor impacto o unirlos en una oración corta.
- Próximas: de `SIGUIENTE TRABAJO`, de lo `SIN COMMITEAR` y de lo que quedó a medias.
- Incidencias: commits `fix(...)` de la semana y problemas que el usuario contó en la conversación; varias viñetas si hubo varias. Si no hubo: `Sin incidencias en el periodo.`

### PARTE 2

Una tabla Markdown por módulo con avance, en el orden del menú (SE@CE, Cotizador, Ganadas x Ejecutar, Control O/C, Ventas, Compras, Tienda Física, Contabilidad, Documentos, Recursos Humanos, Configuración) y al final GENERALIDADES y SUPERADMIN:

```
MÓDULO: RECURSOS HUMANOS

| TAREA | RESPONSABLE | SUBTAREAS / FUNCIONALIDADES / ERRORES / MODIFICACIONES | AVANCE (%) |
| --- | --- | --- | --- |
| REGLAS DE ASISTENCIA | BICHENSO | Se creó… <br> Se puede… | 95% |
```

- TAREA = submódulo en MAYÚSCULAS. SUBTAREAS = 1 a 4 frases separadas con `<br>`.
- AVANCE = estimación del submódulo completo, múltiplos de 5: **100%** funciona y está subido sin pendientes · **80–95%** funciona con pendientes menores · **50–75%** usable pero falta una parte importante · **10–45%** iniciado. Lo que solo está sin commitear: máximo 80% y "(pendiente de subir)".
- Solo los submódulos donde la persona avanzó esta semana.

Cerrar con una línea: `Avance estimado según el trabajo registrado en git del <domingo> al <sábado>; revisar los porcentajes antes de enviar.`

## Paso 4 — Google Doc existente (solo si el usuario da el link)

Aplica solo si el usuario pide editar un documento de Google que ya existe y pega su link. Si pide solo el texto, usar el Paso 3.

1. **Revisar el conector antes de intentar.** Llamar `session_connectors_status`. Para editar hace falta un conector de **Google Docs** con estado `connected`. Google Drive sirve para leer y buscar, pero no cambia el contenido de un documento. Las herramientas de Claude Docs no leen ni editan documentos de Google. Si no hay conector de Google Docs conectado, no seguir buscando herramientas ni reintentar: entregar el texto del Paso 3 y decir en una línea qué conector falta.
2. **Leer el documento.** Con Google Drive, `read_file_content` (con `includeComments: true`) sobre el ID del link. Si responde "Requested entity was not found", no buscar por título ni reintentar en bucle: la cuenta del conector de Google Drive no tiene acceso. Pedir al usuario que confirme con qué cuenta está conectado y que comparta el documento con esa cuenta como editor. Mientras tanto, entregar el texto del Paso 3.
3. **Editar solo lo propio.** Cambiar únicamente las filas, viñetas y sección de la persona que invoca. Nunca tocar filas de otros integrantes del equipo.
4. **Confirmar antes de sobrescribir.** Si la persona ya tiene texto o porcentajes en el documento, mostrar la diferencia (por ejemplo, 60% en el documento y 80% en el informe) y esperar la confirmación del usuario.
5. **Fechas y hora.** Si el encabezado del documento no coincide con el rango y la hora de corte del script, avisar y preguntar; no cambiarlo por cuenta propia.
6. **Verificar.** Releer el documento después de editar y confirmar el cambio antes de reportarlo. Editar el documento existente; nunca crear uno nuevo como sustituto.
