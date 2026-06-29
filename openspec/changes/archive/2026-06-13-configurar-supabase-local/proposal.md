## Why

Fudi Club necesita un backend robusto para manejar de forma segura las ventas de la Mistery Box (tanto por Mercado Pago como por transferencia) y registrar a los usuarios en la lista de espera, sin exponer secretos (API keys) ni acceso directo a la base de datos en el cliente frontend. Configurar Supabase local y Edge Functions nos provee la infraestructura necesaria (DB Postgres + Serverless Functions) para implementar esto de manera escalable, manteniendo el "guest checkout" sin forzar registros de usuarios.

## What Changes

- Se inicializa un proyecto local de Supabase (`npx supabase init`).
- Se define el esquema inicial de la base de datos con tablas para `customers`, `orders` y `waitlist`.
- Se crean tres Edge Functions principales:
  - `create-order`: Maneja el checkout, guarda la orden en estado pendiente, calcula el costo de envío, y se integra con Mercado Pago o Resend.
  - `webhook-mp`: Escucha notificaciones de pago aprobado de Mercado Pago, actualiza el estado de la orden y envía confirmación por email.
  - `join-waitlist`: Registra correos electrónicos y envía email de bienvenida.
- Se integra la API de Resend a las funciones para el envío de correos transaccionales.
- Se actualiza el frontend (`main.js`) para reemplazar los timeouts simulados por llamadas reales (fetch) a las funciones de Supabase.

## Capabilities

### New Capabilities
- `supabase-setup`: Configuración base del entorno local de Supabase, migraciones iniciales y variables de entorno para funciones serverless.
- `checkout-flow`: Flujo de creación de órdenes integrando Mercado Pago y envío de emails transaccionales.
- `waitlist-registration`: Registro en lista de espera y confirmación automática por correo.

### Modified Capabilities
- Ninguna (se están introduciendo por primera vez).

## Impact

- **Frontend**: Modificaciones en `main.js` para consumir los endpoints y manejo de promesas/errores.
- **Base de Datos**: Nueva estructura PostgreSQL (`customers`, `orders`, `waitlist`).
- **Infraestructura**: Dependencia de Supabase CLI localmente y Edge Functions en producción.
- **Servicios de Terceros**: Mercado Pago (pagos) y Resend (emails).
