// Fudi Club Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  initDraggableStickers();
  initAllergyToggle();
  initCheckoutFlow();
  updateStockWidget();
  updateCheckoutTotals(); // Initial calculation
  initGoogleMaps();
  initDynamicHeader();
  initMysteryReveal();
});

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

  // 3. Controles +/- de cantidad
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', () => {
      const val = parseInt(qtyInput.value);
      if (val > 1) {
        qtyInput.value = val - 1;
        updateCheckoutTotals();
      }
    });
    qtyPlus.addEventListener('click', () => {
      const val = parseInt(qtyInput.value);
      if (val < 5) {
        qtyInput.value = val + 1;
        updateCheckoutTotals();
      }
    });
    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 5) val = 5;
      qtyInput.value = val;
      updateCheckoutTotals();
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

  // 5. Simular pago exitoso
  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btnSubmit = paymentForm.querySelector('button[type="submit"]');
      btnSubmit.innerText = 'Procesando...';
      btnSubmit.style.backgroundColor = 'var(--bg-amarillo)';
      btnSubmit.disabled = true;

      setTimeout(() => {
        btnSubmit.innerText = '¡Pago Exitoso! ✨';
        btnSubmit.style.backgroundColor = 'var(--accent-verde)';
      }, 1500);
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

// C. Draggable Stickers Logic
function initDraggableStickers() {
  const layer = document.getElementById('stickers-layer');
  if (!layer) return;

  const stickerData = [
    { src: '/imagenes/alfajor.png', x: 5, y: 15 },
    { src: '/imagenes/chips.png', x: 80, y: 40 },
    { src: '/imagenes/dulces.png', x: 10, y: 120 },
    { src: '/imagenes/joystick.png', x: 70, y: 150 },
    { src: '/imagenes/paleta.png', x: 45, y: 80 },
    { src: '/imagenes/palomitas.png', x: 20, y: 180 },
    { src: '/imagenes/polaroid.png', x: 60, y: 10 },
    { src: '/imagenes/Compu.png', x: 30, y: 50 }
  ];

  const driftClasses = ['sticker-drift-h', 'sticker-drift-v', 'sticker-drift-d'];

  stickerData.forEach((data, index) => {
    const sticker = document.createElement('div');
    sticker.classList.add('draggable-sticker');
    sticker.id = `sticker-${index}`;
    
    // Initial scattering
    sticker.style.left = `${data.x}vw`;
    sticker.style.top = `${data.y}vh`;

    // Drift wrapper (varied paths)
    const drift = document.createElement('div');
    // Randomly assign a drift path
    const randomClass = driftClasses[Math.floor(Math.random() * driftClasses.length)];
    drift.classList.add(randomClass);
    
    // Randomize drift timing for variety - making it much slower now for site-wide bounce
    drift.style.animationDelay = `${Math.random() * -60}s`;
    drift.style.animationDuration = `${40 + Math.random() * 30}s`;
    sticker.appendChild(drift);

    // Float wrapper (for the up/down bounce)
    const floatWrap = document.createElement('div');
    floatWrap.classList.add('sticker-inner-float');
    floatWrap.style.animationDelay = `${Math.random() * -5}s`;
    floatWrap.style.animationDuration = `${3 + Math.random() * 2}s`;
    drift.appendChild(floatWrap);

    const img = document.createElement('img');
    img.src = data.src;
    img.alt = 'Sticker';
    img.style.maxWidth = '100px';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.pointerEvents = 'none'; // so it doesn't interfere with dragging
    floatWrap.appendChild(img);
    // Use standalone 'rotate' to avoid clashing with 'translate' and 'transform'
    sticker.style.rotate = `${(Math.random() - 0.5) * 40}deg`;

    layer.appendChild(sticker);
    makeDraggable(sticker);
  });
}

