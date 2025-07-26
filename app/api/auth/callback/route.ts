import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 如果有 `next` 参数，使用它作为重定向地址
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 重定向到指定页面
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 如果出错，重定向到错误页面
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 