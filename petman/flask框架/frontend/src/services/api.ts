import api from "@/lib/api-client"

// 仪表板无独立API：用真实接口计算
export const dashboardApi = {
  // 前端聚合用：分别去取数据
  pets: () => petsApi.getAll(),
  customers: () => customersApi.getAll(),
  appointments: (params?: { date?: string; status?: string }) =>
    appointmentsApi.getAll(params),
  inventoryProducts: () => inventoryApi.getProducts(),
}

// 宠物API（按后端已实现的路由）
export const petsApi = {
  getAll: () => api.get("/api/pets/"),
  getById: (id: number) => api.get(`/api/pets/getbyid/${id}`),
  create: (data: any) => api.post("/api/pets/post", data),
  update: (id: number, data: any) => api.put(`/api/pets/put/${id}`, data),
  delete: (id: number) => api.delete(`/api/pets/delete/${id}`),
  getByCustomerId: (customerId: number) =>
    api.get(`/api/pets/customer/${customerId}`),
}

// 客户API（按后端已实现的路由）
export const customersApi = {
  getAll: () => api.get("/api/customers/get"),
  create: (data: any) => api.post("/api/customers/post", data),
  update: (id: number, data: any) => api.put(`/api/customers/put/${id}`, data),
  delete: (id: number) => api.delete(`/api/customers/delete/${id}`),
}

// 预约API（按后端已实现的路由）
export const appointmentsApi = {
  getAll: (params?: { date?: string; status?: string }) =>
    api.get("/api/appointments/get", { params }),
  create: (data: any) => api.post("/api/appointments/post", data),
  update: (id: number, data: any) => api.put(`/api/appointments/put/${id}`, data),
  delete: (id: number) => api.delete(`/api/appointments/delete/${id}`),
  updateStatus: (id: number, status: string) =>
    api.put(`/api/appointments/status/${id}`, { status }),
  // 服务项目相关API
  getServices: () => api.get("/api/appointments/services/get"),
  createService: (data: any) => api.post("/api/appointments/services/post", data),
  updateService: (id: number, data: any) => api.put(`/api/appointments/services/put/${id}`, data),
  deleteService: (id: number) => api.delete(`/api/appointments/services/delete/${id}`),
}

// 库存API（按后端已实现的路由，列出常用）
export const inventoryApi = {
  getProducts: () => api.get("/api/inventory/products"),
  getSpecs: () => api.get("/api/inventory/specs"),
  getBrands: () => api.get("/api/inventory/brands"),
  getDealers: () => api.get("/api/inventory/dealers"),
  getClassify: () => api.get("/api/inventory/classify"),
  getStockInRecords: () => api.get("/api/inventory/stock_in_records"),
  getStockInRecordDetail: (id: number) => api.get(`/api/inventory/stock_in_records/${id}`),
  createProduct: (data: any) => api.post("/api/inventory/products", data),
  updateProduct: (id: number, data: any) => api.put(`/api/inventory/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/api/inventory/products/${id}`),
  createSpec: (data: any) => api.post("/api/inventory/specs", data),
  updateSpec: (id: number, data: any) => api.put(`/api/inventory/specs/${id}`, data),
  deleteSpec: (id: number) => api.delete(`/api/inventory/specs/${id}`),
  createBrand: (data: any) => api.post("/api/inventory/brands", data),
  updateBrand: (id: number, data: any) => api.put(`/api/inventory/brands/${id}`, data),
  deleteBrand: (id: number) => api.delete(`/api/inventory/brands/${id}`),
  createDealer: (data: any) => api.post("/api/inventory/dealers", data),
  updateDealer: (id: number, data: any) => api.put(`/api/inventory/dealers/${id}`, data),
  deleteDealer: (id: number) => api.delete(`/api/inventory/dealers/${id}`),
  createClassify: (data: any) => api.post("/api/inventory/classify", data),
  updateClassify: (id: number, data: any) => api.put(`/api/inventory/classify/${id}`, data),
  deleteClassify: (id: number) => api.delete(`/api/inventory/classify/${id}`),
  // 规格类型相关API
  getSpecTypes: () => api.get("/api/inventory/spec-types"),
  createSpecType: (data: any) => api.post("/api/inventory/spec-types", data),
  updateSpecType: (id: number, data: any) => api.put(`/api/inventory/spec-types/${id}`, data),
  deleteSpecType: (id: number) => api.delete(`/api/inventory/spec-types/${id}`),
}