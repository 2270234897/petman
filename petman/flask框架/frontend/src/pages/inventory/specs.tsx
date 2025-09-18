import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function InventorySpecs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">规格管理</h1>
        <p className="text-muted-foreground">
          管理商品规格信息
        </p>
      </div>
      
      <Card className="vibrant-card-blue border-2">
        <CardHeader>
          <CardTitle>功能说明</CardTitle>
          <CardDescription>
            规格管理功能已整合到商品管理中
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            为了提供更好的用户体验，规格管理功能已整合到"商品及规格管理"模块中。
            您可以在商品管理页面中同时管理商品信息和对应的规格信息。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}