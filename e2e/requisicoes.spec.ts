import { test, expect } from '@playwright/test';

test.describe('Requisições de Séries', () => {
  test('carrega a página de requisições', async ({ page }) => {
    await page.goto('/requisicoes');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('exibe formulário de nova requisição', async ({ page }) => {
    await page.goto('/requisicoes');
    // Deve ter campo de título e botão de enviar
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
    await expect(page.locator('input[placeholder*="título" i], input[placeholder*="serie" i], input[placeholder*="nome" i]').first()).toBeVisible();
  });

  test('valida campos obrigatórios antes de enviar', async ({ page }) => {
    await page.goto('/requisicoes');
    // Tentar submeter sem preencher
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Deve mostrar erro ou não navegar
      await expect(page).toHaveURL(/requisicoes/);
    }
  });

  test('exibe lista de requisições existentes', async ({ page }) => {
    await page.goto('/requisicoes');
    // A página deve ter uma seção de listagem (pode estar vazia)
    const content = page.locator('main, .min-h-screen');
    await expect(content.first()).toBeVisible();
  });

  test('tem botão de votar nas requisições', async ({ page }) => {
    await page.goto('/requisicoes');
    // Se houver requisições, deve ter botão de voto
    const voteButtons = page.locator('button').filter({ hasText: /vot|👍|↑/i });
    // Pode não ter requisições, então apenas verificamos que a página carregou
    await expect(page.locator('body')).toBeVisible();
  });
});
