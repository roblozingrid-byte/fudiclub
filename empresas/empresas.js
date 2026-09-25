// Lógica interactiva para Fudi Club Empresas

export function initEmpresasPage() {
  const form = document.getElementById('corpoForm');
  const successCard = document.getElementById('corpoSuccessCard');
  const waDirectBtn = document.getElementById('waDirectBtn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('corpoNombre')?.value.trim() || '';
      const empresa = document.getElementById('corpoEmpresa')?.value.trim() || '';
      const email = document.getElementById('corpoEmail')?.value.trim() || '';
      const telefono = document.getElementById('corpoTelefono')?.value.trim() || '';
      const ocasion = document.getElementById('corpoOcasion')?.value || 'No especificado';
      const cantidad = document.getElementById('corpoCantidad')?.value || '10-25';
      const entrega = document.getElementById('corpoEntrega')?.value || 'A coordinar';
      const detalles = document.getElementById('corpoDetalles')?.value.trim() || 'Sin detalles adicionales';

      const mensaje = `¡Hola Fudi Club! 🏢 Quiero cotizar Boxes para mi empresa:\n\n` +
        `• *Empresa:* ${empresa}\n` +
        `• *Contacto:* ${nombre}\n` +
        `• *Email:* ${email}\n` +
        `• *Teléfono:* ${telefono}\n` +
        `• *Ocasión:* ${ocasion}\n` +
        `• *Cantidad estimada:* ${cantidad} boxes\n` +
        `• *Modalidad de entrega:* ${entrega}\n` +
        `• *Detalles / Fecha estimada:* ${detalles}\n\n` +
        `¡Quedo a la espera de su propuesta y opciones disponibles!`;

      const encodedMessage = encodeURIComponent(mensaje);
      const waUrl = `https://wa.me/5491139264426?text=${encodedMessage}`;

      // Mostrar confirmación en pantalla
      form.style.display = 'none';
      if (successCard) {
        successCard.style.display = 'block';
        successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (waDirectBtn) {
        waDirectBtn.href = waUrl;
      }

      // Abrir WhatsApp en nueva pestaña
      window.open(waUrl, '_blank');
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        faqItems.forEach(otherItem => {
          if (otherItem !== item) otherItem.classList.remove('active');
        });
        item.classList.toggle('active');
      });
    }
  });

  // Smooth scroll offset for #cotizacion links
  const quoteLinks = document.querySelectorAll('a[href="#cotizacion"]');
  quoteLinks.forEach(link => {
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
