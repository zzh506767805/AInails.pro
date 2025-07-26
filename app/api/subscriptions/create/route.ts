import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export async function POST(request: Request) {
  try {
    const { planId } = await request.json()
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 获取订阅计划
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', planId)
      .single()
    
    if (planError || !plan) {
      console.error('Plan not found:', planId, planError)
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    
    // 检查用户是否已有订阅
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json({ error: 'User already has an active subscription' }, { status: 400 })
    }
    
    // 在Stripe中创建价格（如果还没有）
    let stripePriceId = plan.stripe_price_id
    if (!stripePriceId) {
      const stripePrice = await stripe.prices.create({
        unit_amount: plan.price_cents,
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        product_data: {
          name: plan.display_name
        }
      })
      
      stripePriceId = stripePrice.id
      
      // 更新计划的stripe_price_id
      await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: stripePriceId })
        .eq('id', planId)
    }
    
    // 创建Stripe Checkout会话
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      client_reference_id: user.id,
      metadata: {
        plan_id: planId,
        user_id: user.id
      }
    })
    
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 