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

const testSchema = z.object({
  product_name: z.string().min(1, "商品名称不能为空"),
  product_baozhiqi: z.union([
    z.number().min(1, "保质期必须大于0").max(120, "保质期不能超过120个月"),
    z.undefined()
  ]).optional(),
})

type TestFormValues = z.infer<typeof testSchema>

export function TestShelfLife() {
  const [formData, setFormData] = useState<any>(null)
  
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      product_name: "",
      product_baozhiqi: undefined,
    },
  })

  const onSubmit = (values: TestFormValues) => {
    console.log('Form submitted:', values)
    setFormData(values)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>保质期输入框测试</CardTitle>
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
              
              <Button type="submit">提交测试</Button>
            </form>
          </Form>
          
          {formData && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">提交的数据:</h3>
              <pre className="text-sm text-gray-600">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium mb-2">测试说明:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 尝试清空保质期输入框，应该能成功提交</li>
              <li>• 输入有效数字，应该能正常保存</li>
              <li>• 输入无效值，应该被处理为空值</li>
              <li>• 查看浏览器控制台的调试信息</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
