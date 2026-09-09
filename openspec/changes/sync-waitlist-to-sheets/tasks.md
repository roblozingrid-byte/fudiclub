## 1. Google Sheets Setup

- [x] 1.1 Crear manualmente la pestaña `Waitlist (Backup)` en el archivo de Google Sheets operativo.
- [x] 1.2 Agregar la variable de entorno `SHEETS_TAB_WAITLIST` con valor `Waitlist (Backup)` en Supabase Secrets.

## 2. Edge Function Modification

- [x] 2.1 Modificar `supabase/functions/sync-to-sheets/index.ts` para capturar la variable `SHEETS_TAB_WAITLIST`.
- [x] 2.2 Agregar la condición `else if (table === "waitlist")` en el mapeo de columnas de `index.ts`.
- [x] 2.3 Mapear los campos `[record.id, record.email, record.created_at]` al formato que espera Google Sheets.
- [x] 2.4 Ejecutar el comando para hacer deploy de la función actualizada a Supabase.

## 3. Database Webhooks

- [x] 3.1 Ir al panel web de Supabase -> Database -> Webhooks.
- [x] 3.2 Crear un nuevo Webhook llamado `Sync Waitlist` para la tabla `waitlist` (Event: Insert) apuntando a la Edge Function `sync-to-sheets`.
