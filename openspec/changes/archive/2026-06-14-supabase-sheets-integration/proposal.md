## Why

El dueño de Fudi Club necesita un "Backoffice" centralizado en Google Sheets para gestionar proveedores, el armado de las cajas y llevar control de la logística. Si bien Supabase es la fuente de verdad técnica para procesar transacciones, compras y asegurar el stock en tiempo real, cargar estos datos manualmente en Sheets es ineficiente y propenso a errores. Esta integración directa permitirá enviar de forma gratuita y en tiempo real cada nuevo cliente y pedido desde Supabase a Google Sheets, ahorrando el costo de herramientas no-code como Zapier o Make.

## What Changes

- Crear una nueva Edge Function en Supabase llamada `sync-to-sheets`.
- Configurar Database Webhooks en Supabase para disparar esta función cada vez que se inserta un registro en las tablas `customers` o `orders`.
- Utilizar la API de Google Sheets desde la Edge Function para agregar filas (`append`) a las pestañas correspondientes (`Clientes (Backup)` y `Pedidos (Backup)`).
- Configurar variables de entorno (Secrets) en Supabase con las credenciales de la Service Account de Google Cloud.

## Capabilities

### New Capabilities
- `sheets-integration`: Sincronización en tiempo real de registros de base de datos hacia Google Sheets mediante Edge Functions y Database Webhooks.

### Modified Capabilities
- No hay capacidades existentes que cambien sus requerimientos fundamentales.

## Impact

- **Supabase Edge Functions**: Se añade nueva infraestructura y dependencias para conectarse a Google APIs.
- **Supabase Database**: Se añaden triggers/webhooks en las tablas `customers` y `orders`.
- **Google Cloud**: Se requiere la creación y mantenimiento de una Service Account con acceso al Google Sheet operativo.
