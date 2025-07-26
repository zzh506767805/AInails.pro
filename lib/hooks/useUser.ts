'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'

interface UserCredits {
  total_credits: number
  used_credits: number
  available_credits: number
}

// 缓存版本控制，避免部署后缓存不匹配
const CACHE_VERSION = '1753374130731.8msf6'

// 全局用户缓存和状态，避免重复请求和loading闪烁
let userCache: { user: User | null; timestamp: number; version: string } | null = null
let globalLoading = false
let globalUser: User | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

// 全局credits缓存
let creditsCache: { credits: UserCredits | null; timestamp: number; version: string } | null = null
let globalCredits: UserCredits | null = null
const CREDITS_CACHE_DURATION = 10 * 1000 // 降低为10秒缓存，让余额更快更新

// 头像验证缓存 - 避免重复验证同一个URL
let avatarValidationCache: { [url: string]: { isValid: boolean; timestamp: number } } = {}
const AVATAR_VALIDATION_CACHE_DURATION = 10 * 60 * 1000 // 10分钟缓存
let avatarValidationInProgress = new Set<string>()

// 全局状态更新回调
const stateCallbacks = new Set<(user: User | null, loading: boolean) => void>()
const creditsCallbacks = new Set<(credits: UserCredits | null) => void>()

// 获取当前最新的用户状态（考虑缓存）
const getCurrentUserState = () => {
  const now = Date.now()
  const hasValidCache = userCache && 
    (now - userCache.timestamp) < CACHE_DURATION && 
    userCache.version === CACHE_VERSION
  
  if (hasValidCache) {
    return { 
      user: userCache!.user, 
      loading: false 
    }
  }
  
  // 如果有全局用户但缓存过期，仍然返回用户但需要重新获取
  if (globalUser) {
    return { 
      user: globalUser, 
      loading: false 
    }
  }
  
  return { 
    user: null, 
    loading: true 
  }
}

// 验证头像URL是否有效（带缓存）
const validateAvatarUrl = async (url: string): Promise<boolean> => {
  // 检查缓存
  const cached = avatarValidationCache[url]
  if (cached && (Date.now() - cached.timestamp) < AVATAR_VALIDATION_CACHE_DURATION) {
    return cached.isValid
  }
  
  // 检查是否已经在验证中
  if (avatarValidationInProgress.has(url)) {
    return true // 假定有效，避免重复请求
  }
  
  try {
    avatarValidationInProgress.add(url)
    const response = await fetch(url, { method: 'HEAD' })
    const isValid = response.ok
    
    // 缓存结果
    avatarValidationCache[url] = {
      isValid,
      timestamp: Date.now()
    }
    
    return isValid
  } catch {
    // 缓存失败结果
    avatarValidationCache[url] = {
      isValid: false,
      timestamp: Date.now()
    }
    return false
  } finally {
    avatarValidationInProgress.delete(url)
  }
}

// 刷新用户头像URL
const refreshUserAvatar = async (user: User): Promise<User> => {
  try {
    const supabase = createClient()
    
    // 重新获取Google用户信息
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      return session.user
    }
    
    return user
  } catch (error) {
    console.error('Failed to refresh user avatar:', error)
    return user
  }
}

// 防抖验证头像URL
let avatarValidationTimeout: NodeJS.Timeout | null = null
const debouncedValidateAvatar = (user: User) => {
  if (avatarValidationTimeout) {
    clearTimeout(avatarValidationTimeout)
  }
  
  avatarValidationTimeout = setTimeout(async () => {
    const avatarUrl = user.user_metadata?.avatar_url
    if (!avatarUrl) return
    
    const isValid = await validateAvatarUrl(avatarUrl)
    if (!isValid) {
      console.warn('Avatar URL is invalid, attempting to refresh:', avatarUrl)
      // 尝试刷新用户信息
      const refreshedUser = await refreshUserAvatar(user)
      if (refreshedUser.user_metadata?.avatar_url !== avatarUrl) {
        console.log('Avatar URL refreshed successfully')
        // 更新缓存
        userCache = {
          user: refreshedUser,
          timestamp: Date.now(),
          version: CACHE_VERSION
        }
        stateCallbacks.forEach(callback => callback(refreshedUser, false))
      }
    }
  }, 1000) // 1秒防抖
}

