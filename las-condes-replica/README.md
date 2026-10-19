# Landing Las Condes — réplica de estudio v0.1

Primera implementación en **Next.js 15 + React 19 + TypeScript + Tailwind CSS** de la estructura de la portada de https://www.lascondes.cl/ revisada el 14 de octubre de 2026.

## Uso

```bash
npm install
npm run dev
```

Abrir http://localhost:3000. Para producción: `npm run build && npm start`.

## Implementado
- Barra de información y transparencia.
- Navegación principal de nueve categorías, menú desplegable en escritorio y acordeón móvil.
- Campañas destacadas con carrusel interactivo y controles.
- Buscador redirigido al sitio de referencia.
- Accesos rápidos, noticias, categorías y footer.
- Diseño adaptable a móvil, tablet y escritorio.

## Limitaciones importantes de esta primera entrega
- No es una captura pixel-perfect. Los assets originales no pudieron recuperarse automáticamente: logo, fotografías de campaña y miniaturas están representados mediante ilustraciones CSS, iconos y fondos provisionales.
- No se han verificado fuentes tipográficas, dimensiones exactas y enlaces profundos de todos los botones.
- Enlaces no mapeados apuntan a la búsqueda del sitio original; el buscador también usa el sitio original. Las páginas internas no están implementadas.
- Los contenidos de noticias y campañas son una fotografía temporal del sitio, no una sincronización editorial.
- La marca y contenidos originales pueden tener derechos de terceros. No publicar como sitio oficial ni hacer que parezca operado por la Municipalidad.

## Próxima fase para fidelidad visual
1. Obtener capturas desktop (1440 x 900) y móvil (390 x 844) actuales del sitio.
2. Incorporar fotografías, SVG/logos e iconos originales únicamente si existe autorización.
3. Comparar tipografía, alineaciones, tamaños, colores y comportamiento contra referencias.
4. Sustituir destinos de enlaces de búsqueda por URLs exactas verificadas.
5. Validar accesibilidad, compatibilidad y construir versión producción.
