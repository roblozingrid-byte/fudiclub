/**
 * Fudi Club Worker
 * Sirve el sitio estático de fudiclub.shop usando Workers Assets.
 * También maneja el redirect www → apex.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Redirigir www.fudiclub.shop → fudiclub.shop (301 permanente)
    if (url.hostname === 'www.fudiclub.shop') {
      return Response.redirect(
        `https://fudiclub.shop${url.pathname}${url.search}`,
        301
      );
    }

    // Servir assets estáticos del build de Vite (dist/)
    return env.ASSETS.fetch(request);
  },
};
