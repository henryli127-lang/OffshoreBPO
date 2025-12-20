# SMTP邮件发送问题排查指南

## 错误：Connection closed

如果看到 "Connection closed" 错误，通常有以下原因：

### 1. Gmail应用专用密码问题

**检查项：**
- ✅ 是否使用了应用专用密码（不是Gmail登录密码）
- ✅ 应用专用密码是否为16位（格式：xxxx xxxx xxxx xxxx）
- ✅ 密码中是否有多余的空格或引号

**解决方法：**
1. 访问 https://myaccount.google.com/apppasswords
2. 重新生成一个新的应用专用密码
3. 确保 `.env` 文件中的 `SMTP_PASS` 值是纯密码，没有引号
   - ✅ 正确：`SMTP_PASS=abcd efgh ijkl mnop`
   - ❌ 错误：`SMTP_PASS="abcd efgh ijkl mnop"`
   - ❌ 错误：`SMTP_PASS=abcd  efgh  ijkl  mnop` (多余空格)

### 2. Gmail账户安全设置

**检查项：**
- ✅ 是否启用了两步验证（必须）
- ✅ 应用专用密码是否已生成

**解决方法：**
1. 访问 https://myaccount.google.com/security
2. 确保"两步验证"已启用
3. 如果未启用，先启用两步验证
4. 然后生成应用专用密码

### 3. .env文件格式问题

**检查 .env 文件：**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
NOTIFICATION_EMAIL=your-email@gmail.com
PORT=3000
```

**注意事项：**
- 不要在值两边加引号
- 不要在等号两边加空格
- 确保文件末尾有换行符
- 不要有BOM（字节顺序标记）

### 4. 网络/防火墙问题

**检查项：**
- ✅ 网络连接是否正常
- ✅ 防火墙是否阻止了587端口
- ✅ 是否在使用VPN或代理

**解决方法：**
- 尝试关闭VPN
- 检查防火墙设置
- 确保587端口没有被阻止

### 5. 使用465端口（SSL）替代

如果587端口有问题，可以尝试使用465端口（SSL）：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

然后在server.js中需要修改：
```javascript
secure: true,  // 465端口需要设置为true
```

### 6. 测试邮件配置

重启服务器后，提交一个测试表单，查看服务器日志中的详细错误信息。

常见错误码：
- `EAUTH`: 认证失败 - 检查用户名和密码
- `ETIMEDOUT`: 连接超时 - 检查网络或端口
- `ECONNREFUSED`: 连接被拒绝 - 检查主机和端口
- `Connection closed`: 通常是认证问题或配置问题

### 7. 替代方案：使用其他邮箱服务

如果Gmail一直有问题，可以尝试：

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## 快速检查清单

- [ ] `.env` 文件存在且格式正确
- [ ] `SMTP_USER` 是完整的邮箱地址
- [ ] `SMTP_PASS` 是应用专用密码（16位）
- [ ] 密码没有引号或多余空格
- [ ] Gmail账户已启用两步验证
- [ ] 应用专用密码已正确生成
- [ ] 服务器已重启（使.env更改生效）
- [ ] 网络连接正常
- [ ] 检查了服务器日志中的详细错误信息

