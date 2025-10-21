# 🐾 宠物店管理系统 (PetMan)

一个现代化的宠物店综合管理系统，专注于传统管理功能。

## ✨ 核心功能

### 📋 传统管理模块
- **宠物管理** - 宠物信息登记、健康档案
- **客户管理** - 客户信息、消费记录
- **预约管理** - 美容、洗澡、寄养预约
- **库存管理** - 商品进销存、供应商管理

<!-- AI features disabled - moved to archive -->
<!-- ### 🤖 AI 智能助手（已禁用）
- **自然语言录入** - 用聊天的方式录入商品信息
- **图片识别** - 上传商品照片自动提取信息
- **🌐 智能搜索建商品** - AI联网搜索并自动创建商品实体 ✨NEW
- **智能提取** - 自动识别品牌、规格、价格等字段
- **数据验证** - 智能验证数据完整性 -->

## 🏗️ 项目结构

```
petman/
├── backend/                    # 后端服务（Flask）
│   ├── app.py                # 主应用
│   ├── pets.py               # 宠物管理
│   ├── customers_py.py       # 客户管理
│   ├── appointments_py.py    # 预约管理
│   ├── inventory_py.py       # 库存管理
│   ├── static/               # 静态资源
│   └── templates/            # HTML 模板
│   └── archive/ai_modules_disabled/  # AI模块已移至归档
│
├── frontend/                  # 前端应用（React + Vite）
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   │   ├── dashboard.tsx
│   │   │   ├── pets.tsx
│   │   │   ├── customers.tsx
│   │   │   ├── appointments.tsx
│   │   │   └── inventory/
│   │   ├── components/      # UI 组件
│   │   └── archive/ai_modules_disabled/  # AI页面已移至归档
│   │   │   ├── agent/       # Agent 相关组件
│   │   │   ├── ui/          # 通用 UI 组件
│   │   │   └── layout/      # 布局组件
│   │   └── lib/             # 工具库
│   │       ├── agent-api.ts # Agent API 客户端
│   │       └── api-client.ts
│   └── package.json
│
├── database/                  # 数据库文件
│   ├── version5.sql          # 当前数据库版本 ✅
│   ├── V4_DATABASE_GUIDE.md  # 数据库使用指南
│   └── archive/              # 历史版本归档
│
├── scripts/                   # 脚本文件 🆕
│   ├── rebuild_database.ps1  # 数据库重建脚本
│   ├── start-backend.ps1     # 后端启动脚本
│   ├── sync_stock.ps1        # 库存同步脚本
│   ├── add_sample_data.py    # 示例数据添加
│   └── check_services.py     # 服务检查
│
├── tests/                     # 测试文件 🆕
│   └── test_key_apis.py      # API 测试
│
├── docs/                      # 项目文档（英文）
│   ├── CSV_IMPORT_GUIDE.md
│   ├── DATABASE_MIGRATION_GUIDE.md
│   ├── AGENT_SETUP_GUIDE.md   # AI Agent 快速开始指南
│   ├── SMART_SEARCH_GUIDE.md  # 智能搜索指南
│   └── zh-CN/                # 中文文档 🆕
│       ├── 快速重建数据库.md
│       ├── 库存同步修复说明.md
│       └── 问题解决总结.md
│
├── requirements.txt          # Python 依赖
└── README.md                 # 本文件
```

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- MySQL 5.7+ 或 MariaDB
- Gemini API Key（用于 AI 功能）

### 1. 数据库设置

```bash
# 导入数据库
mysql -u root -p < database/version5.sql
```

### 2. 后端设置

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 创建 .env 文件（重要！）
# 在 backend 目录下创建 .env 文件，添加：
# GEMINI_API_KEY=你的_Gemini_API_Key

# 启动服务
python app.py
```

后端将在 `http://localhost:5000` 运行

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:5173` 运行

### 4. 访问系统

打开浏览器访问：`http://localhost:5173`

## 🤖 使用 AI 助手

### 获取 Gemini API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录 Google 账号
3. 创建 API Key
4. 复制 Key 到 `backend/.env` 文件中

详细说明请查看：[AGENT_SETUP_GUIDE.md](docs/AGENT_SETUP_GUIDE.md)

### AI 助手功能

1. **🌐 智能搜索建商品（NEW! 推荐）**
   ```
   输入："皇家猫粮成猫2kg"
   → AI自动联网搜索商品信息
   → 自动提取品牌、规格、价格、产地等
   → 一键创建完整商品实体
   
   ⚡ 从5分钟缩短到30秒！效率提升90%+
   ```
   
   **使用方法**：
   - 访问：http://localhost:5173/smart-search
   - 输入商品名称
   - 点击"🚀 一键创建商品"
   - 完成！
   
   详细文档：[智能搜索指南](docs/SMART_SEARCH_GUIDE.md)

