import { useState } from "react"

export function TestPage() {
  const [count, setCount] = useState(0)

  return (
    <div className="container mx-auto py-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-green-600">
          🎉 前端应用正常运行！
        </h1>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">测试计数器</h2>
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {count}
          </div>
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            点击增加
          </button>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">✅ 系统状态</h3>
          <ul className="text-left space-y-2">
            <li>✅ React 组件正常渲染</li>
            <li>✅ TypeScript 编译正常</li>
            <li>✅ 路由系统正常工作</li>
            <li>✅ 状态管理正常工作</li>
            <li>✅ 样式系统正常工作</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">🔗 快速链接</h3>
          <div className="space-x-4">
            <a 
              href="/quick-import" 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-block"
            >
              快速导入页面
            </a>
            <a 
              href="/inventory/import" 
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-block"
            >
              标准导入页面
            </a>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">⚠️ 如果页面空白</h3>
          <p className="text-left">
            如果主页面显示空白，可能是因为：
          </p>
          <ul className="text-left space-y-1 mt-2">
            <li>• 后端API连接问题</li>
            <li>• 数据库连接问题</li>
            <li>• 某些组件加载失败</li>
          </ul>
          <p className="text-left mt-2">
            但是导入功能应该可以正常工作，因为它不依赖后端数据。
          </p>
        </div>
      </div>
    </div>
  )
}
