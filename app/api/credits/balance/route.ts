import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 获取用户剩余credits（简化版，用于快速检查）
export async function GET() {
  try {
    const supabase = await createClient()
    
    // 修复安全警告：使用getUser()替代getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 只获取必要字段，优化查询性能
    let { data: credits, error } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // 用户记录不存在，创建默认记录
        const { data: newCredits, error: createError } = await supabase
          .from('user_credits')
          .upsert({
            user_id: user.id,
            total_credits: 10, // 给新用户10个免费积分
            used_credits: 0,
            last_reset_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
          .select('total_credits, used_credits')
          .single()
        
        if (createError) {
          console.error('Error creating user credits:', createError)
          return NextResponse.json({ error: 'Failed to create credits' }, { status: 500 })
        }
        
        credits = newCredits
      } else {
        console.error('Error fetching user credits:', error)
        return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
      }
    }
    
    if (!credits) {
      return NextResponse.json({ error: 'Failed to retrieve credits data' }, { status: 500 })
    }
    
    const availableCredits = credits.total_credits - credits.used_credits
    
    return NextResponse.json({ 
      total_credits: credits.total_credits,
      used_credits: credits.used_credits,
      available_credits: availableCredits 
    }, {
      headers: {
        // 禁用缓存，确保每次都获取最新数据
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 