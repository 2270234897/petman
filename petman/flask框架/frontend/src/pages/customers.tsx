import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Plus, Search, Filter, Phone, MoreHorizontal, Loader2 } from "lucide-react"
import { useCustomers } from "@/hooks/useApi"
import { toast } from "sonner"
import { CustomerForm } from "@/components/customers/customer-form"

export function Customers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { data, isLoading, refetch } = useCustomers()
  
  const customers = data?.data || []
  
  const filteredCustomers = customers.filter((customer: any) =>
    customer.customername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.telphone?.toString().includes(searchTerm) ||
    customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 处理新增客户按钮点击
  const handleAddCustomer = () => {
    setShowCreateForm(true)
  }

  // 处理查看详情按钮点击
  const handleViewDetails = (customerId: number, customerName: string) => {
    toast.success(`正在查看客户详情: ${customerName}`)
    // 这里可以添加实际的查看详情逻辑
  }

  // 处理编辑按钮点击
  const handleEdit = (customerId: number, customerName: string) => {
    toast.success(`正在编辑客户: ${customerName}`)
    // 这里可以添加实际的编辑客户逻辑
  }

  // 处理更多操作按钮点击
  const handleMoreActions = (customerId: number, customerName: string) => {
    toast.success(`正在执行更多操作: ${customerName}`)
    // 这里可以添加实际的更多操作逻辑
  }

  // 处理创建成功
  const handleCreateSuccess = () => {
    toast.success("客户添加成功！")
    setShowCreateForm(false)
    refetch()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">客户管理</h1>
          <p className="text-muted-foreground">
            管理客户信息和宠物档案
          </p>
        </div>
        <Button onClick={handleAddCustomer} className="btn-vibrant-blue">
          <Plus className="mr-2 h-4 w-4" />
          新增客户
        </Button>
      </div>

      {/* Create Customer Form */}
      {showCreateForm && (
        <CustomerForm 
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Filters */}
      <Card className="vibrant-card-teal border-2">
        <CardHeader>
          <CardTitle>搜索和筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索客户姓名、电话或地址..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="btn-vibrant-purple">
              <Filter className="mr-2 h-4 w-4" />
              筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-muted-foreground">加载中...</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer: any) => (
            <Card key={customer.customer_id} className="hover:shadow-md transition-shadow vibrant-card-purple border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">{customer.customername}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        customer.Membershiplevel >= 3
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {customer.Membershiplevel >= 3 ? "VIP" : "普通"}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoreActions(customer.customer_id, customer.customername)}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.telphone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">性别:</span>
                  <span>{customer.gender}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">地址:</span>
                  <span className="truncate">{customer.address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">注册时间</span>
                  <span className="font-medium">{new Date(customer.create_time).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(customer.customer_id, customer.customername)}>
                    查看详情
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(customer.customer_id, customer.customername)}>
                    编辑
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredCustomers.length === 0 && (
        <Card className="vibrant-card-orange border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无客户数据</h3>
            <p className="text-muted-foreground text-center mb-4">
              没有找到匹配的客户信息，请尝试调整搜索条件
            </p>
            <Button onClick={handleAddCustomer} className="btn-vibrant-blue">
              <Plus className="mr-2 h-4 w-4" />
              添加第一个客户
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}