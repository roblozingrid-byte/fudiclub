export let AVAILABLE_STOCK = 30;
export let isPreorderMode = false;

export function setPreorderMode(value) {
  isPreorderMode = value;
}

export async function fetchStock() {
  try {
    const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://oxoodwpkbprkyenxiqsf.supabase.co/functions/v1';

    let res = await fetch(`${functionsUrl}/get-stock`, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!res.ok) {
      res = await fetch(`${functionsUrl}/join-waitlist`, {
        method: 'GET',
        cache: 'no-store'
      });
    }

    if (res.ok) {
      const data = await res.json();
      if (typeof data.stock === 'number') {
        AVAILABLE_STOCK = data.stock;

        // Directly update DOM elements in case widgets are already rendered
        document.querySelectorAll('.stock-number, #stock-number').forEach(el => {
          el.innerText = AVAILABLE_STOCK.toString();
        });

        window.dispatchEvent(new CustomEvent('stockUpdated', { detail: { stock: AVAILABLE_STOCK } }));
      }
    }
  } catch (e) {
    console.error("Error fetching stock dynamically", e);
  }
}
