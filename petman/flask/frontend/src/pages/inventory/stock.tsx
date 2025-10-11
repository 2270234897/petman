import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  FileText, 
  Eye, 
  Calendar,
  DollarSign,
  Building2,
  ArrowLeft,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  Check
} from "lucide-react"
import { useStockInRecords, useStockInRecordDetail, useDealers, useInventoryItems, useUpdateStockInRecord, useDeleteStockInRecord } from "@/hooks/useApi"
import { toast } from "sonner"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { StockOperationForm } from "@/components/inventory/stock-operation-form"
import { StockEditForm } from "@/components/inventory/stock-edit-form"

export function InventoryStock() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentView, setCurrentView] = useState<'stock-in-list' | 'stock-in-detail' | 'add-stock-in' | 'add-stock-out' | 'edit-stock-in'>('stock-in-list')
  const [selectedStockInId, setSelectedStockInId] = useState<number | null>(null)
  const [selectedRecords, setSelectedRecords] = useState<number[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null)
  
  // 内联编辑状态
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<any>(null)
  
  const { data: stockInData, isLoading, refetch } = useStockInRecords()
  const { data: dealersData } = useDealers()
  const { data: itemsData } = useInventoryItems()
  const { data: stockInDetailData, isLoading: detailLoading } = useStockInRecordDetail(selectedStockInId || 0)
  const updateStockInRecord = useUpdateStockInRecord()
  const deleteStockInRecord = useDeleteStockInRecord()

  const stockInRecords = stockInData?.data || []
  const dealers = dealersData?.data || []
  const items = itemsData?.data || []

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

  // 处理新增入库记录
  const handleAddStockInRecord = () => {
    setCurrentView('add-stock-in')
  }

  // 处理新增出库记录
  const handleAddStockOutRecord = () => {
    setCurrentView('add-stock-out')
  }

  // 处理库存操作提交
  const handleStockOperationSubmit = (values: any) => {
    toast.success(`${values.operation_type === 'in' ? '入库' : '出库'}操作成功！`)
    setCurrentView('stock-in-list')
    refetch()
  }

  // 处理编辑入库单提交
  const handleEditStockInSubmit = (values: any) => {
    toast.success("✅ 入库单更新成功！")
    setCurrentView('stock-in-detail')
    refetch()
  }

  // 处理编辑入库单取消
  const handleEditStockInCancel = () => {
    setCurrentView('stock-in-detail')
  }

  // 处理取消操作
  const handleCancelOperation = () => {
    setCurrentView('stock-in-list')
    setSelectedStockInId(null)
  }

  // 处理选中/取消选中记录
  const handleSelectRecord = (recordId: number) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    )
  }

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(filteredRecords.map((record: any) => record.stock_inID))
    }
  }

  // 处理编辑记录 - 内联编辑
  const handleEditRecord = (record: any) => {
    setEditingRecordId(record.stock_inID)
    setEditFormData({ ...record })
  }
  
  // 取消内联编辑
  const handleCancelInlineEdit = () => {
    setEditingRecordId(null)
    setEditFormData(null)
  }
  
  // 保存内联编辑
  const handleSaveInlineEdit = async () => {
    if (!editFormData) return
    
    try {
      await updateStockInRecord.mutateAsync({
        id: editingRecordId!,
        data: editFormData
      })
      toast.success("✅ 入库记录更新成功！")
      setEditingRecordId(null)
      setEditFormData(null)
      refetch()
    } catch (error) {
      toast.error("更新失败")
      console.error(error)
    }
  }

  // 处理删除记录
  const handleDeleteRecord = (recordId: number) => {
    setRecordToDelete(recordId)
    setDeleteDialogOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      try {
        await deleteStockInRecord.mutateAsync(recordToDelete)
        setDeleteDialogOpen(false)
        setRecordToDelete(null)
        
        // 如果还有选中的记录，继续删除下一个
        if (selectedRecords.length > 1) {
          const remainingRecords = selectedRecords.filter(id => id !== recordToDelete)
          setSelectedRecords(remainingRecords)
          setRecordToDelete(remainingRecords[0])
          // 递归删除下一个
          setTimeout(() => {
            handleConfirmDelete()
          }, 500) // 延迟500ms避免请求过快
        } else {
          setSelectedRecords([])
        }
        
        refetch()
      } catch (error) {
        console.error("删除失败:", error)
        setDeleteDialogOpen(false)
        setRecordToDelete(null)
      }
    }
  }

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRecords.length > 0) {
      setRecordToDelete(selectedRecords[0])
      setDeleteDialogOpen(true)
    }
  }

  // 处理单个删除
  const handleSingleDelete = (recordId: number) => {
    setSelectedRecords([recordId]) // 设置为单个选中
    setRecordToDelete(recordId)
    setDeleteDialogOpen(true)
  }

  // 根据当前视图渲染不同的内容
  if (currentView === 'edit-stock-in' && selectedStockInId) {
    const selectedRecord = stockInRecords.find((record: any) => record.stock_inID === selectedStockInId)
    const detailRecord = stockInDetailData?.data
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button onClick={handleEditStockInCancel} variant="outline" className="btn-vibrant-blue">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回详情
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑入库单</h1>
            <p className="text-muted-foreground">
              修改入库单 #{selectedStockInId} 的基本信息和商品明细
            </p>
          </div>
        </div>

        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-muted-foreground">加载详情中...</span>
          </div>
        ) : detailRecord ? (
          <StockEditForm 
            record={{
              ...selectedRecord,
              ...detailRecord,
              stock_inID: selectedStockInId,
              items: detailRecord.items || detailRecord.details || detailRecord.products || detailRecord.stock_items || []
            }}
            onSubmit={handleEditStockInSubmit}
            onCancel={handleEditStockInCancel}
          />
        ) : (
          <Card className="vibrant-card-orange border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">未找到入库单</h3>
              <p className="text-muted-foreground text-center mb-4">
                无法找到指定的入库单信息
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (currentView === 'stock-in-detail' && selectedStockInId) {
    const selectedRecord = stockInRecords.find((record: any) => record.stock_inID === selectedStockInId)
    const detailRecord = stockInDetailData?.data
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBackToStockInList} variant="outline" className="btn-vibrant-blue">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">入库单详情</h1>
            <p className="text-muted-foreground">
              查看入库单 #{selectedStockInId} 的详细信息
            </p>
          </div>
        </div>

        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-muted-foreground">加载详情中...</span>
          </div>
        ) : detailRecord ? (
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card className="vibrant-card-blue border-2">
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>入库单的基本信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">入库单号</label>
                    <p className="text-lg font-semibold">#{detailRecord.stock_inID || selectedStockInId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">供应商</label>
                    <p className="text-lg font-semibold">{detailRecord.dealer_name || selectedRecord?.dealer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">入库日期</label>
                    <p className="text-lg font-semibold">
                      {format(new Date(detailRecord.stock_in_date || selectedRecord?.stock_in_date), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">总金额</label>
                    <p className="text-lg font-semibold text-green-600">
                      ¥{parseFloat(detailRecord.total_amount || selectedRecord?.total_amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 商品明细 */}
            <Card className="vibrant-card-green border-2">
              <CardHeader>
                <CardTitle>商品明细</CardTitle>
                <CardDescription>入库单包含的商品信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 尝试不同的字段名来获取商品明细 */}
                  {(() => {
                    const items = detailRecord.items || detailRecord.details || detailRecord.products || detailRecord.stock_items || []
                    return items.length > 0 ? (
                      items.map((item: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">商品名称</label>
                              <p className="font-semibold">{item.product_name || item.name || '未知商品'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">规格</label>
                              <p className="font-semibold">{item.spec_name || item.spec} {item.spec_value || item.value || ''}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">数量</label>
                              <p className="font-semibold text-orange-600">{item.quantity || item.qty || 0} 件</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">单价</label>
                              <p className="font-semibold text-green-600">¥{item.price_in || item.price || 0}</p>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            小计: ¥{((item.quantity || item.qty || 0) * (item.price_in || item.price || 0)).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>暂无商品明细</p>
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-4">
              <Button 
                onClick={() => setCurrentView('edit-stock-in')}
                className="btn-vibrant-green"
              >
                <Edit className="mr-2 h-4 w-4" />
                编辑入库单
              </Button>
              <Button 
                onClick={() => handleDeleteRecord(selectedStockInId)}
                variant="destructive"
                disabled={deleteStockInRecord.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除入库单
              </Button>
            </div>
          </div>
        ) : (
          <Card className="vibrant-card-orange border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">未找到入库单</h3>
              <p className="text-muted-foreground text-center mb-4">
                无法找到指定的入库单信息
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (currentView === 'add-stock-in') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button onClick={handleCancelOperation} variant="outline" className="btn-vibrant-blue">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">新增入库记录</h1>
            <p className="text-muted-foreground">
              创建新的入库记录
            </p>
          </div>
        </div>
        <StockOperationForm 
          onSubmit={handleStockOperationSubmit}
          onCancel={handleCancelOperation}
          operationType="in"
        />
      </div>
    )
  }

  if (currentView === 'add-stock-out') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button onClick={handleCancelOperation} variant="outline" className="btn-vibrant-blue">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">新增出库记录</h1>
            <p className="text-muted-foreground">
              创建新的出库记录
            </p>
          </div>
        </div>
        <StockOperationForm 
          onSubmit={handleStockOperationSubmit}
          onCancel={handleCancelOperation}
          operationType="out"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">库存管理</h1>
          <p className="text-muted-foreground">
            管理入库单记录和库存操作
          </p>
        </div>
        <div className="space-x-2">
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>入库单列表</CardTitle>
              <CardDescription>
                选择入库单进行编辑或删除操作
              </CardDescription>
            </div>
            {selectedRecords.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  已选择 {selectedRecords.length} 项
                </span>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBatchDelete}
                  disabled={deleteStockInRecord.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  批量删除
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 全选按钮 */}
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2"
                >
                  {selectedRecords.length === filteredRecords.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span>
                    {selectedRecords.length === filteredRecords.length ? '取消全选' : '全选'}
                  </span>
                </Button>
                <span className="text-sm text-muted-foreground">
                  共 {filteredRecords.length} 条记录
                </span>
              </div>

              {filteredRecords.map((record: any) => {
                const isEditing = editingRecordId === record.stock_inID
                
                return (
                  <div 
                    key={record.stock_inID} 
                    className={`p-4 border rounded-lg transition-all ${
                      isEditing
                        ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20'
                        : selectedRecords.includes(record.stock_inID) 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'bg-white dark:bg-gray-800 hover:bg-accent/50'
                    }`}
                  >
                    {isEditing ? (
                      // ===== 内联编辑模式 =====
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Edit className="h-5 w-5 text-green-600" />
                            编辑入库单 #{record.stock_inID}
                          </h3>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={handleSaveInlineEdit}
                              disabled={updateStockInRecord.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updateStockInRecord.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <CheckSquare className="h-4 w-4 mr-1" />
                              )}
                              保存
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={handleCancelInlineEdit}
                            >
                              取消
                            </Button>
                          </div>
                        </div>

                        {/* 可编辑字段 */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium block mb-1">供应商</label>
                            <select 
                              className="w-full p-2 border rounded-md"
                              value={editFormData?.dealer_id || ''}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                dealer_id: parseInt(e.target.value)
                              })}
                            >
                              {dealers.map((d: any) => (
                                <option key={d.dealerID} value={d.dealerID}>
                                  {d.dealer_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium block mb-1">入库日期</label>
                            <Input
                              type="datetime-local"
                              value={editFormData?.stock_in_date?.slice(0, 16) || ''}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                stock_in_date: e.target.value
                              })}
                            />
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 italic">
                          💡 提示：修改供应商和入库日期后点击保存
                        </div>
                      </div>
                    ) : (
                      // ===== 正常显示模式 =====
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectRecord(record.stock_inID)}
                            className="p-1"
                          >
                            {selectedRecords.includes(record.stock_inID) ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
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
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleViewStockInDetail(record.stock_inID)}
                              className="btn-vibrant-blue"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看详情
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditRecord(record)}
                              className="btn-vibrant-green"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              编辑
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleSingleDelete(record.stock_inID)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={deleteStockInRecord.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
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
              <Button onClick={handleAddStockInRecord} className="btn-vibrant-green">
                <Plus className="mr-2 h-4 w-4" />
                创建入库单
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              {selectedRecords.length > 1 ? (
                <>
                  您确定要删除 {selectedRecords.length} 个入库单吗？<br/>
                  当前删除: 入库单 #{recordToDelete}<br/>
                  剩余待删除: {selectedRecords.length - 1} 个<br/>
                  <strong className="text-red-600">此操作将同时删除所有相关的商品明细，不可撤销！</strong>
                </>
              ) : (
                <>
                  您确定要删除入库单 #{recordToDelete} 吗？<br/>
                  <strong className="text-red-600">此操作将同时删除所有相关的商品明细，不可撤销！</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false)
                setRecordToDelete(null)
                setSelectedRecords([])
              }}
              disabled={deleteStockInRecord.isPending}
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteStockInRecord.isPending}
            >
              {deleteStockInRecord.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedRecords.length > 1 ? '批量删除中...' : '删除中...'}
                </>
              ) : (
                selectedRecords.length > 1 ? '确认批量删除' : '确认删除'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  )
}