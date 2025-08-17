'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Download, Share2, RefreshCw, Clock, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

import { Dictionary } from '@/lib/i18n/dictionaries'
import { useAsyncTasks } from '@/lib/hooks/useAsyncTasks'
import { TaskStatusCard } from '@/components/TaskStatusCard'

interface AINailArtGeneratorProps {
  dictionary: Dictionary
}

export default function AINailArtGenerator({ dictionary }: AINailArtGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('')
  const [colorPalette, setColorPalette] = useState('')
  const [quality, setQuality] = useState('medium')
  const [skinTone, setSkinTone] = useState('medium')
  const [generatedImages] = useState<string[]>([])
  const [showTasks, setShowTasks] = useState(false)
  const [cardHeight, setCardHeight] = useState<number | null>(null)

  // 使用异步任务hook
  const { tasks, isSubmitting, isLoading, submitTask, cancelTask, removeTask } = useAsyncTasks()

  // 引用左侧卡片
  const leftCardRef = useRef<HTMLDivElement>(null)

  // 监听左侧卡片高度变化
  useEffect(() => {
    if (showTasks && leftCardRef.current) {
      const updateHeight = () => {
        const height = leftCardRef.current?.offsetHeight
        if (height) {
          setCardHeight(height)
        }
      }

      // 延迟执行，确保DOM渲染完成
      const timer = setTimeout(updateHeight, 100)

      // 监听窗口大小变化
      window.addEventListener('resize', updateHeight)

      // 使用 ResizeObserver 监听元素大小变化
      const resizeObserver = new ResizeObserver(() => {
        setTimeout(updateHeight, 50)
      })
      resizeObserver.observe(leftCardRef.current)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', updateHeight)
        resizeObserver.disconnect()
      }
    } else {
      setCardHeight(null)
    }
  }, [showTasks])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    try {
      await submitTask({
        prompt: `${prompt} ${style} ${colorPalette}`.trim(),
        quality: quality,
        size: '1024x1024',
        n: 1,
        output_format: 'png',
        skinTone: skinTone,
      })

      // 自动显示任务面板
      setShowTasks(true)

      // 清空当前表单（可选）
      // setPrompt('')
      // setStyle('')
      // setColorPalette('')

    } catch (error) {
      console.error('Error submitting task:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit task')
    }
  }

  const handleDownload = (imageUrl: string) => {
    if (imageUrl.startsWith('data:image/')) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `ai-nail-art-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `ai-nail-art-${Date.now()}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        })
    }
  }

  const handleShare = async (imageUrl: string, prompt?: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Nail Design',
          text: `AI generated nail design: ${prompt}`,
          url: imageUrl,
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      try {
        const shareText = `AI generated nail design: ${prompt}\n\nCreated with AInails AI Nail Art Generator`
        await navigator.clipboard.writeText(shareText)
        alert('Description copied to clipboard')

        if (imageUrl.startsWith('data:image/')) {
          try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const item = new ClipboardItem({ [blob.type]: blob })
            await navigator.clipboard.write([item])
            alert('Image copied to clipboard')
          } catch (clipErr) {
            console.error('Unable to copy image to clipboard:', clipErr)
          }
        }
      } catch (err) {
        console.error('Copy to clipboard failed:', err)
        alert('Failed to copy, please save image manually')
      }
    }
  }

  // 开发环境手动处理任务
  const handleManualProcess = async () => {
    try {
      console.log('🔧 Manually triggering task processing...')
      const response = await fetch('/api/tasks/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to trigger task processing')
      }

      const result = await response.json()
      console.log('✅ Task processing triggered:', result)

      // 显示成功消息
      if (result.taskId) {
        alert(`Successfully processed task: ${result.taskId}`)
      } else {
        alert(result.message || 'No pending tasks to process')
      }
    } catch (error) {
      console.error('❌ Failed to trigger task processing:', error)
      alert('Failed to trigger task processing')
    }
  }

  // 开发环境手动清理超时任务
  const handleManualCleanup = async () => {
    try {
      console.log('🧹 Manually triggering task cleanup...')
      const response = await fetch('/api/tasks/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to trigger task cleanup')
      }

      const result = await response.json()
      console.log('✅ Task cleanup triggered:', result)

      // 显示清理结果
      if (result.cleaned.total > 0) {
        alert(`Cleaned ${result.cleaned.total} timeout tasks (${result.cleaned.pending} pending, ${result.cleaned.processing} processing)`)
      } else {
        alert('No timeout tasks to clean')
      }
    } catch (error) {
      console.error('❌ Failed to trigger task cleanup:', error)
      alert('Failed to trigger task cleanup')
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-pink-100 text-pink-800 hover:bg-pink-200">
            <Sparkles className="w-4 h-4 mr-2" />
            {dictionary?.hero?.badge || 'AI-Powered Nail Art Generator'}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {dictionary?.hero?.title || 'Create Beautiful Nail Art'}
            <span className="block text-pink-600">
              {dictionary?.hero?.subtitle || 'with AI Magic'}
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {dictionary?.hero?.description ||
              'Transform your nail art ideas into stunning designs using cutting-edge AI technology. Perfect for nail artists, beauty professionals, and nail art enthusiasts.'}
          </p>
        </div>

        {/* 上半部分：生成器表单和任务面板 */}
        <div className={`grid gap-12 ${showTasks ? 'lg:grid-cols-2 lg:items-start' : 'lg:grid-cols-1 max-w-2xl mx-auto'}`}>
          {/* Generator Form */}
          <Card ref={leftCardRef} className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                {dictionary?.generator?.title || 'AI Nail Art Generator'}
              </CardTitle>
              <CardDescription>
                {dictionary?.generator?.description ||
                  'Describe your dream nail design and our AI will create it for you'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {dictionary?.generator?.labels?.describe || 'Describe your nail design'}
                </label>
                <Textarea
                  placeholder={dictionary?.generator?.placeholder ||
                    'e.g., Elegant French manicure with pink gradient and floral patterns, perfect for a spring wedding...'}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {dictionary?.generator?.labels?.style || 'Style'}
                  </label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elegant">
                        {dictionary?.generator?.styles?.elegant || 'Elegant'}
                      </SelectItem>
                      <SelectItem value="bold">
                        {dictionary?.generator?.styles?.bold || 'Bold & Dramatic'}
                      </SelectItem>
                      <SelectItem value="minimalist">
                        {dictionary?.generator?.styles?.minimalist || 'Minimalist'}
                      </SelectItem>
                      <SelectItem value="vintage">
                        {dictionary?.generator?.styles?.vintage || 'Vintage'}
                      </SelectItem>
                      <SelectItem value="modern">
                        {dictionary?.generator?.styles?.modern || 'Modern'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {dictionary?.generator?.labels?.colorPalette || 'Color Palette'}
                  </label>
                  <Select value={colorPalette} onValueChange={setColorPalette}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose colors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pink">
                        {dictionary?.generator?.colors?.pink || 'Pink & Rose'}
                      </SelectItem>
                      <SelectItem value="blue">
                        {dictionary?.generator?.colors?.blue || 'Blue & Purple'}
                      </SelectItem>
                      <SelectItem value="neutral">
                        {dictionary?.generator?.colors?.neutral || 'Neutral'}
                      </SelectItem>
                      <SelectItem value="bright">
                        {dictionary?.generator?.colors?.bright || 'Bright & Vibrant'}
                      </SelectItem>
                      <SelectItem value="dark">
                        {dictionary?.generator?.colors?.dark || 'Dark & Mysterious'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {dictionary?.generator?.labels?.quality || 'Quality'}
                </label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medium">
                      {dictionary?.generator?.qualities?.medium || 'Medium Quality (1 Credit)'}
                    </SelectItem>
                    <SelectItem value="high">
                      {dictionary?.generator?.qualities?.high || 'High Quality (5 Credits)'}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {dictionary?.generator?.qualityNote ||
                    'Medium quality is perfect for most uses. High quality offers superior detail for professional work.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {dictionary?.generator?.labels?.skinTone || 'Skin Tone'}
                </label>
                <div className="flex items-center space-x-3">
                  {['fair', 'light', 'medium', 'olive', 'brown', 'dark'].map((tone, index) => {
                    // 更准确的肤色色值，避免生成偏暗的效果
                    const colors = ['#FFEEE6', '#F7D7C4', '#E8C4A0', '#D4A574', '#B08D57', '#8B6F47']
                    const labels = {
                      fair: 'Very Fair',
                      light: 'Light',
                      medium: 'Medium',
                      olive: 'Olive',
                      brown: 'Brown',
                      dark: 'Deep'
                    }
                    return (
                      <div
                        key={tone}
                        onClick={() => setSkinTone(tone)}
                        className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-all duration-200 hover:scale-105 ${skinTone === tone
                          ? 'border-pink-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                        style={{ backgroundColor: colors[index] }}
                        title={dictionary?.generator?.skinTones?.[tone as keyof typeof dictionary.generator.skinTones] || labels[tone as keyof typeof labels]}
                      />
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {dictionary?.generator?.skinToneNote ||
                    'Select the skin tone that will appear in your nail design'}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      {'Submitting Task...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {dictionary?.generator?.generate || 'Generate Nail Art'}
                    </>
                  )}
                </Button>

                {/* 任务状态切换按钮 */}
                {tasks.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowTasks(!showTasks)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {showTasks ? 'Hide Tasks' : `Show Tasks (${tasks.length})`}
                    {tasks.filter(t => t.status.status === 'completed').length > 0 && (
                      <CheckCircle2 className="w-4 h-4 ml-2 text-green-500" />
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 任务状态面板 */}
          {showTasks && tasks.length > 0 && (
            <Card
              className="border-0 shadow-xl flex flex-col"
              style={{ height: cardHeight ? `${cardHeight}px` : 'auto' }}
            >
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-xl flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Active Tasks ({tasks.length})
                </CardTitle>
                <CardDescription>
                  Monitor your image generation progress
                </CardDescription>
                {/* 开发环境调试按钮 */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManualProcess}
                      className="text-xs"
                    >
                      🔧 Process Tasks
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManualCleanup}
                      className="text-xs"
                    >
                      🧹 Cleanup Timeouts
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-y-auto min-h-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
                    <span className="ml-2 text-gray-600">Loading tasks...</span>
                  </div>
                ) : tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TaskStatusCard
                      key={task.id}
                      task={task}
                      onCancel={cancelTask}
                      onRemove={removeTask}
                      onDownload={handleDownload}
                      onShare={handleShare}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No tasks yet. Submit your first task to get started!
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 下半部分：生成结果展示 */}
        <div className="mt-16">
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-2xl text-center">
                {generatedImages.length > 0 || tasks.filter(task => task.status.status === 'completed').length > 0
                  ? 'Your AI Generated Designs'
                  : 'Example Nail Art Designs'}
              </CardTitle>
              <CardDescription className="text-center">
                {generatedImages.length > 0 || tasks.filter(task => task.status.status === 'completed').length > 0
                  ? 'Your stunning AI-created nail art designs'
                  : 'Get inspired by these beautiful nail art examples'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                {/* 显示生成的图片 */}
                {generatedImages.length > 0 && generatedImages.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border shadow-lg">
                    <Image
                      src={imageUrl}
                      alt={`AI Generated Nail Design ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs"
                        onClick={() => handleDownload(imageUrl)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        {dictionary?.generator?.save || 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs"
                        onClick={() => handleShare(imageUrl)}
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        {dictionary?.generator?.share || 'Share'}
                      </Button>
                    </div>
                  </div>
                ))}

                {/* 显示完成的任务结果 */}
                {tasks.filter(task => task.status.status === 'completed' && task.status.result?.images).map((task) =>
                  task.status.result.images.map((imageUrl: string, imgIndex: number) => (
                    <div key={`task-${task.id}-img-${imgIndex}`} className="relative aspect-square rounded-lg overflow-hidden border shadow-lg">
                      <Image
                        src={imageUrl}
                        alt={`Generated: ${task.prompt}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 text-xs"
                          onClick={() => handleDownload(imageUrl)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          {dictionary?.generator?.save || 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 text-xs"
                          onClick={() => handleShare(imageUrl)}
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          {dictionary?.generator?.share || 'Share'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                {/* 只在没有任何内容且没有任务时显示示例图 */}
                {generatedImages.length === 0 &&
                  tasks.filter(task => task.status.status === 'completed').length === 0 &&
                  tasks.length === 0 && [
                    { src: '/images/featured_nail_french.png', alt: 'Elegant French manicure with floral accents' },
                    { src: '/images/featured_nail_geometric.png', alt: 'Trendy geometric nail art with bold patterns' },
                    { src: '/images/featured_nail_ombre.png', alt: 'Luxury gradient ombré nails with rhinestone accents' },
                    { src: '/images/featured_nail_minimalist.png', alt: 'Minimalist nude nails with artistic line work' }
                  ].map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border shadow-lg">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  ))}
              </div>

              {generatedImages.length > 0 && (
                <div className="flex gap-3 mt-6 justify-center">
                  <Button variant="outline" onClick={() => handleDownload(generatedImages[0])}>
                    <Download className="w-4 h-4 mr-2" />
                    {dictionary?.generator?.download || 'Download All'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}