export function useUser() {
  // 始终基于最新状态初始化，避免loading闪烁
  const currentState = getCurrentUserState()
  const [user, setUser] = useState<User | null>(currentState.user)
  const [loading, setLoading] = useState(currentState.loading)

  const updateUser = useCallback((newUser: User | null) => {
    globalUser = newUser
    globalLoading = false
    
    // 只在用户首次登录或头像URL发生变化时验证
    if (newUser?.user_metadata?.avatar_url) {
      const currentAvatarUrl = userCache?.user?.user_metadata?.avatar_url
      if (currentAvatarUrl !== newUser.user_metadata.avatar_url) {
        // 头像URL发生变化，需要验证
        debouncedValidateAvatar(newUser)
      }
    }
    
    // 更新缓存
    userCache = {
      user: newUser,
      timestamp: Date.now(),
      version: CACHE_VERSION
    }
    
    // 如果用户变化，清除credits缓存
    if (globalUser?.id !== newUser?.id) {
      creditsCache = null
      globalCredits = null
      creditsCallbacks.forEach(callback => callback(null))
    }
    
    // 通知所有组件更新
    stateCallbacks.forEach(callback => callback(newUser, false))
  }, [])

  // 立即同步到全局状态（如果有更新的缓存）
  useEffect(() => {
    const latestState = getCurrentUserState()
    if (user !== latestState.user || loading !== latestState.loading) {
      setUser(latestState.user)
      setLoading(latestState.loading)
    }
  }, [loading, user])

  useEffect(() => {
    // 注册状态更新回调
    const callback = (newUser: User | null, newLoading: boolean) => {
      setUser(newUser)
      setLoading(newLoading)
    }
    stateCallbacks.add(callback)

    const supabase = createClient()
    let mounted = true

    // 检查是否需要重新获取用户数据
    const now = Date.now()
    const hasValidCache = userCache && (now - userCache.timestamp) < CACHE_DURATION
    
    if (hasValidCache) {
      // 缓存有效，无需任何操作
      return () => {
        stateCallbacks.delete(callback)
      }
    }

    // 只有在没有有效缓存时才获取用户数据
    // 注意：不设置loading状态，因为我们可能已经有globalUser
    const fetchUserIfNeeded = async (retries = 3) => {
      try {
        // 添加短暂延迟，确保DOM已准备好
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          updateUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        
        // 如果是网络错误且还有重试次数，则重试
        if (retries > 0 && mounted) {
          console.log(`Retrying user fetch, ${retries} attempts remaining`)
          setTimeout(() => fetchUserIfNeeded(retries - 1), 1000)
        } else if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchUserIfNeeded()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          updateUser(session?.user ?? null)
        }
      }
    )

    return () => {
      mounted = false
      stateCallbacks.delete(callback)
      subscription.unsubscribe()
    }
  }, [updateUser])

  return { user, loading }
}

// 防止重复请求的状态
let isCreditsLoading = false

// 全局credits hook
export function useCredits() {
  const { user } = useUser()
  
  // 检查缓存
  const cachedCredits = creditsCache && (Date.now() - creditsCache.timestamp) < CREDITS_CACHE_DURATION ? creditsCache.credits : null
  const [credits, setCredits] = useState<UserCredits | null>(cachedCredits || globalCredits)

  const updateCredits = useCallback((newCredits: UserCredits | null) => {
    globalCredits = newCredits
    
    // 更新缓存
    if (newCredits) {
      creditsCache = {
        credits: newCredits,
        timestamp: Date.now(),
        version: CACHE_VERSION
      }
    }
    
    // 通知所有组件更新
    creditsCallbacks.forEach(callback => callback(newCredits))
  }, [])

  useEffect(() => {
    // 注册credits更新回调
    const callback = (newCredits: UserCredits | null) => {
      setCredits(newCredits)
    }
    creditsCallbacks.add(callback)

    return () => {
      creditsCallbacks.delete(callback)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      // 用户未登录，清除credits
      updateCredits(null)
      return
    }

    // 如果有有效缓存，直接使用
    if (creditsCache && 
        (Date.now() - creditsCache.timestamp) < CREDITS_CACHE_DURATION &&
        creditsCache.version === CACHE_VERSION) {
      if (credits !== creditsCache.credits) {
        setCredits(creditsCache.credits)
      }
      return
    }

    // 防止重复请求：如果已经在加载中，不再发起新请求
    if (isCreditsLoading) {
      return
    }

    // 获取credits数据
    const fetchCredits = async () => {
      if (isCreditsLoading) return // 双重检查
      
      isCreditsLoading = true
      try {
        const response = await fetch('/api/credits/balance')
        if (response.ok) {
          const data = await response.json()
          updateCredits(data)
        }
      } catch (error) {
        console.error('Error fetching credits:', error)
      } finally {
        isCreditsLoading = false
      }
    }

    fetchCredits()
  }, [user, credits, updateCredits]) // 只依赖user，移除credits避免循环

  return credits
}

// 提供一个获取缓存用户的方法
export function getCachedUser(): User | null {
  if (userCache && (Date.now() - userCache.timestamp) < CACHE_DURATION) {
    return userCache.user
  }
  return null
}

// 清除缓存的方法（用于登出时）
export function clearUserCache() {
  userCache = null
  globalUser = null
  globalLoading = false
  
  // 清理credits缓存
  creditsCache = null
  globalCredits = null
  
  // 清理头像验证缓存
  avatarValidationCache = {}
  if (avatarValidationTimeout) {
    clearTimeout(avatarValidationTimeout)
    avatarValidationTimeout = null
  }
  
  // 通知所有组件更新
  stateCallbacks.forEach(callback => callback(null, false))
  creditsCallbacks.forEach(callback => callback(null))
}

