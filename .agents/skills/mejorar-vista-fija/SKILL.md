---
name: mejorar-vista-fija
description: Ajusta una pantalla Next.js con PrimeReact DataTable para que filtros y acciones permanezcan visibles mientras el cuerpo de filas ocupa y desplaza el espacio disponible. Úsala cuando una tabla deje huecos, desplace toda la página o no se adapte al contenedor.
---

# Vista fija para PrimeReact DataTable

1. Sigue PrimeReact Guardian G0–G6. Inspecciona el layout padre, la página, tabla, filtros, paginador y estilos antes de editar; localiza wrappers reutilizables y restricciones RF/CU.
2. Confirma la API de la versión instalada en `frontend/node_modules/primereact/datatable/datatable.d.ts`. En la versión declarada por el proyecto, `scrollHeight` y `rowClassName` existen, pero revalida antes de usarlos.
3. Encuentra el primer contenedor sin altura/flex que rompe el cálculo. Diseña la cadena de layout desde el shell hasta la tabla usando `min-height: 0`, límites de overflow y el patrón real de los componentes vecinos. No copies CSS Angular/PrimeNG ni asumas que `height: 100%` tiene un padre con altura definida.
4. Usa scroll vertical dentro de la tabla solo cuando eso cumpla la intención de UX y la API instalada. Mantén filtros, acciones y paginador accesibles; no escondas columnas o controles como arreglo rápido.
5. Limita estilos al módulo y usa wrappers/tokens existentes. No modifiques el tema global generado para resolver un caso local.
6. Ejecuta las compuertas obligatorias del Guardian y revisa la UI en desktop y móvil si el navegador está disponible. Reporta con claridad las comprobaciones que no se pudieron hacer.
