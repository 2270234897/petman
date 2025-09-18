import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, Search, Filter, Clock, User, Heart, Loader2, Package } from "lucide-react"
import { useAppointments, useServices, useCreateAppointment, useCreateService } from "@/hooks/useApi"
import { toast } from "sonner"
import { AppointmentForm } from "@/components/appointments/appointment-form"

export function Appointments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [activeTab, setActiveTab] = useState("appointments") // appointments or services
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const { data: appointmentsData, isLoading: isAppointmentsLoading, refetch: refetchAppointments } = useAppointments({
    date: selectedDate || undefined,
  })
  
  const { data: servicesData, isLoading: isServicesLoading, refetch: refetchServices } = useServices()
  
  const createAppointment = useCreateAppointment()
  const createService = useCreateService()

  const appointments = appointmentsData?.data || []
  const services = servicesData?.data || []
  
  const filteredAppointments = appointments.filter((appointment: any) =>
    appointment.petname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.customername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const filteredServices = services.filter((service: any) =>
    service.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "已确认":
        return "bg-blue-100 text-blue-800"
      case "已完成":
        return "bg-green-100 text-green-800"
      case "已取消":
        return "bg-red-100 text-red-800"
      case "待确认":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // 处理新增预约按钮点击
  const handleAddAppointment = () => {
    setShowCreateForm(true)
  }

  // 处理预约编辑按钮点击
  const handleEditAppointment = (appointmentId: number, appointmentName: string) => {
    toast.info(`编辑预约: ${appointmentName}`)
    // 这里可以添加实际的编辑预约逻辑
  }

  // 处理开始服务按钮点击
  const handleStartService = (appointmentId: number, appointmentName: string) => {
    toast.success(`已开始服务: ${appointmentName}`)
  }

  // 处理添加服务项目按钮点击
  const handleAddService = () => {
    toast.info("添加新服务项目")
    // 这里可以添加实际的新增服务项目逻辑
  }

  // 处理服务项目编辑按钮点击
  const handleEditService = (serviceId: number, serviceName: string) => {
    toast.info(`编辑服务: ${serviceName}`)
    // 这里可以添加实际的编辑服务逻辑
  }

  // 处理服务项目启用/停用按钮点击
  const handleToggleService = (serviceId: number, serviceName: string, isActive: boolean) => {
    const action = isActive ? "停用" : "启用"
    toast.success(`已${action}服务: ${serviceName}`)
  }

  // 处理创建成功
  const handleCreateSuccess = () => {
    toast.success("预约添加成功！")
    setShowCreateForm(false)
    refetchAppointments()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">预约管理</h1>
          <p className="text-muted-foreground">
            管理宠物预约和就诊安排
          </p>
        </div>
        <Button onClick={handleAddAppointment} className="btn-vibrant-orange">
          <Plus className="mr-2 h-4 w-4" />
          新增预约
        </Button>
      </div>

      {/* Create Appointment Form */}
      {showCreateForm && (
        <AppointmentForm 
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <Button
          variant={activeTab === "appointments" ? "default" : "ghost"}
          className={activeTab === "appointments" ? "px-4 btn-vibrant-blue" : "px-4"}
          onClick={() => setActiveTab("appointments")}
        >
          预约列表
        </Button>
        <Button
          variant={activeTab === "services" ? "default" : "ghost"}
          className={activeTab === "services" ? "px-4 btn-vibrant-purple" : "px-4"}
          onClick={() => setActiveTab("services")}
        >
          服务项目
        </Button>
      </div>

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
                placeholder={activeTab === "appointments" ? "搜索宠物、主人或服务..." : "搜索服务项目..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === "appointments" && (
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
            )}
            <Button variant="outline" className="btn-vibrant-green">
              <Filter className="mr-2 h-4 w-4" />
              筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {activeTab === "appointments" && (
        <>
          {isAppointmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment: any) => (
                <Card key={appointment.appointment_id} className="hover:shadow-md transition-shadow vibrant-card-orange border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-orange-600" />
                          <div>
                            <h3 className="font-semibold">{appointment.service_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {appointment.appointment_date} {appointment.appointment_time}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.petname}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{appointment.customername}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status}
                          </span>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditAppointment(appointment.appointment_id, appointment.service_name)}>
                            编辑
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleStartService(appointment.appointment_id, appointment.service_name)}>
                            开始
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isAppointmentsLoading && filteredAppointments.length === 0 && (
            <Card className="vibrant-card-pink border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">暂无预约数据</h3>
                <p className="text-muted-foreground text-center mb-4">
                  没有找到匹配的预约信息，请尝试调整搜索条件
                </p>
                <Button onClick={handleAddAppointment} className="btn-vibrant-orange">
                  <Plus className="mr-2 h-4 w-4" />
                  添加第一个预约
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Services List */}
      {activeTab === "services" && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddService} className="btn-vibrant-purple">
              <Plus className="mr-2 h-4 w-4" />
              添加服务项目
            </Button>
          </div>
          
          {isServicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service: any) => (
                <Card key={service.service_id} className="hover:shadow-md transition-shadow vibrant-card-purple border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-lg">{service.service_name}</CardTitle>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">更多选项</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {service.description || "暂无描述"}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">时长</span>
                      <span className="font-medium">{service.duration} 分钟</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">价格</span>
                      <span className="font-medium">¥{service.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">状态</span>
                      <span className="font-medium">
                        {service.is_active ? (
                          <span className="text-green-600">启用</span>
                        ) : (
                          <span className="text-red-600">停用</span>
                        )}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditService(service.service_id, service.service_name)}>
                        编辑
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleToggleService(service.service_id, service.service_name, service.is_active)}
                      >
                        {service.is_active ? "停用" : "启用"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isServicesLoading && filteredServices.length === 0 && (
            <Card className="vibrant-card-green border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">暂无服务项目</h3>
                <p className="text-muted-foreground text-center mb-4">
                  没有找到匹配的服务项目，请尝试调整搜索条件
                </p>
                <Button onClick={handleAddService} className="btn-vibrant-purple">
                  <Plus className="mr-2 h-4 w-4" />
                  添加第一个服务项目
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}