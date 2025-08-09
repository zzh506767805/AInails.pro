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
  // 注意：/history 在 robots.txt 中被禁止抓取，因此不应出现在 sitemap 中
  const staticPaths = [
    '', // home page
    '/pricing',
    '/privacy',
    '/terms',
  ]
  
  // Generate URLs for all locales and pages
  const urls: SitemapUrl[] = []
  
  i18n.locales.forEach(locale => {
    staticPaths.forEach(path => {
      const url = locale === 'en'
        ? `${baseUrl}${path}` // 英文不带 /en 前缀
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
    // 解析出不带语言前缀的路径，用于生成 hreflang
    const urlObj = new URL(page.url)
    const pathname = urlObj.pathname // 例如 '/', '/en/pricing'
    const parts = pathname.split('/')
    const pathWithoutLocale = (i18n.locales as readonly string[]).includes(parts[1] || '')
      ? `/${parts.slice(2).join('/')}`.replace(/\/+$|^\/$/g, '') // 去掉尾随斜杠，并将根路径标准化为空字符串
      : pathname.replace(/\/+$|^\/$/g, '')
    const normalizedPath = pathWithoutLocale === '' ? '' : `/${pathWithoutLocale.replace(/^\//, '')}`

    // Generate hreflang alternates for each URL
    const alternates = [
      ...i18n.locales.map((locale) => {
        const hrefUrl = locale === 'en'
          ? `${baseUrl}${normalizedPath}` // 英文默认无前缀
          : `${baseUrl}/${locale}${normalizedPath}`
        return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${hrefUrl}" />`
      }),
      // x-default 指向默认语言（英文）
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${normalizedPath}" />`
    ].join('\n')

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