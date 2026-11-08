---
name: diagnostico-staging
description: Investiga de forma inicialmente solo lectura errores de CI, preview o un posible staging del Sistema de Gestión Escolar. Úsala ante fallas de despliegue o servicio; primero verifica en la documentación si el entorno existe y qué proveedor usa.
---

# Diagnóstico de entorno

## 1. Identificar el objetivo

- Revisa `docs/deployment/guia-despliegue.md`, runbooks actuales, workflows y configuración de despliegue.
- La documentación consultada registra staging como **no implementado** y hosting backend como pendiente. Vuelve a comprobar el estado actual antes de afirmarlo; no supongas Cloud Run, Cloud SQL, Vercel staging ni una base remota.
- Si no hay un entorno configurado, limita el diagnóstico a CI, configuración local o evidencia que entregue el usuario. Declara el límite, no simules acceso a un servicio.

## 2. Diagnóstico de solo lectura

- Determina servicio, hora/rango, commit y síntoma. Inspecciona logs o checks accesibles sin imprimir variables secretas, tokens, cadenas de conexión o PII.
- Contrasta build y CI con las puertas reales del componente. Para fallas de base, consulta migraciones y el runbook; una prueba local no demuestra que un entorno remoto esté sano.
- Separa hechos, hipótesis y datos faltantes. Devuelve evidencia, probable causa y siguiente verificación segura.

## 3. Cambios operativos

No despliegues, reinicies servicios, cambies secretos, corras migraciones ni alteres datos como parte del diagnóstico. Si el usuario luego solicita una acción concreta, revisa primero el procedimiento y los efectos, protege `main` y solicita confirmación cuando la acción afecte un entorno compartido o externo.