2. **文字录入**
   ```
   皇家猫粮，成猫专用，2kg装，供应商宠物乐园，单价85元
   ```

3. **图片识别**
   - 上传商品包装照片
   - AI 自动识别文字信息

4. **图文混合**
   - 上传图片 + 补充描述
   - 获得最准确的结果

## 📚 文档

### 英文文档
- [🌐 智能搜索指南](docs/SMART_SEARCH_GUIDE.md) - AI联网搜索建商品（NEW!）
- [AI Agent 快速开始指南](docs/AGENT_SETUP_GUIDE.md) - AI 功能完整说明
- [数据库指南](database/V4_DATABASE_GUIDE.md) - 数据库结构说明
- [CSV 导入指南](docs/CSV_IMPORT_GUIDE.md) - 批量导入商品
- [数据库迁移指南](docs/DATABASE_MIGRATION_GUIDE.md) - 版本升级说明

### 中文文档
- [快速重建数据库](docs/zh-CN/快速重建数据库.md)
- [库存同步修复说明](docs/zh-CN/库存同步修复说明.md)
- [问题解决总结](docs/zh-CN/问题解决总结.md)

## 🛠️ 技术栈

### 后端
- **Flask** - Python Web 框架
- **Google Gemini AI** - AI 智能识别
- **Pillow** - 图片处理
- **Flask-CORS** - 跨域支持

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架
- **React Query** - 数据管理
- **Lucide Icons** - 图标库

### 数据库
- **MySQL/MariaDB** - 关系型数据库

## 📁 功能模块

### 传统模块
| 模块 | 前端路由 | 后端 API |
|------|---------|---------|
| 仪表板 | `/` | - |
| 宠物管理 | `/pets` | `/api/pets` |
| 客户管理 | `/customers` | `/api/customers` |
| 预约管理 | `/appointments` | `/api/appointments` |
| 库存管理 | `/inventory/*` | `/api/inventory` |

### AI 模块
| 功能 | 前端路由 | 后端 API |
|------|---------|---------|
| AI 助手 | `/agent-assistant` | `/api/agent/*` |
| 健康检查 | - | `/api/agent/health` |
| 文字提取 | - | `/api/agent/extract-from-text` |
| 图片提取 | - | `/api/agent/extract-from-image` |
| 混合提取 | - | `/api/agent/extract-mixed` |

## 🔧 配置说明

### 后端配置 (backend/.env)

```env
# Gemini AI
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL_VISION=gemini-1.5-flash
GEMINI_MODEL_TEXT=gemini-1.5-flash

# 图片处理
MAX_IMAGE_SIZE=5242880  # 5MB
MAX_IMAGE_WIDTH=2048
MAX_IMAGE_HEIGHT=2048

# 上传设置
UPLOAD_FOLDER=uploads/agent
```

## 🚧 开发说明

### 安装开发依赖

```bash
# 后端
cd backend
pip install -r requirements.txt

# 前端
cd frontend
npm install
```

### 代码规范

- Python: PEP 8
- TypeScript/React: ESLint + Prettier
- 提交信息: Conventional Commits

## 📈 未来计划

- [ ] 移动端 App
- [ ] 微信小程序
- [ ] 对话式 AI 录入
- [ ] 语音输入支持
- [ ] 商品推荐系统
- [ ] 数据分析看板
- [ ] 多店铺支持

## ⚠️ 注意事项

1. **API Key 安全**
   - 不要将 `.env` 文件提交到 Git
   - 生产环境使用环境变量管理

2. **数据库**
   - 使用 `version5.sql` 初始化
   - 定期备份数据

3. **图片上传**
   - 支持格式：JPG, PNG, WEBP, GIF
   - 最大 5MB

## 🐛 故障排除

### AI 功能无法使用

1. 检查 `GEMINI_API_KEY` 是否正确配置
2. 确认网络可以访问 Google 服务
3. 查看后端控制台错误信息

### 前端无法连接后端

1. 确认后端已启动（端口 5000）
2. 检查 CORS 配置
3. 查看浏览器控制台网络请求

### 数据库连接失败

1. 确认 MySQL 服务已启动
2. 检查数据库连接配置
3. 验证用户权限

## 📞 支持

- 查看文档：[docs/](docs/)
- AI 助手问题：[AGENT_SETUP_GUIDE.md](docs/AGENT_SETUP_GUIDE.md)
- 数据库问题：[V4_DATABASE_GUIDE.md](database/V4_DATABASE_GUIDE.md)

## 📄 许可证

MIT License

---

**Built with ❤️ for Pet Lovers**

