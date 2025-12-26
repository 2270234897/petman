# 数据库文件

## 📊 文件说明

- `version5.sql` - 数据库结构文件（MySQL/MariaDB）

## 🚀 使用方法

### 导入数据库

```bash
# 方法 1: 使用 MySQL 命令行
mysql -u root -p < version5.sql

# 方法 2: 使用 MySQL Workbench
# 打开 version5.sql 文件，执行所有 SQL 语句
```

### 创建数据库

如果数据库不存在，需要先创建：

```sql
CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mydb;
```

然后导入 SQL 文件。

## 📋 版本历史

### Version 5.1 (当前版本)

**主要更新：**
- ✅ 图片字段扩展：VARCHAR(500) → LONGTEXT（支持 base64 大图片）
- ✅ 库存管理优化：自动维护总库存
- ✅ 条码验证：允许同一商品不同规格使用相同条码
- ✅ AI 助手集成：优化品牌和分类匹配
- ✅ 性能优化：添加必要索引
- ✅ 商品货架字段：添加货架位置字段用于库存管理
- ✅ 封面图片修复：修复 API 查询中的 cover_image 字段

## 📁 数据库结构

主要数据表：
- `customers` - 客户信息
- `pets` - 宠物信息
- `appointments` - 预约信息
- `product` - 商品信息
- `spec` - 商品规格
- `stock_in` - 入库记录
- `order` - 订单信息
- `brand` - 品牌信息
- `dealer` - 供应商信息
- `classify_level1` - 分类信息

## ⚠️ 注意事项

1. **字符集**：数据库使用 `utf8mb4` 字符集，支持中文和 emoji
2. **备份**：导入前请备份现有数据
3. **权限**：确保数据库用户有创建表和索引的权限
4. **版本**：建议使用 MySQL 5.7+ 或 MariaDB 10.3+

## 🔧 配置说明

导入后，需要在后端配置文件中设置数据库连接信息：

```python
# backend/db_config.py 或 .env 文件
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mydb
```

