import { useState, useEffect, useCallback, useRef } from 'react'

export interface TaskStatus {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  stage: string
  message: string
  result?: any
  error?: string
  updatedAt?: string
}

export interface AsyncTask {
  id: string
  status: TaskStatus
  prompt: string
  submittedAt: Date
}

// 辅助函数移到组件外部，避免重新创建
const getProgressForStatus = (status: string): number => {
  switch (status) {
    case 'pending': return 0
    case 'processing': return 50
    case 'completed': return 100
    case 'failed': return 0
    case 'cancelled': return 0
    default: return 0
  }
}

const getMessageForStatus = (status: string): string => {
  switch (status) {
    case 'pending': return 'Task is waiting to be processed'
    case 'processing': return 'AI is generating your image...'
    case 'completed': return 'Task completed successfully'
    case 'failed': return 'Task processing failed'
    case 'cancelled': return 'Task was cancelled'
    default: return 'Unknown status'
  }
}

export function useAsyncTasks() {
  const [tasks, setTasks] = useState<AsyncTask[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map())
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // 更新任务状态
  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus }
        : task
    ))
  }, [])

  // 轮询备用机制
  const startPolling = useCallback((taskId: string) => {
    // 清理已存在的轮询
    const existingInterval = pollingIntervalsRef.current.get(taskId)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    console.log(`🔄 Starting polling backup for task ${taskId}`)
    
    const pollTask = async () => {
      try {
        const response = await fetch(`/api/tasks/history`)
        if (response.ok) {
          const data = await response.json()
          const task = data.tasks.find((t: any) => t.id === taskId)
          
          if (task) {
            const newStatus = {
              taskId: task.id,
              status: task.status,
              progress: getProgressForStatus(task.status),
              stage: task.status,
              message: getMessageForStatus(task.status),
              result: task.result_data,
              error: task.error_message,
              updatedAt: task.updated_at
            }
            
            updateTaskStatus(taskId, newStatus)
            
            // 如果任务完成，停止轮询
            if (['completed', 'failed', 'cancelled'].includes(task.status)) {
              const interval = pollingIntervalsRef.current.get(taskId)
              if (interval) {
                clearInterval(interval)
                pollingIntervalsRef.current.delete(taskId)
              }
              console.log(`✅ Polling completed for task ${taskId}`)
            }
          }
        }
      } catch (error) {
        console.error(`Failed to poll task ${taskId}:`, error)
      }
    }

    // 立即检查一次，然后每5秒轮询
    pollTask()
    const interval = setInterval(pollTask, 5000)
    pollingIntervalsRef.current.set(taskId, interval)
  }, [updateTaskStatus])

  // 开始监听任务状态
  const startListening = useCallback((taskId: string) => {
    // 如果已经在监听这个任务，先关闭旧连接
    const existingEventSource = eventSourcesRef.current.get(taskId)
    if (existingEventSource) {
      existingEventSource.close()
      eventSourcesRef.current.delete(taskId)
    }

    const eventSource = new EventSource(`/api/tasks/status?taskId=${taskId}`)
    
    // 安全的清理函数
    const cleanup = () => {
      try {
        eventSource.close()
      } catch (error) {
        console.error('Error closing EventSource:', error)
      }
      eventSourcesRef.current.delete(taskId)
    }
    
    eventSource.onopen = () => {
      console.log(`✅ Connected to task ${taskId} status stream`)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log(`📨 SSE message for task ${taskId}:`, data)
        
        switch (data.type) {
          case 'connected':
            console.log(`🔗 Connected to task ${taskId}`)
            break
            
          case 'task_status':
            console.log(`📊 Status update for task ${taskId}: ${data.status}`)
            updateTaskStatus(taskId, {
              taskId: data.taskId,
              status: data.status,
              progress: data.progress,
              stage: data.stage,
              message: data.message,
              updatedAt: data.updatedAt
            })
            break
            
          case 'task_completed':
            console.log(`🎉 Task ${taskId} completed!`)
            updateTaskStatus(taskId, {
              taskId: data.taskId,
              status: 'completed',
              progress: 100,
              stage: 'completed',
              message: 'Task completed successfully!',
              result: data.result
            })
            // 任务完成后关闭连接
            setTimeout(cleanup, 2000)
            break
            
          case 'task_failed':
            console.log(`❌ Task ${taskId} failed:`, data.error)
            updateTaskStatus(taskId, {
              taskId: data.taskId,
              status: 'failed',
              progress: 0,
              stage: 'failed',
              message: 'Task processing failed',
              error: data.error
            })
            // 任务失败后关闭连接
            setTimeout(cleanup, 2000)
            break
            
          case 'error':
            console.error(`❌ Task ${taskId} error:`, data.message)
            updateTaskStatus(taskId, {
              taskId,
              status: 'failed',
              progress: 0,
              stage: 'error',
              message: data.message,
              error: data.message
            })
            cleanup()
            break
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error(`❌ Task ${taskId} SSE error:`, error)
      cleanup()
      
      // 启动轮询作为备用机制
      console.log(`🔄 SSE failed for task ${taskId}, switching to polling...`)
      startPolling(taskId)
    }

    eventSourcesRef.current.set(taskId, eventSource)
  }, [updateTaskStatus])

  // 加载历史任务
  const loadHistoryTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks/history')
      if (response.ok) {
        const data = await response.json()
        const historyTasks: AsyncTask[] = data.tasks.map((task: any) => ({
          id: task.id,
          status: {
            taskId: task.id,
            status: task.status,
            progress: getProgressForStatus(task.status),
            stage: task.status,
            message: getMessageForStatus(task.status),
            result: task.result_data,
            error: task.error_message,
            updatedAt: task.updated_at
          },
          prompt: task.input_data.prompt,
          submittedAt: new Date(task.created_at)
        }))
        
        setTasks(historyTasks)
        
        // 为未完成的任务重新建立SSE连接
        historyTasks.forEach(task => {
          if (['pending', 'processing'].includes(task.status.status)) {
            startListening(task.id)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load task history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [startListening])

  // 初始化时加载历史任务
  useEffect(() => {
    loadHistoryTasks()
  }, [loadHistoryTasks])

  // 提交新任务
  const submitTask = useCallback(async (taskData: {
    prompt: string
    size?: string
    quality?: string
    n?: number
    output_format?: string
    skinTone?: string
  }) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit task')
      }

      const result = await response.json()
      
      // 创建新任务对象
      const newTask: AsyncTask = {
        id: result.taskId,
        status: {
          taskId: result.taskId,
          status: 'pending',
          progress: 0,
          stage: 'pending',
          message: 'Task submitted, waiting for processing...'
        },
        prompt: taskData.prompt,
        submittedAt: new Date()
      }

      // 添加到任务列表
      setTasks(prev => [newTask, ...prev])

      // 开始监听任务状态
      startListening(result.taskId)

      return result.taskId

    } catch (error) {
      console.error('Failed to submit task:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [startListening])

  // 取消任务
  const cancelTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      })

      if (response.ok) {
        updateTaskStatus(taskId, {
          taskId,
          status: 'cancelled',
          progress: 0,
          stage: 'cancelled',
          message: 'Task cancelled by user'
        })
        
        // 关闭SSE连接
        const eventSource = eventSourcesRef.current.get(taskId)
        if (eventSource) {
          try {
            eventSource.close()
          } catch (error) {
            console.error('Error closing EventSource during cancel:', error)
          }
          eventSourcesRef.current.delete(taskId)
        }
      }
    } catch (error) {
      console.error('Failed to cancel task:', error)
    }
  }, [updateTaskStatus])

  // 删除任务
  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
    
    // 关闭SSE连接
    const eventSource = eventSourcesRef.current.get(taskId)
    if (eventSource) {
      try {
        eventSource.close()
      } catch (error) {
        console.error('Error closing EventSource during remove:', error)
      }
      eventSourcesRef.current.delete(taskId)
    }
    
    // 关闭轮询
    const interval = pollingIntervalsRef.current.get(taskId)
    if (interval) {
      clearInterval(interval)
      pollingIntervalsRef.current.delete(taskId)
    }
  }, [])

  // 清理所有连接
  useEffect(() => {
    return () => {
      eventSourcesRef.current.forEach(eventSource => {
        eventSource.close()
      })
      eventSourcesRef.current.clear()
      
      pollingIntervalsRef.current.forEach(interval => {
        clearInterval(interval)
      })
      pollingIntervalsRef.current.clear()
    }
  }, [])

  return {
    tasks,
    isSubmitting,
    isLoading,
    submitTask,
    cancelTask,
    removeTask,
    startListening
  }
}