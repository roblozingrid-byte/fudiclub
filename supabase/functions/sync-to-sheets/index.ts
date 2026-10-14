import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { JWT } from "npm:google-auth-library";

serve(async (req: Request) => {
  try {
    // 1. Validar que sea un POST (Webhook)
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const payload = await req.json();

    // Validar tipo de operación (INSERT para Supabase webhooks, o corporate_quote directo)
    const isCorporateDirect = payload.type === "corporate_quote";
    if (payload.type !== "INSERT" && !isCorporateDirect) {
      return new Response(JSON.stringify({ message: "Ignored, not an INSERT or corporate_quote" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const table = isCorporateDirect ? "corporate_quotes" : payload.table;
    const record = payload.record || {};

    // 2. Obtener Secretos
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT");
    const spreadsheetId = Deno.env.get("GOOGLE_SPREADSHEET_ID");
    const tabCustomers = Deno.env.get("SHEETS_TAB_CUSTOMERS") || "Clientes (Backup)";
    const tabOrders = Deno.env.get("SHEETS_TAB_ORDERS") || "Pedidos (Backup)";
    const tabLeads = Deno.env.get("SHEETS_TAB_LEADS") || "Leads";
    const tabLeadsEmpresas = Deno.env.get("SHEETS_TAB_LEADS_EMPRESAS") || "Leads Empresas";

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

    // Helper para formatear fechas
    const formatDate = (isoString) => {
      const date = isoString ? new Date(isoString) : new Date();
      return date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires' });
    };

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
          formatDate(record.created_at),
        ],
      ];
    } else if (table === "orders") {
      range = `${tabOrders}!A:L`;
      // Mapeo de columnas para Google Sheets:
      // A: ID Pedido
      // B: Fecha Compra
      // C: Cliente
      // D: Mes Asignado
      // E: Estado Pago
      // F: Método Pago
      // G: Total Cobrado
      // H: Estado Envío
      // I: Tipo de Compra (Plan)
      // J: Cantidad
      // K: Cantidad de Boxes
      // L: Dirección de Envío

      const isQuarterly = record.plan === "quarterly";
      const planLabel = isQuarterly ? "Plan Trimestral" : "Compra Única";
      const totalAmount = record.total ?? record.total_amount ?? 0;
      const unitPrice = isQuarterly ? 127900 : 44900;
      const qty = record.quantity || (totalAmount > 0 ? Math.round(totalAmount / unitPrice) : 1);
      const totalBoxes = record.total_boxes || (qty * (isQuarterly ? 3 : 1));

      const customerDisplay = record.customer_name
        ? (record.customer_email ? `${record.customer_name} (${record.customer_email})` : record.customer_name)
        : (record.customer_email || record.customer_id || "");

      const paymentStatus = record.status || record.payment_status || "pending";
      const paymentStatusDisplay = paymentStatus === "approved" ? "Aprobado" : (paymentStatus === "pending" ? "Pendiente" : paymentStatus);

      const paymentMethodDisplay = record.payment_method === "transfer"
        ? "Transferencia"
        : (record.payment_method === "mercado_pago" ? "Mercado Pago" : (record.payment_method || ""));

      const shippingStatusDisplay = record.shipping_status || "Pendiente";

      // Determinar edición con los 3 meses para suscripción trimestral
      const monthsList = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const rawEdition = record.edition || record.month || "";
      let editionDisplay = rawEdition;
      if (isQuarterly) {
        let baseMonth = "";
        for (const m of monthsList) {
          if (rawEdition.includes(m)) {
            baseMonth = m;
            break;
          }
        }
        if (!baseMonth) {
          const d = record.created_at ? new Date(record.created_at) : new Date();
          let mIdx = d.getMonth();
          if (d.getDate() > 5) mIdx = (mIdx + 1) % 12;
          baseMonth = monthsList[mIdx];
        }
        const bIdx = monthsList.indexOf(baseMonth);
        const m1 = monthsList[bIdx];
        const m2 = monthsList[(bIdx + 1) % 12];
        const m3 = monthsList[(bIdx + 2) % 12];
        editionDisplay = `${m1} - ${m2} - ${m3}`;
      }

      values = [
        [
          record.friendly_id || record.id || "",
          formatDate(record.created_at),
          customerDisplay,
          editionDisplay,
          paymentStatusDisplay,
          paymentMethodDisplay,
          totalAmount,
          shippingStatusDisplay,
          planLabel,
          qty,
          totalBoxes,
          record.shipping_address || "",
        ],
      ];
    } else if (table === "waitlist") {
      range = `${tabLeads}!A:C`;
      values = [
        [
          record.email || "",
          formatDate(record.created_at),
          record.note || "Interesado (Pre-checkout)",
        ],
      ];
    } else if (table === "corporate_quotes") {
      range = `${tabLeadsEmpresas}!A:I`;
      // Columnas:
      // A: Fecha
      // B: Empresa
      // C: Contacto
      // D: Email Corporativo
      // E: Teléfono / WhatsApp
      // F: Motivo / Ocasión
      // G: Cantidad
      // H: Modalidad Entrega
      // I: Detalles / Notas
      values = [
        [
          formatDate(record.created_at),
          record.empresa || "",
          record.nombre || "",
          record.email || "",
          record.telefono || "",
          record.ocasion || "No especificado",
          record.cantidad ? `${record.cantidad} boxes` : "",
          record.entrega || "A coordinar",
          record.detalles || "",
        ],
      ];
    } else {
      return new Response(JSON.stringify({ message: "Table ignored" }), { status: 200 });
    }

    // 5. Enviar a Google Sheets API
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

    let sheetsRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values,
      }),
    });

    let sheetsData = await sheetsRes.json();

    // Si la pestaña no existe aún (error 400 Unable to parse range), crearla automáticamente con su fila de encabezado
    if (!sheetsRes.ok && (sheetsData?.error?.message?.includes("Unable to parse range") || sheetsData?.error?.code === 400)) {
      try {
        const tabName = range.split("!")[0].replace(/'/g, "");
        // 1. Agregar pestaña
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: { title: tabName },
                },
              },
            ],
          }),
        });

        // 2. Insertar encabezados según la pestaña
        let headerRow: string[] = [];
        if (tabName === tabLeadsEmpresas) {
          headerRow = [
            "Fecha",
            "Empresa",
            "Contacto",
            "Email Corporativo",
            "Teléfono / WhatsApp",
            "Motivo / Ocasión",
            "Cantidad",
            "Modalidad Entrega",
            "Detalles / Notas",
          ];
        }

        if (headerRow.length > 0) {
          await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${tabName}!A1`)}?valueInputOption=USER_ENTERED`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ values: [headerRow] }),
          });
        }

        // 3. Reintentar append
        sheetsRes = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values }),
        });
        sheetsData = await sheetsRes.json();
      } catch (createErr) {
        console.error("Error auto-creando pestaña en Google Sheets:", createErr);
      }
    }

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
