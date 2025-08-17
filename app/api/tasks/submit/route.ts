import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { uploadImageToCloudinary } from '@/lib/cloudinary'

// Credits消耗规则
const CREDIT_COSTS = {
  'medium': 1,
  'high': 5
}

/**
 * 提交异步图片生成任务
 * 立即返回任务ID，不等待处理完成
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      size = '1024x1024', 
      quality = 'high',
      n = 1,
      output_format = 'png',
      skinTone = 'medium'
    } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Please enter an image description' }, { status: 400 })
    }

    // 验证用户身份
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Please login to generate images' }, { status: 401 })
    }

    // 计算所需积分
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
            total_credits: 10,
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

    // 验证参数
    const validSizes = ['1024x1024', '1024x1536', '1536x1024']
    const validQualities = ['medium', 'high']
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

    if (n < 1 || n > 4) {
      return NextResponse.json({ error: 'Number of images must be between 1 and 4' }, { status: 400 })
    }

    // 创建异步任务
    const { data: task, error: taskError } = await supabase
      .from('async_tasks')
      .insert({
        user_id: currentUser.id,
        task_type: 'image_generation',
        status: 'pending',
        input_data: {
          prompt,
          size,
          quality,
          n,
          output_format,
          skinTone: skinTone.toLowerCase()
        },
        credits_required: creditsNeeded,
        priority: quality === 'high' ? 2 : 3 // 高质量任务优先级更高
      })
      .select('id')
      .single()

    if (taskError) {
      console.error('Failed to create task:', taskError)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    // 立即在后台开始处理任务，不阻塞响应
    console.log(`🚀 Starting immediate processing for task ${task.id}`)
    processTaskInBackground(task.id).catch(error => {
      console.error(`❌ Background task processing failed for ${task.id}:`, error)
    })

    // 立即返回任务ID
    return NextResponse.json({
      success: true,
      taskId: task.id,
      creditsRequired: creditsNeeded,
      status: 'pending',
      message: 'Task submitted successfully. Processing started immediately.'
    })

  } catch (error) {
    console.error('Task submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 使用service role key创建管理员客户端
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 后台处理任务的函数
async function processTaskInBackground(taskId: string) {
  const supabase = createAdminClient()
  const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT
  const AZURE_API_KEY = process.env.AZURE_API_KEY

  if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
    throw new Error('Azure OpenAI credentials not configured')
  }

  try {
    console.log(`🔄 Background processing started for task ${taskId}`)

    // 首先清理任何超时的任务
    await cleanupTimeoutTasks(supabase)

    // 获取任务详情
    const { data: task, error: fetchError } = await supabase
      .from('async_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('status', 'pending')
      .single()

    if (fetchError || !task) {
      console.error(`❌ Task ${taskId} not found or not pending:`, fetchError)
      return
    }

    // 更新任务状态为处理中
    const { error: updateError } = await supabase
      .from('async_tasks')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('id', taskId)

    if (updateError) {
      console.error(`❌ Failed to update task ${taskId} status:`, updateError)
      return
    }

    console.log(`🎨 Starting image generation for task ${taskId}`)

    // 处理图片生成
    await processImageGeneration(supabase, task)

    console.log(`✅ Task ${taskId} completed successfully`)

  } catch (error) {
    console.error(`❌ Task ${taskId} processing failed:`, error)
    
    // 更新任务状态为失败
    await supabase
      .from('async_tasks')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
  }
}

// 清理超时任务
async function cleanupTimeoutTasks(supabase: any) {
  const now = new Date()
  const pendingTimeout = new Date(now.getTime() - 10 * 60 * 1000) // 10分钟
  const processingTimeout = new Date(now.getTime() - 30 * 60 * 1000) // 30分钟

  try {
    // 清理超时的pending任务
    await supabase
      .from('async_tasks')
      .update({
        status: 'failed',
        error_message: 'Task timed out in pending state',
        completed_at: now.toISOString()
      })
      .eq('status', 'pending')
      .lt('created_at', pendingTimeout.toISOString())

    // 清理超时的processing任务
    await supabase
      .from('async_tasks')
      .update({
        status: 'failed',
        error_message: 'Task timed out in processing state',
        completed_at: now.toISOString()
      })
      .eq('status', 'processing')
      .lt('started_at', processingTimeout.toISOString())

  } catch (error) {
    console.error('Failed to cleanup timeout tasks:', error)
  }
}

// 处理图片生成任务
async function processImageGeneration(supabase: any, task: any) {
  const { prompt, size, quality, n, output_format, skinTone } = task.input_data
  const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT
  const AZURE_API_KEY = process.env.AZURE_API_KEY

  // 美甲提示词优化
  const NAIL_ART_PREFIX = "Professional close-up photography of a manicure on a hand with"
  const NAIL_ART_SUFFIX = ". High-resolution, beauty salon quality, professionally lit, detailed nail structure, accurate skin tone representation, on a clean neutral background, focused on nails and hand"
  
  const SKIN_TONE_DESCRIPTIONS = {
    'fair': 'very fair, pale, porcelain skin tone with pink undertones, light complexion',
    'light': 'light, peachy-beige skin tone with warm undertones, bright complexion',
    'medium': 'medium, golden-beige skin tone with neutral undertones, natural complexion',
    'olive': 'olive, warm golden-brown skin tone with yellow-green undertones, Mediterranean complexion',
    'brown': 'rich brown, caramel skin tone with warm golden undertones, warm complexion',
    'dark': 'deep, rich brown skin tone with warm undertones, deep complexion'
  }

  const skinToneDescription = SKIN_TONE_DESCRIPTIONS[skinTone as keyof typeof SKIN_TONE_DESCRIPTIONS] || SKIN_TONE_DESCRIPTIONS.medium
  const enhancedPrompt = `${NAIL_ART_PREFIX} ${skinToneDescription}, showcasing: ${prompt}. ${NAIL_ART_SUFFIX}. Ensure accurate skin tone representation matching the specified complexion.`

  console.log(`🎨 Task ${task.id}: Enhanced prompt:`, enhancedPrompt)

  // 调用Azure OpenAI API
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 120000) // 2分钟超时

  try {
    const response = await fetch(
      `${AZURE_ENDPOINT}/openai/deployments/gpt-image-1/images/generations?api-version=2025-04-01-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AZURE_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          size,
          quality,
          output_format,
          n,
        }),
        signal: controller.signal,
      }
    )
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error(`❌ Task ${task.id}: Azure API error:`, errorData)
      throw new Error('AI service request failed')
    }

    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Invalid AI response format')
    }

    // 转换为base64图片
    const base64Images = data.data.map((item: any) => {
      if (!item.b64_json) {
        throw new Error('Missing image data')
      }
      return `data:image/png;base64,${item.b64_json}`
    })

    // 立即保存结果
    const result = {
      images: base64Images,
      generatedAt: new Date().toISOString(),
      prompt: task.input_data.prompt,
      uploadingToCloudinary: true
    }

    await supabase
      .from('async_tasks')
      .update({
        status: 'completed',
        result_data: result,
        completed_at: new Date().toISOString()
      })
      .eq('id', task.id)

    console.log(`✅ Task ${task.id}: Base64 images saved`)

    // 异步上传到Cloudinary
    uploadToCloudinaryAsync(task.id, data.data, task.user_id, supabase).catch(error => {
      console.error(`❌ Task ${task.id}: Cloudinary upload failed:`, error)
    })

  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI service request timed out')
    }
    throw error
  }
}

// 异步上传到Cloudinary
async function uploadToCloudinaryAsync(taskId: string, imageData: any[], userId: string, supabase: any) {
  try {
    const generationId = `async_${taskId}_${Date.now()}`
    const cloudinaryImages = []
    
    for (let i = 0; i < imageData.length; i++) {
      const item = imageData[i]
      if (!item.b64_json) continue
      
      const publicId = `${userId}/${generationId}_${i + 1}`
      const uploadResult = await uploadImageToCloudinary(
        item.b64_json,
        'ainails',
        publicId
      )
      
      if (uploadResult.success) {
        cloudinaryImages.push({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes
        })
      }
    }

    // 更新任务结果
    const { data: currentTask } = await supabase
      .from('async_tasks')
      .select('result_data')
      .eq('id', taskId)
      .single()

    if (currentTask?.result_data) {
      const updatedResult = {
        ...currentTask.result_data,
        cloudinaryImages: cloudinaryImages.map(img => img.url),
        cloudinaryData: cloudinaryImages,
        uploadingToCloudinary: false
      }

      await supabase
        .from('async_tasks')
        .update({
          result_data: updatedResult,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
    }
  } catch (error) {
    console.error(`❌ Cloudinary upload failed for task ${taskId}:`, error)
  }
}