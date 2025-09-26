import { ImportProducts } from "@/components/inventory/import-products"
import { SmartExcelConverter } from "@/components/inventory/smart-excel-converter"
import { CSVImport } from "@/components/inventory/csv-import"

export function ImportPage() {
  return (
    <div className="space-y-8">
      <CSVImport />
      <SmartExcelConverter />
      <ImportProducts />
    </div>
  )
}
