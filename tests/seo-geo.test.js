import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('GEO and LLM SEO validation', () => {
  const indexHtmlPath = path.resolve(__dirname, '../index.html');
  const llmsTxtPath = path.resolve(__dirname, '../public/llms.txt');
  const llmsFullTxtPath = path.resolve(__dirname, '../public/llms-full.txt');
  const robotsTxtPath = path.resolve(__dirname, '../public/robots.txt');
  const sitemapXmlPath = path.resolve(__dirname, '../public/sitemap.xml');

  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  it('contains essential GEO meta tags for Buenos Aires and Argentina', () => {
    expect(indexHtml).toContain('<meta name="geo.region" content="AR-C"');
    expect(indexHtml).toContain('<meta name="geo.placename" content="Buenos Aires, Argentina"');
    expect(indexHtml).toContain('<meta name="geo.position" content="-34.6037;-58.3816"');
    expect(indexHtml).toContain('<meta name="ICBM" content="-34.6037, -58.3816"');
    expect(indexHtml).toContain('<link rel="alternate" hreflang="es-AR"');
  });

  it('has a semantic h1 hero title for AI and search engines', () => {
    expect(indexHtml).toContain('<h1 class="hero-title"');
    // Ensure there are no duplicate h1s
    const h1Count = (indexHtml.match(/<h1[\s>]/g) || []).length;
    expect(h1Count).toBe(1);
  });

  it('contains comprehensive Schema.org JSON-LD Graph for LLMs', () => {
    const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(jsonLdMatch).not.toBeNull();

    const schemaData = JSON.parse(jsonLdMatch[1]);
    expect(schemaData['@context']).toBe('https://schema.org');
    expect(Array.isArray(schemaData['@graph'])).toBe(true);

    const types = schemaData['@graph'].flatMap(item => Array.isArray(item['@type']) ? item['@type'] : [item['@type']]);
    expect(types).toContain('Organization');
    expect(types).toContain('OnlineBusiness');
    expect(types).toContain('WebSite');
    expect(types).toContain('Product');
    expect(types).toContain('FAQPage');

    // Check Product offers
    const product = schemaData['@graph'].find(item => item['@type'] === 'Product');
    expect(product).toBeDefined();
    expect(product.offers.length).toBe(2);
    expect(product.offers[0].price).toBe('44900');
    expect(product.offers[1].price).toBe('127900');

    // Check FAQPage
    const faq = schemaData['@graph'].find(item => item['@type'] === 'FAQPage');
    expect(faq).toBeDefined();
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(5);
  });

  it('links to llms.txt standard in head', () => {
    expect(indexHtml).toContain('href="https://fudiclub.shop/llms.txt"');
  });

  it('llms.txt provides accurate markdown overview for AI search agents', () => {
    expect(fs.existsSync(llmsTxtPath)).toBe(true);
    const llmsContent = fs.readFileSync(llmsTxtPath, 'utf8');

    expect(llmsContent).toContain('Fudi Club');
    expect(llmsContent).toContain('Mystery Box');
    expect(llmsContent).toContain('$44.900 ARS');
    expect(llmsContent).toContain('$127.900 ARS');
    expect(llmsContent).toContain('CABA y Gran Buenos Aires');
    expect(llmsContent).toContain('Fudi Club Empresas');
  });

  it('llms-full.txt exists and contains extended details', () => {
    expect(fs.existsSync(llmsFullTxtPath)).toBe(true);
    const llmsFullContent = fs.readFileSync(llmsFullTxtPath, 'utf8');
    expect(llmsFullContent.length).toBeGreaterThan(1500);
    expect(llmsFullContent).toContain('https://fudiclub.shop/empresas');
  });

  it('robots.txt allows all major AI crawlers and points to sitemap and llms.txt', () => {
    expect(fs.existsSync(robotsTxtPath)).toBe(true);
    const robots = fs.readFileSync(robotsTxtPath, 'utf8');

    expect(robots).toContain('User-agent: GPTBot');
    expect(robots).toContain('User-agent: OAI-SearchBot');
    expect(robots).toContain('User-agent: PerplexityBot');
    expect(robots).toContain('User-agent: ClaudeBot');
    expect(robots).toContain('User-agent: Google-Extended');
    expect(robots).toContain('User-agent: Meta-ExternalAgent');
    expect(robots).toContain('Sitemap: https://fudiclub.shop/sitemap.xml');
    expect(robots).toContain('llms-txt: https://fudiclub.shop/llms.txt');
  });

  it('sitemap.xml is valid and references the home page', () => {
    expect(fs.existsSync(sitemapXmlPath)).toBe(true);
    const sitemap = fs.readFileSync(sitemapXmlPath, 'utf8');
    expect(sitemap).toContain('https://fudiclub.shop/</loc>');
  });
});
