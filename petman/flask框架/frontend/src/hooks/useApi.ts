import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dashboardApi, petsApi, customersApi, appointmentsApi, inventoryApi } from "@/services/api"
import { toast } from "sonner"

// 仪表板Hook
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const [pets, customers, appointments, products] = await Promise.all([
        dashboardApi.pets().then(r => r.data),
        dashboardApi.customers().then(r => r.data),
        dashboardApi.appointments().then(r => r.data),
        dashboardApi.inventoryProducts().then(r => r.data),
      ])

      const totalPets = pets.data?.length ?? 0
      const activeCustomers = customers.data?.length ?? 0
      const todayStr = new Date().toISOString().slice(0, 10)
      const todayAppointments = (appointments.data ?? []).filter((a: any) => (a.appointment_date ?? '').startsWith(todayStr)).length
      const lowStockItems = (products.data ?? []).filter((p: any) => (p.总库存 ?? p.currentStock ?? 0) < (p.minStock ?? 10)).length

      return { totalPets, activeCustomers, todayAppointments, lowStockItems }
    },
  })
}

export const useDashboardActivities = () => {
  // 先用最近入库/最近预约简单拼装
  return useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: async () => {
      const [appointments, stockIn] = await Promise.all([
        appointmentsApi.getAll().then(r => r.data),
        inventoryApi.getStockInRecords().then(r => r.data),
      ])
      const items: any[] = []
      for (const a of (appointments.data ?? []).slice(0, 5)) {
        items.push({ id: `appt-${a.appointment_id}`, type: 'appointment', message: `预约：${a.petname ?? ''} - ${a.appointment_date ?? ''} ${a.appointment_time ?? ''}`, time: '' })
      }
      for (const s of (stockIn.data ?? []).slice(0, 5)) {
        items.push({ id: `stock-${s.stock_inID}`, type: 'stock', message: `入库：${s.dealer_name ?? ''} - ¥${s.total_amount ?? ''}`, time: '' })
      }
      return items.slice(0, 8)
    },
  })
}

// 宠物Hook
export const usePets = () => {
  return useQuery({
    queryKey: ["pets"],
    queryFn: () => petsApi.getAll().then(res => res.data),
  })
}

export const useCreatePet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: petsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] })
      toast.success("宠物添加成功！")
    },
    onError: () => {
      toast.error("宠物添加失败，请重试")
    },
  })
}

export const useDeletePet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: petsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] })
      toast.success("宠物删除成功！")
    },
    onError: () => {
      toast.error("宠物删除失败，请重试")
    },
  })
}

// 客户Hook
export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => customersApi.getAll().then(res => res.data),
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("客户添加成功！")
    },
    onError: () => {
      toast.error("客户添加失败，请重试")
    },
  })
}

// 预约Hook
export const useAppointments = (params?: { date?: string; status?: string }) => {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentsApi.getAll(params).then(res => res.data),
  })
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("预约创建成功！")
    },
    onError: () => {
      toast.error("预约创建失败，请重试")
    },
  })
}

// 预约服务项目Hook
export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => appointmentsApi.getServices().then(res => res.data),
  })
}

export const useCreateService = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: appointmentsApi.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      toast.success("服务项目创建成功！")
    },
    onError: () => {
      toast.error("服务项目创建失败，请重试")
    },
  })
}

// 库存Hook
export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: () => inventoryApi.getProducts().then(res => res.data),
  })
}

export const useInventoryItems = () => {
  return useQuery({
    queryKey: ["inventory-items"],
    queryFn: () => inventoryApi.getSpecs().then(res => res.data),
  })
}

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => inventoryApi.getBrands().then(res => res.data),
  })
}

export const useDealers = () => {
  return useQuery({
    queryKey: ["dealers"],
    queryFn: () => inventoryApi.getDealers().then(res => res.data),
  })
}

export const useClassify = () => {
  return useQuery({
    queryKey: ["classify"],
    queryFn: () => inventoryApi.getClassify().then(res => res.data),
  })
}

