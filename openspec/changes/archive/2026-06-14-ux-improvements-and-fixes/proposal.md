## Why

El sitio tiene un diseño "Neo-Brutalista" excelente, pero presenta ciertos errores técnicos y fricciones en la experiencia de usuario. El problema más crítico es que el sistema de detección de "Venta Cerrada" (después del día 5) se salta el modal de aviso si todavía hay stock disponible, permitiendo al usuario avanzar sin entender que está comprando para el mes siguiente. Además, hay alertas nativas intrusivas (`alert()`), un estado de lista de espera que no limpia la interfaz correctamente, y un problema con Vite (`import.meta.env?.`) que puede fallar en producción.

## What Changes

- **Corrección del flujo de Venta Cerrada**: Asegurar que si el día actual es mayor a 5, SIEMPRE se muestre el modal de "Venta Cerrada / Preventa", incluso si hay stock disponible.
- **Corrección de Vite Build**: Cambiar `import.meta.env?.VITE_SUPABASE_FUNCTIONS_URL` a su forma estricta para que el reemplazo estático de Vite funcione correctamente en producción.
- **Mejora del Waitlist UI**: Tras un registro exitoso, ocultar completamente el formulario y los textos previos, mostrando un mensaje de éxito limpio y centrado.
- **Validación Visual de Alergias**: En lugar de mostrar un `alert()` cuando falta aceptar la política de alergias, iluminar o enfocar la casilla de verificación.
- **Estados de Carga en Checkout**: Deshabilitar todo el formulario de pago durante el procesamiento para evitar doble sumisión.
- **Stock Dinámico (Mejora FOMO)**: Obtener el stock real disponible desde Supabase en lugar de usar una constante hardcodeada `AVAILABLE_STOCK = 30`.
- **Feedback del Reproductor Retro**: Añadir un efecto de pulso al botón "Play" del reproductor de música para invitar a la interacción, dado que el autoplay está bloqueado por navegadores.

## Capabilities

### New Capabilities
- `site-ux`: Define mejoras visuales y de interacción generales como el reproductor de música retro y el manejo de validaciones visuales sin `alert()`.
- `build-configuration`: Define la configuración y correcta utilización de variables de entorno con Vite.

### Modified Capabilities
- `checkout-flow`: Modificación del comportamiento del checkout para mostrar correctamente los estados de venta cerrada y manejar el formulario bloqueado durante el procesamiento.
- `stock-control`: Modificación del origen del inventario para que se consulte dinámicamente desde la base de datos (Supabase) en lugar de un valor estático en el frontend.

## Impact

- `main.js`: Se refactorizará la lógica de `btnJoin.addEventListener`, `updateStockWidget()`, `calculateCurrentEdition()`, la validación de alergias y el reproductor de música.
- `style.css`: Se añadirán clases para validación de errores visuales y animaciones de pulso.
- Interacciones con Edge Functions o la base de datos de Supabase se verán impactadas para consultar el stock inicial.
