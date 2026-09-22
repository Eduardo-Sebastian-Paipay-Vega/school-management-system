# CU-NOT-10: Llenado Asistido con Auto-Guardado en Segundo Plano (Debounce 400ms)

**Requisito Trazable:** [RF-45](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-45.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Subfunción del Sistema  
**Frecuencia de Uso:** Constante durante la edición de notas  

---

## 1. Resumen y Alcance

Garantiza que el docente nunca pierda su trabajo de digitación de notas al incorporar un mecanismo de auto-guardado en segundo plano con debounce de 400 milisegundos y almacenamiento provisional en caché local en caso de micro-cortes de red.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Titular
* **Actores Secundarios / Sistemas:** Servicio de Auto-Guardado en Segundo Plano, Base de Datos

---

## 3. Precondiciones

* El docente tiene la planilla de notas abierta y se encuentra digitando.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Cero pérdida de notas digitadas ante cierre accidental del navegador o falla de conexión.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Todas las celdas modificadas se sincronizan transparentemente con el servidor en paquetes optimizados.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente modifica el valor de una celda de calificación.
2. El frontend detecta la mutación y marca la celda como 'Pendiente de Sincronización' (ícono pequeño de sincronización).
3. El temporizador de debounce espera 400 milisegundos desde la última pulsación de tecla.
4. Si no hay nuevas pulsaciones, empaqueta los cambios y los despacha mediante una solicitud asíncrona en segundo plano.
5. El backend procesa la actualización y responde HTTP 200.
6. La celda pasa al estado 'Guardado' (tilde verde sutil que desaparece en 1 segundo).
7. La barra de estado superior muestra 'Todos los cambios guardados'.

---

## 6. Flujos Alternativos y Excepciones

* **5a. Corte repentino de internet durante el guardado: El frontend almacena los cambios en IndexedDB localmente, muestra el indicador 'Guardado local (Sin conexión)' y reintenta la sincronización automáticamente al volver la red.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-13: El debounce debe ser de exactamente 400 ms para balancear la inmediatez de guardado y la carga en el servidor.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Indicador sutil en la esquina superior derecha: 'Guardando...' (spinner gris) -> 'Guardado automáticamente' (check verde).

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-45](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-45.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
