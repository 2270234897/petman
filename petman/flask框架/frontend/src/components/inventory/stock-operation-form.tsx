import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useInventory, useInventoryItems } from "@/hooks/useApi"
import { toast } from "sonner"

const stockOperationFormSchema = z.object({
  product_id: z.number({ required_error: "请选择商品" }),
  spec_id: z.number({ required_error: "请选择规格" }),
  quantity: z.number().min(1, "数量必须大于0"),
  operation_type: z.enum(["in", "out"], { required_error: "请选择操作类型" }),
  reason: z.string().optional(),
})

type StockOperationFormValues = z.infer<typeof stockOperationFormSchema>

interface StockOperationFormProps {
  onSubmit: (values: StockOperationFormValues) => void
  onCancel: () => void
}

export function StockOperationForm({ onSubmit, onCancel }: StockOperationFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  
  const { data: inventoryData } = useInventory()
  const { data: specsData } = useInventoryItems()
  
  const inventoryItems = inventoryData?.data || []
  const allSpecs = specsData?.data || []
  
  // 根据选中的商品过滤规格
  const filteredSpecs = selectedProduct 
    ? allSpecs.filter((spec: any) => spec.product_id === selectedProduct)
    : []
  
  const form = useForm<StockOperationFormValues>({
    resolver: zodResolver(stockOperationFormSchema),
    defaultValues: {
      product_id: undefined,
      spec_id: undefined,
      quantity: 1,
      operation_type: "in",
      reason: "",
    },
  })
  
  // 当商品改变时，重置规格选择
  const handleProductChange = (productId: number) => {
    setSelectedProduct(productId)
    form.setValue("product_id", productId)
    form.setValue("spec_id", undefined)
  }
  
  // 提交表单
  const handleSubmit = (values: StockOperationFormValues) => {
    onSubmit(values)
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">库存操作</h2>
        <p className="text-sm text-muted-foreground">
          执行商品入库或出库操作
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="operation_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>操作类型</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择操作类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in">入库</SelectItem>
                      <SelectItem value="out">出库</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品</FormLabel>
                  <Select 
                    onValueChange={(value) => handleProductChange(Number(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择商品" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventoryItems.map((item: any) => (
                        <SelectItem key={item.productID} value={item.productID.toString()}>
                          {item.product_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="spec_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>规格</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    value={field.value?.toString() || ""}
                    disabled={!selectedProduct}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedProduct ? "请选择规格" : "请先选择商品"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSpecs.map((spec: any) => (
                        <SelectItem key={spec.specID} value={spec.specID.toString()}>
                          {spec.spec_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>数量</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="请输入数量" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>操作原因</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="请输入操作原因 (可选)" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit">
              执行操作
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}