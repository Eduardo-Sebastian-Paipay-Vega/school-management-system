# CU-USR-03: Gestión de Sedes y Planteles Escolares Multi-Tenant

**Requisito Trazable:** [RF-07](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-07.md)  
**Módulo:** Módulo 2: Administración de Usuarios y Directorio  
**Squad Asignado:** Squad 1: Core, Seguridad, Configuración y Auditoría  
**Responsable Técnico:** Brandon Fernando Montero Gutiérrez (`@brandonmontero27-g`)  
**Rama de Trabajo:** `feature/squad-1/auth-core`  
**Nivel del Caso de Uso:** Objetivo de Usuario  
**Frecuencia de Uso:** Muy Baja (Configuración inicial)  

---

## 1. Resumen y Alcance

Permite registrar y configurar sedes y niveles dentro de la institución piloto. La institución es el tenant; las sedes son unidades internas. PostgreSQL RLS aísla instituciones y los permisos controlan el acceso por sede.

---

## 2. Actores Involucrados

* **Actor Primario:** Administrador local autorizado de la institución
* **Actores Secundarios / Sistemas:** Base de Datos PostgreSQL

---

## 3. Precondiciones

* El usuario posee credenciales y permisos de gestión de sedes en su institución.

---

## 4. Garantías del Sistema

* **Garantía Mínima (En caso de fallo):**  
  No se permite acceder a otra institución; el acceso entre sedes de la misma institución exige la autorización correspondiente.

* **Garantía de Éxito (Postcondición Exitosa):**  
  Sede registrada con sus parámetros de infraestructura y claves foráneas asignadas.

---

## 5. Flujo Principal de Eventos (Camino Feliz)

1. El administrador autorizado ingresa a 'Configuración > Sedes e Institución'.
2. Registra nombre de sede, código modular, nivel (Inicial, Primaria, Secundaria), dirección física y datos de contacto.
3. El sistema asigna a la sede el `tenant_id UUID` de la institución existente; el administrador configura responsables locales autorizados.
4. Presiona 'Guardar Sede'.
5. El sistema persiste la sede en `sedes`; no crea un tenant ni un esquema nuevo.

---

## 6. Flujos Alternativos y Excepciones

* **2a. Código modular ya registrado: El sistema impide la duplicación y emite alerta normativa.**

---

## 7. Reglas de Negocio Asociadas

* **RN-INS-01: Cada registro académico y transaccional perteneciente a una institución debe incluir el `tenant_id UUID` de esa institución. Las referencias a sede son independientes y quedan sujetas a autorización.**

---

## 8. Interfaz de Usuario y Wireframe Conceptual

* **Diseño y Ergonomía Visual:** Tarjetas informativas de sedes con botón de edición, mapa de ubicación referencial y modal de parametrización.

---

## 9. Trazabilidad Técnica

* **Requisito Funcional Formal:** Ver especificación en [RF-07](../../Requisitos%20Funcionales/Squad%201%20-%20Core%20y%20Seguridad/RF-07.md)
* **Contratos de API y Endpoints:** Ver especificación en [contratos_api.md](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/contratos_api.md)
* **Esquema Relacional de Base de Datos:** Ver tablas en [esquema_datos.sql](../../Arquitectura/Squad%201%20-%20Core%20y%20Seguridad/esquema_datos.sql)
