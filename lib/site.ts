/** Single source of truth for site-wide strings and navigation. */
export const siteMeta = {
  name: 'Yishun River Trading',
  tagline: 'Yishun Has No River.',
  description:
    'Quantitative research. Systematic strategies. Data-driven trading. We apply mathematics, statistics and technology to understand financial markets.',
  email: 'hello@yishunriver.com',
  year: 2026,
  locale: 'en_SG',
} as const;

export const footerNav = [
  { href: '/', label: 'Home' },
  { href: '/strategies', label: 'Strategies' },
  { href: '/research', label: 'Research' },
  { href: '/technology', label: 'Technology' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const routes = ['/', '/strategies', '/research', '/technology', '/about', '/contact'] as const;
