import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 压缩Base64图片
export function compressBase64Image(
  base64String: string, 
  quality: number = 0.7, 
  maxWidth: number = 512
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 计算压缩后的尺寸
        let { width, height } = img
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = (height * maxWidth) / width
            width = maxWidth
          } else {
            width = (width * maxWidth) / height
            height = maxWidth
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // 绘制并压缩
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = base64String
    } catch (error) {
      reject(error)
    }
  })
}

// 获取Base64图片大小（KB）
export function getBase64Size(base64String: string): number {
  return Math.round(base64String.length * 0.75 / 1024) // 大概的KB大小
} 