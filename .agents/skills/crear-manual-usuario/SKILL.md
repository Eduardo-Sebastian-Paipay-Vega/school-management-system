---
name: crear-manual-usuario
description: Redacta manuales e instructivos no técnicos para docentes, estudiantes, familias o personal escolar a partir del comportamiento real del sistema; convierte Markdown a Word cuando se solicite.
---

# Manual para usuario final

El documento debe poder seguirse sin leer código. No mezcles en él endpoints, nombres de tablas, rutas de archivos ni jerga interna.

## 1. Reunir el flujo real

- Identifica el módulo, sus actores y el flujo pedido. Si el módulo no está claro, pregunta antes de escribir.
- Lee la UI real de Next.js y los contratos/servicios pertinentes; contrasta roles y reglas con RF/CU y documentación vigente.
- Describe solo botones, estados, validaciones y resultados que estén implementados. Distingue claramente funciones disponibles de limitaciones.
- Busca un manual existente antes de crear otro; conserva lo que siga vigente.

## 2. Redactar Markdown

Usa lenguaje cotidiano, pasos numerados en orden de uso, requisitos previos, qué hacer ante errores frecuentes y espacios indicados para capturas si son útiles. No uses diagramas Mermaid. Guarda en la ubicación de documentación acordada en el repositorio (si no existe, propone `docs/manuales/` y un nombre `GUIA_USUARIO_<MODULO>.md`).

Presenta el Markdown como resultado revisable. Si el usuario pidió únicamente el documento Markdown, termina ahí. Convierte a `.docx` solo cuando también lo haya pedido; no hagas una pausa de aprobación adicional si ya lo solicitó explícitamente.

## 3. Conversión opcional a Word

El script `scripts/md_a_docx.py` convierte el subconjunto Markdown que usa esta guía. Comprueba Python y `python-docx` antes de ejecutarlo. Ejemplo desde la raíz:

```powershell
python .agents/skills/crear-manual-usuario/scripts/md_a_docx.py docs/manuales/GUIA_USUARIO_MODULO.md docs/manuales/GUIA_USUARIO_MODULO.docx
```

Si falta la dependencia, explica cómo instalar `python-docx`; no alteres dependencias del proyecto para generar un documento puntual. Inspecciona que el archivo de salida exista y tenga tamaño mayor a cero. El script no sustituye una revisión visual del Word.

## Límites

- No inventar pasos ni textos de interfaz.
- No actualizar contratos técnicos desde un manual; usar `crear-guia-tecnica` o `sdd-authoring` según corresponda.
- No guardar capturas con datos personales reales sin autorización y anonimización.
