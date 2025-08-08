import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT 
const AZURE_API_KEY = process.env.AZURE_API_KEY

// Credits消耗规则 - 简化只支持medium和high两种质量
const CREDIT_COSTS = {
  'medium': 1,
  'high': 5
}

// 美甲提示词优化 - 添加专业的前缀和后缀
const NAIL_ART_PREFIX = "Professional close-up photography of a manicure on a hand with"
const NAIL_ART_SUFFIX = ", high-resolution, beauty salon quality, professionally lit, detailed nail structure, on a clean neutral background, focused on nails"

// 肤色对应的描述
const SKIN_TONE_DESCRIPTIONS = {
  'fair': 'fair skin tone',
  'light': 'light skin tone',
  'medium': 'medium skin tone',
  'olive': 'olive skin tone', 
  'brown': 'brown skin tone',
  'dark': 'dark skin tone'
}

// 添加简明的API文档
/**
 * 生成美甲艺术图片API
 * 
 * @param prompt 图片描述
 * @param size 尺寸 (1024x1024, 1024x1536, 1536x1024)
 * @param quality 质量 (medium, high)
 * @param n 生成图片数量
 * @param output_format 输出格式 (png, jpeg)
 * @param skinTone 肤色 (fair, light, medium, olive, brown, dark)
 * @returns 生成的图片数据
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      size = '1024x1024', 
      quality = 'high',
      n = 1,
      output_format = 'png',
      skinTone = 'medium', // 默认中等肤色
      user
    } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Please enter an image description' }, { status: 400 })
    }

    // 验证用户身份和credits
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Please login to generate images' }, { status: 401 })
    }

    // 检查用户是否有足够的credits
    const creditsNeeded = CREDIT_COSTS[quality as keyof typeof CREDIT_COSTS] * n
    
    // 获取用户积分信息
    let { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', currentUser.id)
      .single()
    
    if (creditsError) {
      if (creditsError.code === 'PGRST116') {
        // 用户记录不存在，创建默认记录
        const { data: newCredits, error: createError } = await supabase
          .from('user_credits')
          .upsert({
            user_id: currentUser.id,
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
        console.error('Error fetching user credits:', creditsError)
        return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
      }
    }
    
    if (!userCredits) {
      return NextResponse.json({ error: 'Failed to retrieve credits data' }, { status: 500 })
    }
    
    const availableCredits = userCredits.total_credits - userCredits.used_credits
    if (availableCredits < creditsNeeded) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: creditsNeeded,
        available: availableCredits,
        message: `您需要 ${creditsNeeded} Credits 来生成 ${n} 张 ${quality} 质量的图片，但您只有 ${availableCredits} Credits 可用。`
      }, { status: 400 })
    }

    // 验证参数 - 简化支持的参数
    const validSizes = ['1024x1024', '1024x1536', '1536x1024']
    const validQualities = ['medium', 'high'] // 只支持medium和high
    const validFormats = ['png', 'jpeg']
    const validSkinTones = ['fair', 'light', 'medium', 'olive', 'brown', 'dark']

    if (!validSizes.includes(size)) {
      return NextResponse.json({ error: 'Invalid size. Must be 1024x1024, 1024x1536, or 1536x1024' }, { status: 400 })
    }

    if (!validQualities.includes(quality)) {
      return NextResponse.json({ error: 'Invalid quality. Must be medium or high' }, { status: 400 })
    }

    if (!validFormats.includes(output_format)) {
      return NextResponse.json({ error: 'Invalid format. Must be png or jpeg' }, { status: 400 })
    }
    
    // 验证肤色参数
    const normalizedSkinTone = skinTone.toLowerCase()
    if (!validSkinTones.includes(normalizedSkinTone)) {
      // 如果肤色无效，默认使用medium
      console.warn(`Invalid skin tone: ${skinTone}, using default medium`)
    }
    
    // 获取对应的肤色描述
    const skinToneDescription = SKIN_TONE_DESCRIPTIONS[normalizedSkinTone as keyof typeof SKIN_TONE_DESCRIPTIONS] || SKIN_TONE_DESCRIPTIONS.medium
    
    // 优化提示词，加入肤色描述和专业美甲描述
    const enhancedPrompt = `${NAIL_ART_PREFIX} ${skinToneDescription}: ${prompt} ${NAIL_ART_SUFFIX}`
    
    console.log("生成图片的优化提示词:", enhancedPrompt)

    if (n < 1 || n > 4) { // 限制最多生成4张图片
      return NextResponse.json({ error: 'Number of images must be between 1 and 4' }, { status: 400 })
    }

    const response = await fetch(
      `${AZURE_ENDPOINT}/openai/deployments/gpt-image-1/images/generations?api-version=2025-04-01-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AZURE_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: enhancedPrompt, // 使用优化后的提示词
          size,
          quality,
          output_format,
          n,
          ...(user && { user }),
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Azure API error:', errorData)
      return NextResponse.json(
        { error: 'Image generation failed, please try again later' },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid image data format received' },
        { status: 500 }
      )
    }

    // Process multiple images
    const images = data.data.map((item: any) => {
      if (!item.b64_json) {
        throw new Error('Missing image data')
      }
      return `data:image/${output_format};base64,${item.b64_json}`
    })

    // 生成成功后消耗credits - 直接调用Supabase而不是内部API
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 直接更新用户积分，避免内部API调用
    const { error: consumeError } = await supabase
      .from('user_credits')
      .update({ 
        used_credits: userCredits.used_credits + creditsNeeded 
      })
      .eq('user_id', currentUser.id)
    
    let creditsConsumed = false
    
    if (consumeError) {
      console.error('Failed to consume credits:', consumeError)
      // 记录失败但继续处理 - 用户仍然会收到图片但是需要标记为未付款
    } else {
      creditsConsumed = true
      console.log(`Successfully consumed ${creditsNeeded} credits for generation ${generationId}`)
      
      // 记录积分交易历史
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: currentUser.id,
          transaction_type: 'consume',
          credits_amount: -creditsNeeded,
          description: `生成${n}张${quality}质量图片: ${prompt.substring(0, 50)}...`,
          generation_id: generationId
        })
    }
    
    // 记录生成历史到 image_generations 表
    const { error: generationError } = await supabase
      .from('image_generations')
      .insert({
        user_id: currentUser.id,
        generation_type: 'text-to-image', // 只保留text-to-image类型
        prompt: prompt, // 保存原始提示词
        enhanced_prompt: enhancedPrompt, // 保存优化后的提示词
        result_url: images[0], // 存储第一张图片的URL
        credits_used: creditsNeeded,
        model: 'dall-e-3',
        quality: quality,
        size: size,
        settings: {
          n: n,
          output_format: output_format,
          generation_id: generationId,
          credits_consumed: creditsConsumed, // 添加积分消费状态
          skinTone: normalizedSkinTone // 保存用户选择的肤色
        }
      })
    
    if (generationError) {
      console.error('Failed to record generation:', generationError)
    }

    return NextResponse.json({
      success: true,
      images,
      count: images.length,
      // Keep backward compatibility
      image: data.data[0].b64_json,
      imageUrl: images[0],
      creditsConsumed: creditsConsumed,
      creditsNeeded: creditsNeeded,
      remainingCredits: creditsConsumed ? 
        availableCredits - creditsNeeded : 
        availableCredits,
      generationId
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 