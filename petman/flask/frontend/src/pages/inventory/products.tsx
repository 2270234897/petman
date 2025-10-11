import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Edit, 
  Trash2, 
  Tag,
  Image as ImageIcon,
  Eye,
  EyeOff
} from "lucide-react"
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
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set())
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
        stock: spec.total_stock,
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
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "商品删除失败")
        }
      })
    }
  }

  const handleFormSubmit = (productData: any) => {
    if (editingProduct) {
      // 更新商品
      updateProduct(
        { id: editingProduct.productID, data: productData },
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
      createProduct(productData, {
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

  const toggleExpanded = (productId: number) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  const getProductCoverImage = (product: any) => {
    // 优先使用商品封面图片，如果没有则使用第一个有图片的规格的图片
    if (product.cover_image && product.cover_image.trim()) {
      // 检查是否是 base64 数据URI
      if (product.cover_image.startsWith('data:')) {
        return product.cover_image
      }
      // 检查是否是完整的URL
      if (product.cover_image.startsWith('http://') || product.cover_image.startsWith('https://')) {
        return product.cover_image
      }
      // 如果是相对路径，添加正确的路径前缀
      return `/api/static/${product.cover_image}`
    }
    
    if (product.specs && product.specs.length > 0) {
      const specWithImage = product.specs.find((spec: any) => spec.picture && spec.picture.trim())
      if (specWithImage) {
        // 检查是否是 base64 数据URI
        if (specWithImage.picture.startsWith('data:')) {
          return specWithImage.picture
        }
        // 检查是否是完整的URL
        if (specWithImage.picture.startsWith('http://') || specWithImage.picture.startsWith('https://')) {
          return specWithImage.picture
        }
        // 如果是相对路径，添加正确的路径前缀
        return `/api/static/${specWithImage.picture}`
      }
    }
    return null
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
              <h1 className="text-3xl font-bold tracking-tight">商品管理</h1>
              <p className="text-muted-foreground">
                管理商品信息，规格作为商品的属性进行管理
              </p>
            </div>
            <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              新增商品
            </Button>
          </div>

          {/* Search and Filter */}
          <Card className="border border-gray-200 shadow-sm">
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

          {/* Product List */}
          {!isLoading && (
            <>
              {filteredInventory.length > 0 ? (
                <div className="space-y-4">
                  {filteredInventory.map((item: any) => {
                    const isExpanded = expandedProducts.has(item.productID)
                    const coverImage = getProductCoverImage(item)
                    const totalStock = item.specs?.reduce((sum: number, spec: any) => sum + (spec.total_stock || 0), 0) || 0
                    
                    return (
                      <Card key={item.productID} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          {/* 商品基本信息行 */}
                          <div className="flex items-center gap-4">
                            {/* 商品封面图 */}
                            <div className="flex-shrink-0">
                              {coverImage ? (
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                  <img 
                                    src={coverImage} 
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  />
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100 hidden">
                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* 商品信息 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {item.product_name}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  ID: {item.productID}
                                </Badge>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                <Badge variant="outline" className="text-xs">
                                  {item.brandname}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.classify_name}
                                </Badge>
                                <span>保质期: {item.product_baozhiqi ? `${item.product_baozhiqi}个月` : '无保质期'}</span>
                                <span>Stock: {totalStock}</span>
                                {item.local && (
                                  <span className="text-gray-500">| {item.local}</span>
                                )}
                              </div>
                            </div>
                            
                            {/* 操作按钮 */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(item.productID)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                {isExpanded ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                                <span className="ml-1">
                                  {isExpanded ? '收起' : '展开'}
                                </span>
                              </Button>
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
                                onClick={() => handleDelete(item.productID, item.product_name)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                删除
                              </Button>
                            </div>
                          </div>
                          
                          {/* 展开的规格信息 */}
                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <div className="flex items-center gap-2 mb-4">
                                <Tag className="h-4 w-4 text-gray-500" />
                                <h4 className="font-medium text-gray-900">规格详情</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {item.specs?.length || 0} 个规格
                                </Badge>
                              </div>
                              
                              {item.specs && item.specs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {item.specs.map((spec: any) => (
                                    <div 
                                      key={spec.specID} 
                                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-medium text-gray-900">{spec.spec_name}</h5>
                                        <Badge 
                                          variant={spec.total_stock > 0 ? "default" : "destructive"}
                                          className="text-xs"
                                        >
                                          Stock: {spec.total_stock}
                                        </Badge>
                                      </div>
                                      
                                      <div className="space-y-1 text-sm text-gray-600">
                                        {spec.spec_value && (
                                          <p>规格值: <span className="font-medium">{spec.spec_value}</span></p>
                                        )}
                                        {spec.barcode && spec.barcode !== "0" && (
                                          <p>条形码: <span className="font-mono text-xs">{spec.barcode}</span></p>
                                        )}
                                        {spec.picture && (
                                          <div className="flex items-center gap-2">
                                            <span>图片:</span>
                                            <div className="w-8 h-8 rounded overflow-hidden bg-white border">
                                              <img 
                                                src={
                                                  spec.picture.startsWith('data:') || spec.picture.startsWith('http://') || spec.picture.startsWith('https://') 
                                                    ? spec.picture 
                                                    : `/api/static/${spec.picture}`
                                                } 
                                                alt={spec.spec_name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  e.currentTarget.style.display = 'none'
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                  <p>暂无规格信息</p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">暂无商品数据</h3>
                    <p className="text-gray-500 text-center mb-4">
                      没有找到匹配的商品信息，请尝试调整搜索条件
                    </p>
                    <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700 text-white">
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