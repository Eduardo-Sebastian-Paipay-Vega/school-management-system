# Salidas obligatorias de cada ejecución de la skill

1. `docs/project-health/evidence.json`: inventario, snapshots, pruebas, criterios, estado, referencias y hallazgos sanitizados conforme al esquema de `assets/evidence-example.json`.
2. `docs/project-health/ESTADO_PROYECTO.md`: score o N/D, desglose por categorías, inventario RF, fases F00–F15, bloqueadores, incertidumbres y pruebas ejecutadas/no ejecutadas.
3. README visible en GitHub: solo bloque `PROJECT-HEALTH`, con estado prominente y enlace al informe.
4. Resumen en chat: alcance auditado, resultado, principales defectos, top acciones y cambios exactos en disco.

## Checklist humano posterior

- [ ] ¿El estado publicado corresponde al árbol auditado?
- [ ] ¿Se cruzaron TODAS las fuentes RF/RNF conocidas?
- [ ] ¿Existen módulos no contabilizados?
- [ ] ¿Hay RF sin aceptación o sin pruebas relevantes?
- [ ] ¿Se documentó el significado de N/A y no verificable?
- [ ] ¿Se dio visibilidad a bloqueadores, errores e incidencias?
- [ ] ¿No se expusieron datos privados o secretos?
- [ ] ¿El README se actualizó localmente, y nadie afirmó hacer push sin realizarlo?
- [ ] ¿El diff solo contiene el bloque autorizado y el informe?
