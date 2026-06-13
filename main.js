// Fudi Club Main JavaScript
const AVAILABLE_STOCK = 0; // Cambiar a 30 para producción
let isPreorderMode = false;

document.addEventListener('DOMContentLoaded', () => {
  initDraggableStickers();
  initAllergyToggle();
  initCheckoutFlow();
  updateStockWidget();
  updateCheckoutTotals(); // Initial calculation
  initDynamicHeader();
  initMysteryReveal();
  initFAQ();
  initRetroPlayer();
});

// A. FAQ Toggle Logic
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) otherItem.classList.remove('active');
      });
      // Toggle current item
      item.classList.toggle('active');
    });
  });
}

// A. Allergy Toggle Logic
function initAllergyToggle() {
  const toggle = document.getElementById('allergyToggle');
  const detailsArea = document.getElementById('allergyDetails');

  if (toggle && detailsArea) {
    toggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        detailsArea.style.display = 'block';
      } else {
        detailsArea.style.display = 'none';
      }
    });
  }
}

// B. Checkout Flow Logic
function initCheckoutFlow() {
  const btnJoin = document.getElementById('btn-join-club');
  const ctaWrapper = document.getElementById('cta-join-wrapper');
  const expandedCheckout = document.getElementById('expandedCheckout');
  const paymentForm = document.getElementById('paymentForm');
  const headerBtn = document.querySelector('.neo-header nav a[href="#registro"]');
  const preEmailInput = document.getElementById('preEmailInput');
  const emailInput = document.getElementById('emailInput');

  // Inicializar mostrar la edición actual
  const currentEditionDisplay = document.getElementById('current-edition-display');
  if (currentEditionDisplay) {
    currentEditionDisplay.innerText = calculateCurrentEdition();
  }

  if (!btnJoin || !expandedCheckout) return;

  // 0. Habilitar botón solo cuando el email tiene formato válido
  if (preEmailInput) {
    preEmailInput.addEventListener('input', () => {
      const isValid = preEmailInput.validity.valid && preEmailInput.value.trim() !== '';
      btnJoin.disabled = !isValid;
      // Guardar en localStorage como pre-registro (aunque no complete la compra)
      if (isValid) {
        localStorage.setItem('fudiclub_prereg_email', preEmailInput.value.trim());
      }
    });
  }

  // 1. Click en "Quiero unirme" → desaparece botón y despliega checkout
  btnJoin.addEventListener('click', () => {
    const capturedEmail = preEmailInput ? preEmailInput.value.trim() : '';

    // Animación de salida del bloque pre-registro
    ctaWrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    ctaWrapper.style.opacity = '0';
    ctaWrapper.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      ctaWrapper.style.display = 'none';
      expandedCheckout.classList.add('active');

      const soldOutOptions = document.getElementById('sold-out-options');
      if (AVAILABLE_STOCK <= 0) {
        if (paymentForm) paymentForm.style.display = 'none';
        if (soldOutOptions) {
          const soldOutTitle = document.getElementById('sold-out-title');
          const soldOutDesc = document.getElementById('sold-out-desc');
          const now = new Date();
          const day = now.getDate();
          const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          
          if (day > 5) {
            const closedMonth = months[now.getMonth()];
            if (soldOutTitle) soldOutTitle.innerText = `¡Venta de ${closedMonth} Cerrada! 😱`;
            if (soldOutDesc) soldOutDesc.innerText = `La venta para ${closedMonth} ya cerró, pero podés asegurar tu caja para el próximo mes o anotarte en la lista de espera y te avisaremos cuando esté disponible.`;
          } else {
            if (soldOutTitle) soldOutTitle.innerText = `¡Edición Actual Agotada! 😱`;
            if (soldOutDesc) soldOutDesc.innerText = `Pero no te preocupes, podés asegurar tu caja para el próximo mes o anotarte en la lista de espera.`;
          }

          soldOutOptions.style.display = 'block';
        }
      } else {
        if (paymentForm) paymentForm.style.display = 'block';
      }

      // Autocompletar email en el formulario de checkout
      if (emailInput && capturedEmail) {
        emailInput.value = capturedEmail;
        // Resaltar el campo brevemente para que el usuario lo note
        emailInput.style.transition = 'background-color 0.5s ease';
        emailInput.style.backgroundColor = 'var(--accent-verde)';
        setTimeout(() => { emailInput.style.backgroundColor = ''; }, 1200);
      }

      // Smooth scroll al checkout
      setTimeout(() => {
        const headerOffset = 130;
        const elementPosition = expandedCheckout.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }, 50);
    }, 300);
  });

  // 2. Highlight de la tarjeta de plan seleccionada
  const planCards = document.querySelectorAll('.plan-card.focal-card');
  planCards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    // Estado inicial
    if (radio.checked) card.classList.add('selected');

    card.addEventListener('click', () => {
      planCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      radio.checked = true;
      updateCheckoutTotals();
    });
  });

  // 3. Manejo de opciones cuando no hay stock
  const btnPreorder = document.getElementById('btn-preorder');
  const btnShowWaitlist = document.getElementById('btn-show-waitlist');
  const soldOutOptions = document.getElementById('sold-out-options');
  const waitlistContainer = document.getElementById('waitlist-container');
  const waitlistForm = document.getElementById('waitlistForm');
  const waitlistSuccess = document.getElementById('waitlist-success');

  if (btnPreorder) {
    btnPreorder.addEventListener('click', () => {
      isPreorderMode = true;
      if (soldOutOptions) soldOutOptions.style.display = 'none';
      if (paymentForm) paymentForm.style.display = 'block';
      
      const currentEditionDisplay = document.getElementById('current-edition-display');
      if (currentEditionDisplay) {
        currentEditionDisplay.innerText = calculateCurrentEdition();
        currentEditionDisplay.style.backgroundColor = 'var(--bg-amarillo)';
        setTimeout(() => currentEditionDisplay.style.backgroundColor = 'var(--accent-verde)', 1500);
      }
    });
  }

  if (btnShowWaitlist) {
    btnShowWaitlist.addEventListener('click', () => {
      if (soldOutOptions) soldOutOptions.style.display = 'none';
      if (waitlistContainer) waitlistContainer.style.display = 'block';
    });
  }

  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('waitlistEmail').value;
      console.log(`[Waitlist] Registrando email: ${email}`);
      const btn = waitlistForm.querySelector('button');
      btn.innerText = 'Registrando...';
      btn.disabled = true;

      const functionsUrl = import.meta.env?.VITE_SUPABASE_FUNCTIONS_URL || 'http://127.0.0.1:54321/functions/v1';

      fetch(`${functionsUrl}/join-waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      .then(res => res.json())
      .then(data => {
        waitlistForm.style.display = 'none';
        if (waitlistSuccess) waitlistSuccess.style.display = 'block';
      })
      .catch(err => {
        console.error(err);
        btn.innerText = 'Anotarme en la lista';
        btn.disabled = false;
        alert('Hubo un error. Intenta nuevamente.');
      });
    });
  }

  // 4. Allergy Toggle
  const allergyToggle = document.getElementById('allergyToggle');
  const allergyDetails = document.getElementById('allergyDetails');
  const allergyMysteryText = document.querySelector('.checkout-subtitle-inline');
  if (allergyToggle && allergyDetails) {
    allergyToggle.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      allergyDetails.style.display = isChecked ? 'block' : 'none';
      if (allergyMysteryText) {
        allergyMysteryText.style.display = isChecked ? 'block' : 'none';
      }
    });
  }

  // 4.5 CP Input Listener
  const cpInput = document.getElementById('cpInput');
  if (cpInput) {
    cpInput.addEventListener('input', () => {
      updateCheckoutTotals();
    });
  }

  // 5. Highlight de método de pago
  const methodCards = document.querySelectorAll('input[name="payment_method"]');
  methodCards.forEach(radio => {
    const card = radio.closest('.plan-card');
    radio.addEventListener('change', () => {
      document.querySelectorAll('input[name="payment_method"]').forEach(r => r.closest('.plan-card').classList.remove('selected'));
      if (radio.checked) card.classList.add('selected');
    });
  });

  // 6. Procesamiento de Pago (Simulado)
  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validación de Política de Alergias
      const allergyToggle = document.getElementById('allergyToggle');
      const allergyConsent = document.getElementById('allergyConsent');
      if (allergyToggle && allergyToggle.checked) {
        if (!allergyConsent || !allergyConsent.checked) {
          alert("Debes aceptar la política de seguridad alimentaria y revisión de etiquetas para continuar.");
          return; // Abortar envío
        }
      }

      const btnSubmit = paymentForm.querySelector('button[type="submit"]');
      const originalText = btnSubmit.innerText;
      btnSubmit.innerText = 'Procesando...';
      btnSubmit.style.backgroundColor = 'var(--bg-amarillo)';
      btnSubmit.style.color = 'var(--black)';
      btnSubmit.disabled = true;

      // Generación del payload de pedido para la pasarela de pago
      const editionAssigned = calculateCurrentEdition();
      const planValue = document.querySelector('input[name="plan"]:checked').value;
      const paymentMethodElement = document.querySelector('input[name="payment_method"]:checked');
      const paymentMethod = paymentMethodElement ? paymentMethodElement.value : 'mercado_pago';
      
      const formattedPlan = planValue === 'quarterly' 
        ? 'Plan Trimestral (Pago Único 3 cajas)' 
        : 'Compra Única (1 caja)';
        
      console.log(`[Pasarela de Pago] Iniciando checkout...\nPlan: ${formattedPlan}\nMétodo: ${paymentMethod}\nAsignado a: ${editionAssigned}`);

      // Gather form data
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
        payment_method: paymentMethod
      };

      const functionsUrl = import.meta.env?.VITE_SUPABASE_FUNCTIONS_URL || 'http://127.0.0.1:54321/functions/v1';

      fetch(`${functionsUrl}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error procesando la orden');
        
        paymentForm.style.display = 'none';
        
        const successModal = document.getElementById('success-modal');
        const successMsg = document.getElementById('success-message');
        const transferDetails = document.getElementById('transfer-details');
        
        if (successModal) successModal.style.display = 'block';
        
        if (paymentMethod === 'transfer') {
          if (successMsg) successMsg.innerText = '¡Reserva confirmada! Completa el pago con los siguientes datos:';
          if (transferDetails) transferDetails.style.display = 'block';
        } else if (data.init_point) {
          if (successMsg) successMsg.innerText = 'Redirigiendo a Mercado Pago... 🚀';
          if (transferDetails) transferDetails.style.display = 'none';
          window.location.href = data.init_point;
        }
      })
      .catch(err => {
        console.error(err);
        btnSubmit.innerText = originalText;
        btnSubmit.style.backgroundColor = '';
        btnSubmit.style.color = '';
        btnSubmit.disabled = false;
        alert('Ocurrió un error al procesar tu pedido. Intenta nuevamente.');
      });
    });
  }

  // 6. Smooth scroll para "Unirse Ahora" del header
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

