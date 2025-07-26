import { createClient } from '@/lib/supabase/client'

export async function requireLogin(): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return true

  // 触发Google登录
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })
  // 登录后页面会刷新，返回false即可
  return false
} 