let stickers = [];
let animationFrameId = null;

let headerRectCache = null;
let footerRectCache = null;
let windowWidthCache = window.innerWidth;
let windowHeightCache = window.innerHeight;

function updateCaches() {
  const header = document.querySelector('.neo-header');
  const footer = document.querySelector('.neo-footer');
  headerRectCache = header ? header.getBoundingClientRect() : { bottom: 0 };
  footerRectCache = footer ? footer.getBoundingClientRect() : { top: window.innerHeight };
  windowWidthCache = window.innerWidth;
  windowHeightCache = window.innerHeight;
}

export function initDraggableStickers() {
  const layer = document.getElementById('stickers-layer');
  if (!layer) return;

  const stickerData = [
    { src: '/imagenes/Alfajor sf.webp', x: 5, y: 15 },
    { src: '/imagenes/Paleta sf.webp', x: 80, y: 40 },
    { src: '/imagenes/Dulces sf.webp', x: 10, y: 35 },
    { src: '/imagenes/Joystick sf.webp', x: 70, y: 80 },
    { src: '/imagenes/Chips sf.webp', x: 45, y: 60 },
    { src: '/imagenes/Popcorn sf.webp', x: 20, y: 85 },
    { src: '/imagenes/Camara sf.webp', x: 60, y: 20 },
    { src: '/imagenes/Compu sf.webp', x: 30, y: 50 }
  ];

  updateCaches();
  window.addEventListener('resize', updateCaches);

  const isMobile = windowWidthCache <= 768;
  const size = isMobile ? 35 : 100;
  const radius = isMobile ? 18 : 45;
  
  if (isMobile) {
    const size = 60; // Más grandes
    const sections = document.querySelectorAll('.neo-border-section, .teaser');
    
    sections.forEach((section, index) => {
      // No poner separador después de la última sección
      if (index === sections.length - 1) return;
      
      let data = stickerData[index % stickerData.length];
      
      // Pedido especial: La "compu" después del banner turquesa (about-fudi)
      if (section.classList.contains('about-fudi')) {
        const compuSticker = stickerData.find(s => s.src.includes('Compu'));
        if (compuSticker) data = compuSticker;
      }
      
      const separatorWrap = document.createElement('div');
      separatorWrap.style.display = 'flex';
      separatorWrap.style.justifyContent = 'center';
      separatorWrap.style.alignItems = 'center';
      separatorWrap.style.width = '100%';
      separatorWrap.style.margin = '20px 0'; // Mejor espaciado vertical
      
      const img = document.createElement('img');
      img.src = data.src;
      img.alt = 'Sticker Separador';
      img.style.width = `${size}px`;
      img.style.height = 'auto';
      img.style.display = 'inline-block';
      img.style.pointerEvents = 'none';
      
      // Animación suave de rotación
      const rotation = (Math.random() - 0.5) * 40;
      img.style.transform = `rotate(${rotation}deg)`;
      
      separatorWrap.appendChild(img);
      section.insertAdjacentElement('afterend', separatorWrap);
    });
    return; // Stop here, no dragging or bouncing for mobile
  }

  stickerData.forEach((data, index) => {
    const stickerEl = document.createElement('div');
    stickerEl.classList.add('draggable-sticker');
    stickerEl.id = `sticker-${index}`;
    
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
    
    const rotation = (Math.random() - 0.5) * 40;
    stickerEl.style.rotate = `${rotation}deg`;

    layer.appendChild(stickerEl);

    const sticker = {
      el: stickerEl,
      id: index,
      width: size,
      height: size,
      x: (data.x / 100) * windowWidthCache,
      y: (data.y / 100) * windowHeightCache,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      isDragging: false,
      radius: radius
    };

    stickers.push(sticker);
    makeDraggable(sticker);
  });

  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(updateStickers);
  }
}

function updateStickers() {
  const isMobile = windowWidthCache <= 768;
  const size = isMobile ? 50 : 100;
  const minX = 0;
  const maxX = windowWidthCache - size;
  const minY = headerRectCache.bottom;
  const maxY = footerRectCache.top - size;

  stickers.forEach((s, i) => {
    if (s.isDragging) return;

    s.x += s.vx;
    s.y += s.vy;

    if (s.x <= minX) { s.x = minX; s.vx *= -1; }
    if (s.x >= maxX) { s.x = maxX; s.vx *= -1; }
    if (s.y <= minY) { s.y = minY; s.vy *= -1; }
    if (s.y >= maxY) { s.y = maxY; s.vy *= -1; }

    for (let j = i + 1; j < stickers.length; j++) {
      const s2 = stickers[j];
      const dx = s2.x - s.x;
      const dy = s2.y - s.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = s.radius + s2.radius;

      if (distance < minDistance) {
        const overlap = minDistance - distance;
        const nx = dx / distance;
        const ny = dy / distance;
        
        s.x -= nx * (overlap / 2);
        s.y -= ny * (overlap / 2);
        s2.x += nx * (overlap / 2);
        s2.y += ny * (overlap / 2);

        const v1_normal = s.vx * nx + s.vy * ny;
        const v2_normal = s2.vx * nx + s2.vy * ny;
        const dv = v1_normal - v2_normal;

        s.vx -= dv * nx;
        s.vy -= dv * ny;
        s2.vx += dv * nx;
        s2.vy += dv * ny;
      }
    }

    s.el.style.translate = `${s.x}px ${s.y}px`;
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

    element.setPointerCapture(e.pointerId);
    
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
