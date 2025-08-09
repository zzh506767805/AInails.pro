import { NextRequest, NextResponse } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { i18n } from './lib/i18n/config'
import { updateSession } from '@/lib/supabase/middleware'

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    [...i18n.locales]
  )

  return matchLocale(languages, i18n.locales, i18n.defaultLocale)
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url)
  const pathname = url.pathname

  const localePrefixes = new Set(i18n.locales)

  // 绕过 sitemap.xml（顶层路由，不参与多语言重写/重定向）
  if (pathname === '/sitemap.xml') {
    return NextResponse.next()
  }

  // 1) 规范化：如果是英文路径带有 /en 前缀，301 到无前缀，确保 canonical 稳定
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const targetPath = pathname.replace(/^\/en(\/|$)/, '/').replace(/\/+$/, '') || '/'
    const redirectUrl = new URL(targetPath + url.search, url.origin)
    return NextResponse.redirect(redirectUrl, 301)
  }

  // 2) 如果缺少任何已支持语言前缀：
  //    - 若为英文（默认）用户：rewrite 到内部 /en，但对外 URL 保持不变（不 301），避免主页被加 /en
  //    - 若为其他语言：301 到带语言前缀的规范 URL
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  if (!pathnameHasLocale) {
    const bestLocale = getLocale(request) || i18n.defaultLocale
    if (bestLocale === 'en') {
      // 内部重写：/foo -> /en/foo，但地址栏不变
      const rewritePath = pathname === '/' ? '/en' : `/en${pathname}`
      return NextResponse.rewrite(new URL(rewritePath + url.search, url.origin))
    }
    // 其他语言：对外显示语言前缀，做 301 规范化
    const redirectPath = pathname === '/' ? `/${bestLocale}` : `/${bestLocale}${pathname}`
    const redirectUrl = new URL(redirectPath + url.search, url.origin)
    return NextResponse.redirect(redirectUrl, 301)
  }

  // Apply authentication middleware after locale handling
  return await updateSession(request)
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|android-chrome|apple-touch-icon|browserconfig|site.webmanifest|robots.txt).*)'
  ],
}