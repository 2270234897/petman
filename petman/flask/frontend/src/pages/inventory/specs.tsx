import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Edit, 
  Trash2,
  Package
} from "lucide-react"
import { 
  useSpecTypes,
  useCreateSpecType,
  useUpdateSpecType,
  useDeleteSpecType
} from "@/hooks/useApi"
import { toast } from "sonner"
import { SpecTypeForm } from "@/components/inventory/spec-type-form"

export function InventorySpecs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSpecType, setEditingSpecType] = useState<any>(null)
  const { data, isLoading, refetch } = useSpecTypes()
  
  // 获取操作钩子
  const { mutate: createSpecType } = useCreateSpecType()
  const { mutate: updateSpecType } = useUpdateSpecType()
  const { mutate: deleteSpecType } = useDeleteSpecType()
  
  const specTypes = data?.data || []
  
  const filteredSpecTypes = specTypes.filter((item: any) =>
    item.spec_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.unit && item.unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAddSpecType = () => {
    setEditingSpecType(null)
    setShowAddForm(true)
  }

  const handleEdit = (specType: any) => {
    setEditingSpecType(specType)
    setShowAddForm(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`确定要删除规格类型"${name}"吗？此操作不可恢复。`)) {
      deleteSpecType(id, {
        onSuccess: () => {
          toast.success("规格类型删除成功！")
          refetch()
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "规格类型删除失败")
        }
      })
    }
  }

  const handleFormSubmit = (specTypeData: any) => {
    if (editingSpecType) {
      // 更新规格类型
      updateSpecType(
        { id: editingSpecType.spec_type_id, data: specTypeData },
        {
          onSuccess: () => {
            toast.success("规格类型更新成功！")
            setEditingSpecType(null)
            setShowAddForm(false)
            refetch()
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || "规格类型更新失败")
          }
        }
      )
    } else {
      // 创建新规格类型
      createSpecType(specTypeData, {
        onSuccess: () => {
          toast.success("规格类型添加成功！")
          setShowAddForm(false)
          refetch()
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "规格类型添加失败")
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {showAddForm ? (
        <SpecTypeForm
          initialData={editingSpecType}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowAddForm(false)
            setEditingSpecType(null)
          }}
        />
      ) : (
        <>
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">规格管理</h1>
              <p className="text-muted-foreground">
                管理商品规格类型，如重量、尺寸、颜色等
              </p>
            </div>
            <Button onClick={handleAddSpecType} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              新增规格类型
            </Button>
          </div>

          {/* Search and Filter */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索规格名称、单位或描述..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  筛选
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">加载中...</span>
            </div>
          )}

          {/* Spec Types List */}
          {!isLoading && (
            <>
              {filteredSpecTypes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSpecTypes.map((item: any) => (
                    <Card key={item.spec_type_id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.spec_name}
                            </h3>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            ID: {item.spec_type_id}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          {item.unit && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">单位:</span>
                              <Badge variant="outline" className="text-xs">
                                {item.unit}
                              </Badge>
                            </div>
                          )}
                          
                          {item.description && (
                            <div>
                              <span className="font-medium">描述:</span>
                              <p className="text-gray-500 mt-1">{item.description}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <span className="font-medium">状态:</span>
                            <Badge 
                              variant={item.is_active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {item.is_active ? "启用" : "禁用"}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-gray-400">
                            创建时间: {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(item.spec_type_id, item.spec_name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            删除
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">暂无规格类型数据</h3>
                    <p className="text-gray-500 text-center mb-4">
                      没有找到匹配的规格类型信息，请尝试调整搜索条件
                    </p>
                    <Button onClick={handleAddSpecType} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      添加第一个规格类型
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}