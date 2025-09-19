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
  useClassify,
  useCreateClassify,
  useUpdateClassify,
  useDeleteClassify
} from "@/hooks/useApi"

interface Category {
  classify_id: number
  classify_name: string
  classify_details?: string
}

export function Categories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDetails, setCategoryDetails] = useState("")
  const queryClient = useQueryClient()

  const { data: categories, isLoading, isError } = useClassify()
  const createMutation = useCreateClassify()
  const updateMutation = useUpdateClassify()
  const deleteMutation = useDeleteClassify()

  const resetForm = () => {
    setCategoryName("")
    setCategoryDetails("")
    setEditingCategory(null)
    setIsDialogOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryName.trim()) {
      toast.error("分类名称不能为空")
      return
    }

    const formData = {
      classify_name: categoryName,
      classify_details: categoryDetails
    }

    if (editingCategory) {
      // 更新分类
      updateMutation.mutate({ 
        id: editingCategory.classify_id, 
        data: formData 
      }, {
        onSuccess: () => {
          resetForm()
        }
      })
    } else {
      // 创建分类
      createMutation.mutate(formData, {
        onSuccess: () => {
          resetForm()
        }
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.classify_name)
    setCategoryDetails(category.classify_details || "")
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这个分类吗？")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (editingCategory && editingCategory.classify_id === id) {
            resetForm()
          }
          toast.success("分类删除成功！")
        },
        onError: () => {
          toast.error("分类删除失败，请重试")
        }
      })
    }
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  if (isError) {
    return <div>加载分类数据失败</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">分类管理</h1>
          <p className="text-muted-foreground">
            管理商品分类信息
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              添加分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "编辑分类" : "添加分类"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">分类名称 *</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="请输入分类名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDetails">分类描述</Label>
                <Input
                  id="categoryDetails"
                  value={categoryDetails}
                  onChange={(e) => setCategoryDetails(e.target.value)}
                  placeholder="请输入分类描述（可选）"
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
          <CardTitle>分类列表</CardTitle>
          <CardDescription>
            管理所有商品分类
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories?.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无分类数据
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories?.data?.map((category: Category) => (
                <Card key={category.classify_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{category.classify_name}</h3>
                        {category.classify_details && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.classify_details}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(category.classify_id)}
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