# Credits系统修复总结

## 🔍 发现的问题

### 1. **API不一致**
- `generate-image` API使用了错误的字段名和逻辑
- `consume` API调用了不存在的数据库函数 `consume_user_credits`

### 2. **数据库字段不匹配**
- 数据库schema中：`total_credits`, `used_credits`
- API中错误使用了：`available_credits = total_credits - used_credits`

### 3. **缺少错误处理**
- 新用户没有credits记录时的处理
- 积分不足时的详细提示

## ✅ 修复内容

### 1. **generate-image API修复**
```typescript
// 修复前
const { data: userCredits, error: creditsError } = await supabase
  .from('user_credits')
  .select('*')  // 错误：选择了所有字段
  .eq('user_id', currentUser.id)
  .single()

// 修复后
let { data: userCredits, error: creditsError } = await supabase
  .from('user_credits')
  .select('total_credits, used_credits')  // 正确：只选择需要的字段
  .eq('user_id', currentUser.id)
  .single()

// 添加新用户处理
if (creditsError.code === 'PGRST116') {
  // 创建默认credits记录
  const { data: newCredits, error: createError } = await supabase
    .from('user_credits')
    .upsert({
      user_id: currentUser.id,
      total_credits: 10, // 给新用户10个免费积分
      used_credits: 0,
      last_reset_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select('total_credits, used_credits')
    .single()
}
```

### 2. **consume API修复**
```typescript
// 修复前：调用不存在的函数
const { data, error } = await supabase.rpc('consume_user_credits', {
  user_id_param: user.id,
  credits_to_consume_param: credits_to_consume
})

// 修复后：直接数据库操作
let { data: userCredits, error: fetchError } = await supabase
  .from('user_credits')
  .select('total_credits, used_credits')
  .eq('user_id', user.id)
  .single()

// 检查积分是否足够
const availableCredits = userCredits.total_credits - userCredits.used_credits
if (availableCredits < credits_to_consume) {
  return NextResponse.json({ 
    error: 'Insufficient credits',
    available_credits: availableCredits 
  }, { status: 400 })
}

// 更新积分
const { data: updatedCredits, error: updateError } = await supabase
  .from('user_credits')
  .update({
    used_credits: userCredits.used_credits + credits_to_consume
  })
  .eq('user_id', user.id)
  .select('total_credits, used_credits')
  .single()
```

### 3. **积分消耗规则统一**
```typescript
// 统一的积分消耗规则
const CREDIT_COSTS = {
  'low': 1,
  'medium': 4,
  'high': 15
}
```

### 4. **新用户处理**
- 自动为新用户创建credits记录
- 给新用户10个免费积分
- 处理用户记录不存在的情况

### 5. **交易记录**
- 记录到 `credit_transactions` 表
- 记录到 `image_generations` 表
- 包含详细的生成信息

## 📊 数据库结构

### user_credits 表
```sql
CREATE TABLE public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    total_credits INTEGER DEFAULT 0,
    used_credits INTEGER DEFAULT 0,
    subscription_credits INTEGER DEFAULT 0,
    purchased_credits INTEGER DEFAULT 0,
    last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### credit_transactions 表
```sql
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'purchased', 'subscription_reset', 'bonus')),
    amount INTEGER NOT NULL,
    description TEXT,
    generation_id UUID,
    package_id UUID,
    subscription_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### image_generations 表
```sql
CREATE TABLE public.image_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    generation_type TEXT NOT NULL CHECK (generation_type IN ('text-to-image', 'image-edit', 'pixar-style-convert', 'ghibli-style-convert')),
    prompt TEXT NOT NULL,
    result_url TEXT,
    result_text TEXT,
    credits_used INTEGER NOT NULL DEFAULT 1,
    model TEXT,
    quality TEXT,
    size TEXT,
    settings JSONB,
    local_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 功能特性

### 1. **积分计算**
- `available_credits = total_credits - used_credits`
- 支持不同质量的积分消耗
- 实时积分检查和更新

### 2. **错误处理**
- 用户未登录提示
- 积分不足详细提示
- 新用户自动创建记录

### 3. **交易记录**
- 完整的积分交易历史
- 图片生成记录
- 支持审计和统计

### 4. **API一致性**
- 所有API使用相同的字段名
- 统一的错误响应格式
- 一致的积分计算逻辑

## 📈 预期效果

1. **用户体验改善**
   - 清晰的积分提示
   - 新用户自动获得免费积分
   - 详细的错误信息

2. **系统稳定性**
   - 修复了API调用错误
   - 统一了数据库操作
   - 完善了错误处理

3. **数据完整性**
   - 完整的交易记录
   - 准确的积分计算
   - 支持数据审计

现在credits系统应该可以正常工作了！ 