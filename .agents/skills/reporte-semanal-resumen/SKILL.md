---
name: reporte-semanal-resumen
description: Prepara un resumen semanal de trabajo del repositorio con evidencia de Git, agrupado por módulos del Sistema de Gestión Escolar. Úsala cuando el usuario pida informe semanal o avances por periodo; no edita documentos externos.
---

# Resumen semanal basado en Git

Genera texto breve para revisión, no una métrica automática de productividad.

## Recolectar

- Define fechas de inicio/fin y autor. Si el usuario no da periodo, usa la semana actual según el contexto horario del cliente y declara sus fechas.
- Ejecuta `scripts/recolectar.py --since <fecha> --until <fecha>` para la rama indicada; por defecto el script usa el autor de `git config user.name` y `HEAD`, sin hacer fetch ni modificar archivos.
- Considera commits y árbol sin confirmar por separado. No atribuyas archivos sin confirmar a una persona si no hay evidencia.
- Para categorizar, usa `frontend/modules/squads/squad_[X]_*/`, `backend/`, `database/`, `docs/` y la matriz RF→arquitectura. No copies las zonas ni nombres de BI-COMPUSUR.
- Lee los planes de sprint tocados solo para extraer tareas siguientes; no declares un porcentaje de avance sin criterio comprobable.

## Entrega

Resume avances, pendientes e incidencias en lenguaje entendible para el equipo, enlaza cifras a evidencia de Git y separa documentación de cambios funcionales. No muestres correos, nombres privados, secretos ni datos escolares. No edites Google Docs/Drive ni publiques el informe: entrega el texto para que el usuario lo revise.

Si no hay commits del autor, el autor no coincide o la rama/rango es insuficiente, dilo y pide el dato mínimo; no cambies el filtro para incluir a otras personas.
