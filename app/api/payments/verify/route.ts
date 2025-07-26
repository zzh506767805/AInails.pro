import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 从Stripe获取支付会话信息
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }
    
    // 验证会话是否属于当前用户
    if (session.client_reference_id !== user.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }
    
    const { metadata } = session
    
    // 处理订阅支付
    if (session.mode === 'subscription' && metadata?.plan_id) {
      await handleSubscriptionPayment(user.id, metadata.plan_id, session, supabase)
    }
    
    // 处理credit包购买
    if (session.mode === 'payment' && metadata?.package_id && metadata?.type === 'credit_purchase') {
      await handleCreditPurchase(user.id, metadata.package_id, session, supabase)
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment verified and processed successfully' 
    })
    
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleSubscriptionPayment(userId: string, planId: string, session: Stripe.Checkout.Session, supabase: any) {
  console.log('Processing subscription payment for plan:', planId)
  
  // 获取订阅计划 - 使用name字段查询
  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('name', planId)
    .single()
  
  if (planError || !plan) {
    console.error('Plan not found:', planId, planError)
    return
  }
  
  console.log('Found plan:', plan)
  
  // 检查是否已经处理过这个支付
  const { data: existingSubscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', session.subscription)
    .single()
  
  if (existingSubscription) {
    console.log('Subscription already processed:', session.subscription)
    return // 已经处理过，避免重复
  }
  
  // 创建或更新用户订阅 - 添加onConflict参数以正确处理更新
  const { error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: plan.id, // 使用plan的UUID
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: 'active',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
    }, { onConflict: 'user_id' }) // 添加这个参数指定在user_id冲突时更新记录
  
  if (subscriptionError) {
    console.error('Error creating subscription:', subscriptionError)
    return
  }
  
  console.log('Subscription created successfully')
  
  // 添加订阅credits
  await addCreditsToUser(userId, plan.credits_per_month, 'subscription_reset', supabase, {
    subscription_id: session.subscription,
    plan_name: plan.name
  })
}

async function handleCreditPurchase(userId: string, packageId: string, session: Stripe.Checkout.Session, supabase: any) {
  console.log('Processing credit purchase for package:', packageId)
  
  // 获取credit包
  const { data: creditPackage, error: packageError } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('id', packageId)
    .single()
  
  if (packageError || !creditPackage) {
    console.error('Credit package not found:', packageId, packageError)
    return
  }
  
  console.log('Found credit package:', creditPackage)
  
  // 检查是否已经处理过这个支付
  const { data: existingTransaction } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('description', `购买 ${creditPackage.credits} credits - Session: ${session.id}`)
    .single()
  
  if (existingTransaction) {
    console.log('Credit purchase already processed:', session.id)
    return // 已经处理过，避免重复
  }
  
  // 添加购买的credits
  await addCreditsToUser(userId, creditPackage.credits, 'purchased', supabase, {
    package_id: packageId,
    session_id: session.id
  })
}

async function addCreditsToUser(userId: string, amount: number, type: string, supabase: any, metadata: any = {}) {
  console.log(`Adding ${amount} credits to user ${userId}, type: ${type}`)
  
  // 获取用户当前credits
  let { data: userCredits, error: creditsError } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (creditsError) {
    if (creditsError.code === 'PGRST116') {
      // 用户记录不存在，创建默认记录
      const { data: newCredits, error: createError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: userId,
          total_credits: 3,
          used_credits: 0,
          subscription_credits: 0,
          purchased_credits: 0,
          last_reset_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select('*')
        .single()
      
      if (createError) {
        console.error('Error creating user credits:', createError)
        return
      }
      userCredits = newCredits
    } else {
      console.error('Error fetching user credits:', creditsError)
      return
    }
  }
  
  if (userCredits) {
    // 更新用户credits
    const newTotalCredits = userCredits.total_credits + amount
    const newPurchasedCredits = type === 'purchased' ? userCredits.purchased_credits + amount : userCredits.purchased_credits
    const newSubscriptionCredits = type === 'subscription_reset' ? amount : userCredits.subscription_credits
    
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        total_credits: newTotalCredits,
        purchased_credits: newPurchasedCredits,
        subscription_credits: newSubscriptionCredits,
        last_reset_at: type === 'subscription_reset' ? new Date() : userCredits.last_reset_at
      })
      .eq('user_id', userId)
    
    if (updateError) {
      console.error('Error updating user credits:', updateError)
      return
    }
    
    console.log(`Credits updated successfully. New total: ${newTotalCredits}`)
    
    // 记录交易
    const description = type === 'purchased' 
      ? `购买 ${amount} credits - Session: ${metadata.session_id}`
      : `订阅获得 ${amount} credits - Plan: ${metadata.plan_name}`
    
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: type,
        amount: amount,
        description: description,
        package_id: metadata.package_id || null,
        subscription_id: null  // 不再尝试将Stripe的订阅ID作为UUID存储
      })
    
    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
    } else {
      console.log('Transaction recorded successfully')
    }
  }
} 