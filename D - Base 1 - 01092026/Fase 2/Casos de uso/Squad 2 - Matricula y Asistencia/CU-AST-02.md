# CU-AST-02: Registro de Ingreso Físico en Modo Kiosco de Portería ('Wachiman')

**Requisito Trazable:** [RF-21](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-21.md)  
**Módulo:** Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, Carnés QR y App Móvil  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Muy Alta (Pico de 7:15 AM a 8:00 AM)  

---

## 1. Resumen y Alcance

Permite registrar el ingreso de los estudiantes en la puerta principal del plantel mediante el escaneo ultrarrápido (< 300 ms) del código QR de su carné físico.

---

## 2. Actores Involucrados

* **Actor Primario:** Personal de Portería / Vigilancia ('Wachiman')
* **Actores Secundarios / Sistemas:** Lector de Código de Barras / QR USB o Cámara, Base de Datos / Búfer Local

---

## 3. Precondiciones

* El puesto de portería tiene abierta la interfaz de Kiosco con el lector conectado.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  El registro se efectúa en menos de 300 ms, emitiendo sonido distintivo (Beep agudo para éxito, tono grave para error).

* **Garantía de Éxito (Postcondición Exitosa):**  
  Marcación guardada con timestamp exacto, clasificación automática de Puntual o Tardanza y saludo sonoro en pantalla.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El estudiante aproxima su carné escolar al lector de portería.
2. El lector decodifica el token QR y envía el payload a la interfaz Kiosco.
3. El sistema valida la firma criptográfica del carné.
4. Determina automáticamente si el ingreso es 'Puntual' o 'Tardanza' según la hora límite institucional (ej. 7:45 AM).
5. Despliega en pantalla gigante la foto, nombre, grado/sección y estado de ingreso del alumno.
6. Emite el pitido de confirmación sonora.
7. El sistema queda listo para el siguiente escaneo en 200 ms.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Carné no reconocido o inválido: Sonido de alerta grave, pantalla roja con mensaje 'Carné No Válido' y notificación al vigilante.**
* **4a. Estudiante que ingresa después de la hora límite: Se registra automáticamente con estado 'Tardanza' y se notifica para pase de auxilio.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AST-02: Tiempo máximo de procesamiento por estudiante: 300 milisegundos para evitar colas en la puerta del colegio.**
* **RN-AST-03: Tolerancia de ingreso: Hasta las 7:45 AM ingreso regular; de 7:46 AM a 8:15 AM tardanza; posterior a 8:15 AM ingreso con justificación.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Pantalla completa de alto contraste con tipografía grande (visible a 2 metros), tarjeta del alumno con foto ampliada, estado en color gigante y feedback sonoro.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-21](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-21.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
