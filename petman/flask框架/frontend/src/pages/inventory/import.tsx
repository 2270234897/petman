import { ImportProducts } from "@/components/inventory/import-products"
import { SmartExcelConverter } from "@/components/inventory/smart-excel-converter"

export function ImportPage() {
  return (
    <div className="space-y-8">
      <SmartExcelConverter />
      <ImportProducts />
    </div>
  )
}
