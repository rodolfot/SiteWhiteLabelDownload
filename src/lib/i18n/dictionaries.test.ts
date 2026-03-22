import { describe, it, expect } from 'vitest';
import { getDictionary, locales, defaultLocale, localeNames } from './dictionaries';

describe('i18n dictionaries', () => {
  it('tem todos os locales definidos', () => {
    expect(locales).toContain('pt-BR');
    expect(locales).toContain('en');
    expect(locales).toContain('es');
  });

  it('default locale e pt-BR', () => {
    expect(defaultLocale).toBe('pt-BR');
  });

  it('todos os locales tem nomes', () => {
    for (const locale of locales) {
      expect(localeNames[locale]).toBeDefined();
      expect(localeNames[locale].length).toBeGreaterThan(0);
    }
  });

  it('getDictionary retorna dicionario valido para cada locale', () => {
    for (const locale of locales) {
      const dict = getDictionary(locale);
      expect(dict).toBeDefined();
      expect(dict.common).toBeDefined();
      expect(dict.common.search).toBeDefined();
      expect(dict.series).toBeDefined();
      expect(dict.comments).toBeDefined();
      expect(dict.requests).toBeDefined();
      expect(dict.footer).toBeDefined();
      expect(dict.categories).toBeDefined();
      expect(dict.admin).toBeDefined();
    }
  });

  it('todos os dicionarios tem as mesmas chaves', () => {
    const ptDict = getDictionary('pt-BR');
    const enDict = getDictionary('en');
    const esDict = getDictionary('es');

    const ptKeys = Object.keys(ptDict);
    const enKeys = Object.keys(enDict);
    const esKeys = Object.keys(esDict);

    expect(enKeys).toEqual(ptKeys);
    expect(esKeys).toEqual(ptKeys);

    // Verificar sub-chaves
    for (const section of ptKeys) {
      const ptSubKeys = Object.keys(ptDict[section as keyof typeof ptDict]);
      const enSubKeys = Object.keys(enDict[section as keyof typeof enDict]);
      const esSubKeys = Object.keys(esDict[section as keyof typeof esDict]);
      expect(enSubKeys).toEqual(ptSubKeys);
      expect(esSubKeys).toEqual(ptSubKeys);
    }
  });
});
