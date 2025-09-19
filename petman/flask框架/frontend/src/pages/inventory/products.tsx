import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Plus, Search, Filter, Loader2, Edit, Trash2, Tag } from "lucide-react"
import { 
  useInventory, 
  useCreateInventoryItem, 
  useBrands, 
  useClassify,
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
  const { data: brandsData } = useBrands()
  const { data: classifyData } = useClassify()
  
  // 获取操作钩子
  const { mutate: createProduct } = useCreateInventoryItem()
  const { mutate: updateProduct } = useUpdateProduct()
  const { mutate: deleteProduct } = useDeleteProduct()
  
  const inventoryItems = data?.data || []
  const brands = brandsData?.data || []
  const categories = classifyData?.data || []
  
  const filteredInventory = inventoryItems.filter((item: any) =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brandname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.classify_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowAddForm(true)
  }

  const handleEdit = (product: any) => {
    // 构造用于编辑的商品数据
    const editData = {
      ...product,
      brand_id: product.brand_brandID,
      classify_id: product.classify_level1_classify1_ID,
      product_details: product.local,
      specs: product.specs.map((spec: any) => ({
        specID: spec.specID,
        name: spec.spec_name,
        value: spec.spec_value,
        stock: spec.总库存,
        barcode: spec.barcode,
        picture: spec.picture
      }))
    }
    
    setEditingProduct(editData)
    setShowAddForm(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`确定要删除商品"${name}"吗？此操作不可恢复。`)) {
      deleteProduct(id, {
        onSuccess: () => {
          toast.success("商品删除成功！")
          refetch()
        },
        onError: () => {
          toast.error("商品删除失败")
        }
      })
    }
  }

  const handleFormSubmit = (productData: any, specs: any[]) => {
    if (editingProduct) {
      // 更新商品
      updateProduct(
        { id: editingProduct.productID, data: { ...productData, specs } },
        {
          onSuccess: () => {
            toast.success("商品更新成功！")
            setEditingProduct(null)
            setShowAddForm(false)
            refetch()
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || "商品更新失败")
          }
        }
      )
    } else {
      // 创建新商品
      createProduct({ ...productData, specs }, {
        onSuccess: (response: any) => {
          toast.success("商品添加成功！")
          setShowAddForm(false)
          refetch()
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "商品添加失败")
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {showAddForm ? (
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
      ) : (
        <>
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

          {/* Search and Filter */}
          <Card className="vibrant-card-orange border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索商品名称、品牌或分类..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="btn-vibrant-orange">
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

          {/* Product List */}
          {!isLoading && (
            <>
              {filteredInventory.length > 0 ? (
                <div className="grid gap-6">
                  {filteredInventory.map((item: any) => (
                    <div key={item.productID} className="vibrant-card-orange border-2">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold">{item.product_name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                分类: {item.classify_name}
                              </span>
                              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                                品牌: {item.brandname}
                              </span>
                              <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                保质期: {item.product_baozhiqi}个月
                              </span>
                              {item.local && (
                                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  详情: {item.local}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <Tag className="mr-2 h-4 w-4" />
                            规格信息
                          </h4>
                          
                          {item.specs && item.specs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {item.specs.map((spec: any) => (
                                <div 
                                  key={spec.specID} 
                                  className="border rounded-lg p-4 bg-white"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="font-medium">{spec.spec_name}</h5>
                                      {spec.spec_value && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          规格值: {spec.spec_value}
                                        </p>
                                      )}
                                      {spec.barcode && spec.barcode !== "0" && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          条形码: {spec.barcode}
                                        </p>
                                      )}
                                      {spec.picture && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          图片: {spec.picture}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                      库存: {spec.总库存}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">暂无规格信息</p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button variant="default" size="sm" onClick={() => handleEdit(item)} className="btn-vibrant-blue">
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleDelete(item.productID, item.product_name)} 
                            className="btn-vibrant-red"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
        </>
      )}
    </div>
  )
}