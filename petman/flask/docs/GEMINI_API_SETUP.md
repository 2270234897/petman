# Gemini API 设置指南

## 🚨 当前问题
Agent Assistant功能出现500错误，因为缺少GEMINI_API_KEY环境变量。

## 📋 解决步骤

### 1. 获取Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录你的Google账号
3. 点击 "Create API Key"
4. 复制生成的API Key

### 2. 设置环境变量

#### 方法1: 创建.env文件 (推荐)

在项目根目录 `D:\python\petman\flask\` 创建 `.env` 文件：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=FANG
DB_PASSWORD=Fang11243.
DB_NAME=mydb

# Gemini AI API配置
GEMINI_API_KEY=你的API_KEY_这里

# Agent配置
AGENT_AUTO_SAVE=false
CONFIDENCE_THRESHOLD=0.7
DEFAULT_LANGUAGE=zh-CN
```

#### 方法2: 临时设置环境变量

在PowerShell中运行：
```powershell
$env:GEMINI_API_KEY="你的API_KEY_这里"
python backend/app.py
```

#### 方法3: 在启动脚本中设置

修改 `启动后端.bat` 文件，在 `python backend\app.py` 前添加：
```batch
set GEMINI_API_KEY=你的API_KEY_这里
python backend\app.py
```

### 3. 验证设置

重启Flask服务后，Agent Assistant应该可以正常工作了。

## 🔧 测试Agent功能

设置完成后，你可以：
1. 访问 http://localhost:5173/agent-assistant
2. 上传商品图片
3. AI会自动识别商品信息并提取

## ⚠️ 注意事项

- API Key请妥善保管，不要提交到代码仓库
- 确保.env文件在.gitignore中（如果使用Git）
- Gemini API有免费额度限制，超出后可能需要付费

## 📞 如果仍有问题

如果设置后仍有问题，请检查：
1. API Key是否正确
2. 网络连接是否正常
3. Flask服务是否重启
4. 浏览器控制台是否有其他错误信息


