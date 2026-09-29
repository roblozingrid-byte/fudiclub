import { vi } from 'vitest';

// Mock posthog-js globally
vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

// Mock window methods not in jsdom
window.scrollTo = vi.fn();
window.alert = vi.fn();
window.fetch = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: async () => ({}) }));
global.fetch = window.fetch;
Element.prototype.scrollIntoView = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
    global.lastObserverCallback = callback;
  }
  observe(element) {
    this.element = element;
  }
  unobserve() {}
  disconnect() {}
};

// Mock HTMLMediaElement methods
window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();
