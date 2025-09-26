import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Database,
  Package,
  Tag
} from "lucide-react"
import { toast } from "sonner"

export function SimpleImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 100 })
  const [importComplete, setImportComplete] = useState(false)

  // 处理CSV文件导入
  const handleImport = async () => {
    setIsImporting(true)
    setImportProgress({ current: 0, total: 100 })
    setImportComplete(false)

    try {
      // 模拟导入过程
      const steps = [
        { progress: 10, message: '开始导入...' },
        { progress: 20, message: '解析CSV文件...' },
        { progress: 30, message: '数据验证通过' },
        { progress: 40, message: '数据转换完成' },
        { progress: 50, message: '获取现有数据' },
        { progress: 60, message: '创建品牌...' },
        { progress: 70, message: '创建分类...' },
        { progress: 80, message: '创建商品...' },
        { progress: 90, message: '完成导入...' },
        { progress: 100, message: '导入完成' }
      ]

      for (const step of steps) {
        setImportProgress({ current: step.progress, total: 100 })
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setImportComplete(true)
      toast.success("导入完成！成功导入 200 种商品，创建了 28 个品牌和 16 个分类")

    } catch (error) {
      console.error('导入失败:', error)
      toast.error("导入过程中发生错误")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">简化版商品导入</h1>
        <p className="text-gray-600 mb-8">
          这个版本不依赖后端API，可以直接测试导入功能
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            商品数据导入
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 文件信息 */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">准备导入的文件</h3>
            <p className="text-blue-700">
              <FileText className="inline h-4 w-4 mr-2" />
              门店导出商品-导出结果 -猫狗日记-2025-09-21.csv
            </p>
            <p className="text-sm text-blue-600 mt-1">
              包含 996 条商品记录
            </p>
          </div>

          {/* 导入按钮 */}
          <div className="text-center">
            <Button
              onClick={handleImport}
              disabled={isImporting}
              size="lg"
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  导入中... ({importProgress.current}%)
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  开始导入
                </>
              )}
            </Button>
          </div>

          {/* 进度条 */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>导入进度</span>
                <span>{importProgress.current}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress.current}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 导入完成 */}
          {importComplete && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  导入完成
                </h3>
                <p className="text-green-700">
                  成功导入商品数据到系统中！
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">996</div>
                  <div className="text-sm text-green-600">总记录数</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">200</div>
                  <div className="text-sm text-blue-600">商品种类</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">28</div>
                  <div className="text-sm text-purple-600">品牌数量</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">16</div>
                  <div className="text-sm text-orange-600">分类数量</div>
                </div>
              </div>

              {/* 品牌列表 */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  创建的品牌
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Wanpy/顽皮', 'MYFOODIE/麦富迪', 'Alfie&Buddy/阿飞和巴弟',
                    'ROYAL CANIN/皇家', 'prominent/派得', '珍致', '冠能',
                    '网易严选', '纯福', '蓝氏', '江小傲', '鲜朗', '诚实一口',
                    '福丸', '吉萌萌', '那非普', '小宠', '中宠', '路斯',
                    '靓贝', '好命天生', '卓享', '王漂亮', '宠诺莎', '馨萌',
                    '瑞梦迪', '肉垫rodin', '贵族', '纯皓'
                  ].map(brand => (
                    <Badge key={brand} variant="secondary">
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 分类列表 */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  创建的分类
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    '宠物用品', '宠物服饰及配件', '宠物携带箱/背包',
                    '猫/狗食品', '猫零食', '猫粮', '狗零食', '狗粮',
                    '猫/狗卫生护理', '猫砂铲/猫砂盆', '香波浴液', '猫砂',
                    '猫/狗日用品', '宠物玩具', '乳制品', '其他类乳制品'
                  ].map(category => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">导入说明</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 这是一个演示版本，不实际连接数据库</li>
              <li>• 模拟了完整的导入流程</li>
              <li>• 实际使用时需要连接后端API</li>
              <li>• 导入完成后可以在商品管理页面查看</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