// 清理过期或版本不匹配的缓存
export function cleanExpiredCache() {
  const now = Date.now()
  
  // 清理过期的用户缓存
  if (userCache && (now - userCache.timestamp) > CACHE_DURATION) {
    userCache = null
  }
  
  // 清理过期的credits缓存
  if (creditsCache && (now - creditsCache.timestamp) > CREDITS_CACHE_DURATION) {
    creditsCache = null
  }
  
  // 清理过期的头像验证缓存
  Object.keys(avatarValidationCache).forEach(url => {
    if ((now - avatarValidationCache[url].timestamp) > AVATAR_VALIDATION_CACHE_DURATION) {
      delete avatarValidationCache[url]
    }
  })
}

// 刷新credits缓存的方法（用于消费credits后）
export function refreshCredits() {
  creditsCache = null
  globalCredits = null
  // 立即触发一次余额查询
  fetch('/api/credits/balance', { 
    headers: { 'Cache-Control': 'no-cache' }
  }).catch(err => console.log('Background credits refresh error:', err))
} 

// 全局subscription缓存
let subscriptionCache: { subscription: UserSubscription | null; timestamp: number } | null = null
let globalSubscription: UserSubscription | null = null
const SUBSCRIPTION_CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

// 全局订阅状态更新回调
const subscriptionCallbacks = new Set<(subscription: UserSubscription | null) => void>()

// 防止重复请求的状态
let isSubscriptionLoading = false

// 用户订阅类型
interface UserSubscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  plan_id: string
  status: 'active' | 'inactive' | 'cancelled' | 'trialing' | 'past_due'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
  subscription_plans: {
    name: string
    display_name: string
    description: string
    price_cents: number
    credits_per_month: number
  }
}

// 用户订阅hook
export function useSubscription() {
  const { user } = useUser()
  
  // 检查缓存
  const cachedSubscription = subscriptionCache && (Date.now() - subscriptionCache.timestamp) < SUBSCRIPTION_CACHE_DURATION ? subscriptionCache.subscription : null
  const [subscription, setSubscription] = useState<UserSubscription | null>(cachedSubscription || globalSubscription)
  const [loading, setLoading] = useState(false)



  const updateSubscription = useCallback((newSubscription: UserSubscription | null) => {
    globalSubscription = newSubscription
    
    // 更新缓存
    subscriptionCache = {
      subscription: newSubscription,
      timestamp: Date.now()
    }
    
    // 通知所有组件更新
    subscriptionCallbacks.forEach(callback => callback(newSubscription))
  }, [])

  useEffect(() => {
    // 注册subscription更新回调
    const callback = (newSubscription: UserSubscription | null) => {
      setSubscription(newSubscription)
    }
    subscriptionCallbacks.add(callback)

    return () => {
      subscriptionCallbacks.delete(callback)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      // 用户未登录，清除subscription
      updateSubscription(null)
      return
    }

    // 如果有有效缓存，且缓存的订阅数据不为空，直接使用
    if (subscriptionCache && 
        (Date.now() - subscriptionCache.timestamp) < SUBSCRIPTION_CACHE_DURATION &&
        subscriptionCache.subscription !== null) {
      if (subscription !== subscriptionCache.subscription) {
        setSubscription(subscriptionCache.subscription)
      }
      return
    }

    // 防止重复请求：如果已经在加载中，不再发起新请求
    if (isSubscriptionLoading) {
      return
    }

    // 获取subscription数据
    const fetchSubscription = async () => {
      if (isSubscriptionLoading) {
        return // 双重检查
      }
      
      isSubscriptionLoading = true
      setLoading(true)
      try {
        const response = await fetch('/api/subscriptions/current')
        
        if (response.ok) {
          const data = await response.json()
          updateSubscription(data.subscription)
        } else {
          const errorData = await response.text()
          console.error('Subscription API error:', errorData)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        isSubscriptionLoading = false
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user, subscription, updateSubscription]) // 只依赖user，移除subscription避免循环

  // 检查用户是否有活跃的订阅
  const hasActiveSubscription = subscription?.status === 'active'
  
  // 检查订阅是否在试用期
  const isTrialing = subscription?.status === 'trialing'
  
  // 检查是否是会员（活跃订阅或试用期）
  const isMember = hasActiveSubscription || isTrialing



  return { 
    subscription, 
    loading, 
    hasActiveSubscription, 
    isTrialing, 
    isMember,
    // 便捷方法
    refreshSubscription: () => {
      subscriptionCache = null
      globalSubscription = null
      isSubscriptionLoading = false
    }
  }
}

// 刷新subscription缓存的方法（用于订阅后）
export function refreshSubscription() {
  subscriptionCache = null
  globalSubscription = null
} 