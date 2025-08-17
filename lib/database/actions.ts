import { createClient } from '@/lib/supabase/client'
import { getCachedUser } from '@/lib/hooks/useUser'
import { localImageStorage } from '@/lib/utils/localStorage'

// 获取认证用户，优先使用缓存
async function getAuthenticatedUser() {
  // 首先尝试从缓存获取
  const cachedUser = getCachedUser()
  if (cachedUser) {
    return cachedUser
  }

  // 缓存miss时才调用API
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('User not authenticated')
  }
  
  return user
}

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 客户端数据库操作
export const database = {
  // 保存图像生成记录（Cloudinary方案：保存Cloudinary URL）
  async saveImageGeneration(data: {
    prompt: string
    imageUrl: string
    originalFilename?: string
    settings: Record<string, any>
    generationType: 'text-to-image' | 'image-edit' | 'pixar-style-convert' | 'ghibli-style-convert'
    cloudinaryPublicId?: string
  }) {
    // Support both Cloudinary URLs and base64 (for backward compatibility)
    const isCloudinaryUrl = data.imageUrl.includes('cloudinary.com')
    const isBase64 = data.imageUrl.startsWith('data:image/')
    
    if (!isCloudinaryUrl && !isBase64) {
      throw new Error('Expected Cloudinary URL or Base64 image data')
    }

    try {
      // For Cloudinary URLs, save directly to database
      if (isCloudinaryUrl) {
        const response = await fetch('/api/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: data.prompt,
            imageUrl: data.imageUrl, // Cloudinary URL
            cloudinaryPublicId: data.cloudinaryPublicId,
            originalFilename: data.originalFilename,
            settings: data.settings,
            generationType: data.generationType
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to save generation')
        }

        const result = await response.json()
        console.log('Cloudinary图片记录已保存:', result.data.id)
        return result.data
      } else {
        // Legacy base64 handling with local storage
        const localId = generateId()
        
        // 1. 保存元数据到数据库
        const response = await fetch('/api/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            localId: localId, // 传递本地ID用于标识
            prompt: data.prompt,
            originalFilename: data.originalFilename,
            settings: data.settings,
            generationType: data.generationType
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to save generation')
        }

        const result = await response.json()
        const dbId = result.data.id // 数据库生成的UUID
        
        // 2. 使用数据库ID保存图片到本地存储
        localImageStorage.saveImage({
          id: dbId, // 使用数据库ID确保一致性
          imageData: data.imageUrl,
          prompt: data.prompt,
          settings: data.settings,
          generationType: data.generationType
        })
        
        console.log('Base64图片记录已保存:', dbId)
        console.log('图片已保存到本地存储')

        return result.data
      }
    } catch (error) {
      console.error('保存失败:', error)
      throw new Error('Failed to save image generation')
    }
  },

  // 获取用户的图像生成历史（结合数据库记录和本地存储）
  async getUserGenerations(limit: number = 50) {
    try {
      // 从数据库获取元数据
      const response = await fetch(`/api/generations?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch generations')
      }

      const result = await response.json()
      const generations = result.data || []
      
      // 从本地存储获取所有图片
      const localImages = localImageStorage.getAllImages()
      
      // 合并数据：为每个数据库记录找到对应的本地图片
      const mergedGenerations = generations.map((generation: any) => {
        const localImage = localImages.find(img => img.id === generation.id)
        
        return {
          ...generation,
          // 如果找到本地图片，使用本地图片；否则显示占位符
          image_url: localImage?.imageData || null
        }
      })
      
      // 如果有本地图片但数据库中没有对应记录，也要包含进来
      const orphanedImages = localImages.filter(img => 
        !generations.find((gen: any) => gen.id === img.id)
      )
      
      const orphanedGenerations = orphanedImages.map(img => ({
        id: img.id,
        prompt: img.prompt,
        image_url: img.imageData,
        settings: img.settings,
        generation_type: img.generationType,
        created_at: new Date(img.timestamp).toISOString()
      }))
      
      // 合并所有记录并按时间排序
      const allGenerations = [...mergedGenerations, ...orphanedGenerations]
      allGenerations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      return allGenerations.slice(0, limit)
    } catch (error) {
      console.error('获取历史记录失败:', error)
      
      // 如果网络请求失败，至少返回本地存储的数据
      console.log('从本地存储获取历史记录')
      const localImages = localImageStorage.getAllImages()
      
      return localImages.slice(0, limit).map(img => ({
        id: img.id,
        prompt: img.prompt,
        image_url: img.imageData,
        settings: img.settings,
        generation_type: img.generationType,
        created_at: new Date(img.timestamp).toISOString()
      }))
    }
  },

  // 删除图像生成记录（同时删除本地存储）
  async deleteImageGeneration(id: string) {
    try {
      // 1. 从本地存储删除
      localImageStorage.deleteImage(id)
      
      // 2. 从数据库删除
      const response = await fetch(`/api/generations?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        console.warn('删除数据库记录失败，但本地存储已删除')
      }
      
      console.log('记录已删除:', id)
    } catch (error) {
      console.error('删除记录失败:', error)
      throw new Error('Failed to delete generation')
    }
  },

  // 获取存储使用情况
  getStorageInfo() {
    return localImageStorage.getStorageInfo()
  },

  // 清空所有图片
  clearAllImages() {
    localImageStorage.clearAllImages()
  },

  // 获取用户配置
  async getUserProfile() {
    const supabase = createClient()
    const user = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  },

  // 更新用户配置
  async updateUserProfile(profile: {
    fullName?: string
    avatarUrl?: string
  }) {
    const supabase = createClient()
    const user = await getAuthenticatedUser()

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        full_name: profile.fullName,
        avatar_url: profile.avatarUrl
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }
} 