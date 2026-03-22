export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'DownDoor',
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Seu Portal para Videos e Downloads Gratuitos',
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'Portal premium para streaming e download de series e videos gratuitos em alta qualidade.',
  locale: 'pt_BR',
} as const;
