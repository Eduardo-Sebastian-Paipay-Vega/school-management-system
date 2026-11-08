---
name: tabla-orden-dinamico
description: Diseña personalización de orden, visibilidad o ancho de columnas en una tabla PrimeReact del frontend Next.js. Úsala cuando se solicite explícitamente adaptar columnas; exige revisar RF/CU, DataTable instalado, wrappers y persistencia existente antes de cambiar.
---

# Personalización de columnas en PrimeReact

## Antes de proponer implementación

1. Aplica PrimeReact Guardian G0–G6 para toda edición de UI React.
2. Confirma que la funcionalidad está en un RF/CU o que el usuario pide explícitamente diseñar la nueva capacidad. Si no hay trazabilidad, presenta el gap; no agregues una preferencia de usuario por iniciativa propia.
3. Inspecciona la tabla, `Column`, wrappers, modelo de fila, preferencias existentes, almacenamiento/API y permisos. Reutiliza contratos existentes; no supongas que hay persistencia compartida.
4. Verifica en `.d.ts` de la versión instalada las props y eventos pertinentes (`reorderableColumns`, `onColReorder`, `resizableColumns`, `columnResizeMode`, `onColumnResizeEnd` u otros disponibles). Usa solo la firma confirmada localmente.

## Diseño y cambios

- Identifica columnas obligatorias, clave estable por campo y orden por defecto. Mantén Acciones y columnas requeridas en posiciones fijas solo si la regla funcional lo indica.
- Distingue reordenar, ocultar y redimensionar como capacidades separadas. No añadas una si el pedido no la cubre.
- Si se persiste, define ámbito (usuario, tabla, tenant), compatibilidad al añadir/quitar campos y restablecimiento. No almacenes preferencias por índice ni por etiqueta traducible.
- Conserva accesibilidad por teclado, tooltips, permisos, scroll horizontal y presentación móvil. No dupliques CSS o persistencia dentro de la tabla si existe un componente compartido.
- Cambia solo archivos necesarios; no alteres esquema o API sin trazabilidad y plan de migración.

## Verificación

Verifica orden inicial, reordenamientos sucesivos, campos fijos, columnas nuevas/retiradas, preferencias ausentes y restauración si existe persistencia. Ejecuta lint/build y revisión visual del PrimeReact Guardian; informa lo que no pudo verificarse.
