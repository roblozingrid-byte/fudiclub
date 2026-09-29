import { describe, it, expect, vi } from 'vitest';
import worker from '../worker/index.js';

describe('worker/index.js', () => {
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
});
