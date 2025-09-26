import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Search, 
  Filter, 
  Loader2, 
  Eye, 
  Calendar,
  DollarSign,
  Building2,
  FileText
} from "lucide-react"
import { useStockInRecords } from "@/hooks/useApi"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface StockInListProps {
  onViewDetail: (stockInId: number) => void
}

export function StockInList({ onViewDetail }: StockInListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: stockInData, isLoading, refetch } = useStockInRecords()

  const stockInRecords = stockInData?.data || []

  // 过滤入库单记录
  const filteredRecords = stockInRecords.filter((record: any) => 
    record.dealer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.stock_inID?.toString().includes(searchTerm)
  )

  // 计算统计信息
  const totalAmount = stockInRecords.reduce((sum: number, record: any) => 
    sum + (parseFloat(record.total_amount) || 0), 0)
  const totalItems = stockInRecords.reduce((sum: number, record: any) => 
    sum + (parseInt(record.item_count) || 0), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">入库单管理</h1>
          <p className="text-muted-foreground">
            查看和管理所有入库记录
          </p>
        </div>
        <Button onClick={() => refetch()} className="btn-vibrant-blue">
          <Package className="mr-2 h-4 w-4" />
          刷新数据
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="vibrant-card-blue border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">入库单总数</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stockInRecords.length}
            </div>
            <p className="text-xs text-muted-foreground">张入库单</p>
          </CardContent>
        </Card>
        <Card className="vibrant-card-green border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">入库总金额</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ¥{totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">累计金额</p>
          </CardContent>
        </Card>
        <Card className="vibrant-card-orange border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">入库商品总数</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalItems}
            </div>
            <p className="text-xs text-muted-foreground">件商品</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="vibrant-card-teal border-2">
        <CardHeader>
          <CardTitle>搜索入库单</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索供应商名称或入库单号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="default" className="btn-vibrant-blue">
              <Filter className="mr-2 h-4 w-4" />
              筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock In Records List */}
      <Card className="vibrant-card-pink border-2">
        <CardHeader>
          <CardTitle>入库单列表</CardTitle>
          <CardDescription>
            点击查看详情可以查看具体的商品信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record: any) => (
                <div 
                  key={record.stock_inID} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">入库单 #{record.stock_inID}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span>{record.dealer_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(record.stock_in_date), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">商品数量</p>
                      <Badge variant="secondary" className="text-orange-600">
                        {record.item_count} 件
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">总金额</p>
                      <p className="font-semibold text-green-600">
                        ¥{parseFloat(record.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => onViewDetail(record.stock_inID)}
                      className="btn-vibrant-blue"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      查看详情
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!isLoading && filteredRecords.length === 0 && (
        <Card className="vibrant-card-orange border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无入库单数据</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? '没有找到匹配的入库单' : '还没有任何入库记录'}
            </p>
            {!searchTerm && (
              <Button className="btn-vibrant-green">
                <Package className="mr-2 h-4 w-4" />
                创建入库单
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

