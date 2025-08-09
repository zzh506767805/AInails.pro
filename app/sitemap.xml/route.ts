import { NextResponse } from 'next/server'
import { i18n } from '@/lib/i18n/config'

interface SitemapUrl {
  url: string
  lastModified: string
  changeFrequency: string
  priority: number
}

export async function GET() {
  const baseUrl = 'https://ainails.pro'
  const currentDate = new Date().toISOString()
  
  // Static page paths (without locale)
  const staticPaths = [
    '', // home page
    '/history',
    '/pricing',
    '/privacy',
    '/terms',
  ]
  
  // Generate URLs for all locales and pages
  const urls: SitemapUrl[] = []
  
  i18n.locales.forEach(locale => {
    staticPaths.forEach(path => {
      const url = locale === 'en' && path === '' 
        ? baseUrl // Root URL for English home page
        : `${baseUrl}/${locale}${path}`
      
      const priority = path === '' ? 1.0 : 
                      path === '/pricing' ? 0.8 :
                      path === '/history' ? 0.7 :
                      0.6
                      
      const changeFrequency = path === '' ? 'weekly' :
                             path === '/pricing' || path === '/history' ? 'monthly' :
                             'yearly'
      
      urls.push({
        url,
        lastModified: currentDate,
        changeFrequency,
        priority,
      })
    })
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map((page) => {
    // Generate hreflang alternates for each URL
    const alternates = i18n.locales
      .map(locale => {
        const pagePathWithoutLocale = page.url.replace(new RegExp(`${baseUrl}/[^/]+`), '') || ''
        const hrefUrl = locale === 'en' && !pagePathWithoutLocale 
          ? baseUrl 
          : `${baseUrl}/${locale}${pagePathWithoutLocale}`
        
        return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${hrefUrl}" />`
      })
      .join('\n')
    
    return `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
${alternates}
  </url>`
  })
  .join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}