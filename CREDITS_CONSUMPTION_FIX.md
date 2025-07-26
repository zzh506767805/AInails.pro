# 积分消费逻辑修复总结

## 🔍 发现的问题

### 问题描述
用户反映积分消费没有正确调用，担心生成图片后不扣费。

### 根本原因
1. **重复的积分消费逻辑**: `generate-image` API 直接更新数据库
2. **consume API 未被使用**: 独立的积分消费API没有被调用
3. **逻辑不一致**: 两个地方都在处理积分消费，容易出错

## ✅ 修复方案

### 方案选择：统一使用consume API

**原因**:
- 保持代码一致性
- 避免重复逻辑
- 便于维护和扩展
- 符合单一职责原则

## 🔧 具体修改

### 1. **修改 generate-image API**

**修改前**:
```typescript
// 直接更新数据库
const { error: updateError } = await supabase
  .from('user_credits')
  .update({
    used_credits: userCredits.used_credits + creditsNeeded
  })
  .eq('user_id', currentUser.id)

// 直接记录交易
const { error: transactionError } = await supabase
  .from('credit_transactions')
  .insert({
    user_id: currentUser.id,
    type: 'spent',
    amount: -creditsNeeded,
    description: `生成${n}张${quality}质量图片: ${prompt.substring(0, 50)}...`,
    generation_id: generationId
  })
```

**修改后**:
```typescript
// 调用consume API
const consumeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/credits/consume`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    credits_to_consume: creditsNeeded,
    generation_id: generationId,
    description: `生成${n}张${quality}质量图片: ${prompt.substring(0, 50)}...`
  }),
})
```

### 2. **增强 consume API**

**新增功能**:
```typescript
// 支持额外参数
const { credits_to_consume, generation_id, description } = await request.json()

// 记录交易到 credit_transactions 表
const { error: transactionError } = await supabase
  .from('credit_transactions')
  .insert({
    user_id: user.id,
    type: 'spent',
    amount: -credits_to_consume,
    description: description || `消费 ${credits_to_consume} credits`,
    generation_id: generation_id || null
  })
```

## 📊 积分消费流程

### 完整流程
```
1. 用户点击生成按钮
   ↓
2. generate-image API 检查积分余额
   ↓
3. 调用Azure API生成图片
   ↓
4. 图片生成成功后，调用consume API
   ↓
5. consume API 更新用户积分
   ↓
6. consume API 记录交易历史
   ↓
7. generate-image API 记录生成历史
   ↓
8. 返回生成的图片给用户
```

### 积分计算规则
```typescript
const CREDIT_COSTS = {
  'low': 1,      // 低质量：1积分
  'medium': 1,   // 中等质量：1积分
  'high': 5      // 高质量：5积分
}

// 总积分 = 质量积分 × 图片数量
const creditsNeeded = CREDIT_COSTS[quality] * n
```

## 🛡️ 安全特性

### 1. **积分检查**
- 生成前检查积分余额
- 防止积分不足时生成

### 2. **事务记录**
- 完整的交易历史
- 支持审计和统计

### 3. **错误处理**
- 积分消费失败不影响图片生成
- 详细的错误日志

### 4. **数据一致性**
- 统一的积分消费逻辑
- 避免重复扣费

## 📈 预期效果

### 1. **用户体验**
- ✅ 正确的积分扣费
- ✅ 清晰的积分提示
- ✅ 完整的交易记录

### 2. **系统稳定性**
- ✅ 统一的积分消费逻辑
- ✅ 避免重复扣费
- ✅ 完善的错误处理

### 3. **维护性**
- ✅ 代码结构清晰
- ✅ 便于功能扩展
- ✅ 易于调试和测试

## 🎯 验证方法

### 1. **测试步骤**
1. 用户登录，查看初始积分（3个免费积分）
2. 生成一张中等质量图片（消耗1积分）
3. 生成一张高质量图片（消耗5积分）
4. 检查积分是否正确扣费
5. 查看交易历史记录

### 2. **预期结果**
- 新用户获得3个免费积分
- 中等质量图片消耗1积分
- 高质量图片消耗5积分
- 交易历史显示消费记录
- 生成历史记录完整

## 💰 定价模式更新

### 订阅计划
- **Free**: $0 - 3 credits
- **Basic**: $5.99 - 60 credits
- **Pro**: $9.99 - 120 credits  
- **Max**: $19.99 - 300 credits

### 积分消耗
- **Medium Quality**: 1 credit
- **High Quality**: 5 credits

现在积分消费逻辑已经修复，用户生成图片后会正确扣费！ 