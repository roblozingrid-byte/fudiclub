## Context

El dueño de Fudi Club maneja sus operaciones (proveedores, cajas, despachos) en un archivo de Google Sheets. Para evitar cargar clientes y pedidos a mano, necesitamos que Supabase (donde ocurren las transacciones) escriba directamente en este Sheets cada vez que hay una compra nueva. Fudi Club utiliza Supabase Edge Functions (basadas en Deno) y PostgreSQL.

## Goals / Non-Goals

**Goals:**
- Sincronizar automáticamente la inserción de nuevos clientes a la pestaña `Clientes (Backup)`.
- Sincronizar automáticamente la inserción de nuevos pedidos a la pestaña `Pedidos (Backup)`.
- Evitar herramientas de terceros (Make, Zapier) para mantener los costos fijos en $0.
- Desacoplar el flujo crítico de checkout del flujo de sincronización con Sheets (es decir, si Sheets se cae, el usuario aún puede completar su compra).

**Non-Goals:**
- Sincronización bidireccional (no leeremos de Sheets hacia Supabase).
- Sincronización de modificaciones (updates) a los pedidos. Si un pedido cambia de estado en Supabase, no buscaremos la fila en Sheets para editarla en esta fase inicial (solo `append`).

## Decisions

1. **Triggering Mechanism: Database Webhooks**
   - **Rationale**: Usaremos Database Webhooks de Supabase en las tablas `customers` y `orders` que llamarán a nuestra Edge Function `sync-to-sheets` de forma asíncrona.
   - **Alternative**: Llamar a la API de Sheets desde la función existente `create-order`.
   - **Why this?**: Desacopla la lógica. Si la API de Google demora 3 segundos, el cliente en el checkout no se verá afectado. Además, si creamos pedidos manualmente desde el dashboard de Supabase, el webhook también se dispara.

2. **Authentication con Google: Service Account Keys**
   - **Rationale**: Crearemos una Service Account en Google Cloud, le compartiremos el archivo de Sheets (como Editor) y guardaremos su llave (JSON) en los `Secrets` de Supabase.
   - **Why this?**: Es la forma estándar para interacciones Server-to-Server sin intervención de un usuario.

3. **HTTP Client: fetch nativo de Deno**
   - **Rationale**: Las Edge Functions corren en Deno. Utilizaremos librerías compatibles con Deno (como `google-auth-library` o generación manual de JWT) para obtener el token de acceso, y luego el `fetch` nativo para llamar a la Google Sheets REST API.
   - **Why this?**: Minimiza el bundle size de la función y asegura la compatibilidad con el runtime de Edge.

## Risks / Trade-offs

- **[Risk] Complejidad de credenciales de Google:** El proceso de obtener la llave JSON de la cuenta de servicio no es trivial. 
  - *Mitigation*: Documentar el paso a paso detallado en el README o tasks para el dueño.
- **[Risk] Cambios en la estructura del Excel:** Si alguien renombra la pestaña "Clientes (Backup)" o cambia el orden de las columnas, la inserción puede fallar o quedar desordenada.
  - *Mitigation*: Hardcodear los nombres de las pestañas en el código y poner una advertencia en el Excel. Insertar usando la modalidad `USER_ENTERED` o mapeando al orden esperado de columnas (A, B, C...).
