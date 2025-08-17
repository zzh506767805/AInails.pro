import { NextRequest } from 'next/server'
import { createClient as createUserClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// 使用service role key创建管理员客户端
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Server-Sent Events endpoint for real-time task status updates
 * 使用SSE而不是轮询来节约资源
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const taskId = searchParams.get('taskId')

  if (!taskId) {
    return new Response('Task ID is required', { status: 400 })
  }

  // 创建SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // 设置SSE headers
      const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      }

      // 发送初始连接消息
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', taskId })}\n\n`)

      // 验证用户权限并监听任务状态
      checkTaskAndSendUpdates(controller, taskId)
        .catch(error => {
          console.error('SSE error:', error)
          controller.enqueue(`data: ${JSON.stringify({ 
            type: 'error', 
            message: 'Failed to monitor task status' 
          })}\n\n`)
          controller.close()
        })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}

async function checkTaskAndSendUpdates(controller: ReadableStreamDefaultController, taskId: string) {
  const userSupabase = await createUserClient()
  const adminSupabase = createAdminClient()
  let isClosed = false
  let checkInterval: NodeJS.Timeout | null = null
  let timeoutId: NodeJS.Timeout | null = null

  // 启动时立即清理超时任务
  try {
    await cleanupTimeoutTasks(adminSupabase)
  } catch (error) {
    console.error('Failed to cleanup timeout tasks on SSE start:', error)
  }

  // 安全的发送消息函数
  const safeEnqueue = (data: string) => {
    if (!isClosed) {
      try {
        controller.enqueue(data)
      } catch (error) {
        // 只在非预期错误时记录日志
        if (error instanceof Error && error.message.includes('Controller is already closed')) {
          isClosed = true
          return // 静默处理连接关闭错误
        }
        console.error('Failed to enqueue data:', error)
        isClosed = true
      }
    }
  }

  // 安全的关闭函数
  const safeClose = () => {
    if (!isClosed) {
      try {
        controller.close()
        isClosed = true
      } catch (error) {
        console.error('Failed to close controller:', error)
        isClosed = true
      }
    }
    // 清理定时器
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  // 验证用户权限
  const { data: { user }, error: authError } = await userSupabase.auth.getUser()
  
  if (authError || !user) {
    safeEnqueue(`data: ${JSON.stringify({ 
      type: 'error', 
      message: 'Authentication required' 
    })}\n\n`)
    safeClose()
    return
  }

  // 检查任务是否属于当前用户 - 使用admin client查询
  const { data: task, error: taskError } = await adminSupabase
    .from('async_tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  if (taskError || !task) {
    safeEnqueue(`data: ${JSON.stringify({ 
      type: 'error', 
      message: 'Task not found or access denied' 
    })}\n\n`)
    safeClose()
    return
  }

  // 发送当前任务状态
  safeEnqueue(`data: ${JSON.stringify({
    type: 'task_status',
    taskId,
    status: task.status,
    progress: getProgressForStatus(task.status),
    stage: task.status,
    message: getMessageForStatus(task.status)
  })}\n\n`)

  // 如果任务已完成，发送结果并关闭连接
  if (['completed', 'failed', 'cancelled'].includes(task.status)) {
    if (task.status === 'completed' && task.result_data) {
      safeEnqueue(`data: ${JSON.stringify({
        type: 'task_completed',
        taskId,
        result: task.result_data
      })}\n\n`)
    }
    
    // 延迟关闭，确保客户端收到消息
    timeoutId = setTimeout(() => safeClose(), 1000)
    return
  }

  // 对于进行中的任务，使用轻量级的状态检查
  // 每5秒检查一次任务状态
  checkInterval = setInterval(async () => {
    if (isClosed) {
      return
    }

    try {
      const { data: updatedTask, error } = await adminSupabase
        .from('async_tasks')
        .select('status, result_data, error_message, updated_at')
        .eq('id', taskId)
        .single()

      if (error) {
        console.error('Failed to check task status:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        // 不要立即关闭，继续尝试
        return
      }

      // 发送状态更新
      safeEnqueue(`data: ${JSON.stringify({
        type: 'task_status',
        taskId,
        status: updatedTask.status,
        progress: getProgressForStatus(updatedTask.status),
        stage: updatedTask.status,
        message: getMessageForStatus(updatedTask.status),
        updatedAt: updatedTask.updated_at
      })}\n\n`)

      // 如果任务完成，发送结果并停止检查
      if (['completed', 'failed', 'cancelled'].includes(updatedTask.status)) {
        if (updatedTask.status === 'completed' && updatedTask.result_data) {
          safeEnqueue(`data: ${JSON.stringify({
            type: 'task_completed',
            taskId,
            result: updatedTask.result_data
          })}\n\n`)
        } else if (updatedTask.status === 'failed') {
          safeEnqueue(`data: ${JSON.stringify({
            type: 'task_failed',
            taskId,
            error: updatedTask.error_message || 'Task processing failed'
          })}\n\n`)
        }

        // 清理interval并延迟关闭
        if (checkInterval) {
          clearInterval(checkInterval)
          checkInterval = null
        }
        timeoutId = setTimeout(() => safeClose(), 2000)
      }

    } catch (error) {
      console.error('Error in status check interval:', {
        message: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : 'Unknown error',
        taskId
      })
      // 继续尝试，不要立即关闭连接
    }
  }, 2000) // 每2秒检查一次

  // 10分钟后自动关闭连接（防止长时间占用资源）
  timeoutId = setTimeout(() => {
    safeClose()
  }, 10 * 60 * 1000)
}

function getProgressForStatus(status: string): number {
  switch (status) {
    case 'pending': return 0
    case 'processing': return 50
    case 'completed': return 100
    case 'failed': return 0
    case 'cancelled': return 0
    default: return 0
  }
}

function getMessageForStatus(status: string): string {
  switch (status) {
    case 'pending': return 'Task is waiting to be processed'
    case 'processing': return 'AI is generating your image...'
    case 'completed': return 'Task completed successfully'
    case 'failed': return 'Task processing failed'
    case 'cancelled': return 'Task was cancelled'
    default: return 'Unknown status'
  }
}

// 清理超时任务
async function cleanupTimeoutTasks(supabase: any) {
  const now = new Date()
  const pendingTimeout = new Date(now.getTime() - 10 * 60 * 1000) // 10分钟
  const processingTimeout = new Date(now.getTime() - 30 * 60 * 1000) // 30分钟

  try {
    // 清理超时的pending任务
    const { data: pendingTasks } = await supabase
      .from('async_tasks')
      .select('id')
      .eq('status', 'pending')
      .lt('created_at', pendingTimeout.toISOString())

    if (pendingTasks && pendingTasks.length > 0) {
      await supabase
        .from('async_tasks')
        .update({
          status: 'failed',
          error_message: 'Task timed out in pending state',
          completed_at: now.toISOString()
        })
        .eq('status', 'pending')
        .lt('created_at', pendingTimeout.toISOString())
      
      console.log(`🧹 Cleaned ${pendingTasks.length} timeout pending tasks`)
    }

    // 清理超时的processing任务
    const { data: processingTasks } = await supabase
      .from('async_tasks')
      .select('id')
      .eq('status', 'processing')
      .lt('started_at', processingTimeout.toISOString())

    if (processingTasks && processingTasks.length > 0) {
      await supabase
        .from('async_tasks')
        .update({
          status: 'failed',
          error_message: 'Task timed out in processing state',
          completed_at: now.toISOString()
        })
        .eq('status', 'processing')
        .lt('started_at', processingTimeout.toISOString())
      
      console.log(`🧹 Cleaned ${processingTasks.length} timeout processing tasks`)
    }

  } catch (error) {
    console.error('Failed to cleanup timeout tasks:', error)
  }
}