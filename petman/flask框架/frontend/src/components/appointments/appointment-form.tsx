import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useCreateAppointment, usePets, useServices, useCustomers } from "@/hooks/useApi"
import { toast } from "sonner"

interface AppointmentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function AppointmentForm({ onSuccess, onCancel }: AppointmentFormProps) {
  const [form, setForm] = useState({
    customer_id: "",
    pet_id: "",
    service_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  })

  const createAppointment = useCreateAppointment()
  const { data: customersData } = useCustomers()
  const { data: petsData } = usePets()
  const { data: servicesData } = useServices()
  
  const customers = customersData?.data || []
  const allPets = petsData?.data || []
  const services = servicesData?.data || []
  
  // 根据选择的客户过滤宠物列表
  const filteredPets = form.customer_id 
    ? allPets.filter((pet: any) => {
        // 兼容不同的字段名
        const petCustomerId = pet.customerID || pet.customer_id || pet.customers_customerID
        return petCustomerId == form.customer_id
      })
    : []

  const onSubmit = async () => {
    if (!form.customer_id || !form.pet_id || !form.service_id || !form.appointment_date || !form.appointment_time) {
      toast.error("请填写所有必填字段")
      return
    }

    // 确保必要的ID是有效的数字
    const customerIdNum = parseInt(form.customer_id, 10)
    const petIdNum = parseInt(form.pet_id, 10)
    const serviceIdNum = parseInt(form.service_id, 10)
    
    if (isNaN(customerIdNum) || isNaN(petIdNum) || isNaN(serviceIdNum)) {
      toast.error("请选择有效的客户、宠物和服务项目")
      return
    }

    // 构造符合后端API期望的数据格式
    const appointmentData = {
      customerID: customerIdNum,
      petID: petIdNum,
      service_id: serviceIdNum,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      notes: form.notes || undefined,
      status: "待确认" // 设置默认状态
    }

    try {
      await createAppointment.mutateAsync(appointmentData)
      onSuccess?.()
    } catch (error: any) {
      console.error("创建预约失败:", error)
      // 显示更详细的错误信息
      if (error.response?.data?.message) {
        toast.error(`创建预约失败: ${error.response.data.message}`)
      } else {
        toast.error("创建预约失败，请重试")
      }
    }
  }

  // 当客户更改时，清空已选择的宠物
  const handleCustomerChange = (customerId: string) => {
    setForm({
      ...form,
      customer_id: customerId,
      pet_id: "" // 重置宠物选择
    })
  }

  return (
    <Card className="card-hover vibrant-card-blue border-2 bounce-in">
      <CardHeader>
        <CardTitle>新增预约</CardTitle>
        <CardDescription>填写预约信息后提交</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">客户 *</label>
            <select
              value={form.customer_id}
              onChange={e => handleCustomerChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">请选择客户</option>
              {customers.map((customer: any) => (
                <option key={customer.customerID} value={customer.customerID}>
                  {customer.customername}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">宠物 *</label>
            <select
              value={form.pet_id}
              onChange={e => setForm({...form, pet_id: e.target.value})}
              disabled={!form.customer_id}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">请选择宠物</option>
              {filteredPets.map((pet: any) => (
                <option key={pet.petID} value={pet.petID}>
                  {pet.petname}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">服务项目 *</label>
            <select
              value={form.service_id}
              onChange={e => setForm({...form, service_id: e.target.value})}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">请选择服务项目</option>
              {services.map((service: any) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.service_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">预约日期 *</label>
            <Input 
              type="date"
              value={form.appointment_date} 
              onChange={e => setForm({...form, appointment_date: e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">预约时间 *</label>
            <Input 
              type="time"
              value={form.appointment_time} 
              onChange={e => setForm({...form, appointment_time: e.target.value})} 
            />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">备注</label>
            <Input 
              placeholder="请输入备注信息" 
              value={form.notes} 
              onChange={e => setForm({...form, notes: e.target.value})} 
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} className="btn-vibrant-purple">取消</Button>
          <Button onClick={onSubmit} disabled={createAppointment.isPending} className="btn-vibrant-green">
            {createAppointment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            提交
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}