# 环境变量配置指南

## 快速配置

### Windows 用户

1. **复制配置文件**
   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```

2. **或者手动创建**
   - 在 `backend` 文件夹中新建文本文件
   - 命名为 `.env`（注意前面有个点）
   - 复制 `.env.example` 的内容并修改

### Linux/Mac 用户

```bash
cd backend
cp .env.example .env
```

## 必需配置项

### 1. Gemini API Key（AI 功能必需）

```env
GEMINI_API_KEY=your_actual_api_key_here
```

**获取步骤：**
1. 访问 https://makersuite.google.com/app/apikey
2. 使用 Google 账号登录
3. 点击 "Create API Key"
4. 复制生成的 Key
5. 粘贴到 `.env` 文件中

### 2. 数据库配置（如果使用）

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=petman
DB_USER=root
DB_PASSWORD=your_password
```

## 可选配置项

### AI 模型选择

```env
# 推荐：快速响应
GEMINI_MODEL_VISION=gemini-1.5-flash
GEMINI_MODEL_TEXT=gemini-1.5-flash

# 或：更高准确率（但较慢）
# GEMINI_MODEL_VISION=gemini-1.5-pro
# GEMINI_MODEL_TEXT=gemini-1.5-pro
```

### 图片处理限制

```env
MAX_IMAGE_SIZE=5242880      # 5MB
MAX_IMAGE_WIDTH=2048
MAX_IMAGE_HEIGHT=2048
```

### Flask 应用配置

```env
FLASK_ENV=development       # 开发环境
FLASK_DEBUG=true           # 开启调试
PORT=5000
HOST=0.0.0.0
```

## 配置验证

创建完 `.env` 文件后，可以运行以下命令验证：

```bash
cd backend
python -c "from agent.config import AgentConfig; is_valid, errors = AgentConfig.validate(); print('✅ 配置正确' if is_valid else f'❌ 配置错误: {errors}')"
```

## 常见问题

### Q: 找不到 .env 文件？

**A:** Windows 中，文件名以点开头的文件默认隐藏。确保：
- 文件名完整为 `.env`（没有 .txt 后缀）
- 在文件资源管理器中显示隐藏文件
- 或使用 VS Code 等编辑器创建

### Q: API Key 无效？

**A:** 检查：
1. Key 是否完整复制（没有多余空格）
2. Key 是否已启用
3. 网络是否可以访问 Google 服务

### Q: 数据库连接失败？

**A:** 确认：
1. MySQL 服务已启动
2. 数据库名称正确
3. 用户名和密码正确
4. 端口号正确（默认 3306）

## 生产环境配置

生产环境部署时，建议：

1. **使用环境变量而非文件**
   ```bash
   export GEMINI_API_KEY=your_key
   export FLASK_ENV=production
   ```

2. **关闭调试模式**
   ```env
   FLASK_DEBUG=false
   ```

3. **设置强密钥**
   ```env
   SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
   ```

4. **限制 CORS 来源**
   ```env
   CORS_ORIGINS=https://yourdomain.com
   ```

## 安全提示

- ⚠️ **永远不要**将 `.env` 文件提交到 Git
- ⚠️ **永远不要**在代码中硬编码密钥
- ✅ 使用 `.gitignore` 忽略 `.env` 文件
- ✅ 定期更换 API Key 和密码
- ✅ 使用不同的配置用于开发和生产环境

## 示例配置

### 最小配置（仅 AI 功能）

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 完整开发配置

```env
# AI
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_MODEL_VISION=gemini-1.5-flash
GEMINI_MODEL_TEXT=gemini-1.5-flash

# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_NAME=petman
DB_USER=root
DB_PASSWORD=mypassword

# Flask
FLASK_ENV=development
FLASK_DEBUG=true
PORT=5000
```

### 生产环境配置

```env
# AI
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_MODEL_VISION=gemini-1.5-flash

# 数据库
DATABASE_URL=mysql://user:pass@db.example.com:3306/petman

# Flask
FLASK_ENV=production
FLASK_DEBUG=false
SECRET_KEY=your-very-long-random-secret-key-here
PORT=5000
HOST=0.0.0.0

# CORS
CORS_ORIGINS=https://petman.example.com

# 日志
LOG_LEVEL=WARNING
LOG_FILE=/var/log/petman/app.log
```

---

配置完成后，就可以启动应用了：

```bash
cd backend
python app.py
```

