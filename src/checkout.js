import { AVAILABLE_STOCK, isPreorderMode, setPreorderMode } from './api.js';
import posthog from 'posthog-js';
import { validateEmailSyntax, isDisposableEmail, suggestEmailCorrection, validateAddress, validateFullName } from './email-validator.js';

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

  return months[monthIndex];
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
    stockWidget.style.display = 'flex';
    stockWidget.classList.add('sold-out');
    stockNum.innerText = '';
    stockText.innerHTML = '¡Edición<br>Agotada!';
    stockText.style.fontWeight = 'bold';
    stockText.style.fontSize = '1.1rem';
    return;
  }

  // Si hay más de 15 boxes disponibles, ocultamos el widget para no mostrar abundancia/falta de ventas
  if (AVAILABLE_STOCK > 15) {
    stockWidget.style.display = 'none';
    return;
  }

  // Si quedan 15 o menos, mostramos el widget
  stockWidget.style.display = 'flex';
  stockWidget.classList.remove('sold-out');
  stockNum.innerText = AVAILABLE_STOCK.toString();
  stockText.innerHTML = `Boxes disponibles<br><strong style="font-size: 1.3rem;">${months[currentSaleMonthIndex]}</strong>`;
}

if (typeof window !== 'undefined') {
  window.addEventListener('stockUpdated', () => {
    updateStockWidget();
  });
}

export function updateCheckoutTotals() {
  const summarySubtotalLabel = document.getElementById('summary-subtotal-label');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDeliveryLabel = document.getElementById('summary-delivery-label');
  const summaryDelivery = document.getElementById('summary-delivery');
  const summaryTotal = document.getElementById('summary-total');
 
  if (!summarySubtotal) return;
 
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  const isQuarterly = selectedPlan && selectedPlan.value === 'quarterly';
  
  let subtotal = 0;
  let boxesCount = 1;
  
  if (isQuarterly) {
    boxesCount = 3;
    subtotal = 127900;
  } else {
    boxesCount = 1;
    subtotal = 44900;
  }
  
  const qtyDisplay = document.getElementById('qty-display');
  const userQty = qtyDisplay ? (parseInt(qtyDisplay.textContent, 10) || 1) : 1;
  
  subtotal = subtotal * userQty;
  const totalBoxes = boxesCount * userQty;
  
  const cpInput = document.getElementById('cpInput');
  const cpStr = cpInput ? cpInput.value.replace(/\D/g, '') : '';
  const cp = parseInt(cpStr, 10) || 0;
  
  let deliveryFeePerMonth = 0;
  let deliveryText = "Envío Gratis CABA y GBA";
  let isValidZone = true;

  if (cp >= 1000 && cp <= 1900) {
    deliveryFeePerMonth = 0;
    deliveryText = "¡Gratis!";
  } else if (cp > 0) {
    isValidZone = false;
    deliveryFeePerMonth = 0;
    deliveryText = "Fuera de zona (solo CABA/GBA)";
  }

  const totalDeliveryFee = deliveryFeePerMonth * totalBoxes;

  if (deliveryFeePerMonth > 0) {
    deliveryText = `$${totalDeliveryFee.toLocaleString('es-AR')}`;
  }
  
  if (summaryDelivery) {
    if (!isValidZone && cp > 0) {
      summaryDelivery.style.color = 'red';
      summaryDelivery.style.fontWeight = 'bold';
    } else {
      summaryDelivery.style.color = '';
      summaryDelivery.style.fontWeight = '';
    }
  }

  const btnSubmit = document.querySelector('#paymentForm button[type="submit"]');
  if (btnSubmit) {
    if (!isValidZone && cp > 0) {
      btnSubmit.disabled = true;
      btnSubmit.style.opacity = '0.5';
    } else {
      btnSubmit.disabled = false;
      btnSubmit.style.opacity = '1';
    }
  }
 
  if (summarySubtotalLabel) {
    summarySubtotalLabel.innerText = isQuarterly ? `Subtotal (${userQty} x Trimestral = ${totalBoxes} Boxes):` : `Subtotal (${totalBoxes} Mystery Box${totalBoxes > 1 ? 'es' : ''}):`;
  }
  if (summaryDeliveryLabel) {
    summaryDeliveryLabel.innerText = isQuarterly ? `Envío (${totalBoxes} Boxes):` : `Envío (${userQty} Box${userQty > 1 ? 'es' : ''}):`;
  }
  
  summarySubtotal.innerText = `$${subtotal.toLocaleString('es-AR')}`;
  summaryDelivery.innerText = deliveryText;
  summaryTotal.innerText = `$${(subtotal + totalDeliveryFee).toLocaleString('es-AR')}`;
  
  const transferAmount = document.getElementById('transfer-amount');
  if (transferAmount) {
    transferAmount.innerText = `$${(subtotal + totalDeliveryFee).toLocaleString('es-AR')}`;
  }

  const currentEditionDisplay = document.getElementById('current-edition-display');
  if (currentEditionDisplay) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthAbbr = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const baseEdition = calculateCurrentEdition();
    const bIndex = months.indexOf(baseEdition);
    if (isQuarterly) {
      const a1 = monthAbbr[bIndex];
      const a2 = monthAbbr[(bIndex + 1) % 12];
      const a3 = monthAbbr[(bIndex + 2) % 12];
      currentEditionDisplay.innerText = `${a1}, ${a2} y ${a3}`;
    } else {
      currentEditionDisplay.innerText = baseEdition;
    }
  }
}

