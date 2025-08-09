'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Crown, CreditCard } from 'lucide-react'
import { useSubscription } from '@/lib/hooks/useUser'
import { Locale } from '@/lib/i18n/config'
import { Dictionary } from '@/lib/i18n/dictionaries'

// 声明Stripe类型
declare global {
  interface Window {
    Stripe: any;
  }
}

type Props = {
  dictionary: Dictionary
  locale: Locale
}

// 默认信用包
const getDefaultCreditPackages = (dict: Dictionary) => [
  {
    id: 'mini',
    display_name: dict.pricing.creditPackages.mini.name,
    name: 'mini_pack',
    description: dict.pricing.creditPackages.mini.description,
    credits: 30,
    price_cents: 299
  },
  {
    id: 'standard',
    display_name: dict.pricing.creditPackages.standard.name,
    name: 'standard_pack',
    description: dict.pricing.creditPackages.standard.description,
    credits: 100,
    price_cents: 799
  },
  {
    id: 'pro',
    display_name: dict.pricing.creditPackages.pro.name,
    name: 'pro_pack',
    description: dict.pricing.creditPackages.pro.description,
    credits: 250,
    price_cents: 1499
  },
  {
    id: 'bulk',
    display_name: dict.pricing.creditPackages.bulk.name,
    name: 'bulk_pack',
    description: dict.pricing.creditPackages.bulk.description,
    credits: 600,
    price_cents: 2999
  }
]

