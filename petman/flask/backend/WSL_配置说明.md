# WSL数据库配置说明

## ✅ 已完成的修改

### 1. 创建统一数据库配置文件
已创建 `backend/db_config.py`，所有后端文件现在使用统一配置。

**配置内容：**
```python
MYSQL_CONFIG = {
    'host': 'localhost',  # WSL环境下使用localhost
    'port': 3306,
    'user': 'FANG',
    'password': 'Fang11243.',
    'database': 'mydb',
    'charset': 'utf8mb4',
}
```

### 2. 修改的后端文件
以下文件已更新为使用统一配置：
- ✅ `backend/appointments_py.py`
- ✅ `backend/customers_py.py`
- ✅ `backend/inventory_py.py`
- ✅ `backend/pets.py`

### 3. 数据库连接测试
✅ 数据库连接测试通过！
- MySQL版本: 8.0.43
- 数据库: mydb
- 16个表全部可访问
- 所有核心表（customers、products、pets等）正常

---

## 🚀 如何启动和测试

### 1. 确保WSL中的MySQL正在运行
```bash
# 在WSL中运行
sudo service mysql status
# 如果未运行，启动它：
sudo service mysql start
```

### 2. 测试数据库连接
```bash
# 在Windows PowerShell或命令提示符中运行
cd D:\python\petman\flask
python backend/test_db_connection.py
```

**预期输出：**
```
[成功] 数据库连接成功！
MySQL版本: 8.0.43
当前数据库: mydb
数据库中的表 (共16个)
...
[成功] 所有测试通过！数据库连接正常
```

### 3. 启动Flask后端服务
```bash
cd D:\python\petman\flask
python backend/app.py
```

**预期输出：**
```
静态文件目录: ...
模板目录: ...
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

### 4. 测试API端点

#### 方法1: 使用浏览器
打开浏览器访问：
- http://localhost:5000/ (主页)
- http://localhost:5000/api/customers/get (客户列表)
- http://localhost:5000/api/pets/ (宠物列表)
- http://localhost:5000/api/inventory/products (产品列表)

#### 方法2: 使用Python测试脚本
```bash
# 确保Flask服务正在运行，然后在新的终端窗口运行：
python backend/test_api.py
```

#### 方法3: 使用curl (PowerShell)
```powershell
# 测试客户API
Invoke-WebRequest -Uri "http://localhost:5000/api/customers/get" | Select-Object -ExpandProperty Content

# 测试宠物API
Invoke-WebRequest -Uri "http://localhost:5000/api/pets/" | Select-Object -ExpandProperty Content
```

---

## 🔧 环境变量配置（可选）

如果需要更改数据库配置，可以创建 `.env` 文件：

```bash
# 创建 .env 文件（在项目根目录）
DB_HOST=localhost
DB_PORT=3306
DB_USER=FANG
DB_PASSWORD=Fang11243.
DB_NAME=mydb
```

---

## ⚠️ 故障排除

### 问题1: 无法连接到数据库
**症状:** `[失败] 数据库连接失败 (OperationalError)`

**解决方法:**
1. 检查WSL中MySQL是否运行：
   ```bash
   wsl sudo service mysql status
   ```

2. 检查MySQL绑定地址：
   ```bash
   wsl cat /etc/mysql/mysql.conf.d/mysqld.cnf | grep bind-address
   ```
   应该是 `bind-address = 0.0.0.0` 或 `bind-address = 127.0.0.1`

3. 重启MySQL服务：
   ```bash
   wsl sudo service mysql restart
   ```

### 问题2: localhost不工作
如果 `localhost` 无法连接，尝试使用WSL的IP地址：

1. 获取WSL IP:
   ```powershell
   wsl hostname -I
   ```

2. 修改 `backend/db_config.py`:
   ```python
   MYSQL_CONFIG = {
       'host': '172.x.x.x',  # 使用上面获取的IP
       ...
   }
   ```

### 问题3: 端口被占用
**症状:** `Address already in use`

**解决方法:**
```powershell
# 查找占用5000端口的进程
netstat -ano | findstr :5000

# 结束该进程
taskkill /PID <进程ID> /F
```

---

## 📊 数据库表结构

当前数据库包含以下16个表：
- appointments (预约)
- brand (品牌)
- brand_has_dealer (品牌经销商关系)
- classify_level1 (分类)
- customers (客户)
- dealer (经销商)
- membership_recharge (会员充值)
- order (订单)
- order_deatil (订单详情)
- pets (宠物)
- product (产品)
- services (服务)
- spec (规格)
- spec_type (规格类型)
- stock_in (入库)
- stock_in_detail (入库详情)

---

## ✨ 下一步

1. **启动前端** (如果有React前端)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **添加测试数据** (如需要)
   - 可以手动通过API添加
   - 或导入之前的数据备份

3. **生产环境配置**
   - 考虑使用环境变量管理敏感信息
   - 配置HTTPS
   - 设置防火墙规则

---

## 📝 备注

- 当前配置适用于开发环境
- 生产环境建议使用环境变量或配置文件管理数据库密码
- WSL2会自动进行端口转发，所以Windows可以直接访问WSL中的MySQL



