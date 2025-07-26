-- 初始化订阅计划数据
-- 这个脚本用于在数据库中插入默认的订阅计划

-- 清空现有数据（可选）
-- DELETE FROM public.subscription_plans;

-- 插入默认订阅计划
INSERT INTO public.subscription_plans (name, display_name, description, price_cents, credits_per_month, features, is_active) VALUES
('free', 'Free', 'Perfect for trying out our AI tools', 0, 3, '["Basic image generation", "Standard quality"]', true),
('basic', 'Basic', 'Perfect for individuals, 60 Credits per month', 599, 60, '["Medium quality image generation", "Priority processing", "Basic history"]', true),
('pro', 'Pro', 'Ideal for content creators, 120 Credits per month', 999, 120, '["All Basic features", "High quality image generation", "Bulk generation", "Advanced settings"]', true),
('max', 'Max', 'For professional studios, 300 Credits per month', 1999, 300, '["All Pro features", "API access", "Priority support", "Custom models"]', true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  credits_per_month = EXCLUDED.credits_per_month,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 验证插入结果
SELECT name, display_name, price_cents, credits_per_month, is_active 
FROM public.subscription_plans 
ORDER BY price_cents; 