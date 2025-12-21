# Vercel 404 错误调试指南

## 当前问题

即使简化了配置，仍然出现 404 错误。让我们系统性地排查：

## 排查步骤

### 1. 检查项目结构

Vercel 期望的项目结构：
```
project-root/
  ├── index.html          # 必须存在
  ├── styles.css
  ├── api/
  │   └── consultation.js # Serverless function
  └── vercel.json         # 可选配置
```

### 2. 检查 Vercel Dashboard

在 Vercel Dashboard 中：
1. 进入项目设置
2. 查看 "Functions" 标签 - 应该显示 `/api/consultation`
3. 查看部署日志 - 检查是否有构建错误
4. 查看 "Settings" → "General" - 确认根目录设置

### 3. 可能的原因

**原因1：Vercel 没有识别为静态站点**
- 解决方案：确保 `index.html` 在根目录
- 检查：Vercel Dashboard → Settings → General → Root Directory

**原因2：API 函数路径不正确**
- 当前结构：`api/consultation.js` → 应该是 `/api/consultation`
- 检查：Vercel Dashboard → Functions 标签

**原因3：需要明确告诉 Vercel 这是静态站点**
- 尝试：创建一个空的 `vercel.json` 或使用下面的最小配置

### 4. 最小配置尝试

完全移除 `vercel.json`，让 Vercel 自动检测：
```bash
rm vercel.json
```

或者使用绝对最小配置：
```json
{}
```

### 5. 如果还是不行，尝试显式配置

如果自动检测失败，使用这个配置：

```json
{
  "version": 2,
  "public": true
}
```

### 6. 检查部署日志

在 Vercel Dashboard 中查看：
- Build Logs - 检查构建过程
- Function Logs - 检查 API 函数执行
- 错误信息 - 查看具体错误

### 7. 本地测试

使用 Vercel CLI 本地测试：
```bash
npm install -g vercel
vercel dev
```

这会模拟 Vercel 环境，可以看到实际行为。

### 8. 替代方案：使用 `public` 目录

如果问题持续，可以尝试将静态文件移到 `public` 目录：

```
project-root/
  ├── api/
  │   └── consultation.js
  ├── public/
  │   ├── index.html
  │   ├── styles.css
  │   └── *.html
  └── vercel.json
```

然后配置：
```json
{
  "public": true
}
```

### 9. 检查文件权限

确保所有文件有正确的读取权限：
```bash
chmod 644 *.html *.css *.js
chmod 755 api/
chmod 644 api/*.js
```

## 最可能的原因

基于错误信息，最可能的原因是：

1. **Vercel 没有正确识别项目类型**
   - 解决方案：确保根目录有 `index.html`

2. **部署配置问题**
   - 检查 Vercel Dashboard 中的项目设置
   - 确认 "Framework Preset" 设置（应该选择 "Other" 或 "Static Site"）

3. **构建输出目录问题**
   - 如果设置了 "Output Directory"，确保 `index.html` 在那里

## 下一步

1. 检查 Vercel Dashboard 中的部署日志
2. 确认项目设置中的 "Root Directory" 和 "Output Directory"
3. 尝试完全移除 `vercel.json` 重新部署
4. 查看具体的错误日志信息

如果还是不行，请分享：
- Vercel Dashboard 中的部署日志
- 项目设置截图（Settings → General）
- Functions 标签页显示的内容

