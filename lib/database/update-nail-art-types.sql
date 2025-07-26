-- 更新image_generations表的generation_type约束，只保留美甲设计相关的类型
-- 首先删除现有的约束（如果存在）
ALTER TABLE image_generations DROP CONSTRAINT IF EXISTS check_generation_type;

-- 添加新的约束，只包含美甲设计相关的类型
ALTER TABLE image_generations 
ADD CONSTRAINT check_generation_type 
CHECK (generation_type IN ('text-to-image', 'nail-art-design', 'nail-art-variation'));

-- 添加索引，以优化按类型查询
CREATE INDEX IF NOT EXISTS idx_image_generations_type 
  ON public.image_generations(generation_type);

-- 更新表注释
COMMENT ON COLUMN image_generations.generation_type IS 
'Generation type: text-to-image (general), nail-art-design (nail art), or nail-art-variation (variations)';

-- 添加美甲设计相关的元数据字段（如果需要）
ALTER TABLE image_generations 
ADD COLUMN IF NOT EXISTS nail_art_style VARCHAR(50),
ADD COLUMN IF NOT EXISTS nail_shape VARCHAR(50),
ADD COLUMN IF NOT EXISTS color_scheme VARCHAR(100);

-- 添加注释
COMMENT ON COLUMN image_generations.nail_art_style IS 'Nail art style: French, gradient, floral, geometric, etc.';
COMMENT ON COLUMN image_generations.nail_shape IS 'Nail shape: round, square, stiletto, coffin, etc.';
COMMENT ON COLUMN image_generations.color_scheme IS 'Color scheme used in the nail design'; 