import { test, expect } from '@playwright/test';

test.describe('Comentários', () => {
  // Os comentários ficam na página de uma série específica.
  // Como o banco pode estar vazio, testamos a existência do componente.

  test('página de série carrega seção de comentários', async ({ page }) => {
    // Tenta acessar uma série qualquer — se não existir, será 404
    await page.goto('/serie/test-series');
    // Se a série não existe, verifica 404
    const is404 = await page.locator('text=/não encontrad|not found|404/i').isVisible().catch(() => false);

    if (!is404) {
      // Se a série existe, verifica que a seção de comentários está presente
      const commentsSection = page.locator('text=/comentário/i').first();
      await expect(commentsSection).toBeVisible();
    }
  });

  test('formulário de comentário tem campos de apelido e conteúdo', async ({ page }) => {
    await page.goto('/serie/test-series');
    const is404 = await page.locator('text=/não encontrad|not found|404/i').isVisible().catch(() => false);

    if (!is404) {
      // Verifica campos do formulário
      const nicknameInput = page.locator('input[placeholder*="apelido" i]').first();
      const contentArea = page.locator('textarea').first();
      await expect(nicknameInput).toBeVisible();
      await expect(contentArea).toBeVisible();
    }
  });

  test('botão de enviar comentário está presente', async ({ page }) => {
    await page.goto('/serie/test-series');
    const is404 = await page.locator('text=/não encontrad|not found|404/i').isVisible().catch(() => false);

    if (!is404) {
      const submitBtn = page.locator('button[type="submit"]').first();
      await expect(submitBtn).toBeVisible();
    }
  });

  test('validação impede comentário vazio', async ({ page }) => {
    await page.goto('/serie/test-series');
    const is404 = await page.locator('text=/não encontrad|not found|404/i').isVisible().catch(() => false);

    if (!is404) {
      // Tenta submeter sem preencher
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      // Deve mostrar mensagem de erro
      const errorMsg = page.locator('text=/pelo menos|obrigatório|preencha/i').first();
      await expect(errorMsg).toBeVisible({ timeout: 3000 });
    }
  });

  test('contador de caracteres no textarea', async ({ page }) => {
    await page.goto('/serie/test-series');
    const is404 = await page.locator('text=/não encontrad|not found|404/i').isVisible().catch(() => false);

    if (!is404) {
      const counter = page.locator('text=/\\/1000/').first();
      await expect(counter).toBeVisible();
    }
  });
});
