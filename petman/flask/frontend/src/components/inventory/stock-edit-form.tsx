import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useInventoryItems, useDealers, useUpdateStockInRecord } from "@/hooks/useApi"
import { Package, Plus, Trash2, Info, Loader2, Save, X } from "lucide-react"

// 定义表单数据类型
interface StockEditFormValues {
  dealer_id: number | undefined
  stock_in_date: string
  items: Array<{
    spec_id: number
    quantity: number
    price_in: number
    product_date?: string
    item_id?: number // 用于编辑时标识现有明细
  }>
  operation_type: "in" | "out"
  reason?: string
}

interface StockEditFormProps {
  record: any
  onSubmit: (values: StockEditFormValues) => void
  onCancel: () => void
}

export function StockEditForm({ record, onSubmit, onCancel }: StockEditFormProps) {
  const [formData, setFormData] = useState<StockEditFormValues>({
    dealer_id: record?.dealer_id || undefined,
    stock_in_date: record?.stock_in_date ? new Date(record.stock_in_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    items: record?.items || [],
    operation_type: "in",
    reason: record?.reason || "",
  })
  
  const { data: specsData } = useInventoryItems()
  const { data: dealersData } = useDealers()
  const updateStockInRecord = useUpdateStockInRecord()
  
  const allSpecs = specsData?.data || []
  const dealers = dealersData?.data || []
  
  // 添加商品到列表
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        spec_id: 0,
        quantity: 1,
        price_in: 0,
        product_date: "",
      }]
    }))
  }
  
  // 移除商品
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }
  
  // 更新商品信息
  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }
  
  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证必填字段
    if (!formData.dealer_id) {
      alert("请选择供应商")
      return
    }
    if (formData.items.length === 0) {
      alert("请至少添加一个商品")
      return
    }
    if (formData.items.some(item => !item.spec_id || item.quantity <= 0 || item.price_in < 0)) {
      alert("请完善商品信息")
      return
    }

    try {
      // 计算总金额
      const totalAmount = formData.items.reduce((sum, item) => 
        sum + (item.quantity * item.price_in), 0)
      
      // 处理生产日期，如果为空则使用当前日期
      const processedItems = formData.items.map(item => ({
        ...item,
        product_date: item.product_date || new Date().toISOString().slice(0, 10)
      }))
      
      const submitData = {
        ...formData,
        items: processedItems,
        total_amount: totalAmount,
        item_count: formData.items.length,
      }

      await updateStockInRecord.mutateAsync({ 
        id: record.stock_inID, 
        data: submitData 
      })
      onSubmit(submitData)
    } catch (error) {
      console.error("更新失败:", error)
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          编辑入库记录 #{record.stock_inID}
        </h2>
        <p className="text-sm text-muted-foreground">
          修改入库单的基本信息和商品明细
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card className="vibrant-card-blue border-2">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>
                修改入库记录的基本信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">供应商 *</label>
                  <Select 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dealer_id: Number(value) }))} 
                    value={formData.dealer_id?.toString() || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择供应商" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealers.map((dealer: any) => (
                        <SelectItem key={dealer.dealerID} value={dealer.dealerID.toString()}>
                          {dealer.dealer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">入库日期 *</label>
                  <Input 
                    type="datetime-local"
                    value={formData.stock_in_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_in_date: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 商品列表 */}
          <Card className="vibrant-card-green border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>商品明细</CardTitle>
                  <CardDescription>
                    修改入库单的商品信息
                  </CardDescription>
                </div>
                <Button type="button" onClick={addItem} className="btn-vibrant-green">
                  <Plus className="mr-2 h-4 w-4" />
                  添加商品
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.items.map((item: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">商品 #{index + 1}</h4>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium">商品规格</label>
                        <Select 
                          value={item.spec_id?.toString() || ""} 
                          onValueChange={(value) => updateItem(index, "spec_id", Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择规格" />
                          </SelectTrigger>
                          <SelectContent>
                            {allSpecs.map((spec: any) => (
                              <SelectItem key={spec.specID} value={spec.specID.toString()}>
                                {spec.product_name} - {spec.spec_name} {spec.spec_value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">数量</label>
                        <Input 
                          type="number" 
                          min="1"
                          value={item.quantity || ""}
                          onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                          placeholder="数量"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">单价 (元)</label>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={item.price_in || ""}
                          onChange={(e) => updateItem(index, "price_in", Number(e.target.value))}
                          placeholder="单价"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">生产日期 (可选)</label>
                        <Input 
                          type="date"
                          value={item.product_date || ""}
                          onChange={(e) => updateItem(index, "product_date", e.target.value)}
                          placeholder="选择生产日期"
                        />
                      </div>
                    </div>
                    
                    {item.quantity && item.price_in && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        小计: ¥{(item.quantity * item.price_in).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
                
                {formData.items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>还没有添加任何商品</p>
                    <p className="text-sm">点击"添加商品"按钮开始添加</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">操作原因</label>
            <Textarea 
              placeholder="请输入操作原因 (可选)" 
              className="resize-none" 
              value={formData.reason || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button 
              type="submit" 
              className="btn-vibrant-green"
              disabled={updateStockInRecord.isPending}
            >
              {updateStockInRecord.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  保存修改
                </>
              )}
            </Button>
          </div>
        </form>
    </div>
  )
}
