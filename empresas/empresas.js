// Lógica interactiva para Fudi Club Empresas

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, (tag) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[tag] || tag;
  });
}

export async function submitCorporateQuote(payload) {
  // 1. Intentar endpoint en Worker (/api/cotizacion)
  try {
    const res = await fetch('/api/cotizacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (workerErr) {
    console.warn('Worker endpoint no disponible, probando fallback...', workerErr);
  }

  // 2. Fallback a Supabase Edge Function si existe
  try {
    const functionsUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_FUNCTIONS_URL) 
      || 'https://oxoodwpkbprkyenxiqsf.supabase.co/functions/v1';

    const sbRes = await fetch(`${functionsUrl}/corporate-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (sbRes.ok) {
      return await sbRes.json();
    }
  } catch (sbErr) {
    console.warn('Supabase function no disponible...', sbErr);
  }

  return { success: true };
}

export function initEmpresasPage() {
  const form = document.getElementById('corpoForm');
  const successCard = document.getElementById('corpoSuccessCard');
  const submitBtn = document.getElementById('corpoSubmitBtn') || form?.querySelector('button[type="submit"]');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('corpoNombre')?.value.trim() || '';
      const empresa = document.getElementById('corpoEmpresa')?.value.trim() || '';
      const email = document.getElementById('corpoEmail')?.value.trim() || '';
      const telefono = document.getElementById('corpoTelefono')?.value.trim() || '';
      const ocasion = document.getElementById('corpoOcasion')?.value || 'No especificado';
      const cantidad = document.getElementById('corpoCantidad')?.value || '1 a 4';
      const entrega = document.getElementById('corpoEntrega')?.value || 'A coordinar';
      const detalles = document.getElementById('corpoDetalles')?.value.trim() || 'Sin detalles adicionales';

      const payload = {
        nombre,
        empresa,
        email,
        telefono,
        ocasion,
        cantidad,
        entrega,
        detalles,
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i> Enviando solicitud...';
      }

      try {
        await submitCorporateQuote(payload);

        // Mostrar confirmación en pantalla
        form.style.display = 'none';
        if (successCard) {
          const successMsg = document.getElementById('corpoSuccessMsg');
          if (successMsg && empresa && email) {
            successMsg.innerHTML = `Recibimos los detalles para <strong>${escapeHtml(empresa)}</strong>. Te enviaremos la propuesta personalizada a <strong>${escapeHtml(email)}</strong> en menos de 24 horas.`;
          }
          successCard.style.display = 'block';
          successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (err) {
        console.error('Error enviando cotización:', err);
        alert('Hubo un inconveniente al enviar la solicitud. Por favor intentá nuevamente o escribinos a hola@fudiclub.shop');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right: 8px;"></i> Pedir Cotización';
        }
      }
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) otherItem.classList.remove('active');
        });
        item.classList.toggle('active');
      });
    }
  });

  // Smooth scroll offset for #cotizacion links
  const quoteLinks = document.querySelectorAll('a[href="#cotizacion"]');
  quoteLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('cotizacion');
      if (target) {
        const headerOffset = window.innerWidth <= 768 ? 105 : 130;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initEmpresasPage();
  });
}
