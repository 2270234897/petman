import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Form, 
  FormControl, 
  FormDescription, 
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
import { Controller } from "react-hook-form"
import { Loader2 } from "lucide-react"

const productFormSchema = z.object({
  product_name: z.string().min(1, "商品名称不能为空"),
  brand_id: z.number({ required_error: "请选择品牌" }),
  classify_id: z.number({ required_error: "请选择分类" }),
  product_baozhiqi: z.number().min(1, "保质期必须大于0").max(120, "保质期不能超过120个月"),
  product_details: z.string().optional(),
  cover_image: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductFormProps {
  initialData?: any
  brands?: any[]
  categories?: any[]
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function ProductForm({ initialData, brands, categories, onSubmit, onCancel }: ProductFormProps) {
  const [specs, setSpecs] = useState<Array<{
    id: number, 
    name: string, 
    value?: string, 
    stock: number, 
    barcode?: string,
    picture?: string
  }>>([])
  
  // 只有在没有从父组件传递数据时才自己获取数据
  const { data: brandsData, isLoading: isLoadingBrands, isError: isErrorBrands } = useBrands()
  const { data: classifyData, isLoading: isLoadingClassify, isError: isErrorClassify } = useClassify()
  const { mutate: createProduct } = useCreateInventoryItem()
  const { mutate: updateProduct } = useUpdateProduct()
  
  // 使用从父组件传递的数据，或者自己获取的数据
  const availableBrands = brands || brandsData?.data || []
  const availableCategories = categories || classifyData?.data || []
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      product_name: initialData?.product_name || "",
      brand_id: initialData?.brand_id || initialData?.brand_brandID || undefined,
      classify_id: initialData?.classify_id || initialData?.classify_level1_classify1_ID || undefined,
      product_baozhiqi: initialData?.product_baozhiqi ?? 12,
      product_details: initialData?.product_details || initialData?.local || "",
      cover_image: initialData?.cover_image || "",
    },
  })
  
  // 初始化规格数据
  useEffect(() => {
    if (initialData?.specs) {
      setSpecs(initialData.specs.map((spec: any) => ({
        id: spec.specID || spec.id || Date.now() + Math.random(),
        name: spec.spec_name || spec.name || "",
        value: spec.spec_value || spec.value || "",
        stock: spec.总库存 || spec.spec_stock || spec.stock || 0,
        barcode: spec.barcode || "",
        picture: spec.picture || ""
      })))
    } else {
      // 默认添加一个空规格
      setSpecs([{ 
        id: Date.now(), 
        name: "", 
        value: "",
        stock: 0,
        barcode: "",
        picture: ""
      }])
    }
  }, [initialData])
  
  // 添加新规格
  const addSpec = () => {
    setSpecs([...specs, { 
      id: Date.now(), 
      name: "", 
      value: "",
      stock: 0,
      barcode: "",
      picture: ""
    }])
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
    
    // 验证所有规格字段
    const incompleteSpecs = specs.filter(spec => 
      spec.name.trim() && (spec.value === undefined || spec.stock === undefined)
    )
    if (incompleteSpecs.length > 0) {
      toast.error("请完整填写所有规格信息")
      return
    }
    
    // 转换数据格式以匹配后端API期望的格式
    const productData = {
      product_name: values.product_name,
      classify_level1_classify1_ID: values.classify_id,
      product_baozhiqi: values.product_baozhiqi,
      local: values.product_details || '',
      brand_brandID: values.brand_id,
      cover_image: values.cover_image || '',
      specs: specs.map(spec => ({
        spec_name: spec.name,
        spec_value: spec.value || '',
        barcode: spec.barcode || 0,
        picture: spec.picture || '',
        总库存: spec.stock
      }))
    }
    
    console.log("发送到后端的数据:", productData); // 添加调试日志
    
    if (initialData) {
      // 更新商品
      updateProduct(
        { id: initialData.productID, data: productData },
        {
          onSuccess: () => {
            toast.success("商品更新成功")
            onSubmit(productData)
          },
          onError: (error: any) => {
            console.error("商品更新失败:", error);
            toast.error(error.response?.data?.message || "商品更新失败，请重试")
          }
        }
      )
    } else {
      // 创建商品
      createProduct(productData, {
        onSuccess: () => {
          toast.success("商品创建成功")
          onSubmit(productData)
        },
        onError: (error: any) => {
          console.error("商品创建失败:", error);
          toast.error(error.response?.data?.message || "商品创建失败，请重试")
        }
      })
    }
  }
  
  // 检查是否正在加载数据
  if (isLoadingBrands || isLoadingClassify) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">加载基础数据中...</span>
      </div>
    )
  }
  
  // 检查是否有错误
  if (isErrorBrands || isErrorClassify) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-red-500 mb-2">加载基础数据失败</p>
          <Button onClick={() => { window.location.reload() }}>
            重新加载
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {initialData ? "编辑商品" : "新增商品"}
        </h2>
        <p className="text-muted-foreground">
          {initialData ? "编辑现有商品信息" : "添加新的商品及其规格信息"}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 商品基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="product_name"
              control={form.control}
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
            
            <Controller
              name="brand_id"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>品牌</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择品牌" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableBrands
                        .filter((brand: any) => brand.brandID)
                        .map((brand: any) => (
                          <SelectItem 
                            key={brand.brandID} 
                            value={brand.brandID.toString()}
                          >
                            {brand.brandname}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Controller
              name="classify_id"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCategories
                        .filter((category: any) => category.classify1_ID)
                        .map((category: any) => (
                          <SelectItem 
                            key={category.classify1_ID} 
                            value={category.classify1_ID.toString()}
                          >
                            {category.name}
                            {category.parent_name && ` (${category.parent_name})`}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Controller
              name="product_baozhiqi"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>保质期 (月)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="120" 
                      placeholder="请输入保质期" 
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Controller
            name="product_details"
            control={form.control}
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
          
          <Controller
            name="cover_image"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>商品封面图片</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="请输入商品封面图片URL (可选)" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  商品的主要展示图片，将作为商品列表中的封面图显示
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          
          {/* 规格信息 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">商品规格</h3>
                <p className="text-sm text-muted-foreground">为商品添加不同的规格选项，如重量、尺寸等</p>
              </div>
              <Button type="button" variant="outline" onClick={addSpec}>
                添加规格
              </Button>
            </div>
            
            {specs.map((spec) => (
              <Card key={spec.id} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                      <label className="text-sm font-medium text-gray-700">规格名称</label>
                      <Input
                        value={spec.name}
                        onChange={(e) => updateSpec(spec.id, "name", e.target.value)}
                        placeholder="如: 重量、尺寸"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">规格值</label>
                      <Input
                        value={spec.value || ''}
                        onChange={(e) => updateSpec(spec.id, "value", e.target.value)}
                        placeholder="如: 500g"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">初始库存</label>
                      <Input
                        type="number"
                        min="0"
                        value={spec.stock}
                        onChange={(e) => updateSpec(spec.id, "stock", Number(e.target.value))}
                        placeholder="库存数量"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">条形码</label>
                      <Input
                        type="number"
                        value={spec.barcode || ''}
                        onChange={(e) => updateSpec(spec.id, "barcode", e.target.value)}
                        placeholder="条形码"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-sm font-medium text-gray-700">规格图片</label>
                      <Input
                        value={spec.picture || ''}
                        onChange={(e) => updateSpec(spec.id, "picture", e.target.value)}
                        placeholder="图片URL"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-12 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeSpec(spec.id)}
                        disabled={specs.length <= 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        删除规格
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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