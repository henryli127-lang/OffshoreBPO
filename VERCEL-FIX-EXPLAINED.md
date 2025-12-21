# Vercel 404 Error - 完整解析与修复

## 1. 修复方案 (The Fix)

### 问题根源
你的 `vercel.json` 配置不完整，导致 Vercel 无法正确路由静态文件和 API 请求。

### 修复后的配置

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*\\.(html|css|js|png|jpg|jpeg|gif|svg|ico|json))",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 关键改动

1. **添加静态文件路由**：明确告诉 Vercel 如何处理 `.html`, `.css`, `.js`, 图片等静态文件
2. **添加回退路由**：所有其他请求都回退到 `index.html`（支持单页应用路由）
3. **添加缓存头**：为静态资源设置缓存策略

---

## 2. 根本原因分析 (Root Cause)

### 代码实际做了什么 vs. 应该做什么

**实际行为（错误）：**
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/$1" }  // ❌ 问题在这里
  ]
}
```

这个配置试图将所有请求（包括静态文件）原样返回，但 Vercel 需要明确知道：
- 哪些是 API 请求（需要执行 serverless function）
- 哪些是静态文件（需要直接返回文件内容）
- 哪些是页面路由（需要返回 HTML）

**应该的行为：**
1. `/api/*` → 执行 serverless function
2. `/*.html`, `/*.css`, `/*.js`, 图片等 → 返回静态文件
3. 其他路径（如 `/solution-1`）→ 返回 `index.html` 或对应的 HTML 文件

### 触发条件

这个错误在以下情况发生：
- 访问根路径 `/` 时，Vercel 找不到 `index.html` 的明确路由
- 访问 `/solution-1.html` 时，路由规则不匹配
- 访问任何路径时，Vercel 不知道应该返回什么

### 误解和疏忽

**误解1：** 认为 `"dest": "/$1"` 会自动处理所有文件
- **现实**：Vercel 需要明确的文件类型匹配规则

**误解2：** 认为 Express 的 `app.use(express.static('.'))` 在 Vercel 中会自动工作
- **现实**：Vercel 不使用 Express 服务器，需要显式配置路由

**疏忽：** 没有为静态文件添加专门的路由规则

---

## 3. 核心概念理解 (The Concept)

### 为什么这个错误存在？

Vercel 是一个 **serverless 平台**，与传统服务器有根本区别：

**传统服务器（Express）：**
```
请求 → Express 服务器 → 中间件处理 → 路由匹配 → 返回响应
```
- 服务器持续运行
- 可以动态处理任何请求
- `express.static()` 自动服务静态文件

**Serverless（Vercel）：**
```
请求 → Vercel 路由规则 → 匹配 serverless function 或静态文件 → 执行/返回
```
- 函数按需执行
- 需要**显式配置**每个路由
- 没有"自动"的静态文件服务（除非明确配置）

### 正确的思维模型

把 Vercel 想象成一个**智能路由器**：

```
请求路径 → 路由规则匹配 → 执行对应操作
```

路由规则按顺序匹配，**第一个匹配的规则生效**：

1. `/api/*` → 执行 serverless function
2. `/*.html` → 返回静态 HTML 文件
3. `/*.css` → 返回静态 CSS 文件
4. `/*` → 回退到 index.html（SPA 路由）

### 在框架设计中的位置

这是 **声明式路由配置** vs **命令式服务器代码** 的区别：

- **声明式**（Vercel）：告诉平台"什么路径应该做什么"
- **命令式**（Express）：写代码"如何处理请求"

---

## 4. 预警信号 (Warning Signs)

### 应该注意的模式

**🚨 代码异味：**

1. **过于简单的路由配置**
   ```json
   { "src": "/(.*)", "dest": "/$1" }  // 太宽泛，可能出问题
   ```

2. **缺少静态文件处理**
   - 没有明确匹配 `.html`, `.css`, `.js` 的规则

3. **假设 Express 行为**
   - 认为 `express.static()` 会自动工作
   - 认为中间件会自动应用

### 类似错误场景

**场景1：部署 Next.js 到 Vercel**
- ✅ Next.js 有内置的 Vercel 配置
- ❌ 但如果你自定义了路由，需要更新 `vercel.json`

**场景2：部署 React/Vue SPA**
- ✅ 需要将所有路由回退到 `index.html`
- ❌ 忘记配置会导致刷新页面时 404

**场景3：混合静态站点 + API**
- ✅ 需要分别配置静态文件和 API 路由
- ❌ 只配置 API 会导致静态文件 404

### 代码检查清单

部署到 Vercel 前检查：
- [ ] `vercel.json` 中是否有静态文件路由规则？
- [ ] API 路由是否正确配置？
- [ ] 是否有回退路由（用于 SPA）？
- [ ] 环境变量是否在 Vercel Dashboard 中配置？

---

## 5. 替代方案和权衡 (Alternatives)

### 方案1：当前方案（推荐）
**使用 `vercel.json` 配置路由**

**优点：**
- ✅ 完全控制路由行为
- ✅ 支持缓存优化
- ✅ 清晰的配置

**缺点：**
- ❌ 需要维护配置文件
- ❌ 路由规则可能复杂

### 方案2：使用 Vercel 的自动检测
**不提供 `vercel.json`，让 Vercel 自动检测**

**优点：**
- ✅ 零配置
- ✅ Vercel 自动识别框架

**缺点：**
- ❌ 只适用于支持的框架（Next.js, Nuxt.js 等）
- ❌ 对于纯静态站点 + API，可能不够灵活
- ❌ 无法自定义缓存策略

### 方案3：将所有 HTML 重命名为路由
**创建 `pages/` 目录结构**

```
pages/
  index.html
  solution-1.html
  solution-2.html
```

**优点：**
- ✅ 更符合 Vercel 的约定
- ✅ 自动路由

**缺点：**
- ❌ 需要重构项目结构
- ❌ 迁移成本高

### 方案4：使用 Vercel 的 Rewrites
**更细粒度的重写规则**

```json
{
  "rewrites": [
    { "source": "/solution-1", "destination": "/solution-1.html" },
    { "source": "/solution-2", "destination": "/solution-2.html" }
  ]
}
```

**优点：**
- ✅ 支持 URL 美化（去掉 `.html`）
- ✅ 更灵活

**缺点：**
- ❌ 需要为每个页面配置
- ❌ 维护成本高

### 推荐方案

对于你的项目（静态 HTML + API），**方案1（当前修复）** 是最佳选择：
- 保持现有文件结构
- 清晰的配置
- 易于维护

---

## 总结

### 快速修复
更新 `vercel.json` 为修复后的配置，重新部署即可。

### 长期理解
- Vercel 是 serverless 平台，需要显式路由配置
- 静态文件和 API 需要分别处理
- 路由规则按顺序匹配，第一个匹配的生效

### 避免再次发生
- 部署前检查 `vercel.json` 配置
- 确保静态文件有明确的路由规则
- 测试所有主要路径（首页、API、静态资源）


