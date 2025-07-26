import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // 这里仅作为一个简单的数据库状态检查
    const { data, error } = await supabase.from('subscription_plans').select('*').limit(1)

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json({ success: false, error: 'Database query failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Database is working properly' })
  } catch (err) {
    console.error('Server error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
