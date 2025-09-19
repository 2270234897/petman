import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Plus, Search, Filter, Loader2, Edit, Trash2, Tag } from "lucide-react"
import { 
  useInventory, 
  useInventoryItems, 
  useCreateInventoryItem, 
  useBrands, 
  useDealers, 
  useClassify,
  useCreateSpec,
  useUpdateProduct,
  useDeleteProduct
} from "@/hooks/useApi"
import { toast } from "sonner"
import { ProductForm } from "@/components/inventory/product-form"

export function InventoryProducts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const { data, isLoading, refetch } = useInventory()
  const { data: specsData } = useInventoryItems()
  const { data: brandsData } = useBrands()
  const { data: dealersData } = useDealers()
  const { data: classifyData } = useClassify()
  
  // 获取操作钩子
  const { mutate: createProduct } = useCreateInventoryItem()
  const { mutate: createSpec } = useCreateSpec()
  const { mutate: updateProduct } = useUpdateProduct()
  const { mutate: deleteProduct } = useDeleteProduct()
  
  const inventoryItems = data?.data || []
  const specs = specsData?.data || []
  const brands = brandsData?.data || []
  const dealers = dealersData?.data || []
  const categories = classifyData?.data || []
  
  // 将规格信息与商品信息合并
  const enrichedInventoryItems = inventoryItems.map((item: any) => {
    const itemSpecs = specs.filter((spec: any) => spec.product_id === item.productID)
    return {
      ...item,
      specs: itemSpecs
    }
  })

  const filteredInventory = enrichedInventoryItems.filter((item: any) =>
    item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.classify_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brandname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.specs.some((spec: any) => 
      spec.spec_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // 处理编辑按钮点击
  const handleEdit = (product: any) => {
    setEditingProduct(product)
  }

  // 处理删除按钮点击
  const handleDelete = (productId: number, productName: string) => {
    // 实际删除逻辑
    toast.info(`确定要删除商品 ${productName} 吗？`, {
      action: {
        label: "确认",
        onClick: () => {
          deleteProduct(productId, {
            onSuccess: () => {
              toast.success(`已删除商品: ${productName}`)
              refetch()
            },
            onError: () => {
              toast.error("商品删除失败")
            }
          })
        }
      }
    })
  }

  // 处理新增商品按钮点击
  const handleAddProduct = () => {
    setShowAddForm(true)
  }

  // 处理表单提交
  const handleFormSubmit = (data: any) => {
    const { specs, ...productData } = data
    
    if (editingProduct) {
      // 更新商品
      updateProduct(
        { id: editingProduct.productID, data: productData },
        {
          onSuccess: () => {
            toast.success("商品更新成功！")
            setEditingProduct(null)
            refetch()
          },
          onError: () => {
            toast.error("商品更新失败")
          }
        }
      )
    } else {
      // 创建新商品
      createProduct(productData, {
        onSuccess: (response: any) => {
          toast.success("商品添加成功！")
          
          // 如果有规格信息，创建规格
          if (specs && specs.length > 0) {
            specs.forEach((spec: any) => {
              const specData = {
                ...spec,
                product_id: response.data.productID || response.data.id
              }
              createSpec(specData)
            })
          }
          
          setShowAddForm(false)
          refetch()
        },
        onError: () => {
          toast.error("商品添加失败")
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">商品及规格管理</h1>
          <p className="text-muted-foreground">
            管理库存中的商品及规格信息
          </p>
        </div>
        <Button onClick={handleAddProduct} className="btn-vibrant-teal">
          <Plus className="mr-2 h-4 w-4" />
          新增商品及规格
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="vibrant-card-blue border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总商品数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">商品种类</p>
          </CardContent>
        </Card>
        <Card className="vibrant-card-red border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">库存不足</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventoryItems.filter((item: any) => item.总库存 < 10).length}
            </div>
            <p className="text-xs text-muted-foreground">需要补货</p>
          </CardContent>
        </Card>
        <Card className="vibrant-card-green border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">库存正常</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inventoryItems.filter((item: any) => item.总库存 >= 10).length}
            </div>
            <p className="text-xs text-muted-foreground">正常范围</p>
          </CardContent>
        </Card>
        <Card className="vibrant-card-purple border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">规格总数</CardTitle>
            <Tag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {specs.length}
            </div>
            <p className="text-xs text-muted-foreground">规格数量</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Product Form */}
      {(showAddForm || editingProduct) && (
        <Card className="vibrant-card-orange border-2">
          <CardHeader>
            <CardTitle>{editingProduct ? "编辑商品" : "新增商品"}</CardTitle>
            <CardDescription>
              {editingProduct ? "编辑现有商品信息" : "添加新的商品及规格信息"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm 
              initialData={editingProduct}
              brands={brands}
              categories={categories}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowAddForm(false)
                setEditingProduct(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Only show filters and inventory list when not adding/editing */}
      {!(showAddForm || editingProduct) && (
        <>
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
                    placeholder="搜索商品名称、分类、品牌或规格..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button className="btn-vibrant-blue">
                  <Filter className="mr-2 h-4 w-4" />
                  筛选
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card className="vibrant-card-pink border-2">
            <CardHeader>
              <CardTitle>商品及规格列表</CardTitle>
              <CardDescription>
                所有商品及其规格和库存信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-muted-foreground">加载中...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInventory.map((item: any) => (
                    <div key={item.productID} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors bg-white dark:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Package className="h-10 w-10 text-blue-600 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-lg">{item.product_name}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                品牌: {item.brandname}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                分类: {item.classify_name}
                              </span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                保质期: {item.product_baozhiqi}个月
                              </span>
                            </div>
                            
                            {/* 规格和库存信息 */}
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">规格及库存:</h4>
                              {item.specs.length > 0 ? (
                                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                  {item.specs.map((spec: any) => (
                                    <div key={spec.specID} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <span className="text-sm font-medium">{spec.spec_name}</span>
                                      <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                        库存: {spec.spec_stock}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">暂无规格信息</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="default" size="sm" onClick={() => handleEdit(item)} className="btn-vibrant-blue">
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </Button>
                          <Button variant="default" size="sm" onClick={() => handleDelete(item.productID, item.product_name)} className="btn-vibrant-red">
                            <Trash2 className="h-4 w-4 mr-1" />
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {!isLoading && filteredInventory.length === 0 && (
            <Card className="vibrant-card-orange border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">暂无商品数据</h3>
                <p className="text-muted-foreground text-center mb-4">
                  没有找到匹配的商品信息，请尝试调整搜索条件
                </p>
                <Button onClick={handleAddProduct} className="btn-vibrant-teal">
                  <Plus className="mr-2 h-4 w-4" />
                  添加第一个商品
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}