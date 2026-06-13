## Context

Fudi Club opera bajo un modelo de suscripción mensual de cajas misteriosas. Actualmente el código de la página web (`main.js` e `index.html`) no contempla el ciclo operativo del negocio, donde las compras realizadas hasta el día 5 del mes se asignan al mes en curso, y las compras desde el día 6 en adelante pasan automáticamente a la edición del mes siguiente. Para asegurar transparencia y facilitar el control operativo, es fundamental calcular y mostrar esta edición en el checkout.

## Goals / Non-Goals

**Goals:**
- Implementar una función en el frontend (`main.js`) que determine la edición correspondiente basada en la fecha actual del usuario.
- Actualizar el DOM para mostrar la edición al usuario de forma clara en la interfaz.
- Añadir el dato de la edición asignada en el texto formateado que se envía a WhatsApp al completar el checkout.

**Non-Goals:**
- No se implementará un bloqueo de cupos backend en esta etapa.
- No se añadirá una dependencia externa para el manejo de fechas, se mantendrá vanilla.

## Decisions

- **Cálculo de Fechas Nativo en JS**: Se utilizará el objeto `Date` nativo de JavaScript para obtener el día y mes actual. Si `fecha.getDate() <= 5`, corresponde a `fecha.getMonth()`. Si es mayor a 5, corresponde a `fecha.getMonth() + 1` (manejando el caso especial de Diciembre pasando a Enero del próximo año).
- **Mapeo de Meses**: Se usará un arreglo con los nombres de los meses en español para mostrar "Edición [Mes]" (ej. "Edición Febrero").
- **Actualización del DOM**: Se añadirá un contenedor en `index.html` (ej. dentro del formulario de checkout o resumen) y `main.js` lo poblará dinámicamente al cargar la página.

## Risks / Trade-offs

- **Dependencia de la hora del cliente**: Al calcular la fecha en el navegador, un usuario con fecha incorrecta o en otra zona horaria podría ver/enviar un mes incorrecto.
  - *Mitigación*: Para esta etapa piloto, Fudi Club verifica todas las órdenes. La diferencia horaria solo afectaría compras justo en el límite de medianoche, un caso borde aceptable por ahora sin necesidad de tener un servidor.
