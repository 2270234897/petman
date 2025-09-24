import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  Settings,
  Wand2,
  FileText,
  RefreshCw
} from "lucide-react"

interface FieldMapping {
  [key: string]: string
}

interface ExcelAnalysis {
  columns: string[]
  fieldMapping: FieldMapping
  recommendations: string[]
  totalRows: number
}

export function SmartExcelConverter() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<ExcelAnalysis | null>(null)
  const [customMapping, setCustomMapping] = useState<FieldMapping>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 标准字段定义
  const standardFields = {
    product_name: '商品名称',
    brand_name: '品牌名称', 
    classify_name: '分类名称',
    parent_classify_name: '父分类名称',
    spec_name: '规格名称',
    spec_value: '规格值',
    barcode: '条形码',
    picture: '图片路径',
    stock: '库存数量',
    expiry_months: '保质期(月)',
    origin: '产地',
    product_details: '商品详情',
    cover_image: '封面图片'
  }

  const requiredFields = ['product_name', 'brand_name', 'classify_name', 'spec_name', 'spec_value']

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast.error("请选择Excel文件 (.xlsx 或 .xls)")
        return
      }
      setSelectedFile(file)
      setAnalysis(null)
      setCustomMapping({})
      setConvertedFileUrl(null)
    }
  }

  const analyzeExcelFile = async () => {
    if (!selectedFile) {
      toast.error("请先选择Excel文件")
      return
    }

    setIsAnalyzing(true)
    try {
      // 使用SheetJS读取Excel文件
      const ExcelJS = await import('exceljs')
      const workbook = new ExcelJS.Workbook()
      const arrayBuffer = await selectedFile.arrayBuffer()
      await workbook.xlsx.load(arrayBuffer)
      
      const worksheet = workbook.worksheets[0]
      const columns = worksheet.getRow(1).values as any[]
      const columnNames = columns.slice(1).filter(col => col !== undefined) // 去掉第一个空值
      
      // 模拟字段映射分析
      const fieldMapping = analyzeFieldMapping(columnNames)
      const recommendations = generateRecommendations(fieldMapping, columnNames)
      
      setAnalysis({
        columns: columnNames,
        fieldMapping,
        recommendations,
        totalRows: worksheet.rowCount - 1
      })
      
      toast.success("文件分析完成！")
    } catch (error) {
      console.error('分析Excel文件失败:', error)
      toast.error("分析Excel文件失败，请检查文件格式")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeFieldMapping = (columns: string[]): FieldMapping => {
    const mapping: FieldMapping = {}
    
    // 字段映射规则
    const fieldRules = {
      product_name: ['商品名称', '产品名称', '产品名', '商品名', '名称', '品名', 'product', 'name'],
      brand_name: ['品牌名称', '品牌', '生产厂家', '制造商', '厂商', '品牌商', 'brand', 'manufacturer'],
      classify_name: ['分类名称', '类别', '产品分类', '商品类别', '分类', 'category', 'type'],
      parent_classify_name: ['父分类名称', '上级分类', '大类', '主分类', 'parent', 'main'],
      spec_name: ['规格名称', '规格', '规格型号', '型号', '规格描述', 'spec', 'model'],
      spec_value: ['规格值', '规格内容', '规格大小', '规格描述', '型号值', 'size', 'value'],
      barcode: ['条形码', '条码', '商品条码', '产品条码', '条码号', 'barcode', 'code'],
      picture: ['图片路径', '图片', '商品图片', '产品图片', '图片URL', 'image', 'photo'],
      stock: ['库存数量', '库存', '数量', '库存量', '现有库存', 'stock', 'quantity'],
      expiry_months: ['保质期(月)', '保质期', '有效期', '保存期', 'expiry', 'shelf'],
      origin: ['产地', '生产地', '原产地', '生产国家', '来源地', 'origin', 'country'],
      product_details: ['商品详情', '产品详情', '详细描述', '产品描述', 'description', 'details'],
      cover_image: ['封面图片', '主图', '商品封面', '产品封面', 'cover', 'main_image']
    }

    // 进行智能匹配
    for (const [standardField, possibleNames] of Object.entries(fieldRules)) {
      for (const col of columns) {
        const colLower = col.toLowerCase()
        for (const possibleName of possibleNames) {
          if (colLower.includes(possibleName.toLowerCase()) || possibleName.toLowerCase().includes(colLower)) {
            mapping[standardField] = col
            break
          }
        }
        if (mapping[standardField]) break
      }
    }

    return mapping
  }

  const generateRecommendations = (fieldMapping: FieldMapping, columns: string[]): string[] => {
    const recommendations = []
    
    // 检查缺失的必填字段
    const missingRequired = requiredFields.filter(field => !fieldMapping[field])
    if (missingRequired.length > 0) {
      recommendations.push(`⚠️ 缺少必填字段: ${missingRequired.map(f => standardFields[f as keyof typeof standardFields]).join(', ')}`)
    }
    
    // 检查未映射的列
    const mappedColumns = Object.values(fieldMapping)
    const unmappedColumns = columns.filter(col => !mappedColumns.includes(col))
    if (unmappedColumns.length > 0) {
      recommendations.push(`📋 未映射的列: ${unmappedColumns.join(', ')}`)
    }
    
    // 检查规格字段
    if (!fieldMapping.spec_name && !fieldMapping.spec_value) {
      recommendations.push("🔍 建议检查是否有合并的规格列需要手动映射")
    }
    
    if (recommendations.length === 0) {
      recommendations.push("✅ 字段映射良好，可以直接转换")
    }
    
    return recommendations
  }

  const convertExcelFile = async () => {
    if (!selectedFile || !analysis) {
      toast.error("请先分析Excel文件")
      return
    }

    setIsConverting(true)
    try {
      // 使用SheetJS处理Excel文件
      const ExcelJS = await import('exceljs')
      const workbook = new ExcelJS.Workbook()
      const arrayBuffer = await selectedFile.arrayBuffer()
      await workbook.xlsx.load(arrayBuffer)
      
      const worksheet = workbook.worksheets[0]
      
      // 创建新的工作簿
      const newWorkbook = new ExcelJS.Workbook()
      const newWorksheet = newWorkbook.addWorksheet('转换后数据')
      
      // 添加标准标题行
      const standardHeaders = Object.values(standardFields)
      newWorksheet.addRow(standardHeaders)
      
      // 转换数据
      const fieldMapping = { ...analysis.fieldMapping, ...customMapping }
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return // 跳过标题行
        
        const rowData = row.values as any[]
        const newRowData = new Array(standardHeaders.length).fill('')
        
        // 映射数据
        Object.entries(fieldMapping).forEach(([standardField, sourceColumn]) => {
          const sourceIndex = analysis.columns.indexOf(sourceColumn)
          if (sourceIndex !== -1 && sourceIndex < rowData.length - 1) {
            const targetIndex = Object.values(standardFields).indexOf(standardFields[standardField as keyof typeof standardFields])
            if (targetIndex !== -1) {
              newRowData[targetIndex] = rowData[sourceIndex + 1] || ''
            }
          }
        })
        
        // 填充默认值
        if (newRowData[0]) { // 如果有商品名称
          newRowData[8] = newRowData[8] || 0 // 库存数量
          newRowData[9] = newRowData[9] || 12 // 保质期
          newWorksheet.addRow(newRowData)
        }
      })
      
      // 设置列宽
      newWorksheet.columns.forEach(column => {
        column.width = 15
      })
      
      // 生成文件
      const buffer = await newWorkbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      setConvertedFileUrl(url)
      
      toast.success("Excel文件转换完成！")
    } catch (error) {
      console.error('转换Excel文件失败:', error)
      toast.error("转换Excel文件失败")
    } finally {
      setIsConverting(false)
    }
  }

  const downloadConvertedFile = () => {
    if (convertedFileUrl) {
      const link = document.createElement('a')
      link.href = convertedFileUrl
      link.download = `转换后_${selectedFile?.name || '商品数据.xlsx'}`
      link.click()
      toast.success("文件下载成功！")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">智能Excel转换器</h1>
          <p className="text-muted-foreground">
            自动识别和转换不同格式的Excel文件到系统标准格式，无需手动整理
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-vibrant-teal">
              <Wand2 className="mr-2 h-4 w-4" />
              智能转换
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>智能Excel格式转换</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* 文件选择 */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">1. 选择您的Excel文件</Label>
                <Input
                  ref={fileInputRef}
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

              {/* 分析文件 */}
              {selectedFile && !analysis && (
                <div className="space-y-2">
                  <Button 
                    onClick={analyzeExcelFile}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        分析文件中...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        分析文件结构
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* 分析结果 */}
              {analysis && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">📊 文件分析结果</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• 总行数: {analysis.totalRows}</p>
                      <p>• 列数: {analysis.columns.length}</p>
                      <p>• 列名: {analysis.columns.join(', ')}</p>
                    </div>
                  </div>

                  {/* 字段映射 */}
                  <div className="space-y-2">
                    <Label>2. 字段映射 (可手动调整)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(standardFields).map(([key, label]) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-sm font-medium">
                            {label} {requiredFields.includes(key) && <span className="text-red-500">*</span>}
                          </Label>
                          <Select
                            value={customMapping[key] || analysis.fieldMapping[key] || '__none__'}
                            onValueChange={(value) => setCustomMapping(prev => ({ 
                              ...prev, 
                              [key]: value === '__none__' ? '' : value 
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`选择对应的列`} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">-- 不映射 --</SelectItem>
                              {analysis.columns.map(col => (
                                <SelectItem key={col} value={col}>{col}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 建议 */}
                  <div className="space-y-2">
                    <Label>💡 系统建议</Label>
                    <div className="space-y-1">
                      {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="text-sm p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 转换按钮 */}
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAnalysis(null)
                        setCustomMapping({})
                        setConvertedFileUrl(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      重新选择文件
                    </Button>
                    <Button 
                      onClick={convertExcelFile}
                      disabled={isConverting}
                      className="btn-vibrant-blue"
                    >
                      {isConverting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          转换中...
                        </>
                      ) : (
                        <>
                          <Settings className="mr-2 h-4 w-4" />
                          开始转换
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* 转换结果 */}
              {convertedFileUrl && (
                <div className="space-y-2">
                  <Label>✅ 转换完成</Label>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      Excel文件已成功转换为标准格式
                    </div>
                    <Button onClick={downloadConvertedFile} className="btn-vibrant-teal">
                      <Download className="mr-2 h-4 w-4" />
                      下载转换后的文件
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="vibrant-card-blue border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            智能转换功能
          </CardTitle>
          <CardDescription>
            无需手动整理Excel文件，系统自动识别和转换格式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">🎯 支持的格式</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 任意列名格式 (自动识别)</li>
                  <li>• 中英文混合列名</li>
                  <li>• 合并的规格列 (如"重量:3kg")</li>
                  <li>• 不同的数据格式</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">⚡ 智能特性</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 自动字段映射识别</li>
                  <li>• 手动调整映射关系</li>
                  <li>• 数据格式自动转换</li>
                  <li>• 缺失字段智能填充</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">使用步骤</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. 选择您的Excel文件（无需整理格式）</li>
                <li>2. 系统自动分析文件结构并识别字段</li>
                <li>3. 检查并调整字段映射关系</li>
                <li>4. 一键转换为系统标准格式</li>
                <li>5. 下载转换后的文件并导入系统</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
