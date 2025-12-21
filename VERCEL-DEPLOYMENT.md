# Vercel 部署指南

## Vercel部署说明

Vercel是一个serverless平台，需要特殊配置来运行Node.js API。

## 部署步骤

### 1. 安装Vercel CLI（可选）

```bash
npm install -g vercel
```

### 2. 通过Vercel网站部署

1. 访问 [vercel.com](https://vercel.com)
2. 导入你的GitHub仓库
3. Vercel会自动检测并部署

### 3. 配置环境变量

在Vercel项目设置中添加环境变量：

1. 进入项目 Dashboard
2. 点击 Settings → Environment Variables
3. 添加以下变量：

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NOTIFICATION_EMAIL=your-email@gmail.com
```

**重要**：部署后，环境变量会生效。如果修改了环境变量，需要重新部署。

### 4. 项目结构

Vercel部署需要以下文件：

- `vercel.json` - Vercel配置文件
- `api/consultation.js` - API serverless function
- 静态文件（HTML, CSS, JS等）

## 文件说明

### vercel.json
配置Vercel路由和构建设置。

### api/consultation.js
Serverless function处理表单提交。注意：
- 文件存储在 `/tmp` 目录（Vercel的临时目录）
- 每次请求都是独立的函数调用
- 环境变量通过 `process.env` 访问

## API端点

部署后，API端点地址为：
```
https://your-project.vercel.app/api/consultation
```

前端代码会自动使用正确的端点。

## 注意事项

### 1. 文件存储限制

Vercel的 `/tmp` 目录是临时存储：
- 每次函数调用后可能被清理
- 不适合长期存储数据
- 建议使用数据库（如MongoDB, PostgreSQL）或Vercel KV存储

### 2. 环境变量

- 在Vercel Dashboard中配置环境变量
- 修改环境变量后需要重新部署
- 生产环境和预览环境可以使用不同的变量

### 3. 函数超时

Vercel免费版函数执行时间限制：
- Hobby计划：10秒
- Pro计划：60秒

如果邮件发送很慢，可能需要升级计划。

## 使用数据库（推荐）

对于生产环境，建议使用数据库而不是文件存储：

### 选项1：Vercel KV (Redis)
```javascript
import { kv } from '@vercel/kv';

// 存储
await kv.lpush('consultations', JSON.stringify(submission));

// 读取
const consultations = await kv.lrange('consultations', 0, -1);
```

### 选项2：MongoDB Atlas
```javascript
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);

await client.connect();
const db = client.db('offshorebpo');
const collection = db.collection('consultations');
await collection.insertOne(submission);
```

### 选项3：Vercel Postgres
```javascript
import { sql } from '@vercel/postgres';

await sql`
  INSERT INTO consultations (name, email, phone, country, employees)
  VALUES (${name}, ${email}, ${phone}, ${country}, ${employees})
`;
```

## 故障排查

### 问题：Network error
- 检查API端点是否正确
- 检查Vercel部署日志
- 确认环境变量已配置

### 问题：Function timeout
- 检查邮件发送是否超时
- 考虑使用异步队列处理邮件
- 升级Vercel计划

### 问题：文件未保存
- `/tmp` 目录是临时的
- 建议迁移到数据库

## 查看日志

在Vercel Dashboard中：
1. 进入项目
2. 点击 "Functions" 标签
3. 查看函数执行日志

## 本地测试

使用Vercel CLI在本地测试：

```bash
vercel dev
```

这会启动本地开发服务器，模拟Vercel环境。


