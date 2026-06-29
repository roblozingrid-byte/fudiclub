import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { JWT } from "npm:google-auth-library";

serve(async (req: Request) => {
  try {
    // 1. Validar que sea un POST (Webhook)
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const payload = await req.json();

    // Validar tipo de operación (solo INSERT nos interesa para agregar filas)
    if (payload.type !== "INSERT") {
      return new Response(JSON.stringify({ message: "Ignored, not an INSERT" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const table = payload.table;
    const record = payload.record;

    // 2. Obtener Secretos
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT");
    const spreadsheetId = Deno.env.get("GOOGLE_SPREADSHEET_ID");
    const tabCustomers = Deno.env.get("SHEETS_TAB_CUSTOMERS") || "Clientes (Backup)";
    const tabOrders = Deno.env.get("SHEETS_TAB_ORDERS") || "Pedidos (Backup)";

    if (!serviceAccountJson || !spreadsheetId) {
      console.error("Faltan variables de entorno para Google Sheets.");
      return new Response(JSON.stringify({ error: "Server Configuration Error" }), { status: 500 });
    }

    // 3. Autenticación con Google Auth Library
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (e) {
      console.error("El secreto GOOGLE_SERVICE_ACCOUNT no es un JSON válido.");
      return new Response(JSON.stringify({ error: "Invalid Service Account JSON" }), { status: 500 });
    }

    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const accessTokenRes = await client.getAccessToken();
    const token = accessTokenRes.token;

    if (!token) {
      throw new Error("Failed to get Google Access Token");
    }

    // 4. Preparar datos según la tabla
    let range = "";
    let values: any[] = [];

    if (table === "customers") {
      range = `${tabCustomers}!A:G`;
      // Mapeo basado en las columnas definidas en el Excel:
      // ID Cliente, Nombre Completo, Email, WhatsApp, Zona, Alergias, Fecha Registro
      values = [
        [
          record.id || "",
          record.name || record.full_name || "",
          record.email || "",
          record.whatsapp || record.phone || "",
          record.address || record.zone || "",
          record.allergies || record.restrictions || "",
          record.created_at || new Date().toISOString(),
        ],
      ];
    } else if (table === "orders") {
      range = `${tabOrders}!A:I`;
      // Mapeo basado en las columnas definidas en el Excel:
      // ID Pedido, Fecha Compra, Cliente, Mes Asignado, Estado Pago, Método Pago, Total, Estado Envío, Tracking
      values = [
        [
          record.id || "",
          record.created_at || new Date().toISOString(),
          record.customer_id || record.customer_name || "", // Idealmente resolver nombre o dejar ID
          record.edition || record.month || "",
          record.payment_status || "pending",
          record.payment_method || "",
          record.total_amount || 0,
          record.shipping_status || "pending",
          record.tracking_code || "",
        ],
      ];
    } else {
      return new Response(JSON.stringify({ message: "Table ignored" }), { status: 200 });
    }

    // 5. Enviar a Google Sheets API
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

    const sheetsRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values,
      }),
    });

    const sheetsData = await sheetsRes.json();

    if (!sheetsRes.ok) {
      console.error("Google Sheets API Error:", sheetsData);
      return new Response(JSON.stringify({ error: "Failed to sync to Sheets", details: sheetsData }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: "Synced successfully" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Unhandled Error:", error.message);
    return new Response(JSON.stringify({ error: "Internal Server Error", message: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
