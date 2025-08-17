# 异步图片生成系统部署指南

## 📋 概述

已将同步图片生成流程重构为异步系统，用户可以提交任务后立即继续使用，支持多任务并发。

## 🔧 部署步骤

### 1. 数据库迁移

运行以下SQL文件创建异步任务相关表：

```sql
-- 在Supabase SQL编辑器中运行
\i lib/database/add-async-tasks.sql
```

或者手动执行 `lib/database/add-async-tasks.sql` 中的内容。

### 2. 环境变量

确保以下环境变量已设置：

```env
# 现有的必要变量
AZURE_ENDPOINT=your_azure_endpoint
AZURE_API_KEY=your_azure_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 新增：Cron任务安全令牌（可选）
CRON_SECRET=your_random_secret_string

# App URL（用于内部API调用）
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Vercel配置

`vercel.json` 已配置自动定时任务处理：
- 每2分钟处理一次任务队列
- 增加了API函数的最大执行时间

### 4. 依赖检查

确保安装了所需的依赖：

```bash
npm install @radix-ui/react-progress
# 其他依赖应该已存在
```

## 🚀 功能特性

### 前端改进
- ✅ 异步任务提交，立即返回
- ✅ 实时任务状态显示
- ✅ 多任务并发支持
- ✅ 任务取消功能
- ✅ 进度跟踪和可视化

### 后端架构
- ✅ 任务队列系统
- ✅ SSE实时推送
- ✅ 优先级处理
- ✅ 失败重试机制
- ✅ 资源优化（避免轮询）

## 🧪 测试流程

### 1. 本地测试

```bash
# 启动开发服务器
npm run dev

# 测试任务提交
curl -X POST http://localhost:3000/api/tasks/submit \
  -H "Content-Type: application/json" \
  -d '{"prompt": "beautiful nail art", "quality": "medium"}'

# 手动触发任务处理
curl -X POST http://localhost:3000/api/cron/process-tasks

# 测试SSE连接
# 在浏览器中打开: http://localhost:3000/api/tasks/status?taskId=YOUR_TASK_ID
```

### 2. 功能测试

1. **提交任务**：用户界面提交新的图片生成任务
2. **查看状态**：观察任务状态面板的实时更新
3. **多任务**：同时提交多个任务，验证并发处理
4. **取消任务**：测试取消待处理或进行中的任务
5. **结果显示**：验证完成后的图片显示和下载

### 3. 监控指标

关注以下指标：
- 任务处理延迟
- SSE连接稳定性
- 数据库性能
- Vercel函数执行时间

## 🔍 故障排除

### 常见问题

1. **任务不被处理**
   - 检查Vercel cron任务是否启用
   - 验证数据库连接
   - 查看API日志

2. **SSE连接失败**
   - 检查用户认证状态
   - 验证任务权限
   - 确认浏览器SSE支持

3. **任务卡在processing状态**
   - 检查Azure API连接
   - 验证API密钥和额度
   - 查看函数执行时间限制

### 调试工具

```bash
# 查看待处理任务
curl http://localhost:3000/api/cron/process-tasks

# 检查任务状态
# 在Supabase中查询 async_tasks 表

# 监控SSE连接
# 使用浏览器开发者工具的网络面板
```

## 📊 性能优化建议

1. **数据库优化**
   - 定期清理完成的任务记录
   - 监控查询性能
   - 考虑添加更多索引

2. **API优化**
   - 实现任务批处理
   - 添加请求限制
   - 优化错误处理

3. **前端优化**
   - 限制同时显示的任务数量
   - 实现任务状态缓存
   - 优化SSE重连机制

## 🔄 升级路径

未来可考虑的改进：
- Redis任务队列
- 工作节点集群
- 任务优先级算法优化
- 用户通知系统
- 详细的分析统计