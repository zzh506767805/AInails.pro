'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { Locale, localeNames, i18n } from '@/lib/i18n/config'

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  const switchLocale = (newLocale: Locale) => {
    setIsLoading(true)
    
    // Remove current locale from pathname
    const segments = pathname.split('/')
    const currentSegment = segments[1]
    
    let newPath
    if (i18n.locales.includes(currentSegment as Locale)) {
      // Current path has locale, replace it
      segments[1] = newLocale
      newPath = segments.join('/')
    } else {
      // Current path doesn't have locale, add it
      newPath = `/${newLocale}${pathname}`
    }
    
    router.push(newPath)
    
    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 500)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2" disabled={isLoading}>
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline-block">
            {localeNames[currentLocale]}
          </span>
          <span className="sm:hidden uppercase">
            {currentLocale}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={`cursor-pointer ${
              currentLocale === locale 
                ? 'bg-pink-50 text-pink-900 font-medium' 
                : 'hover:bg-gray-50'
            }`}
          >
            <span className="w-8 text-sm uppercase text-gray-500">
              {locale}
            </span>
            <span className="ml-2">
              {localeNames[locale]}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}