import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react"
import api from "@/lib/api-client"

// 定义分类数据类型
interface Classify {
  classify1_ID: number
  name: string
  parentID?: number
  parent_name?: string
  level?: number
  children?: Classify[]
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
  const [parentID, setParentID] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const queryClient = useQueryClient()

  const { data: classifyData, isLoading, isError } = useClassify()
  const createMutation = useCreateClassify()
  const updateMutation = useUpdateClassify()
  const deleteMutation = useDeleteClassify()

  // 构建分类树结构
  const categoryTree = useMemo(() => {
    if (!classifyData?.data) return []
    
    const categoryMap = new Map<number, Classify>()
    const rootCategories: Classify[] = []
    
    // 首先创建所有分类节点
    classifyData.data.forEach((cat: any) => {
      categoryMap.set(cat.classify1_ID, {
        classify1_ID: cat.classify1_ID,
        name: cat.name,
        parentID: cat.parentID,
        parent_name: cat.parent_name,
        level: cat.parentID ? 2 : 1, // 有父级的是二级分类，没有父级的是一级分类
        children: []
      })
    })
    
    // 构建树结构
    classifyData.data.forEach((cat: any) => {
      const category = categoryMap.get(cat.classify1_ID)!
      if (cat.parentID) {
        const parent = categoryMap.get(cat.parentID)
        if (parent) {
          parent.children!.push(category)
          // 确保子分类的层级正确设置
          category.level = 2
        }
      } else {
        // 根分类（一级分类）
        category.level = 1
        rootCategories.push(category)
      }
    })
    
    return rootCategories
  }, [classifyData?.data])

  const resetForm = () => {
    setName("")
    setParentID(null)
    setEditingClassify(null)
    setIsDialogOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("分类名称不能为空")
      return
    }

    const formData = {
      name,
      parentID: parentID
    }

    if (editingClassify) {
      // 更新分类
      updateMutation.mutate({ 
        id: editingClassify.classify1_ID, 
        data: formData 
      }, {
        onSuccess: () => {
          resetForm()
          toast.success("分类更新成功！")
        },
        onError: () => {
          toast.error("分类更新失败，请重试")
        }
      })
    } else {
      // 创建分类
      createMutation.mutate(formData, {
        onSuccess: () => {
          resetForm()
          toast.success("分类创建成功！")
        },
        onError: () => {
          toast.error("分类创建失败，请重试")
        }
      })
    }
  }

  const handleEdit = (category: Classify) => {
    setEditingClassify(category)
    setName(category.name)
    setParentID(category.parentID || null)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这个分类吗？删除后其子分类将变为顶级分类。")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (editingClassify && editingClassify.classify1_ID === id) {
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

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const renderCategoryTree = (categories: Classify[], level: number = 0) => {
    return categories.map((category) => {
      const isExpanded = expandedCategories.has(category.classify1_ID)
      const hasChildren = category.children && category.children.length > 0
      
      return (
        <div key={category.classify1_ID} className="space-y-2">
          <div 
            className={`flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors ${
              level === 0 ? 'bg-blue-50 border-blue-200' : 
              level === 1 ? 'bg-green-50 border-green-200' : 
              'bg-yellow-50 border-yellow-200'
            }`}
            style={{ marginLeft: `${level * 20}px` }}
          >
            {/* 展开/收起按钮 */}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCategoryExpansion(category.classify1_ID)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {/* 分类图标 */}
            <div className="flex items-center gap-2">
              {level === 0 ? (
                <FolderOpen className="h-4 w-4 text-blue-600" />
              ) : level === 1 ? (
                <Folder className="h-4 w-4 text-green-600" />
              ) : (
                <Folder className="h-4 w-4 text-yellow-600" />
              )}
              
              {/* 分类名称和级别标识 */}
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    level === 0 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                    level === 1 ? 'bg-green-100 text-green-700 border-green-300' :
                    'bg-yellow-100 text-yellow-700 border-yellow-300'
                  }`}
                >
                  {level === 0 ? '一级分类' : level === 1 ? '二级分类' : '三级分类'}
                </Badge>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex gap-1 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(category)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(category.classify1_ID)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 递归渲染子分类 */}
          {hasChildren && isExpanded && (
            <div className="space-y-2">
              {renderCategoryTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      )
    })
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
            按层级管理商品分类，支持1、2、3级分类结构
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="btn-vibrant-teal">
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
                  onValueChange={(value) => setParentID(value ? Number(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父级分类（可选，不选则为一级分类）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无（一级分类）</SelectItem>
                    {classifyData?.data
                      ?.filter((cat: any) => !cat.parentID) // 只显示一级分类作为父级
                      ?.map((cat: any) => (
                        <SelectItem key={cat.classify1_ID} value={cat.classify1_ID.toString()}>
                          {cat.name}
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
                  className="btn-vibrant-blue"
                >
                  {createMutation.isPending || updateMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="vibrant-card-blue border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            分类层级结构
          </CardTitle>
          <CardDescription>
            按层级显示所有分类，支持展开/收起查看子分类
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryTree.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">暂无分类数据</h3>
              <p className="mb-4">还没有创建任何分类，点击上方按钮开始创建</p>
              <Button onClick={() => setIsDialogOpen(true)} className="btn-vibrant-teal">
                <Plus className="mr-2 h-4 w-4" />
                创建第一个分类
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {renderCategoryTree(categoryTree)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}