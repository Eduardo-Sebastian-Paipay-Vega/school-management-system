# CU-AST-08: Toma Rápida en App Móvil y Difusión en Tiempo Real vía WebSockets

**Requisito Trazable:** [RF-27](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-27.md)  
**Módulo:** Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, Carnés QR y App Móvil  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Diaria (Primera hora de clases)  

---

## 1. Resumen y Alcance

Permite al docente registrar la asistencia desde su teléfono celular con gestos rápidos de toque en menos de 1 minuto y transmitir el reporte en vivo vía WebSockets al tablero de la Dirección sin necesidad de recargar la página.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente de Aula / Auxiliar desde Teléfono Móvil o Tableta
* **Actores Secundarios / Sistemas:** Servidor WebSocket (Socket.io / ws), Dashboard Directivo

---

## 3. Precondiciones

* El docente tiene la app instalada o accede a la versión web móvil con sesión iniciada.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Transmisión del evento de asistencia al servidor central en menos de 500 milisegundos.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Asistencia grabada en base de datos y reflejada en vivo en la pantalla de monitoreo de la Dirección.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente abre la app móvil institucional en el aula.
2. Selecciona su clase activa.
3. La app despliega la lista de estudiantes precargada en estado 'Presente'.
4. El docente pulsa sobre los alumnos ausentes: 1 toque = Tardanza (Amarillo), 2 toques = Falta (Rojo).
5. Presiona el botón flotante 'Confirmar Asistencia'.
6. La aplicación envía la carga útil mediante API REST y el backend emite inmediatamente el evento WebSocket `ATTENDANCE_TAKEN` a la sala directiva.
7. El tablero de control en la oficina de Dirección actualiza el semáforo del aula de 'Pendiente' a 'Completada' en tiempo real (< 500 ms).

---

## 6. Flujos Alternativos y Excepciones

* **5a. Falla de conectividad móvil en el aula: La app móvil almacena localmente y retransmite automáticamente en cuanto el docente se conecta a la red Wi-Fi del colegio.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AST-11: El registro móvil debe ser completado en los primeros 15 minutos de iniciada la sesión de clase.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Interfaz móvil táctil 'One-Hand Operation' con botones táctiles grandes, tarjetas de estudiante con micro-animaciones al tocar y feedback háptico (vibración corta).

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-27](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-27.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
