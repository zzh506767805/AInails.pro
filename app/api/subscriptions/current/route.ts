import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          display_name,
          description,
          price_cents,
          credits_per_month
        )
      `)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      // 用户没有订阅
      if (error.code === 'PGRST116') {
        return NextResponse.json({ subscription: null })
      }
      console.error('Error fetching subscription:', error)
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
    }
    
    return NextResponse.json({ subscription }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300', // 1分钟缓存
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 