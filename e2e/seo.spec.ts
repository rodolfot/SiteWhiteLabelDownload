import { test, expect } from '@playwright/test';

test.describe('SEO', () => {
  test('robots.txt retorna 200 e bloqueia /admin/', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Disallow: /admin');
    expect(body).toContain('Disallow: /api');
  });

  test('sitemap.xml retorna 200 e contém URLs', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<urlset');
    expect(body).toContain('<loc>');
  });

  test('home tem meta tags OG', async ({ page }) => {
    await page.goto('/');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });

  test('home tem meta description', async ({ page }) => {
    await page.goto('/');
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /.+/);
  });

  test('manifest.json retorna 200', async ({ request }) => {
    const response = await request.get('/manifest.json');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.name).toBeTruthy();
    expect(json.icons).toBeDefined();
  });
});
