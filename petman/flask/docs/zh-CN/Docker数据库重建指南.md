# Docker 数据库重建指南

## 🐳 适用于Docker环境的数据库重建

---

## 方法1：使用PowerShell脚本（推荐）

```powershell
.\rebuild_database_docker.ps1
```

脚本会自动：
1. ✅ 检查Docker是否运行
2. ✅ 查找MySQL容器
3. ✅ 复制SQL文件到容器
4. ✅ 执行SQL脚本
5. ✅ 清理临时文件

---

## 方法2：手动执行命令

### 步骤1：查找MySQL容器名称
```powershell
docker ps
```

找到MySQL容器的名称，例如：`mysql_container` 或 `petman-mysql`

### 步骤2：复制SQL文件到容器
```powershell
docker cp database\version5.sql <容器名称>:/tmp/version5.sql
```

### 步骤3：执行SQL脚本
```powershell
docker exec -i <容器名称> mysql -u root -p < database\version5.sql
```

或者：
```powershell
docker exec -it <容器名称> bash
mysql -u root -p
source /tmp/version5.sql
exit
exit
```

### 步骤4：清理临时文件
```powershell
docker exec <容器名称> rm /tmp/version5.sql
```

---

## 方法3：使用Docker Compose（如果有）

### 步骤1：停止服务
```powershell
docker-compose down
```

### 步骤2：删除数据卷（可选，会清除所有数据）
```powershell
docker-compose down -v
```

### 步骤3：重新启动
```powershell
docker-compose up -d
```

### 步骤4：执行SQL脚本
```powershell
docker-compose exec mysql mysql -u root -p < database\version5.sql
```

---

## 常见Docker容器名称

可能的容器名称：
- `mysql`
- `mysql_container`
- `petman-mysql`
- `flask-mysql`
- `db`
- `database`

---

## 快速命令示例

### 假设容器名为 `mysql`

```powershell
# 1. 复制SQL文件
docker cp database\version5.sql mysql:/tmp/version5.sql

# 2. 执行SQL（会提示输入密码）
docker exec -i mysql mysql -u root -p -e "source /tmp/version5.sql"

# 3. 或者进入容器手动执行
docker exec -it mysql bash
mysql -u root -p
source /tmp/version5.sql;
exit
exit
```

---

## 验证数据库

### 进入MySQL容器
```powershell
docker exec -it <容器名称> mysql -u root -p
```

### 检查数据库
```sql
-- 查看数据库
SHOW DATABASES;

-- 使用数据库
USE mydb;

-- 查看表
SHOW TABLES;

-- 查看示例数据
SELECT * FROM brand;
SELECT * FROM classify_level1;

-- 查看库存视图
SELECT * FROM v_product_stock_summary;

-- 测试存储过程
CALL sync_stock_from_records();

-- 退出
exit
```

---

## 常见问题

### Q1: 找不到MySQL容器？
```powershell
# 查看所有运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 启动停止的容器
docker start <容器名称>
```

### Q2: 容器内没有bash？
```powershell
# 使用sh代替bash
docker exec -it <容器名称> sh

# 或者直接执行mysql
docker exec -it <容器名称> mysql -u root -p
```

### Q3: 密码错误？
```powershell
# 查看Docker Compose配置中的密码
cat docker-compose.yml

# 或者重置MySQL密码
docker exec -it <容器名称> mysql -u root
```

### Q4: 权限被拒绝？
```powershell
# 使用管理员权限运行PowerShell
# 右键点击PowerShell -> 以管理员身份运行
```

---

## Docker环境特殊说明

### 数据持久化
如果Docker容器使用了数据卷（volume），数据会保留在：
```
docker volume ls
docker volume inspect <volume_name>
```

### 完全清空数据
```powershell
# 1. 停止容器
docker stop <容器名称>

# 2. 删除容器和数据卷
docker rm -v <容器名称>

# 3. 重新创建容器
docker-compose up -d
# 或
docker run -d --name mysql ...

# 4. 执行Version 5.0脚本
docker cp database\version5.sql mysql:/tmp/version5.sql
docker exec -i mysql mysql -u root -pYOUR_PASSWORD -e "source /tmp/version5.sql"
```

---

## 推荐工作流程

### 1. 自动化脚本（最简单）
```powershell
.\rebuild_database_docker.ps1
```

### 2. 手动执行（更可控）
```powershell
# 设置变量
$CONTAINER = "你的MySQL容器名"
$PASSWORD = "你的MySQL密码"

# 复制文件
docker cp database\version5.sql ${CONTAINER}:/tmp/version5.sql

# 执行SQL
docker exec -i $CONTAINER mysql -u root -p$PASSWORD -e "source /tmp/version5.sql"

# 清理
docker exec $CONTAINER rm /tmp/version5.sql
```

### 3. 交互式执行（最安全）
```powershell
# 进入容器
docker exec -it <容器名> bash

# 在容器内执行
cd /tmp
mysql -u root -p

# 在MySQL中执行
source /tmp/version5.sql;
exit

# 退出容器
exit
```

---

## 🎯 立即开始

### 选择适合你的方法：

**方法A：自动脚本**
```powershell
.\rebuild_database_docker.ps1
```

**方法B：手动命令（推荐）**
```powershell
# 1. 查看容器
docker ps

# 2. 复制SQL文件（替换<容器名>）
docker cp database\version5.sql <容器名>:/tmp/version5.sql

# 3. 执行SQL（会提示输入密码）
docker exec -it <容器名> mysql -u root -p -e "source /tmp/version5.sql"

# 4. 重启后端
.\start-backend.ps1
```

---

## 验证成功

执行后应该看到类似输出：
```
...
数据库Version 5.0创建成功！
主要更新：
1. 图片字段扩容为LONGTEXT（支持base64大图片）
2. 品牌表增加自增和唯一约束
...
```

然后：
```powershell
# 验证数据库
docker exec -it <容器名> mysql -u root -p -e "USE mydb; SHOW TABLES;"
```

---

## 常用Docker命令

```powershell
# 查看MySQL容器日志
docker logs <容器名>

# 查看容器详细信息
docker inspect <容器名>

# 重启MySQL容器
docker restart <容器名>

# 进入容器shell
docker exec -it <容器名> bash

# 备份数据库
docker exec <容器名> mysqldump -u root -p密码 mydb > backup.sql

# 恢复数据库
docker exec -i <容器名> mysql -u root -p密码 mydb < backup.sql
```

---

## 完成！

重建成功后：

1. ✅ 重启后端服务
   ```powershell
   .\start-backend.ps1
   ```

2. ✅ 打开浏览器测试

3. ✅ 享受Version 5.0的新功能！

---

**Docker环境数据库重建完成！** 🐳🎉

*更新时间：2025-10-10*

