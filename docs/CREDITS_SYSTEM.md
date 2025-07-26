# AInails 积分系统文档

## 🏗️ 系统架构

### 数据库结构

#### user_credits 表
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

#### credit_transactions 表
```sql
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'purchased', 'subscription_reset', 'bonus')),
    amount INTEGER NOT NULL,
    description TEXT,
    generation_id TEXT, -- 从UUID改为TEXT类型
    package_id UUID,
    subscription_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### image_generations 表
```sql
CREATE TABLE public.image_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    generation_type TEXT NOT NULL CHECK (generation_type IN ('text-to-image', 'image-edit')),
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

### API 结构

#### 1. `/api/credits/balance` - 获取积分余额
- **方法**: GET
- **返回**: 总积分、已用积分、可用积分

#### 2. `/api/credits/consume` - 消费积分
- **方法**: POST
- **参数**: 消费积分数量、生成ID、描述
- **操作**: 更新积分并记录交易

#### 3. `/api/generate-image` - 图片生成并消费积分
- **方法**: POST
- **参数**: 提示文本、图片尺寸、质量、数量
- **操作**: 生成图片并调用消费API

## 💰 积分消费模型

### 积分消耗规则
```typescript
const CREDIT_COSTS = {
  'medium': 1,   // 中等质量：1积分
  'high': 5      // 高质量：5积分
}
```

### 定价模式
- **Free**: $0 - 10 credits (新用户)
- **Basic**: $5.99 - 60 credits
- **Pro**: $9.99 - 120 credits  
- **Max**: $19.99 - 300 credits

## 🔄 完整消费流程

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

## 🛠️ 问题修复记录

### 1. 统一积分消费逻辑
- **问题**: 多处重复的积分消费逻辑
- **修复**: 统一使用consume API进行积分消费

### 2. API参数标准化
- **问题**: 积分相关API使用不一致的参数名称
- **修复**: 统一字段命名和参数处理

### 3. 新用户处理
- **问题**: 新用户无积分记录导致错误
- **修复**: 自动创建积分记录并赠送10积分

### 4. generation_id 类型修改
- **问题**: UUID格式限制与实际使用不符
- **修复**: 将字段类型从UUID修改为TEXT

### 5. 错误处理增强
- **问题**: 积分不足时提示不明确
- **修复**: 添加详细错误消息和状态码

## 🔐 安全性考虑

### 1. 数据验证
- 所有API输入严格验证
- 积分消费前检查余额
- 参数范围限制

### 2. 用户认证
- 所有积分操作需用户登录
- 验证用户身份和权限
- Cookie传递确保认证状态

### 3. 交易记录
- 完整的积分消费记录
- 详细的生成历史
- 用于审计和争议解决

## 🚀 最佳实践

### 1. 积分消费原则
- 先验证后消费
- 单一职责API
- 详细记录交易

### 2. 错误处理
- 友好的错误提示
- 详细的日志记录
- 异常情况处理

### 3. 性能优化
- 精简API请求
- 合理的缓存策略
- 避免重复查询 