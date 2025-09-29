import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { toast } from "sonner"

const testSchema = z.object({
  product_name: z.string().min(1, "商品名称不能为空"),
  brand_id: z.number({ required_error: "请选择品牌" }),
  classify_id: z.number({ required_error: "请选择分类" }),
  product_baozhiqi: z.union([
    z.number().min(1, "保质期必须大于0").max(120, "保质期不能超过120个月"),
    z.undefined()
  ]).optional(),
})

type TestFormValues = z.infer<typeof testSchema>

export function TestProductCreation() {
  const [formData, setFormData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      product_name: "",
      brand_id: undefined,
      classify_id: undefined,
      product_baozhiqi: undefined,
    },
  })

  const onSubmit = async (values: TestFormValues) => {
    setIsSubmitting(true)
    try {
      // 模拟规格数据
      const specs = [
        {
          spec_type_id: 1,
          spec_name: "颜色",
          spec_value: "蓝色",
          barcode: "123456",
          picture: "",
          总库存: 10,
          unit: ""
        },
        {
          spec_type_id: 1,
          spec_name: "颜色",
          spec_value: "绿色",
          barcode: "123456", // 相同条形码
          picture: "",
          总库存: 15,
          unit: ""
        }
      ]

      const productData = {
        product_name: values.product_name,
        classify_level1_classify1_ID: values.classify_id,
        product_baozhiqi: values.product_baozhiqi || null,
        local: '',
        brand_brandID: values.brand_id,
        cover_image: '',
        specs: specs
      }

      console.log("发送到后端的数据:", productData)
      
      // 这里应该调用实际的API
      // const response = await fetch('/api/inventory/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(productData)
      // })
      
      setFormData(productData)
      toast.success("测试数据准备完成！")
    } catch (error) {
      toast.error("测试失败")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>商品创建测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormLabel>品牌ID</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="请输入品牌ID" 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Controller
                name="classify_id"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分类ID</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="请输入分类ID" 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Controller
                name="product_baozhiqi"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>保质期 (月) <span className="text-gray-500 text-sm">(可选)</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="120" 
                        placeholder="请输入保质期，如无保质期可留空" 
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
                      />
                    </FormControl>
                    <FormDescription>
                      部分商品（如玩具、用品等）可能没有保质期，可留空
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "测试中..." : "测试商品创建"}
              </Button>
            </form>
          </Form>
          
          {formData && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">测试数据:</h3>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium mb-2">测试说明:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 填写商品基本信息</li>
              <li>• 保质期可以留空（测试可选字段）</li>
              <li>• 规格数据包含相同条形码（测试条形码重复）</li>
              <li>• 查看浏览器控制台的调试信息</li>
              <li>• 检查后端控制台的错误信息</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
