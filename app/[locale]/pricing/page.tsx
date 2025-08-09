import React from 'react'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Locale } from '@/lib/i18n/config'
import PricingClient from './PricingClient'

type Props = {
  params: {
    locale: Locale
  }
}

export default async function PricingPage({ params }: Props) {
  const dictionary = await getDictionary(params.locale)
  
  return (
    <PricingClient 
      dictionary={dictionary}
      locale={params.locale}
    />
  )
} 