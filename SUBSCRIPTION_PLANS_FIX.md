# 订阅计划问题修复

## 🔍 问题分析

### 问题描述
点击购买按钮时报错 "Invalid plan"，原因是数据库中缺少订阅计划数据。

### 根本原因
1. **数据库中没有订阅计划数据**: 虽然schema定义了表结构，但没有实际插入数据
2. **API查询字段错误**: 原来使用 `id` 字段查询，应该使用 `name` 字段
3. **前后端数据不一致**: 前端硬编码的计划名称与数据库中的计划不匹配
4. **features字段问题**: 数据库schema中有features字段，但插入时可能报错

## ✅ 修复方案

### 1. **修复API查询逻辑**
```typescript
// 修复前
const { data: plan, error: planError } = await supabase
  .from('subscription_plans')
  .select('*')
  .eq('id', planId)  // 错误：使用id字段
  .single()

// 修复后
const { data: plan, error: planError } = await supabase
  .from('subscription_plans')
  .select('*')
  .eq('name', planId)  // 正确：使用name字段
  .single()
```

### 2. **数据库初始化脚本**
创建了两个版本的初始化脚本：

#### 完整版本 (`lib/database/init-subscription-plans.sql`)
```sql
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
```

#### 简化版本 (`lib/database/simple-init-plans.sql`)
```sql
-- 不包含features字段，避免字段不存在的问题
INSERT INTO public.subscription_plans (name, display_name, description, price_cents, credits_per_month, is_active) VALUES
('free', 'Free', 'Perfect for trying out our AI tools', 0, 3, true),
('basic', 'Basic', 'Perfect for individuals, 60 Credits per month', 599, 60, true),
('pro', 'Pro', 'Ideal for content creators, 120 Credits per month', 999, 120, true),
('max', 'Max', 'For professional studios, 300 Credits per month', 1999, 300, true);
```

### 3. **调试API**
创建了 `/api/subscriptions/debug` 来检查数据库中的订阅计划数据。

### 4. **前端调试信息**
在定价页面添加了数据库检查功能，控制台会显示：
- 数据库中的订阅计划数据
- 计划数量
- 错误信息

## 📋 解决步骤

### 1. **运行数据库初始化脚本**
```bash
# 如果features字段有问题，使用简化版本
# 在Supabase SQL编辑器中运行
```

**推荐使用简化版本** (`lib/database/simple-init-plans.sql`)：
```sql
-- 清空现有数据
DELETE FROM public.subscription_plans;

-- 插入默认订阅计划（不包含features字段）
INSERT INTO public.subscription_plans (name, display_name, description, price_cents, credits_per_month, is_active) VALUES
('free', 'Free', 'Perfect for trying out our AI tools', 0, 3, true),
('basic', 'Basic', 'Perfect for individuals, 60 Credits per month', 599, 60, true),
('pro', 'Pro', 'Ideal for content creators, 120 Credits per month', 999, 120, true),
('max', 'Max', 'For professional studios, 300 Credits per month', 1999, 300, true);
```

### 2. **检查数据库数据**
访问 `/api/subscriptions/debug` 查看数据库中的订阅计划。

### 3. **测试购买功能**
1. 打开定价页面
2. 检查控制台日志
3. 点击购买按钮测试

### 4. **验证数据一致性**
确保前端硬编码的计划名称与数据库中的 `name` 字段匹配：

```typescript
const planIdMap: { [key: string]: string } = {
  'Basic': 'basic',  // 前端显示名称 -> 数据库name字段
  'Pro': 'pro', 
  'Max': 'max'
}
```

## 🎯 预期结果

### 修复后应该看到：
1. **控制台日志**: 显示数据库中的订阅计划数据
2. **购买按钮**: 点击后不再报 "Invalid plan" 错误
3. **API响应**: 成功创建Stripe Checkout会话
4. **Stripe重定向**: 正常跳转到支付页面

### 数据库中的数据：
- `free` - 免费计划
- `basic` - Basic计划 ($5.99)
- `pro` - Pro计划 ($9.99) 
- `max` - Max计划 ($19.99)

## 🚨 注意事项

### 1. **features字段问题**
- 如果数据库中没有features字段，使用简化版本脚本
- 如果features字段存在但类型不匹配，检查JSONB格式

### 2. **数据管理策略**
- **当前**: 前端硬编码 + 后端数据库
- **建议**: 考虑从后端API动态获取计划数据

### 3. **环境变量**
确保设置了正确的Stripe密钥：
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. **测试环境**
建议先在测试环境中验证：
- 使用Stripe测试密钥
- 使用测试信用卡
- 验证webhook处理

## 🔧 故障排除

### 如果仍然报错：
1. **检查数据库表结构**: 确认subscription_plans表存在
2. **检查字段名称**: 确认name, display_name等字段存在
3. **检查数据类型**: 确认price_cents是INTEGER类型
4. **检查RLS策略**: 确认查询权限正确

现在订阅计划问题应该解决了！ 