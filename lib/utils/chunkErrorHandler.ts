// Chunk加载错误处理工具
export class ChunkLoadErrorHandler {
  private static retryCount = 0
  private static maxRetries = 3
  private static retryDelay = 1000

  // 处理chunk加载错误
  static handleChunkLoadError(error: Error): void {
    console.error('Chunk load error:', error)
    
    // 如果是chunk加载错误
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      this.retryChunkLoad()
    }
  }

  // 重试chunk加载
  private static retryChunkLoad(): void {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      console.log(`Retrying chunk load, attempt ${this.retryCount}/${this.maxRetries}`)
      
      setTimeout(() => {
        // 重新加载页面
        window.location.reload()
      }, this.retryDelay * this.retryCount)
    } else {
      console.error('Max chunk load retries exceeded')
      // 清理缓存后重新加载
      this.clearCacheAndReload()
    }
  }

  // 清理缓存并重新加载
  private static clearCacheAndReload(): void {
    try {
      // 清理localStorage
      localStorage.clear()
      
      // 清理sessionStorage
      sessionStorage.clear()
      
      // 清理缓存
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name)
          })
        })
      }
      
      // 强制刷新页面
      window.location.href = window.location.href
    } catch (error) {
      console.error('Error clearing cache:', error)
      // 最后的手段：直接重新加载
      window.location.reload()
    }
  }

  // 重置重试计数
  static resetRetryCount(): void {
    this.retryCount = 0
  }

  // 监听未捕获的错误
  static setupGlobalErrorHandler(): void {
    // 监听运行时错误
    window.addEventListener('error', (event) => {
      if (event.error && event.error.name === 'ChunkLoadError') {
        event.preventDefault()
        this.handleChunkLoadError(event.error)
      }
    })

    // 监听Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.name === 'ChunkLoadError') {
        event.preventDefault()
        this.handleChunkLoadError(event.reason)
      }
    })

    // 监听路由变化，重置重试计数
    if (typeof window !== 'undefined') {
      const originalPushState = window.history.pushState
      window.history.pushState = function(...args) {
        ChunkLoadErrorHandler.resetRetryCount()
        return originalPushState.apply(window.history, args)
      }
    }
  }
}

// 创建一个React错误边界hook
export function useChunkErrorHandler() {
  const handleError = (error: Error, errorInfo: any) => {
    console.error('React Error Boundary caught error:', error, errorInfo)
    
    // 检查是否是chunk加载错误
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      ChunkLoadErrorHandler.handleChunkLoadError(error)
    }
  }

  return { handleError }
}

// 在应用启动时初始化
export function initializeChunkErrorHandler() {
  if (typeof window !== 'undefined') {
    ChunkLoadErrorHandler.setupGlobalErrorHandler()
  }
} 