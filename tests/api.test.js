import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AVAILABLE_STOCK, isPreorderMode, setPreorderMode, fetchStock } from '../src/api.js';

describe('src/api.js', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    document.body.innerHTML = `
      <span class="stock-number">0</span>
      <span id="stock-number">0</span>
    `;
    setPreorderMode(false);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('manages preorder mode state', () => {
    expect(isPreorderMode).toBe(false);
    setPreorderMode(true);
    expect(isPreorderMode).toBe(true);
    setPreorderMode(false);
    expect(isPreorderMode).toBe(false);
  });

  it('fetchStock successfully fetches stock and updates DOM and dispatches stockUpdated event', async () => {
    const mockStock = 17;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stock: mockStock })
    });

    let eventDetail = null;
    const stockListener = (e) => {
      eventDetail = e.detail;
    };
    window.addEventListener('stockUpdated', stockListener);

    await fetchStock();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/get-stock'),
      expect.objectContaining({ method: 'GET', cache: 'no-store' })
    );

    const stockEls = document.querySelectorAll('.stock-number, #stock-number');
    stockEls.forEach(el => {
      expect(el.innerText).toBe(mockStock.toString());
    });

    expect(eventDetail).toEqual({ stock: mockStock });

    window.removeEventListener('stockUpdated', stockListener);
  });

  it('fetchStock falls back to join-waitlist if get-stock returns not ok', async () => {
    const mockStock = 8;
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stock: mockStock })
      });

    await fetchStock();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch.mock.calls[0][0]).toContain('/get-stock');
    expect(global.fetch.mock.calls[1][0]).toContain('/join-waitlist');

    const stockEls = document.querySelectorAll('.stock-number');
    expect(stockEls[0].innerText).toBe(mockStock.toString());
  });

  it('fetchStock handles network failure gracefully without throwing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(fetchStock()).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching stock dynamically', expect.any(Error));
  });
});
