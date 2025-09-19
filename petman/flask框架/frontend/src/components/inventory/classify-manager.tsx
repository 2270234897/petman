import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Folder, File } from "lucide-react"
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
  const [selectedClassify, setSelectedClassify] = useState<Classify | null>(null)
  const queryClient = useQueryClient()

  const { data: classifyData, isLoading, isError } = useClassify()
  const createMutation = useCreateClassify()
  const updateMutation = useUpdateClassify()
  const deleteMutation = useDeleteClassify()

  // 获取所有分类数据
  const flatClassifyList: Classify[] = classifyData?.data || []

  // 按层级分组分类
  const level1Classifications = flatClassifyList.filter((c: Classify) => !c.parentID)
  const level2Classifications = flatClassifyList.filter((c: Classify) => 
    c.parentID && level1Classifications.some((l1: Classify) => l1.classify1_ID === c.parentID)
  )
  const level3Classifications = flatClassifyList.filter((c: Classify) => 
    c.parentID && level2Classifications.some((l2: Classify) => l2.classify1_ID === c.parentID)
  )

  // 检查分类是否为二级分类（直接隶属于一级分类）
  const isLevel2Classify = (classify: Classify) => {
    return level1Classifications.some((l1: Classify) => l1.classify1_ID === classify.parentID)
  }

  // 检查分类是否为三级分类（直接隶属于二级分类）
  const isLevel3Classify = (classify: Classify) => {
    return level2Classifications.some((l2: Classify) => l2.classify1_ID === classify.parentID)
  }

  // 重新计算二级和三级分类（更准确的计算方式）
  const recomputeLevel2Classifications = flatClassifyList.filter((c: Classify) => 
    c.parentID && isLevel2Classify(c)
  )
  
  const recomputeLevel3Classifications = flatClassifyList.filter((c: Classify) => 
    c.parentID && isLevel3Classify(c)
  )

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
  const handleEdit = () => {
    if (!selectedClassify) {
      toast.error("请先选择要编辑的分类")
      return
    }
    
    setEditingClassify(selectedClassify)
    setName(selectedClassify.name)
    setParentID(selectedClassify.parentID)
    setIsDialogOpen(true)
  }

  // 删除分类
  const handleDelete = () => {
    if (!selectedClassify) {
      toast.error("请先选择要删除的分类")
      return
    }
    
    if (confirm(`确定要删除分类"${selectedClassify.name}"吗？此操作不可恢复。`)) {
      deleteMutation.mutate(selectedClassify.classify1_ID, {
        onSuccess: () => {
          setSelectedClassify(null)
          if (editingClassify && editingClassify.classify1_ID === selectedClassify.classify1_ID) {
            resetForm()
          }
        }
      })
    }
  }

  // 选择分类
  const handleSelectClassify = (classify: Classify) => {
    setSelectedClassify(classify)
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
        <div className="flex space-x-2">
          <Button 
            onClick={handleEdit}
            disabled={!selectedClassify}
          >
            <Edit className="mr-2 h-4 w-4" />
            编辑分类
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={!selectedClassify}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除分类
          </Button>
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
                    value={parentID?.toString() || "0"} 
                    onValueChange={(value) => setParentID(value === "0" ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择父级分类（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">无父级分类</SelectItem>
                      {flatClassifyList
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 一级分类 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Folder className="mr-2 h-5 w-5 text-blue-500" />
                一级分类
              </CardTitle>
              <CardDescription>
                {level1Classifications.length} 个分类
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {level1Classifications.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  暂无一级分类
                </div>
              ) : (
                <div className="space-y-2">
                  {level1Classifications.map((classify: Classify) => (
                    <div 
                      key={classify.classify1_ID}
                      className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                        selectedClassify?.classify1_ID === classify.classify1_ID 
                          ? "bg-blue-100 dark:bg-blue-900 border border-blue-300" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => handleSelectClassify(classify)}
                    >
                      <span className="font-medium">{classify.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 二级分类 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Folder className="mr-2 h-5 w-5 text-green-500" />
                二级分类
              </CardTitle>
              <CardDescription>
                {recomputeLevel2Classifications.length} 个分类
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {recomputeLevel2Classifications.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  暂无二级分类
                </div>
              ) : (
                <div className="space-y-2">
                  {recomputeLevel2Classifications.map((classify: Classify) => (
                    <div 
                      key={classify.classify1_ID}
                      className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                        selectedClassify?.classify1_ID === classify.classify1_ID 
                          ? "bg-green-100 dark:bg-green-900 border border-green-300" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => handleSelectClassify(classify)}
                    >
                      <div>
                        <span className="font-medium">{classify.name}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          父级: {classify.parent_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 三级分类 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <File className="mr-2 h-5 w-5 text-purple-500" />
                三级分类
              </CardTitle>
              <CardDescription>
                {recomputeLevel3Classifications.length} 个分类
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {recomputeLevel3Classifications.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  暂无三级分类
                </div>
              ) : (
                <div className="space-y-2">
                  {recomputeLevel3Classifications.map((classify: Classify) => (
                    <div 
                      key={classify.classify1_ID}
                      className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                        selectedClassify?.classify1_ID === classify.classify1_ID 
                          ? "bg-purple-100 dark:bg-purple-900 border border-purple-300" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => handleSelectClassify(classify)}
                    >
                      <div>
                        <span className="font-medium">{classify.name}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          父级: {classify.parent_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {selectedClassify && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
          <p className="font-medium">当前选中分类:</p>
          <p className="text-sm">{selectedClassify.name}</p>
          {selectedClassify.parent_name && (
            <p className="text-xs text-muted-foreground">父级: {selectedClassify.parent_name}</p>
          )}
        </div>
      )}
    </div>
  )
}