// C. Draggable Stickers Logic with Physics (Bounce & Collisions)
let stickers = [];
let animationFrameId = null;

function initDraggableStickers() {
  const layer = document.getElementById('stickers-layer');
  if (!layer) return;

  const stickerData = [
    { src: '/imagenes/alfajor.png', x: 5, y: 15 },
    { src: '/imagenes/chips.png', x: 80, y: 40 },
    { src: '/imagenes/dulces.png', x: 10, y: 35 },
    { src: '/imagenes/joystick.png', x: 70, y: 80 },
    { src: '/imagenes/paleta.png', x: 45, y: 60 },
    { src: '/imagenes/palomitas.png', x: 20, y: 85 },
    { src: '/imagenes/polaroid.png', x: 60, y: 20 },
    { src: '/imagenes/Compu.png', x: 30, y: 50 }
  ];

  const isMobile = window.innerWidth <= 768;
  const size = isMobile ? 50 : 100;
  const radius = isMobile ? 22 : 45;

  stickerData.forEach((data, index) => {
    const stickerEl = document.createElement('div');
    stickerEl.classList.add('draggable-sticker');
    stickerEl.id = `sticker-${index}`;
    
    // Float wrapper (keeps the gentle CSS up/down bounce)
    const floatWrap = document.createElement('div');
    floatWrap.classList.add('sticker-inner-float');
    floatWrap.style.animationDelay = `${Math.random() * -5}s`;
    
    const img = document.createElement('img');
    img.src = data.src;
    img.alt = 'Sticker';
    img.style.maxWidth = `${size}px`;
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.pointerEvents = 'none';
    floatWrap.appendChild(img);
    stickerEl.appendChild(floatWrap);
    
    // Initial rotation
    const rotation = (Math.random() - 0.5) * 40;
    stickerEl.style.rotate = `${rotation}deg`;

    layer.appendChild(stickerEl);

    // Physics data
    const sticker = {
      el: stickerEl,
      id: index,
      width: size, // Matching CSS width
      height: size,
      x: (data.x / 100) * window.innerWidth,
      y: (data.y / 100) * (window.innerHeight || document.documentElement.clientHeight),
      vx: (Math.random() - 0.5) * 2, // Random initial velocity
      vy: (Math.random() - 0.5) * 2,
      isDragging: false,
      radius: radius // For circular collision detection
    };

    stickers.push(sticker);
    makeDraggable(sticker);
  });

  // Start the animation loop
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(updateStickers);
  }
}

