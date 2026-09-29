import { describe, it, expect, beforeEach, vi } from 'vitest';
import posthog from 'posthog-js';
import {
  initFAQ,
  initDynamicHeader,
  initMysteryReveal,
  initScrollDepthTracking
} from '../main.js';

describe('main.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initFAQ', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="faq-item" id="faq-1">
          <button class="faq-question">Pregunta 1</button>
          <div class="faq-answer">Respuesta 1</div>
        </div>
        <div class="faq-item" id="faq-2">
          <button class="faq-question">Pregunta 2</button>
          <div class="faq-answer">Respuesta 2</div>
        </div>
      `;
    });

    it('toggles active class on clicked item and removes it from siblings', () => {
      initFAQ();

      const item1 = document.getElementById('faq-1');
      const item2 = document.getElementById('faq-2');
      const q1 = item1.querySelector('.faq-question');
      const q2 = item2.querySelector('.faq-question');

      // Click first FAQ item
      q1.click();
      expect(item1.classList.contains('active')).toBe(true);
      expect(item2.classList.contains('active')).toBe(false);

      // Click second FAQ item
      q2.click();
      expect(item1.classList.contains('active')).toBe(false);
      expect(item2.classList.contains('active')).toBe(true);

      // Click second item again -> closes it
      q2.click();
      expect(item2.classList.contains('active')).toBe(false);
    });
  });

  describe('initDynamicHeader', () => {
    it('observes hero logo and toggles grown class on header logo', () => {
      document.body.innerHTML = `
        <header><img class="header-logo" /></header>
        <section><img class="hero-logo-relief" /></section>
      `;

      initDynamicHeader();

      const headerLogo = document.querySelector('.header-logo');

      // Trigger IntersectionObserver callback (not intersecting -> header grown)
      const observerInstance = global.IntersectionObserver.instances
        ? global.IntersectionObserver.instances[0]
        : null;

      // Manually trigger the mock callback
      const callback = global.lastObserverCallback;
      if (callback) {
        callback([{ isIntersecting: false }]);
        expect(headerLogo.classList.contains('grown')).toBe(true);

        callback([{ isIntersecting: true }]);
        expect(headerLogo.classList.contains('grown')).toBe(false);
      }
    });
  });

  describe('initMysteryReveal', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="mystery-item-container" style="width: 200px; height: 200px;">
          <img class="mystery-blur" />
        </div>
      `;
      vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => cb()));
    });

    it('updates reveal coordinates on mousemove and resets on mouseleave', () => {
      initMysteryReveal();

      const container = document.querySelector('.mystery-item-container');
      container.getBoundingClientRect = vi.fn(() => ({
        left: 50,
        top: 50,
        width: 200,
        height: 200
      }));

      // Mousemove at (100, 100)
      const moveEvent = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100,
        bubbles: true
      });
      container.dispatchEvent(moveEvent);

      expect(container.style.getPropertyValue('--reveal-radius')).toBe('45px');
      expect(container.style.getPropertyValue('--reveal-x')).toBeTruthy();
      expect(container.style.getPropertyValue('--reveal-y')).toBeTruthy();

      // Mouseleave
      const leaveEvent = new MouseEvent('mouseleave', { bubbles: true });
      container.dispatchEvent(leaveEvent);

      expect(container.style.getPropertyValue('--reveal-radius')).toBe('0px');
    });
  });

  describe('initScrollDepthTracking', () => {
    it('tracks milestone when scroll depth reached', () => {
      initScrollDepthTracking();

      // Mock scroll properties
      Object.defineProperty(window, 'scrollY', { value: 600, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 400, writable: true });
      Object.defineProperty(document.body, 'scrollHeight', { value: 1000, writable: true });

      window.dispatchEvent(new Event('scroll'));

      // Check if posthog capture was called
      expect(posthog.capture).toHaveBeenCalled();
    });
  });
});
