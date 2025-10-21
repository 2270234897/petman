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
import { SimpleTreeSelect } from "@/components/ui/simple-tree-select"
import { useBrands, useClassify, useSpecTypes } from "@/hooks/useApi"
import { toast } from "sonner"
import { Controller } from "react-hook-form"
import { Loader2, Sparkles } from "lucide-react"
// AI components disabled - moved to archive
// import { QuickEntryModal } from "@/components/agent/quick-entry-modal"

const productFormSchema = z.object({
  product_name: z.string().min(1, "商品名称不能为空"),
  brand_id: z.number({ required_error: "请选择品牌" }),
  classify_id: z.number({ required_error: "请选择分类" }),
  product_baozhiqi: z.union([
    z.number().min(1, "保质期必须大于0").max(120, "保质期不能超过120个月"),
    z.undefined()
  ]).optional(),
  product_details: z.string().optional(),
  cover_image: z.string().optional(),
  shelf: z.string().optional(),
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
    spec_type_id?: number,
    name: string, 
    value?: string, 
    stock: number, 
    barcode?: string,
    picture?: string,
    unit?: string
  }>>([])
  // AI features disabled - moved to archive
  // const [showAIAssistant, setShowAIAssistant] = useState(false)
  
  // 只有在没有从父组件传递数据时才自己获取数据
  const { data: brandsData, isLoading: isLoadingBrands, isError: isErrorBrands } = useBrands()
  const { data: classifyData, isLoading: isLoadingClassify, isError: isErrorClassify } = useClassify()
  const { data: specTypesData, isLoading: isLoadingSpecTypes, isError: isErrorSpecTypes } = useSpecTypes()
  
  // 使用从父组件传递的数据，或者自己获取的数据
  const availableBrands = brands || brandsData?.data || []
  const availableCategories = categories || classifyData?.data || []
  const availableSpecTypes = specTypesData?.data || []
  
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      product_name: "",
      brand_id: undefined,
      classify_id: undefined,
      product_baozhiqi: undefined,
      product_details: "",
      cover_image: "",
      shelf: "",
    },
  })
  
  // 当initialData变化时，重置表单值
  useEffect(() => {
    if (initialData) {
      console.log('[ProductForm] 接收到初始数据:', initialData);
      
      // 重置表单值（使用 ?? 而不是 || 以支持0值）
      form.reset({
        product_name: initialData.product_name || "",
        brand_id: initialData.brand_id ?? initialData.brand_brandID ?? undefined,
        classify_id: initialData.classify_id ?? initialData.classify_level1_classify1_ID ?? undefined,
        product_baozhiqi: initialData.product_baozhiqi ?? undefined,
        product_details: initialData.product_details || initialData.local || "",
        cover_image: initialData.cover_image || "",
        shelf: initialData.shelf || "",
      });
      
      console.log('[ProductForm] ✅ 表单已重置，品牌ID:', initialData.brand_id ?? initialData.brand_brandID, '分类ID:', initialData.classify_id ?? initialData.classify_level1_classify1_ID);
      
      // 显示AI识别的提示（使用严格检查null/undefined）
      if (initialData._aiData) {
        const aiData = initialData._aiData;
        console.log('[ProductForm] AI识别数据:', aiData);
        
        if (aiData.brand && (initialData.brand_id === null || initialData.brand_id === undefined)) {
          toast.info(`AI识别的品牌"${aiData.brand}"未找到，请手动选择`);
        }
        if (aiData.category && (initialData.classify_id === null || initialData.classify_id === undefined)) {
          toast.info(`AI识别的分类"${aiData.category}"未找到，请手动选择`);
        }
      }
    }
  }, [initialData, form])
  
  // 初始化规格数据
  useEffect(() => {
    if (initialData?.specs) {
      console.log('[ProductForm] 初始化规格数据:', initialData.specs);
      setSpecs(initialData.specs.map((spec: any) => ({
        id: spec.specID || spec.id || Date.now() + Math.random(),
        spec_type_id: spec.spec_type_id,
        name: spec.spec_name || spec.name || "",
        value: spec.spec_value || spec.value || "",
        stock: spec.total_stock || spec.spec_stock || spec.stock || 0,
        barcode: spec.barcode || "",
        picture: spec.picture || "",
        unit: spec.spec_unit || spec.unit || ""
      })))
    } else {
      // 默认添加一个空规格
      setSpecs([{ 
        id: Date.now(), 
        name: "", 
        value: "",
        stock: 0,
        barcode: "",
        picture: "",
        unit: ""
      }])
    }
  }, [initialData])
  
  // 添加新规格
  const addSpec = () => {
    setSpecs([...specs, { 
      id: Date.now(), 
      spec_type_id: undefined,
      name: "", 
      value: "",
      stock: 0,
      barcode: "",
      picture: "",
      unit: ""
    }])
  }
  
  // 更新规格
  const updateSpec = (id: number, field: string, value: string | number) => {
    setSpecs(prevSpecs => 
      prevSpecs.map(spec => 
        spec.id === id ? { ...spec, [field]: value } : spec
      )
    )
  }
  
  // 删除规格
  const removeSpec = (id: number) => {
    if (specs.length <= 1) {
      toast.error("至少需要保留一个规格")
      return
    }
    setSpecs(specs.filter(spec => spec.id !== id))
  }

  // AI features disabled - moved to archive
  // const handleAIDataExtracted = (aiData: any) => {
  //   // 填充商品基本信息
  //   if (aiData.product_name) {
  //     form.setValue('product_name', aiData.product_name)
  //   }
  //   
  //   if (aiData.brand_id !== undefined) {
  //     form.setValue('brand_id', aiData.brand_id)
  //   }
  //   
  //   if (aiData.classify_id !== undefined) {
  //     form.setValue('classify_id', aiData.classify_id)
  //   }
  //   
  //   if (aiData.product_baozhiqi !== undefined) {
  //     form.setValue('product_baozhiqi', aiData.product_baozhiqi)
  //   }
  //   
  //   if (aiData.product_details) {
  //     form.setValue('product_details', aiData.product_details)
  //   }

  //   // 处理规格信息
  //   if (aiData.specs && aiData.specs.length > 0) {
  //     setSpecs(aiData.specs)
  //   }

  //   // 显示未匹配的提示
  //   if (aiData._aiExtracted) {
  //     const warnings = []
  //     
  //     if (aiData._aiExtracted.brand && !aiData.brand_id) {
  //       warnings.push(`品牌 "${aiData._aiExtracted.brand}" 未在系统中找到，请手动选择`)
  //     }
  //     
  //     if (aiData._aiExtracted.category && !aiData.classify_id) {
  //       warnings.push(`分类 "${aiData._aiExtracted.category}" 未在系统中找到，请手动选择`)
  //     }
  //     
  //     if (warnings.length > 0) {
  //       toast.warning(warnings.join('；'), { duration: 5000 })
  //     }
  //   }

  //   setShowAIAssistant(false)
  // }
  
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
    
    // 注意：同一商品的不同规格可以共用条形码，这是合理的业务场景
    // 例如：同一款水壶的不同颜色规格可以共用条形码
    // 后端API已支持这种场景，无需额外检查
    
    // 转换数据格式以匹配后端API期望的格式
    const productData = {
      product_name: values.product_name,
      classify_level1_classify1_ID: values.classify_id,
      product_baozhiqi: values.product_baozhiqi || null, // 处理undefined值
      local: values.product_details || '',
      brand_brandID: values.brand_id,
      cover_image: values.cover_image || '',
      shelf: values.shelf || '',
      specs: specs.map(spec => ({
        spec_type_id: spec.spec_type_id || 1, // 确保有默认值
        spec_name: spec.name || '',
        spec_value: spec.value || '',
        barcode: spec.barcode || '',
        picture: spec.picture || '',
        total_stock: spec.stock || 0,
        unit: spec.unit || ''
      }))
    }
    
    console.log("发送到后端的数据:", productData); // 添加调试日志
    
    // 直接调用父组件的onSubmit，让父组件处理API调用
    onSubmit(productData)
  }
  
  // 检查是否正在加载数据
  if (isLoadingBrands || isLoadingClassify || isLoadingSpecTypes) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">加载基础数据中...</span>
      </div>
    )
  }
  
  // 检查是否有错误
  if (isErrorBrands || isErrorClassify || isErrorSpecTypes) {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {initialData ? "编辑商品" : "新增商品"}
          </h2>
          <p className="text-muted-foreground">
            {initialData ? "编辑现有商品信息" : "添加新的商品及其规格信息"}
          </p>
        </div>
        {/* AI features disabled - moved to archive */}
        {/* {!initialData && (
          <Button
            type="button"
            onClick={() => setShowAIAssistant(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI 智能识别
          </Button>
        )} */}
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
                  <FormLabel>
                    品牌
                    {initialData?._aiData?.brand && (
                      <span className="ml-2 text-xs text-blue-600">
                        (AI识别: {initialData._aiData.brand})
                      </span>
                    )}
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      console.log('[品牌选择] 选中值:', value);
                      field.onChange(Number(value));
                    }}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger className={field.value ? "border-green-500" : ""}>
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
                            {brand.brandname || brand.brandName}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {field.value && (
                    <FormDescription className="text-green-600 text-xs">
                      ✓ 已选择
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Controller
              name="classify_id"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    分类
                    {initialData?._aiData?.category && (
                      <span className="ml-2 text-xs text-blue-600">
                        (AI识别: {initialData._aiData.category})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <SimpleTreeSelect
                      categories={availableCategories}
                      value={field.value}
                      onValueChange={(value) => {
                        console.log('[分类选择] 选中值:', value);
                        field.onChange(value);
                      }}
                      placeholder="请选择分类"
                    />
                  </FormControl>
                  {field.value && (
                    <FormDescription className="text-green-600 text-xs">
                      ✓ 已选择
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Controller
              name="product_baozhiqi"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    保质期 (月) <span className="text-gray-500 text-sm">(可选)</span>
                    {initialData?._aiData?.shelf_life && (
                      <span className="ml-2 text-xs text-blue-600">
                        (AI识别: {initialData._aiData.shelf_life}个月)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="120" 
                      placeholder="请输入保质期，如无保质期可留空"
                      className={field.value ? "border-green-500" : ""}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "" || value === null || value === undefined) {
                          field.onChange(undefined)
                        } else {
                          const numValue = Number(value)
                          if (!isNaN(numValue) && numValue > 0) {
                            field.onChange(numValue)
                          } else {
                            field.onChange(undefined)
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value
                        if (value === "" || value === null || value === undefined) {
                          field.onChange(undefined)
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    部分商品（如玩具、用品等）可能没有保质期，可留空
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              name="shelf"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>货架位置 <span className="text-gray-500 text-sm">(可选)</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="请输入货架位置，如：A区-1层-3号" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    用于记录商品在仓库中的存放位置，便于快速查找
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
          </div>
          
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
                <p className="text-sm text-muted-foreground">
                  为商品添加不同的规格选项。请先选择规格类型，系统将自动填充规格名称和单位。
                </p>
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
                      <label className="text-sm font-medium text-gray-700">规格类型</label>
                      <Select
                        value={spec.spec_type_id ? spec.spec_type_id.toString() : ""}
                        onValueChange={(value) => {
                          const specType = availableSpecTypes.find((st: any) => st.spec_type_id.toString() === value)
                          if (specType) {
                            // 一次性更新所有字段
                            setSpecs(prevSpecs => 
                              prevSpecs.map(s => 
                                s.id === spec.id ? {
                                  ...s,
                                  spec_type_id: specType.spec_type_id,
                                  name: specType.spec_name,
                                  unit: specType.unit || "",
                                  value: "", // 清空规格值，让用户重新输入
                                  stock: 0   // 设置默认库存为0
                                } : s
                              )
                            )
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="请选择规格类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSpecTypes.map((specType: any) => (
                            <SelectItem 
                              key={specType.spec_type_id} 
                              value={specType.spec_type_id.toString()}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{specType.spec_name}</span>
                                {specType.unit && (
                                  <span className="text-xs text-gray-500 ml-2">({specType.unit})</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* 如果没有选择规格类型，显示提示 */}
                      {!spec.spec_type_id && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            请先选择规格类型，系统将自动填充规格名称
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        规格值
                        {spec.unit && <span className="text-gray-500 ml-1">({spec.unit})</span>}
                      </label>
                      <Input
                        value={spec.value || ''}
                        onChange={(e) => updateSpec(spec.id, "value", e.target.value)}
                        placeholder={spec.unit ? `如: 500${spec.unit}` : "请输入规格值"}
                        className="mt-1"
                        disabled={!spec.spec_type_id}
                      />
                      {!spec.spec_type_id && (
                        <p className="text-xs text-gray-400 mt-1">
                          请先选择规格类型
                        </p>
                      )}
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
                        disabled={!spec.spec_type_id}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        条形码 <span className="text-gray-500 text-xs">(可选)</span>
                      </label>
                      <Input
                        type="text"
                        value={spec.barcode || ''}
                        onChange={(e) => updateSpec(spec.id, "barcode", e.target.value)}
                        placeholder="输入条形码，如无条形码可留空"
                        className="mt-1"
                        disabled={!spec.spec_type_id}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        同一商品的不同规格可以共用条形码
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-sm font-medium text-gray-700">规格图片</label>
                      <Input
                        value={spec.picture || ''}
                        onChange={(e) => updateSpec(spec.id, "picture", e.target.value)}
                        placeholder="图片URL"
                        className="mt-1"
                        disabled={!spec.spec_type_id}
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

      {/* AI 助手弹窗 - 已禁用 */}
      {/* {showAIAssistant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <QuickEntryModal
                onDataExtracted={handleAIDataExtracted}
                onClose={() => setShowAIAssistant(false)}
                availableBrands={availableBrands}
                availableCategories={availableCategories}
              />
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}