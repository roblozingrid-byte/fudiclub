---
project_name: 'fudi-club'
user_name: 'Ingrid'
date: '2026-06-13'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 18
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Frontend Build Tool**: Vite (`^8.0.0`)
- **Language**: TypeScript (Migrando desde Vanilla JavaScript ES Modules)
- **Backend / Serverless**: Supabase (Edge Functions vía `VITE_SUPABASE_FUNCTIONS_URL`)
- **Deployment**: Cloudflare Pages (`wrangler`)
- **Styling**: Vanilla CSS (uso intensivo de variables nativas, sin Tailwind)

## Critical Implementation Rules

### Language-Specific Rules

- **Configuración estricta**: TypeScript debe configurarse en modo estricto (`strict: true`). Se deben incluir los tipos del DOM.
- **Interacción con el DOM**: Los agentes deben verificar siempre que un elemento no sea nulo antes de manipularlo o usar aserciones de tipo seguras (ej. `document.getElementById('id') as HTMLInputElement`).
- **Interfaces Obligatorias**: Es obligatorio definir interfaces claras para todos los payloads enviados o recibidos de las funciones de Supabase (ej. `OrderPayload`). ¡No usar `any`!
- **Manejo de Errores**: Usar bloques `try/catch` para todas las llamadas asíncronas a Supabase y manejar adecuadamente los estados de la UI (ej. botones deshabilitados).

### Framework-Specific Rules

- **Inicialización (Vanilla e Idempotencia)**: Las lógicas de UI deben estar en funciones modulares `init*` (ej. `initCheckoutFlow()`). **Crítico**: Deben ser idempotentes para evitar listeners duplicados (ej. chequear un atributo `data-initialized`). Se ejecutan dentro de `DOMContentLoaded` en `main.ts`.
- **Integración Backend (Supabase)**: Prohibido esparcir `import.meta.env` por toda la app. Toda la inicialización de Supabase debe estar aislada y exportada desde un único archivo central (ej. `src/lib/supabase.ts`).
- **Estilos (CSS nativo)**: Mantener CSS estándar y variables nativas. **Regla de oro**: Usar siempre prefijos por componente para las variables (ej. `--checkout-bg`) para evitar colisiones globales. No usar Tailwind.

### Testing Rules

- **Framework de Pruebas**: Se utilizará `Vitest` (configurado con `jsdom`).
- **Desacoplamiento DOM / Lógica**: **[CRÍTICO]** Separar rigurosamente las funciones matemáticas y de negocio (puras) de la actualización del DOM para poder testearlas aisladamente.
- **Cobertura de Fallos ("Unhappy Paths")**: Es **obligatorio** escribir pruebas para los casos de error: caídas de red, timeouts de Supabase, y validaciones de input inválidos. Las pruebas deben asegurar que la UI maneja el error correctamente (ej. mostrando alertas, restaurando botones).
- **Testing del DOM y Selectores**: Para verificar que el DOM se actualiza correctamente tras la lógica, los agentes deben usar atributos `data-testid="..."` en el HTML en lugar de depender de IDs frágiles o clases CSS que puedan cambiar por diseño.
- **Mocks vs Contratos Reales**: Usar Mocks de Supabase, pero atados obligatoriamente a interfaces estrictas de TypeScript que repliquen la estructura real de la base de datos.

### Code Quality & Style Rules

- **Linter y Formato**: Usar Prettier para el formato. Es obligatorio el uso de comillas simples (`'`) para strings en JavaScript/TypeScript, y comillas dobles (`"`) en HTML.
- **Estructura de Archivos**: Al realizar la migración a TS, se debe mover el código a la carpeta `src/`. Separar responsabilidades: `src/ui/` (componentes y eventos del DOM), `src/lib/` (utilidades puras como `supabase.ts`).
- **Convenciones de Nombres**: Archivos en `kebab-case` (ej. `fetch-geojson.ts`), funciones y variables en `camelCase` (ej. `initCheckoutFlow`), y constantes globales o variables de entorno en `UPPER_SNAKE_CASE` (ej. `VITE_SUPABASE_ANON_KEY`).
- **Comentarios Requeridos**: Usar sintaxis TSDoc para explicar la lógica matemática de negocio o condiciones complejas (el *por qué* se tomó una decisión, no el *qué* hace el código).

### Development Workflow Rules

- **Commits y Ramas**: Seguir el estándar de Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
- **Despliegue Seguro**: El proyecto se compila y despliega en Cloudflare Pages vía `npm run deploy`. **Crítico**: Los agentes tienen prohibido ejecutar despliegues a producción sin autorización explícita del usuario.
- **Integración con OpenSpec / BMAD**: Antes de ejecutar tareas complejas (como la migración paulatina a TypeScript), los agentes deben utilizar los flujos de OpenSpec (`/opsx-propose`, `/opsx-explore`) para planificar el cambio y actualizar los artefactos correspondientes (`implementation_plan.md`, `task.md`) en lugar de escribir código a lo loco.

### Critical Don't-Miss Rules

- **Físicas y Rendimiento del DOM**: Fudi Club utiliza cálculos físicos manuales muy ligeros (`requestAnimationFrame`) para la colisión y movimiento de los "stickers". **PROHIBIDO** que un agente intente reescribir esto para usar librerías pesadas (como Matter.js) a menos que se le pida explícitamente.
- **Lógica de Fechas (Edge Case Crítico)**: Las ventas cierran estrictamente los días 5 de cada mes. Los agentes deben tener extremo cuidado al modificar funciones como `calculateCurrentEdition()` para no alterar las asignaciones de cajas mensuales ni el flujo de pre-orders.
- **Pagos y Seguridad**: El backend (Supabase Edge Functions) es la única fuente de la verdad. Los agentes **no deben** confiar únicamente en el cálculo de precios del frontend (JS); cualquier refactor en el frontend debe ir acompañado de una validación idéntica en las Edge Functions para evitar manipulaciones en el checkout.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-06-13
