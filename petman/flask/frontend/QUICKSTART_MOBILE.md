# 移动端快速开始（5分钟上手）

## 🚀 快速测试

### 1. 配置 API 地址（仅首次，1分钟）

**自动配置（推荐）：**
```bash
cd frontend
node get-ip.js
# 会自动生成 .env.local 文件
```

**手动配置：**
```bash
# 1. 查看你的 IP
# Windows: ipconfig
# Mac: ifconfig

# 2. 创建 .env.local 文件
echo "VITE_API_BASE_URL=http://你的IP:5000" > .env.local
# 例如: VITE_API_BASE_URL=http://192.168.1.100:5000
```

### 2. 启动服务（1分钟）

**启动后端：**
```bash
cd backend
python app.py
```

**启动前端：**
```bash
cd frontend
npm install  # 首次运行
npm run dev
```

### 3. 测试移动端（2分钟）

**方法 A：浏览器模拟器**
1. 打开 http://localhost:5173
2. 按 F12 打开开发者工具
3. 点击设备图标（或 Ctrl+Shift+M）
4. 选择手机型号（如 iPhone 12）

**方法 B：手机真机测试**
1. 确保手机和电脑在同一 WiFi
2. 查看 `.env.local` 中的 IP 地址
3. 手机浏览器访问：`http://你的IP:5173`

⚠️ **重要**：如果看不到真实数据，请参考 [API 连接配置指南](../MOBILE_API_SETUP.md)

### 3. 体验功能（2分钟）

✅ 查看移动端专用布局  
✅ 点击底部导航切换页面  
✅ 打开侧边栏查看更多功能  
✅ 下拉刷新（在列表页面）  
✅ 点击右下角浮动按钮  

## 📱 生成图标（可选）

PWA 安装需要图标，快速生成：

```bash
# 1. 准备一个 512x512 的图标
# 保存为 frontend/public/source-icon.png

# 2. 安装依赖（仅需一次）
cd frontend
npm install sharp --save-dev

# 3. 生成所有尺寸
node ../scripts/generate-icons.js
```

或使用在线工具：
- 访问 https://www.pwabuilder.com/imageGenerator
- 上传图标，下载生成的文件
- 解压到 `frontend/public/icons/`

## 🎯 关键文件位置

```
frontend/src/
├── App.tsx                  # 已配置移动端自动切换
├── components/layout/
│   ├── mobile-layout.tsx    # 移动端布局
│   └── mobile-bottom-nav.tsx # 底部导航
├── pages/
│   └── mobile-dashboard.tsx # 移动端首页
└── hooks/
    └── useMobile.ts         # 移动端检测
```

## 🔥 立即可用的组件

### 检测移动端

```tsx
import { useMobile } from '@/hooks/useMobile';

function MyComponent() {
  const isMobile = useMobile();
  return <div>{isMobile ? '移动端' : '桌面端'}</div>;
}
```

### 使用移动卡片

```tsx
import { MobileCard } from '@/components/ui/mobile-card';

<MobileCard>
  <h3>标题</h3>
  <p>内容</p>
</MobileCard>
```

### 添加浮动按钮

```tsx
import { MobileFAB } from '@/components/ui/mobile-fab';
import { Plus } from 'lucide-react';

<MobileFAB 
  onClick={() => console.log('点击')}
  icon={<Plus />}
  label="添加"
/>
```

## 💡 测试 PWA 安装

1. **Chrome 浏览器**
   - 地址栏会显示安装图标
   - 点击安装即可

2. **移动端**
   - 页面底部会显示"安装应用"横幅
   - 点击"立即安装"

3. **验证安装**
   - 主屏幕会出现应用图标
   - 点击图标以独立窗口打开

## 🎨 自定义主题色

修改 `frontend/public/manifest.json`:

```json
{
  "theme_color": "#你的颜色",
  "background_color": "#你的背景色"
}
```

## 🐛 常见问题

**Q: 移动端布局没显示？**  
A: 缩小浏览器窗口到 < 768px，或使用设备模拟器

**Q: PWA 无法安装？**  
A: 需要先生成图标（参见上面的图标生成步骤）

**Q: Service Worker 不更新？**  
A: Chrome DevTools → Application → Service Workers → 点击 "Unregister"，然后刷新

**Q: 移动端样式错乱？**  
A: 确保 `frontend/src/index.css` 导入了 `mobile.css`

## 📚 详细文档

- [完整部署指南](../MOBILE_DEPLOYMENT_GUIDE.md)
- [用户使用指南](../docs/MOBILE_GUIDE.md)
- [开发者指南](./README_MOBILE.md)

## ✨ 就这么简单！

现在你可以：
- ✅ 在浏览器模拟器中测试移动端
- ✅ 在真实手机上测试
- ✅ 使用所有移动端组件
- ✅ 安装为 PWA 应用

**开始构建你的移动端功能吧！** 🚀