function updateStickers() {
  const header = document.querySelector('.neo-header');
  const footer = document.querySelector('.neo-footer');
  const headerRect = header ? header.getBoundingClientRect() : { bottom: 0 };
  const footerRect = footer ? footer.getBoundingClientRect() : { top: window.innerHeight };

  const isMobile = window.innerWidth <= 768;
  const size = isMobile ? 50 : 100;
  const minX = 0;
  const maxX = window.innerWidth - size;
  const minY = headerRect.bottom;
  const maxY = footerRect.top - size;

  stickers.forEach((s, i) => {
    if (s.isDragging) return;

    // Movement
    s.x += s.vx;
    s.y += s.vy;

    // Boundary Collisions (Walls)
    if (s.x <= minX) { s.x = minX; s.vx *= -1; }
    if (s.x >= maxX) { s.x = maxX; s.vx *= -1; }
    if (s.y <= minY) { s.y = minY; s.vy *= -1; }
    if (s.y >= maxY) { s.y = maxY; s.vy *= -1; }

    // Inter-sticker collisions (Simple distance-based bounce)
    for (let j = i + 1; j < stickers.length; j++) {
      const s2 = stickers[j];
      const dx = s2.x - s.x;
      const dy = s2.y - s.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = s.radius + s2.radius;

      if (distance < minDistance) {
        // Resolve overlap
        const overlap = minDistance - distance;
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Move them apart slightly to prevent sticking
        s.x -= nx * (overlap / 2);
        s.y -= ny * (overlap / 2);
        s2.x += nx * (overlap / 2);
        s2.y += ny * (overlap / 2);

        // Swap velocities (elastic collision simplified)
        const v1_normal = s.vx * nx + s.vy * ny;
        const v2_normal = s2.vx * nx + s2.vy * ny;

        const dv = v1_normal - v2_normal;

        s.vx -= dv * nx;
        s.vy -= dv * ny;
        s2.vx += dv * nx;
        s2.vy += dv * ny;
      }
    }

    // Apply transformation
    s.el.style.translate = `${s.x}px ${s.y}px`;
    // Store for potential persistence or query
    s.el.dataset.accX = s.x;
    s.el.dataset.accY = s.y;
  });

  animationFrameId = requestAnimationFrame(updateStickers);
}

