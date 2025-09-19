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

// 定义经销商数据类型（匹配数据库结构）
interface Dealer {
  dealerID: number
  dealer_name: string
  dealer_tel: number
  dealer_address: string
}

// API调用函数
const dealerApi = {
  getAll: () => api.get("/api/inventory/dealers"),
  create: (data: Partial<Dealer>) => api.post("/api/inventory/dealers", data),
  update: (id: number, data: Partial<Dealer>) => api.put(`/api/inventory/dealers/${id}`, data),
  delete: (id: number) => api.delete(`/api/inventory/dealers/${id}`)
}

// 自定义Hook
const useDealers = () => {
  return useQuery({
    queryKey: ["dealers"],
    queryFn: () => dealerApi.getAll().then(res => res.data),
  })
}

const useCreateDealer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dealerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealers"] })
      toast.success("经销商添加成功！")
    },
    onError: (error: any) => {
      console.error("创建经销商失败:", error)
      if (error.response?.status === 500) {
        toast.error("服务器内部错误，请联系管理员或稍后重试")
      } else {
        toast.error(error.response?.data?.message || "经销商添加失败，请重试")
      }
    },
  })
}

const useUpdateDealer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Dealer> }) => dealerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealers"] })
      toast.success("经销商更新成功！")
    },
    onError: (error: any) => {
      console.error("更新经销商失败:", error)
      if (error.response?.status === 500) {
        toast.error("服务器内部错误，请联系管理员或稍后重试")
      } else {
        toast.error(error.response?.data?.message || "经销商更新失败，请重试")
      }
    },
  })
}

const useDeleteDealer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dealerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealers"] })
      toast.success("经销商删除成功！")
    },
    onError: (error: any) => {
      console.error("删除经销商失败:", error)
      // 打印更多错误信息用于调试
      console.error("错误详情:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 500) {
        toast.error("服务器内部错误，删除经销商失败。请联系系统管理员。")
      } else if (error.response?.status === 404) {
        toast.error("经销商不存在或已被删除")
        // 即使出错也刷新列表
        queryClient.invalidateQueries({ queryKey: ["dealers"] })
      } else if (error.response?.status === 409) {
        toast.error("该经销商正在使用中，无法删除")
      } else {
        toast.error(error.response?.data?.message || "经销商删除失败，请重试")
      }
    },
  })
}

export function DealerManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null)
  const [dealerName, setDealerName] = useState("")
  const [dealerTel, setDealerTel] = useState("")
  const [dealerAddress, setDealerAddress] = useState("")
  const queryClient = useQueryClient()

  const { data: dealersData, isLoading, isError } = useDealers()
  const createMutation = useCreateDealer()
  const updateMutation = useUpdateDealer()
  const deleteMutation = useDeleteDealer()

  // 获取所有经销商数据
  const dealerList = dealersData?.data || []

  // 重置表单
  const resetForm = () => {
    setDealerName("")
    setDealerTel("")
    setDealerAddress("")
    setEditingDealer(null)
    setIsDialogOpen(false)
  }

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dealerName.trim()) {
      toast.error("经销商名称不能为空")
      return
    }

    // 准备表单数据，匹配数据库字段名
    const formData: any = {
      dealer_name: dealerName.trim()
    }

    // 只有当dealerTel有值时才添加到formData中
    if (dealerTel.trim()) {
      formData.dealer_tel = parseInt(dealerTel.trim(), 10)
    }

    // 只有当dealerAddress有值时才添加到formData中
    if (dealerAddress.trim()) {
      formData.dealer_address = dealerAddress.trim()
    }

    if (editingDealer) {
      // 更新经销商
      updateMutation.mutate({ 
        id: editingDealer.dealerID, 
        data: formData 
      }, {
        onSuccess: () => {
          resetForm()
        }
      })
    } else {
      // 创建经销商
      createMutation.mutate(formData, {
        onSuccess: () => {
          resetForm()
        }
      })
    }
  }

  // 编辑经销商
  const handleEdit = (dealer: Dealer) => {
    setEditingDealer(dealer)
    setDealerName(dealer.dealer_name)
    setDealerTel(dealer.dealer_tel?.toString() || "")
    setDealerAddress(dealer.dealer_address || "")
    setIsDialogOpen(true)
  }

  // 删除经销商
  const handleDelete = (id: number) => {
    if (confirm("确定要删除这个经销商吗？此操作不可恢复。")) {
      console.log("尝试删除经销商，ID:", id); // 添加调试日志
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (editingDealer && editingDealer.dealerID === id) {
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
          <h1 className="text-3xl font-bold tracking-tight">经销商管理</h1>
          <p className="text-muted-foreground">
            管理商品经销商信息
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-red-500">
              加载经销商数据失败，请稍后重试或联系管理员
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
          <h1 className="text-3xl font-bold tracking-tight">经销商管理</h1>
          <p className="text-muted-foreground">
            管理商品经销商信息
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              添加经销商
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDealer ? "编辑经销商" : "添加经销商"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dealerName">经销商名称 *</Label>
                <Input
                  id="dealerName"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  placeholder="请输入经销商名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealerTel">联系电话</Label>
                <Input
                  id="dealerTel"
                  value={dealerTel}
                  onChange={(e) => setDealerTel(e.target.value)}
                  placeholder="请输入联系电话"
                  type="tel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealerAddress">地址</Label>
                <Input
                  id="dealerAddress"
                  value={dealerAddress}
                  onChange={(e) => setDealerAddress(e.target.value)}
                  placeholder="请输入地址"
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
          <CardTitle>经销商列表</CardTitle>
          <CardDescription>
            管理所有商品经销商
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dealerList?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无经销商数据
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dealerList.map((dealer: Dealer) => (
                <Card key={dealer.dealerID} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{dealer.dealer_name}</h3>
                        {dealer.dealer_tel && (
                          <p className="text-sm text-muted-foreground mt-1">
                            电话: {dealer.dealer_tel}
                          </p>
                        )}
                        {dealer.dealer_address && (
                          <p className="text-sm text-muted-foreground mt-1">
                            地址: {dealer.dealer_address}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(dealer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(dealer.dealerID)}
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