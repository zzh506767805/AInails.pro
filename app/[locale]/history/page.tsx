'use client'

import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { database } from '@/lib/database/actions'
import { useUser } from '@/lib/hooks/useUser'
import Image from 'next/image'

export default function HistoryPage() {
  const { user, loading } = useUser()
  const [generations, setGenerations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storageInfo, setStorageInfo] = useState<{
    imageCount: number
    storageSize: string
    isNearLimit: boolean
  }>({ imageCount: 0, storageSize: '0MB', isNearLimit: false })
  const loadingRef = useRef(false)
  const lastUserIdRef = useRef<string | null>(null)

  // 加载存储信息
  useEffect(() => {
    const info = database.getStorageInfo()
    setStorageInfo(info)
  }, [generations.length])

  // 主要的加载逻辑
  useEffect(() => {
    if (loading) {
      return // 还在加载用户信息
    }
    
    if (!user) {
      // 用户未登录，但仍可查看本地存储的图片
      setIsLoading(false)
      loadLocalImages()
      lastUserIdRef.current = null
      return
    }
    
    // 用户已登录，检查是否需要加载数据
    if (lastUserIdRef.current !== user.id && !loadingRef.current) {
      loadingRef.current = true
      setIsLoading(true)
      setError(null)
      
      // 加载用户的图像历史（结合云端和本地）
      database.getUserGenerations(100)
        .then(data => {
          setGenerations(data)
          lastUserIdRef.current = user.id
        })
        .catch(error => {
          console.error('Failed to load user generations:', error)
          setError('Failed to load history')
          // 如果云端加载失败，尝试加载本地数据
          loadLocalImages()
        })
        .finally(() => {
          setIsLoading(false)
          loadingRef.current = false
        })
    } else if (lastUserIdRef.current === user.id) {
      setIsLoading(false)
    }
  }, [loading, user])

  // 加载本地图片
  const loadLocalImages = async () => {
    try {
      const localData = await database.getUserGenerations(100)
      setGenerations(localData)
    } catch (error) {
      console.error('Failed to load local images:', error)
      setError('Failed to load local images')
    }
  }

  const handleRetry = () => {
    if (user?.id) {
      lastUserIdRef.current = null
      loadingRef.current = false
      setError(null)
      setIsLoading(true)
    } else {
      // 未登录用户重试加载本地图片
      loadLocalImages()
    }
  }

  // 删除图片
  const handleDeleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    
    try {
      await database.deleteImageGeneration(id)
      // 重新加载数据
      const updatedData = await database.getUserGenerations(100)
      setGenerations(updatedData)
      // 更新存储信息
      const info = database.getStorageInfo()
      setStorageInfo(info)
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Delete failed, please try again')
    }
  }

  // 清空所有图片
  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all local images? This action cannot be undone!')) return
    
    try {
      database.clearAllImages()
      setGenerations([])
      const info = database.getStorageInfo()
      setStorageInfo(info)
    } catch (error) {
      console.error('Clear all failed:', error)
      alert('Clear all failed, please try again')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-20">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading history</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Generation History - AInails | Your AI Art Gallery</title>
        <meta name="description" content="View your AI image generation history on AInails. Browse through all your AI-generated and edited images, manage your AI art collection." />
        <meta name="keywords" content="AI image history, AI art gallery, image generation history, AI artwork collection, AInails history, AI creative dashboard" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://ainails.pro/history" />
        <meta property="og:title" content="Generation History - AInails" />
        <meta property="og:description" content="View your AI image generation history on AInails. Browse through all your AI-generated and edited images." />
        <meta property="og:url" content="https://ainails.pro/history" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
      </Head>
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Generation History</h1>
            <p className="text-lg text-gray-600">
              Browse through all your AI-generated and edited images
            </p>
            
            {/* 存储使用情况 */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Local Storage: {storageInfo.imageCount} images, {storageInfo.storageSize}
                    </span>
                  </div>
                  {storageInfo.isNearLimit && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Storage almost full
                    </span>
                  )}
                </div>
                
                {storageInfo.imageCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                  >
                    Clear all images
                  </button>
                )}
              </div>
            </div>
          </div>

          {generations.length === 0 ? (
            <div className="text-center py-20">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No images yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start generating images to see them appear here.
              </p>
              <a
                href="/"
                className="mt-4 inline-block px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
              >
                Generate Images
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {generations.map((generation) => (
                <div key={generation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
                  <div className="aspect-square relative">
                    {generation.image_url ? (
                      <Image
                        src={generation.image_url}
                        alt={generation.prompt}
                        fill
                        className="object-cover"
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">Image unavailable</p>
                        </div>
                      </div>
                    )}
                    
                    {/* 删除按钮 */}
                    <button
                      onClick={() => handleDeleteImage(generation.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        generation.generation_type === 'text-to-image' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {generation.generation_type === 'text-to-image' ? 'Generated' : 'Edited'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {generation.settings?.size || '1024x1024'}
                      </span>
                      

                    </div>
                    
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                      {generation.prompt}
                    </p>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(generation.created_at).toLocaleDateString()}
                    </p>
                    
                    <div className="flex gap-2">
                      {generation.image_url && (
                        <a
                          href={generation.image_url}
                          download={`ainails-${generation.id}.png`}
                          className="flex-1 px-3 py-2 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 text-center"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 