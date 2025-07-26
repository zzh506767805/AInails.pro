'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Crown, CreditCard } from 'lucide-react'
import { useSubscription } from '@/lib/hooks/useUser'

// 声明Stripe类型
declare global {
  interface Window {
    Stripe: any;
  }
}

// 订阅计划
const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    credits: 3,
    description: 'Perfect for trying out nail art generation',
    features: [
      '3 free nail designs',
      'Standard quality designs',
      'Basic support',
      'Community access'
    ],
    popular: false,
    icon: Sparkles
  },
  {
    name: 'Basic',
    price: 5.99,
    credits: 60,
    description: 'Perfect for nail artists and beauty professionals',
    features: [
      '60 nail designs',
      'Medium quality designs',
      'Priority processing',
      'Basic history',
      'Priority support'
    ],
    popular: false,
    icon: Zap
  },
  {
    name: 'Pro',
    price: 9.99,
    credits: 120,
    description: 'Perfect for content creators and beauty businesses',
    features: [
      '120 nail designs',
      'All Basic features',
      'High quality designs',
      'Bulk generation',
      'Advanced settings',
      'Dedicated support'
    ],
    popular: true,
    icon: Crown
  },
  {
    name: 'Max',
    price: 19.99,
    credits: 300,
    description: 'Perfect for professional studios and large businesses',
    features: [
      '300 nail designs',
      'All Pro features',
      'API access',
      'Custom models',
      'Enterprise support',
      'White-label options'
    ],
    popular: false,
    icon: Crown
  }
]

// 额外信用包
const defaultCreditPackages = [
  {
    id: 'mini',
    display_name: 'Mini Pack',
    name: 'mini_pack',
    description: 'Perfect for small projects',
    credits: 30,
    price_cents: 299
  },
  {
    id: 'standard',
    display_name: 'Standard Pack',
    name: 'standard_pack',
    description: 'Great value for regular usage',
    credits: 100,
    price_cents: 799
  },
  {
    id: 'pro',
    display_name: 'Pro Pack',
    name: 'pro_pack',
    description: 'Ideal for professional nail artists',
    credits: 250,
    price_cents: 1499
  },
  {
    id: 'bulk',
    display_name: 'Bulk Pack',
    name: 'bulk_pack',
    description: 'Best value for high volume needs',
    credits: 600,
    price_cents: 2999
  }
]

