# AI Image Generator Template

一个完整的AI图片生成网站模板，包含Stripe支付、Credit系统、Google登录等核心功能。

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境变量配置
复制 `.env.example` 到 `.env.local` 并填写以下配置：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key

# Stripe配置
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 启动开发服务器
```bash
npm run dev
```

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── auth/          # 认证相关
│   │   ├── credits/       # Credit系统
│   │   ├── generate-image/ # AI图片生成
│   │   ├── subscriptions/ # 订阅管理
│   │   └── webhooks/      # Stripe webhook
│   ├── dashboard/         # 用户控制台
│   ├── pricing/           # 定价页面
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   └── ...               # 功能组件
├── lib/                  # 工具库
│   ├── database/         # 数据库操作
│   ├── hooks/           # React Hooks
│   ├── supabase/        # Supabase配置
│   └── utils/           # 工具函数
└── public/              # 静态资源
```

## 🔧 核心功能

### 1. AI图片生成
- 文本到图片生成
- 多种图片质量选项
- 实时生成预览

### 2. 用户认证
- Google OAuth登录
- 用户会话管理
- 权限控制

### 3. Credit系统
- 积分购买和管理
- 使用量跟踪
- 余额检查

### 4. 支付系统
- Stripe集成
- 订阅计划
- 一次性购买
- Webhook处理

### 5. 用户界面
- 响应式设计
- 现代化UI
- 用户友好的交互

## 🛠️ 自定义配置

### 修改网站信息
编辑 `app/layout.tsx` 中的metadata：
```tsx
export const metadata = {
  title: '你的网站名称',
  description: '你的网站描述',
  // ...
}
```

### 修改定价计划
编辑 `lib/database/pricing-schema.sql` 中的订阅计划。

### 修改AI模型
编辑 `app/api/generate-image/route.ts` 中的OpenAI配置。

## 📊 数据库设置

### 1. 创建Supabase项目
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 获取项目URL和API密钥

### 2. 运行数据库迁移
```sql
-- 运行 lib/database/schema.sql 中的SQL语句
```

### 3. 设置Row Level Security (RLS)
确保所有表都启用了RLS策略。

## 🔐 安全配置

### 1. 环境变量
- 不要将敏感信息提交到版本控制
- 使用 `.env.local` 存储本地配置

### 2. API密钥
- 定期轮换API密钥
- 使用最小权限原则

### 3. 数据库安全
- 启用RLS策略
- 定期备份数据

## 🚀 部署

### Vercel部署
1. 连接GitHub仓库
2. 配置环境变量
3. 部署项目

### 其他平台
- 支持所有支持Next.js的平台
- 确保环境变量正确配置

## 📈 监控和分析

### Google Analytics
已集成Google Analytics，可在 `app/layout.tsx` 中修改ID。

### 错误监控
建议集成Sentry等错误监控服务。

## 🤝 贡献

欢迎提交Issue和Pull Request！

## �� 许可证

MIT License 