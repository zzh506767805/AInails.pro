import './globals.css'
import React from 'react'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/navbar'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://ainails.pro'),
  title: {
    default: 'AInails - AI Nail Art Generator | Create Beautiful Nail Designs',
    template: '%s | AInails - AI Nail Art Generator'
  },
  description: 'Transform your nail art ideas into stunning designs with our AI nail art generator. Create beautiful, unique nail designs from text descriptions using advanced AI technology. Featuring elegant French manicures, trendy geometric patterns, luxury ombré designs, and minimalist line art.',
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
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ainails.pro',
    title: 'AInails - AI Nail Art Generator | Create Beautiful Nail Designs',
    description: 'Transform your nail art ideas into stunning designs with our AI nail art generator. Featuring elegant French manicures, trendy geometric patterns, luxury ombré designs, and minimalist line art.',
    siteName: 'AInails',
    images: [
      {
        url: 'https://ainails.pro/images/featured_nail_french.png',
        width: 1024,
        height: 1024,
        alt: 'Elegant French manicure with floral accents - Professional nail art design',
        secureUrl: 'https://ainails.pro/images/featured_nail_french.png',
      },
      {
        url: 'https://ainails.pro/images/featured_nail_geometric.png',
        width: 1024,
        height: 1024,
        alt: 'Trendy geometric nail art with bold patterns - Modern manicure design',
        secureUrl: 'https://ainails.pro/images/featured_nail_geometric.png',
      },
      {
        url: 'https://ainails.pro/images/featured_nail_ombre.png',
        width: 1024,
        height: 1024,
        alt: 'Luxury gradient ombré nails with rhinestone accents - Premium salon-quality manicure',
        secureUrl: 'https://ainails.pro/images/featured_nail_ombre.png',
      },
      {
        url: 'https://ainails.pro/images/featured_nail_minimalist.png',
        width: 1024,
        height: 1024,
        alt: 'Minimalist nude nails with artistic line work - Contemporary nail art design',
        secureUrl: 'https://ainails.pro/images/featured_nail_minimalist.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AInails - AI Nail Art Generator | Create Beautiful Nail Designs',
    description: 'Transform your nail ideas into stunning designs with our AI nail art generator. Browse our collection of elegant French manicures, trendy geometric patterns, and more.',
    images: [
      {
        url: 'https://ainails.pro/images/featured_nail_french.png',
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
    canonical: 'https://ainails.pro',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Main WebApplication Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "AInails - AI Nail Art Generator",
              "description": "Transform your nail art ideas into stunning designs with our AI nail art generator. Create beautiful, unique nail designs from text descriptions using advanced AI technology.",
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
      </head>
      <body className={inter.className}>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  )
} 