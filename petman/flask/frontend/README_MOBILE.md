# 移动端开发快速指南

## 快速开始

### 1. 启动开发服务器
```bash
cd frontend
npm install  # 首次运行
npm run dev
```

### 2. 在移动设备上测试

#### 方法一：使用局域网访问
```bash
# 开发服务器会自动允许网络访问
# 在手机浏览器中访问：
http://你的电脑IP:5173

# 查看你的 IP 地址：
# Windows: ipconfig
# Mac/Linux: ifconfig
```

#### 方法二：使用浏览器开发工具
- Chrome: F12 → 设备模拟器 (Ctrl+Shift+M)
- Firefox: F12 → 响应式设计模式 (Ctrl+Shift+M)

## 移动端开发资源

### 核心文件

```
frontend/
├── src/
│   ├── hooks/
│   │   └── useMobile.ts              # 移动端检测
│   ├── components/
│   │   ├── layout/
│   │   │   ├── mobile-layout.tsx           # 移动端布局
│   │   │   ├── mobile-header.tsx           # 顶部导航
│   │   │   ├── mobile-bottom-nav.tsx       # 底部导航
│   │   │   └── mobile-sidebar.tsx          # 侧边栏
│   │   └── ui/
│   │       ├── mobile-card.tsx             # 卡片组件
│   │       ├── mobile-fab.tsx              # 浮动按钮
│   │       └── mobile-pull-to-refresh.tsx  # 下拉刷新
│   ├── pages/
│   │   ├── mobile-dashboard.tsx      # 移动端首页
│   │   └── mobile-appointments.tsx   # 移动端预约页面示例
│   ├── lib/
│   │   └── pwa.ts                    # PWA 功能
│   └── styles/
│       └── mobile.css                # 移动端样式
├── public/
│   ├── manifest.json                 # PWA 配置
│   ├── sw.js                         # Service Worker
│   └── icons/                        # 应用图标
└── vite.config.ts                    # Vite 配置
```

### 使用移动端 Hooks

```typescript
import { useMobile, useDeviceType, useTouchDevice } from "@/hooks/useMobile";

function MyComponent() {
  const isMobile = useMobile(768);  // 768px 断点
  const deviceType = useDeviceType(); // 'mobile' | 'tablet' | 'desktop'
  const isTouch = useTouchDevice();   // 是否触摸设备
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### 创建移动端页面

```typescript
import { MobileCard, MobileCardHeader, MobileCardTitle, MobileCardContent } from "@/components/ui/mobile-card";
import { MobileFAB } from "@/components/ui/mobile-fab";
import { Plus } from "lucide-react";

export function MyMobilePage() {
  return (
    <div className="space-y-4 pb-4">
      {/* 页面内容 */}
      <MobileCard>
        <MobileCardHeader>
          <MobileCardTitle>标题</MobileCardTitle>
        </MobileCardHeader>
        <MobileCardContent>
          内容...
        </MobileCardContent>
      </MobileCard>
      
      {/* 浮动操作按钮 */}
      <MobileFAB 
        onClick={() => console.log('Add')}
        icon={<Plus />}
        label="添加"
      />
    </div>
  );
}
```

## 响应式设计

### Tailwind CSS 断点

```typescript
// 移动端优先设计
<div className="
  w-full              {/* 默认：全宽 */}
  md:w-1/2            {/* 平板：50% */}
  lg:w-1/3            {/* 桌面：33% */}
">
  内容
</div>

// 断点说明：
// sm: 640px   - 小型手机横屏
// md: 768px   - 平板竖屏
// lg: 1024px  - 平板横屏 / 小笔记本
// xl: 1280px  - 桌面
// 2xl: 1536px - 大屏幕
```

### 隐藏/显示元素

```typescript
// 仅移动端显示
<div className="block md:hidden">
  移动端内容
</div>

// 仅桌面端显示
<div className="hidden md:block">
  桌面端内容
</div>
```

## PWA 功能

### 检测 PWA 安装状态

```typescript
import { isPWAInstalled, setupPWAInstall, showPWAInstallPrompt } from "@/lib/pwa";

