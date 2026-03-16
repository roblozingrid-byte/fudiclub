// Fudi Club Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  initDraggableStickers();
  initAllergyToggle();
  initCheckoutFlow();
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
    });
  });

  // 3. Controles +/- de cantidad
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', () => {
      const val = parseInt(qtyInput.value);
      if (val > 1) qtyInput.value = val - 1;
    });
    qtyPlus.addEventListener('click', () => {
      const val = parseInt(qtyInput.value);
      if (val < 10) qtyInput.value = val + 1;
    });
  }

  // 4. Allergy Toggle
  const allergyToggle = document.getElementById('allergyToggle');
  const allergyDetails = document.getElementById('allergyDetails');
  if (allergyToggle && allergyDetails) {
    allergyToggle.addEventListener('change', (e) => {
      allergyDetails.style.display = e.target.checked ? 'block' : 'none';
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
    { text: '🌟', color: '#ffb7d5', x: 10, y: 20 },
    { text: '💥', color: '#d1ff5e', x: 80, y: 15 },
    { text: '🍕', color: '#fff4bd', x: 15, y: 60 },
    { text: '🕹️', color: '#4ebaba', x: 75, y: 70 },
    { text: 'TOP SECRET', color: '#000', bgColor: '#d1ff5e', x: 50, y: 90, isText: true }
  ];

  stickerData.forEach((data, index) => {
    const sticker = document.createElement('div');
    sticker.classList.add('draggable-sticker');
    sticker.id = `sticker-${index}`;
    
    // Position using percentages so they scatter across the layout
    sticker.style.left = `${data.x}vw`;
    // We add absolute px offset for y to keep them flowing down the page
    sticker.style.top = `${data.y * 20}px`;

    if (data.isText) {
      sticker.innerText = data.text;
      sticker.style.backgroundColor = data.bgColor;
      sticker.style.color = data.color;
      sticker.style.padding = '5px 10px';
      sticker.style.border = '2px solid black';
      sticker.style.fontFamily = "'VT323', monospace";
      sticker.style.fontSize = '1.5rem';
      sticker.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg)`;
    } else {
      sticker.innerText = data.text;
      // Make emoji stickers large and circular
      sticker.style.backgroundColor = data.color;
      sticker.style.fontSize = '2rem';
      sticker.style.padding = '10px';
      sticker.style.border = '2px solid black';
      sticker.style.borderRadius = '50%';
      sticker.style.width = '60px';
      sticker.style.height = '60px';
      sticker.style.display = 'flex';
      sticker.style.alignItems = 'center';
      sticker.style.justifyContent = 'center';
      sticker.style.transform = `rotate(${(Math.random() - 0.5) * 40}deg)`;
    }

    layer.appendChild(sticker);
    makeDraggable(sticker);
  });
}

function makeDraggable(element) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  element.addEventListener('pointerdown', dragStart);
  document.addEventListener('pointerup', dragEnd);
  document.addEventListener('pointermove', drag);

  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === element) {
      isDragging = true;
      element.style.zIndex = '1000'; // bring above other stickers
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
    element.style.zIndex = '';
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      element.style.translate = `${currentX}px ${currentY}px`;
    }
  }
}
