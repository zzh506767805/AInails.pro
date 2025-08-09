import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = {
  title: 'Sitemap - AInails',
  description: 'Complete sitemap of AInails website. Find all pages and resources for AI nail art generation.',
}

export default function SitemapPage() {
  const pages = [
    {
      title: 'Home',
      url: '/',
      description: 'AI Nail Art Generator - Create beautiful nail designs with AI technology'
    },

    {
      title: 'Pricing',
      url: '/pricing',
      description: 'Choose the perfect plan for your nail art generation needs'
    },
    {
      title: 'Privacy Policy',
      url: '/privacy',
      description: 'Learn how we protect your privacy and data'
    },
    {
      title: 'Terms of Service',
      url: '/terms',
      description: 'Terms and conditions for using AInails services'
    },
  ]

  const blogPosts = [
    {
      title: '2024 Nail Art Trends: What\'s Hot This Year',
      url: '/blog/2024-nail-art-trends',
      description: 'Discover the hottest nail art trends for 2024'
    },
    {
      title: 'How to Create Perfect Gradient Nail Designs',
      url: '/blog/gradient-nail-designs',
      description: 'Master the art of gradient nail designs with our comprehensive guide'
    },
    {
      title: 'Nail Art Maintenance: Keeping Your Designs Fresh',
      url: '/blog/nail-art-maintenance',
      description: 'Essential tips for maintaining your nail art designs'
    },
    {
      title: 'Spring Nail Art Ideas: Fresh and Vibrant Designs',
      url: '/blog/spring-nail-art-ideas',
      description: 'Embrace spring with these vibrant nail art ideas'
    },
    {
      title: 'Celebrity Nail Art: Red Carpet Looks You Can Recreate',
      url: '/blog/celebrity-nail-art',
      description: 'Get inspired by celebrity nail art from the red carpet'
    },
    {
      title: 'AI in Nail Art: The Future of Design Creation',
      url: '/blog/ai-nail-art-future',
      description: 'Explore how artificial intelligence is transforming the nail art industry'
    },
    {
      title: 'Essential Nail Art Tools',
      url: '/blog/nail-art-tools',
      description: 'Must-have tools for every nail artist'
    },
    {
      title: 'Advanced Nail Art Techniques',
      url: '/blog/nail-art-techniques',
      description: 'Master advanced nail art techniques'
    },
    {
      title: 'Nail Art Business Tips',
      url: '/blog/nail-art-business',
      description: 'Grow your nail art business'
    },
    {
      title: 'Nail Art Education & Training',
      url: '/blog/nail-art-education',
      description: 'Learn from the best in the industry'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sitemap</h1>
          <p className="text-xl text-gray-600">
            Complete overview of all pages and resources on AInails
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Main Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages.map((page) => (
                  <div key={page.url} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <Link 
                      href={page.url}
                      className="text-lg font-semibold text-pink-600 hover:text-pink-700 block mb-2"
                    >
                      {page.title}
                    </Link>
                    <p className="text-gray-600 text-sm">{page.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blog Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <div key={post.url} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <Link 
                      href={post.url}
                      className="text-lg font-semibold text-pink-600 hover:text-pink-700 block mb-2"
                    >
                      {post.title}
                    </Link>
                    <p className="text-gray-600 text-sm">{post.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">API Documentation</h3>
                <p className="text-gray-600 text-sm">
                  Access our AI nail art generation API for developers
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Support Center</h3>
                <p className="text-gray-600 text-sm">
                  Get help with using our AI nail art generator
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600 text-sm">
                  Join our community of nail artists and beauty enthusiasts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XML Sitemap Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            For search engines and developers, you can also access our XML sitemap:
          </p>
          <Link 
            href="/sitemap.xml"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            View XML Sitemap →
          </Link>
        </div>
      </div>
    </div>
  )
} 