export default function PricingPage() {
  const { subscription, isMember } = useSubscription()
  const [creditPackages, setCreditPackages] = useState(defaultCreditPackages)
  
  useEffect(() => {
    // 加载Stripe.js
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.async = true
    script.onload = () => {
      console.log('Stripe.js loaded')
      console.log('Stripe publishable key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    }
    document.head.appendChild(script)

    // 检查数据库中的订阅计划
    const checkSubscriptionPlans = async () => {
      try {
        const response = await fetch('/api/subscriptions/debug')
        if (response.ok) {
          const data = await response.json()
          console.log('Database subscription plans:', data)
        } else {
          console.error('Failed to fetch subscription plans')
        }
      } catch (error) {
        console.error('Error checking subscription plans:', error)
      }
    }
    
    // 获取信用包数据
    const fetchCreditPackages = async () => {
      try {
        const response = await fetch('/api/credits/packages')
        if (response.ok) {
          const data = await response.json()
          if (data.packages && data.packages.length > 0) {
            setCreditPackages(data.packages)
          }
        }
      } catch (error) {
        console.error('Error fetching credit packages:', error)
      }
    }

    checkSubscriptionPlans()
    fetchCreditPackages()

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handlePurchase = async (planName: string) => {
    if (planName === 'Free') {
      // 免费计划，直接跳转到首页
      window.location.href = '/'
      return
    }

    try {
      // 根据计划名称获取计划ID
      const planIdMap: { [key: string]: string } = {
        'Basic': 'basic',
        'Pro': 'pro', 
        'Max': 'max'
      }
      
      const planId = planIdMap[planName]
      if (!planId) {
        alert('Invalid plan selected')
        return
      }

      console.log(`Starting purchase for ${planName} plan (ID: ${planId})`)

      // 调用订阅创建API
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      })

      console.log('API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('API response data:', data)
        
        const { sessionId } = data
        
        // 重定向到Stripe Checkout
        if (sessionId) {
          console.log('Redirecting to Stripe checkout with session ID:', sessionId)
          
          if (window.Stripe) {
            const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
            stripe.redirectToCheckout({
              sessionId: sessionId
            })
          } else {
            // 备用方案：直接重定向到Stripe URL
            console.log('Stripe.js not loaded, using direct redirect')
            window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
          }
        } else {
          console.error('No session ID in response')
          alert('Failed to create checkout session')
        }
      } else {
        const error = await response.json()
        console.error('API error:', error)
        alert(error.error || 'Purchase failed. Please try again.')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Purchase failed. Please try again.')
    }
  }
  
  const handlePurchaseCredits = async (packageId: string) => {
    try {
      console.log(`Starting purchase for credit package (ID: ${packageId})`)

      // 调用信用购买API
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packageId })
      })

      if (response.ok) {
        const data = await response.json()
        const { sessionId } = data
        
        // 重定向到Stripe Checkout
        if (sessionId) {
          if (window.Stripe) {
            const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
            stripe.redirectToCheckout({
              sessionId: sessionId
            })
          } else {
            window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
          }
        } else {
          alert('Failed to create checkout session')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Purchase failed. Please try again.')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Purchase failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isMember ? 'Add More Credits' : 'Choose Your Credit Plan'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isMember 
              ? `You have an active ${subscription?.subscription_plans.display_name} subscription. Purchase additional credits below.` 
              : 'Purchase AI credits to generate beautiful nail art designs. Each credit can generate one medium quality image or 1/5 of a high quality image.'}
          </p>
        </div>

        {/* Pricing Cards */}
        {isMember ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {creditPackages.map((pack) => (
              <Card key={pack.id} className="relative">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{pack.display_name}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${(pack.price_cents / 100).toFixed(2)}</span>
                    <span className="text-gray-600"> one-time</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {pack.credits} AI Credits
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">{Math.floor(pack.credits)} medium quality designs</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">{Math.floor(pack.credits / 5)} high quality designs</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">No expiration</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Added to your subscription</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => handlePurchaseCredits(pack.id)}
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {pricingPlans.map((plan) => {
              const IconComponent = plan.icon
              return (
                <Card key={plan.name} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.price > 0 && <span className="text-gray-600">/month</span>}
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.credits} AI Credits
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-pink-600 hover:bg-pink-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handlePurchase(plan.name)}
                    >
                      {plan.price === 0 ? 'Start Free' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Credit Usage Info */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-center mb-6">How Credits Work</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Credit Consumption</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Medium Quality</span>
                    <span className="text-blue-600 font-bold">1 Credit</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">High Quality</span>
                    <span className="text-blue-600 font-bold">5 Credits</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">What You Can Generate</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Free Plan (3 credits)</p>
                    <p>• 3 medium quality designs, or</p>
                    <p>• 0 high quality designs</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Basic Plan (60 credits)</p>
                    <p>• 60 medium quality designs, or</p>
                    <p>• 12 high quality designs</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Pro Plan (120 credits)</p>
                    <p>• 120 medium quality designs, or</p>
                    <p>• 24 high quality designs</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Max Plan (300 credits)</p>
                    <p>• 300 medium quality designs, or</p>
                    <p>• 60 high quality designs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">How do I get started?</h3>
              <p className="text-gray-600">
                Sign up for a free account to get 3 free AI credits. No credit card required, start experiencing AI nail art generation immediately.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What's the difference between quality levels?</h3>
              <p className="text-gray-600">
                Medium quality (1 credit) provides good results for most use cases. High quality (5 credits) offers superior detail and resolution for professional work.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I use designs commercially?</h3>
              <p className="text-gray-600">
                All generated nail art designs belong to the user and can be freely used for commercial purposes without additional licensing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">How do I upgrade my plan?</h3>
              <p className="text-gray-600">
                You can upgrade or downgrade your plan at any time in your account settings, with fees calculated proportionally.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 