import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import posthog from 'posthog-js';
import * as apiModule from '../src/api.js';
import {
  calculateCurrentEdition,
  updateStockWidget,
  updateCheckoutTotals,
  initCheckoutFlow,
  setupFormValidationMessages,
  updateMonthlyUrgencyAlerts
} from '../src/checkout.js';

describe('src/checkout.js', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateCurrentEdition', () => {
    it('returns current month if day <= 5 and preorder is false and stock > 0', () => {
      // April 3rd
      vi.setSystemTime(new Date(2026, 3, 3)); // 3 = April
      apiModule.setPreorderMode(false);
      expect(calculateCurrentEdition()).toBe('Abril');
    });

    it('returns next month if day > 5', () => {
      // April 6th
      vi.setSystemTime(new Date(2026, 3, 6));
      expect(calculateCurrentEdition()).toBe('Mayo');
    });

    it('returns next month if preorder mode is active', () => {
      // April 2nd with preorder mode
      vi.setSystemTime(new Date(2026, 3, 2));
      apiModule.setPreorderMode(true);
      expect(calculateCurrentEdition()).toBe('Mayo');
      apiModule.setPreorderMode(false);
    });

    it('wraps around to Enero in December when day > 5', () => {
      // December 10th
      vi.setSystemTime(new Date(2026, 11, 10)); // 11 = December
      expect(calculateCurrentEdition()).toBe('Enero');
    });
  });

  describe('updateStockWidget', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="stock-widget-floating">
          <span class="stock-number"></span>
          <span class="stock-text"></span>
        </div>
        <span id="preorder-month"></span>
      `;
    });

    it('displays sold out state when stock is 0', () => {
      // Force stock to 0 via mock
      vi.spyOn(apiModule, 'AVAILABLE_STOCK', 'get').mockReturnValue(0);
      vi.setSystemTime(new Date(2026, 4, 1)); // Mayo

      updateStockWidget();

      const widget = document.querySelector('.stock-widget-floating');
      const num = document.querySelector('.stock-number');
      const text = document.querySelector('.stock-text');
      const preorderMonth = document.getElementById('preorder-month');

      expect(widget.classList.contains('sold-out')).toBe(true);
      expect(num.innerText).toBe('');
      expect(text.innerHTML).toContain('¡Edición<br>Agotada!');
      expect(preorderMonth.innerText).toBe('Junio');
    });

    it('displays available stock and current month when stock is <= 15', () => {
      vi.spyOn(apiModule, 'AVAILABLE_STOCK', 'get').mockReturnValue(15);
      vi.setSystemTime(new Date(2026, 4, 2)); // Mayo 2 (day <= 5)

      updateStockWidget();

      const widget = document.querySelector('.stock-widget-floating');
      const num = document.querySelector('.stock-number');
      const text = document.querySelector('.stock-text');

      expect(widget.style.display).toBe('flex');
      expect(widget.classList.contains('sold-out')).toBe(false);
      expect(num.innerText).toBe('15');
      expect(text.innerHTML).toContain('Boxes disponibles');
      expect(text.innerHTML).toContain('Mayo');
    });

    it('hides stock widget when available stock is greater than 15', () => {
      vi.spyOn(apiModule, 'AVAILABLE_STOCK', 'get').mockReturnValue(28);
      vi.setSystemTime(new Date(2026, 4, 2));

      updateStockWidget();

      const widget = document.querySelector('.stock-widget-floating');
      expect(widget.style.display).toBe('none');
    });
  });

  describe('updateCheckoutTotals', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="paymentForm">
          <input type="radio" name="plan" value="monthly" checked />
          <input type="radio" name="plan" value="quarterly" />
          <span id="qty-display">1</span>
          <input id="cpInput" value="1425" />
          <span id="summary-subtotal-label"></span>
          <span id="summary-subtotal"></span>
          <span id="summary-delivery-label"></span>
          <span id="summary-delivery"></span>
          <span id="summary-total"></span>
          <span id="transfer-amount"></span>
          <span id="current-edition-display"></span>
          <button type="submit">Comprar</button>
        </form>
      `;
      vi.setSystemTime(new Date(2026, 3, 2)); // Abril 2
      apiModule.setPreorderMode(false);
    });

    it('calculates totals for monthly plan with valid CABA CP', () => {
      updateCheckoutTotals();

      expect(document.getElementById('summary-subtotal').innerText).toBe('$44.900');
      expect(document.getElementById('summary-delivery').innerText).toBe('¡Gratis!');
      expect(document.getElementById('summary-total').innerText).toBe('$44.900');
      expect(document.getElementById('summary-subtotal-label').innerText).toContain('1 Mystery Box');
      expect(document.getElementById('current-edition-display').innerText).toBe('Abril');
      expect(document.querySelector('#paymentForm button[type="submit"]').disabled).toBe(false);
    });

    it('calculates totals for quarterly plan and updates edition display for 3 months', () => {
      const quarterlyRadio = document.querySelector('input[value="quarterly"]');
      quarterlyRadio.checked = true;
      document.querySelector('input[value="monthly"]').checked = false;

      updateCheckoutTotals();

      expect(document.getElementById('summary-subtotal').innerText).toBe('$127.900');
      expect(document.getElementById('summary-delivery').innerText).toBe('¡Gratis!');
      expect(document.getElementById('summary-total').innerText).toBe('$127.900');
      expect(document.getElementById('summary-subtotal-label').innerText).toContain('Trimestral = 3 Boxes');
      expect(document.getElementById('current-edition-display').innerText).toBe('Abr, May y Jun');
    });

    it('multiplies price by quantity', () => {
      document.getElementById('qty-display').textContent = '2';

      updateCheckoutTotals();

      // Monthly 44,900 * 2 = 89,800
      expect(document.getElementById('summary-subtotal').innerText).toBe('$89.800');
      expect(document.getElementById('summary-total').innerText).toBe('$89.800');
      expect(document.getElementById('summary-subtotal-label').innerText).toContain('2 Mystery Boxes');
    });

    it('disables submit button and shows error text when postal code is outside CABA/GBA', () => {
      document.getElementById('cpInput').value = '5000'; // Córdoba (outside 1000-1900)

      updateCheckoutTotals();

      const deliveryEl = document.getElementById('summary-delivery');
      const submitBtn = document.querySelector('#paymentForm button[type="submit"]');

      expect(deliveryEl.innerText).toBe('Fuera de zona (solo CABA/GBA)');
      expect(deliveryEl.style.color).toBe('red');
      expect(submitBtn.disabled).toBe(true);
      expect(submitBtn.style.opacity).toBe('0.5');
    });
  });

  describe('initCheckoutFlow', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="cta-join-wrapper">
          <input id="preEmailInput" type="email" />
          <button id="btn-join-club" disabled>Unite</button>
        </div>
        <div id="expandedCheckout">
          <form id="paymentForm">
            <div class="plan-card selected">
              <input type="radio" name="plan" value="monthly" checked />
            </div>
            <div class="plan-card">
              <input type="radio" name="plan" value="quarterly" />
            </div>
            
            <button id="btn-qty-minus">-</button>
            <span id="qty-display">1</span>
            <button id="btn-qty-plus">+</button>

            <input id="emailInput" type="email" />
            <input id="nameInput" placeholder="Nombre completo" value="Juan Perez" />
            <div id="nameError" class="email-error-hint"></div>
            <input id="addressInput" value="Av Santa Fe 1234" />
            <div id="addressError" class="email-error-hint"></div>
            <input id="apartmentInput" />
            <input id="cpInput" value="1425" />

            <input type="checkbox" id="allergyToggle" />
            <div id="allergyDetails" style="display: none;">
              <span class="checkout-subtitle-inline" style="display: none;"></span>
              <input name="allergyInfo" disabled value="Mani" />
              <input type="checkbox" id="allergyConsent" disabled />
            </div>

            <div class="plan-card selected">
              <input type="radio" name="payment_method" value="mercado_pago" checked />
            </div>
            <div class="plan-card">
              <input type="radio" name="payment_method" value="transfer" />
            </div>

            <span id="summary-subtotal"></span>
            <span id="summary-delivery"></span>
            <span id="summary-total"></span>

            <button type="submit">Pagar Ahora</button>
          </form>
          <div id="sold-out-options" style="display: none;">
            <span id="sold-out-title"></span>
            <span id="sold-out-desc"></span>
            <span id="preorder-month"></span>
            <button id="btn-preorder">Preordenar</button>
          </div>
        </div>
        <div id="out-of-zone-modal" style="display: none; opacity: 0;">
          <div class="modal-content">
            <button id="close-zone-modal">Cerrar</button>
          </div>
        </div>
        <div id="success-modal" style="display: none;">
          <h2 id="success-title"></h2>
          <p id="success-message"></p>
          <div id="transfer-details" style="display: none;"></div>
          <div id="transfer-instructions" style="display: none;"></div>
        </div>
      `;
      vi.setSystemTime(new Date(2026, 3, 2)); // Abril 2
      apiModule.setPreorderMode(false);
    });

    it('enables join button on valid pre-email input and saves to localStorage', () => {
      initCheckoutFlow();

      const preEmailInput = document.getElementById('preEmailInput');
      const btnJoin = document.getElementById('btn-join-club');

      preEmailInput.value = 'usuario@ejemplo.com';
      preEmailInput.dispatchEvent(new Event('input'));

      expect(btnJoin.disabled).toBe(false);
      expect(localStorage.getItem('fudiclub_prereg_email')).toBe('usuario@ejemplo.com');
    });

    it('handles join club click: captures posthog, shows expanded checkout, prefills email', async () => {
      initCheckoutFlow();

      const preEmailInput = document.getElementById('preEmailInput');
      const btnJoin = document.getElementById('btn-join-club');
      const emailInput = document.getElementById('emailInput');
      const expandedCheckout = document.getElementById('expandedCheckout');

      preEmailInput.value = 'test@fudiclub.com';
      btnJoin.disabled = false;

      btnJoin.click();

      expect(posthog.capture).toHaveBeenCalledWith('checkout_started');

      // Fast-forward animation timeout (300ms)
      vi.advanceTimersByTime(350);

      expect(expandedCheckout.classList.contains('active')).toBe(true);
      expect(emailInput.value).toBe('test@fudiclub.com');
    });

    it('controls quantity increment and decrement within bounds [1, 3]', () => {
      initCheckoutFlow();

      const btnMinus = document.getElementById('btn-qty-minus');
      const btnPlus = document.getElementById('btn-qty-plus');
      const qtyDisplay = document.getElementById('qty-display');

      expect(qtyDisplay.textContent).toBe('1');

      // Decrement below 1 should be ignored
      btnMinus.click();
      expect(qtyDisplay.textContent).toBe('1');

      // Increment to 2
      btnPlus.click();
      expect(qtyDisplay.textContent).toBe('2');

      // Increment to 3
      btnPlus.click();
      expect(qtyDisplay.textContent).toBe('3');

      // Increment beyond 3 should be ignored
      btnPlus.click();
      expect(qtyDisplay.textContent).toBe('3');

      // Decrement back to 2
      btnMinus.click();
      expect(qtyDisplay.textContent).toBe('2');
    });

    it('toggles allergy details inputs on allergy checkbox change', () => {
      initCheckoutFlow();

      const allergyToggle = document.getElementById('allergyToggle');
      const allergyDetails = document.getElementById('allergyDetails');
      const allergyInfo = document.querySelector('input[name="allergyInfo"]');
      const allergyConsent = document.getElementById('allergyConsent');

      allergyToggle.checked = true;
      allergyToggle.dispatchEvent(new Event('change'));

      expect(allergyDetails.style.display).toBe('block');
      expect(allergyInfo.disabled).toBe(false);
      expect(allergyConsent.disabled).toBe(false);

      allergyToggle.checked = false;
      allergyToggle.dispatchEvent(new Event('change'));

      expect(allergyDetails.style.display).toBe('none');
      expect(allergyInfo.disabled).toBe(true);
      expect(allergyConsent.disabled).toBe(true);
    });

    it('blocks submission if allergy is checked but allergyConsent is not checked', () => {
      initCheckoutFlow();

      const allergyToggle = document.getElementById('allergyToggle');
      const allergyConsent = document.getElementById('allergyConsent');
      const paymentForm = document.getElementById('paymentForm');

      allergyToggle.checked = true;
      allergyConsent.checked = false;

      const submitEvent = new Event('submit', { cancelable: true });
      paymentForm.dispatchEvent(submitEvent);

      const allergyDetails = document.getElementById('allergyDetails');
      expect(allergyDetails.classList.contains('error-pulse')).toBe(true);
    });

    it('switches to preorder mode on btn-preorder click', () => {
      initCheckoutFlow();

      const btnPreorder = document.getElementById('btn-preorder');
      const soldOutOptions = document.getElementById('sold-out-options');
      const paymentForm = document.getElementById('paymentForm');

      btnPreorder.click();

      expect(apiModule.isPreorderMode).toBe(true);
      expect(soldOutOptions.style.display).toBe('none');
      expect(paymentForm.style.display).toBe('block');
    });

    it('detects invalid postal code on blur, tracks posthog, and opens modal', () => {
      initCheckoutFlow();

      const cpInput = document.getElementById('cpInput');
      const modal = document.getElementById('out-of-zone-modal');

      cpInput.value = '2000'; // Rosario (out of CABA/GBA)
      cpInput.dispatchEvent(new Event('blur'));

      expect(posthog.capture).toHaveBeenCalledWith('zone_validation', {
        zipCode: '2000',
        isValid: false,
        email: ''
      });

      expect(modal.style.display).toBe('flex');
    });

    it('closes out of zone modal when close button is clicked', () => {
      initCheckoutFlow();

      const modal = document.getElementById('out-of-zone-modal');
      const closeBtn = document.getElementById('close-zone-modal');
      modal.style.display = 'flex';

      closeBtn.click();
      vi.advanceTimersByTime(350);

      expect(modal.style.display).toBe('none');
    });

    it('processes transfer order successfully and displays transfer details', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, order_id: 'ord-123' })
      });

      initCheckoutFlow();

      const transferRadio = document.querySelector('input[name="payment_method"][value="transfer"]');
      transferRadio.checked = true;

      const paymentForm = document.getElementById('paymentForm');
      paymentForm.dispatchEvent(new Event('submit', { cancelable: true }));

      const submitBtn = paymentForm.querySelector('button[type="submit"]');
      expect(submitBtn.innerText).toBe('Procesando...');

      // Fast-forward any timers / await promises
      await vi.waitFor(() => {
        const successModal = document.getElementById('success-modal');
        expect(successModal.style.display).toBe('block');
      });

      const successTitle = document.getElementById('success-title');
      const transferDetails = document.getElementById('transfer-details');

      expect(successTitle.innerText).toContain('¡Reserva confirmada!');
      expect(transferDetails.style.display).toBe('block');
    });

    it('handles Mercado Pago checkout by setting location or showing modal', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, init_point: 'https://mercadopago.com/checkout/123' })
      });

      initCheckoutFlow();

      const mpRadio = document.querySelector('input[name="payment_method"][value="mercado_pago"]');
      mpRadio.checked = true;

      const paymentForm = document.getElementById('paymentForm');
      paymentForm.dispatchEvent(new Event('submit', { cancelable: true }));

      await vi.waitFor(() => {
        const successModal = document.getElementById('success-modal');
        expect(successModal.style.display).toBe('block');
      });

      const successMsg = document.getElementById('success-message');
      expect(successMsg.innerText).toContain('Mercado Pago');
    });

    it('restores submit button and alerts user if checkout API call fails', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection failure'));

      initCheckoutFlow();

      const paymentForm = document.getElementById('paymentForm');
      paymentForm.dispatchEvent(new Event('submit', { cancelable: true }));

      await vi.waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Ocurrió un error al procesar tu pedido. Intentá nuevamente.');
      });

      const submitBtn = paymentForm.querySelector('button[type="submit"]');
      expect(submitBtn.disabled).toBe(false);
      expect(submitBtn.innerText).toBe('Pagar Ahora');
    });

    it('shows typo suggestion when typing misspelled domain and corrects on button click', () => {
      const preEmailInput = document.getElementById('preEmailInput');
      const suggestionBox = document.createElement('div');
      suggestionBox.id = 'preEmailSuggestion';
      preEmailInput.after(suggestionBox);

      initCheckoutFlow();

      preEmailInput.value = 'juan@gnail.com';
      preEmailInput.dispatchEvent(new Event('input'));

      expect(suggestionBox.classList.contains('active')).toBe(true);
      expect(suggestionBox.innerHTML).toContain('juan@gmail.com');

      const btn = suggestionBox.querySelector('.email-suggestion-btn');
      expect(btn).not.toBeNull();
      btn.click();

      expect(preEmailInput.value).toBe('juan@gmail.com');
      expect(suggestionBox.classList.contains('active')).toBe(false);
    });

    it('rejects disposable email and shows error hint in pre-registration', () => {
      const preEmailInput = document.getElementById('preEmailInput');
      const errorBox = document.createElement('div');
      errorBox.id = 'preEmailError';
      preEmailInput.after(errorBox);
      const btnJoin = document.getElementById('btn-join-club');

      initCheckoutFlow();

      preEmailInput.value = 'test@mailinator.com';
      preEmailInput.dispatchEvent(new Event('input'));

      expect(btnJoin.disabled).toBe(true);
      expect(errorBox.classList.contains('active')).toBe(true);
      expect(errorBox.textContent).toContain('No se permiten correos temporales');
    });

    it('blocks checkout submission and alerts user if disposable email is entered', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      initCheckoutFlow();

      const emailInput = document.getElementById('emailInput');
      emailInput.value = 'spam@tempmail.com';

      const paymentForm = document.getElementById('paymentForm');
      paymentForm.dispatchEvent(new Event('submit', { cancelable: true }));

      expect(alertSpy).toHaveBeenCalledWith('No se permiten correos temporales. Por favor ingresá un email válido.');
      const submitBtn = paymentForm.querySelector('button[type="submit"]');
      expect(submitBtn.disabled).toBe(false);
    });

    it('identifies user and captures transfer_details_viewed and whatsapp_receipt_clicked on transfer checkout', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, orderId: 'FUDI-09-TEST' })
      });

      const btnWhatsapp = document.createElement('a');
      btnWhatsapp.id = 'btn-whatsapp-proof';
      document.body.appendChild(btnWhatsapp);

      initCheckoutFlow();

      const transferRadio = document.querySelector('input[name="payment_method"][value="transfer"]');
      if (transferRadio) transferRadio.checked = true;

      const emailInput = document.getElementById('emailInput');
      emailInput.value = 'cliente@fudiclub.com';

      const paymentForm = document.getElementById('paymentForm');
      paymentForm.dispatchEvent(new Event('submit', { cancelable: true }));

      await vi.waitFor(() => {
        expect(posthog.identify).toHaveBeenCalledWith('cliente@fudiclub.com', expect.objectContaining({
          email: 'cliente@fudiclub.com',
          payment_method: 'transfer'
        }));
        expect(posthog.capture).toHaveBeenCalledWith('transfer_details_viewed', expect.objectContaining({
          order_id: 'FUDI-09-TEST'
        }));
      });

      expect(btnWhatsapp.href).toContain('FUDI-09-TEST');
      btnWhatsapp.click();
      expect(posthog.capture).toHaveBeenCalledWith('whatsapp_receipt_clicked', expect.objectContaining({
        order_id: 'FUDI-09-TEST'
      }));
    });

    it('shows address error on blur when street number is missing, and clears when fixed', () => {
      initCheckoutFlow();

      const addressInput = document.getElementById('addressInput');
      const addressError = document.getElementById('addressError');

      addressInput.value = 'Av Corrientes';
      addressInput.dispatchEvent(new Event('blur'));

      expect(addressError.classList.contains('active')).toBe(true);
      expect(addressError.textContent).toContain('Falta el número o altura');

      addressInput.value = 'Av Corrientes 1500';
      addressInput.dispatchEvent(new Event('input'));
      expect(addressError.classList.contains('active')).toBe(false);
    });

    it('blocks checkout submission and alerts user if address has no number', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      initCheckoutFlow();

      const addressInput = document.getElementById('addressInput');
      addressInput.value = 'Calle San Martin';

      const paymentForm = document.getElementById('paymentForm');
      paymentForm.dispatchEvent(new Event('submit', { cancelable: true }));

      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Falta el número o altura'));
      const submitBtn = paymentForm.querySelector('button[type="submit"]');
      expect(submitBtn.disabled).toBe(false);
    });

    it('appends apartment to address payload when provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, order_id: 'ord-apt-test' })
      });

      initCheckoutFlow();

      const addressInput = document.getElementById('addressInput');
      const apartmentInput = document.getElementById('apartmentInput');
      const emailInput = document.getElementById('emailInput');

      emailInput.value = 'depto@test.com';
      addressInput.value = 'Av. Santa Fe 1234';
      apartmentInput.value = 'Piso 4 Depto B';

      const paymentForm = document.getElementById('paymentForm');
      paymentForm.dispatchEvent(new Event('submit', { cancelable: true }));

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/create-order'),
          expect.objectContaining({
            body: expect.stringContaining('"address":"Av. Santa Fe 1234, Piso 4 Depto B"')
          })
        );
      });
    });

    it('shows name error on blur when surname is missing, and clears when fixed', () => {
      initCheckoutFlow();

      const nameInput = document.getElementById('nameInput');
      const nameError = document.getElementById('nameError');

      nameInput.value = 'Juan';
      nameInput.dispatchEvent(new Event('blur'));

      expect(nameError.classList.contains('active')).toBe(true);
      expect(nameError.textContent).toContain('nombre y apellido');

      nameInput.value = 'Juan Perez';
      nameInput.dispatchEvent(new Event('input'));
      expect(nameError.classList.contains('active')).toBe(false);
    });

    it('blocks checkout submission and alerts user if name has no surname', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      initCheckoutFlow();

      const nameInput = document.getElementById('nameInput');
      nameInput.value = 'Carlos';

      const paymentForm = document.getElementById('paymentForm');
      paymentForm.dispatchEvent(new Event('submit', { cancelable: true }));

      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('nombre y apellido'));
      const submitBtn = paymentForm.querySelector('button[type="submit"]');
      expect(submitBtn.disabled).toBe(false);
    });
  });

  describe('setupFormValidationMessages', () => {
    it('sets Spanish validation messages on invalid event and clears on input', () => {
      document.body.innerHTML = `
        <form id="testForm">
          <input type="text" id="nameInput" required />
          <input type="text" id="addressInput" required />
          <input type="text" id="cpInput" required />
          <input type="email" id="emailInput" required />
          <input type="text" id="genericInput" required />
        </form>
      `;
      const form = document.getElementById('testForm');
      setupFormValidationMessages(form);

      const nameInput = document.getElementById('nameInput');
      const addressInput = document.getElementById('addressInput');
      const cpInput = document.getElementById('cpInput');
      const emailInput = document.getElementById('emailInput');
      const genericInput = document.getElementById('genericInput');

      nameInput.dispatchEvent(new Event('invalid'));
      expect(nameInput.validationMessage).toBe('Por favor ingresá tu nombre y apellido.');

      addressInput.dispatchEvent(new Event('invalid'));
      expect(addressInput.validationMessage).toBe('Por favor ingresá tu dirección (calle y altura).');

      cpInput.dispatchEvent(new Event('invalid'));
      expect(cpInput.validationMessage).toBe('Por favor ingresá tu código postal.');

      emailInput.dispatchEvent(new Event('invalid'));
      expect(emailInput.validationMessage).toBe('Por favor ingresá tu correo electrónico.');

      genericInput.dispatchEvent(new Event('invalid'));
      expect(genericInput.validationMessage).toBe('Por favor completá este campo.');

      nameInput.value = 'Juan Perez';
      nameInput.dispatchEvent(new Event('input'));
      expect(nameInput.validationMessage).toBe('');
    });
  });

  describe('direct 1-page checkout without pre-registration wrapper', () => {
    beforeEach(() => {
      localStorage.clear();
      document.body.innerHTML = `
        <div id="expandedCheckout" class="checkout-expanded-card">
          <div id="sold-out-options" style="display: none;">
            <h3 id="sold-out-title"></h3>
            <p id="sold-out-desc"></p>
            <span id="preorder-month"></span>
            <button id="btn-preorder">Preordenar</button>
          </div>
          <form id="paymentForm" class="payment-form">
            <input type="radio" name="plan" value="one-time" checked />
            <input id="emailInput" type="email" />
            <div id="emailSuggestion" class="email-suggestion-box"></div>
            <div id="emailError" class="email-error-hint"></div>
            <input id="nameInput" value="Maria Gonzalez" />
            <input id="addressInput" value="Palermo 500" />
            <input id="cpInput" value="1425" />
            <input type="radio" name="payment_method" value="mercado_pago" checked />
            <button type="submit">Confirmar pedido</button>
          </form>
        </div>
      `;
      vi.setSystemTime(new Date(2026, 3, 2)); // Abril 2 (open sale window)
      apiModule.setPreorderMode(false);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });
    });

    it('initializes direct checkout cleanly with active class and visible paymentForm', () => {
      initCheckoutFlow();

      const expandedCheckout = document.getElementById('expandedCheckout');
      const paymentForm = document.getElementById('paymentForm');
      const soldOut = document.getElementById('sold-out-options');

      expect(expandedCheckout.classList.contains('active')).toBe(true);
      expect(paymentForm.style.display).toBe('block');
      expect(soldOut.style.display).toBe('none');
    });

    it('captures checkout_started on paymentForm focusin', () => {
      initCheckoutFlow();

      const paymentForm = document.getElementById('paymentForm');
      paymentForm.dispatchEvent(new Event('focusin', { bubbles: true }));

      expect(posthog.capture).toHaveBeenCalledWith('checkout_started');
    });

    it('auto-captures lead to waitlist and localStorage on emailInput blur', () => {
      initCheckoutFlow();

      const emailInput = document.getElementById('emailInput');
      emailInput.value = 'prospecto@gmail.com';
      emailInput.dispatchEvent(new Event('blur'));

      expect(localStorage.getItem('fudiclub_prereg_email')).toBe('prospecto@gmail.com');
      expect(posthog.identify).toHaveBeenCalledWith('prospecto@gmail.com', { email: 'prospecto@gmail.com' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/join-waitlist'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'prospecto@gmail.com', note: 'Interesado (Checkout directo)' })
        })
      );
    });

    it('pre-fills emailInput from localStorage if previously stored', () => {
      localStorage.setItem('fudiclub_prereg_email', 'guardado@gmail.com');

      initCheckoutFlow();

      const emailInput = document.getElementById('emailInput');
      expect(emailInput.value).toBe('guardado@gmail.com');
    });

    it('immediately shows soldOutOptions on load if sale window is closed (day 6-15)', () => {
      vi.setSystemTime(new Date(2026, 3, 10)); // Abril 10 -> closed window

      initCheckoutFlow();

      const paymentForm = document.getElementById('paymentForm');
      const soldOut = document.getElementById('sold-out-options');

      expect(paymentForm.style.display).toBe('none');
      expect(soldOut.style.display).toBe('block');
    });
  });

  describe('updateMonthlyUrgencyAlerts', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="ticker">
          <div class="ticker-content">
            <span>DEFAULT</span>
            <span>DEFAULT</span>
          </div>
        </div>
        <div class="hero-deadline-badge" id="hero-deadline-badge" style="display: none;"></div>
        <div class="checkout-deadline-alert" id="checkout-deadline-alert" style="display: none;">
          <strong class="deadline-alert-title"></strong>
          <p class="deadline-alert-desc"></p>
        </div>
      `;
    });

    it('activates and shows urgency notices on days 1 to 5 with correct weekday and dates', () => {
      // 2 de Octubre de 2026 (El 5 de octubre 2026 fue Lunes)
      vi.setSystemTime(new Date(2026, 9, 2)); // 9 = Octubre

      updateMonthlyUrgencyAlerts();

      const tickerContent = document.querySelector('.ticker-content');
      const heroBadge = document.getElementById('hero-deadline-badge');
      const checkoutAlert = document.getElementById('checkout-deadline-alert');
      const titleEl = checkoutAlert.querySelector('.deadline-alert-title');
      const descEl = checkoutAlert.querySelector('.deadline-alert-desc');

      expect(tickerContent.textContent).toContain('CIERRE DE LA BOX DE OCTUBRE: LUNES 5/10 A LAS 23:59');
      expect(heroBadge.style.display).toBe('inline-flex');
      expect(heroBadge.textContent).toBe('🔥 ÚLTIMOS DÍAS · CIERRA EL LUNES 5/10');
      expect(checkoutAlert.style.display).toBe('flex');
      expect(titleEl.textContent).toBe('Box de Octubre: Cierra el Lunes 5 de Octubre (23:59 hs)');
      expect(descEl.textContent).toContain('edición de Noviembre');
    });

    it('works on day 5 of the month (last day of sales)', () => {
      // 5 de Noviembre de 2026 (El 5 de noviembre 2026 fue Jueves)
      vi.setSystemTime(new Date(2026, 10, 5)); // 10 = Noviembre

      updateMonthlyUrgencyAlerts();

      const tickerContent = document.querySelector('.ticker-content');
      const heroBadge = document.getElementById('hero-deadline-badge');
      const checkoutAlert = document.getElementById('checkout-deadline-alert');
      const titleEl = checkoutAlert.querySelector('.deadline-alert-title');

      expect(tickerContent.textContent).toContain('CIERRE DE LA BOX DE NOVIEMBRE: JUEVES 5/11 A LAS 23:59');
      expect(heroBadge.style.display).toBe('inline-flex');
      expect(heroBadge.textContent).toBe('🔥 ÚLTIMOS DÍAS · CIERRA EL JUEVES 5/11');
      expect(checkoutAlert.style.display).toBe('flex');
      expect(titleEl.textContent).toBe('Box de Noviembre: Cierra el Jueves 5 de Noviembre (23:59 hs)');
    });

    it('automatically deactivates and hides all urgency notices on the 6th at midnight', () => {
      // 6 de Octubre de 2026 a las 00:01 hs
      vi.setSystemTime(new Date(2026, 9, 6, 0, 1));

      updateMonthlyUrgencyAlerts();

      const tickerContent = document.querySelector('.ticker-content');
      const heroBadge = document.getElementById('hero-deadline-badge');
      const checkoutAlert = document.getElementById('checkout-deadline-alert');

      expect(tickerContent.textContent).toContain('SORPRESA TOTAL // SOLO 30 BOXES AL MES');
      expect(tickerContent.textContent).not.toContain('CIERRE');
      expect(heroBadge.style.display).toBe('none');
      expect(checkoutAlert.style.display).toBe('none');
    });

    it('remains deactivated on mid-month days (e.g. day 20)', () => {
      vi.setSystemTime(new Date(2026, 9, 20));

      updateMonthlyUrgencyAlerts();

      const heroBadge = document.getElementById('hero-deadline-badge');
      const checkoutAlert = document.getElementById('checkout-deadline-alert');

      expect(heroBadge.style.display).toBe('none');
      expect(checkoutAlert.style.display).toBe('none');
    });
  });
});

