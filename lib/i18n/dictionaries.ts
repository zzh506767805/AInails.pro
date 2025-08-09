import 'server-only'
import type { Locale } from './config'

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default),
  fr: () => import('./dictionaries/fr.json').then((module) => module.default),
  de: () => import('./dictionaries/de.json').then((module) => module.default),
  ar: () => import('./dictionaries/ar.json').then((module) => module.default),
  ru: () => import('./dictionaries/ru.json').then((module) => module.default),
  pt: () => import('./dictionaries/pt.json').then((module) => module.default),
  ja: () => import('./dictionaries/ja.json').then((module) => module.default),
  ko: () => import('./dictionaries/ko.json').then((module) => module.default),
  it: () => import('./dictionaries/it.json').then((module) => module.default),
  id: () => import('./dictionaries/id.json').then((module) => module.default),
  vi: () => import('./dictionaries/vi.json').then((module) => module.default),
  pl: () => import('./dictionaries/pl.json').then((module) => module.default),
  th: () => import('./dictionaries/th.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.en()
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>