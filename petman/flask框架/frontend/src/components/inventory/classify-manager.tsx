import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Edit, Trash2 } from "lucide-react"
import api from "@/lib/api-client"

// 定义分类数据类型
interface Classify {
  classify1_ID: number
  name: string
  parentID?: number
  parent_name?: string
}

// API调用函数
const classifyApi = {
  getAll: () => api.get("/api/inventory/classify"),
  create: (data: Partial<Classify>) => api.post("/api/inventory/classify", data),
  update: (id: number, data: Partial<Classify>) => api.put(`/api/inventory/classify/${id}`, data),
  delete: (id: number) => api.delete(`/api/inventory/classify/${id}`)
}

// 自定义Hook
const useClassify = () => {
  return useQuery({
    queryKey: ["classify"],
    queryFn: () => classifyApi.getAll().then(res => res.data),
  })
}

const useCreateClassify = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: classifyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classify"] })
      toast.success("分类添加成功！")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "分类添加失败，请重试")
    },
  })
}

const useUpdateClassify = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Classify> }) => classifyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classify"] })
      toast.success("分类更新成功！")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "分类更新失败，请重试")
    },
  })
}

const useDeleteClassify = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: classifyApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classify"] })
      toast.success("分类删除成功！")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "分类删除失败，请重试")
    },
  })
}

export function ClassifyManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClassify, setEditingClassify] = useState<Classify | null>(null)
  const [name, setName] = useState("")
  const [parentID, setParentID] = useState<number | undefined>(undefined)
  const queryClient = useQueryClient()

  const { data: classifyData, isLoading, isError } = useClassify()
  const createMutation = useCreateClassify()
  const updateMutation = useUpdateClassify()
  const deleteMutation = useDeleteClassify()

  // 获取所有分类数据
  const classifyList = classifyData?.data || []

  // 重置表单
  const resetForm = () => {
    setName("")
    setParentID(undefined)
    setEditingClassify(null)
    setIsDialogOpen(false)
  }

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("分类名称不能为空")
      return
    }

    const formData: any = {
      name
    }

    // 只有当parentID有值时才添加到formData中
    if (parentID !== undefined) {
      formData.parentID = parentID
    }

    if (editingClassify) {
      // 更新分类
      updateMutation.mutate({ 
        id: editingClassify.classify1_ID, 
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

  // 编辑分类
  const handleEdit = (classify: Classify) => {
    setEditingClassify(classify)
    setName(classify.name)
    setParentID(classify.parentID)
    setIsDialogOpen(true)
  }

  // 删除分类
  const handleDelete = (id: number) => {
    if (confirm("确定要删除这个分类吗？此操作不可恢复。")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (editingClassify && editingClassify.classify1_ID === id) {
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
                {editingClassify ? "编辑分类" : "添加分类"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">分类名称 *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入分类名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentID">父级分类</Label>
                <Select 
                  value={parentID?.toString() || ""} 
                  onValueChange={(value) => setParentID(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父级分类（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无父级分类</SelectItem>
                    {classifyList
                      .filter((c: Classify) => !editingClassify || c.classify1_ID !== editingClassify.classify1_ID)
                      .map((classify: Classify) => (
                        <SelectItem 
                          key={classify.classify1_ID} 
                          value={classify.classify1_ID.toString()}
                        >
                          {classify.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
          {classifyList?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无分类数据
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classifyList.map((classify: Classify) => (
                <Card key={classify.classify1_ID} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{classify.name}</h3>
                        {classify.parent_name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            父级: {classify.parent_name}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(classify)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(classify.classify1_ID)}
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