import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { uploadImageToCloudinary } from '@/lib/cloudinary'

// 异步上传到Cloudinary的函数
async function uploadToCloudinaryAsync(taskId: string, imageData: any[], userId: string, adminSupabase: any) {
  try {
    const generationId = `async_${taskId}_${Date.now()}`
    const cloudinaryImages = []
    
    for (let i = 0; i < imageData.length; i++) {
      const item = imageData[i]
      if (!item.b64_json) {
        throw new Error('Missing image data')
      }
      
      console.log(`📤 Task ${taskId}: Uploading image ${i + 1}/${imageData.length} to Cloudinary...`)
      
      // Upload to Cloudinary with a meaningful public ID
      const publicId = `${userId}/${generationId}_${i + 1}`
      const uploadResult = await uploadImageToCloudinary(
        item.b64_json,
        'ainails', // folder
        publicId
      )
      
      if (!uploadResult.success) {
        console.error(`❌ Task ${taskId}: Cloudinary upload failed:`, uploadResult.error)
        throw new Error('Failed to upload image to Cloudinary')
      }
      
      cloudinaryImages.push({
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes
      })
      
      console.log(`✅ Task ${taskId}: Image ${i + 1} uploaded successfully`)
    }

    // 更新任务结果，包含Cloudinary URLs
    const { data: currentTask } = await adminSupabase
      .from('async_tasks')
      .select('result_data')
      .eq('id', taskId)
      .single()

    if (currentTask?.result_data) {
      const updatedResult = {
        ...currentTask.result_data,
        cloudinaryImages: cloudinaryImages.map(img => img.url),
        cloudinaryData: cloudinaryImages,
        uploadingToCloudinary: false // 标记上传完成
      }

      await adminSupabase
        .from('async_tasks')
        .update({
          result_data: updatedResult,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      console.log(`🖼️ Task ${taskId}: All ${cloudinaryImages.length} images uploaded to Cloudinary and database updated`)
    }
  } catch (error) {
    console.error(`❌ Task ${taskId}: Cloudinary async upload failed:`, error)
    
    // 即使Cloudinary上传失败，也不影响任务的base64结果
    // 可以选择重试或记录错误
  }
}

// 使用service role key创建管理员客户端
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT 
const AZURE_API_KEY = process.env.AZURE_API_KEY

// 美甲提示词优化
const NAIL_ART_PREFIX = "Professional close-up photography of a manicure on a hand with"
const NAIL_ART_SUFFIX = ". High-resolution, beauty salon quality, professionally lit, detailed nail structure, accurate skin tone representation, on a clean neutral background, focused on nails and hand"

// 肤色对应的精确描述，避免生成偏暗效果
const SKIN_TONE_DESCRIPTIONS = {
  'fair': 'very fair, pale, porcelain skin tone with pink undertones, light complexion',
  'light': 'light, peachy-beige skin tone with warm undertones, bright complexion',
  'medium': 'medium, golden-beige skin tone with neutral undertones, natural complexion',
  'olive': 'olive, warm golden-brown skin tone with yellow-green undertones, Mediterranean complexion',
  'brown': 'rich brown, caramel skin tone with warm golden undertones, warm complexion',
  'dark': 'deep, rich brown skin tone with warm undertones, deep complexion'
}

/**
 * 处理异步任务的 worker API
 * 这个endpoint会被周期性调用来处理待处理的任务
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    console.log('🔍 Task processor started, checking for pending tasks...')

    // 首先检查所有任务
    const { data: allTasks, error: allTasksError } = await supabase
      .from('async_tasks')
      .select('id, status, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('📊 All recent tasks:', allTasks)
    if (allTasksError) {
      console.error('❌ Error fetching all tasks:', allTasksError)
    }

    // 获取下一个待处理的任务（按优先级和创建时间排序）
    const { data: tasks, error: fetchError } = await supabase
      .from('async_tasks')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)

    console.log('🎯 Pending tasks query result:', { tasks, error: fetchError })

    if (fetchError) {
      console.error('❌ Failed to fetch pending tasks:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    if (!tasks || tasks.length === 0) {
      console.log('📭 No pending tasks found')
      return NextResponse.json({ message: 'No pending tasks' })
    }

    const task = tasks[0]
    const taskId = task.id

    console.log(`🚀 Processing task ${taskId}:`, {
      type: task.task_type,
      status: task.status,
      input: task.input_data
    })

    // 更新任务状态为处理中
    console.log(`📝 Updating task ${taskId} status to processing...`)
    const { error: updateError } = await supabase
      .from('async_tasks')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('id', taskId)

    if (updateError) {
      console.error('❌ Failed to update task status:', updateError)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    console.log(`✅ Task ${taskId} status updated to processing`)

    try {
      // 处理图片生成任务
      if (task.task_type === 'image_generation') {
        console.log(`🎨 Starting image generation for task ${taskId}`)
        await processImageGenerationSimplified(supabase, task)
      }
      
      console.log(`🎉 Task ${taskId} completed successfully`)
      return NextResponse.json({ 
        success: true, 
        taskId,
        message: 'Task processed successfully' 
      })

    } catch (processingError) {
      console.error(`❌ Task ${taskId} processing failed:`, processingError)
      
      // 更新任务状态为失败
      await supabase
        .from('async_tasks')
        .update({ 
          status: 'failed',
          error_message: processingError instanceof Error ? processingError.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)

      return NextResponse.json({ 
        error: 'Task processing failed',
        taskId,
        details: processingError instanceof Error ? processingError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Task processor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processImageGenerationSimplified(supabase: any, task: any) {
  const taskId = task.id
  const inputData = task.input_data
  const { prompt, size, quality, n, output_format, skinTone } = inputData

  console.log(`🎯 Task ${taskId}: Starting AI generation for prompt: "${prompt}"`)

  // 构建增强提示词，突出肤色描述
  const skinToneDescription = SKIN_TONE_DESCRIPTIONS[skinTone as keyof typeof SKIN_TONE_DESCRIPTIONS] || SKIN_TONE_DESCRIPTIONS.medium
  const enhancedPrompt = `${NAIL_ART_PREFIX} ${skinToneDescription}, showcasing: ${prompt}. ${NAIL_ART_SUFFIX}. Ensure accurate skin tone representation matching the specified complexion.`

  console.log(`🎨 Task ${taskId}: Enhanced prompt:`, enhancedPrompt)

  // 调用 Azure OpenAI API
  console.log(`📡 Task ${taskId}: Calling Azure OpenAI API...`)
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
      console.error(`❌ Task ${taskId}: Azure API error:`, errorData)
      throw new Error('AI service request failed')
    }

    console.log(`✅ Task ${taskId}: Azure API response received`)
    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Invalid AI response format')
    }

    // 首先立即保存base64图片到数据库
    const base64Images = data.data.map((item: any, index: number) => {
      if (!item.b64_json) {
        throw new Error('Missing image data')
      }
      return `data:image/png;base64,${item.b64_json}`
    })

    // 立即更新任务状态为completed，包含base64图片
    const intermediateResult = {
      images: base64Images,
      generatedAt: new Date().toISOString(),
      prompt: task.input_data.prompt,
      uploadingToCloudinary: true // 标记正在上传到Cloudinary
    }

    console.log(`🎯 Task ${taskId}: Saving intermediate results with base64 images...`)
    
    await supabase
    .from('async_tasks')
    .update({
      status: 'completed',
      result_data: intermediateResult,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)

    console.log(`✅ Task ${taskId}: Base64 images saved, starting Cloudinary upload...`)

    // 异步上传到Cloudinary（不阻塞任务完成）
    uploadToCloudinaryAsync(taskId, data.data, task.user_id, supabase).catch(error => {
      console.error(`❌ Task ${taskId}: Cloudinary async upload failed:`, error)
    })

    console.log(`🎉 Task ${taskId}: Completed successfully with base64 images`)
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`❌ Task ${taskId}: Azure API timeout after 2 minutes`)
      throw new Error('AI service request timed out')
    }
    throw error
  }
}

// GET方法用于检查worker状态
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Task processor is running' 
  })
}