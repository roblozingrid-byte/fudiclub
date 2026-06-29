## Context

Fudi Club cuenta con un frontend en Vite y requiere una arquitectura para manejar registros y compras sin exponer bases de datos. Elegimos Supabase Edge Functions como "capa de middleware" para recibir peticiones POST y realizar cambios en base de datos. 

## Goals / Non-Goals

**Goals:**
- Configurar un entorno local de Supabase (`supabase start`).
- Implementar "Guest Checkout" con una estructura de base de datos relacional para `customers`, `orders` y `waitlist`.
- Procesar pagos delegando el control a Mercado Pago, devolviendo el link de redirección.
- Automatizar notificaciones por email a través de la API de Resend.

**Non-Goals:**
- Implementar autenticación tradicional (login/registro con contraseñas) para usuarios de Fudi Club (se mantendrá el "Guest Checkout").
- Procesar pagos de tarjeta de crédito directamente en nuestro servidor (se delega el cumplimiento PCI a Mercado Pago).

## Decisions

- **Edge Functions sobre llamadas cliente a base de datos:** El frontend usará `fetch` hacia las Edge Functions en lugar del cliente de Supabase (`supabase-js`) para realizar inserciones. Esto evita que usuarios no autenticados (invitados) interactúen directamente con la DB, centralizando la lógica (cálculo de costos, envío de emails) de manera segura y omitiendo la necesidad de configurar reglas complejas de RLS anónimas.
- **Uso de Resend API directa (fetch):** Se usará `fetch('https://api.resend.com/emails')` en lugar de una librería de SDK para asegurar máxima compatibilidad con el entorno de Deno de Edge Functions.
- **Relación 1 a N:** La tabla `customers` mantendrá unicidad por correo, mientras que un cliente podrá tener múltiples órdenes en `orders`.

## Risks / Trade-offs

- **Dependencia de servicios terceros:** [Riesgo] -> Si Mercado Pago falla, las ventas no se procesan automáticamente. [Mitigación] -> Se provee la opción de transferencia bancaria manual.
- **Local Dev vs Cloud:** [Riesgo] -> Las funciones pueden comportarse diferente en local vs Edge. [Mitigación] -> Se desarrollarán usando `Deno` de manera estricta y se probarán localmente con `supabase functions serve` asegurando que usen los mismos headers CORS y parseo JSON que la nube.
