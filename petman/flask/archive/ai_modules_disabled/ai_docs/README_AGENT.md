# AI Agent 商品录入系统

## 概述

这是一个基于 Google Gemini API 的智能商品录入系统，可以通过自然语言和图片识别来快速录入宠物商品信息。

## 功能特性

- 📝 **自然语言提取**：通过文字描述自动提取商品信息
- 🖼️ **图片识别**：上传商品图片，AI 自动识别包装上的信息
- 🔄 **图文混合**：同时使用文字和图片获得更准确的结果
- ✅ **数据验证**：自动验证提取的数据完整性
- 💾 **一键保存**：验证通过后直接保存到数据库

## 文件结构

```
backend/
├── agent/
│   ├── __init__.py              # 模块初始化
│   ├── gemini_client.py         # Gemini API 客户端
│   ├── product_extractor.py    # 商品信息提取器
│   ├── image_processor.py       # 图片处理工具
│   ├── agent_routes.py          # API 路由
│   └── config.py                # 配置管理
├── .env.example                 # 环境变量示例
└── README_AGENT.md             # 本文档

frontend/
├── src/
│   ├── pages/
│   │   └── agent-assistant.tsx  # AI 助手主页面
│   ├── components/
│   │   └── agent/
│   │       └── quick-entry.tsx  # 快速录入组件
│   └── lib/
│       └── agent-api.ts         # Agent API 客户端
```

## 安装配置

### 1. 安装 Python 依赖

```bash
cd backend
pip install -r requirements.txt
```

需要安装的主要依赖：
- `google-generativeai` - Gemini API SDK
- `Pillow` - 图片处理
- `flask-cors` - CORS 支持

### 2. 配置 Gemini API Key

创建 `.env` 文件（参考 `.env.example`）：

```bash
cp .env.example .env
```

编辑 `.env` 文件，添加你的 Gemini API Key：

```env
GEMINI_API_KEY=你的_Gemini_API_Key
```

#### 获取 Gemini API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录 Google 账号
3. 点击 "Get API Key" 或 "Create API Key"
4. 复制生成的 API Key

### 3. 启动后端服务

```bash
cd backend
python app.py
```

服务将在 `http://localhost:5000` 启动。

### 4. 安装前端依赖（如果还没有）

```bash
cd frontend
npm install
```

### 5. 启动前端开发服务器

```bash
cd frontend
npm run dev
```

前端将在 `http://localhost:5173` 启动。

## 使用方法

### 1. 访问 AI 助手页面

在浏览器中打开 `http://localhost:5173/agent-assistant`

### 2. 三种录入模式

#### 图文混合模式（推荐）
- 同时输入文字描述和上传图片
- 获得最准确的识别结果
- 适合信息复杂的商品

#### 仅文字模式
- 直接输入商品描述
- 示例：`皇家猫粮，成猫专用，2kg装，供应商宠物乐园，单价85元`
- 适合快速录入

#### 仅图片模式
- 上传商品图片
- AI 会识别包装上的文字信息
- 适合有清晰包装的商品

### 3. 查看提取结果

- 系统会显示提取的所有字段
- 绿色标签表示验证通过
- 黄色标签表示需要补充信息

### 4. 保存商品

- 验证通过后点击"保存商品"
- 数据将保存到数据库

## API 接口文档

### 健康检查

```http
GET /api/agent/health
```

响应：
```json
{
  "status": "ok",
  "message": "Agent service is running"
}
```

### 从文字提取

```http
POST /api/agent/extract-from-text
Content-Type: application/json

{
  "text": "商品描述文字"
}
```

### 从图片提取

```http
POST /api/agent/extract-from-image
Content-Type: multipart/form-data

image: [图片文件]
context: "额外的文字说明（可选）"
```

### 图文混合提取

```http
POST /api/agent/extract-mixed
Content-Type: multipart/form-data

text: "商品描述"
images: [图片文件1, 图片文件2, ...]
```

### 保存商品

