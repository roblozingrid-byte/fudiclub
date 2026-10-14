import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../worker/index.js';

describe('worker/index.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_123' }),
      text: async () => 'ok',
    });
  });

  it('redirects www.fudiclub.shop to fudiclub.shop with 301 status', async () => {
    const request = new Request('https://www.fudiclub.shop/empresas?ref=promo');
    const env = {
      ASSETS: {
        fetch: vi.fn(),
      },
    };

    const response = await worker.fetch(request, env, {});

    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('https://fudiclub.shop/empresas?ref=promo');
    expect(env.ASSETS.fetch).not.toHaveBeenCalled();
  });

  it('serves static assets for apex domain fudiclub.shop', async () => {
    const request = new Request('https://fudiclub.shop/');
    const mockAssetResponse = new Response('<html>Fudi Club</html>', { status: 200 });
    const env = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(mockAssetResponse),
      },
    };

    const response = await worker.fetch(request, env, {});

    expect(env.ASSETS.fetch).toHaveBeenCalledWith(request);
    expect(response).toBe(mockAssetResponse);
  });

  it('handles /api/cotizacion OPTIONS with CORS headers', async () => {
    const request = new Request('https://fudiclub.shop/api/cotizacion', {
      method: 'OPTIONS',
    });
    const env = {};

    const response = await worker.fetch(request, env, {});

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('handles /api/cotizacion POST and sends quote email via Resend', async () => {
    const payload = {
      nombre: 'Valen Rossi',
      empresa: 'Globant',
      email: 'valen@globant.com',
      telefono: '+54 11 9999 8888',
      ocasion: 'Welcome Kit / Onboarding',
      cantidad: '25 a 50',
      entrega: 'Envíos individuales a casas de empleados',
      detalles: 'Para primeros ingresos de noviembre',
    };

    const request = new Request('https://fudiclub.shop/api/cotizacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const env = {
      RESEND_API_KEY: 're_test_123',
      ADMIN_NOTIFICATION_EMAIL: 'robloz.ingrid@gmail.com',
    };

    const response = await worker.fetch(request, env, {});
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer re_test_123',
        }),
      })
    );

    const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(callBody.subject).toContain('Globant');
    expect(callBody.html).toContain('Valen Rossi');
    expect(callBody.html).toContain('valen@globant.com');

    // Verifica que se invoque la sincronización a Google Sheets
    expect(global.fetch).toHaveBeenCalledWith(
      'https://oxoodwpkbprkyenxiqsf.supabase.co/functions/v1/sync-to-sheets',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: expect.stringContaining('"type":"corporate_quote"'),
      })
    );
  });

  it('returns 400 when required fields are missing on /api/cotizacion', async () => {
    const request = new Request('https://fudiclub.shop/api/cotizacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Solo Nombre' }),
    });

    const response = await worker.fetch(request, {}, {});
    expect(response.status).toBe(400);
  });
});
