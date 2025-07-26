-- 更新image_generations表，添加enhanced_prompt字段
ALTER TABLE public.image_generations
ADD COLUMN IF NOT EXISTS enhanced_prompt TEXT;

-- 添加注释说明字段用途
COMMENT ON COLUMN public.image_generations.enhanced_prompt IS '优化后的完整提示词，包含了肤色和专业美甲描述';

-- 更新image_generations表的RLS策略，确保用户只能访问自己的数据
-- 检查策略是否存在，不存在则创建
DO $$
BEGIN
    -- 检查查看策略是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'image_generations' 
        AND policyname = 'Users can view own image generations'
    ) THEN
        -- 创建查看策略
        EXECUTE 'CREATE POLICY "Users can view own image generations" 
                ON public.image_generations
                FOR SELECT 
                USING (auth.uid() = user_id)';
    END IF;
    
    -- 检查插入策略是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'image_generations' 
        AND policyname = 'Users can insert own image generations'
    ) THEN
        -- 创建插入策略
        EXECUTE 'CREATE POLICY "Users can insert own image generations" 
                ON public.image_generations
                FOR INSERT 
                WITH CHECK (auth.uid() = user_id)';
    END IF;
END
$$;

-- 更新或创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_image_generations_created_at_user_id
ON public.image_generations(created_at DESC, user_id); 