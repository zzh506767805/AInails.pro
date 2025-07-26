import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export async function POST(request: Request) {
  try {
    const { packageId } = await request.json()
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 获取credit包
    const { data: creditPackage, error: packageError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single()
    
    if (packageError || !creditPackage) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }
    
    // 在Stripe中创建价格（如果还没有）
    let stripePriceId = creditPackage.stripe_price_id
    if (!stripePriceId) {
      const stripePrice = await stripe.prices.create({
        unit_amount: creditPackage.price_cents,
        currency: 'usd',
        product_data: {
          name: creditPackage.display_name
        }
      })
      
      stripePriceId = stripePrice.id
      
      // 更新包的stripe_price_id
      await supabase
        .from('credit_packages')
        .update({ stripe_price_id: stripePriceId })
        .eq('id', packageId)
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
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      client_reference_id: user.id,
      metadata: {
        package_id: packageId,
        user_id: user.id,
        type: 'credit_purchase'
      }
    })
    
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating credit purchase:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 