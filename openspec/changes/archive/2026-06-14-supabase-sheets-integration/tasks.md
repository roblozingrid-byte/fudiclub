## 1. Setup Google Cloud & Supabase

- [x] 1.1 Documentar pasos para crear la cuenta de servicio de Google Cloud y habilitar la Sheets API
- [x] 1.2 Documentar pasos para agregar la llave JSON a los Secrets de Supabase (`GOOGLE_SERVICE_ACCOUNT`)
- [x] 1.3 Configurar variables de entorno con los IDs del Spreadsheet y nombres de pestañas

## 2. Edge Function Implementation

- [x] 2.1 Crear el scaffolding de la función `sync-to-sheets` en `supabase/functions/`
- [x] 2.2 Implementar autenticación usando la librería `npm:google-auth-library` para generar el Access Token
- [x] 2.3 Escribir lógica para parsear el payload del Webhook e identificar si es un cliente o un pedido
- [x] 2.4 Implementar el mapeo de columnas para `customers` y hacer POST al endpoint `values:append` de Sheets
- [x] 2.5 Implementar el mapeo de columnas para `orders` y hacer POST al endpoint `values:append` de Sheets

## 3. Database Webhooks Configuration

- [x] 3.1 Crear migración SQL para habilitar el trigger de Webhook en la tabla `customers` (AFTER INSERT)
- [x] 3.2 Crear migración SQL para habilitar el trigger de Webhook en la tabla `orders` (AFTER INSERT)
