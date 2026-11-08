---
name: resaltar-fila-abierta
description: Mantiene identificable una fila de PrimeReact DataTable después de abrir un diálogo desde ella. Úsala cuando en listados largos el usuario pierde la fila de origen al cerrar un detalle o formulario.
---

# Resaltar la fila que abrió un diálogo

## Diagnóstico

- Sigue PrimeReact Guardian G0–G6 y revisa el componente real, su DataTable, handlers, diálogo y estilos.
- Si hay varias tablas o no queda claro qué acciones deben marcarse, resuelve la ambigüedad antes de cambiar.
- Identifica la clave estable de la fila: `dataKey` si existe, o el identificador único del modelo. No uses el índice de página/orden.
- Verifica la firma real de `rowClassName` en los `.d.ts` de la versión instalada. Reutiliza el wrapper y los tokens visuales disponibles.

## Aplicación

- Guarda el ID de la última fila activa en estado React local al handler que abre el diálogo desde esa fila.
- Aplica una clase condicional con `rowClassName`; no actives selección funcional (`selectionMode`, `selection`) para un resaltado meramente visual.
- Conserva el ID al cerrar el diálogo y al refrescar la colección. Cambia el resaltado cuando se abre un diálogo desde otra fila.
- Marca solo acciones que abren un diálogo asociado a una fila. No marques navegación ni acciones globales como crear, filtrar o exportar.
- Usa estilos encapsulados y tokens de tema; no edites CSS generado ni copies la clase global de PrimeNG.

## Verificación

Comprueba que el ID sobrevive al refresco de datos, que la clase desaparece de la fila anterior al abrir otra y que hover/foco siguen distinguiéndose. Ejecuta lint/build y revisión visual conforme al Guardian; informa si no fue posible inspeccionar la UI.
