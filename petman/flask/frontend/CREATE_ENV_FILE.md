# 📝 创建 .env.local 配置文件

## 快速操作（复制粘贴）

根据你的 Vite 输出，你的 IP 地址是：**192.168.1.11**

### 方法 1: PowerShell 命令（推荐）

在 `frontend` 目录运行：

```powershell
@"
# 移动端 API 配置
# 你的电脑 IP: 192.168.1.11

VITE_API_BASE_URL=http://192.168.1.11:5000
"@ | Out-File -FilePath .env.local -Encoding utf8
```

### 方法 2: 手动创建

1. 在 `frontend` 目录创建文件：`.env.local`
2. 文件内容：

```env
VITE_API_BASE_URL=http://192.168.1.11:5000
```

### 方法 3: 使用记事本

```powershell
notepad .env.local
```

然后粘贴：
```
VITE_API_BASE_URL=http://192.168.1.11:5000
```

保存并关闭。

## ⚠️ 创建后必须重启前端！

```powershell
# 在前端目录按 Ctrl+C 停止服务器
# 然后重新启动
npm run dev
```

## ✅ 验证

重启后，在手机浏览器访问：
```
http://192.168.1.11:5173
```

应该能看到真实数据了！



