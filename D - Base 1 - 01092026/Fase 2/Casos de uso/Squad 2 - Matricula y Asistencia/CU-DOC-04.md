# CU-DOC-04: Supervisión y Monitoreo de Cobertura y Puntualidad de Clases

**Requisito Trazable:** [RF-35](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-35.md)  
**Módulo:** Módulo 7: Horas de Docentes Contratados y Reprogramación  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Diaria / Continua  

---

## 1. Resumen y Alcance

Permite monitorear en tiempo real qué aulas se encuentran actualmente con docente en clase, cuáles registran retrasos y qué secciones tienen clase libre.

---

## 2. Actores Involucrados

* **Actor Primario:** Director / Subdirector / Coordinador de Nivel
* **Actores Secundarios / Sistemas:** Tablero en Tiempo Real, Base de Datos

---

## 3. Precondiciones

* Jornada escolar en desarrollo.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Información actualizada al minuto del estado de todas las aulas del colegio.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Mapa visual del plantel con estado de cobertura docente por sección.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El directivo abre el módulo 'Supervisión en Vivo de Clases'.
2. El sistema despliega el mapa de aulas del colegio organizadas por pabellón y piso.
3. Cada aula muestra un color de estado: Verde = En clase con docente puntual, Amarillo = Docente con tardanza, Rojo = Aula desatendida / Sin docente, Gris = Hora libre.
4. El directivo puede hacer clic en cualquier aula para ver el nombre del docente y el tema que se está dictando.

---

## 6. Flujos Alternativos y Excepciones

* **3a. Alerta de aula desatendida: Si pasan más de 15 minutos sin marcación de clase, el sistema envía un aviso sonoro a la coordinación de auxiliares.**

---

## 7. Reglas de Negocio Asociadas

* **RN-DOC-04: Todo retraso superior a 15 minutos se clasifica automáticamente como falta docente a la sesión.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Plano esquemático o cuadrícula de tarjetas de aulas con actualización automática (polling/WebSocket) cada 30 segundos.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-35](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-35.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
