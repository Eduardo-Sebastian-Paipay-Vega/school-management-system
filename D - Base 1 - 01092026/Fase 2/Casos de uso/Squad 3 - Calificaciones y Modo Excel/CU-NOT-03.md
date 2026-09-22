# CU-NOT-03: Planilla Ágil de Notas en Modo Matriz Rápida ('Modo Excel / Teclado')

**Requisito Trazable:** [RF-38](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-38.md)  
**Módulo:** Módulo 8: Calificaciones en Tiempo Real, Modo Excel, Conclusiones y Motor CNEB  
**Squad Asignado:** Squad 3: Evaluación Pedagógica, Planilla Rápida y Motor CNEB  
**Responsable Técnico:** Steve Smith Ovalle Luyo (`@steveovalle27-lgtm`)  
**Rama de Trabajo:** `feature/squad-3/grades-engine`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Muy Alta (Cierre de evaluaciones)  

---

## 1. Resumen y Alcance

Permite registrar calificaciones a máxima velocidad mediante una interfaz de matriz tipo hoja de cálculo con navegación por teclas direccionales (Flechas, Enter, Tab), pegado masivo desde Excel (Ctrl+V) y sin demoras de recarga de página.

---

## 2. Actores Involucrados

* **Actor Primario:** Docente Titular / Practicante Autorizado
* **Actores Secundarios / Sistemas:** Motor Frontend (Flutter Desktop / Web WebAssembly), Base de Datos

---

## 3. Precondiciones

* El docente dispone de una lista de notas físicas o en una hoja de Excel.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Respuesta al teclado instantánea (< 16 ms por pulsación / 60 FPS sin parpadeo).

* **Garantía de Éxito (Postcondición Exitosa):**  
  Matriz completa de 35 estudiantes x 5 columnas llenada en menos de 2 minutos.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El docente abre 'Modo Matriz Rápida' en su curso.
2. Se posiciona en la primera celda con el teclado o ratón.
3. Digita la primera nota (ej. '15') y presiona la tecla [Flecha Abajo] o [Enter].
4. El foco se desplaza automáticamente a la celda inferior en menos de 5 ms.
5. Alternativamente, el docente copia una columna de notas de su archivo Excel local y presiona [Ctrl+V] sobre la primera celda.
6. El sistema procesa el portapapeles, distribuye los valores en las filas correspondientes en < 500 ms y valida cada celda.
7. El sistema guarda automáticamente las notas en segundo plano.

---

## 6. Flujos Alternativos y Excepciones

* **5a. Portapapeles con datos inválidos: El sistema ignora celdas con texto no numérico y resalta las filas discordantes con un mensaje explicativo.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-04: La navegación por teclado debe emular fielmente el comportamiento de Microsoft Excel para máxima productividad docente.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Cuadrícula densa con celdas de borde azul al foco, scroll virtualizado suave para listas largas y atajos de teclado visibles en la barra inferior.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-38](../../Requisitos%20Funcionales/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/RF-38.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%203%20-%20Calificaciones%20y%20Modo%20Excel/esquema_datos.sql)
