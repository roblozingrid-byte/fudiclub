import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initDraggableStickers } from '../src/stickers.js';

describe('src/stickers.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <header class="neo-header" style="height: 60px;"></header>
      <section class="neo-border-section about-fudi"></section>
      <section class="neo-border-section second-sec"></section>
      <section class="teaser"></section>
      <div id="stickers-layer"></div>
      <footer class="neo-footer"></footer>
    `;
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => 1));
  });

  it('exits safely if stickers-layer does not exist', () => {
    document.getElementById('stickers-layer').remove();
    expect(() => initDraggableStickers()).not.toThrow();
  });

  it('renders static separators on mobile viewport (<= 768px)', () => {
    window.innerWidth = 480;

    initDraggableStickers();

    const layer = document.getElementById('stickers-layer');
    expect(layer.children.length).toBe(0); // Desktop stickers not added to layer

    // Separators should be injected between sections
    const separators = document.querySelectorAll('img[alt="Sticker Separador"]');
    expect(separators.length).toBeGreaterThan(0);

    // After about-fudi, Compu sticker should be selected
    const compuSeparator = Array.from(separators).find(img => img.src.includes('Compu'));
    expect(compuSeparator).toBeDefined();
  });

  it('renders interactive floating stickers on desktop viewport (> 768px)', () => {
    window.innerWidth = 1200;

    initDraggableStickers();

    const layer = document.getElementById('stickers-layer');
    const stickers = layer.querySelectorAll('.draggable-sticker');

    expect(stickers.length).toBe(8);

    const firstSticker = stickers[0];
    expect(firstSticker.id).toBe('sticker-0');
    expect(firstSticker.querySelector('img')).toBeTruthy();
  });

  it('handles pointer drag interaction on desktop sticker', () => {
    window.innerWidth = 1200;
    initDraggableStickers();

    const sticker = document.getElementById('sticker-0');
    sticker.setPointerCapture = vi.fn();
    sticker.releasePointerCapture = vi.fn();

    // Trigger pointerdown
    const downEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      clientX: 100,
      clientY: 100,
      button: 0,
      pointerType: 'mouse'
    });
    sticker.dispatchEvent(downEvent);

    expect(sticker.classList.contains('dragging')).toBe(true);
    expect(sticker.setPointerCapture).toHaveBeenCalled();

    // Trigger pointermove
    const moveEvent = new MouseEvent('pointermove', {
      bubbles: true,
      clientX: 120,
      clientY: 130
    });
    sticker.dispatchEvent(moveEvent);

    expect(sticker.style.translate).toContain('px');

    // Trigger pointerup
    const upEvent = new MouseEvent('pointerup', {
      bubbles: true,
      pointerId: 1
    });
    sticker.dispatchEvent(upEvent);

    expect(sticker.classList.contains('dragging')).toBe(false);
  });
});
