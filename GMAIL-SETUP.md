# Gmail SMTP 设置指南

## 步骤 1: 启用两步验证

1. 访问 [Google 账户安全设置](https://myaccount.google.com/security)
2. 登录你的 Google 账户
3. 找到"登录 Google"部分
4. 点击"两步验证"
5. 按照提示完成两步验证设置（如果还没有启用的话）
   - 通常需要手机号码
   - 可能需要验证码确认

## 步骤 2: 生成应用专用密码

1. 在"两步验证"页面，向下滚动找到"应用专用密码"
   - 或者在 [这里直接访问](https://myaccount.google.com/apppasswords)
2. 点击"应用专用密码"
3. 可能需要再次输入密码确认
4. 选择"邮件"作为应用类型
5. 选择"其他（自定义名称）"作为设备类型
6. 输入自定义名称，例如："Offshore BPO Server"
7. 点击"生成"按钮
8. **重要**：Google 会显示一个 16 位的密码（格式类似：xxxx xxxx xxxx xxxx）
   - **立即复制这个密码**，因为它只会显示一次
   - 这个密码就是 `SMTP_PASS` 的值

## 步骤 3: 配置 .env 文件

在你的项目根目录创建或编辑 `.env` 文件，填入以下信息：

```env
# Gmail SMTP 配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=你的gmail邮箱@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# 接收通知的邮箱地址（通常是同一个邮箱）
NOTIFICATION_EMAIL=你的gmail邮箱@gmail.com

# 服务器端口
PORT=3000
```

**示例**：
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=john.doe@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
NOTIFICATION_EMAIL=john.doe@gmail.com
PORT=3000
```

**注意事项**：
- `SMTP_PASS` 是刚才生成的应用专用密码，不是你的 Gmail 登录密码
- 如果密码中有空格，可以保留空格，或者去掉空格都可以
- `SMTP_USER` 填写完整的 Gmail 邮箱地址
- `NOTIFICATION_EMAIL` 填写你想接收通知的邮箱地址（通常是你自己的邮箱）

## 步骤 4: 测试配置

1. 启动服务器：
```bash
npm start
```

2. 访问网站并提交一个测试表单

3. 检查你的邮箱是否收到通知邮件

## 常见问题

### Q: 为什么不能直接使用 Gmail 密码？
A: 为了安全，Google 要求使用应用专用密码，而不是账户密码。这样可以更好地保护你的账户安全。

### Q: 找不到"应用专用密码"选项？
A: 确保你已经启用了"两步验证"，只有启用了两步验证后才会显示应用专用密码选项。

### Q: 密码忘记了怎么办？
A: 你需要生成一个新的应用专用密码，然后更新 `.env` 文件中的 `SMTP_PASS`。

### Q: 可以使用其他邮箱吗？
A: 可以！不同的邮箱服务商有不同的 SMTP 设置：
- **Outlook/Hotmail**: smtp-mail.outlook.com, port 587
- **Yahoo**: smtp.mail.yahoo.com, port 587
- **其他服务商**: 需要查看他们的帮助文档

## 安全提示

⚠️ **重要**：
- 不要将 `.env` 文件提交到 Git 仓库（已经在 .gitignore 中）
- 不要在代码中硬编码密码
- 定期更换应用专用密码
- 如果怀疑密码泄露，立即撤销并生成新的密码

