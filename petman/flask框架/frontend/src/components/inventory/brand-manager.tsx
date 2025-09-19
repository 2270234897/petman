import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Edit, Trash2 } from "lucide-react"
import api from "@/lib/api-client"

// 定义品牌数据类型（匹配数据库结构）
interface Brand {
  brandID: number
  brandname: string
  brand_details?: string // 这个字段在数据库中不存在，但可能在后端API中添加了
}

// API调用函数
const brandApi = {
  getAll: () => api.get("/api/inventory/brands"),
  create: (data: Partial<Brand>) => api.post("/api/inventory/brands", data),
  update: (id: number, data: Partial<Brand>) => api.put(`/api/inventory/brands/${id}`, data),
  delete: (id: number) => api.delete(`/api/inventory/brands/${id}`)
}

// 自定义Hook
const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => brandApi.getAll().then(res => res.data),
  })
}

const useCreateBrand = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: brandApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("品牌添加成功！")
    },
    onError: (error: any) => {
      console.error("创建品牌失败:", error)
      if (error.response?.status === 500) {
        toast.error("服务器内部错误，请联系管理员或稍后重试")
      } else {
        toast.error(error.response?.data?.message || "品牌添加失败，请重试")
      }
    },
  })
}

const useUpdateBrand = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Brand> }) => brandApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("品牌更新成功！")
    },
    onError: (error: any) => {
      console.error("更新品牌失败:", error)
      if (error.response?.status === 500) {
        toast.error("服务器内部错误，请联系管理员或稍后重试")
      } else {
        toast.error(error.response?.data?.message || "品牌更新失败，请重试")
      }
    },
  })
}

const useDeleteBrand = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: brandApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("品牌删除成功！")
    },
    onError: (error: any) => {
      console.error("删除品牌失败:", error)
      // 打印更多错误信息用于调试
      console.error("错误详情:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 500) {
        toast.error("服务器内部错误，删除品牌失败。请联系系统管理员。")
      } else if (error.response?.status === 404) {
        toast.error("品牌不存在或已被删除")
        // 即使出错也刷新列表
        queryClient.invalidateQueries({ queryKey: ["brands"] })
      } else if (error.response?.status === 409) {
        toast.error("该品牌正在使用中，无法删除")
      } else {
        toast.error(error.response?.data?.message || "品牌删除失败，请重试")
      }
    },
  })
}

export function BrandManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [brandName, setBrandName] = useState("")
  const [brandDetails, setBrandDetails] = useState("")
  const queryClient = useQueryClient()

  const { data: brandsData, isLoading, isError } = useBrands()
  const createMutation = useCreateBrand()
  const updateMutation = useUpdateBrand()
  const deleteMutation = useDeleteBrand()

  // 获取所有品牌数据
  const brandList = brandsData?.data || []

  // 重置表单
  const resetForm = () => {
    setBrandName("")
    setBrandDetails("")
    setEditingBrand(null)
    setIsDialogOpen(false)
  }

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!brandName.trim()) {
      toast.error("品牌名称不能为空")
      return
    }

    // 准备表单数据，匹配数据库字段名
    const formData: any = {
      brandname: brandName.trim()
    }

    // 只有当brandDetails有值时才添加到formData中
    if (brandDetails.trim()) {
      formData.brand_details = brandDetails.trim()
    }

    if (editingBrand) {
      // 更新品牌
      updateMutation.mutate({ 
        id: editingBrand.brandID, 
        data: formData 
      }, {
        onSuccess: () => {
          resetForm()
        }
      })
    } else {
      // 创建品牌
      createMutation.mutate(formData, {
        onSuccess: () => {
          resetForm()
        }
      })
    }
  }

  // 编辑品牌
  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setBrandName(brand.brandname)
    setBrandDetails(brand.brand_details || "")
    setIsDialogOpen(true)
  }

  // 删除品牌
  const handleDelete = (id: number) => {
    if (confirm("确定要删除这个品牌吗？此操作不可恢复。")) {
      console.log("尝试删除品牌，ID:", id); // 添加调试日志
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (editingBrand && editingBrand.brandID === id) {
            resetForm()
          }
        }
      })
    }
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">品牌管理</h1>
          <p className="text-muted-foreground">
            管理商品品牌信息
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-red-500">
              加载品牌数据失败，请稍后重试或联系管理员
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">品牌管理</h1>
          <p className="text-muted-foreground">
            管理商品品牌信息
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              添加品牌
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? "编辑品牌" : "添加品牌"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">品牌名称 *</Label>
                <Input
                  id="brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="请输入品牌名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandDetails">品牌描述</Label>
                <Input
                  id="brandDetails"
                  value={brandDetails}
                  onChange={(e) => setBrandDetails(e.target.value)}
                  placeholder="请输入品牌描述（可选）"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>品牌列表</CardTitle>
          <CardDescription>
            管理所有商品品牌
          </CardDescription>
        </CardHeader>
        <CardContent>
          {brandList?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无品牌数据
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {brandList.map((brand: Brand) => (
                <Card key={brand.brandID} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{brand.brandname}</h3>
                        {brand.brand_details && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {brand.brand_details}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(brand)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(brand.brandID)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}