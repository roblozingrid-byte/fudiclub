## Why

El dueño necesita guardar los correos de las personas que se anotan en la lista de espera de la landing page. Al centralizar esto en Google Sheets, al igual que los clientes y pedidos, se facilita la gestión de contactos y el envío masivo de correos para avisar sobre el lanzamiento, todo desde un mismo Backoffice operativo.

## What Changes

- Modificación de la Edge Function `sync-to-sheets` para soportar eventos de tipo `INSERT` provenientes de la tabla `waitlist`.
- Incorporación de una nueva pestaña llamada `Waitlist (Backup)` en el archivo de Google Sheets operativo (esto se hará manualmente en el archivo).
- Nueva variable de entorno `SHEETS_TAB_WAITLIST` para la Edge Function.
- Creación de un Webhook en la tabla `waitlist` desde el panel de Supabase.

## Capabilities

### New Capabilities

### Modified Capabilities
- `sheets-integration`: Se agrega el soporte para sincronizar la tabla `waitlist`.

## Impact

- **Supabase Edge Functions**: Se modifica la lógica de la función `sync-to-sheets` para soportar una tabla adicional y un nuevo mapeo de columnas.
- **Supabase Database**: Se añade un webhook en la tabla `waitlist`.
- **Google Sheets**: Requiere agregar una nueva pestaña manualmente.
