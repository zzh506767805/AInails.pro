# 🚀 AInails 项目配置指南

## 📋 配置清单

### ✅ 已完成
- [x] 项目基础结构
- [x] 数据库Schema设计
- [x] 认证中间件
- [x] UI组件库

### 🔄 需要配置

## 1. Supabase 配置

### 步骤1：创建Supabase项目
1. 访问 [supabase.com](https://supabase.com)
2. 注册/登录账户
3. 点击"New Project"
4. 填写项目信息：
   - Name: `AInails`
   - Database Password: 设置一个强密码
   - Region: 选择离你最近的区域

### 步骤2：获取API密钥
1. 在项目控制台中，进入Settings > API
2. 复制以下信息：
   - Project URL
   - anon public key
   - service_role secret key

### 步骤3：配置数据库 (重要！)
1. 进入SQL Editor
2. **删除所有现有的表**（如果有的话）
3. 复制 `lib/database/unified-schema.sql` 的内容
4. 粘贴并执行所有SQL语句
5. 这将创建所有必要的表、索引、策略和默认数据

### 步骤4：配置认证
1. 进入Authentication > Settings
2. 在"Site URL"中填入：`http://localhost:3000`
3. 在"Redirect URLs"中添加：`http://localhost:3000/auth/callback`

### 步骤5：配置Google OAuth
1. 在Supabase控制台中，进入Authentication > Providers
2. 启用Google
3. 填入Client ID和Client Secret（见下面的Google配置步骤）

## 2. Google OAuth 配置

### 步骤1：创建Google Cloud项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用Google+ API

### 步骤2：创建OAuth凭据
1. 进入"API和服务" > "凭据"
2. 点击"创建凭据" > "OAuth 2.0客户端ID"
3. 应用类型：Web应用
4. 名称：`AInails OAuth`
5. 授权重定向URI：
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (生产环境)

### 步骤3：配置Supabase Google OAuth
1. 在Supabase控制台中，进入Authentication > Providers
2. 启用Google
3. 填入Client ID和Client Secret

## 3. Stripe 配置

### 步骤1：创建Stripe账户
1. 访问 [stripe.com](https://stripe.com)
2. 注册账户并完成验证

### 步骤2：获取API密钥
1. 进入Developers > API keys
2. 复制：
   - Publishable key
   - Secret key

### 步骤3：配置Webhook
1. 进入Developers > Webhooks
2. 添加端点：`https://your-domain.com/api/webhooks/stripe`
3. 选择事件：
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## 4. OpenAI 配置

### 步骤1：获取API密钥
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账户
3. 进入API Keys
4. 创建新的API密钥

## 5. 环境变量配置

更新 `.env.local` 文件：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI配置
OPENAI_API_KEY=sk-your_openai_api_key_here

# Stripe配置
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Google OAuth配置
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# 网站配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=AInails - AI Image Generator

# Google Analytics (可选)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 6. 数据库Schema说明

### 主要表结构：
- **user_profiles**: 用户档案信息
- **user_preferences**: 用户偏好设置
- **user_credits**: 用户积分管理
- **credit_transactions**: 积分交易历史
- **subscription_plans**: 订阅计划
- **user_subscriptions**: 用户订阅
- **credit_packages**: 积分包
- **image_generations**: 图片生成记录

### 重要特性：
- ✅ 统一的表名（使用 `image_generations` 而不是 `generations`）
- ✅ 完整的RLS安全策略
- ✅ 自动触发器（新用户创建、时间戳更新）
- ✅ 默认数据（订阅计划、积分包）
- ✅ 存储桶配置

## 7. 测试配置

### 步骤1：启动开发服务器
```bash
npm run dev
```

### 步骤2：测试功能
1. 访问 `http://localhost:3000`
2. 测试Google登录
3. 测试图片生成
4. 测试支付流程

## 🔧 常见问题

### Q: 登录后跳转失败
A: 检查Supabase中的重定向URL配置

### Q: 图片生成失败
A: 检查OpenAI API密钥和额度

### Q: 支付失败
A: 检查Stripe密钥和Webhook配置

### Q: 数据库连接失败
A: 检查Supabase URL和密钥

### Q: 表名不一致错误
A: 确保使用 `lib/database/unified-schema.sql` 而不是旧的schema文件

## 📞 技术支持

如果遇到问题，请检查：
1. 环境变量是否正确配置
2. 网络连接是否正常
3. API密钥是否有效
4. 数据库是否已正确初始化
5. 是否使用了统一的schema文件

## 🚀 部署准备

配置完成后，你可以：
1. 部署到Vercel
2. 配置生产环境变量
3. 更新域名和SSL证书
4. 设置监控和分析

## 📝 数据库迁移说明

如果你之前已经创建了数据库，需要迁移到新的schema：

1. **备份现有数据**（如果有的话）
2. **删除所有现有表**：
   ```sql
   DROP TABLE IF EXISTS generations CASCADE;
   DROP TABLE IF EXISTS user_credits CASCADE;
   DROP TABLE IF EXISTS credit_transactions CASCADE;
   DROP TABLE IF EXISTS subscription_plans CASCADE;
   DROP TABLE IF EXISTS user_subscriptions CASCADE;
   DROP TABLE IF EXISTS credit_packages CASCADE;
   ```
3. **运行新的schema**：执行 `lib/database/unified-schema.sql`
4. **恢复数据**（如果需要的话） 