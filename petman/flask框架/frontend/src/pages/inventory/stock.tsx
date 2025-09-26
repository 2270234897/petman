import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Plus, Search, Filter, Loader2, ArrowDownToLine, ArrowUpFromLine, FileText, Eye } from "lucide-react"
import { useInventory, useDealers, useInventoryItems, useStockIn, useStockOut } from "@/hooks/useApi"
import { toast } from "sonner"
import { StockInList } from "@/components/inventory/stock-in-list"
import { StockInDetail } from "@/components/inventory/stock-in-detail"

export function InventoryStock() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentView, setCurrentView] = useState<'inventory' | 'stock-in-list' | 'stock-in-detail'>('inventory')
  const [selectedStockInId, setSelectedStockInId] = useState<number | null>(null)
  
  const { data: inventoryData, isLoading: isInventoryLoading, refetch } = useInventory()
  const { data: dealersData, isLoading: isDealersLoading } = useDealers()
  const { data: itemsData, isLoading: isItemsLoading } = useInventoryItems()
  
  // 获取操作钩子
  const { mutate: stockIn } = useStockIn()
  const { mutate: stockOut } = useStockOut()
  
  const inventoryItems = inventoryData?.data || []
  const dealers = dealersData?.data || []
  const items = itemsData?.data || []
  
  const isLoading = isInventoryLoading || isDealersLoading || isItemsLoading

  // 处理入库按钮点击
  const handleStockIn = (productId: number, productName: string) => {
    // 实际入库逻辑
    toast.info(`为商品 ${productName} 执行入库操作`)
    // 这里可以添加实际的入库逻辑
  }

  // 处理出库按钮点击
  const handleStockOut = (productId: number, productName: string) => {
    // 实际出库逻辑
    toast.info(`为商品 ${productName} 执行出库操作`)
    // 这里可以添加实际的出库逻辑
  }

  // 处理新增入库记录按钮点击
  const handleAddStockInRecord = () => {
    // 实际新增入库记录逻辑
    toast.info("添加入库记录")
    // 这里可以添加实际的新增入库记录逻辑
  }

  // 处理新增出库记录按钮点击
  const handleAddStockOutRecord = () => {
    // 实际新增出库记录逻辑
    toast.info("添加出库记录")
    // 这里可以添加实际的新增出库记录逻辑
  }

  // 处理查看入库单详情
  const handleViewStockInDetail = (stockInId: number) => {
    setSelectedStockInId(stockInId)
    setCurrentView('stock-in-detail')
  }

  // 处理返回入库单列表
  const handleBackToStockInList = () => {
    setSelectedStockInId(null)
    setCurrentView('stock-in-list')
  }

  // 处理返回库存管理主页
  const handleBackToInventory = () => {
    setCurrentView('inventory')
  }

  // 根据当前视图渲染不同的内容
  if (currentView === 'stock-in-list') {
    return <StockInList onViewDetail={handleViewStockInDetail} />
  }

  if (currentView === 'stock-in-detail' && selectedStockInId) {
    return <StockInDetail stockInId={selectedStockInId} onBack={handleBackToStockInList} />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">库存管理</h1>
          <p className="text-muted-foreground">
            管理商品库存和查看入库记录
          </p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => setCurrentView('stock-in-list')} className="btn-vibrant-blue">
            <FileText className="mr-2 h-4 w-4" />
            查看入库单
          </Button>
          <Button onClick={handleAddStockOutRecord} className="btn-vibrant-orange">
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            新增出库记录
          </Button>
          <Button onClick={handleAddStockInRecord} className="btn-vibrant-green">
            <Plus className="mr-2 h-4 w-4" />
            新增入库记录
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="vibrant-card-blue border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总库存</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryItems.reduce((sum: number, item: any) => sum + (item.总库存 || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">件商品</p>
          </CardContent>
        </Card>
        <Card className="vibrant-card-red border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">供应商</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dealers.length}
            </div>
            <p className="text-xs text-muted-foreground">合作供应商</p>
          </CardContent>
        </Card>
        <Card className="vibrant-card-green border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">商品种类</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {items.length}
            </div>
            <p className="text-xs text-muted-foreground">不同规格</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="vibrant-card-teal border-2">
        <CardHeader>
          <CardTitle>搜索和筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索商品名称、供应商..."
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

      {/* Stock Operations */}
      <Card className="vibrant-card-pink border-2">
        <CardHeader>
          <CardTitle>当前库存商品</CardTitle>
          <CardDescription>
            查看当前库存商品信息，点击上方"查看入库单"可查看详细的入库记录
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
              {inventoryItems.map((item: any) => (
                <div key={item.productID} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors bg-white dark:bg-gray-800">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.brandname} · {item.classify_name}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">当前库存</p>
                      <p className="font-semibold">{item.总库存 || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">保质期</p>
                      <p className="font-semibold">{item.product_baozhiqi}个月</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm" onClick={() => handleStockIn(item.productID, item.product_name)} className="btn-vibrant-green">
                        <ArrowUpFromLine className="h-4 w-4 mr-1" />
                        入库
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleStockOut(item.productID, item.product_name)} className="btn-vibrant-orange">
                        <ArrowDownToLine className="h-4 w-4 mr-1" />
                        出库
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!isLoading && inventoryItems.length === 0 && (
        <Card className="vibrant-card-orange border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无库存数据</h3>
            <p className="text-muted-foreground text-center mb-4">
              没有找到库存信息
            </p>
            <Button onClick={handleAddStockInRecord} className="btn-vibrant-green">
              <Plus className="mr-2 h-4 w-4" />
              添加入库记录
            </Button>
          </CardContent>
        </Card>
      )}
      
    </div>
  )
}