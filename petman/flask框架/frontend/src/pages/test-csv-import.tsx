import { CSVImport } from "@/components/inventory/csv-import"

export function TestCSVImport() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">CSV商品导入测试</h1>
        <p className="text-gray-600">
          这个页面用于测试CSV商品导入功能。请选择你的CSV文件进行导入。
        </p>
      </div>
      
      <CSVImport onImportComplete={() => {
        console.log('导入完成')
      }} />
    </div>
  )
}
