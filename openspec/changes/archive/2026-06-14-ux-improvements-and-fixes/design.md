## Context

La página de Fudi Club se desarrolló con un enfoque fuerte en lo estético, pero ciertas interacciones críticas de la compra (alertas, manejo de ventas cerradas, variables de entorno de Vite) no fueron manejadas adecuadamente. El objetivo de este diseño técnico es estabilizar la experiencia sin alterar la esencia "Retro / Neo-Brutalista" que el cliente aprobó.

## Goals / Non-Goals

**Goals:**
- Resolver el bug crítico donde el usuario puede saltear la restricción del día 5 para el mes en curso.
- Desacoplar el `AVAILABLE_STOCK` de `main.js` y obtenerlo desde el backend (Supabase).
- Eliminar el uso de alertas nativas (`alert()`) en el flujo de compra.
- Asegurar que Vite reemplace correctamente la URL de las Edge Functions en producción.

**Non-Goals:**
- Implementar el mapa interactivo de Leaflet para las zonas de cobertura (el usuario explícitamente lo descartó por ahora).

## Decisions

1. **Bugfix de Venta Cerrada (Día > 5):** En `main.js`, la lógica condicional que muestra las opciones de "Agotado/Preventa" se modificará. Actualmente evalúa `if (AVAILABLE_STOCK <= 0)`. Se cambiará a `if (AVAILABLE_STOCK <= 0 || (new Date().getDate() > 5))` para forzar el modal de confirmación de preventa.
2. **Variables de Entorno Estrictas:** Vite no analiza propiedades dinámicas con optional chaining (`?.`) durante el proceso de build. Se eliminará el `?.` en `import.meta.env.VITE_SUPABASE_FUNCTIONS_URL` para garantizar su correcto funcionamiento en producción.
3. **Manejo Visual de Errores (Alergias):** Se agregará una clase CSS `.error-pulse` que hará parpadear el borde en rojo de la validación de alergias en lugar de usar `alert()`. Además, se deshabilitará el botón con el texto "Procesando..." durante las peticiones POST.
4. **Stock Dinámico:** Se realizará un `fetch` hacia una Edge Function (o la API REST de Supabase directamente si las políticas RLS lo permiten) en la inicialización de la página para obtener la cantidad de órdenes del mes actual y calcular `30 - count`. Por simplicidad arquitectónica, se optará por hacer un GET REST a `orders` usando anon key si se configuran políticas públicas de lectura (conteo), o se asume temporalmente una simulación hasta que haya un endpoint dedicado, pero apuntando a la arquitectura final.

## Risks / Trade-offs

- **[Risk] La API REST de Supabase para órdenes podría exponer datos sensibles si las políticas RLS no son estrictas.** → **Mitigación**: Solo expondremos un endpoint que devuelva un número de conteo, no la lista de órdenes, o utilizaremos una política RLS `count only`.
- **[Risk] Errores en tiempo de compilación por falta de `.env` local:** Al hacer estricto `import.meta.env`, fallará si el `.env` no existe. → **Mitigación**: Añadir un fallback mediante el uso de operadores `||` o asegurar que la variable exista en el entorno de build.
