import React from 'react'
import Link from 'next/link'
import { Locale } from '@/lib/i18n/config'
import { Dictionary } from '@/lib/i18n/dictionaries'

interface FooterProps {
  locale: Locale
  dictionary: Dictionary
}

export default function Footer({ locale, dictionary }: FooterProps) {
  // Helper function to create localized links
  const createLocalizedLink = (path: string) => {
    if (path === '/') return `/${locale}`
    return `/${locale}${path}`
  }

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 py-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} AInails - AI Nail Art Generator</p>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center">
            <Link 
              href={createLocalizedLink('/')}
              className="text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              {dictionary?.nav?.home || 'Home'}
            </Link>
            <Link 
              href={createLocalizedLink('/pricing')}
              className="text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              {dictionary?.nav?.pricing || 'Pricing'}
            </Link>
            <Link 
              href={createLocalizedLink('/terms')}
              className="text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              {dictionary?.footer?.terms || 'Terms of Service'}
            </Link>
            <Link 
              href={createLocalizedLink('/privacy')}
              className="text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              {dictionary?.footer?.privacy || 'Privacy Policy'}
            </Link>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-xs text-gray-500 mb-2">Friendly Links:</p>
            <div className="flex gap-4">
              <a 
                href="https://chinesenamegenerate.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-red-500 transition-colors"
              >
                Chinese Name Generator
              </a>
              <a 
                href="https://dressmeai.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-red-500 transition-colors"
              >
                DressMeAI
              </a>
              <a 
                href="https://dreamfinityx.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-red-500 transition-colors"
              >
                DreamfinityX
              </a>
              <a 
                href="https://charactereadcanon.pro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-red-500 transition-colors"
              >
                Character Read Canon
              </a>
              <a 
                href="https://elfname.pro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-red-500 transition-colors"
              >
                Elf Name
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}