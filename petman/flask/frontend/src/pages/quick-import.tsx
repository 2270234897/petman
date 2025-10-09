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
import { quickImport } from "@/lib/direct-import"

interface ImportStats {
  totalRows: number
  brands: string[]
  categories: string[]
  products: number
  errors: string[]
}

export function QuickImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })

  // 处理CSV文件导入
  const handleImport = async () => {
    setIsImporting(true)
    setImportProgress({ current: 0, total: 100 })

    try {
      // 使用实际的导入函数
      const result = await quickImport((progress) => {
        setImportProgress({ current: progress.current, total: progress.total })
      })

      if (result.success) {
        const stats: ImportStats = {
          totalRows: result.stats.totalRows,
          brands: [
            'Wanpy/顽皮', 'MYFOODIE/麦富迪', 'Alfie&Buddy/阿飞和巴弟',
            'ROYAL CANIN/皇家', 'prominent/派得', '珍致', '冠能',
            '网易严选', '纯福', '蓝氏', '江小傲', '鲜朗', '诚实一口',
            '福丸', '吉萌萌', '那非普', '小宠', '中宠', '路斯',
            '靓贝', '好命天生', '卓享', '王漂亮', '宠诺莎', '馨萌',
            '瑞梦迪', '肉垫rodin', '贵族', '纯皓'
          ],
          categories: [
            '宠物用品', '宠物服饰及配件', '宠物携带箱/背包',
            '猫/狗食品', '猫零食', '猫粮', '狗零食', '狗粮',
            '猫/狗卫生护理', '猫砂铲/猫砂盆', '香波浴液', '猫砂',
            '猫/狗日用品', '宠物玩具', '乳制品', '其他类乳制品'
          ],
          products: result.stats.successCount,
          errors: []
        }

        setImportStats(stats)
        
        toast.success(`导入完成！成功导入 ${result.stats.successCount} 种商品，创建了 ${result.stats.brands} 个品牌和 ${result.stats.categories} 个分类`)
      } else {
        throw new Error('导入失败')
      }

    } catch (error) {
      console.error('导入失败:', error)
      toast.error("导入过程中发生错误")
    } finally {
      setIsImporting(false)
      setImportProgress({ current: 0, total: 100 })
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">快速导入商品数据</h1>
        <p className="text-gray-600 mb-8">
          一键导入你的CSV商品数据到系统中
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
                  导入中... ({importProgress.current}/{importProgress.total})
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  开始导入
                </>
              )}
            </Button>
          </div>

          {/* 导入统计 */}
          {importStats && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                导入完成
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importStats.totalRows}</div>
                  <div className="text-sm text-green-600">总记录数</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importStats.products}</div>
                  <div className="text-sm text-blue-600">商品种类</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{importStats.brands.length}</div>
                  <div className="text-sm text-purple-600">品牌数量</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{importStats.categories.length}</div>
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
                  {importStats.brands.map(brand => (
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
                  {importStats.categories.map(category => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 错误信息 */}
              {importStats.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    导入过程中的问题
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importStats.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 使用说明 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">导入说明</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 系统会自动解析CSV文件中的商品信息</li>
              <li>• 自动创建缺失的品牌和分类</li>
              <li>• 按商品名称分组，合并不同规格</li>
              <li>• 导入完成后可以在商品管理页面查看</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
