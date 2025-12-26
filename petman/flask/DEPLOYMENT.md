# 🚀 部署指南

## 📁 项目结构

```
petman/
├── .gitignore              # Git 忽略文件
├── .gitattributes          # Git 属性配置
├── README.md               # 项目说明
├── DEPLOYMENT.md           # 部署指南（本文件）
├── requirements.txt        # Python 依赖
│
├── database/               # 📊 数据库
│   ├── README.md          # 数据库说明
│   └── version5.sql        # 数据库结构文件
│
├── backend/                 # 🔧 后端（Flask）
│   ├── .gitignore         # 后端 Git 忽略文件
│   ├── app.py             # Flask 主应用
│   ├── db_config.py       # 数据库配置
│   ├── pets.py            # 宠物管理 API
│   ├── customers_py.py    # 客户管理 API
│   ├── appointments_py.py  # 预约管理 API
│   ├── inventory_py.py     # 库存管理 API
│   ├── static/            # 静态资源
│   └── templates/         # HTML 模板
│
├── frontend/               # 🎨 前端（React + Vite）
│   ├── .gitignore         # 前端 Git 忽略文件
│   ├── package.json       # 前端依赖配置
│   ├── vite.config.ts     # Vite 配置
│   ├── tsconfig.json       # TypeScript 配置
│   ├── index.html         # HTML 入口
│   ├── public/            # 公共资源
│   └── src/               # 源代码
│
└── archive/                # 📦 归档（已禁用的 AI 模块）
    └── ai_modules_disabled/
```

## 🛠️ 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/petman.git
cd petman
```

### 2. 数据库设置

```bash
# 导入数据库
mysql -u root -p < database/version5.sql
```

详细说明请查看：[database/README.md](database/README.md)

### 3. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 安装依赖
pip install -r ../requirements.txt

# 创建 .env 文件
# 复制 db_config.py 中的配置，或创建 .env 文件设置数据库连接

# 启动服务
python app.py
```

### 4. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📦 部署到生产环境

### 后端部署

1. **安装依赖**
   ```bash
   pip install -r requirements.txt
   pip install gunicorn  # 生产环境 WSGI 服务器
   ```

2. **配置环境变量**
   ```bash
   # 创建 .env 文件
   DB_HOST=your_db_host
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=mydb
   FLASK_ENV=production
   ```

3. **使用 Gunicorn 运行**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### 前端部署

1. **构建项目**
   ```bash
   cd frontend
   npm run build
   ```

2. **部署到 Nginx**
   - 将 `frontend/dist/` 目录内容复制到 Nginx 静态文件目录
   - 配置 Nginx 反向代理 API 请求到后端

详细部署说明请参考项目 README.md

## ⚠️ 注意事项

1. **不要提交敏感信息**
   - `.env` 文件已添加到 `.gitignore`
   - 数据库密码、API Key 等敏感信息不要提交到 Git

2. **依赖管理**
   - Python 依赖：`requirements.txt`
   - Node.js 依赖：`frontend/package.json`
   - `node_modules/` 和 `venv/` 已添加到 `.gitignore`

3. **缓存文件**
   - `__pycache__/` 已添加到 `.gitignore`
   - 构建输出 `dist/` 已添加到 `.gitignore`

## 📝 更新日志

- 2025-01-27: 项目整理完成，准备上传 GitHub
  - ✅ 创建根目录 `.gitignore`
  - ✅ 清理 Python 缓存文件
  - ✅ 删除临时文件
  - ✅ 创建数据库说明文档

