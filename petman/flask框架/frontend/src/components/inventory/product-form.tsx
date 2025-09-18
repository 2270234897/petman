import { useState, useEffect } from "react"
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
import { useBrands, useClassify, useCreateInventoryItem, useUpdateProduct } from "@/hooks/useApi"
import { toast } from "sonner"

const productFormSchema = z.object({
  product_name: z.string().min(1, "商品名称不能为空"),
  brand_id: z.number({ required_error: "请选择品牌" }),
  classify_id: z.number({ required_error: "请选择分类" }),
  product_baozhiqi: z.number().min(1, "保质期必须大于0").max(120, "保质期不能超过120个月"),
  product_details: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductFormProps {
  initialData?: any
  onSubmit: () => void
  onCancel: () => void
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [specs, setSpecs] = useState<Array<{id: number, name: string, stock: number}>>([])
  
  const { data: brandsData } = useBrands()
  const { data: classifyData } = useClassify()
  const { mutate: createProduct } = useCreateInventoryItem()
  const { mutate: updateProduct } = useUpdateProduct()
  
  const brands = brandsData?.data || []
  const categories = classifyData?.data || []
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      product_name: initialData?.product_name || "",
      brand_id: initialData?.brand_id || undefined,
      classify_id: initialData?.classify_id || undefined,
      product_baozhiqi: initialData?.product_baozhiqi || 12,
      product_details: initialData?.product_details || "",
    },
  })
  
  // 初始化规格数据
  useEffect(() => {
    if (initialData?.specs) {
      setSpecs(initialData.specs.map((spec: any) => ({
        id: spec.specID,
        name: spec.spec_name,
        stock: spec.spec_stock || 0
      })))
    } else {
      // 默认添加一个空规格
      setSpecs([{ id: Date.now(), name: "", stock: 0 }])
    }
  }, [initialData])
  
  // 添加新规格
  const addSpec = () => {
    setSpecs([...specs, { id: Date.now(), name: "", stock: 0 }])
  }
  
  // 更新规格
  const updateSpec = (id: number, field: string, value: string | number) => {
    setSpecs(specs.map(spec => 
      spec.id === id ? { ...spec, [field]: value } : spec
    ))
  }
  
  // 删除规格
  const removeSpec = (id: number) => {
    if (specs.length <= 1) {
      toast.error("至少需要保留一个规格")
      return
    }
    setSpecs(specs.filter(spec => spec.id !== id))
  }
  
  // 提交表单
  const handleSubmit = (values: ProductFormValues) => {
    // 验证规格
    const invalidSpecs = specs.filter(spec => !spec.name.trim())
    if (invalidSpecs.length > 0) {
      toast.error("请填写所有规格名称")
      return
    }
    
    const productData = {
      ...values,
      specs: specs.map(spec => ({
        spec_name: spec.name,
        spec_stock: spec.stock
      }))
    }
    
    if (initialData) {
      // 更新商品
      updateProduct(
        { id: initialData.productID, data: productData },
        {
          onSuccess: () => {
            toast.success("商品更新成功")
            onSubmit()
          },
          onError: () => {
            toast.error("商品更新失败")
          }
        }
      )
    } else {
      // 创建商品
      createProduct(productData, {
        onSuccess: () => {
          toast.success("商品创建成功")
          onSubmit()
        },
        onError: () => {
          toast.error("商品创建失败")
        }
      })
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          {initialData ? "编辑商品" : "新增商品"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {initialData ? "编辑现有商品信息" : "添加新的商品及其规格信息"}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 商品基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="product_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入商品名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="brand_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>品牌</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择品牌" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand: any) => (
                        <SelectItem key={brand.brandID} value={brand.brandID.toString()}>
                          {brand.brandname}
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
              name="classify_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem 
                          key={category.classifyID} 
                          value={category.classifyID.toString()}
                        >
                          {category.classify_name}
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
              name="product_baozhiqi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>保质期 (月)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="120" 
                      placeholder="请输入保质期" 
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
            name="product_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>商品详情</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="请输入商品详情 (可选)" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 规格信息 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">规格信息</h3>
              <Button type="button" variant="outline" onClick={addSpec}>
                添加规格
              </Button>
            </div>
            
            {specs.map((spec, index) => (
              <div key={spec.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-5">
                  <label className="text-sm font-medium">规格名称</label>
                  <Input
                    value={spec.name}
                    onChange={(e) => updateSpec(spec.id, "name", e.target.value)}
                    placeholder="如: 500g/袋"
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="text-sm font-medium">初始库存</label>
                  <Input
                    type="number"
                    min="0"
                    value={spec.stock}
                    onChange={(e) => updateSpec(spec.id, "stock", Number(e.target.value))}
                    placeholder="请输入初始库存"
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeSpec(spec.id)}
                    disabled={specs.length <= 1}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit">
              {initialData ? "更新商品" : "创建商品"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}