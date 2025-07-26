'use client'

import { useEffect, useState, Suspense, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, CreditCard, Zap, ArrowRight } from 'lucide-react'
import { refreshSubscription, refreshCredits } from '@/lib/hooks/useUser'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  // 追踪已经验证过的session，避免重复处理
  const verifiedSessions = useRef(new Set())
  // 追踪支付验证尝试次数
  const verificationAttempts = useRef(0)
  const maxAttempts = 3

  // 使用防抖处理余额刷新
  const refreshUserDataWithDebounce = useCallback(() => {
    // 清除用户数据缓存
    refreshSubscription()
    refreshCredits()
    
    // 立即尝试更新一次全局状态
    fetch('/api/credits/balance', { 
      headers: { 'Cache-Control': 'no-cache' } 
    })
    .then(res => res.json())
    .catch(err => console.error('Failed to refresh credits:', err))
    
    // 使用延迟执行多次刷新，确保数据库同步后UI能更新
    const delays = [500, 1500, 3000] // 0.5秒, 1.5秒和3秒后各尝试一次
    
    delays.forEach(delay => {
      setTimeout(() => {
        refreshCredits() // 强制清除缓存
        fetch('/api/credits/balance', { 
          headers: { 'Cache-Control': 'no-cache' } 
        })
        .then(res => res.json())
        .catch(err => console.error(`Failed to refresh credits after ${delay}ms:`, err))
      }, delay)
    })
  }, [])

  useEffect(() => {
    if (sessionId && !verifiedSessions.current.has(sessionId) && verificationAttempts.current < maxAttempts) {
      // 记录这个session已经在处理中
      verifiedSessions.current.add(sessionId)
      // 增加尝试次数
      verificationAttempts.current++
      // 验证支付
      verifyPayment(sessionId)
    } else if (!sessionId) {
      setLoading(false)
    }
  }, [sessionId])

  const verifyPayment = async (sessionId: string) => {
    try {
      console.log('Verifying payment for session:', sessionId)
      
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Payment verified successfully:', data)
        setSuccess(true)
        
        // 立即刷新用户数据，使用我们的防抖处理
        refreshUserDataWithDebounce()
        
        // 延迟获取最新数据
        setTimeout(async () => {
          try {
            const testResponse = await fetch('/api/payments/test', {
              headers: { 'Cache-Control': 'no-cache' }
            })
            if (testResponse.ok) {
              const testData = await testResponse.json()
              console.log('Updated user data after payment:', testData)
              
              // 测试数据获取后再次刷新用户数据
              refreshUserDataWithDebounce()
            }
          } catch (error) {
            console.error('Error fetching updated data:', error)
          }
        }, 2000)
      } else {
        const error = await response.json()
        console.error('Payment verification failed:', error)
        setSuccess(false)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    )
  }

  if (!success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Payment Information Incomplete</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Unable to verify your payment information. Please try again or contact support.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-gray-900 text-white hover:bg-gray-800">
                <a href="/pricing">Back to Pricing</a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/">View Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <Head>
        <title>Payment Successful - DreamfinityX AI Image Generator | Thank You</title>
        <meta name="description" content="Payment successful! Your DreamfinityX subscription or credits have been activated. Start creating stunning AI images and artwork today." />
        <meta name="keywords" content="payment successful, AI image generator subscription, AI art credits, payment confirmation, DreamfinityX success" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://dreamfinityx.com/success" />
        <meta property="og:title" content="Payment Successful - DreamfinityX AI Image Generator" />
        <meta property="og:description" content="Payment successful! Your DreamfinityX subscription or credits have been activated. Start creating stunning AI images today." />
        <meta property="og:url" content="https://dreamfinityx.com/success" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
      </Head>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your subscription or Credits have been activated.
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Payment Information */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="h-5 w-5 mr-2 text-gray-700" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transaction ID</span>
                <span className="text-sm text-gray-600 font-mono">
                  {sessionId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Status</span>
                <span className="text-sm text-green-600 font-semibold">Completed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Time</span>
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleString('en-US')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Zap className="h-5 w-5 mr-2 text-gray-700" />
                What&apos;s Next
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <ArrowRight className="h-4 w-4 mr-3 text-gray-600" />
                  <span className="text-sm">Check your subscription status and Credits balance</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <ArrowRight className="h-4 w-4 mr-3 text-gray-600" />
                  <span className="text-sm">Start generating high-quality AI images</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <ArrowRight className="h-4 w-4 mr-3 text-gray-600" />
                  <span className="text-sm">View your usage history and transaction records</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button size="lg" asChild className="w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800">
              <a href="/">
                <Zap className="h-4 w-4 mr-2" />
                Start Generating
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <a href="/pricing">
                <CreditCard className="h-4 w-4 mr-2" />
                View Subscription
              </a>
            </Button>
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about your subscription or Credits, feel free to contact our support team.
            </p>
            <div className="text-sm text-gray-500">
              <p>📧 Support Email: zeta@myowncoach.online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
} 