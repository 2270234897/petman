# 移动端 API 连接配置指南

## 问题：手机访问只显示虚假数据

### 原因分析

1. **API 地址配置问题**：前端默认使用 `http://localhost:5000`
   - 在桌面浏览器：`localhost` 指向本机，可以访问后端
   - 在手机浏览器：`localhost` 指向手机自己，无法访问电脑上的后端

2. **移动端示例页面**：之前使用了 mock 数据来演示效果

### 解决方案（已修复）

✅ 已更新移动端页面使用真实 API  
✅ 已创建环境变量配置文件

## 📱 快速修复步骤

### 1. 查看你的电脑 IP 地址

**Windows:**
```bash
ipconfig
```
找到 "IPv4 地址"，例如：`192.168.1.100`

**Mac/Linux:**
```bash
ifconfig
# 或
ip addr
```
找到类似 `192.168.x.x` 的地址

### 2. 创建前端环境配置

在 `frontend/` 目录创建 `.env.local` 文件：

```bash
cd frontend
```

**方法 A: 手动创建**
```env
# .env.local
VITE_API_BASE_URL=http://192.168.1.100:5000
```

**方法 B: 复制示例文件**
```bash
# 复制示例文件
cp .env.local.example .env.local

# 然后编辑 .env.local，替换为你的 IP
```

⚠️ **重要**：将 `192.168.1.100` 替换为你的实际 IP 地址！

### 3. 确保后端已启动并允许网络访问

**检查后端配置**（`backend/app.py`）：
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
    #                   ^^^^^^^^^^^^^^
    #                   这个很重要！允许网络访问
```

✅ 后端已经配置正确

**启动后端**：
```bash
cd backend
python app.py
```

你应该看到：
```
 * Running on http://0.0.0.0:5000
 * Running on http://192.168.1.100:5000  <-- 这个地址
```

### 4. 重启前端开发服务器

```bash
cd frontend
npm run dev
```

⚠️ **必须重启**：修改 `.env.local` 后必须重启开发服务器才能生效！

### 5. 测试连接

**在手机浏览器访问：**
```
http://你的电脑IP:5173
```

例如：`http://192.168.1.100:5173`

## ✅ 验证是否成功

### 测试清单

- [ ] 手机可以访问前端页面
- [ ] 首页显示真实的统计数据（不是固定的数字）
- [ ] 预约页面显示真实预约数据
- [ ] 可以看到数据加载动画
- [ ] 浏览器控制台没有 API 错误

### 如何判断连接成功

**成功的迹象：**
1. 首页统计数据会变化（基于真实数据）
2. 有数据加载动画（灰色骨架屏）
3. 预约页面显示数据库中的真实预约

**失败的迹象：**
1. 控制台显示 `ERR_CONNECTION_REFUSED`
2. 数据一直显示为 0 或空
3. 加载状态持续很久

## 🔧 高级配置

### 多环境配置

**开发环境（桌面）：**
```env
# .env.development
VITE_API_BASE_URL=http://localhost:5000
```

**移动端测试：**
```env
# .env.local (优先级最高)
VITE_API_BASE_URL=http://192.168.1.100:5000
```

**生产环境：**
```env
# .env.production
VITE_API_BASE_URL=https://your-domain.com
```

### 动态 IP 解决方案

如果你的 IP 经常变化，可以：

**方案 1: 设置静态 IP（推荐）**
- 在路由器设置中为你的电脑绑定固定 IP

**方案 2: 使用脚本自动获取 IP**

创建 `frontend/get-ip.js`:
```javascript
const os = require('os');
const fs = require('fs');

const interfaces = os.networkInterfaces();
let ip = 'localhost';

Object.keys(interfaces).forEach(name => {
  interfaces[name].forEach(iface => {
    if (iface.family === 'IPv4' && !iface.internal) {
      ip = iface.address;
    }
  });
});

const envContent = `VITE_API_BASE_URL=http://${ip}:5000\n`;
fs.writeFileSync('.env.local', envContent);
console.log(`✓ API URL 已设置为: http://${ip}:5000`);
```

使用：
```bash
cd frontend
node get-ip.js
npm run dev
```

## 🐛 常见问题

### Q1: 手机显示 "无法连接"

**可能原因：**
1. 手机和电脑不在同一 WiFi
2. 防火墙阻止了连接
3. IP 地址配置错误

**解决方法：**
```bash
# 1. 确认在同一 WiFi
# 2. Windows 防火墙设置
#    - 控制面板 → 防火墙 → 允许应用通过防火墙
#    - 添加 Python 和 Node.js

# 3. 测试后端是否可访问
# 在手机浏览器直接访问：
http://192.168.1.100:5000/api/customers/get
```

### Q2: CORS 错误

**后端已配置 CORS**：
```python
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

如果仍有问题，检查请求 URL 是否正确。

### Q3: 数据显示为 0

**检查：**
1. 数据库中是否有数据
2. 后端 API 是否正常返回数据
3. 浏览器控制台是否有错误

**测试后端：**
```bash
# 在电脑上测试
curl http://localhost:5000/api/customers/get

# 在手机浏览器测试
http://你的IP:5000/api/customers/get
```

### Q4: 桌面浏览器也无法访问了

**原因**：`.env.local` 会覆盖 `localhost` 配置

**解决方法 A**：也在桌面用 IP 访问
```
http://192.168.1.100:5173
```

**解决方法 B**：添加条件判断
修改 `frontend/src/lib/api-client.ts`:
```typescript
const getBaseURL = () => {
  // 生产环境
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || "https://your-domain.com";
  }
  
  // 开发环境 - 移动端测试
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 开发环境 - 默认
  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: getBaseURL(),
  // ...
});
```

## 📚 相关文件

- `frontend/.env.example` - 环境变量示例
- `frontend/.env.local.example` - 移动端配置示例
- `frontend/src/lib/api-client.ts` - API 客户端配置
- `frontend/src/services/api.ts` - API 接口定义
- `frontend/src/pages/mobile-dashboard.tsx` - 移动端首页（已更新）
- `frontend/src/pages/mobile-appointments.tsx` - 移动端预约页面（已更新）

## ✅ 验证更新

已修复的页面：
- ✅ `/` - 移动端首页（使用真实统计数据）
- ✅ `/appointments` - 预约页面（使用真实预约数据）
- ✅ `/customers` - 客户页面（原本就使用真实数据）
- ✅ `/inventory` - 库存页面（原本就使用真实数据）

## 🚀 下一步

1. **立即配置**：按照上面步骤创建 `.env.local`
2. **重启服务**：前端和后端都重启
3. **手机测试**：访问并验证数据
4. **如有问题**：查看浏览器控制台和后端日志

---

**配置完成后，你应该能在手机上看到真实的数据了！** 🎉

如果还有问题，请检查：
1. ✅ 电脑和手机在同一 WiFi
2. ✅ `.env.local` 中的 IP 地址正确
3. ✅ 后端使用 `host='0.0.0.0'` 启动
4. ✅ 防火墙允许端口 5000 和 5173
5. ✅ 重启了前端开发服务器



