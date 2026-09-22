# CU-INS-04: Definición de Escalas de Calificación Institucionales (Dual CNEB)

**Requisito Trazable:** [RF-13](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-13.md)  
**Módulo:** Módulo 3: Configuración Escolar, Periodos y Escalas  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Muy Baja  

---

## 1. Resumen y Alcance

Permite parametrizar las escalas de calificación cualitativas (AD, A, B, C) según norma MINEDU y la escala vigesimal (0-20), estableciendo equivalencias exactas.

---

## 2. Actores Involucrados

* **Actor Primario:** Coordinación Pedagógica / Dirección
* **Actores Secundarios / Sistemas:** Motor de Evaluación

---

## 3. Precondiciones

* Año lectivo aperturado.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  Rangos de equivalencia sin solapamientos ni huecos numéricos.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Reglas de escala persistidas y aplicables automáticamente en los módulos de evaluación y libretas.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El coordinador accede a 'Configuración Pedagógica > Escalas de Evaluación'.
2. Revisa la tabla de correspondencia oficial: AD (18-20), A (14-17), B (11-13), C (00-10).
3. Configura si para el nivel (ej. Secundaria) se registrará en escala vigesimal o directa literal.
4. Guarda la configuración normativa.
5. El sistema almacena las reglas de conversión para su uso en el motor de notas.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Ajuste de rangos personalizados: Si se modifican los intervalos, el sistema valida que cubran estrictamente de 0 a 20.**

---

## 7. Reglas de Negocio Asociadas

* **RN-NOT-01: La escala oficial para emisión de actas y libretas ante MINEDU es siempre la escala literal CNEB.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Tabla visual con barras de color asociadas a cada nivel de logro (AD = Azul, A = Verde, B = Amarillo, C = Rojo).

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-13](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-13.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
