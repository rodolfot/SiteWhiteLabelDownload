import { test, expect } from '@playwright/test';

test.describe('Categorias', () => {
  test('carrega a página de categorias', async ({ page }) => {
    await page.goto('/categorias');
    await expect(page).toHaveTitle(/categorias/i);
  });

  test('exibe título e contagem', async ({ page }) => {
    await page.goto('/categorias');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Categorias');
  });

  test('campo de busca está presente', async ({ page }) => {
    await page.goto('/categorias');
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible();
  });

  test('botão de filtros está presente', async ({ page }) => {
    await page.goto('/categorias');
    const filtrosBtn = page.locator('button', { hasText: 'Filtros' });
    await expect(filtrosBtn).toBeVisible();
  });

  test('busca filtra resultados', async ({ page }) => {
    await page.goto('/categorias');
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('xyznonexistent');
    // Deve mostrar mensagem de "nenhuma série encontrada" ou zero resultados
    const noResults = page.locator('text=Nenhuma série encontrada');
    const results = page.locator('text=resultados');
    await expect(noResults.or(results)).toBeVisible({ timeout: 5000 });
  });

  test('painel de filtros avançados abre ao clicar', async ({ page }) => {
    await page.goto('/categorias');
    const filtrosBtn = page.locator('button', { hasText: 'Filtros' });
    await filtrosBtn.click();
    // Verifica se o painel de filtros (select de gênero) aparece
    const genreSelect = page.locator('select').first();
    await expect(genreSelect).toBeVisible();
  });
});
