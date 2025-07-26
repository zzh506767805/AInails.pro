import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')
    
    if (!sig) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }
    
    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, supabase)
        break
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, supabase)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, supabase)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const { client_reference_id, metadata } = session
  
  if (!client_reference_id) return
  
  // 处理订阅购买
  if (session.mode === 'subscription' && metadata?.plan_id) {
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', metadata.plan_id)
      .single()
    
    if (plan) {
      // 创建或更新用户订阅
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: client_reference_id,
          plan_id: metadata.plan_id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
        })
      
      // 添加订阅credits
      await addCreditsToUser(client_reference_id, plan.credits_per_month, 'subscription_reset', supabase, {
        subscription_id: session.subscription
      })
    }
  }
  
  // 处理credit包购买
  if (session.mode === 'payment' && metadata?.package_id && metadata?.type === 'credit_purchase') {
    const { data: creditPackage } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', metadata.package_id)
      .single()
    
    if (creditPackage) {
      // 添加购买的credits
      await addCreditsToUser(client_reference_id, creditPackage.credits, 'purchased', supabase, {
        package_id: metadata.package_id
      })
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  // 订阅创建时的处理逻辑
  console.log('Subscription created:', subscription.id)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  // 更新数据库中的订阅信息
  await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000),
      current_period_end: new Date((subscription as any).current_period_end * 1000)
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  // 标记订阅为已取消
  await supabase
    .from('user_subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  // 处理订阅续费，重置用户的月度credits
  if ((invoice as any).subscription) {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans(credits_per_month)
      `)
      .eq('stripe_subscription_id', (invoice as any).subscription)
      .single()
    
    if (subscription) {
      // 重置用户的月度credits
      await resetMonthlyCredits(subscription.user_id, subscription.subscription_plans.credits_per_month, supabase)
    }
  }
}

async function addCreditsToUser(userId: string, amount: number, type: string, supabase: any, metadata: any = {}) {
  // 获取用户当前credits
  const { data: userCredits } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (userCredits) {
    // 更新用户credits
    const newTotalCredits = userCredits.total_credits + amount
    const newPurchasedCredits = type === 'purchased' ? userCredits.purchased_credits + amount : userCredits.purchased_credits
    const newSubscriptionCredits = type === 'subscription_reset' ? userCredits.subscription_credits + amount : userCredits.subscription_credits
    
    await supabase
      .from('user_credits')
      .update({
        total_credits: newTotalCredits,
        purchased_credits: newPurchasedCredits,
        subscription_credits: newSubscriptionCredits,
        last_reset_at: type === 'subscription_reset' ? new Date() : userCredits.last_reset_at
      })
      .eq('user_id', userId)
    
    // 记录交易
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: type,
        amount: amount,
        description: `${type === 'purchased' ? '购买' : '订阅获得'} ${amount} credits`,
        package_id: metadata.package_id || null,
        subscription_id: metadata.subscription_id || null
      })
  }
}

async function resetMonthlyCredits(userId: string, monthlyCredits: number, supabase: any) {
  // 重置用户的月度credits（保留购买的credits）
  const { data: userCredits } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (userCredits) {
    await supabase
      .from('user_credits')
      .update({
        total_credits: userCredits.purchased_credits + monthlyCredits,
        used_credits: 0,
        subscription_credits: monthlyCredits,
        last_reset_at: new Date()
      })
      .eq('user_id', userId)
    
    // 记录交易
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: 'subscription_reset',
        amount: monthlyCredits,
        description: `月度credits重置: ${monthlyCredits} credits`
      })
  }
} 