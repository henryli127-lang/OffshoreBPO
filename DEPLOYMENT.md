# 部署和启动指南

## 从GitHub部署后启动服务器

### 1. 克隆或拉取代码

如果是第一次部署：
```bash
git clone <your-repository-url>
cd OffshoreBPO
```

如果代码已存在，更新代码：
```bash
cd OffshoreBPO
git pull
```

### 2. 安装依赖

```bash
npm install
```

这会安装所有必需的包（express, nodemailer, dotenv等）。

### 3. 配置环境变量

创建 `.env` 文件（如果还没有）：
```bash
# 复制示例文件（如果存在）
cp .env.example .env

# 或者手动创建
nano .env
```

在 `.env` 文件中配置：
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NOTIFICATION_EMAIL=your-email@gmail.com
PORT=3000
```

**重要**：`.env` 文件不会被提交到Git（已在.gitignore中），所以每次部署都需要重新创建。

### 4. 启动服务器

**开发模式（推荐用于测试）：**
```bash
npm start
```

**生产模式（使用PM2等进程管理器）：**
```bash
# 使用PM2（需要先安装: npm install -g pm2）
pm2 start server.js --name offshore-bpo

# 查看状态
pm2 status

# 查看日志
pm2 logs offshore-bpo

# 停止
pm2 stop offshore-bpo
```

### 5. 访问网站

服务器启动后，访问：
```
http://localhost:3000
```

如果部署在服务器上，使用服务器的IP地址或域名：
```
http://your-server-ip:3000
```

## 快速启动命令

```bash
# 一键启动（假设.env已配置）
cd OffshoreBPO
npm install  # 只需第一次运行
npm start
```

## 常见问题

### Q: 端口3000已被占用
A: 修改 `.env` 文件中的 `PORT` 值，例如：
```env
PORT=3001
```

### Q: 找不到模块错误
A: 运行 `npm install` 安装依赖

### Q: 邮件发送失败
A: 检查 `.env` 文件中的SMTP配置，确保：
- Gmail应用专用密码正确
- 没有多余的空格或引号
- 已启用两步验证

### Q: 如何让服务器在后台运行？
A: 使用PM2或其他进程管理器：
```bash
npm install -g pm2
pm2 start server.js --name offshore-bpo
pm2 save  # 保存配置
pm2 startup  # 设置开机自启
```

## 生产环境部署建议

### 使用Nginx作为反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 使用SSL/HTTPS

使用Let's Encrypt获取免费SSL证书：
```bash
sudo certbot --nginx -d your-domain.com
```

### 设置防火墙

```bash
# 允许HTTP和HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 如果直接访问Node.js端口
sudo ufw allow 3000
```

## 环境变量说明

| 变量 | 说明 | 必需 |
|------|------|------|
| `SMTP_HOST` | SMTP服务器地址 | 是 |
| `SMTP_PORT` | SMTP端口（Gmail: 587） | 是 |
| `SMTP_USER` | 发送邮件的邮箱地址 | 是 |
| `SMTP_PASS` | 应用专用密码 | 是 |
| `NOTIFICATION_EMAIL` | 接收通知的邮箱 | 是 |
| `PORT` | 服务器端口（默认: 3000） | 否 |

## 数据文件

- `consultations.json` - 存储所有提交的咨询请求
- 此文件会自动创建，无需手动创建

