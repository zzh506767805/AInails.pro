import React from 'react'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import AINailArtGenerator from '@/components/AINailArtGenerator'
import SEOContent from '@/components/SEOContent'

interface HomeProps {
  params: {
    locale: Locale
  }
}

export default async function Home({ params }: HomeProps) {
  const dictionary = await getDictionary(params.locale)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* First Screen - AI Nail Art Generator */}
      <AINailArtGenerator dictionary={dictionary} />
      
      {/* SEO Rich Content */}
      <SEOContent locale={params.locale} dictionary={dictionary} />
    </div>
  )
}