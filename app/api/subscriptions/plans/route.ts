import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('id, name, display_name, description, price_cents, credits_per_month')
      .eq('is_active', true)
      .order('price_cents', { ascending: true })
    
    if (error) {
      console.error('Error fetching subscription plans:', error)
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
    }
    
    return NextResponse.json({ plans }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5分钟缓存
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 