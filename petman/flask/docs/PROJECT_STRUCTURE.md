# 项目结构说明

## 📂 整理后的目录结构

```
petman/
│
├── 📄 README.md                    # 项目主文档（新建）
├── 📄 AGENT_SETUP_GUIDE.md        # AI Agent 快速开始指南
├── 📄 PROJECT_STRUCTURE.md        # 本文件 - 项目结构说明
├── 📄 requirements.txt            # Python 依赖
├── 📄 set-static-ip.ps1           # 网络配置脚本
├── 📄 设置固定IP.bat               # 网络配置批处理
│
├── 📁 backend/                     # 后端服务（Flask）
│   ├── 📁 agent/                  # ✨ AI Agent 模块（新增）
│   │   ├── __init__.py           # 模块初始化
│   │   ├── gemini_client.py      # Gemini API 客户端
│   │   ├── product_extractor.py  # 商品信息提取器
│   │   ├── image_processor.py    # 图片处理工具
│   │   ├── agent_routes.py       # Agent API 路由
│   │   └── config.py             # Agent 配置管理
│   │
│   ├── 📄 app.py                  # Flask 主应用
│   ├── 📄 pets.py                 # 宠物管理 API
│   ├── 📄 customers_py.py         # 客户管理 API
│   ├── 📄 appointments_py.py      # 预约管理 API
│   ├── 📄 inventory_py.py         # 库存管理 API
│   ├── 📄 README_AGENT.md        # Agent 技术文档
│   ├── 📄 ENV_SETUP.md           # 环境变量配置指南（新建）
│   ├── 📄 .gitignore             # Git 忽略配置（新建）
│   │
│   ├── 📁 static/                 # 静态资源
│   │   ├── css/                  # 样式文件
│   │   ├── js/                   # JavaScript 文件
│   │   └── img/                  # 图片资源
│   │
│   └── 📁 templates/              # HTML 模板
│       ├── base.html
│       ├── dashboard.html
│       ├── pets.html
│       ├── customers_html.html
│       ├── appointments_html.html
│       ├── inventory_html.html
│       └── modals/               # 模态框组件
│
├── 📁 frontend/                    # 前端应用（React + Vite）
│   ├── 📁 src/
│   │   ├── 📁 pages/              # 页面组件
│   │   │   ├── agent-assistant.tsx      # ✨ AI 助手页面（新增）
│   │   │   ├── dashboard.tsx
│   │   │   ├── pets.tsx
│   │   │   ├── customers.tsx
│   │   │   ├── appointments.tsx
│   │   │   ├── inventory.tsx
│   │   │   ├── image-recognition.tsx
│   │   │   ├── quick-import.tsx
│   │   │   ├── simple-import.tsx
│   │   │   └── inventory/
│   │   │       ├── products.tsx
│   │   │       ├── stock.tsx
│   │   │       ├── specs.tsx
│   │   │       ├── classify.tsx
│   │   │       ├── brands.tsx
│   │   │       ├── dealers.tsx
│   │   │       ├── categories.tsx
│   │   │       └── import.tsx
│   │   │
│   │   ├── 📁 components/         # UI 组件
│   │   │   ├── agent/            # ✨ Agent 组件（新增）
│   │   │   │   └── quick-entry.tsx
│   │   │   ├── appointments/
│   │   │   ├── customers/
│   │   │   ├── inventory/
│   │   │   ├── layout/
│   │   │   │   ├── app-layout.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   └── sidebar.tsx
│   │   │   └── ui/               # 通用 UI 组件
│   │   │
│   │   ├── 📁 lib/                # 工具库
│   │   │   ├── agent-api.ts      # ✨ Agent API 客户端（新增）
│   │   │   ├── api-client.ts
│   │   │   ├── query.ts
│   │   │   ├── utils.ts
│   │   │   ├── csv-converter.ts
│   │   │   ├── csv-processor.ts
│   │   │   └── direct-import.ts
│   │   │
│   │   ├── 📁 hooks/              # React Hooks
│   │   ├── 📁 services/           # API 服务
│   │   ├── 📁 scripts/            # 工具脚本
│   │   ├── App.tsx               # 根组件
│   │   └── main.tsx              # 入口文件
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── README.md
│
├── 📁 database/                    # 数据库文件
│   ├── 📄 version4_final.sql      # ✅ 当前版本（使用这个）
│   ├── 📄 V4_DATABASE_GUIDE.md   # 数据库使用指南
│   │
│   └── 📁 archive/                # 🗄️ 历史版本归档（新建）
│       ├── README.md             # 归档说明
│       ├── version2.sql          # （需手动移动）
│       ├── version2_fixed.sql    # （需手动移动）
│       └── v3_to_v4_migration.sql # （需手动移动）
│
└── 📁 docs/                        # 项目文档
    ├── CSV_IMPORT_GUIDE.md
    └── DATABASE_MIGRATION_GUIDE.md
```

## ✅ 已完成的整理工作

