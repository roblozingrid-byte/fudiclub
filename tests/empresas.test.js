import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initEmpresasPage } from '../empresas/empresas.js';

describe('empresas/empresas.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.open = vi.fn();

    document.body.innerHTML = `
      <a href="#cotizacion" class="quote-link">Cotizar</a>
      <div id="cotizacion" style="margin-top: 500px;">
        <form id="corpoForm">
          <input id="corpoNombre" value="Martin Rodriguez" />
          <input id="corpoEmpresa" value="Tech Latam SRL" />
          <input id="corpoEmail" value="martin@techlatam.com" />
          <input id="corpoTelefono" value="+54 11 5555 4321" />
          <select id="corpoOcasion">
            <option value="Welcome Kit / Onboarding" selected>Welcome Kit</option>
          </select>
          <select id="corpoCantidad">
            <option value="25 a 50" selected>25 a 50</option>
          </select>
          <select id="corpoEntrega">
            <option value="Envíos individuales a casas de empleados" selected>Envíos individuales</option>
          </select>
          <textarea id="corpoDetalles">Entregar primera semana de mayo con sticker con logo</textarea>
          <button type="submit">Solicitar Propuesta</button>
        </form>

        <div id="corpoSuccessCard" style="display: none;">
          <a id="waDirectBtn" href="#">Abrir WhatsApp</a>
        </div>
      </div>

      <div class="faq-item" id="corpo-faq-1">
        <button class="faq-question">¿Hacen Factura A o C?</button>
        <div class="faq-answer">Hacemos Factura C.</div>
      </div>
      <div class="faq-item" id="corpo-faq-2">
        <button class="faq-question">¿Cuál es el pedido mínimo?</button>
        <div class="faq-answer">10 unidades.</div>
      </div>
    `;
  });

  it('formats corporate quote details and generates WhatsApp redirection on submit', () => {
    initEmpresasPage();

    const form = document.getElementById('corpoForm');
    const successCard = document.getElementById('corpoSuccessCard');
    const waDirectBtn = document.getElementById('waDirectBtn');

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(form.style.display).toBe('none');
    expect(successCard.style.display).toBe('block');

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/5491139264426?text='),
      '_blank'
    );

    const generatedUrl = window.open.mock.calls[0][0];
    const decodedUrl = decodeURIComponent(generatedUrl);

    expect(decodedUrl).toContain('Tech Latam SRL');
    expect(decodedUrl).toContain('Martin Rodriguez');
    expect(decodedUrl).toContain('martin@techlatam.com');
    expect(decodedUrl).toContain('Welcome Kit / Onboarding');
    expect(decodedUrl).toContain('25 a 50 boxes');
    expect(decodedUrl).toContain('Envíos individuales a casas de empleados');
    expect(decodedUrl).toContain('Entregar primera semana de mayo');

    expect(waDirectBtn.href).toBe(generatedUrl);
  });

  it('handles FAQ accordion toggling on corporate page', () => {
    initEmpresasPage();

    const faq1 = document.getElementById('corpo-faq-1');
    const faq2 = document.getElementById('corpo-faq-2');
    const q1 = faq1.querySelector('.faq-question');
    const q2 = faq2.querySelector('.faq-question');

    q1.click();
    expect(faq1.classList.contains('active')).toBe(true);
    expect(faq2.classList.contains('active')).toBe(false);

    q2.click();
    expect(faq1.classList.contains('active')).toBe(false);
    expect(faq2.classList.contains('active')).toBe(true);
  });

  it('smoothly scrolls to #cotizacion section when clicking quote links', () => {
    initEmpresasPage();

    const link = document.querySelector('a[href="#cotizacion"]');
    link.click();

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' })
    );
  });
});
