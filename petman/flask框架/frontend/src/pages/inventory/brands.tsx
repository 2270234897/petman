import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Edit, Trash2 } from "lucide-react"
import { 
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand
} from "@/hooks/useApi"

interface Brand {
  brand_id: number
  brand_name: string
  brand_details?: string
}

export function Brands() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [brandName, setBrandName] = useState("")
  const [brandDetails, setBrandDetails] = useState("")
  const queryClient = useQueryClient()

  const { data: brands, isLoading, isError } = useBrands()
  const createMutation = useCreateBrand()
  const updateMutation = useUpdateBrand()
  const deleteMutation = useDeleteBrand()

  const resetForm = () => {
    setBrandName("")
    setBrandDetails("")
    setEditingBrand(null)
    setIsDialogOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!brandName.trim()) {
      toast.error("品牌名称不能为空")
      return
    }

    const formData = {
      brand_name: brandName,
      brand_details: brandDetails
    }

    if (editingBrand) {
      // 更新品牌
      updateMutation.mutate({ 
        id: editingBrand.brand_id, 
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

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setBrandName(brand.brand_name)
    setBrandDetails(brand.brand_details || "")
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这个品牌吗？")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (editingBrand && editingBrand.brand_id === id) {
            resetForm()
          }
          toast.success("品牌删除成功！")
        },
        onError: () => {
          toast.error("品牌删除失败，请重试")
        }
      })
    }
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  if (isError) {
    return <div>加载品牌数据失败</div>
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
          {brands?.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无品牌数据
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {brands?.data?.map((brand: Brand) => (
                <Card key={brand.brand_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{brand.brand_name}</h3>
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
                          onClick={() => handleDelete(brand.brand_id)}
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