function makeDraggable(sticker) {
  const element = sticker.el;
  let startX, startY;

  element.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    startX = e.clientX;
    startY = e.clientY;
    sticker.isDragging = true;

    // Reliability: Capture pointer to avoid losing it during fast movement
    element.setPointerCapture(e.pointerId);
    
    // UI state
    element.classList.add('dragging');
    element.style.cursor = 'grabbing';
    
    const onPointerMove = (ev) => {
      if (!sticker.isDragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      
      sticker.x += dx;
      sticker.y += dy;
      
      startX = ev.clientX;
      startY = ev.clientY;

      element.style.translate = `${sticker.x}px ${sticker.y}px`;
    };

    const onPointerUp = (ev) => {
      if (!sticker.isDragging) return;
      sticker.isDragging = false;

      element.releasePointerCapture(ev.pointerId);
      element.classList.remove('dragging');
      element.style.cursor = 'grab';
      
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
    };

    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    
    e.preventDefault();
  });
}
// D. Dynamic Totals Calculation

function calculateCurrentEdition() {
  const now = new Date();
  let monthIndex = now.getMonth(); // 0-11
  const day = now.getDate();

  if (day > 5) {
    monthIndex = (monthIndex + 1) % 12;
  }
  if (isPreorderMode) {
    monthIndex = (monthIndex + 1) % 12;
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return `Edición ${months[monthIndex]}`;
}

function updateCheckoutTotals() {
  const summarySubtotalLabel = document.getElementById('summary-subtotal-label');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDelivery = document.getElementById('summary-delivery');
  const summaryTotal = document.getElementById('summary-total');
 
  if (!summarySubtotal) return;
 
  const qty = 1; // Fixed quantity 
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  const isQuarterly = selectedPlan && selectedPlan.value === 'quarterly';
  const pricePerBox = isQuarterly ? 40500 : 45000;
  
  const subtotal = qty * pricePerBox;
  
  // Lógica de costo de envío por CP
  const cpInput = document.getElementById('cpInput');
  const cp = cpInput ? parseInt(cpInput.value) || 0 : 0;
  let deliveryFee = 0;
  let deliveryText = "A calcular";

  if (cp >= 1000 && cp <= 1499) {
    deliveryFee = 2500; // CABA
  } else if (cp >= 1600 && cp <= 1900) {
    deliveryFee = 4000; // GBA
  } else if (cp > 0) {
    deliveryFee = 6000; // Interior
  }

  if (deliveryFee > 0) {
    deliveryText = `$${deliveryFee.toLocaleString('es-AR')}`;
  }
 
  if (summarySubtotalLabel) {
    summarySubtotalLabel.innerText = isQuarterly ? 'Subtotal (3 boxes):' : 'Subtotal (1 box):';
  }
  
  summarySubtotal.innerText = `$${subtotal.toLocaleString('es-AR')}`;
  summaryDelivery.innerText = deliveryText;
  summaryTotal.innerText = `$${(subtotal + deliveryFee).toLocaleString('es-AR')}`;
}

// E. Automated Stock Widget Month
function updateStockWidget() {
  const stockWidget = document.querySelector('.stock-widget');
  const stockNum = document.querySelector('.stock-number');
  const stockText = document.querySelector('.stock-text');

  const now = new Date();
  let currentSaleMonthIndex = now.getMonth(); // 0-11
  const day = now.getDate();

  // If 5th or later, the current sale is for the next month
  if (day > 5) {
    currentSaleMonthIndex = (currentSaleMonthIndex + 1) % 12;
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const preorderMonthSpan = document.getElementById('preorder-month');
  if (preorderMonthSpan) {
    preorderMonthSpan.innerText = months[(now.getMonth() + 1) % 12];
  }

  if (!stockNum || !stockText || !stockWidget) return;

  if (AVAILABLE_STOCK <= 0) {
    stockWidget.classList.add('sold-out');
    stockNum.innerText = '';
    stockText.innerText = '¡Edición\nAgotada!';
    stockText.style.fontWeight = 'bold';
    stockText.style.fontSize = '1.1rem';
    return;
  }

  stockNum.innerText = AVAILABLE_STOCK.toString();
  stockText.innerText = `boxes restantes\npara ${months[currentSaleMonthIndex]}!`;
}


// G. Dynamic Header Logo Resize
function initDynamicHeader() {
  const headerLogo = document.querySelector('.header-logo');
  const heroLogo = document.querySelector('.hero-logo-relief');

  if (!headerLogo || !heroLogo) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        // Hero logo is out of view -> Grow header logo
        headerLogo.classList.add('grown');
      } else {
        // Hero logo is in view -> Shrink header logo
        headerLogo.classList.remove('grown');
      }
    });
  }, {
    threshold: 0 // Trigger as soon as it leave/enters view
  });

  observer.observe(heroLogo);
}

