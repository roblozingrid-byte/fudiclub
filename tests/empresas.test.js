import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initEmpresasPage, submitCorporateQuote } from '../empresas/empresas.js';

describe('empresas/empresas.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.open = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

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
          <button type="submit" id="corpoSubmitBtn">Solicitar Propuesta</button>
        </form>

        <div id="corpoSuccessCard" style="display: none;">
          <p id="corpoSuccessMsg"></p>
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

  it('submits corporate quote via API and shows success card without WhatsApp redirect', async () => {
    initEmpresasPage();

    const form = document.getElementById('corpoForm');
    const successCard = document.getElementById('corpoSuccessCard');
    const successMsg = document.getElementById('corpoSuccessMsg');

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    // Wait for async handler
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cotizacion',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(callBody.empresa).toBe('Tech Latam SRL');
    expect(callBody.nombre).toBe('Martin Rodriguez');
    expect(callBody.email).toBe('martin@techlatam.com');
    expect(callBody.cantidad).toBe('25 a 50');

    expect(form.style.display).toBe('none');
    expect(successCard.style.display).toBe('block');
    expect(successMsg.innerHTML).toContain('Tech Latam SRL');
    expect(successMsg.innerHTML).toContain('martin@techlatam.com');

    // No WhatsApp redirect should happen
    expect(window.open).not.toHaveBeenCalled();
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
