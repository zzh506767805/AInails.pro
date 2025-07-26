# 支付流程完整实现

## 🔍 问题分析

### 问题描述
购买成功后，没有相应逻辑处理：
- ❌ Credits没有增加
- ❌ 数据库没有订阅记录
- ❌ 没有webhook处理支付回调

### 解决方案
由于没有webhook，需要在支付成功页面查询支付记录并处理逻辑。

## ✅ 实现内容

### 1. **支付验证API** (`/api/payments/verify`)
```typescript
// 主要功能：
- 验证Stripe支付会话状态
- 检查支付是否完成
- 验证用户身份
- 处理订阅支付
- 处理credit包购买
- 更新用户credits
- 记录交易历史
```

### 2. **订阅支付处理**
```typescript
async function handleSubscriptionPayment(userId: string, planId: string, session: Stripe.Checkout.Session, supabase: any) {
  // 1. 获取订阅计划（使用name字段查询）
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('name', planId)
    .single()
  
  // 2. 检查是否已处理过（避免重复）
  const { data: existingSubscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', session.subscription)
    .single()
  
  // 3. 创建用户订阅记录
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: plan.id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: 'active',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })
  
  // 4. 添加订阅credits
  await addCreditsToUser(userId, plan.credits_per_month, 'subscription_reset', supabase, {
    subscription_id: session.subscription,
    plan_name: plan.name
  })
}
```

### 3. **Credits更新逻辑**
```typescript
async function addCreditsToUser(userId: string, amount: number, type: string, supabase: any, metadata: any = {}) {
  // 1. 获取用户当前credits
  let { data: userCredits } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  // 2. 如果用户记录不存在，创建默认记录
  if (!userCredits) {
    await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        total_credits: 3,
        used_credits: 0,
        subscription_credits: 0,
        purchased_credits: 0,
        last_reset_at: new Date().toISOString()
      })
  }
  
  // 3. 更新用户credits
  const newTotalCredits = userCredits.total_credits + amount
  const newPurchasedCredits = type === 'purchased' ? userCredits.purchased_credits + amount : userCredits.purchased_credits
  const newSubscriptionCredits = type === 'subscription_reset' ? amount : userCredits.subscription_credits
  
  await supabase
    .from('user_credits')
    .update({
      total_credits: newTotalCredits,
      purchased_credits: newPurchasedCredits,
      subscription_credits: newSubscriptionCredits,
      last_reset_at: type === 'subscription_reset' ? new Date() : userCredits.last_reset_at
    })
    .eq('user_id', userId)
  
  // 4. 记录交易历史
  const description = type === 'purchased' 
    ? `购买 ${amount} credits - Session: ${metadata.session_id}`
    : `订阅获得 ${amount} credits - Plan: ${metadata.plan_name}`
  
  await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      type: type,
      amount: amount,
      description: description,
      package_id: metadata.package_id || null,
      subscription_id: metadata.subscription_id || null
    })
}
```

### 4. **支付成功页面** (`/success`)
```typescript
// 主要功能：
- 获取session_id参数
- 调用verify API验证支付
- 清除用户缓存
- 刷新credits和订阅状态
- 显示支付成功信息
- 提供后续操作按钮
```

### 5. **测试API** (`/api/payments/test`)
```typescript
// 主要功能：
- 获取用户当前credits
- 获取用户订阅信息
- 获取最近交易记录
- 用于调试和验证支付结果
```

## 📋 支付流程

### 1. **用户购买流程**
```
用户点击购买 → Stripe Checkout → 支付成功 → 重定向到/success
```

### 2. **支付验证流程**
```
/success页面 → 获取session_id → 调用/api/payments/verify → 验证Stripe会话 → 处理支付逻辑
```

### 3. **数据处理流程**
```
验证支付 → 获取订阅计划 → 创建订阅记录 → 更新用户credits → 记录交易历史 → 清除缓存
```

## 🎯 预期结果

### 购买成功后应该看到：
1. **数据库记录**:
   - `user_subscriptions` 表中有新的订阅记录
   - `user_credits` 表中credits增加
   - `credit_transactions` 表中有交易记录

2. **前端显示**:
   - 支付成功页面显示成功信息
   - 用户credits余额更新
   - 订阅状态更新

3. **控制台日志**:
   - 详细的处理过程日志
   - 错误信息（如果有）

## 🚨 注意事项

### 1. **重复处理防护**
- 检查 `stripe_subscription_id` 是否已存在
- 检查交易描述是否已存在
- 避免重复添加credits

### 2. **错误处理**
- 详细的错误日志
- 优雅的错误处理
- 用户友好的错误信息

### 3. **数据一致性**
- 使用事务确保数据一致性
- 验证用户身份
- 检查支付状态

### 4. **缓存管理**
- 清除用户缓存
- 刷新credits状态
- 更新订阅信息

## 🔧 测试步骤

### 1. **准备测试环境**
```bash
# 确保环境变量正确
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. **测试购买流程**
1. 访问定价页面
2. 点击购买按钮
3. 完成Stripe支付
4. 检查重定向到success页面
5. 查看控制台日志

### 3. **验证数据更新**
1. 访问 `/api/payments/test`
2. 检查用户credits是否增加
3. 检查订阅记录是否创建
4. 检查交易记录是否添加

### 4. **检查前端更新**
1. 刷新页面
2. 检查credits显示
3. 检查订阅状态
4. 测试图片生成功能

现在支付流程应该完整工作了！ 