```http
POST /api/agent/save-product
Content-Type: application/json

{
  "product_data": {
    "product_name": "商品名称",
    "brand": "品牌",
    ...
  }
}
```

## 提取的字段

系统会尝试提取以下字段：

| 字段 | 说明 | 必填 |
|------|------|------|
| product_name | 商品名称 | ✅ |
| brand | 品牌 | 推荐 |
| specification | 规格型号 | 推荐 |
| category | 商品类别 | 推荐 |
| quantity | 数量 | - |
| unit_price | 单价 | - |
| supplier | 供应商 | - |
| target_animal | 适用动物 | - |
| features | 产品特点 | - |
| barcode | 条形码 | - |
| notes | 备注 | - |

## 配置选项

在 `.env` 文件中可配置：

```env
# Gemini 模型选择
GEMINI_MODEL_VISION=gemini-1.5-flash
GEMINI_MODEL_TEXT=gemini-1.5-flash

# 图片处理限制
MAX_IMAGE_SIZE=5242880        # 5MB
MAX_IMAGE_WIDTH=2048
MAX_IMAGE_HEIGHT=2048

# 上传目录
UPLOAD_FOLDER=uploads/agent

# 自动保存（开发中）
AGENT_AUTO_SAVE=false

# 置信度阈值
CONFIDENCE_THRESHOLD=0.7
```

## 故障排除

### 1. "GEMINI_API_KEY not found"

**原因**：未配置 API Key

**解决**：
1. 确保创建了 `.env` 文件
2. 添加 `GEMINI_API_KEY=你的key`
3. 重启后端服务

### 2. "Agent service not available"

**原因**：Agent 模块初始化失败

**解决**：
1. 检查 API Key 是否有效
2. 检查网络连接
3. 查看后端控制台错误信息

### 3. "图片验证失败"

**原因**：图片格式或大小不符合要求

**解决**：
- 确保图片格式为 JPG, PNG, WEBP 或 GIF
- 图片大小不超过 5MB
- 尝试压缩或转换图片格式

### 4. JSON 解析失败

**原因**：AI 返回的格式不符合预期

**解决**：
- 点击"查看原始响应"查看 AI 的实际输出
- 尝试提供更清晰的描述或图片
- 系统会尝试从纯文本中提取信息

## 开发说明

### 添加新的提取字段

1. 在 `product_extractor.py` 的 `_normalize_product_data` 方法中添加字段
2. 更新 `gemini_client.py` 中的 prompt 模板
3. 在前端 `agent-assistant.tsx` 中添加显示逻辑

### 自定义 AI 模型

在 `.env` 中可以切换不同的 Gemini 模型：

- `gemini-1.5-flash` - 快速，推荐日常使用
- `gemini-1.5-pro` - 更准确，但速度较慢
- `gemini-1.0-pro-vision` - 专门的视觉模型

### 集成到现有数据库

修改 `agent_routes.py` 中的 `save_product` 函数：

```python
@agent_bp.route('/save-product', methods=['POST'])
def save_product():
    # ... 验证代码 ...
    
    # 调用现有的库存 API
    from inventory_py import create_product
    result = create_product(db_data)
    
    return jsonify(result)
```

## 性能优化

- 图片会自动压缩到 2048x2048 以内
- 支持批量处理多张图片
- 使用 Flash 模型可以获得更快的响应速度

## 安全考虑

- API Key 不应提交到版本控制
- 生产环境应使用环境变量管理配置
- 建议对上传的图片进行安全扫描
- CORS 设置应根据实际需求调整

## 未来计划

- [ ] 支持对话式商品录入
- [ ] 批量导入商品图片
- [ ] 商品信息自动补全
- [ ] 多语言支持
- [ ] OCR 优化
- [ ] 价格趋势分析

## 技术支持

如有问题，请查看：
1. 后端日志：运行 `python app.py` 查看控制台输出
2. 前端日志：浏览器开发者工具 Console 面板
3. API 测试：使用 Postman 或 curl 测试接口

## 许可证

与主项目相同

