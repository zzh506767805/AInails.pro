-- 简化的订阅计划初始化脚本
-- 只包含必要的字段，避免features字段问题

-- 清空现有数据
DELETE FROM public.subscription_plans;

-- 插入默认订阅计划（不包含features字段）
INSERT INTO public.subscription_plans (name, display_name, description, price_cents, credits_per_month, is_active) VALUES
('free', 'Free', 'Perfect for trying out our AI tools', 0, 3, true),
('basic', 'Basic', 'Perfect for individuals, 60 Credits per month', 599, 60, true),
('pro', 'Pro', 'Ideal for content creators, 120 Credits per month', 999, 120, true),
('max', 'Max', 'For professional studios, 300 Credits per month', 1999, 300, true);

-- 验证插入结果
SELECT name, display_name, price_cents, credits_per_month, is_active 
FROM public.subscription_plans 
ORDER BY price_cents; 