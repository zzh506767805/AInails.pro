'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Image as ImageIcon, Users, Zap, ArrowRight, Download, Share2, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import SEOContent from '@/components/SEOContent'

// AI Nail Art Generator Component (First Screen)
function AINailArtGenerator() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('')
  const [colorPalette, setColorPalette] = useState('')
  const [quality, setQuality] = useState('medium') // 添加质量选择
  const [skinTone, setSkinTone] = useState('medium') // 添加肤色状态
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${prompt} ${style} ${colorPalette}`.trim(),
          quality: quality, // 使用选择的质量
          size: '1024x1024',
          n: 1,
          output_format: 'png',
          skinTone: skinTone, // 添加肤色参数
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.images && data.images.length > 0) {
          setGeneratedImages(prev => [...data.images, ...prev.slice(0, 3)])
        } else {
          alert('生成失败，请重试')
        }
      } else {
        const error = await response.json()
        alert(error.message || '生成失败，请重试')
      }
    } catch (error) {
      console.error('生成图片时出错:', error)
      alert('生成失败，请检查网络连接')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (imageUrl: string) => {
    // 如果是base64格式的图片
    if (imageUrl.startsWith('data:image/')) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `ai-nail-art-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // 如果是URL格式的图片
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

  const handleShare = async (imageUrl: string) => {
    // 判断是否支持原生分享功能
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI生成的美甲设计',
          text: `使用AI生成的美甲设计: ${prompt}`,
          url: imageUrl,
        })
      } catch (error) {
        console.error('分享失败:', error)
      }
    } else {
      // PC端复制图片链接或内容到剪贴板
      try {
        // 对于base64图片，复制提示信息
        const shareText = `AI生成的美甲设计: ${prompt}\n\n使用AInails AI美甲生成器创建`
        await navigator.clipboard.writeText(shareText)
        alert('图片描述已复制到剪贴板')
        
        // 尝试将图片数据复制到剪贴板（对于现代浏览器）
        if (imageUrl.startsWith('data:image/')) {
          try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const item = new ClipboardItem({ [blob.type]: blob })
            await navigator.clipboard.write([item])
            alert('图片已复制到剪贴板，您可以粘贴到其他应用程序中')
          } catch (clipErr) {
            console.error('无法复制图片到剪贴板:', clipErr)
          }
        }
      } catch (err) {
        console.error('复制到剪贴板失败:', err)
        alert('复制分享信息失败，请手动保存图片')
      }
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-pink-100 text-pink-800 hover:bg-pink-200">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Nail Art Generator
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Beautiful Nail Art
            <span className="block text-pink-600">with AI Magic</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your nail art ideas into stunning designs using cutting-edge AI technology. 
            Perfect for nail artists, beauty professionals, and nail art enthusiasts.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Generator Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">AI Nail Art Generator</CardTitle>
              <CardDescription>
                Describe your dream nail design and our AI will create it for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your nail design
                </label>
                <Textarea 
                  placeholder="e.g., Elegant French manicure with pink gradient and floral patterns, perfect for a spring wedding..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style
                  </label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="bold">Bold & Dramatic</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Palette
                  </label>
                  <Select value={colorPalette} onValueChange={setColorPalette}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose colors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pink">Pink & Rose</SelectItem>
                      <SelectItem value="blue">Blue & Purple</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="bright">Bright & Vibrant</SelectItem>
                      <SelectItem value="dark">Dark & Mysterious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality
                </label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medium">Medium Quality (1 Credit)</SelectItem>
                    <SelectItem value="high">High Quality (5 Credits)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Medium quality is perfect for most uses. High quality offers superior detail for professional work.
                </p>
              </div>

              {/* 添加肤色选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skin Tone
                </label>
                <div className="flex items-center space-x-3">
                  {/* 肤色选择选项 */}
                  <div 
                    onClick={() => setSkinTone('fair')} 
                    className={`w-10 h-10 rounded-full cursor-pointer border-2 ${skinTone === 'fair' ? 'border-pink-500' : 'border-transparent'}`}
                    style={{ backgroundColor: '#FFE5D0' }}
                    title="Fair skin tone"
                  ></div>
                  <div 
                    onClick={() => setSkinTone('light')} 
                    className={`w-10 h-10 rounded-full cursor-pointer border-2 ${skinTone === 'light' ? 'border-pink-500' : 'border-transparent'}`}
                    style={{ backgroundColor: '#FFD5B3' }}
                    title="Light skin tone"
                  ></div>
                  <div 
                    onClick={() => setSkinTone('medium')} 
                    className={`w-10 h-10 rounded-full cursor-pointer border-2 ${skinTone === 'medium' ? 'border-pink-500' : 'border-transparent'}`}
                    style={{ backgroundColor: '#E2B58F' }}
                    title="Medium skin tone"
                  ></div>
                  <div 
                    onClick={() => setSkinTone('olive')} 
                    className={`w-10 h-10 rounded-full cursor-pointer border-2 ${skinTone === 'olive' ? 'border-pink-500' : 'border-transparent'}`}
                    style={{ backgroundColor: '#C99C76' }}
                    title="Olive skin tone"
                  ></div>
                  <div 
                    onClick={() => setSkinTone('brown')} 
                    className={`w-10 h-10 rounded-full cursor-pointer border-2 ${skinTone === 'brown' ? 'border-pink-500' : 'border-transparent'}`}
                    style={{ backgroundColor: '#8D5524' }}
                    title="Brown skin tone"
                  ></div>
                  <div 
                    onClick={() => setSkinTone('dark')} 
                    className={`w-10 h-10 rounded-full cursor-pointer border-2 ${skinTone === 'dark' ? 'border-pink-500' : 'border-transparent'}`}
                    style={{ backgroundColor: '#4A2C1B' }}
                    title="Dark skin tone"
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select the skin tone that will appear in your nail design
                </p>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-pink-600 hover:bg-pink-700"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Nail Art
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Results */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-0">
              <CardTitle className="sr-only">生成的美甲设计预览</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Generated Images or Placeholders */}
              <div className="grid grid-cols-2 gap-4 pt-3">
                {generatedImages.length > 0 ? (
                  generatedImages.map((imageUrl, index) => (
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
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="flex-1 text-xs"
                          onClick={() => handleShare(imageUrl)}
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Real Nail Design 1 */}
                    <div className="relative aspect-square rounded-lg overflow-hidden border shadow-lg">
                      <Image
                        src="/images/featured_nail_french.png"
                        alt="Elegant French manicure with floral accents - Professional nail art design with delicate white tips and pink flower patterns"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        data-name="Elegant French Manicure with Floral Accents"
                        data-category="French Manicure"
                        data-style="Elegant"
                      />
                    </div>
                    
                    {/* Real Nail Design 2 */}
                    <div className="relative aspect-square rounded-lg overflow-hidden border shadow-lg">
                      <Image
                        src="/images/featured_nail_geometric.png"
                        alt="Trendy geometric nail art with bold patterns - Modern manicure featuring abstract shapes in vibrant colors"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        data-name="Trendy Geometric Nail Art with Bold Patterns"
                        data-category="Geometric Art"
                        data-style="Modern"
                      />
                    </div>
                    
                    {/* Real Nail Design 3 */}
                    <div className="relative aspect-square rounded-lg overflow-hidden border shadow-lg">
                      <Image
                        src="/images/featured_nail_ombre.png"
                        alt="Luxury gradient ombré nails with rhinestone accents - Premium salon-quality manicure with smooth color transition and sparkle details"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        data-name="Luxury Gradient Ombré Nails with Rhinestone Accents"
                        data-category="Luxury Design"
                        data-style="Glamorous"
                      />
                    </div>
                    
                    {/* Real Nail Design 4 */}
                    <div className="relative aspect-square rounded-lg overflow-hidden border shadow-lg">
                      <Image
                        src="/images/featured_nail_minimalist.png"
                        alt="Minimalist nude nails with artistic line work - Contemporary nail art combining natural tones with delicate hand-drawn elements"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        data-name="Minimalist Nude Nails with Artistic Line Work"
                        data-category="Minimalist Style"
                        data-style="Contemporary"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons - 只保留下载全部按钮，去掉Generate More */}
              {generatedImages.length > 0 && (
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => handleDownload(generatedImages[0])}>
                    <Download className="w-4 h-4 mr-2" />
                    Download All
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

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* First Screen - AI Nail Art Generator */}
      <AINailArtGenerator />
      
      {/* SEO Rich Content */}
      <SEOContent />
    </div>
  )
} 