export function setupEmailValidationUI(inputElement, suggestionEl, errorEl, onValidChange) {
  if (!inputElement) return;

  const updateValidation = () => {
    const rawVal = inputElement.value;
    const val = rawVal ? rawVal.trim() : '';

    if (!val) {
      if (suggestionEl) suggestionEl.classList.remove('active');
      if (errorEl) errorEl.classList.remove('active');
      if (onValidChange) onValidChange(false);
      return;
    }

    // Check disposable
    if (isDisposableEmail(val)) {
      if (suggestionEl) suggestionEl.classList.remove('active');
      if (errorEl) {
        errorEl.textContent = 'No se permiten correos temporales. Por favor ingresá un email válido.';
        errorEl.classList.add('active');
      }
      if (onValidChange) onValidChange(false);
      return;
    }

    // Check syntax
    const syntax = validateEmailSyntax(val);
    const isBasicValid = inputElement.validity ? inputElement.validity.valid : true;
    if (!syntax.valid || !isBasicValid) {
      if (errorEl && val.includes('@') && val.length > 5) {
        errorEl.textContent = syntax.reason || 'Correo electrónico inválido.';
        errorEl.classList.add('active');
      } else if (errorEl) {
        errorEl.classList.remove('active');
      }
      if (suggestionEl) suggestionEl.classList.remove('active');
      if (onValidChange) onValidChange(false);
      return;
    }

    // Syntax is valid
    if (errorEl) errorEl.classList.remove('active');

    // Check typo suggestion
    const suggestion = suggestEmailCorrection(val);
    if (suggestion && suggestionEl) {
      suggestionEl.innerHTML = `¿Quisiste decir <strong>${suggestion}</strong>? <button type="button" class="email-suggestion-btn">Corregir</button>`;
      suggestionEl.classList.add('active');

      const btn = suggestionEl.querySelector('.email-suggestion-btn');
      if (btn) {
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          inputElement.value = suggestion;
          suggestionEl.classList.remove('active');
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          inputElement.focus();
        };
      }
    } else if (suggestionEl) {
      suggestionEl.classList.remove('active');
    }

    if (onValidChange) onValidChange(true);
  };

  inputElement.addEventListener('input', updateValidation);
  inputElement.addEventListener('blur', updateValidation);
}

export function setupFormValidationMessages(form) {
  if (!form) return;
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('invalid', () => {
      if (input.validity && input.validity.valueMissing) {
        if (input.id === 'nameInput' || input.name === 'name') {
          input.setCustomValidity('Por favor ingresá tu nombre y apellido.');
        } else if (input.id === 'addressInput' || input.name === 'address') {
          input.setCustomValidity('Por favor ingresá tu dirección (calle y altura).');
        } else if (input.id === 'cpInput' || input.name === 'cp') {
          input.setCustomValidity('Por favor ingresá tu código postal.');
        } else if (input.type === 'email' || input.id === 'emailInput') {
          input.setCustomValidity('Por favor ingresá tu correo electrónico.');
        } else {
          input.setCustomValidity('Por favor completá este campo.');
        }
      } else if (input.validity && input.validity.typeMismatch && input.type === 'email') {
        input.setCustomValidity('Por favor ingresá un correo electrónico válido.');
      } else if (input.validity && !input.validity.valid) {
        input.setCustomValidity('Por favor completá este campo.');
      }
    });

    input.addEventListener('input', () => {
      input.setCustomValidity('');
    });
  });
}

