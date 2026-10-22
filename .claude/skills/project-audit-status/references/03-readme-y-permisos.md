# Publicación de estado en GitHub — política segura

## README frente a «About» o perfil

- README visible del **repositorio**: GitHub prioriza `.github/README.md`, luego `README.md`, luego `docs/README.md`. Inspeccionar cuál muestra y cuál quiere usuario. No escribir por defecto el README personal del perfil (`<username>/<username>`) ni la sección About (metadatos del repo).
- El usuario pidió ver **grande** el estado: usar `## 📊 ESTADO ACTUAL DEL PROYECTO` en un bloque destacado **cerca del comienzo**, tabla resumen, barra textual accesible, score `/1000` o `N/D`, fase y última fecha verificable. No usar un badge verde sin evidencias ni depender de servicios externos.
- Un cambio local no actualiza inmediatamente la web de GitHub. Requiere commit/integración y push o escritura autorizada mediante app con permisos; estos pasos están fuera de la skill salvo orden explícita.

## Bloque administrado

```md
<!-- PROJECT-HEALTH:START -->
## 📊 ESTADO ACTUAL DEL PROYECTO

**Puntuación verificada: N/D — NO VERIFICABLE**

| Dato | Valor |
|---|---|
| Requisitos funcionales | Inventario pendiente |
| Última auditoría | 2026-10-21 |
| Rama / commit | Por verificar |

**[Informe detallado](docs/project-health/ESTADO_PROYECTO.md)**
<!-- PROJECT-HEALTH:END -->
```

Ese contenido es **plantilla ficticia**, no un resultado real. El script genera la versión real sin colores engañosos y escapa texto de entrada.

## Seguridad de la modificación

1. `git status --short` y árbol auditado. Si el README ya tiene cambios ajenos, preservar exactamente el resto, inspeccionar diff y dejar constancia; para conflictos en mismo bloque, abstenerse y pedir resolución.
2. Ubicar los dos marcadores exactamente una vez cada uno. Si faltan ambos, insertar el bloque nuevo bajo encabezado principal (o al principio si no existe encabezado). Si falta solo uno, hay múltiples o están invertidos, **abortar**; nunca borrar todo README.
3. Guardar EOL predominante, BOM, encoding UTF-8, resto de bytes cuando sea posible. No convertir contenido automáticamente de otra codificación.
4. Validación del JSON de auditoría; no publicar puntaje numérico si inventario no se verificó. Sanitizar strings para Markdown (sin inyección de HTML o enlaces remotos).
5. Previsualizar, inspeccionar diff, ejecutar `--write`, comparar el bloque con reporte, repetir en modo previsualización para comprobar idempotencia. Verificar que solo cambia bloque y reporte.
6. El informe incluye hallazgos, referencias a evidencia, módulos y fases. No exponer secretos, direcciones personales, credenciales, PII, capturas privadas ni logs sin depurar.
7. No ejecutar `git add`, `git commit`, `git push`, abrir PR ni tocar About sin autorización expresa y contexto de permisos.

## Estados especiales

- `NO VERIFICABLE`: mostrar sin número cuando falta un inventario fiable de RF o evidencia de todos los módulos.
- `BLOQUEADO`: señal explícita con hallazgos críticos; conservar score solo si cálculo fiable.
- `EN PRODUCCIÓN VERIFICADA`: no afirmar por nota alta; requiere gate operativo completo.

## Control de actualización

Script de la skill: `scripts/project_health.py` (Python estándar). CLI:

```powershell
# Reemplaza LA_RUTA_SKILL por el directorio real de instalación:
python LA_RUTA_SKILL/scripts/project_health.py --input docs/project-health/evidence.json --readme README.md --report docs/project-health/ESTADO_PROYECTO.md
python LA_RUTA_SKILL/scripts/project_health.py --input docs/project-health/evidence.json --readme README.md --report docs/project-health/ESTADO_PROYECTO.md --write
```

El primer comando es de **solo lectura** (dry-run); segundo modifica solo archivos indicados. En Windows se puede usar `py -3` si disponible. Usar rutas relativas desde el repo y verificar qué README es el visible.
