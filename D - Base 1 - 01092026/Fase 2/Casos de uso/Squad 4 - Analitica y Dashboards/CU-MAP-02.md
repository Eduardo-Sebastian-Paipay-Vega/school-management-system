# CU-MAP-02: Visualizar Mapa de Calor de Asistencia y Puntualidad

**Requisito Trazable:** [RF-48](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-48.md)  
**Módulo:** Módulo 9: Mapas de Calor con Navegación Drill-Down  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Semanal / Mensual  

---

## 1. Resumen y Alcance

Permite analizar patrones temporales de asistencia mediante un mapa de calor que cruza los días de la semana y los meses, identificando días críticos con alto ausentismo o tardanzas generalizadas.

---

## 2. Actores Involucrados

* **Actor Primario:** Director, Coordinador de Tutoría, Auxiliares
* **Actores Secundarios / Sistemas:** Base de Datos

---

## 3. Precondiciones

* Asistencia diaria registrada en el sistema.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Detección visual instantánea de días atípicos o patrones de inasistencia (ej. viernes por la tarde o lunes primera hora).

* **Garantía de Éxito (Postcondición Exitosa):**  
  Gráfico de calor temporal con gradiente de color según el porcentaje de asistencia del plantel.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El usuario accede a 'Analítica > Mapa de Calor de Asistencia'.
2. Filtra por rango de fechas y sección o nivel.
3. El sistema procesa los porcentajes diarios de asistencia.
4. Renderiza la cuadrícula de días con tonalidades de verde oscuro (100% asistencia) a rojo intenso (< 70% asistencia).
5. El directivo detecta anomalías y planifica intervenciones formativas.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Filtrado por personal docente: Permite cambiar la vista para evaluar el cumplimiento de asistencia del personal.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-02: Se excluyen del cómputo los feriados nacionales y días no lectivos calendarizados.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Cuadrícula estilo GitHub Contribution Graph con meses en eje X, días en eje Y y tooltip con métricas exactas al posar el cursor.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-48](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-48.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