export function initCheckoutFlow() {
  const btnJoin = document.getElementById('btn-join-club');
  const ctaWrapper = document.getElementById('cta-join-wrapper');
  const expandedCheckout = document.getElementById('expandedCheckout');
  const paymentForm = document.getElementById('paymentForm');
  const headerBtn = document.querySelector('.neo-header nav a[href="#registro"]');
  const preEmailInput = document.getElementById('preEmailInput');
  const emailInput = document.getElementById('emailInput');

  if (paymentForm) {
    setupFormValidationMessages(paymentForm);
  }

  const currentEditionDisplay = document.getElementById('current-edition-display');
  if (currentEditionDisplay) {
    currentEditionDisplay.innerText = calculateCurrentEdition();
  }
  const dynamicIntroMonth = document.getElementById('dynamic-intro-month');
  if (dynamicIntroMonth) {
    dynamicIntroMonth.innerText = calculateCurrentEdition();
  }
  
  updateStockWidget();
  updateCheckoutTotals();

  if (!btnJoin || !expandedCheckout) return;

  if (preEmailInput) {
    const preSuggestionEl = document.getElementById('preEmailSuggestion');
    const preErrorEl = document.getElementById('preEmailError');

    setupEmailValidationUI(preEmailInput, preSuggestionEl, preErrorEl, (isValid) => {
      if (isValid) {
        btnJoin.removeAttribute('data-invalid');
        btnJoin.disabled = false;
        localStorage.setItem('fudiclub_prereg_email', preEmailInput.value.trim());
      } else {
        btnJoin.setAttribute('data-invalid', 'true');
      }
    });
  }

  if (emailInput) {
    const emailSuggestionEl = document.getElementById('emailSuggestion');
    const emailErrorEl = document.getElementById('emailError');

    setupEmailValidationUI(emailInput, emailSuggestionEl, emailErrorEl);
  }

  const nameInput = document.getElementById('nameInput') || document.querySelector('input[placeholder*="Nombre"]');
  const nameErrorEl = document.getElementById('nameError');

  if (nameInput) {
    const handleNameValidation = () => {
      const val = nameInput.value.trim();
      if (!val) {
        if (nameErrorEl) nameErrorEl.classList.remove('active');
        return;
      }
      const validation = validateFullName(val);
      if (!validation.valid) {
        if (nameErrorEl) {
          nameErrorEl.textContent = validation.reason || 'Por favor ingresá tu nombre y apellido.';
          nameErrorEl.classList.add('active');
        }
      } else {
        if (nameErrorEl) nameErrorEl.classList.remove('active');
      }
    };

    nameInput.addEventListener('blur', handleNameValidation);
    nameInput.addEventListener('input', () => {
      if (nameErrorEl && nameErrorEl.classList.contains('active')) {
        const validation = validateFullName(nameInput.value.trim());
        if (validation.valid) {
          nameErrorEl.classList.remove('active');
        }
      }
    });
  }

  const addressInput = document.getElementById('addressInput');
  const addressErrorEl = document.getElementById('addressError');

  if (addressInput) {
    const handleAddressValidation = () => {
      const val = addressInput.value.trim();
      if (!val) {
        if (addressErrorEl) addressErrorEl.classList.remove('active');
        return;
      }
      const validation = validateAddress(val);
      if (!validation.valid) {
        if (addressErrorEl) {
          addressErrorEl.textContent = validation.reason || 'Falta la altura / número de la calle.';
          addressErrorEl.classList.add('active');
        }
      } else {
        if (addressErrorEl) addressErrorEl.classList.remove('active');
      }
    };

    addressInput.addEventListener('blur', handleAddressValidation);
    addressInput.addEventListener('input', () => {
      if (addressErrorEl && addressErrorEl.classList.contains('active')) {
        const validation = validateAddress(addressInput.value.trim());
        if (validation.valid) {
          addressErrorEl.classList.remove('active');
        }
      }
    });
  }

  btnJoin.addEventListener('click', () => {
    const capturedEmail = preEmailInput ? preEmailInput.value.trim() : '';
    const preErrorEl = document.getElementById('preEmailError');

    if (!capturedEmail) {
      if (preEmailInput) {
        preEmailInput.focus();
        preEmailInput.classList.add('neo-input-shake');
        setTimeout(() => preEmailInput.classList.remove('neo-input-shake'), 600);
      }
      if (preErrorEl) {
        preErrorEl.textContent = 'Por favor ingresá tu correo electrónico para continuar.';
        preErrorEl.classList.add('active');
      }
      return;
    }

    const syntax = validateEmailSyntax(capturedEmail);
    if (!syntax.valid) {
      if (preEmailInput) preEmailInput.focus();
      if (preErrorEl) {
        preErrorEl.textContent = syntax.reason || 'Por favor ingresá un correo electrónico válido.';
        preErrorEl.classList.add('active');
      }
      return;
    }

    posthog.capture('checkout_started');

    if (capturedEmail) {
      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'http://127.0.0.1:54321/functions/v1';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const headers = { 'Content-Type': 'application/json' };
      if (anonKey) headers['Authorization'] = `Bearer ${anonKey}`;
      fetch(`${functionsUrl}/join-waitlist`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ email: capturedEmail, note: 'Interesado (Pre-checkout)' })
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
            if (soldOutDesc) soldOutDesc.innerText = `Las ventas se cierran el día 5 de cada mes para hacer la curaduría, armar tu mystery box y despacharla con la calidad que merecés. Pero podés asegurar hoy mismo tu box para la edición de ${upcomingMonth}.`;
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

  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const qtyDisplay = document.getElementById('qty-display');

  if (btnQtyMinus && btnQtyPlus && qtyDisplay) {
    const updateQtyButtons = (current) => {
      if (current <= 1) {
        btnQtyMinus.style.opacity = '0.5';
        btnQtyMinus.style.pointerEvents = 'none';
        btnQtyMinus.style.backgroundColor = '#ccc';
        btnQtyMinus.style.borderColor = '#999';
      } else {
        btnQtyMinus.style.opacity = '1';
        btnQtyMinus.style.pointerEvents = 'auto';
        btnQtyMinus.style.backgroundColor = '';
        btnQtyMinus.style.borderColor = '';
      }
      
      if (current >= 3) {
        btnQtyPlus.style.opacity = '0.5';
        btnQtyPlus.style.pointerEvents = 'none';
        btnQtyPlus.style.backgroundColor = '#ccc';
        btnQtyPlus.style.borderColor = '#999';
      } else {
        btnQtyPlus.style.opacity = '1';
        btnQtyPlus.style.pointerEvents = 'auto';
        btnQtyPlus.style.backgroundColor = '';
        btnQtyPlus.style.borderColor = '';
      }
    };

    btnQtyMinus.addEventListener('click', (e) => {
      e.preventDefault();
      let current = parseInt(qtyDisplay.textContent, 10) || 1;
      if (current > 1) {
        current--;
        qtyDisplay.textContent = current;
        updateQtyButtons(current);
        updateCheckoutTotals();
      }
    });
    btnQtyPlus.addEventListener('click', (e) => {
      e.preventDefault();
      let current = parseInt(qtyDisplay.textContent, 10) || 1;
      if (current < 3) {
        current++;
        qtyDisplay.textContent = current;
        updateQtyButtons(current);
        updateCheckoutTotals();
      }
    });
  }

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
        setTimeout(() => currentEditionDisplay.style.backgroundColor = 'var(--bg-turquesa)', 1500);
      }
    });
  }

  const allergyToggle = document.getElementById('allergyToggle');
  const allergyDetails = document.getElementById('allergyDetails');
  const allergyMysteryText = document.querySelector('.checkout-subtitle-inline');
  const allergyInfo = document.querySelector('input[name="allergyInfo"]');
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
        const emailField = document.getElementById('emailInput');
        const userEmail = emailField ? emailField.value.trim() : '';

        posthog.capture('zone_validation', {
          zipCode: cpStr,
          isValid: cp >= 1000 && cp <= 1900,
          email: userEmail
        });
        if (cp < 1000 || cp > 1900) {
          const emailToLog = userEmail || (preEmailInput ? preEmailInput.value.trim() : '') || localStorage.getItem('fudiclub_prereg_email') || '';
          if (emailToLog) {
            const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'http://127.0.0.1:54321/functions/v1';
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
            const headers = { 'Content-Type': 'application/json' };
            if (anonKey) headers['Authorization'] = `Bearer ${anonKey}`;
            fetch(`${functionsUrl}/join-waitlist`, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({ email: emailToLog, note: `Fuera de zona (CP: ${cpStr})` })
            }).catch(err => console.error('[Waitlist Out-of-Zone] Error:', err));
          }

          const modal = document.getElementById('out-of-zone-modal');
          if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
              modal.style.opacity = '1';
              modal.children[0].style.transform = 'translateY(0)';
            }, 10);
          }
        }
      }
    });
  }

  const closeZoneModalBtn = document.getElementById('close-zone-modal');
  if (closeZoneModalBtn) {
    closeZoneModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById('out-of-zone-modal');
      if (modal) {
        modal.style.opacity = '0';
        modal.children[0].style.transform = 'translateY(20px)';
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }
    });
  }

  const methodCards = document.querySelectorAll('input[name="payment_method"]');
  methodCards.forEach(radio => {
    const card = radio.closest('.plan-card');
    if (!card) return;
    radio.addEventListener('change', () => {
      document.querySelectorAll('input[name="payment_method"]').forEach(r => {
        const c = r.closest('.plan-card');
        if (c) c.classList.remove('selected');
      });
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

      const planValue = document.querySelector('input[name="plan"]:checked').value;
      const isQuarterly = planValue === 'quarterly';
      const baseEdition = calculateCurrentEdition();
      const monthsList = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const bIndex = monthsList.indexOf(baseEdition);
      const m2 = monthsList[(bIndex + 1) % 12];
      const m3 = monthsList[(bIndex + 2) % 12];
      const editionAssigned = isQuarterly ? `${baseEdition} - ${m2} - ${m3}` : `Edición ${baseEdition}`;
      const paymentMethodElement = document.querySelector('input[name="payment_method"]:checked');
      const paymentMethod = paymentMethodElement ? paymentMethodElement.value : 'mercado_pago';
      const emailInputElem = document.getElementById('emailInput');
      const email = emailInputElem ? emailInputElem.value.trim() : '';

      if (email) {
        if (isDisposableEmail(email)) {
          alert('No se permiten correos temporales. Por favor ingresá un email válido.');
          btnSubmit.innerText = originalText;
          btnSubmit.style.backgroundColor = '';
          btnSubmit.style.color = '';
          btnSubmit.disabled = false;
          allInputs.forEach(input => input.disabled = false);
          return;
        }
        const syntax = validateEmailSyntax(email);
        if (!syntax.valid) {
          alert(syntax.reason || 'Por favor ingresá un correo válido.');
          btnSubmit.innerText = originalText;
          btnSubmit.style.backgroundColor = '';
          btnSubmit.style.color = '';
          btnSubmit.disabled = false;
          allInputs.forEach(input => input.disabled = false);
          return;
        }
      }

      const nameInputElem = document.getElementById('nameInput') || document.querySelector('input[placeholder*="Nombre"]');
      const name = nameInputElem ? nameInputElem.value.trim() : '';

      if (name) {
        const nameValidation = validateFullName(name);
        if (!nameValidation.valid) {
          alert(nameValidation.reason || 'Por favor ingresá tu nombre y apellido.');
          const nameErrEl = document.getElementById('nameError');
          if (nameErrEl) {
            nameErrEl.textContent = nameValidation.reason || 'Por favor ingresá tu nombre y apellido.';
            nameErrEl.classList.add('active');
          }
          if (nameInputElem) nameInputElem.focus();
          btnSubmit.innerText = originalText;
          btnSubmit.style.backgroundColor = '';
          btnSubmit.style.color = '';
          btnSubmit.disabled = false;
          allInputs.forEach(input => input.disabled = false);
          return;
        }
      }

      const rawAddressInput = document.getElementById('addressInput');
      const rawAddress = rawAddressInput ? rawAddressInput.value.trim() : '';
      const apartmentInput = document.getElementById('apartmentInput');
      const apartment = apartmentInput ? apartmentInput.value.trim() : '';

      if (rawAddress) {
        const addressValidation = validateAddress(rawAddress);
        if (!addressValidation.valid) {
          alert(addressValidation.reason || 'Por favor ingresá tu dirección con calle y altura.');
          const addressErrEl = document.getElementById('addressError');
          if (addressErrEl) {
            addressErrEl.textContent = addressValidation.reason || 'Falta la altura / número de la calle.';
            addressErrEl.classList.add('active');
          }
          if (rawAddressInput) rawAddressInput.focus();
          btnSubmit.innerText = originalText;
          btnSubmit.style.backgroundColor = '';
          btnSubmit.style.color = '';
          btnSubmit.disabled = false;
          allInputs.forEach(input => input.disabled = false);
          return;
        }
      }

      const address = apartment ? `${rawAddress}, ${apartment}` : rawAddress;
      const cp = document.getElementById('cpInput').value;
      const allergiesText = document.querySelector('input[name="allergyInfo"]').value;
      const hasAllergy = document.getElementById('allergyToggle').checked;
      const allergies = hasAllergy ? allergiesText : '';
      const qtyDisplay = document.getElementById('qty-display');
      const orderQuantity = qtyDisplay ? (parseInt(qtyDisplay.textContent, 10) || 1) : 1;

      const payload = {
        email,
        name,
        address,
        cp,
        allergies,
        plan: planValue,
        payment_method: paymentMethod,
        edition: editionAssigned,
        is_preorder: isPreorderMode,
        quantity: orderQuantity
      };

      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'http://127.0.0.1:54321/functions/v1';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      if (!anonKey) {
        console.warn("Falta VITE_SUPABASE_ANON_KEY en .env. Simulando compra (Mock)...");
        setTimeout(() => {
          paymentForm.style.display = 'none';
          document.getElementById('expandedCheckout').style.display = 'none';
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
            if (successMsg) successMsg.innerText = 'Completá el pago con los siguientes datos:';
            if (transferDetails) transferDetails.style.display = 'block';
            if (transferInstructions) transferInstructions.style.display = 'block';

            const btnWhatsapp = document.getElementById('btn-whatsapp-proof');
            if (btnWhatsapp) {
              const msg = `Hola! Soy ${name}, adjunto comprobante de mi Mystery Box (MOCK-ORDER)`;
              btnWhatsapp.href = `https://wa.me/5491139264426?text=${encodeURIComponent(msg)}`;
              btnWhatsapp.onclick = () => {
                posthog.capture('whatsapp_receipt_clicked', {
                  order_id: 'MOCK-ORDER',
                  email: email,
                  plan: planValue
                });
              };
            }

            try {
              posthog.identify(email, {
                email: email,
                name: name,
                plan: planValue,
                payment_method: paymentMethod,
                edition: editionAssigned
              });
              posthog.capture('transfer_details_viewed', {
                order_id: 'MOCK-ORDER',
                amount: payload.total,
                plan: planValue,
                edition: editionAssigned,
                quantity: orderQuantity
              });
            } catch (e) {}
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
        document.getElementById('expandedCheckout').style.display = 'none';
        
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
          if (successMsg) successMsg.innerText = 'Completá el pago con los siguientes datos:';
          if (transferDetails) transferDetails.style.display = 'block';
          if (transferInstructions) transferInstructions.style.display = 'block';

          const btnWhatsapp = document.getElementById('btn-whatsapp-proof');
          if (btnWhatsapp) {
            const friendlyOrderId = data.orderId || '';
            const msg = `Hola! Soy ${name}, adjunto comprobante de mi Mystery Box (${friendlyOrderId})`;
            btnWhatsapp.href = `https://wa.me/5491139264426?text=${encodeURIComponent(msg)}`;
            btnWhatsapp.onclick = () => {
              posthog.capture('whatsapp_receipt_clicked', {
                order_id: friendlyOrderId,
                email: email,
                plan: planValue,
                total: payload.total
              });
            };
          }

          try {
            posthog.identify(email, {
              email: email,
              name: name,
              plan: planValue,
              payment_method: paymentMethod,
              edition: editionAssigned
            });
            posthog.capture('transfer_details_viewed', {
              order_id: data.orderId,
              amount: payload.total,
              plan: planValue,
              edition: editionAssigned,
              quantity: orderQuantity
            });
          } catch (e) {
            console.error('PostHog error:', e);
          }
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
        
        const displayMsg = (err.message && err.message !== 'Connection failure' && !err.message.includes('fetch'))
          ? err.message
          : 'Ocurrió un error al procesar tu pedido. Intentá nuevamente.';
        alert(displayMsg);
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
