import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Locale } from '@/lib/i18n/config'
import { generateMetadata as genMetadata } from '@/lib/i18n/metadata'

export async function generateMetadata({ 
  params 
}: { 
  params: { locale: Locale } 
}): Promise<Metadata> {
  const dictionary = await getDictionary(params.locale)
  return genMetadata(params.locale, dictionary, {
    title: dictionary.pricing.title,
    description: dictionary.pricing.description,
    path: '/pricing'
  })
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 