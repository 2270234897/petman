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
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Controller } from "react-hook-form"

const specTypeFormSchema = z.object({
  spec_name: z.string().min(1, "规格名称不能为空").max(45, "规格名称不能超过45个字符"),
  unit: z.string().max(20, "单位不能超过20个字符").optional(),
  description: z.string().max(500, "描述不能超过500个字符").optional(),
  is_active: z.boolean().default(true),
})

type SpecTypeFormValues = z.infer<typeof specTypeFormSchema>

interface SpecTypeFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function SpecTypeForm({ initialData, onSubmit, onCancel }: SpecTypeFormProps) {
  const form = useForm<SpecTypeFormValues>({
    resolver: zodResolver(specTypeFormSchema),
    defaultValues: {
      spec_name: initialData?.spec_name || "",
      unit: initialData?.unit || "",
      description: initialData?.description || "",
      is_active: initialData?.is_active ?? true,
    },
  })
  
  const handleSubmit = (values: SpecTypeFormValues) => {
    onSubmit(values)
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {initialData ? "编辑规格类型" : "新增规格类型"}
        </h2>
        <p className="text-muted-foreground">
          {initialData ? "编辑现有规格类型信息" : "添加新的规格类型，如重量、尺寸、颜色等"}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 规格名称 */}
          <Controller
            name="spec_name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>规格名称 *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="请输入规格名称，如：重量、尺寸、颜色" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  规格类型的名称，用于标识不同的规格属性
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 单位 */}
          <Controller
            name="unit"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>单位</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="请输入单位，如：kg、g、ml、L、cm、mm" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  规格值的单位，如重量用kg，尺寸用cm等
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 描述 */}
          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="请输入规格类型的详细描述（可选）" 
                    className="resize-none" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  对规格类型的详细说明，帮助用户理解其用途
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 状态 */}
          <Controller
            name="is_active"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>状态</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium">
                      启用此规格类型
                    </label>
                  </div>
                </FormControl>
                <FormDescription>
                  禁用的规格类型将不会在新建商品时显示
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit">
              {initialData ? "更新规格类型" : "创建规格类型"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
