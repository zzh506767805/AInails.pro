import '../globals.css'
import React from 'react'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import { Toaster } from 'sonner'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { generateMetadata as genMetadata } from '@/lib/i18n/metadata'
import { Locale, localeDirections } from '@/lib/i18n/config'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata({ params }: { params: { locale: Locale } }) {
  const dictionary = await getDictionary(params.locale)
  return genMetadata(params.locale, dictionary)
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { locale: Locale }
}) {
  const dictionary = await getDictionary(params.locale)
  const direction = localeDirections[params.locale]

  return (
    <html lang={params.locale} dir={direction}>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5HJ4NK13NR"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5HJ4NK13NR');
            `
          }}
        />
        
        {/* Main WebApplication Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "AInails - AI Nail Art Generator",
              "description": dictionary.hero?.description || "Transform your nail art ideas into stunning designs with our AI nail art generator.",
              "url": "https://ainails.pro",
              "applicationCategory": "DesignApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "AInails",
                "url": "https://ainails.pro"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
              }
            })
          }}
        />
        
        {/* Gallery Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageGallery",
              "name": "AI Generated Nail Art Designs Gallery",
              "description": "Browse our collection of AI-generated nail art designs featuring various styles and techniques.",
              "url": "https://ainails.pro",
              "image": [
                "https://ainails.pro/images/featured_nail_french.png",
                "https://ainails.pro/images/featured_nail_geometric.png",
                "https://ainails.pro/images/featured_nail_ombre.png",
                "https://ainails.pro/images/featured_nail_minimalist.png"
              ],
              "potentialAction": {
                "@type": "ViewAction",
                "target": "https://ainails.pro/generate"
              }
            })
          }}
        />
        
        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#DC2626" />
        <meta name="msapplication-TileColor" content="#DC2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AInails" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* Image metadata */}
        <meta property="image:alt_text" content="AI-generated nail art designs including French manicure, geometric patterns, gradient ombré, and minimalist styles" />
        
        {/* RTL CSS for Arabic */}
        {direction === 'rtl' && (
          <style dangerouslySetInnerHTML={{
            __html: `
              body { direction: rtl; }
              .rtl-flip { transform: scaleX(-1); }
            `
          }} />
        )}
      </head>
      <body className={inter.className}>
        <Navbar locale={params.locale} dictionary={dictionary} />
        {children}
        <Footer locale={params.locale} dictionary={dictionary} />
        <Toaster />
      </body>
    </html>
  )
}