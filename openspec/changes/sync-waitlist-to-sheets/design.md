## Context

Actualmente, Fudi Club utiliza una Edge Function (`sync-to-sheets`) que escucha webhooks de Supabase en las tablas `customers` y `orders` para hacer inserts (appends) en Google Sheets. Se requiere extender esta funcionalidad para la tabla `waitlist`.

## Goals / Non-Goals

**Goals:**
- Sincronizar automáticamente la inserción de nuevos registros de la lista de espera hacia la pestaña `Waitlist (Backup)` de Google Sheets.
- Reutilizar la infraestructura y función existente (`sync-to-sheets`) para mantener el código centralizado.

**Non-Goals:**
- No se sincronizarán registros antiguos de la waitlist de forma retroactiva (solo los nuevos inserts).

## Decisions

1. **Reutilización de Edge Function `sync-to-sheets`**
   - **Rationale**: La función actual ya maneja la autenticación JWT con Google y la lógica base del webhook. Simplemente agregaremos un bloque `else if (table === "waitlist")` para procesar el nuevo tipo de payload.
   - **Why this?**: Evita duplicar el código de autenticación y la gestión de la librería `google-auth-library`.

2. **Columnas de Google Sheets**
   - **Rationale**: El mapeo de columnas para la Waitlist será: `[ID, Email, Fecha de Registro]`. La función leerá el nombre de la pestaña desde la variable de entorno `SHEETS_TAB_WAITLIST`, con un fallback a `"Waitlist (Backup)"`.

## Risks / Trade-offs

- **[Risk] La pestaña no existe en Sheets:** Si el dueño olvida crear la pestaña `Waitlist (Backup)` en el archivo, la API de Google devolverá error y la ejecución de la función fallará.
  - *Mitigation*: Instruir claramente en el archivo de `tasks` que la pestaña debe ser creada antes de activar el webhook.
