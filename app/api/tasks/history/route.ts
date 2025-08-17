import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 获取用户的历史任务
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Please login to view tasks' }, { status: 401 })
    }

    // 获取用户的任务历史 (最近30个)
    const { data: tasks, error: fetchError } = await supabase
      .from('async_tasks')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (fetchError) {
      console.error('Failed to fetch task history:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || []
    })

  } catch (error) {
    console.error('Task history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}