### 1. 删除的文件
- ❌ `appointments_py.py` (根目录重复)
- ❌ `inventory_py.py` (根目录重复)
- ❌ `backend/Untitled-1.py` (临时文件)
- ❌ `frontend/src/pages/test-*.tsx` (所有测试页面)
- ❌ `frontend/src/pages/debug-api.tsx` (调试页面)

### 2. 新建的文件
- ✅ `README.md` - 项目主文档
- ✅ `PROJECT_STRUCTURE.md` - 本文件
- ✅ `backend/ENV_SETUP.md` - 环境配置指南
- ✅ `backend/.gitignore` - Git 忽略配置
- ✅ `database/archive/README.md` - 归档说明

### 3. AI Agent 模块
- ✅ `backend/agent/` - 完整的 Agent 后端模块
- ✅ `frontend/src/pages/agent-assistant.tsx` - Agent 前端页面
- ✅ `frontend/src/components/agent/` - Agent 相关组件
- ✅ `frontend/src/lib/agent-api.ts` - Agent API 客户端

## 📋 需要手动完成的操作

### 1. 移动数据库归档文件

由于路径编码问题，请手动移动以下文件到 `database/archive/` 文件夹：

```
database/version2.sql           → database/archive/version2.sql
database/version2_fixed.sql     → database/archive/version2_fixed.sql
database/v3_to_v4_migration.sql → database/archive/v3_to_v4_migration.sql
```

### 2. 创建 .env 配置文件

在 `backend` 目录下创建 `.env` 文件：

**Windows 用户：**
1. 打开 `backend` 文件夹
2. 新建文本文件，命名为 `.env`
3. 参考 `backend/.env.example`（之前因权限无法创建，请看 `ENV_SETUP.md`）
4. 添加你的 Gemini API Key

**内容模板：**
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_VISION=gemini-1.5-flash
GEMINI_MODEL_TEXT=gemini-1.5-flash
MAX_IMAGE_SIZE=5242880
MAX_IMAGE_WIDTH=2048
MAX_IMAGE_HEIGHT=2048
UPLOAD_FOLDER=uploads/agent
AGENT_AUTO_SAVE=false
CONFIDENCE_THRESHOLD=0.7
DEFAULT_LANGUAGE=zh-CN
```

## 🎯 模块功能划分

### 传统管理模块
| 功能 | 后端 | 前端 | 状态 |
|------|------|------|------|
| 宠物管理 | `pets.py` | `pages/pets.tsx` | ✅ 正常 |
| 客户管理 | `customers_py.py` | `pages/customers.tsx` | ✅ 正常 |
| 预约管理 | `appointments_py.py` | `pages/appointments.tsx` | ✅ 正常 |
| 库存管理 | `inventory_py.py` | `pages/inventory/` | ✅ 正常 |

### AI 智能模块
| 功能 | 后端 | 前端 | 状态 |
|------|------|------|------|
| AI 商品助手 | `agent/agent_routes.py` | `pages/agent-assistant.tsx` | ✨ 新增 |
| Gemini 客户端 | `agent/gemini_client.py` | `lib/agent-api.ts` | ✨ 新增 |
| 信息提取器 | `agent/product_extractor.py` | - | ✨ 新增 |
| 图片处理 | `agent/image_processor.py` | - | ✨ 新增 |

## 🚀 启动顺序

### 1. 数据库
```bash
mysql -u root -p < database/version4_final.sql
```

### 2. 后端
```bash
cd backend
pip install -r requirements.txt
# 确保 .env 文件已创建并配置
python app.py
```
后端运行在: http://localhost:5000

### 3. 前端
```bash
cd frontend
npm install
npm run dev
```
前端运行在: http://localhost:5173

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目主文档 |
| [AGENT_SETUP_GUIDE.md](AGENT_SETUP_GUIDE.md) | AI 功能快速开始 |
| [backend/README_AGENT.md](backend/README_AGENT.md) | Agent 技术文档 |
| [backend/ENV_SETUP.md](backend/ENV_SETUP.md) | 环境配置详解 |
| [database/V4_DATABASE_GUIDE.md](database/V4_DATABASE_GUIDE.md) | 数据库指南 |
| [docs/CSV_IMPORT_GUIDE.md](docs/CSV_IMPORT_GUIDE.md) | CSV 导入指南 |

## 🔑 关键配置

### 必需配置
- ✅ Gemini API Key (用于 AI 功能)
- ✅ 数据库连接 (MySQL/MariaDB)

### 可选配置
- 图片上传限制
- AI 模型选择
- Flask 应用配置

## 📝 注意事项

1. **安全性**
   - `.env` 文件包含敏感信息，不要提交到 Git
   - 已添加到 `.gitignore`

2. **数据库版本**
   - 使用 `version4_final.sql` 初始化
   - 旧版本已移至 `archive/` 文件夹

3. **AI 功能**
   - 需要 Gemini API Key
   - 需要网络访问 Google 服务

4. **测试文件**
   - 已删除所有 `test-*.tsx` 文件
   - 如需测试，可以在 git 历史中找回

---

整理日期: 2025-10-09
项目版本: v2.0 (with AI Agent)

