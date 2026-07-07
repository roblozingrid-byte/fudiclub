import { AVAILABLE_STOCK, isPreorderMode, setPreorderMode } from './api.js';
import posthog from 'posthog-js';

export function calculateCurrentEdition() {
  const now = new Date();
  let monthIndex = now.getMonth();
  const day = now.getDate();

  if (day > 5 || isPreorderMode || AVAILABLE_STOCK <= 0) {
    monthIndex = (monthIndex + 1) % 12;
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return `Edición ${months[monthIndex]}`;
}

export function updateStockWidget() {
  const stockWidget = document.querySelector('.stock-widget-floating');
  const stockNum = document.querySelector('.stock-number');
  const stockText = document.querySelector('.stock-text');

  const now = new Date();
  let currentSaleMonthIndex = now.getMonth();
  const day = now.getDate();

  if (day > 5 || AVAILABLE_STOCK <= 0) {
    currentSaleMonthIndex = (currentSaleMonthIndex + 1) % 12;
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const preorderMonthSpan = document.getElementById('preorder-month');
  if (preorderMonthSpan) {
    preorderMonthSpan.innerText = months[currentSaleMonthIndex];
  }

  if (!stockNum || !stockText || !stockWidget) return;

  if (AVAILABLE_STOCK <= 0) {
    stockWidget.classList.add('sold-out');
    stockNum.innerText = '';
    stockText.innerHTML = '¡Edición<br>Agotada!';
    stockText.style.fontWeight = 'bold';
    stockText.style.fontSize = '1.1rem';
    return;
  }

  stockNum.innerText = AVAILABLE_STOCK.toString();
  stockText.innerHTML = `Boxes disponibles<br><strong style="font-size: 1.3rem;">${months[currentSaleMonthIndex]}</strong>`;
}

export function updateCheckoutTotals() {
  const summarySubtotalLabel = document.getElementById('summary-subtotal-label');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDeliveryLabel = document.getElementById('summary-delivery-label');
  const summaryDelivery = document.getElementById('summary-delivery');
  const summaryTotal = document.getElementById('summary-total');
 
  if (!summarySubtotal) return;
 
  const qty = 1;
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  const isQuarterly = selectedPlan && selectedPlan.value === 'quarterly';
  const pricePerBox = isQuarterly ? 33250 : 35000;
  
  const subtotal = qty * pricePerBox * (isQuarterly ? 3 : 1);
  
  const cpInput = document.getElementById('cpInput');
  const cpStr = cpInput ? cpInput.value.replace(/\D/g, '') : '';
  const cp = parseInt(cpStr, 10) || 0;
  let deliveryFee = 0;
  let deliveryText = "A calcular";

  if (cp >= 1000 && cp <= 1499) {
    deliveryFee = 2500;
  } else if (cp >= 1500 && cp <= 1900) {
    deliveryFee = 4000;
  } else if (cp > 0) {
    deliveryFee = 6000;
  }

  const totalDeliveryFee = deliveryFee * (isQuarterly ? 3 : 1);

  if (deliveryFee > 0) {
    deliveryText = `$${totalDeliveryFee.toLocaleString('es-AR')}`;
  }
 
  if (summarySubtotalLabel) {
    summarySubtotalLabel.innerText = isQuarterly ? 'Subtotal (3 cajas):' : 'Subtotal (1 caja):';
  }
  if (summaryDeliveryLabel) {
    summaryDeliveryLabel.innerText = isQuarterly ? 'Envío (3 meses):' : 'Envío:';
  }
  
  summarySubtotal.innerText = `$${subtotal.toLocaleString('es-AR')}`;
  summaryDelivery.innerText = deliveryText;
  summaryTotal.innerText = `$${(subtotal + totalDeliveryFee).toLocaleString('es-AR')}`;
}

export function initCheckoutFlow() {
  const btnJoin = document.getElementById('btn-join-club');
  const ctaWrapper = document.getElementById('cta-join-wrapper');
  const expandedCheckout = document.getElementById('expandedCheckout');
  const paymentForm = document.getElementById('paymentForm');
  const headerBtn = document.querySelector('.neo-header nav a[href="#registro"]');
  const preEmailInput = document.getElementById('preEmailInput');
  const emailInput = document.getElementById('emailInput');

  const currentEditionDisplay = document.getElementById('current-edition-display');
  if (currentEditionDisplay) {
    currentEditionDisplay.innerText = calculateCurrentEdition();
  }
  const dynamicIntroMonth = document.getElementById('dynamic-intro-month');
  if (dynamicIntroMonth) {
    dynamicIntroMonth.innerText = calculateCurrentEdition().replace('Edición ', '');
  }
  
  updateStockWidget();
  updateCheckoutTotals();

  if (!btnJoin || !expandedCheckout) return;

  if (preEmailInput) {
    preEmailInput.addEventListener('input', () => {
      const isValid = preEmailInput.validity.valid && preEmailInput.value.trim() !== '';
      btnJoin.disabled = !isValid;
      if (isValid) {
        localStorage.setItem('fudiclub_prereg_email', preEmailInput.value.trim());
      }
    });
  }

  btnJoin.addEventListener('click', () => {
    posthog.capture('checkout_started');
    const capturedEmail = preEmailInput ? preEmailInput.value.trim() : '';

    if (capturedEmail) {
      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'http://127.0.0.1:54321/functions/v1';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const headers = { 'Content-Type': 'application/json' };
      if (anonKey) headers['Authorization'] = `Bearer ${anonKey}`;
      fetch(`${functionsUrl}/join-waitlist`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ email: capturedEmail })
      }).catch(err => console.error('[Waitlist] Error:', err));
    }

    ctaWrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    ctaWrapper.style.opacity = '0';
    ctaWrapper.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      ctaWrapper.style.display = 'none';
      expandedCheckout.classList.add('active');

      const soldOutOptions = document.getElementById('sold-out-options');
      const now = new Date();
      const day = now.getDate();

      const isSaleWindowClosed = (day >= 6 && day <= 15);

      if (AVAILABLE_STOCK <= 0 || isSaleWindowClosed) {
        if (paymentForm) paymentForm.style.display = 'none';
        if (soldOutOptions) {
          const soldOutTitle = document.getElementById('sold-out-title');
          const soldOutDesc = document.getElementById('sold-out-desc');
          const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          
          let currentTargetIndex = now.getMonth();
          if (day >= 16) {
            currentTargetIndex = (currentTargetIndex + 1) % 12;
          }
          const exhaustedMonth = months[currentTargetIndex];
          const upcomingMonth = months[(currentTargetIndex + 1) % 12];

          if (isSaleWindowClosed) {
            if (soldOutTitle) soldOutTitle.innerText = `¡Venta de ${exhaustedMonth} cerrada! 📦`;
            if (soldOutDesc) soldOutDesc.innerText = `Las ventas se cierran el día 5 de cada mes para hacer la curaduría, armar tu mistery box y despacharla con la calidad que merecés. Pero podés asegurar hoy mismo tu box para la edición de ${upcomingMonth}.`;
          } else {
            if (soldOutTitle) soldOutTitle.innerText = `¡La edición de ${exhaustedMonth} voló! 😱`;
            if (soldOutDesc) soldOutDesc.innerText = `Cerramos las ventas de este mes porque llegamos al límite de cupos. Pero podés asegurar hoy mismo tu box para la edición de ${upcomingMonth}.`;
          }

          const preorderMonthSpan = document.getElementById('preorder-month');
          if (preorderMonthSpan) {
            preorderMonthSpan.innerText = upcomingMonth;
          }

          soldOutOptions.style.display = 'block';
        }
      } else {
        if (paymentForm) {
          paymentForm.style.display = 'block';
        }
      }

      if (emailInput && capturedEmail) {
        emailInput.value = capturedEmail;
        emailInput.style.transition = 'background-color 0.5s ease';
        emailInput.style.backgroundColor = 'var(--accent-verde)';
        setTimeout(() => { emailInput.style.backgroundColor = ''; }, 1200);
      }

      setTimeout(() => {
        if (AVAILABLE_STOCK <= 0 || isSaleWindowClosed) {
          return; // Do not scroll for waitlist, user is already looking at the section
        }
        const headerOffset = 130;
        const elementPosition = expandedCheckout.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }, 50);
    }, 300);
  });

  const planRadios = document.querySelectorAll('input[name="plan"]');
  planRadios.forEach(radio => {
    const card = radio.closest('.plan-card');
    if (radio.checked) card.classList.add('selected');

    card.addEventListener('click', () => {
      planRadios.forEach(r => r.closest('.plan-card').classList.remove('selected'));
      card.classList.add('selected');
      radio.checked = true;
      updateCheckoutTotals();
    });
  });

  const btnPreorder = document.getElementById('btn-preorder');
  const soldOutOptions = document.getElementById('sold-out-options');

  if (btnPreorder) {
    btnPreorder.addEventListener('click', () => {
      setPreorderMode(true);
      if (soldOutOptions) soldOutOptions.style.display = 'none';
      if (paymentForm) paymentForm.style.display = 'block';
      
      if (currentEditionDisplay) {
        currentEditionDisplay.innerText = calculateCurrentEdition();
        currentEditionDisplay.style.backgroundColor = 'var(--bg-amarillo)';
        setTimeout(() => currentEditionDisplay.style.backgroundColor = 'var(--accent-verde)', 1500);
      }
    });
  }

  const allergyToggle = document.getElementById('allergyToggle');
  const allergyDetails = document.getElementById('allergyDetails');
  const allergyMysteryText = document.querySelector('.checkout-subtitle-inline');
  const allergyInfo = document.querySelector('textarea[name="allergyInfo"]');
  const allergyConsent = document.getElementById('allergyConsent');
  if (allergyToggle && allergyDetails) {
    allergyToggle.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      allergyDetails.style.display = isChecked ? 'block' : 'none';
      if (allergyMysteryText) {
        allergyMysteryText.style.display = isChecked ? 'block' : 'none';
      }
      if (allergyInfo) allergyInfo.disabled = !isChecked;
      if (allergyConsent) allergyConsent.disabled = !isChecked;
    });
  }

  const cpInput = document.getElementById('cpInput');
  if (cpInput) {
    cpInput.addEventListener('input', () => {
      updateCheckoutTotals();
    });
    cpInput.addEventListener('blur', () => {
      const cpStr = cpInput.value.replace(/\D/g, '');
      const cp = parseInt(cpStr, 10) || 0;
      if (cpStr.length > 0) {
        posthog.capture('zone_validation', {
          zipCode: cpStr,
          isValid: cp > 0
        });
      }
    });
  }

  const methodCards = document.querySelectorAll('input[name="payment_method"]');
  methodCards.forEach(radio => {
    const card = radio.closest('.plan-card');
    radio.addEventListener('change', () => {
      document.querySelectorAll('input[name="payment_method"]').forEach(r => r.closest('.plan-card').classList.remove('selected'));
      if (radio.checked) card.classList.add('selected');
    });
  });

  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const allergyToggle = document.getElementById('allergyToggle');
      const allergyConsent = document.getElementById('allergyConsent');
      if (allergyToggle && allergyToggle.checked) {
        if (!allergyConsent || !allergyConsent.checked) {
          const allergyDetailsContainer = document.getElementById('allergyDetails');
          if (allergyDetailsContainer) {
            allergyDetailsContainer.classList.add('error-pulse');
            setTimeout(() => allergyDetailsContainer.classList.remove('error-pulse'), 3000);
            allergyDetailsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
      }

      const btnSubmit = paymentForm.querySelector('button[type="submit"]');
      const originalText = btnSubmit.innerText;
      btnSubmit.innerText = 'Procesando...';
      btnSubmit.style.backgroundColor = 'var(--bg-amarillo)';
      btnSubmit.style.color = 'var(--black)';
      btnSubmit.disabled = true;

      const allInputs = paymentForm.querySelectorAll('input, textarea');
      allInputs.forEach(input => input.disabled = true);

      const editionAssigned = calculateCurrentEdition();
      const planValue = document.querySelector('input[name="plan"]:checked').value;
      const paymentMethodElement = document.querySelector('input[name="payment_method"]:checked');
      const paymentMethod = paymentMethodElement ? paymentMethodElement.value : 'mercado_pago';

      const email = document.getElementById('emailInput').value;
      const name = document.querySelector('input[placeholder="Nombre completo"]').value;
      const address = document.getElementById('addressInput').value;
      const cp = document.getElementById('cpInput').value;
      const allergiesText = document.querySelector('textarea[name="allergyInfo"]').value;
      const hasAllergy = document.getElementById('allergyToggle').checked;
      const allergies = hasAllergy ? allergiesText : '';

      const payload = {
        email,
        name,
        address,
        cp,
        allergies,
        plan: planValue,
        payment_method: paymentMethod,
        edition: editionAssigned,
        is_preorder: isPreorderMode
      };

      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'http://127.0.0.1:54321/functions/v1';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      if (!anonKey) {
        console.warn("Falta VITE_SUPABASE_ANON_KEY en .env. Simulando compra (Mock)...");
        setTimeout(() => {
          paymentForm.style.display = 'none';
          const successModal = document.getElementById('success-modal');
          const successTitle = document.getElementById('success-title');
          const successMsg = document.getElementById('success-message');
          const transferDetails = document.getElementById('transfer-details');
          const transferInstructions = document.getElementById('transfer-instructions');
          
          if (successModal) {
            successModal.style.display = 'block';
            setTimeout(() => {
              successModal.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
          }
          
          if (paymentMethod === 'transfer') {
            if (successTitle) successTitle.innerText = '¡Reserva confirmada! 📦';
            if (successMsg) successMsg.innerText = 'Completa el pago con los siguientes datos:';
            if (transferDetails) transferDetails.style.display = 'block';
            if (transferInstructions) transferInstructions.style.display = 'block';
          } else {
            if (successTitle) successTitle.innerText = '¡Preparando tu pedido! 📦';
            if (successMsg) successMsg.innerText = 'Redirigiendo a Mercado Pago... 🚀';
            if (transferDetails) transferDetails.style.display = 'none';
            if (transferInstructions) transferInstructions.style.display = 'none';
            setTimeout(() => alert("Mock: Redirección a Mercado Pago exitosa"), 1500);
          }
          btnSubmit.innerText = originalText;
          btnSubmit.disabled = false;
        }, 2000);
        return;
      }

      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${anonKey}` };

      fetch(`${functionsUrl}/create-order`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error procesando la orden');
        
        paymentForm.style.display = 'none';
        
        const successModal = document.getElementById('success-modal');
        const successTitle = document.getElementById('success-title');
        const successMsg = document.getElementById('success-message');
        const transferDetails = document.getElementById('transfer-details');
        const transferInstructions = document.getElementById('transfer-instructions');
        
        if (successModal) {
          successModal.style.display = 'block';
          setTimeout(() => {
            successModal.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 50);
        }
        
        if (paymentMethod === 'transfer') {
          if (successTitle) successTitle.innerText = '¡Reserva confirmada! 📦';
          if (successMsg) successMsg.innerText = 'Completa el pago con los siguientes datos:';
          if (transferDetails) transferDetails.style.display = 'block';
          if (transferInstructions) transferInstructions.style.display = 'block';
        } else if (data.init_point) {
          if (successTitle) successTitle.innerText = '¡Preparando tu pedido! 📦';
          if (successMsg) successMsg.innerText = 'Redirigiendo a Mercado Pago... 🚀';
          if (transferDetails) transferDetails.style.display = 'none';
          if (transferInstructions) transferInstructions.style.display = 'none';
          window.location.href = data.init_point;
        } else {
          throw new Error('Missing init_point from Mercado Pago');
        }
      })
      .catch(err => {
        console.error(err);
        btnSubmit.innerText = originalText;
        btnSubmit.style.backgroundColor = '';
        btnSubmit.style.color = '';
        btnSubmit.disabled = false;
        
        allInputs.forEach(input => input.disabled = false);
        
        alert('Ocurrió un error al procesar tu pedido. Intenta nuevamente.');
      });
    });
  }

  if (headerBtn) {
    headerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetElement = document.querySelector('#registro');
      if (targetElement) {
        const headerOffset = 130;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  }
}
