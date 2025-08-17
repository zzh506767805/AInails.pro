-- 异步任务系统表
-- 用于管理图片生成的异步任务

-- 任务状态枚举
-- pending: 任务已提交，等待处理
-- processing: 任务正在处理中
-- completed: 任务完成
-- failed: 任务失败
-- cancelled: 任务被取消

-- 任务表
CREATE TABLE IF NOT EXISTS public.async_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('image_generation', 'image_edit')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- 任务输入参数
    input_data JSONB NOT NULL,
    
    -- 任务结果
    result_data JSONB,
    
    -- 错误信息
    error_message TEXT,
    
    -- 积分消耗
    credits_required INTEGER NOT NULL DEFAULT 1,
    credits_consumed BOOLEAN DEFAULT false,
    
    -- 任务优先级 (1=highest, 5=lowest)
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    
    -- 处理时间跟踪
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- 创建和更新时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 任务进度表（用于实时进度更新）
CREATE TABLE IF NOT EXISTS public.task_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.async_tasks(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    stage TEXT, -- 'validating', 'generating', 'processing', 'finalizing'
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_async_tasks_user_id ON public.async_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_async_tasks_status ON public.async_tasks(status);
CREATE INDEX IF NOT EXISTS idx_async_tasks_task_type ON public.async_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_async_tasks_created_at ON public.async_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_async_tasks_priority_status ON public.async_tasks(priority, status);
CREATE INDEX IF NOT EXISTS idx_task_progress_task_id ON public.task_progress(task_id);

-- RLS 策略
ALTER TABLE public.async_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_progress ENABLE ROW LEVEL SECURITY;

-- 任务策略
CREATE POLICY "Users can view own tasks" ON public.async_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.async_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.async_tasks
    FOR UPDATE USING (auth.uid() = user_id);

-- 进度策略
CREATE POLICY "Users can view own task progress" ON public.task_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.async_tasks 
            WHERE id = task_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert task progress" ON public.task_progress
    FOR INSERT WITH CHECK (true); -- 允许系统插入

-- 更新时间戳触发器
CREATE TRIGGER set_async_tasks_updated_at
    BEFORE UPDATE ON public.async_tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();