function MyComponent() {
  const [canInstall, setCanInstall] = useState(false);
  
  useEffect(() => {
    // 检查是否已安装
    if (isPWAInstalled()) {
      console.log('PWA 已安装');
      return;
    }
    
    // 监听安装提示
    setupPWAInstall((available) => {
      setCanInstall(available);
    });
  }, []);
  
  const handleInstall = async () => {
    const installed = await showPWAInstallPrompt();
    if (installed) {
      console.log('安装成功');
    }
  };
  
  return canInstall && (
    <button onClick={handleInstall}>
      安装应用
    </button>
  );
}
```

### 通知功能

```typescript
import { requestNotificationPermission, showNotification } from "@/lib/pwa";

// 请求通知权限
const permission = await requestNotificationPermission();
if (permission === 'granted') {
  // 显示通知
  showNotification('新预约', {
    body: '您有一个新的预约',
    icon: '/icons/icon-192x192.png',
  });
}
```

## 性能优化

### 图片优化

```typescript
// 使用懒加载
<img 
  src="/path/to/image.jpg"
  loading="lazy"
  alt="描述"
/>

// 响应式图片
<picture>
  <source 
    media="(max-width: 640px)" 
    srcset="/path/to/mobile.jpg"
  />
  <source 
    media="(min-width: 641px)" 
    srcset="/path/to/desktop.jpg"
  />
  <img src="/path/to/fallback.jpg" alt="描述" />
</picture>
```

### 代码分割

```typescript
// 路由级别代码分割（已配置）
import { lazy, Suspense } from 'react';

const MobilePage = lazy(() => import('@/pages/mobile-page'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <MobilePage />
    </Suspense>
  );
}
```

## 调试技巧

### Chrome DevTools

1. **设备模拟**
   - F12 → 点击设备图标 (Ctrl+Shift+M)
   - 选择设备类型（iPhone, Android 等）
   - 测试不同屏幕尺寸和 DPR

2. **网络限速**
   - Network 标签 → Throttling
   - 选择 "Slow 3G" 测试慢速网络

3. **PWA 调试**
   - Application 标签
   - Manifest: 查看 PWA 配置
   - Service Workers: 管理 SW
   - Cache Storage: 查看缓存

### 真机调试

#### Android (Chrome)
1. 启用 USB 调试
2. 连接电脑
3. Chrome 访问 `chrome://inspect`
4. 选择设备进行调试

#### iOS (Safari)
1. 设置 → Safari → 高级 → 网页检查器
2. Mac 上打开 Safari → 开发菜单
3. 选择你的 iOS 设备

## 常见问题

### 1. 移动端样式不生效
```typescript
// 确保导入了移动端样式
import '@/styles/mobile.css';

// 使用移动端专用类名
<div className="touch-target safe-bottom">
  ...
</div>
```

### 2. 触摸事件不响应
```typescript
// 使用正确的事件处理
<div 
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  ...
</div>
```

### 3. iOS 上输入框放大
```typescript
// 在 index.html 中已配置，如果仍有问题：
input {
  font-size: 16px !important; /* iOS 最小字体 16px 防止放大 */}
```

### 4. Service Worker 不更新
```bash
# 开发时禁用 SW 缓存
# Chrome DevTools → Application → Service Workers
# ✓ Update on reload
# 点击 "Unregister" 强制更新
```

## 测试清单

- [ ] 不同屏幕尺寸测试 (320px - 768px)
- [ ] 横屏/竖屏切换
- [ ] 触摸操作（点击、滑动、长按）
- [ ] PWA 安装流程
- [ ] 离线功能
- [ ] 下拉刷新
- [ ] 底部导航切换
- [ ] 侧边栏打开/关闭
- [ ] 表单输入体验
- [ ] 图片加载
- [ ] 网络异常处理
- [ ] 性能（LCP < 2.5s）

## 部署

### 构建生产版本
```bash
cd frontend
npm run build
```

### 验证 PWA 配置
```bash
# 使用 Lighthouse 审计
# Chrome DevTools → Lighthouse → Progressive Web App
```

### 部署检查
- [ ] HTTPS 启用（PWA 必需）
- [ ] manifest.json 可访问
- [ ] Service Worker 正常注册
- [ ] 图标文件存在
- [ ] 缓存策略配置正确

## 资源链接

- [MDN PWA 指南](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React 移动端最佳实践](https://react.dev/)

---

**注意**：移动端开发需要在真机上测试，模拟器无法完全反映真实体验。