// H. Mystery Product Reveal "Lens" Effect
function initMysteryReveal() {
  const containers = document.querySelectorAll('.mystery-item-container');

  containers.forEach(container => {
    const handleMove = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left - (rect.width * 0.05);
      const y = clientY - rect.top - (rect.height * 0.05);
      const isMobile = window.innerWidth <= 768;
      const lensRadius = isMobile ? '30px' : '45px';

      container.style.setProperty('--reveal-x', `${x}px`);
      container.style.setProperty('--reveal-y', `${y}px`);
      container.style.setProperty('--reveal-radius', lensRadius);
    };

    container.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    container.addEventListener('mouseleave', () => {
      container.style.setProperty('--reveal-radius', '0px');
    });

    container.addEventListener('touchend', () => {
      container.style.setProperty('--reveal-radius', '0px');
    });
  });
}

// I. Retro Music Player
function initRetroPlayer() {
  const audio = document.getElementById('bgMusic');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const volSlider = document.getElementById('volSlider');
  const minBtn = document.getElementById('playerMinBtn');
  const player = document.getElementById('retroPlayer');

  if (!audio || !playPauseBtn) return;

  const playlist = [
    "/music/track1.mp3", // Track 1: Pop/Synth original
    "/music/track2_new.mp3", // Track 2: Acústico (Kevin MacLeod - Carefree)
    "/music/track3.mp3", // Track 3: Electro-pop fuerte
    "/music/track4_new.mp3"  // Track 4: Blues Acústico (Kevin MacLeod - Fretless)
  ];
  let currentTrack = 0;

  // Initialize first track
  audio.src = playlist[currentTrack];
  audio.volume = volSlider.value;
  let isPlaying = false;

  const playSong = () => {
    audio.play().catch(e => console.log('Autoplay blocked:', e));
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    isPlaying = true;
  };

  const pauseSong = () => {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    isPlaying = false;
  };

  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) pauseSong();
    else playSong();
  });

  stopBtn.addEventListener('click', () => {
    pauseSong();
    audio.currentTime = 0;
  });

  const nextSong = () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    audio.src = playlist[currentTrack];
    audio.load();
    if (isPlaying) playSong();
  };

  const prevSong = () => {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    audio.src = playlist[currentTrack];
    audio.load();
    if (isPlaying) playSong();
  };

  if (nextBtn) nextBtn.addEventListener('click', nextSong);
  if (prevBtn) prevBtn.addEventListener('click', prevSong);

  // Auto-play next song in loop when current finishes
  audio.addEventListener('ended', nextSong);

  volSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });

  if (minBtn) {
    minBtn.addEventListener('click', () => {
      player.classList.toggle('minimized');
      minBtn.innerText = player.classList.contains('minimized') ? '+' : '-';
    });
  }
}
