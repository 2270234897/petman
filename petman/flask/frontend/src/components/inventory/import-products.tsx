import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle } from "lucide-react"
import api from "@/lib/api-client"

interface ImportResult {
  success_count: number
  error_count: number
  errors: string[]
}

export function ImportProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const queryClient = useQueryClient()

  const importMutation = useMutation({
    mutationFn: async (products: any[]) => {
      const response = await api.post("/api/inventory/import/products", { products })
      return response.data
    },
    onSuccess: (data) => {
      setImportResult(data)
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      queryClient.invalidateQueries({ queryKey: ["classify"] })
      toast.success("商品导入完成！")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "导入失败，请重试")
    },
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast.error("请选择Excel文件 (.xlsx 或 .xls)")
        return
      }
      setSelectedFile(file)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("请先选择Excel文件")
      return
    }

    setIsImporting(true)
    try {
      // 读取Excel文件
      const formData = new FormData()
      formData.append('file', selectedFile)

      // 使用SheetJS库解析Excel文件
      const ExcelJS = await import('exceljs')
      const workbook = new ExcelJS.Workbook()
      
      const arrayBuffer = await selectedFile.arrayBuffer()
      await workbook.xlsx.load(arrayBuffer)
      
      const worksheet = workbook.worksheets[0]
      const products: any[] = []

      // 读取数据行（跳过标题行）
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return // 跳过标题行

        const rowData = row.values as any[]
        if (rowData.length < 5) return // 至少需要5列基本数据

        const product = {
          product_name: rowData[1] || '', // 商品名称
          brand_name: rowData[2] || '', // 品牌名称
          classify_name: rowData[3] || '', // 分类名称
          parent_classify_name: rowData[4] || '', // 父分类名称
          spec_name: rowData[5] || '', // 规格名称
          spec_value: rowData[6] || '', // 规格值
          barcode: rowData[7] || '', // 条形码
          picture: rowData[8] || '', // 图片路径
          'total_stock': rowData[9] || 0,
          product_baozhiqi: rowData[10] || 12, // 保质期
          local: rowData[11] || '', // 产地
          product_details: rowData[12] || '', // 商品详情
          cover_image: rowData[13] || '', // 封面图片
        }

        // 只添加有商品名称的行
        if (product.product_name) {
          products.push(product)
        }
      })

      if (products.length === 0) {
        toast.error("Excel文件中没有有效数据")
        return
      }

      // 调用导入API
      importMutation.mutate(products)

    } catch (error) {
      console.error('解析Excel文件失败:', error)
      toast.error("解析Excel文件失败，请检查文件格式")
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    // 创建模板数据
    const templateData = [
      {
        '商品名称': '皇家小型犬成犬粮',
        '品牌名称': '皇家',
        '分类名称': '狗粮',
        '父分类名称': '宠物食品',
        '规格名称': '重量',
        '规格值': '3kg',
        '条形码': '100001',
        '图片路径': 'royal_3kg.jpg',
        '库存数量': 50,
        '保质期(月)': 12,
        '产地': '法国',
        '商品详情': '专为小型犬设计的营养均衡成犬粮，富含蛋白质和维生素',
        '封面图片': 'royal_small_dog.jpg'
      },
      {
        '商品名称': '皇家小型犬成犬粮',
        '品牌名称': '皇家',
        '分类名称': '狗粮',
        '父分类名称': '宠物食品',
        '规格名称': '重量',
        '规格值': '10kg',
        '条形码': '100002',
        '图片路径': 'royal_10kg.jpg',
        '库存数量': 30,
        '保质期(月)': 12,
        '产地': '法国',
        '商品详情': '专为小型犬设计的营养均衡成犬粮，富含蛋白质和维生素',
        '封面图片': 'royal_small_dog.jpg'
      },
      {
        '商品名称': '宝路牛肉味狗粮',
        '品牌名称': '宝路',
        '分类名称': '狗粮',
        '父分类名称': '宠物食品',
        '规格名称': '重量',
        '规格值': '2kg',
        '条形码': '100003',
        '图片路径': 'pedigree_2kg.jpg',
        '库存数量': 40,
        '保质期(月)': 18,
        '产地': '中国',
        '商品详情': '牛肉味狗粮，营养丰富，适合成犬食用',
        '封面图片': 'pedigree_beef.jpg'
      }
    ]

    // 使用SheetJS创建Excel文件
    const createExcelFile = async () => {
      try {
        const ExcelJS = await import('exceljs')
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('商品数据')

        // 添加标题行
        const headers = [
          '商品名称', '品牌名称', '分类名称', '父分类名称', '规格名称', 
          '规格值', '条形码', '图片路径', '库存数量', '保质期(月)', '产地', '商品详情', '封面图片'
        ]
        worksheet.addRow(headers)

        // 添加数据行
        templateData.forEach(row => {
          worksheet.addRow([
            row['商品名称'],
            row['品牌名称'],
            row['分类名称'],
            row['父分类名称'],
            row['规格名称'],
            row['规格值'],
            row['条形码'],
            row['图片路径'],
            row['库存数量'],
            row['保质期(月)'],
            row['产地'],
            row['商品详情'],
            row['封面图片']
          ])
        })

        // 设置列宽
        worksheet.columns.forEach(column => {
          column.width = 15
        })

        // 下载文件
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '商品导入模板.xlsx'
        link.click()
        window.URL.revokeObjectURL(url)

        toast.success("模板下载成功！")
      } catch (error) {
        console.error('创建Excel文件失败:', error)
        toast.error("创建模板失败")
      }
    }

    createExcelFile()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">商品批量导入</h1>
          <p className="text-muted-foreground">
            通过Excel文件批量导入商品信息，支持自动创建品牌和分类
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-vibrant-teal">
              <Upload className="mr-2 h-4 w-4" />
              导入商品
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>批量导入商品数据</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* 下载模板 */}
              <div className="space-y-2">
                <Label>1. 下载导入模板</Label>
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载Excel导入模板
                </Button>
              </div>

              {/* 文件选择 */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">2. 选择Excel文件</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileSpreadsheet className="h-4 w-4" />
                    {selectedFile.name}
                  </div>
                )}
              </div>

              {/* 导入说明 */}
              <div className="space-y-2">
                <Label>导入说明</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• 必填字段：商品名称、品牌名称、分类名称、规格名称、规格值</p>
                  <p>• 可选字段：父分类名称、条形码、图片路径、库存数量、保质期、产地、商品详情、封面图片</p>
                  <p>• 如果品牌或分类不存在，系统会自动创建</p>
                  <p>• 每个商品规格会创建为独立的规格记录</p>
                  <p>• 相同商品的不同规格可以有多行数据</p>
                </div>
              </div>

              {/* 导入结果 */}
              {importResult && (
                <div className="space-y-2">
                  <Label>导入结果</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      成功导入: {importResult.success_count} 条记录
                    </div>
                    {importResult.error_count > 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        失败: {importResult.error_count} 条记录
                      </div>
                    )}
                    {importResult.errors.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">错误详情:</p>
                        <div className="max-h-32 overflow-y-auto text-xs text-red-600">
                          {importResult.errors.map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setSelectedFile(null)
                    setImportResult(null)
                  }}
                >
                  关闭
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={!selectedFile || isImporting}
                  className="btn-vibrant-blue"
                >
                  {isImporting ? "导入中..." : "开始导入"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="vibrant-card-blue border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            导入指南
          </CardTitle>
          <CardDescription>
            按照以下步骤完成商品数据的批量导入
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Excel文件格式要求</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 文件格式：.xlsx 或 .xls</li>
                  <li>• 第一行为标题行</li>
                  <li>• 每行代表一个商品规格</li>
                  <li>• 支持中文列名</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">数据字段说明</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 商品名称：必填，商品的基础名称</li>
                  <li>• 品牌名称：必填，会自动创建不存在的品牌</li>
                  <li>• 分类名称：必填，会自动创建不存在的分类</li>
                  <li>• 规格名称/值：必填，如"重量-3kg"</li>
                  <li>• 商品详情：可选，商品的详细描述</li>
                  <li>• 封面图片：可选，商品的主要展示图片URL</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">注意事项</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 导入前建议先下载模板，按照模板格式整理数据</li>
                <li>• 相同商品的不同规格需要分别填写行</li>
                <li>• 品牌和分类如果不存在会自动创建</li>
                <li>• 导入过程中如有错误，会显示具体的错误信息</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
