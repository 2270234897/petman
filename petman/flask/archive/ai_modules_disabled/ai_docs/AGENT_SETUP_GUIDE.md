# AI Agent 商品录入系统 - 快速开始指南

## 📋 简介

这是一个基于 Google Gemini AI 的智能商品录入系统，可以通过自然语言描述和商品图片快速录入商品信息。

## ✨ 核心功能

- 🤖 **智能提取**：AI 自动从文字和图片中提取商品信息
- 📝 **自然语言输入**：像对话一样描述商品，无需填写复杂表单
- 📸 **图片识别**：上传商品照片，自动识别包装上的信息
- ✅ **智能验证**：自动验证数据完整性
- 💾 **一键保存**：提取后直接保存到数据库

## 🚀 快速开始

### 步骤 1: 获取 Gemini API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 使用 Google 账号登录
3. 点击 "Create API Key" 按钮
4. 复制生成的 API Key

> 💡 **提示**：Gemini API 目前免费使用，有较高的配额限制

### 步骤 2: 配置后端

1. **创建环境变量文件**

```bash
cd backend
cp .env.example .env
```

2. **编辑 `.env` 文件，添加你的 API Key**

```env
GEMINI_API_KEY=你的_API_Key_粘贴在这里
```

3. **安装 Python 依赖**

```bash
pip install -r requirements.txt
```

主要安装的包：
- `google-generativeai` - Gemini AI SDK
- `Pillow` - 图片处理
- `flask-cors` - 跨域支持
- `python-dotenv` - 环境变量管理

### 步骤 3: 启动服务

1. **启动后端**

```bash
cd backend
python app.py
```

后端将在 `http://localhost:5000` 启动

2. **启动前端**（新开一个终端）

```bash
cd frontend
npm install  # 如果还没有安装依赖
npm run dev
```

前端将在 `http://localhost:5173` 启动

### 步骤 4: 开始使用

1. 打开浏览器访问 `http://localhost:5173`
2. 在侧边栏点击 "AI 商品助手" ✨
3. 选择录入方式：

#### 方式 1: 纯文字描述（最快）
```
皇家猫粮，成猫专用，2kg装，供应商是宠物乐园，单价85元
```

#### 方式 2: 上传图片
- 拍摄商品包装照片
- 点击上传
- AI 会识别包装上的文字

#### 方式 3: 图文结合（最准确）
- 上传商品图片
- 补充文字说明
- 获得最完整的信息

## 📁 项目结构

```
backend/
├── agent/                      # AI Agent 核心模块
│   ├── __init__.py            # 模块初始化
│   ├── gemini_client.py       # Gemini API 客户端
│   ├── product_extractor.py  # 商品信息提取器
│   ├── image_processor.py     # 图片处理
│   ├── agent_routes.py        # API 路由
│   └── config.py              # 配置管理
├── .env.example               # 环境变量模板
├── .env                       # 你的环境变量（不提交到 git）
└── README_AGENT.md           # 详细文档

frontend/
├── src/
│   ├── pages/
│   │   └── agent-assistant.tsx    # AI 助手主界面
│   ├── components/
│   │   └── agent/
│   │       └── quick-entry.tsx    # 快速录入组件
│   └── lib/
│       └── agent-api.ts           # API 客户端
```

## 🎯 使用示例

### 示例 1: 快速录入猫粮

**输入**：
```
皇家猫粮室内成猫粮2kg，蓝色包装，供应商宠物乐园，进货价75元
```

**AI 提取结果**：
- 商品名称: 皇家猫粮室内成猫粮
- 品牌: 皇家
- 规格: 2kg
- 类别: 主粮
- 适用动物: 猫
- 供应商: 宠物乐园
- 单价: ¥75.00

### 示例 2: 上传图片识别

上传一张狗粮包装图片，AI 会自动识别：
- 品牌名称
- 产品规格
- 条形码
- 适用年龄
- 产品特点

### 示例 3: 批量描述

**输入**：
```
三个商品：
1. 麦富迪猫罐头，鸡肉味，85g*12罐，72元
2. 洁齿棒，宠物博士品牌，中型犬用，280g，38元
3. 猫砂，蓝钻膨润土，10L装，供应商好朋友，45元
```

AI 会尝试识别多个商品（当前版本建议逐个录入）

## ⚙️ 配置选项

在 `.env` 文件中可以调整：

```env
# 使用的 AI 模型（可选）
GEMINI_MODEL_VISION=gemini-1.5-flash
GEMINI_MODEL_TEXT=gemini-1.5-flash

# 图片大小限制
MAX_IMAGE_SIZE=5242880        # 5MB
MAX_IMAGE_WIDTH=2048
MAX_IMAGE_HEIGHT=2048

# 上传文件保存位置
UPLOAD_FOLDER=uploads/agent
```

## 🔧 故障排除

