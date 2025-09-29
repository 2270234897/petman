import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export function DebugAPI() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/test/connection')
      const data = await response.json()
      setTestResults(prev => ({ ...prev, connection: data }))
      toast.success("数据库连接测试完成")
    } catch (error) {
      console.error('连接测试失败:', error)
      toast.error("数据库连接测试失败")
    } finally {
      setIsLoading(false)
    }
  }

  const testTables = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/test/tables')
      const data = await response.json()
      setTestResults(prev => ({ ...prev, tables: data }))
      toast.success("表结构测试完成")
    } catch (error) {
      console.error('表结构测试失败:', error)
      toast.error("表结构测试失败")
    } finally {
      setIsLoading(false)
    }
  }

  const testSimpleProduct = async () => {
    setIsLoading(true)
    try {
      const testData = {
        product_name: "测试商品",
        classify_level1_classify1_ID: 1,
        brand_brandID: 1,
        product_baozhiqi: null,
        local: "测试描述"
      }
      
      const response = await fetch('http://localhost:5000/api/test/simple-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })
      
      const data = await response.json()
      setTestResults(prev => ({ ...prev, simpleProduct: data }))
      
      if (data.status === 'success') {
        toast.success("简单商品创建测试成功")
      } else {
        toast.error(`简单商品创建测试失败: ${data.message}`)
      }
    } catch (error) {
      console.error('简单商品创建测试失败:', error)
      toast.error("简单商品创建测试失败")
    } finally {
      setIsLoading(false)
    }
  }

  const testSpecCreation = async () => {
    setIsLoading(true)
    try {
      const testData = {
        product_id: 1, // 假设存在商品ID为1
        spec_type_id: 1,
        spec_name: "颜色",
        spec_value: "蓝色",
        barcode: "123456",
        picture: "",
        总库存: 10,
        unit: ""
      }
      
      const response = await fetch('http://localhost:5000/api/test/test-spec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })
      
      const data = await response.json()
      setTestResults(prev => ({ ...prev, specCreation: data }))
      
      if (data.status === 'success') {
        toast.success("规格创建测试成功")
      } else {
        toast.error(`规格创建测试失败: ${data.message}`)
      }
    } catch (error) {
      console.error('规格创建测试失败:', error)
      toast.error("规格创建测试失败")
    } finally {
      setIsLoading(false)
    }
  }

  const testFullProduct = async () => {
    setIsLoading(true)
    try {
      const testData = {
        product_name: "完整测试商品",
        classify_level1_classify1_ID: 1,
        brand_brandID: 1,
        product_baozhiqi: null,
        local: "完整测试描述",
        cover_image: "",
        specs: [
          {
            spec_type_id: 1,
            spec_name: "颜色",
            spec_value: "蓝色",
            barcode: "123456",
            picture: "",
            总库存: 10,
            unit: ""
          },
          {
            spec_type_id: 1,
            spec_name: "颜色",
            spec_value: "绿色",
            barcode: "123456", // 相同条形码
            picture: "",
            总库存: 15,
            unit: ""
          }
        ]
      }
      
      const response = await fetch('http://localhost:5000/api/inventory/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })
      
      const data = await response.json()
      setTestResults(prev => ({ ...prev, fullProduct: data }))
      
      if (data.status === 'success') {
        toast.success("完整商品创建测试成功")
      } else {
        toast.error(`完整商品创建测试失败: ${data.message}`)
      }
    } catch (error) {
      console.error('完整商品创建测试失败:', error)
      toast.error("完整商品创建测试失败")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>API调试工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              测试数据库连接
            </Button>
            
            <Button 
              onClick={testTables} 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              检查表结构
            </Button>
            
            <Button 
              onClick={testSimpleProduct} 
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              测试简单商品创建
            </Button>
            
            <Button 
              onClick={testSpecCreation} 
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              测试规格创建
            </Button>
            
            <Button 
              onClick={testFullProduct} 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              测试完整商品创建
            </Button>
          </div>
          
          {testResults && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">测试结果:</h3>
              
              {testResults.connection && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium mb-2">数据库连接测试:</h4>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(testResults.connection, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResults.tables && (
                <div className="p-4 bg-green-50 rounded-md">
                  <h4 className="font-medium mb-2">表结构检查:</h4>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(testResults.tables, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResults.simpleProduct && (
                <div className="p-4 bg-yellow-50 rounded-md">
                  <h4 className="font-medium mb-2">简单商品创建测试:</h4>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(testResults.simpleProduct, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResults.specCreation && (
                <div className="p-4 bg-purple-50 rounded-md">
                  <h4 className="font-medium mb-2">规格创建测试:</h4>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(testResults.specCreation, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResults.fullProduct && (
                <div className="p-4 bg-red-50 rounded-md">
                  <h4 className="font-medium mb-2">完整商品创建测试:</h4>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(testResults.fullProduct, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">使用说明:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>首先测试数据库连接，确保后端服务正常</li>
              <li>检查表结构，确认数据库表是否正确</li>
              <li>测试简单商品创建，验证基本功能</li>
              <li>测试规格创建，验证规格相关功能</li>
              <li>最后测试完整商品创建，找出具体问题</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
