## Context

El negocio especifica un máximo de 30 cajas por edición durante esta fase piloto. Cuando este stock se agota, Fudi Club desea ofrecer a los usuarios dos opciones para no perder la intención de compra:
1. Comprar anticipadamente la caja de la *siguiente* edición.
2. Registrarse en una Lista de Espera (Waitlist) para recibir una notificación cuando se libere la nueva edición, sin pagar nada ahora.

## Goals / Non-Goals

**Goals:**
- Actualizar el widget de stock para mostrar "30" como inventario máximo inicial.
- Establecer una variable de estado en `main.js` (`AVAILABLE_STOCK`) para manejar la lógica visual de stock agotado.
- Modificar el flujo de checkout: si el stock llega a `<= 0`, reemplazar la vista directa de pago por una pantalla/sección de "Opciones de Agotado".
- Implementar la UI para la opción de "Pre-comprar próximo mes" (que reactiva el checkout pero fuerza la edición al mes siguiente) y "Anotarme en Waitlist".
- Capturar el email simulado en la opción de Waitlist.

**Non-Goals:**
- No se implementará persistencia en base de datos.
- No se conectará el envío de emails de Waitlist en esta iteración frontend.

## Decisions

- **Estado de Stock**: `AVAILABLE_STOCK` en `main.js` controlará el flujo. Para testing, se podrá cambiar a 0.
- **Transición de UI (Sold Out Flow)**:
  Dentro de `#expandedCheckout`, si no hay stock, se ocultará el `#paymentForm` y planes, mostrando un `#sold-out-options`.
  - Si el usuario elige "Pre-comprar", se vuelve a mostrar el `#paymentForm`, pero una bandera interna (`isPreorderMode = true`) forzará a que `calculateCurrentEdition()` devuelva el mes siguiente.
  - Si el usuario elige "Waitlist", se oculta `#sold-out-options` y se muestra el `#waitlist-container` con el input de email.
- **UI del Widget**: Si el stock es 0, mostrará "¡Edición Agotada!".

## Risks / Trade-offs

- **Complejidad del Checkout**: El flujo tiene ahora más bifurcaciones dentro de la misma vista, requiriendo un manejo de estado cuidadoso de las variables (`isPreorderMode`, `isWaitlistMode`) para no confundir la "edición asignada" en el resumen.
  - *Mitigación*: Mantener el control de estas banderas explícito en `main.js` y asegurarse de que los labels del DOM se actualicen dinámicamente cuando se activa el modo pre-compra.