export default function PricingClient({ dictionary, locale }: Props) {
  const { subscription, isMember } = useSubscription()
  const [creditPackages, setCreditPackages] = useState(getDefaultCreditPackages(dictionary))
  
  // 获取定价计划数据
  const pricingPlans = [
    {
      name: 'free',
      displayName: dictionary.pricing.plans.free.name,
      price: 0,
      credits: 3,
      description: dictionary.pricing.plans.free.description,
      features: [
        dictionary.pricing.plans.free.features.designs,
        dictionary.pricing.plans.free.features.quality,
        dictionary.pricing.plans.free.features.support,
        dictionary.pricing.plans.free.features.community
      ],
      popular: false,
      icon: Sparkles
    },
    {
      name: 'basic',
      displayName: dictionary.pricing.plans.basic.name,
      price: 5.99,
      credits: 60,
      description: dictionary.pricing.plans.basic.description,
      features: [
        dictionary.pricing.plans.basic.features.designs,
        dictionary.pricing.plans.basic.features.quality,
        dictionary.pricing.plans.basic.features.processing,
        dictionary.pricing.plans.basic.features.history,
        dictionary.pricing.plans.basic.features.support
      ],
      popular: false,
      icon: Zap
    },
    {
      name: 'pro',
      displayName: dictionary.pricing.plans.pro.name,
      price: 9.99,
      credits: 120,
      description: dictionary.pricing.plans.pro.description,
      features: [
        dictionary.pricing.plans.pro.features.designs,
        dictionary.pricing.plans.pro.features.basicFeatures,
        dictionary.pricing.plans.pro.features.quality,
        dictionary.pricing.plans.pro.features.bulk,
        dictionary.pricing.plans.pro.features.settings,
        dictionary.pricing.plans.pro.features.support
      ],
      popular: true,
      icon: Crown
    },
    {
      name: 'max',
      displayName: dictionary.pricing.plans.max.name,
      price: 19.99,
      credits: 300,
      description: dictionary.pricing.plans.max.description,
      features: [
        dictionary.pricing.plans.max.features.designs,
        dictionary.pricing.plans.max.features.proFeatures,
        dictionary.pricing.plans.max.features.api,
        dictionary.pricing.plans.max.features.models,
        dictionary.pricing.plans.max.features.support,
        dictionary.pricing.plans.max.features.whiteLabel
      ],
      popular: false,
      icon: Crown
    }
  ]
  
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
            // 更新显示名称和描述为多语言
            const localizedPackages = data.packages.map((pack: any) => {
              const localizedPack = getDefaultCreditPackages(dictionary).find(p => p.id === pack.id)
              return {
                ...pack,
                display_name: localizedPack?.display_name || pack.display_name,
                description: localizedPack?.description || pack.description
              }
            })
            setCreditPackages(localizedPackages)
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
    if (planName === 'free') {
      // 免费计划，直接跳转到首页
      window.location.href = `/${locale}`
      return
    }

    try {
      console.log(`Starting purchase for ${planName} plan`)

      // 调用订阅创建API
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId: planName })
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
            {isMember ? dictionary.pricing.titleWithCredits : dictionary.pricing.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isMember 
              ? dictionary.pricing.descriptionWithSubscription.replace('{subscriptionName}', subscription?.subscription_plans.display_name || '')
              : dictionary.pricing.description}
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
                    <span className="text-gray-600"> {dictionary.pricing.oneTime}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {pack.credits} {dictionary.pricing.aiCredits}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">{Math.floor(pack.credits)} {dictionary.pricing.mediumQualityDesigns}</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">{Math.floor(pack.credits / 5)} {dictionary.pricing.highQualityDesigns}</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">{dictionary.pricing.noExpiration}</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">{dictionary.pricing.addedToSubscription}</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => handlePurchaseCredits(pack.id)}
                  >
                    {dictionary.pricing.buyNow}
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
                      {dictionary.pricing.mostPopular}
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.price > 0 && <span className="text-gray-600">/{dictionary.pricing.monthly.toLowerCase()}</span>}
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.credits} {dictionary.pricing.aiCredits}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
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
                      {plan.price === 0 ? dictionary.pricing.startFree : dictionary.pricing.choosePlan}
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
            <h2 className="text-2xl font-bold text-center mb-6">{dictionary.pricing.howCreditsWork.title}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">{dictionary.pricing.howCreditsWork.consumption.title}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{dictionary.pricing.howCreditsWork.consumption.mediumQuality}</span>
                    <span className="text-blue-600 font-bold">1 {dictionary.pricing.howCreditsWork.consumption.creditSingular}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{dictionary.pricing.howCreditsWork.consumption.highQuality}</span>
                    <span className="text-blue-600 font-bold">5 {dictionary.pricing.howCreditsWork.consumption.creditsPlural}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{dictionary.pricing.howCreditsWork.whatCanGenerate.title}</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">{dictionary.pricing.howCreditsWork.whatCanGenerate.freePlan}</p>
                    <p>• 3 {dictionary.pricing.howCreditsWork.whatCanGenerate.mediumDesigns}</p>
                    <p>• 0 {dictionary.pricing.howCreditsWork.whatCanGenerate.highDesigns}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">{dictionary.pricing.howCreditsWork.whatCanGenerate.basicPlan}</p>
                    <p>• 60 {dictionary.pricing.howCreditsWork.whatCanGenerate.mediumDesigns}</p>
                    <p>• 12 {dictionary.pricing.howCreditsWork.whatCanGenerate.highDesigns}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">{dictionary.pricing.howCreditsWork.whatCanGenerate.proPlan}</p>
                    <p>• 120 {dictionary.pricing.howCreditsWork.whatCanGenerate.mediumDesigns}</p>
                    <p>• 24 {dictionary.pricing.howCreditsWork.whatCanGenerate.highDesigns}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">{dictionary.pricing.howCreditsWork.whatCanGenerate.maxPlan}</p>
                    <p>• 300 {dictionary.pricing.howCreditsWork.whatCanGenerate.mediumDesigns}</p>
                    <p>• 60 {dictionary.pricing.howCreditsWork.whatCanGenerate.highDesigns}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">{dictionary.pricing.faq.title}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">{dictionary.pricing.faq.howToStart.question}</h3>
              <p className="text-gray-600">
                {dictionary.pricing.faq.howToStart.answer}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{dictionary.pricing.faq.qualityDifference.question}</h3>
              <p className="text-gray-600">
                {dictionary.pricing.faq.qualityDifference.answer}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{dictionary.pricing.faq.commercialUse.question}</h3>
              <p className="text-gray-600">
                {dictionary.pricing.faq.commercialUse.answer}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{dictionary.pricing.faq.upgradePlan.question}</h3>
              <p className="text-gray-600">
                {dictionary.pricing.faq.upgradePlan.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}