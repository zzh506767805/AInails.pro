import type { Locale } from './config'

export function generateMetadata(locale: Locale, dictionary: any, pageMetadata?: {
  title?: string;
  description?: string;
  path?: string;
}) {
  // Generate locale-specific metadata
  const localeMap: Record<Locale, string> = {
    en: 'en_US',
    es: 'es_ES', 
    fr: 'fr_FR',
    de: 'de_DE',
    ar: 'ar_AR',
    ru: 'ru_RU',
    pt: 'pt_BR',
    ja: 'ja_JP',
    ko: 'ko_KR',
    it: 'it_IT',
    id: 'id_ID',
    vi: 'vi_VN',
    pl: 'pl_PL',
    th: 'th_TH'
  }

  const baseUrl = 'https://ainails.pro'
  const pathSegment = pageMetadata?.path || ''
  const currentUrl = locale === 'en' ? `${baseUrl}${pathSegment}` : `${baseUrl}/${locale}${pathSegment}`

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: pageMetadata?.title ? 
        `AInails - ${pageMetadata.title}` :
        (dictionary?.hero?.title ? 
          `AInails - ${dictionary.hero.title} ${dictionary.hero.subtitle}` : 
          'AInails - AI Nail Art Generator | Create Beautiful Nail Designs'),
      template: '%s | AInails - AI Nail Art Generator'
    },
    description: pageMetadata?.description || dictionary?.hero?.description || 'Transform your nail art ideas into stunning designs with our AI nail art generator. Create beautiful, unique nail designs from text descriptions using advanced AI technology.',
    keywords: [
      'AI nail art', 'nail design generator', 'artificial intelligence nail designs', 'nail art creator', 
      'AI nail patterns', 'digital nail art', 'creative nail designs', 'nail art AI', 'nail art generator',
      'beauty AI', 'nail design software', 'nail art inspiration', 'nail design tools', 'nail art trends',
      'nail art techniques', 'nail art business', 'nail artist tools', 'nail design app', 'nail art platform',
      'AI beauty tools', 'nail art creation', 'nail design ideas', 'nail art tutorials', 'nail art education',
      'french manicure', 'geometric nail art', 'ombré nails', 'minimalist nails', 'rhinestone nail design',
      'floral nail art', 'line work nail design', 'salon nail art', 'professional nail design', 'nude nails'
    ].join(', '),
    authors: [{ name: 'AInails Team' }],
    creator: 'AInails',
    publisher: 'AInails',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: localeMap[locale],
      url: currentUrl,
      title: pageMetadata?.title ? 
        `AInails - ${pageMetadata.title}` :
        (dictionary?.hero?.title ? 
          `AInails - ${dictionary.hero.title} ${dictionary.hero.subtitle}` : 
          'AInails - AI Nail Art Generator | Create Beautiful Nail Designs'),
      description: pageMetadata?.description || dictionary?.hero?.description || 'Transform your nail art ideas into stunning designs with our AI nail art generator.',
      siteName: 'AInails',
      images: [
        {
          url: `${baseUrl}/images/featured_nail_french.png`,
          width: 1024,
          height: 1024,
          alt: 'Elegant French manicure with floral accents - Professional nail art design',
          secureUrl: `${baseUrl}/images/featured_nail_french.png`,
        },
        {
          url: `${baseUrl}/images/featured_nail_geometric.png`,
          width: 1024,
          height: 1024,
          alt: 'Trendy geometric nail art with bold patterns - Modern manicure design',
          secureUrl: `${baseUrl}/images/featured_nail_geometric.png`,
        },
        {
          url: `${baseUrl}/images/featured_nail_ombre.png`,
          width: 1024,
          height: 1024,
          alt: 'Luxury gradient ombré nails with rhinestone accents - Premium salon-quality manicure',
          secureUrl: `${baseUrl}/images/featured_nail_ombre.png`,
        },
        {
          url: `${baseUrl}/images/featured_nail_minimalist.png`,
          width: 1024,
          height: 1024,
          alt: 'Minimalist nude nails with artistic line work - Contemporary nail art design',
          secureUrl: `${baseUrl}/images/featured_nail_minimalist.png`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageMetadata?.title ? 
        `AInails - ${pageMetadata.title}` :
        (dictionary?.hero?.title ? 
          `AInails - ${dictionary.hero.title} ${dictionary.hero.subtitle}` : 
          'AInails - AI Nail Art Generator | Create Beautiful Nail Designs'),
      description: pageMetadata?.description || dictionary?.hero?.description || 'Transform your nail ideas into stunning designs with our AI nail art generator.',
      images: [
        {
          url: `${baseUrl}/images/featured_nail_french.png`,
          alt: 'Elegant French manicure with floral accents - AI generated nail design',
        }
      ],
      creator: '@ainails',
      site: '@ainails',
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
    alternates: {
      canonical: currentUrl,
      languages: {
        'en': `${baseUrl}${pathSegment}`,
        'es': `${baseUrl}/es${pathSegment}`,
        'fr': `${baseUrl}/fr${pathSegment}`,
        'de': `${baseUrl}/de${pathSegment}`,
        'ar': `${baseUrl}/ar${pathSegment}`,
        'ru': `${baseUrl}/ru${pathSegment}`,
        'pt': `${baseUrl}/pt${pathSegment}`,
        'ja': `${baseUrl}/ja${pathSegment}`,
        'ko': `${baseUrl}/ko${pathSegment}`,
        'it': `${baseUrl}/it${pathSegment}`,
        'id': `${baseUrl}/id${pathSegment}`,
        'vi': `${baseUrl}/vi${pathSegment}`,
        'pl': `${baseUrl}/pl${pathSegment}`,
        'th': `${baseUrl}/th${pathSegment}`,
      }
    },
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any' }
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
      ],
      other: [
        { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
  }
}