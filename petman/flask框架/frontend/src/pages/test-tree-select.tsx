import { useState } from "react"
import { SimpleTreeSelect } from "@/components/ui/simple-tree-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// 模拟分类数据
const mockCategories = [
  {
    classify1_ID: 1,
    name: "宠物用品",
    parentID: null,
    level: 1
  },
  {
    classify1_ID: 2,
    name: "食品",
    parentID: 1,
    level: 2
  },
  {
    classify1_ID: 3,
    name: "玩具",
    parentID: 1,
    level: 2
  },
  {
    classify1_ID: 4,
    name: "护理用品",
    parentID: 1,
    level: 2
  },
  {
    classify1_ID: 5,
    name: "狗粮",
    parentID: 2,
    level: 3
  },
  {
    classify1_ID: 6,
    name: "猫粮",
    parentID: 2,
    level: 3
  }
]

export function TestTreeSelect() {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()

  const handleCategoryChange = (value: number) => {
    console.log('TestTreeSelect - handleCategoryChange:', value)
    setSelectedCategory(value)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>树形分类选择测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">选择分类:</label>
            <SimpleTreeSelect
              categories={mockCategories}
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              placeholder="请选择分类"
            />
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">当前选择:</h3>
            <p className="text-sm text-gray-600">
              {selectedCategory ? `分类ID: ${selectedCategory}` : '未选择分类'}
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium mb-2">测试说明:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 点击选择框可以展开分类树</li>
              <li>• 支持搜索分类名称</li>
              <li>• 选择分类后，选择框应该显示选中的分类名称</li>
              <li>• 查看浏览器控制台的调试信息</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
