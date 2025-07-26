import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/generations - 获取用户的图像生成历史
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to view your generations' },
        { status: 401 }
      )
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // 最大100
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') // 'text-to-image' | 'image-edit' | 'pixar-style-convert' | null

    // 构建查询
    let query = supabase
      .from('image_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 按类型过滤
    if (type) {
      query = query.eq('generation_type', type)
    }

    const { data: generations, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch generations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: generations,
      pagination: {
        limit,
        offset,
        hasMore: generations.length === limit
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// POST /api/generations - 保存新的图像生成记录（只保存元数据）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to save generations' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { localId, prompt, originalFilename, settings, generationType } = body

    // 验证必需字段
    if (!prompt || !generationType) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 保存到数据库（只保存基本元数据）
    const { data: generation, error } = await supabase
      .from('image_generations')
      .insert({
        user_id: user.id,
        prompt,
        image_url: localId ? `local:${localId}` : null, // 使用特殊前缀标识本地存储
        original_filename: originalFilename,
        settings: settings || {},
        generation_type: generationType
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to save generation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: generation
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// DELETE /api/generations - 删除图像生成记录
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to delete generations' },
        { status: 401 }
      )
    }

    // 从URL参数获取ID
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing generation ID' },
        { status: 400 }
      )
    }

    // 删除数据库记录（确保只能删除自己的记录）
    const { error } = await supabase
      .from('image_generations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to delete generation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Generation deleted successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 