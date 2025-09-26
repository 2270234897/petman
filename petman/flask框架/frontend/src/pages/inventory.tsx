import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Tag, ArrowDownToLine, Copyright, Truck, Upload, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Inventory() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">库存管理</h1>
          <p className="text-muted-foreground">
            管理宠物用品和药品库存
          </p>
        </div>
        <Button 
          className="btn-vibrant-teal"
          onClick={() => navigate("/inventory/import")}
        >
          <Upload className="mr-2 h-4 w-4" />
          批量导入
        </Button>
      </div>

      {/* 主要功能区域 - 突出显示 */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* 商品及规格管理 - 主要功能 */}
        <Card 
          className="vibrant-card-blue border-3 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100"
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <Package className="h-8 w-8 mr-3 text-blue-600" />
              商品及规格管理
            </CardTitle>
            <CardDescription className="text-base">
              管理商品和规格信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              添加、编辑和删除商品信息，包括商品名称、品牌、分类等基本信息，同时管理规格信息。
            </p>
            <div className="flex justify-end">
              <Button 
                variant="default" 
                size="lg" 
                className="btn-vibrant-blue text-base px-6 py-3"
                onClick={() => navigate("/inventory/products")}
              >
                进入管理
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 库存管理 - 主要功能 */}
        <Card 
          className="vibrant-card-purple border-3 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100"
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <ArrowDownToLine className="h-8 w-8 mr-3 text-purple-600" />
              库存管理
            </CardTitle>
            <CardDescription className="text-base">
              管理商品库存操作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              管理商品入库和出库操作，跟踪库存变化记录和库存状态。
            </p>
            <div className="flex justify-end">
              <Button 
                variant="default" 
                size="lg" 
                className="btn-vibrant-purple text-base px-6 py-3"
                onClick={() => navigate("/inventory/stock")}
              >
                进入管理
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 辅助功能区域 - 弱化显示 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-sm text-gray-500 px-3">辅助管理功能</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-4">
          {/* 规格管理 - 弱化 */}
          <Card 
            className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow bg-white/60 opacity-80 hover:opacity-100"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Settings className="h-4 w-4 mr-2 text-gray-600" />
                规格管理
              </CardTitle>
              <CardDescription className="text-xs">
                管理商品规格类型
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                管理商品规格类型，如重量、尺寸、颜色等规格属性。
              </p>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs px-3 py-1"
                  onClick={() => navigate("/inventory/specs")}
                >
                  进入管理
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 分类管理 - 弱化 */}
          <Card 
            className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow bg-white/60 opacity-80 hover:opacity-100"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Tag className="h-4 w-4 mr-2 text-gray-600" />
                分类管理
              </CardTitle>
              <CardDescription className="text-xs">
                管理商品分类信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                管理商品分类和子分类，建立清晰的商品分类体系。
              </p>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs px-3 py-1"
                  onClick={() => navigate("/inventory/classify")}
                >
                  进入管理
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 品牌管理 - 弱化 */}
          <Card 
            className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow bg-white/60 opacity-80 hover:opacity-100"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Copyright className="h-4 w-4 mr-2 text-gray-600" />
                品牌管理
              </CardTitle>
              <CardDescription className="text-xs">
                管理商品品牌信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                管理商品品牌信息，包括品牌名称和描述。
              </p>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs px-3 py-1"
                  onClick={() => navigate("/inventory/brands")}
                >
                  进入管理
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 经销商管理 - 弱化 */}
          <Card 
            className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow bg-white/60 opacity-80 hover:opacity-100"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm">
                <Truck className="h-4 w-4 mr-2 text-gray-600" />
                经销商管理
              </CardTitle>
              <CardDescription className="text-xs">
                管理商品经销商信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                管理商品经销商信息，包括经销商名称、联系方式和地址。
              </p>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs px-3 py-1"
                  onClick={() => navigate("/inventory/dealers")}
                >
                  进入管理
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
