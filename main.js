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
    img.style.maxWidth = '100px';
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
      width: 100, // Matching CSS width
      height: 100,
      x: (data.x / 100) * window.innerWidth,
      y: (data.y / 100) * (window.innerHeight || document.documentElement.clientHeight),
      vx: (Math.random() - 0.5) * 2, // Random initial velocity
      vy: (Math.random() - 0.5) * 2,
      isDragging: false,
      radius: 45 // For circular collision detection
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

  const minX = 0;
  const maxX = window.innerWidth - 100;
  const minY = headerRect.bottom;
  const maxY = footerRect.top - 100;

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
  const deliveryFee = 2500; // Fixed fee for now, can be dynamic
 
  if (summarySubtotalLabel) {
    summarySubtotalLabel.innerText = isQuarterly ? 'Subtotal (Box 1 de 3):' : 'Subtotal (1 box):';
  }
  
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
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryTotal = document.getElementById('summary-total');

  if (!summarySubtotal) return;

  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  const pricePerBox = (selectedPlan && selectedPlan.value === 'quarterly') ? 40500 : 45000;
  
  const subtotal = pricePerBox;
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
