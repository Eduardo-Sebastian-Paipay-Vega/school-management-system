# CU-DSH-01: Tablero de Control Ejecutivo de Indicadores Clave para Dirección

**Requisito Trazable:** [RF-52](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-52.md)  
**Módulo:** Módulo 10: Dashboards, Ficha 360° del Alumno y Métricas SSU IS-480  
**Squad Asignado:** Squad 4: Inteligencia de Datos, Mapas de Calor y Dashboards 360°  
**Responsable Técnico:** Grissel Arascely Rodríguez Quispe (`@Arascely`)  
**Rama de Trabajo:** `feature/squad-4/analytics-dashboards`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Diaria  

---

## 1. Resumen y Alcance

Proporciona a la Dirección una vista ejecutiva centralizada con los indicadores clave (KPIs) del colegio: matrícula total, % asistencia del día, aulas con clases activas, estudiantes en riesgo y recaudación/cumplimiento.

---

## 2. Actores Involucrados

* **Actor Primario:** Director General / Subdirectores
* **Actores Secundarios / Sistemas:** Motor de Dashboards, Caché Redis

---

## 3. Precondiciones

* Director con sesión iniciada.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Carga inicial del dashboard en menos de 800 milisegundos gracias a almacenamiento en caché.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Pantalla ejecutiva con KPIs consolidados en tiempo real.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El director inicia sesión en el sistema.
2. El sistema despliega el Dashboard Ejecutivo.
3. Muestra las tarjetas superiores: Total Matriculados (ej. 680), Asistencia de Hoy (94.2%), Sesiones Dictadas en Vivo (22/24), Alertas Críticas (3).
4. Gráficos de tendencia semanal de asistencia y semáforo general de rendimiento.
5. El director puede hacer clic en cualquiera de los KPIs para ver el detalle desagregado.

---

## 6. Flujos Alternativos y Excepciones

* **4a. Modo Presentación: Botón para pantalla completa para proyectar en reuniones de Consejo Directivo.**

---

## 7. Reglas de Negocio Asociadas

* **RN-ANA-06: Los datos del dashboard directivo deben refrescarse automáticamente cada 5 minutos o bajo demanda.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Diseño en cuadrícula moderna con tarjetas de KPIs con bordes redondeados, indicadores de tendencia (+2.4% vs semana anterior) y modo oscuro disponible.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-52](../../Requisitos%20Funcionales/Squad%204%20-%20Analitica%20y%20Dashboards/RF-52.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%204%20-%20Analitica%20y%20Dashboards/esquema_datos.sql)
