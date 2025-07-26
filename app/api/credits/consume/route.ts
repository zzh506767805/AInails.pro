import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Credits消耗规则
const CREDIT_COSTS = {
  'low': 1,
  'medium': 1,
  'high': 5
}

export async function POST(request: Request) {
  let supabase;
  try {
    // 检查用户认证
    supabase = await createClient()
    
    // 使用getUser获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Auth error in consume credits:', userError)
      return NextResponse.json({ 
        error: 'Authentication error',
        details: userError.message
      }, { status: 401 })
    }
    
    if (!user) {
      console.error('No authenticated user found in consume credits API')
      return NextResponse.json({ error: 'Unauthorized: No user found' }, { status: 401 })
    }
    
    const { credits_to_consume, generation_id, description } = await request.json()
    
    if (!credits_to_consume || credits_to_consume < 1) {
      return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 })
    }
    
    console.log(`Processing credits consumption for user ${user.id}: ${credits_to_consume} credits`)
    
    // 获取用户当前积分
    let { data: userCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', user.id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // 用户记录不存在，创建默认记录
        console.log(`Creating new credits record for user ${user.id}`)
        const { data: newCredits, error: createError } = await supabase
          .from('user_credits')
          .upsert({
            user_id: user.id,
            total_credits: 10, // 给新用户10个免费积分
            used_credits: 0,
            last_reset_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
          .select('total_credits, used_credits')
          .single()
        
        if (createError) {
          console.error('Error creating user credits:', createError)
          return NextResponse.json({ error: 'Failed to create credits' }, { status: 500 })
        }
        
        userCredits = newCredits
      } else {
        console.error('Error fetching user credits:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
      }
    }
    
    if (!userCredits) {
      return NextResponse.json({ error: 'Failed to retrieve credits data' }, { status: 500 })
    }
    
    const availableCredits = userCredits.total_credits - userCredits.used_credits
    
    if (availableCredits < credits_to_consume) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        available_credits: availableCredits 
      }, { status: 400 })
    }
    
    // 更新用户积分
    const { data: updatedCredits, error: updateError } = await supabase
      .from('user_credits')
      .update({
        used_credits: userCredits.used_credits + credits_to_consume
      })
      .eq('user_id', user.id)
      .select('total_credits, used_credits')
      .single()
    
    if (updateError) {
      console.error('Error consuming credits:', updateError)
      return NextResponse.json({ error: 'Failed to consume credits' }, { status: 500 })
    }
    
    console.log(`Successfully consumed ${credits_to_consume} credits for user ${user.id}`)
    
    // 记录交易到 credit_transactions 表
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        type: 'spent',
        amount: -credits_to_consume,
        description: description || `消费 ${credits_to_consume} credits`,
        generation_id: null // 避免UUID格式错误，先设置为null
      })
    
    if (transactionError) {
      console.error('Failed to record transaction:', transactionError)
      // 不阻止响应，但记录错误
    } else {
      console.log('Transaction recorded successfully')
    }
    
    const remainingCredits = updatedCredits.total_credits - updatedCredits.used_credits
    
    return NextResponse.json({ 
      success: true,
      remaining_credits: remainingCredits,
      user_id: user.id,
      credits_consumed: credits_to_consume
    })
  } catch (error) {
    console.error('Unexpected error in consume credits API:', error)
    
    // 尝试记录错误详情，便于调试
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage,
      trace: errorStack
    }, { status: 500 })
  }
}

// 获取用户剩余credits（简化版，用于快速检查）
export async function GET() {
  try {
    const supabase = await createClient()
    
    // 修复安全警告：使用getUser()替代getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 只获取必要字段，优化查询性能
    let { data: credits, error } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // 用户记录不存在，创建默认记录
        const { data: newCredits, error: createError } = await supabase
          .from('user_credits')
          .upsert({
            user_id: user.id,
            total_credits: 10, // 给新用户10个免费积分
            used_credits: 0,
            last_reset_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
          .select('total_credits, used_credits')
          .single()
        
        if (createError) {
          console.error('Error creating user credits:', createError)
          return NextResponse.json({ error: 'Failed to create credits' }, { status: 500 })
        }
        
        credits = newCredits
      } else {
        console.error('Error fetching user credits:', error)
        return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
      }
    }
    
    if (!credits) {
      return NextResponse.json({ error: 'Failed to retrieve credits data' }, { status: 500 })
    }
    
    const availableCredits = credits.total_credits - credits.used_credits
    
    return NextResponse.json({ 
      available_credits: availableCredits 
    }, {
      headers: {
        'Cache-Control': 'private, max-age=10', // 10秒缓存
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 