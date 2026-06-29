export let AVAILABLE_STOCK = 30;
export let isPreorderMode = false;

export function setPreorderMode(value) {
  isPreorderMode = value;
}

export async function fetchStock() {
  try {
    const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'http://127.0.0.1:54321/functions/v1';
    const supabaseUrl = functionsUrl.replace('/functions/v1', '');
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!anonKey) return;
    const res = await fetch(`${supabaseUrl}/rest/v1/orders?select=id`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    if (res.ok) {
      const orders = await res.json();
      AVAILABLE_STOCK = Math.max(0, 30 - orders.length);
    }
  } catch (e) {
    console.error("Error fetching stock dynamically", e);
  }
}