function makeDraggable(element) {
  let isDragging = false;
  let startX, startY;
  let initialTranslateX = 0, initialTranslateY = 0;

  element.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Capture current translate from dataset to avoid reading complex styles
    initialTranslateX = parseFloat(element.dataset.accX) || 0;
    initialTranslateY = parseFloat(element.dataset.accY) || 0;

    startX = e.clientX;
    startY = e.clientY;
    isDragging = true;

    // Reliability: Capture pointer to avoid losing it during fast movement
    element.setPointerCapture(e.pointerId);
    
    // UI state
    element.classList.add('dragging');
    element.style.cursor = 'grabbing';
    
    // Pause animations
    const drift = element.querySelector('[class*="sticker-drift"]');
    if (drift) drift.style.animationPlayState = 'paused';

    const onPointerMove = (ev) => {
      if (!isDragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      
      const currentX = initialTranslateX + dx;
      const currentY = initialTranslateY + dy;
      
      // Use 'translate' property (works alongside 'rotate' and 'transform')
      element.style.translate = `${currentX}px ${currentY}px`;
      
      // Store current state for persistence
      element.dataset.accX = currentX;
      element.dataset.accY = currentY;
    };

    const onPointerUp = (ev) => {
      if (!isDragging) return;
      isDragging = false;

      element.releasePointerCapture(ev.pointerId);
      element.classList.remove('dragging');
      element.style.cursor = 'grab';
      
      if (drift) drift.style.animationPlayState = 'running';

      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
    };

    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    
    e.preventDefault();
  });
}
// D. Dynamic Totals Calculation
function updateCheckoutTotals() {
  const qtyInput = document.getElementById('qtyInput');
  const summaryQty = document.getElementById('summary-qty');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDelivery = document.getElementById('summary-delivery');
  const summaryTotal = document.getElementById('summary-total');

  if (!qtyInput || !summaryQty) return;

  const qty = parseInt(qtyInput.value) || 1;
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  const pricePerBox = (selectedPlan && selectedPlan.value === 'quarterly') ? 40500 : 45000;
  
  const subtotal = qty * pricePerBox;
  const deliveryFee = 2500; // Fixed fee for now, can be dynamic based on distance

  summaryQty.innerText = qty;
  summarySubtotal.innerText = `$${subtotal.toLocaleString('es-AR')}`;
  summaryDelivery.innerText = `$${deliveryFee.toLocaleString('es-AR')}`;
  summaryTotal.innerText = `$${(subtotal + deliveryFee).toLocaleString('es-AR')}`;
}

// E. Automated Stock Widget Month
function updateStockWidget() {
  const stockNum = document.querySelector('.stock-number');
  const stockText = document.querySelector('.stock-text');
  if (!stockNum || !stockText) return;

  const now = new Date();
  let monthIndex = now.getMonth(); // 0-11
  const day = now.getDate();

  // If 15th or later, show next month
  if (day >= 15) {
    monthIndex = (monthIndex + 1) % 12;
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  stockNum.innerText = '50';
  stockText.innerText = `boxes restantes\npara ${months[monthIndex]}!`;
}

// F. Google Maps Autocomplete & Confirmation
function initGoogleMaps() {
  const addressInput = document.getElementById('addressInput');
  const mapContainer = document.getElementById('address-map-container');
  const mapDiv = document.getElementById('address-map');

  if (!addressInput || !window.google) return;

  const autocomplete = new google.maps.places.Autocomplete(addressInput, {
    types: ['address'],
    componentRestrictions: { country: 'AR' } // Restricted to Argentina as per previous context
  });

  const map = new google.maps.Map(mapDiv, {
    zoom: 15,
    center: { lat: -34.6037, lng: -58.3816 }, // Default (BA)
    mapTypeControl: false,
    streetViewControl: false
  });

  const marker = new google.maps.Marker({
    map: map,
    draggable: false
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;

    mapContainer.style.display = 'block';
    
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

    marker.setPosition(place.geometry.location);
    
    // Simulate dynamic delivery fee update based on area
    const summaryDelivery = document.getElementById('summary-delivery');
    if (summaryDelivery) {
      // Mock logic: further addresses slightly more expensive
      const isDistant = place.formatted_address.toLowerCase().includes('provincia');
      const fee = isDistant ? 4500 : 2500;
      summaryDelivery.innerText = `$${fee.toLocaleString('es-AR')}`;
      updateCheckoutTotalsFromFee(fee);
    }
  });

  // Expose for window if needed
  window.fudiMap = map;
}

function updateCheckoutTotalsFromFee(deliveryFee) {
  const qtyInput = document.getElementById('qtyInput');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryTotal = document.getElementById('summary-total');

  if (!qtyInput || !summarySubtotal) return;

  const qty = parseInt(qtyInput.value) || 1;
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  const pricePerBox = (selectedPlan && selectedPlan.value === 'quarterly') ? 40500 : 45000;
  
  const subtotal = qty * pricePerBox;
  summaryTotal.innerText = `$${(subtotal + deliveryFee).toLocaleString('es-AR')}`;
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
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      container.style.setProperty('--reveal-x', `${x}px`);
      container.style.setProperty('--reveal-y', `${y}px`);
      container.style.setProperty('--reveal-radius', '45px');
    });

    container.addEventListener('mouseleave', () => {
      container.style.setProperty('--reveal-radius', '0px');
    });
  });
}
