# CU-AST-06: Operar Kiosco de Portería en Modo Offline-First y Sincronización Diferida

**Requisito Trazable:** [RF-25](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-25.md)  
**Módulo:** Módulo 5: Asistencia Estudiantil, Kiosco Offline-First, Carnés QR y App Móvil  
**Squad Asignado:** Squad 2: Gestión Académica, Matrícula y Asistencia Offline-First  
**Responsable Técnico:** Eduardo Sebastian Paipay Vega (`@Eduardo-Sebastian-Paipay-Vega`)  
**Rama de Trabajo:** `feature/squad-2/academic-attendance`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Alta (En contingencias de corte de internet en portería)  

---

## 1. Resumen y Alcance

Permite a la computadora de portería continuar escaneando carnés y registrando ingresos normalmente aun cuando se pierda totalmente la conexión a internet o red local, almacenando en búfer local y sincronizando automáticamente al restablecerse la red.

---

## 2. Actores Involucrados

* **Actor Primario:** Personal de Portería / Vigilante ('Wachiman')
* **Actores Secundarios / Sistemas:** Búfer Local (IndexedDB / Hive), Servicio Background Sync

---

## 3. Precondiciones

* La aplicación de Kiosco ha precargado localmente la nómina activa de carnés válidos del plantel.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Cero pérdida de registros de asistencia aunque el equipo se quede sin conexión durante toda la mañana.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Los registros se guardan en el almacenamiento local seguro y al volver la conexión se transmiten al servidor central mediante un lote idempotente.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. Se interrumpe la conexión a internet en la garita de portería.
2. El sistema detecta el estado offline y cambia la insignia de estado a 'Modo Sin Conexión (Offline)' en color naranja.
3. El vigilante continúa escaneando carnés con el lector QR con normalidad.
4. El sistema valida el código contra el padrón local cifrado en IndexedDB/Hive.
5. Registra la asistencia en la cola local de pendientes con timestamp UTC.
6. Muestra el feedback sonoro y visual normal al alumno.
7. Al restablecerse la conexión a red, el sincronizador en segundo plano detecta la señal.
8. Transmite el lote de asistencias acumuladas al backend vía POST /api/v1/attendance/sync.
9. El backend valida y procesa el lote de manera idempotente (sin duplicados).
10. El sistema actualiza el estado a 'En Línea (Sincronizado)' e informa cuántos registros se sincronizaron.

---

## 6. Flujos Alternativos y Excepciones

* **8a. Fallo de sincronización de un registro: El sistema reintenta con retroceso exponencial (Exponential Backoff) y conserva la copia local intacta hasta recibir confirmación HTTP 200.**

---

## 7. Reglas de Negocio Asociadas

* **RN-AST-07: El búfer local debe ser capaz de almacenar al menos 2000 marcaciones desconectadas.**
* **RN-AST-08: Toda marcación offline debe incluir un UUID único generado en cliente para asegurar idempotencia estricta en el servidor.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Indicador flotante en la esquina superior con ícono de nube (Verde = Online, Naranja = Offline con contador de registros pendientes, Azul = Sincronizando).

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-25](../../Requisitos%20Funcionales/Squad%202%20-%20Matricula%20y%20Asistencia/RF-25.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%202%20-%20Matricula%20y%20Asistencia/esquema_datos.sql)
