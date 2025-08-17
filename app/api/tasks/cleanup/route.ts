import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用service role key创建管理员客户端
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * 清理长时间pending和processing的任务
 * 这个API会被定期调用来处理超时任务
 */
export async function POST() {
  try {
    const supabase = createAdminClient()
    
    console.log('🧹 Starting task cleanup process...')
    
    const now = new Date()
    const pendingTimeoutMinutes = 10 // pending状态超过10分钟算超时
    const processingTimeoutMinutes = 30 // processing状态超过30分钟算超时
    
    // 计算超时时间点
    const pendingTimeout = new Date(now.getTime() - pendingTimeoutMinutes * 60 * 1000)
    const processingTimeout = new Date(now.getTime() - processingTimeoutMinutes * 60 * 1000)
    
    console.log(`🕐 Looking for tasks older than:`)
    console.log(`  - Pending: ${pendingTimeout.toISOString()}`)
    console.log(`  - Processing: ${processingTimeout.toISOString()}`)
    
    // 查找超时的pending任务
    const { data: timeoutPendingTasks, error: pendingError } = await supabase
      .from('async_tasks')
      .select('id, created_at, input_data')
      .eq('status', 'pending')
      .lt('created_at', pendingTimeout.toISOString())
    
    if (pendingError) {
      console.error('❌ Error fetching timeout pending tasks:', pendingError)
    } else if (timeoutPendingTasks && timeoutPendingTasks.length > 0) {
      console.log(`⏰ Found ${timeoutPendingTasks.length} timeout pending tasks`)
      
      // 更新超时的pending任务为failed
      const { error: updatePendingError } = await supabase
        .from('async_tasks')
        .update({
          status: 'failed',
          error_message: `Task timed out after ${pendingTimeoutMinutes} minutes in pending state`,
          completed_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('status', 'pending')
        .lt('created_at', pendingTimeout.toISOString())
        
      if (updatePendingError) {
        console.error('❌ Error updating timeout pending tasks:', updatePendingError)
      } else {
        console.log(`✅ Updated ${timeoutPendingTasks.length} timeout pending tasks to failed`)
      }
    }
    
    // 查找超时的processing任务
    const { data: timeoutProcessingTasks, error: processingError } = await supabase
      .from('async_tasks')
      .select('id, started_at, input_data')
      .eq('status', 'processing')
      .lt('started_at', processingTimeout.toISOString())
    
    if (processingError) {
      console.error('❌ Error fetching timeout processing tasks:', processingError)
    } else if (timeoutProcessingTasks && timeoutProcessingTasks.length > 0) {
      console.log(`⏰ Found ${timeoutProcessingTasks.length} timeout processing tasks`)
      
      // 更新超时的processing任务为failed
      const { error: updateProcessingError } = await supabase
        .from('async_tasks')
        .update({
          status: 'failed',
          error_message: `Task timed out after ${processingTimeoutMinutes} minutes in processing state`,
          completed_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('status', 'processing')
        .lt('started_at', processingTimeout.toISOString())
        
      if (updateProcessingError) {
        console.error('❌ Error updating timeout processing tasks:', updateProcessingError)
      } else {
        console.log(`✅ Updated ${timeoutProcessingTasks.length} timeout processing tasks to failed`)
      }
    }
    
    // 统计清理结果
    const totalCleaned = (timeoutPendingTasks?.length || 0) + (timeoutProcessingTasks?.length || 0)
    
    console.log(`🧹 Task cleanup completed. Total cleaned: ${totalCleaned}`)
    
    return NextResponse.json({
      success: true,
      cleaned: {
        pending: timeoutPendingTasks?.length || 0,
        processing: timeoutProcessingTasks?.length || 0,
        total: totalCleaned
      },
      message: `Cleaned ${totalCleaned} timeout tasks`
    })
    
  } catch (error) {
    console.error('❌ Task cleanup error:', error)
    return NextResponse.json(
      { 
        error: 'Task cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET方法用于检查清理器状态
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Task cleanup service is running',
    endpoints: {
      cleanup: 'POST /api/tasks/cleanup - Clean timeout tasks',
      status: 'GET /api/tasks/cleanup - Check service status'
    }
  })
}