// 规格类型Hook
export const useSpecTypes = () => {
  return useQuery({
    queryKey: ["spec-types"],
    queryFn: () => inventoryApi.getSpecTypes().then(res => res.data),
  })
}

export const useCreateSpecType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.createSpecType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spec-types"] })
      toast.success("规格类型添加成功！")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "规格类型添加失败，请重试")
    },
  })
}

export const useUpdateSpecType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => inventoryApi.updateSpecType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spec-types"] })
      toast.success("规格类型更新成功！")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "规格类型更新失败，请重试")
    },
  })
}

export const useDeleteSpecType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => inventoryApi.deleteSpecType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spec-types"] })
      toast.success("规格类型删除成功！")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "规格类型删除失败，请重试")
    },
  })
}

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      toast.success("商品添加成功！")
    },
    onError: (error: any) => {
      console.error("商品添加失败:", error);
      toast.error(error.response?.data?.message || "商品添加失败，请重试")
    },
  })
}

export const useCreateBrand = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("品牌添加成功！")
    },
    onError: () => {
      toast.error("品牌添加失败，请重试")
    },
  })
}

export const useCreateDealer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.createDealer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealers"] })
      toast.success("经销商添加成功！")
    },
    onError: () => {
      toast.error("经销商添加失败，请重试")
    },
  })
}

export const useCreateClassify = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.createClassify,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classify"] })
      toast.success("分类添加成功！")
    },
    onError: () => {
      toast.error("分类添加失败，请重试")
    },
  })
}

export const useUpdateClassify = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => inventoryApi.updateClassify(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classify"] })
      toast.success("分类更新成功！")
    },
    onError: () => {
      toast.error("分类更新失败，请重试")
    },
  })
}

export const useDeleteClassify = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => inventoryApi.deleteClassify(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classify"] })
      toast.success("分类删除成功！")
    },
    onError: () => {
      toast.error("分类删除失败，请重试")
    },
  })
}

export const useCreateSpec = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.createSpec,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] })
      toast.success("规格添加成功！")
    },
    onError: () => {
      toast.error("规格添加失败，请重试")
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => inventoryApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      toast.success("商品更新成功！")
    },
    onError: () => {
      toast.error("商品更新失败，请重试")
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => inventoryApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      toast.success("商品删除成功！")
    },
    onError: () => {
      toast.error("商品删除失败，请重试")
    },
  })
}

export const useStockIn = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => 
      // 这里需要根据实际API来实现入库操作
      Promise.resolve({ id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] })
      toast.success("入库操作成功！")
    },
    onError: () => {
      toast.error("入库操作失败，请重试")
    },
  })
}

export const useStockOut = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => 
      // 这里需要根据实际API来实现出库操作
      Promise.resolve({ id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] })
      toast.success("出库操作成功！")
    },
    onError: () => {
      toast.error("出库操作失败，请重试")
    },
  })
}

// 新增的库存操作API钩子
export const useStockOperation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { 
      product_id: number; 
      spec_id: number; 
      quantity: number; 
      operation_type: 'in' | 'out';
      reason?: string;
    }) => {
      // 根据操作类型调用不同的API
      if (data.operation_type === 'in') {
        // 调用入库API
        return Promise.resolve(data)
      } else {
        // 调用出库API
        return Promise.resolve(data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] })
      toast.success("库存操作成功！")
    },
    onError: () => {
      toast.error("库存操作失败，请重试")
    },
  })
}

// 入库单记录Hook
export const useStockInRecords = () => {
  return useQuery({
    queryKey: ["stock-in-records"],
    queryFn: () => inventoryApi.getStockInRecords().then(res => res.data),
  })
}

// 入库单详情Hook
export const useStockInRecordDetail = (stockInId: number) => {
  return useQuery({
    queryKey: ["stock-in-record-detail", stockInId],
    queryFn: () => inventoryApi.getStockInRecordDetail(stockInId).then(res => res.data),
    enabled: !!stockInId,
  })
}
