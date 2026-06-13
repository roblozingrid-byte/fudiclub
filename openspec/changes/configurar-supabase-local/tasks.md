## 1. Configuración de Base de Datos

- [x] 1.1 Ejecutar `npx supabase init` para inicializar el proyecto local
- [x] 1.2 Crear el script de migración SQL para las tablas `customers`, `orders` y `waitlist`
- [x] 1.3 Aplicar la migración localmente e iniciar supabase (`supabase start`)

## 2. Desarrollo de Edge Functions

- [x] 2.1 Crear utilidades compartidas (`cors.ts`, `supabase.ts`, `resend.ts`) en `supabase/functions/_shared/`
- [x] 2.2 Crear la Edge Function `create-order` y su lógica de cálculo de envío e integración con Mercado Pago/Resend
- [x] 2.3 Crear la Edge Function `webhook-mp` para procesar notificaciones de Mercado Pago
- [x] 2.4 Crear la Edge Function `join-waitlist` para el registro de correos electrónicos

## 3. Integración en el Frontend

- [x] 3.1 Actualizar el archivo `.env` o `package.json` para apuntar `VITE_SUPABASE_FUNCTIONS_URL` al endpoint correspondiente
- [x] 3.2 Modificar `main.js` para que el formulario de checkout use la función `create-order` con `fetch`
- [x] 3.3 Modificar `main.js` para que el formulario de waitlist use la función `join-waitlist` con `fetch`
- [x] 3.4 Probar los flujos localmente con el frontend apuntando a `localhost:54321`
