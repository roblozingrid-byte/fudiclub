# Setup Guide: Supabase to Google Sheets Integration

Esta guía explica cómo conectar Fudi Club (Supabase) con Google Sheets para que los clientes y pedidos se respalden automáticamente.

## Paso 1: Configurar Google Cloud y habilitar la Sheets API
1. Entra a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto llamado `Fudi Club Operaciones`.
3. Ve a "APIs & Services" > "Library" y busca **Google Sheets API**. Haz clic en "Enable".
4. Ve a "APIs & Services" > "Credentials".
5. Haz clic en "Create Credentials" > "Service Account".
6. Nómbrala `fudi-sheets-sync` y presiona "Create and Continue" y luego "Done".
7. En la lista de Service Accounts, copia el "Email" que se acaba de crear (ej: `fudi-sheets-sync@fudi-club...iam.gserviceaccount.com`).
8. Haz clic en esa Service Account, ve a la pestaña "Keys" > "Add Key" > "Create new key" y elige el tipo **JSON**.
9. Esto descargará un archivo `.json` en tu computadora. **NO lo compartas con nadie**.
10. Abre tu archivo operativo en Google Sheets y dale a "Compartir" (Share). Comparte la hoja con el correo electrónico de la Service Account que copiaste en el paso 7, dándole permisos de **Editor**.

## Paso 2: Agregar la llave JSON a los Secrets de Supabase
1. Abre el archivo JSON descargado en un editor de texto y copia TODO su contenido.
2. Entra a tu panel de [Supabase](https://supabase.com/dashboard).
3. Selecciona tu proyecto Fudi Club.
4. Ve a "Settings" (el engranaje) > "Edge Functions" > "Secrets".
5. Añade un nuevo secreto:
   - **Name**: `GOOGLE_SERVICE_ACCOUNT`
   - **Value**: (Pega aquí todo el contenido del archivo JSON)

## Paso 3: Configurar el ID del Spreadsheet y los nombres de las pestañas
Para que la función sepa en qué archivo escribir, necesitas copiar el ID de tu Google Sheet.
1. Mira la URL de tu Google Sheet en el navegador: `https://docs.google.com/spreadsheets/d/AQUI_ESTA_EL_ID_LARGO/edit`
2. Copia la parte que reemplaza a `AQUI_ESTA_EL_ID_LARGO`.
3. En el mismo panel de "Secrets" de Supabase, agrega estos secretos:
   - **Name**: `GOOGLE_SPREADSHEET_ID`
   - **Value**: (El ID largo que copiaste)
   - **Name**: `SHEETS_TAB_CUSTOMERS`
   - **Value**: `Clientes (Backup)`
   - **Name**: `SHEETS_TAB_ORDERS`
   - **Value**: `Pedidos (Backup)`
