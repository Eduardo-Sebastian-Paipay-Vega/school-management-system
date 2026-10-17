---
name: primeng
description: Aplicar PrimeNG como referencia de componentes e interacción al diseñar o modificar interfaces de este repositorio, especialmente Calificaciones y Modo Excel del Squad 3. En Flutter adaptar los patrones a widgets Dart; en Angular consultar las APIs de la versión instalada.
---

# PrimeNG para el Sistema de Gestión Escolar

## Propósito y alcance

El usuario solicita usar como referencia https://github.com/primefaces/primeng.git para su trabajo de interfaz en este repositorio. Esta es una skill local creada para ese propósito, no una skill oficial distribuida por PrimeFaces.

PrimeNG es una biblioteca Angular, no un paquete Flutter. El proyecto utiliza Flutter/Dart: trasladar patrones de interacción y organización visual a widgets nativos, manteniendo `AppTheme` y la arquitectura Feature-First. La creación de esta skill no implica migrar a Angular ni instalar dependencias JavaScript.

## Flujo de trabajo

1. Seguir la guía de lectura del proyecto y consultar los RF, CU y diseño del módulo afectado. Para el trabajo de Steve usar Squad 3, M8, RF-36 a RF-46. No aplicar esta skill a tareas sin interfaz salvo que el usuario la invoque expresamente.
2. Inspeccionar los componentes existentes y reutilizarlos antes de crear otros. Consultar en las fuentes oficiales únicamente los componentes necesarios para la tarea.
3. Identificar el patrón PrimeNG pertinente: Table para tablas editables; Select y filtros para curso, sección y periodo; Dialog para edición y confirmación; Toast o mensajes persistentes para resultados; Tag para estados; Skeleton para carga. Estos son patrones candidatos, no requisitos adicionales.
4. En Flutter construir el equivalente con widgets Dart y gestión de foco. Una tabla de PrimeNG no garantiza por sí sola el comportamiento de una hoja de cálculo: implementar explícitamente las interacciones exigidas por los requisitos.
5. Resolver estados de carga, vacío, error, edición y guardado. Mantener etiquetas en español, foco visible, navegación por teclado y señales que no dependan únicamente del color. Adaptar los colores al tema institucional, sin copiar paletas de demostración.
6. Verificar las interacciones modificadas y, para cambios Flutter, ejecutar `flutter analyze` y `flutter test` según AGENTS.md. Para cambios solo en esta skill validar su estructura; no es necesario ejecutar Flutter.

## Planilla del Squad 3

- Conservar la navegación por flechas, Tab, Enter y Esc prevista en los requisitos; gestionar el foco al editar y desplazarse.
- Mantener el debounce de 400 ms y mostrar estados de guardando, guardado y error basados en el resultado real de persistencia.
- Validar entradas y pegado masivo según el contrato del módulo. No inventar umbrales de conversión 0–20 a AD/A/B/C: consultar las reglas oficiales del proyecto.
- Aplicar permisos de docente, practicante y estudiante, así como bloqueo por cierre y rectificación, conforme a los RF. La restricción visual debe acompañar a la validación del backend.
- El asistente de conclusiones utiliza reglas y plantillas CNEB dentro del alcance aprobado.

## Si la tarea requiere Angular

Inspeccionar primero `package.json` y el archivo de bloqueo del proyecto Angular. Verificar compatibilidad Angular/PrimeNG y consultar documentación o código de la misma versión antes de escribir imports, providers, temas y plantillas. Evitar mezclar ejemplos de versiones distintas. Una migración del proyecto Flutter requiere que el usuario la solicite como tarea; no se deduce de esta preferencia visual.

## Fuentes oficiales

- Repositorio solicitado: https://github.com/primefaces/primeng
- Documentación enlazada por el proyecto: https://primeng.org/
- Versiones y etiquetas: https://github.com/primefaces/primeng/tags
- Licencia: https://github.com/primefaces/primeng/blob/master/LICENSE.md

Antes de depender de una API, una versión o una licencia, verificar las fuentes actuales y la etiqueta concreta. Si el repositorio anuncia cambios de ubicación o mantenimiento, comprobarlos y conservar la referencia solicitada; no asumir que la rama principal representa la versión instalada. Si se reutiliza código o recursos, respetar la licencia aplicable y sus avisos.
