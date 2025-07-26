import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

// 指定使用Node.js运行时
export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  // 定义重定向规则
  const redirects = [
    // 精灵名字生成器
    { source: '/elf-name-generator', destination: '/names/elf-name-generator' },
    { source: '/names/fantasy/elf-name-generator', destination: '/names/elf-name-generator' },
    
    // 图像风格转换
    { source: '/ghibli-style-converter', destination: '/images/ghibli-style-converter' },
    { source: '/pixar-style-converter', destination: '/images/pixar-style-converter' },
    { source: '/images/style-transfer/ghibli-style-converter', destination: '/images/ghibli-style-converter' },
    { source: '/images/style-transfer/pixar-style-converter', destination: '/images/pixar-style-converter' },
    
    // 图像生成和编辑
    { source: '/ai-image-generator', destination: '/images/ai-image-generator' },
    { source: '/images/text-to-image/ai-image-generator', destination: '/images/ai-image-generator' },
    { source: '/ai-image-editor', destination: '/images/ai-image-editor' },
    { source: '/images/editing/ai-image-editor', destination: '/images/ai-image-editor' },
    
    // 角色设定生成器
    { source: '/character-headcanon-generator', destination: '/stories/character-headcanon-generator' },
    { source: '/stories/character-headcanon/generator', destination: '/stories/character-headcanon-generator' },
    { source: '/stories/backstory/character-headcanon-generator', destination: '/stories/character-headcanon-generator' },
    
    // 二级页面重定向到一级页面
    { source: '/names/fantasy', destination: '/names' },
    { source: '/images/style-transfer', destination: '/images' },
    { source: '/images/text-to-image', destination: '/images' },
    { source: '/images/editing', destination: '/images' },
    { source: '/stories/backstory', destination: '/stories' },
    { source: '/stories/character-headcanon', destination: '/stories' },
  ];

  // 检查当前URL是否需要重定向
  const url = request.nextUrl.clone();
  const path = url.pathname;
  
  // 查找匹配的重定向规则
  const redirect = redirects.find((r) => r.source === path);
  
  // 如果找到匹配项，进行重定向
  if (redirect) {
    url.pathname = redirect.destination;
    return NextResponse.redirect(url);
  }
  
  // 否则，继续处理认证会话
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 