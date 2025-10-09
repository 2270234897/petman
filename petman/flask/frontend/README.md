# PetMan 宠物管理系统

一个基于 Flask + React 的全栈宠物管理系统，包含客户管理、宠物管理、预约管理、库存管理等功能。

## 项目结构

```
petman-flask-framework/
├── backend/                    # 后端 Flask 应用
│   ├── app.py                 # Flask 主应用
│   ├── appointments_py.py     # 预约管理 API
│   ├── customers_py.py        # 客户管理 API
│   ├── inventory_py.py        # 库存管理 API
│   ├── pets.py               # 宠物管理 API
│   ├── static/               # 静态文件
│   └── templates/            # HTML 模板
├── frontend/                  # 前端 React 应用
│   ├── src/                  # 源代码
│   │   ├── components/       # React 组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API 服务
│   │   └── lib/             # 工具库
│   ├── public/              # 公共资源
│   ├── package.json         # 依赖配置
│   └── vite.config.ts       # Vite 配置
├── database/                 # 数据库相关文件
│   ├── version4_final.sql   # 最新数据库结构
│   ├── v3_to_v4_migration.sql # 版本迁移脚本
│   └── V4_DATABASE_GUIDE.md # 数据库指南
└── docs/                    # 文档
    └── CSV_IMPORT_GUIDE.md  # CSV 导入指南
```

## 功能特性

### 🐾 客户管理
- 客户信息录入和编辑
- 会员等级管理
- 会员余额管理
- 客户搜索和筛选

### 🐕 宠物管理
- 宠物档案管理
- 宠物基本信息维护
- 宠物与客户关联
- 宠物健康记录

### 📅 预约管理
- 预约创建和管理
- 服务项目管理
- 预约状态跟踪
- 预约日历视图

### 📦 库存管理
- 商品信息管理
- 品牌和分类管理
- 规格管理
- 库存入库和出库
- CSV 批量导入功能

## 技术栈

### 后端
- **Flask** - Python Web 框架
- **PyMySQL** - MySQL 数据库连接
- **MySQL** - 数据库

### 前端
- **React 19** - 前端框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Query** - 数据获取和状态管理
- **React Router** - 路由管理
- **Radix UI** - UI 组件库

## 快速开始

### 环境要求
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### 后端设置

1. 安装 Python 依赖
```bash
pip install flask pymysql
```

2. 配置数据库
```bash
# 创建数据库
mysql -u root -p < database/version4_final.sql
```

3. 修改数据库配置
编辑各个 Python 文件中的 `MYSQL_CONFIG` 配置：
```python
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'your_username',
    'password': 'your_password',
    'database': 'mydb',
    'charset': 'utf8mb4',
    'cursorclass': DictCursor,
}
```

4. 启动后端服务
```bash
python app.py
```

### 前端设置

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

## API 文档

### 客户管理 API
- `GET /api/customers/get` - 获取客户列表
- `POST /api/customers/post` - 创建客户
- `PUT /api/customers/put/{id}` - 更新客户
- `DELETE /api/customers/delete/{id}` - 删除客户

### 宠物管理 API
- `GET /api/pets/` - 获取宠物列表
- `POST /api/pets/post` - 创建宠物
- `PUT /api/pets/put/{id}` - 更新宠物
- `DELETE /api/pets/delete/{id}` - 删除宠物

### 预约管理 API
- `GET /api/appointments/get` - 获取预约列表
- `POST /api/appointments/post` - 创建预约
- `PUT /api/appointments/put/{id}` - 更新预约
- `DELETE /api/appointments/delete/{id}` - 删除预约

### 库存管理 API
- `GET /api/inventory/products` - 获取商品列表
- `POST /api/inventory/products` - 创建商品
- `PUT /api/inventory/products/{id}` - 更新商品
- `DELETE /api/inventory/products/{id}` - 删除商品

## 数据库结构

系统使用 MySQL 数据库，主要表结构包括：

- `customers` - 客户信息表
- `pets` - 宠物信息表
- `appointments` - 预约信息表
- `services` - 服务项目表
- `product` - 商品信息表
- `spec` - 商品规格表
- `brand` - 品牌表
- `classify_level1` - 分类表
- `stock_in` - 入库记录表

详细的数据库结构请参考 `database/V4_DATABASE_GUIDE.md`。

## 开发指南

### 代码规范
- 后端使用 Python PEP 8 规范
- 前端使用 TypeScript 严格模式
- 组件使用函数式组件和 Hooks
- API 使用 RESTful 设计

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 联系方式

如有问题，请通过 Issue 联系。