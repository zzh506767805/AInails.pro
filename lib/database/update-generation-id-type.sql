-- 更新credit_transactions表的generation_id字段类型
-- 从UUID改为TEXT类型，以支持自定义格式的generation IDs

-- 首先备份数据
CREATE TEMP TABLE credit_transactions_backup AS
SELECT * FROM public.credit_transactions;

-- 删除现有约束
ALTER TABLE public.credit_transactions
DROP CONSTRAINT IF EXISTS credit_transactions_generation_id_fkey;

-- 更改字段类型
ALTER TABLE public.credit_transactions
ALTER COLUMN generation_id TYPE TEXT USING generation_id::text;

-- 添加注释
COMMENT ON COLUMN public.credit_transactions.generation_id IS '图片生成ID，非标准UUID格式，例如 gen_timestamp_randomstring';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_credit_transactions_generation_id ON public.credit_transactions(generation_id);
