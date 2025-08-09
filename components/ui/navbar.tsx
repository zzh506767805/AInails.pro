'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser, useCredits } from '@/lib/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User, CreditCard, History, Home, Settings } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { Dictionary } from '@/lib/i18n/dictionaries'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface NavbarProps {
  locale: Locale
  dictionary: Dictionary
}

const Navbar = ({ locale, dictionary }: NavbarProps) => {
  const { user, loading } = useUser()
  const credits = useCredits()
  const pathname = usePathname()
  
  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === `/${locale}` && pathname === `/${locale}`) return true
    if (path !== `/${locale}` && pathname.startsWith(path)) return true
    return false
  }

  // Helper function to create localized links
  const createLocalizedLink = (path: string) => {
    if (path === '/') return `/${locale}`
    return `/${locale}${path}`
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={createLocalizedLink('/')} className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <Image 
                  src="/android-chrome-192x192.png" 
                  alt="AInails Logo" 
                  width={32} 
                  height={32}
                  className="rounded-lg"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">AINails</span>
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg">
              <Link href={createLocalizedLink('/')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(`/${locale}`) 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-700 hover:text-pink-600 hover:bg-gray-100'
              }`}>
                <div className="flex items-center space-x-1">
                  <Home className="w-4 h-4" />
                  <span>{dictionary?.nav?.home || 'Home'}</span>
                </div>
              </Link>
              <Link href={createLocalizedLink('/history')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(`/${locale}/history`) 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-700 hover:text-pink-600 hover:bg-gray-100'
              }`}>
                <div className="flex items-center space-x-1">
                  <History className="w-4 h-4" />
                  <span>{dictionary?.nav?.history || 'History'}</span>
                </div>
              </Link>
              <Link href={createLocalizedLink('/pricing')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(`/${locale}/pricing`) 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-700 hover:text-pink-600 hover:bg-gray-100'
              }`}>
                <div className="flex items-center space-x-1">
                  <CreditCard className="w-4 h-4" />
                  <span>{dictionary?.nav?.pricing || 'Pricing'}</span>
                </div>
              </Link>
            </div>
          </div>

          {/* User Menu and Language Switcher */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher currentLocale={locale} />

            {user ? (
              <>
                {/* Credits Display */}
                <div className="hidden sm:flex items-center">
                  <Badge variant="secondary" className="bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 text-pink-700 px-3 py-1 text-sm font-medium">
                    <CreditCard className="w-3 h-3 mr-1" />
                    {credits?.available_credits || 0} Credits
                  </Badge>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border-2 border-pink-100 hover:border-pink-300 transition-colors">
                      <div className="h-full w-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={createLocalizedLink('/history')} className="flex items-center">
                        <History className="mr-2 h-4 w-4" />
                        {dictionary?.nav?.history || 'History'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={createLocalizedLink('/pricing')} className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Buy Credits
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      {dictionary?.auth?.logout || 'Sign Out'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center">
                <Link href={createLocalizedLink('/auth')}>
                  <Button>{dictionary?.auth?.login || 'Sign In'}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar