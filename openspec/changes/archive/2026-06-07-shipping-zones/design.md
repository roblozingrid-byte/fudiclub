## Context

En `main.js`, la variable `const deliveryFee = 2500;` está estática y se usa dentro de `updateCheckoutTotals()`. En `index.html`, la sección de datos personales tiene un input de texto genérico para la dirección, pero no pide Código Postal de forma explícita.

## Goals / Non-Goals

**Goals:**
- Agregar un input `<input type="text" id="cpInput" placeholder="Código Postal">` obligatorio en el formulario de Checkout.
- Refactorizar `updateCheckoutTotals()` en `main.js` para que calcule el costo basado en el CP.
- Actualizar los totales dinámicamente cuando el usuario escriba su CP.

**Non-Goals:**
- No implementaremos una integración con APIs de correos reales (Andreani/Correo Argentino). Asumiremos rangos genéricos de prueba (ej. 1000-1499 para CABA) que luego el dueño actualizará según su courier.

## Decisions

- **UI Selector**: Añadiremos un `<input type="text" id="cpInput" maxlength="8">` de la clase `.neo-input` al lado del campo de "Dirección de envío".
- **Lógica de Rangos (Placeholders)**:
  - CP >= 1000 y <= 1499: CABA ($2.500)
  - CP >= 1600 y <= 1900: GBA ($4.000)
  - Otros CPs: Interior / Resto del País ($6.000)
  - CP vacío: $0 (A calcular)
- **Lógica JS**: 
  - Añadiremos un `input` event listener a `#cpInput` que invoque a `updateCheckoutTotals()`.
  - La función `updateCheckoutTotals` evaluará el valor ingresado y asignará el `deliveryFee` correspondiente.

## Risks / Trade-offs

- **Precisión del CP**: Algunos usuarios pueden no saber su CP o ingresar un CP inválido.
  - *Mitigación*: Se asume el costo mayor (Interior) o se le muestra "Verifica tu CP". Por ahora, si escribe un CP fuera del rango principal, cobra tarifa de Interior. Cuando se elija el courier definitivo, la tabla de CPs se ajustará a sus zonas.