### 问题 1: "GEMINI_API_KEY not found"

**原因**：环境变量未配置

**解决**：
1. 确保 `backend/.env` 文件存在
2. 检查文件中 `GEMINI_API_KEY=` 后面有你的 key
3. 重启后端服务

### 问题 2: "Agent service not available"

**原因**：Agent 模块初始化失败

**解决**：
1. 检查 API Key 是否正确
2. 测试网络连接（需要访问 Google 服务）
3. 查看后端控制台的错误信息

### 问题 3: 图片上传失败

**原因**：图片格式或大小不符合要求

**解决**：
- 支持格式：JPG, PNG, WEBP, GIF
- 最大 5MB
- 建议尺寸：小于 2048x2048

### 问题 4: 提取结果不准确

**优化建议**：
1. **文字描述**：尽量包含关键信息（名称、品牌、规格、价格）
2. **图片质量**：清晰、光线充足、文字可见
3. **图文结合**：同时提供文字和图片获得最佳效果

## 📊 支持的字段

| 字段 | 说明 | 是否必填 |
|------|------|---------|
| 商品名称 | 产品完整名称 | ✅ 必填 |
| 品牌 | 生产品牌 | 推荐 |
| 规格 | 重量/容量/数量 | 推荐 |
| 类别 | 商品分类 | 推荐 |
| 单价 | 进货价格 | 可选 |
| 供应商 | 经销商名称 | 可选 |
| 适用动物 | 狗/猫/通用 | 可选 |
| 产品特点 | 描述和卖点 | 可选 |
| 条形码 | 商品条码 | 可选 |
| 备注 | 其他信息 | 可选 |

## 🌟 使用技巧

### 技巧 1: 结构化描述

推荐的描述格式：
```
[品牌] [产品名] [规格] [供应商] [价格]
```

例如：
```
皇家 成猫粮 2kg 宠物乐园 85元
```

### 技巧 2: 批量处理

虽然当前版本建议逐个录入，但你可以：
1. 准备好商品描述列表
2. 逐个复制粘贴
3. 快速点击"提取"和"保存"

### 技巧 3: 拍照建议

- ✅ 正面拍摄包装主要信息
- ✅ 确保光线充足
- ✅ 包装文字清晰可见
- ✅ 避免反光和阴影
- ❌ 不要模糊或倾斜

### 技巧 4: 信息补充

如果 AI 提取的信息不完整：
1. 点击"重新提取"
2. 补充更多描述信息
3. 或手动编辑提取结果后保存

## 📚 API 文档

如果你想集成到其他系统，可以直接调用 API：

### 健康检查
```bash
curl http://localhost:5000/api/agent/health
```

### 文字提取
```bash
curl -X POST http://localhost:5000/api/agent/extract-from-text \
  -H "Content-Type: application/json" \
  -d '{"text": "皇家猫粮2kg 85元"}'
```

### 图片提取
```bash
curl -X POST http://localhost:5000/api/agent/extract-from-image \
  -F "image=@product.jpg" \
  -F "context=猫粮"
```

详细 API 文档见 `backend/README_AGENT.md`

## 🔐 安全说明

- ⚠️ **不要**将 `.env` 文件提交到 git
- ⚠️ **不要**在代码中硬编码 API Key
- ✅ 生产环境使用环境变量
- ✅ 定期更换 API Key

## 🎓 进阶使用

### 自定义 AI 模型

编辑 `.env`：
```env
# 使用更强大的 Pro 模型（更准确但较慢）
GEMINI_MODEL_VISION=gemini-1.5-pro
GEMINI_MODEL_TEXT=gemini-1.5-pro
```

### 集成到现有工作流

Agent 可以与现有的库存管理系统无缝集成：
1. 使用 Agent 快速提取信息
2. 在现有的商品管理页面中编辑
3. 批量导入后使用 Agent 补充信息

## 🆘 获取帮助

遇到问题？

1. **查看日志**：
   - 后端：运行 `python app.py` 查看控制台
   - 前端：浏览器 F12 查看 Console

2. **测试 API**：
   ```bash
   curl http://localhost:5000/api/agent/health
   ```

3. **查看详细文档**：
   - `backend/README_AGENT.md` - 完整技术文档
   - Gemini API 文档: https://ai.google.dev/docs

## 📈 性能说明

- **响应时间**：通常 1-3 秒
- **图片处理**：自动压缩优化
- **并发支持**：支持多用户同时使用
- **准确率**：文字描述 ~90%，图片识别 ~80%

## 🗺️ 未来计划

- [ ] 支持对话式录入
- [ ] 批量导入商品图片
- [ ] 历史记录和学习优化
- [ ] 移动端 App
- [ ] 语音输入支持

## 📄 许可证

与主项目相同

---

**开始使用 AI 让商品录入更轻松！** ✨🚀

