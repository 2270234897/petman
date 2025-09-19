import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Tag, ArrowDownToLine, Copyright, Truck } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Inventory() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">库存管理</h1>
        <p className="text-muted-foreground">
          管理宠物用品和药品库存
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {/* 商品及规格管理 */}
        <Card 
          className="vibrant-card-blue border-2 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-6 w-6 mr-2" />
              商品及规格管理
            </CardTitle>
            <CardDescription>
              管理商品和规格信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              添加、编辑和删除商品信息，包括商品名称、品牌、分类等基本信息，同时管理规格信息。
            </p>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="default" 
                size="sm" 
                className="btn-vibrant-blue"
                onClick={() => navigate("/inventory/products")}
              >
                进入管理
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 分类管理 */}
        <Card 
          className="vibrant-card-green border-2 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-6 w-6 mr-2" />
              分类管理
            </CardTitle>
            <CardDescription>
              管理商品分类信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              管理商品分类和子分类，建立清晰的商品分类体系。
            </p>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="default" 
                size="sm" 
                className="btn-vibrant-green"
                onClick={() => navigate("/inventory/classify")}
              >
                进入管理
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 品牌管理 */}
        <Card 
          className="vibrant-card-yellow border-2 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Copyright className="h-6 w-6 mr-2" />
              品牌管理
            </CardTitle>
            <CardDescription>
              管理商品品牌信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              管理商品品牌信息，包括品牌名称和描述。
            </p>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="default" 
                size="sm" 
                className="btn-vibrant-yellow"
                onClick={() => navigate("/inventory/brands")}
              >
                进入管理
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 经销商管理 */}
        <Card 
          className="vibrant-card-orange border-2 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-6 w-6 mr-2" />
              经销商管理
            </CardTitle>
            <CardDescription>
              管理商品经销商信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              管理商品经销商信息，包括经销商名称、联系方式和地址。
            </p>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="default" 
                size="sm" 
                className="btn-vibrant-orange"
                onClick={() => navigate("/inventory/dealers")}
              >
                进入管理
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 库存管理 */}
        <Card 
          className="vibrant-card-purple border-2 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowDownToLine className="h-6 w-6 mr-2" />
              库存管理
            </CardTitle>
            <CardDescription>
              管理商品库存操作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              管理商品入库和出库操作，跟踪库存变化记录和库存状态。
            </p>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="default" 
                size="sm" 
                className="btn-vibrant-purple"
                onClick={() => navigate("/inventory/stock")}
              >
                进入管理
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}