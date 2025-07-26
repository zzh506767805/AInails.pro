'use client'

import React, { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { ChunkLoadErrorHandler } from '@/lib/utils/chunkErrorHandler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  isChunkError: boolean
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, isChunkError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): State {
    const isChunkError = error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')
    return { hasError: true, error, isChunkError, retryCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 如果是chunk加载错误，使用专门的处理器
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      ChunkLoadErrorHandler.handleChunkLoadError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 如果是chunk加载错误，显示专门的错误界面
      if (this.state.isChunkError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Loading Issue</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  We&apos;re having trouble loading some components. This usually happens after an update.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Please try refreshing the page. If the problem persists, we&apos;ll clear the cache automatically.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Page
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // 清理缓存后重新加载
                      localStorage.clear()
                      sessionStorage.clear()
                      window.location.href = '/'
                    }} 
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Clear Cache & Go Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      // 普通错误界面
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left text-sm text-gray-500 mb-4 p-3 bg-gray-100 rounded">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                </details>
              )}
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'} 
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 