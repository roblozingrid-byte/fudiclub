## 1. Modificaciones en UI (HTML)

- [x] 1.1 Añadir un contenedor en `index.html` (por ejemplo, cerca del botón de pago o en el resumen) para mostrar la "Edición a recibir".
- [x] 1.2 Añadir estilos si es necesario en `style.css` para resaltar el texto de la edición actual.

## 2. Lógica de Cálculo (JS)

- [x] 2.1 Crear la función `calculateCurrentEdition()` en `main.js` usando `new Date()` para obtener la fecha local.
- [x] 2.2 Implementar la lógica: si el día es <= 5, el índice del mes a recibir es el mes actual; si es > 5, es el mes siguiente (resolviendo correctamente el paso de diciembre a enero).
- [x] 2.3 Utilizar un arreglo de meses en español para devolver el texto formateado, por ejemplo, "Edición [Mes]".

## 3. Integración en el Flujo de Compra

- [x] 3.1 Llamar a `calculateCurrentEdition()` al cargar la vista principal/carrito para actualizar el contenedor de la interfaz de usuario con la edición correspondiente.
- [x] 3.2 Modificar la lógica de generación del mensaje de WhatsApp (en el evento submit del formulario) para incluir explícitamente la edición a recibir en el resumen del pedido.
