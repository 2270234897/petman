import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Package, 
  Calendar,
  DollarSign,
  Building2,
  Phone,
  MapPin,
  FileText,
  Loader2,
  Barcode,
  Tag
} from "lucide-react"
import { useStockInRecordDetail } from "@/hooks/useApi"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface StockInDetailProps {
  stockInId: number
  onBack: () => void
}

export function StockInDetail({ stockInId, onBack }: StockInDetailProps) {
  const { data: detailData, isLoading } = useStockInRecordDetail(stockInId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">加载详情中...</span>
      </div>
    )
  }

  if (!detailData?.data) {
    return (
      <Card className="vibrant-card-red border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">入库单不存在</h3>
          <p className="text-muted-foreground text-center mb-4">
            找不到指定的入库单信息
          </p>
          <Button onClick={onBack} className="btn-vibrant-blue">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { stock_in_info, details } = detailData.data

  // 计算统计信息
  const totalQuantity = details.reduce((sum: number, detail: any) => 
    sum + (parseInt(detail.quantity) || 0), 0)
  const totalValue = details.reduce((sum: number, detail: any) => 
    sum + ((parseInt(detail.quantity) || 0) * (parseInt(detail.price_in) || 0)), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" className="btn-vibrant-blue">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              入库单详情 #{stock_in_info.stock_inID}
            </h1>
            <p className="text-muted-foreground">
              查看入库单的详细商品信息
            </p>
          </div>
        </div>
      </div>

      {/* Stock In Info */}
      <Card className="vibrant-card-blue border-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>入库单基本信息</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>供应商</span>
              </div>
              <p className="font-medium">{stock_in_info.dealer_name}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>联系电话</span>
              </div>
              <p className="font-medium">{stock_in_info.dealer_tel}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>地址</span>
              </div>
              <p className="font-medium">{stock_in_info.dealer_address}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>入库日期</span>
              </div>
              <p className="font-medium">
                {format(new Date(stock_in_info.stock_in_date), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="vibrant-card-green border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">商品种类</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {details.length}
            </div>
            <p className="text-xs text-muted-foreground">种不同商品</p>
          </CardContent>
        </Card>
        <Card className="vibrant-card-orange border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总数量</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalQuantity}
            </div>
            <p className="text-xs text-muted-foreground">件商品</p>
          </CardContent>
        </Card>
        <Card className="vibrant-card-red border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总金额</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ¥{totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">入库总价值</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Details */}
      <Card className="vibrant-card-pink border-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>商品明细</span>
          </CardTitle>
          <CardDescription>
            本次入库的所有商品详细信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {details.map((detail: any, index: number) => (
              <div 
                key={detail.stock_in_detail}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors bg-white dark:bg-gray-800"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{detail.product_name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Tag className="h-4 w-4" />
                          <span>{detail.brandname}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tag className="h-4 w-4" />
                          <span>{detail.classify_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <span>规格：{detail.spec_name} - {detail.spec_value}</span>
                        </div>
                        {detail.barcode && (
                          <div className="flex items-center space-x-1">
                            <Barcode className="h-4 w-4" />
                            <span>{detail.barcode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">入库数量</p>
                    <Badge variant="secondary" className="text-blue-600">
                      {detail.quantity}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">单价</p>
                    <p className="font-semibold text-green-600">
                      ¥{parseInt(detail.price_in).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">小计</p>
                    <p className="font-semibold text-red-600">
                      ¥{((parseInt(detail.quantity) || 0) * (parseInt(detail.price_in) || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">生产日期</p>
                    <p className="text-sm">
                      {detail.product_date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Summary */}
      <Card className="vibrant-card-teal border-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">入库单汇总</h3>
              <p className="text-muted-foreground">
                共 {details.length} 种商品，总计 {totalQuantity} 件
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">入库单总金额</p>
              <p className="text-2xl font-bold text-red-600">
                ¥{parseFloat(stock_in_info.total_amount).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
