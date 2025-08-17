'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  Download, 
  Share2, 
  X,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'
import { AsyncTask } from '@/lib/hooks/useAsyncTasks'

interface TaskStatusCardProps {
  task: AsyncTask
  onCancel: (taskId: string) => void
  onRemove: (taskId: string) => void
  onDownload?: (imageUrl: string) => void
  onShare?: (imageUrl: string, prompt: string) => void
}

export function TaskStatusCard({ 
  task, 
  onCancel, 
  onRemove, 
  onDownload, 
  onShare
}: TaskStatusCardProps) {
  const { status, prompt, submittedAt } = task

  const getStatusIcon = () => {
    switch (status.status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canCancel = status.status === 'pending' || status.status === 'processing'
  const canRemove = status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled'
  const hasResult = status.status === 'completed' && status.result?.images?.length > 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-sm font-medium">
              {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
            </CardTitle>
            <Badge variant="secondary" className={getStatusColor()}>
              {status.stage}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(task.id)}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Prompt */}
        <div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {prompt}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Submitted {submittedAt.toLocaleString()}
          </p>
        </div>

        {/* Progress */}
        {(status.status === 'pending' || status.status === 'processing') && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{status.message}</span>
              <span className="text-gray-500">{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>
        )}

        {/* Error Message */}
        {status.status === 'failed' && status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{status.error}</p>
          </div>
        )}

        {/* Result Images */}
        {hasResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {status.result.images.slice(0, 4).map((imageUrl: string, index: number) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* Action buttons for completed tasks */}
            <div className="flex gap-2">
              {onDownload && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onDownload(status.result.images[0])}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              )}
              {onShare && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onShare(status.result.images[0], prompt)}
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {canCancel && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onCancel(task.id)}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          {canRemove && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRemove(task.id)}
              className="flex-1"
            >
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}