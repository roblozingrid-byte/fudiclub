## Context

El usuario explicitó: *"las ventas no se van a hacer por whatsapp, solo en la web y whatsapp sera para soporte"*.
El formulario actual en `index.html` asume captura directa de tarjeta de crédito (inputs falsos), lo cual no cumple con las regulaciones de seguridad (PCI) sin un procesador como Mercado Pago o Stripe. Para una arquitectura serverless/estática pura, se requiere redirigir al usuario al entorno seguro de Mercado Pago (Checkout Pro) o utilizar integraciones de Frontend (Brick) que igualmente requieren un servidor para firmar las preferencias.

## Goals / Non-Goals

**Goals:**
- Eliminar los campos manuales de tarjeta de crédito (Número, MM/AA, CVC) del checkout.
- Reemplazarlos por un selector de método de pago: "Mercado Pago" o "Transferencia Bancaria".
- Modificar el comportamiento de `submit` en el formulario para simular una llamada a una API de backend.
- Mostrar un estado de "Procesando pago..." (UI bloqueada) y luego lanzar un modal o alerta simulando el éxito de la compra y la redirección ficticia a Mercado Pago.
- Agregar un botón de soporte de WhatsApp visible en el footer o flotante.

**Non-Goals:**
- No se implementará un servidor real en Node.js/Python en este paso para generar los tokens de Mercado Pago. Se documentará el mock en código.

## Decisions

- **Selector de Pago**: Usaremos componentes de radio (similares a los planes) para que elijan entre "Mercado Pago (Tarjetas, Dinero en Cuenta)" y "Transferencia (Alias/CBU)".
- **Simulación de Backend**: En `main.js`, crearemos una función asíncrona `mockProcessPayment(payload)` que use `setTimeout` (2 segundos) para simular la latencia de la red, devolviendo una URL ficticia de MP (`https://www.mercadopago.com.ar/checkout/v1/redirect?...`).
- **Soporte WA**: Un botón discreto en la esquina inferior derecha o en el menú de navegación que enlace a `https://wa.me/XXXXXXXXXX?text=Hola,%20necesito%20ayuda%20con%20Fudi%20Club`.

## Risks / Trade-offs

- **Limitación Técnica**: Como no hay backend disponible ahora mismo, el flujo final no será 100% transaccional en producción hasta que se levante un servicio para generar el Preference ID.
  - *Mitigación*: Se entregará la web lista y "cableada". Cuando se agregue el backend, solo se debe cambiar la URL en el `fetch` dentro de `main.js`.
