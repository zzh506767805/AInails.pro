import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 取消异步任务
 */
export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // 验证用户身份
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Please login to cancel tasks' }, { status: 401 })
    }

    // 检查任务是否存在且属于当前用户
    const { data: task, error: fetchError } = await supabase
      .from('async_tasks')
      .select('status, user_id')
      .eq('id', taskId)
      .single()

    if (fetchError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.user_id !== currentUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 只有pending和processing状态的任务可以取消
    if (!['pending', 'processing'].includes(task.status)) {
      return NextResponse.json({ 
        error: 'Task cannot be cancelled', 
        currentStatus: task.status 
      }, { status: 400 })
    }

    // 更新任务状态为取消
    const { error: updateError } = await supabase
      .from('async_tasks')
      .update({ 
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        error_message: 'Task cancelled by user'
      })
      .eq('id', taskId)

    if (updateError) {
      console.error('Failed to cancel task:', updateError)
      return NextResponse.json({ error: 'Failed to cancel task' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      taskId,
      message: 'Task cancelled successfully'
    })

  } catch (error) {
    console.error('Task cancellation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}