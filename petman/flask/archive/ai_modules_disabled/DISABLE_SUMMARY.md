# AI模块禁用总结

## 📋 禁用时间
2025-01-21

## 🎯 禁用的功能模块

### 1. 智能搜索建商品
- 页面：`frontend/src/pages/smart-search.tsx`
- 功能：AI联网搜索并自动创建商品实体

### 2. AI商品助手
- 页面：`frontend/src/pages/agent-assistant.tsx`
- 功能：自然语言录入商品信息

### 3. 图片识别
- 页面：`frontend/src/pages/image-recognition.tsx`
- 功能：上传商品照片自动提取信息

### 4. 批量导入模块
- 组件：`frontend/src/components/agent/`
- 功能：AI辅助的商品批量导入

## 📁 移动的文件

### 后端文件
- `backend/agent/` → `archive/ai_modules_disabled/backend_agent/`
  - `agent_routes.py` - Agent API 路由
  - `gemini_client.py` - Gemini API 客户端
  - `product_extractor.py` - 商品信息提取
  - `image_processor.py` - 图片处理
  - `web_search_agent.py` - 网络搜索智能体
  - `web_search_routes.py` - 网络搜索路由
  - `config.py` - 配置管理
  - `__init__.py` - 模块初始化

### 前端页面
- `frontend/src/pages/agent-assistant.tsx` → `archive/ai_modules_disabled/frontend_ai_pages/`
- `frontend/src/pages/smart-search.tsx` → `archive/ai_modules_disabled/frontend_ai_pages/`
- `frontend/src/pages/image-recognition.tsx` → `archive/ai_modules_disabled/frontend_ai_pages/`

### 前端组件
- `frontend/src/components/agent/` → `archive/ai_modules_disabled/frontend_ai_components/`
- `frontend/src/components/inventory/image-recognition.test.tsx` → `archive/ai_modules_disabled/frontend_ai_components/`

### 文档文件
- `docs/AGENT_SETUP_GUIDE.md` → `archive/ai_modules_disabled/ai_docs/`
- `docs/SMART_SEARCH_GUIDE.md` → `archive/ai_modules_disabled/ai_docs/`
- `docs/AI_ASSISTANT_INTEGRATION.md` → `archive/ai_modules_disabled/ai_docs/`
- `docs/VOICE_RECOGNITION_GUIDE.md` → `archive/ai_modules_disabled/ai_docs/`
- `docs/GEMINI_API_SETUP.md` → `archive/ai_modules_disabled/ai_docs/`
- `backend/README_AGENT.md` → `archive/ai_modules_disabled/ai_docs/`

## 🔧 修改的配置文件

### 后端配置
- `backend/app.py` - 注释掉AI相关的导入和蓝图注册
- `requirements.txt` - 注释掉AI相关的依赖包

### 前端配置
- `frontend/src/App.tsx` - 注释掉AI页面的导入和路由
- `frontend/src/components/layout/sidebar.tsx` - 移除AI导航项
- `frontend/src/components/layout/responsive-sidebar.tsx` - 移除AI工具项
- `frontend/src/components/layout/mobile-sidebar.tsx` - 移除AI工具项

### 文档更新
- `README.md` - 更新项目描述，移除AI功能说明

## 🚫 禁用的API路由

- `/api/agent/*` - 所有Agent相关的API路由
- `/api/agent/health` - 健康检查
- `/api/agent/extract-from-text` - 文本提取
- `/api/agent/extract-from-image` - 图片识别
- `/api/agent/extract-mixed` - 混合输入
- `/api/agent/chat` - 对话交互
- `/api/agent/save-product` - 保存商品

## 📦 注释的依赖包

- `google-generativeai==0.8.3` - Google Gemini AI SDK
- `Pillow==11.0.0` - 图片处理库

## 🔄 恢复方法

如果需要恢复AI功能，可以：

1. 将 `archive/ai_modules_disabled/` 下的文件移回原位置
2. 取消注释相关配置文件中的代码
3. 重新安装AI相关的依赖包
4. 配置必要的环境变量（如GEMINI_API_KEY）

## 📝 注意事项

- 所有AI相关的代码都已保存，可以随时恢复
- 项目现在专注于传统的宠物店管理功能
- 数据库结构保持不变，只是前端界面和API路由被禁用
- 如果需要使用AI功能，请参考归档中的相关文档
