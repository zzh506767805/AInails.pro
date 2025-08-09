'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Download, Share2, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { Locale } from '@/lib/i18n/config'
import { Dictionary } from '@/lib/i18n/dictionaries'

interface AINailArtGeneratorProps {
  locale: Locale
  dictionary: Dictionary
}

export default function AINailArtGenerator({ locale, dictionary }: AINailArtGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('')
  const [colorPalette, setColorPalette] = useState('')
  const [quality, setQuality] = useState('medium')
  const [skinTone, setSkinTone] = useState('medium')
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
          quality: quality,
          size: '1024x1024',
          n: 1,
          output_format: 'png',
          skinTone: skinTone,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.images && data.images.length > 0) {
          setGeneratedImages(prev => [...data.images, ...prev.slice(0, 3)])
        } else {
          alert('Generation failed, please try again')
        }
      } else {
        const error = await response.json()
        alert(error.message || 'Generation failed, please try again')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Generation failed, please check your network connection')
    } finally {
      setIsGenerating(false)
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

  const handleShare = async (imageUrl: string) => {
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

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Generator Form */}
          <Card className="border-0 shadow-xl">
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
                    const colors = ['#FFE5D0', '#FFD5B3', '#E2B58F', '#C99C76', '#8D5524', '#4A2C1B']
                    return (
                      <div 
                        key={tone}
                        onClick={() => setSkinTone(tone)} 
                        className={`w-10 h-10 rounded-full cursor-pointer border-2 ${
                          skinTone === tone ? 'border-pink-500' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: colors[index] }}
                        title={dictionary?.generator?.skinTones?.[tone as keyof typeof dictionary.generator.skinTones] || `${tone} skin tone`}
                      />
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dictionary?.generator?.skinToneNote || 
                    'Select the skin tone that will appear in your nail design'}
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
                    {dictionary?.generator?.generating || 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {dictionary?.generator?.generate || 'Generate Nail Art'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Results */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-0">
              <CardTitle className="sr-only">Generated nail design preview</CardTitle>
            </CardHeader>
            <CardContent>
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
                ) : (
                  <>
                    {[
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
                  </>
                )}
              </div>

              {generatedImages.length > 0 && (
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => handleDownload(generatedImages[0])}>
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