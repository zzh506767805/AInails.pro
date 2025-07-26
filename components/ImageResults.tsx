'use client'

import React from 'react'
import Image from 'next/image'

interface ImageResultsProps {
  images: string[]
  title: string
  onDownload?: (imageUrl: string) => void
  onEdit?: (imageUrl: string) => void
}

export default function ImageResults({ 
  images, 
  title, 
  onDownload, 
  onEdit 
}: ImageResultsProps) {
  if (images.length === 0) {
    return null
  }

  const handleDownloadAll = () => {
    images.forEach((image, index) => {
      const link = document.createElement('a')
      link.href = image
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  const handleSingleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${index + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {title} ({images.length})
        </h3>
        <button 
          onClick={handleDownloadAll}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm"
        >
          Download All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={image}
              alt={`${title} ${index + 1}`}
              width={512}
              height={512}
              className="w-full h-auto rounded-lg transition-all duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
              <button 
                onClick={() => handleSingleDownload(image, index)}
                className="px-3 py-1 bg-white/90 text-gray-900 rounded-md text-sm hover:bg-white transition-colors"
              >
                Download
              </button>
              {onEdit && (
                <button 
                  onClick={() => onEdit(image)}
                  className="px-3 py-1 bg-white/90 text-gray-900 rounded-md text-sm hover:bg-white transition-colors"
                >
                  Edit
                </button>
              )}
              {onDownload && (
                <button 
                  onClick={() => onDownload(image)}
                  className="px-3 py-1 bg-white/90 text-gray-900 rounded-md text-sm hover:bg-white transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 