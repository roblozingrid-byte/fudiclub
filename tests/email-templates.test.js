import { describe, it, expect } from 'vitest';
import {
  formatDeadline,
  buildReminderHtml,
  buildTransferInstructionsEmail,
  buildPaymentConfirmedEmail
} from '../scripts/email-templates.mjs';

describe('scripts/email-templates.mjs', () => {
  it('formats deadline correctly 24 hours ahead', () => {
    const base = new Date('2026-10-05T14:30:00Z');
    const deadline = formatDeadline(base);
    expect(deadline).toContain('de');
    expect(deadline).toContain('hs');
  });

  it('builds reminder email with official branding and no Mercado Pago mention', () => {
    const html = buildReminderHtml({
      name: 'Camila Gomez',
      friendlyId: 'FUDI-10-TEST',
      total: 44900,
      edition: 'Octubre 2026',
      createdAt: '2026-10-05T12:00:00Z'
    });

    expect(html).toContain('¡Hola Camila!');
    expect(html).toContain('FUDI-10-TEST');
    expect(html).toContain('$44.900');
    expect(html).toContain('roblesingrid.bna');
    expect(html).toContain('#c79fef'); // Lila Fudi
    expect(html).toContain('#4ebaba'); // Turquesa Fudi
    expect(html).toContain('#d1ff5e'); // Verde Lima
    expect(html).not.toContain('Mercado Pago');
    expect(html).toContain('Plazo límite de confirmación');
  });

  it('builds transfer instructions email with official branding and WhatsApp link', () => {
    const html = buildTransferInstructionsEmail({
      name: 'Martin Lopez',
      friendlyId: 'FUDI-10-MART',
      total: 127900,
      edition: 'Octubre - Noviembre - Diciembre',
      createdAt: '2026-10-05T15:00:00Z'
    });

    expect(html).toContain('¡Hola Martin!');
    expect(html).toContain('FUDI-10-MART');
    expect(html).toContain('$127.900');
    expect(html).toContain('roblesingrid.bna');
    expect(html).toContain('wa.me/5491139264426');
    expect(html).toContain('#c79fef');
  });

  it('builds payment confirmed email with official branding and order summary', () => {
    const html = buildPaymentConfirmedEmail({
      customerName: 'Lucia Diaz',
      friendlyId: 'FUDI-10-LUCI',
      edition: 'Octubre 2026',
      formattedTotal: '44.900',
      shippingAddress: 'Av. Cabildo 2000, 3A (CP: 1428)'
    });

    expect(html).toContain('¡Hola Lucia!');
    expect(html).toContain('FUDI-10-LUCI');
    expect(html).toContain('$44.900');
    expect(html).toContain('Av. Cabildo 2000');
    expect(html).toContain('PAGO CONFIRMADO');
    expect(html).toContain('#4ebaba');
  });

  it('builds payment confirmed email for quarterly subscription with delivery breakdown', () => {
    const html = buildPaymentConfirmedEmail({
      customerName: 'Santiago Rossi',
      friendlyId: 'FUDI-10-TRIM',
      edition: 'Octubre - Noviembre - Diciembre',
      formattedTotal: '127.900',
      shippingAddress: 'Palermo Soho, Borges 1800, CABA',
      plan: 'quarterly',
      isQuarterly: true,
      totalBoxes: 3
    });

    expect(html).toContain('¡Hola Santiago!');
    expect(html).toContain('PLAN TRIMESTRAL CONFIRMADO');
    expect(html).not.toContain('PLAN TRIMESTRAL CONFIRMADO (3 BOXES)');
    expect(html).toContain('tu <strong>Plan Trimestral</strong> (3 Mystery Boxes en total)');
    expect(html).toContain('sorpresas Fudi');
    expect(html).not.toContain('sorpresas gourmet');
    expect(html).toContain('>Trimestral (3 Mystery Boxes)<');
    expect(html).not.toContain('>Plan Trimestral (3 Mystery Boxes)<');
    expect(html).toContain('Octubre - Noviembre - Diciembre');
    expect(html).toContain('$127.900');
    expect(html).toContain('📅 Cronograma estimado de entregas:');
    expect(html).not.toContain('📅 Cronograma estimado de entregas (los 15 de cada mes):');
    expect(html).toContain('1ª Box (Octubre)');
    expect(html).toContain('2ª Box (Noviembre)');
    expect(html).toContain('3ª Box (Diciembre)');
    expect(html).toContain('precio y cupo quedan congelados');
  });

  it('builds payment confirmed email dynamically for multi-quantity quarterly order (e.g. Carolina: 2 planes, 6 boxes)', () => {
    const html = buildPaymentConfirmedEmail({
      customerName: 'Carolina Mendez',
      friendlyId: 'FUDI-10-CARO',
      edition: 'Octubre - Noviembre - Diciembre',
      formattedTotal: '255.800',
      shippingAddress: 'Belgrano, Mendoza 2200, CABA',
      plan: 'quarterly',
      isQuarterly: true,
      quantity: 2,
      totalBoxes: 6
    });

    expect(html).toContain('¡Hola Carolina!');
    expect(html).toContain('PLAN TRIMESTRAL CONFIRMADO');
    expect(html).toContain('tus <strong>2 Planes Trimestrales</strong> (6 Mystery Boxes en total)');
    expect(html).toContain('>2x Trimestral (6 Mystery Boxes)<');
    expect(html).toContain('1ª Box (Octubre):</strong> Despacho aprox. 15 de Octubre (2 boxes)');
    expect(html).toContain('2ª Box (Noviembre):</strong> Despacho aprox. 15 de Noviembre (2 boxes)');
    expect(html).toContain('3ª Box (Diciembre):</strong> Despacho aprox. 15 de Diciembre (2 boxes)');
  });
});
