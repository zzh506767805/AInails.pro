export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de', 'ar', 'ru', 'pt', 'ja', 'ko', 'it', 'id', 'vi', 'pl', 'th'],
} as const

export type Locale = (typeof i18n)['locales'][number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español', 
  fr: 'Français',
  de: 'Deutsch',
  ar: 'العربية',
  ru: 'Русский',
  pt: 'Português',
  ja: '日本語',
  ko: '한국어',
  it: 'Italiano',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  pl: 'Polski',
  th: 'ไทย'
}

// Direction for RTL languages
export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  es: 'ltr', 
  fr: 'ltr',
  de: 'ltr',
  ar: 'rtl',
  ru: 'ltr',
  pt: 'ltr',
  ja: 'ltr',
  ko: 'ltr',
  it: 'ltr',
  id: 'ltr',
  vi: 'ltr',
  pl: 'ltr',
  th: 'ltr'
}