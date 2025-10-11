import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff
} from "lucide-react"
import { toast } from "sonner"
import { 
  convertCSVData, 
  generateImportReport, 
  type CSVProductRow, 
  type ConvertedProduct,
  type ImportReport 
} from "@/lib/csv-converter"
import { processCSVFile, validateCSVData, generateDataStats } from "@/lib/csv-processor"
import { useBrands, useClassify, useCreateBrand, useCreateClassify, useCreateInventoryItem } from "@/hooks/useApi"

interface CSVImportProps {
  onImportComplete?: () => void
}

export function CSVImport({ onImportComplete }: CSVImportProps) {
  const [csvData, setCsvData] = useState<CSVProductRow[]>([])
  const [convertedProducts, setConvertedProducts] = useState<ConvertedProduct[]>([])
  const [importReport, setImportReport] = useState<ImportReport | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 条形码去重集合
  const [usedBarcodes, setUsedBarcodes] = useState<Set<string>>(new Set())

  // API hooks
  const { data: brandsData, refetch: refetchBrands } = useBrands()
  const { data: classifyData, refetch: refetchClassify } = useClassify()
  const { mutate: createBrand } = useCreateBrand()
  const { mutate: createClassify } = useCreateClassify()
  const { mutate: createProduct } = useCreateInventoryItem()

  const existingBrands = brandsData?.data || []
  const existingCategories = classifyData?.data || []

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error("请选择CSV文件")
      return
    }

    setIsProcessing(true)
    try {
      // 使用新的CSV处理器
      const result = await processCSVFile(file)
      
      if (!result.success) {
        toast.error(result.error || "处理CSV文件失败")
        return
      }

      const data = result.data!
      setCsvData(data)
      
      // 验证数据质量
      const validation = validateCSVData(data)
      if (!validation.valid) {
        toast.error(`数据验证失败: ${validation.errors.slice(0, 3).join(', ')}`)
        return
      }
      
      // 转换数据
      const converted = convertCSVData(data)
      setConvertedProducts(converted)
      
      // 生成报告
      const report = generateImportReport(data)
      setImportReport(report)
      
      // 生成统计信息
      const stats = generateDataStats(data)
      
      toast.success(`成功解析 ${data.length} 条商品数据，包含 ${stats.brands.length} 个品牌，${stats.categories.length} 个分类`)
      
      if (validation.warnings.length > 0) {
        toast.warning(`发现 ${validation.warnings.length} 个警告，请检查数据质量`)
      }
    } catch (error) {
      console.error('解析CSV文件失败:', error)
      toast.error("解析CSV文件失败，请检查文件格式")
    } finally {
      setIsProcessing(false)
    }
  }

  // 创建缺失的品牌
  const createMissingBrands = async (brands: Set<string>): Promise<Map<string, number>> => {
    const brandMap = new Map<string, number>()
    
    // 先映射现有品牌
    for (const brand of existingBrands) {
      brandMap.set(brand.brandname, brand.brandID)
    }

    // 创建新品牌
    for (const brandName of brands) {
      if (!brandMap.has(brandName)) {
        try {
          const newBrand = await new Promise((resolve, reject) => {
            createBrand({ brandname: brandName }, {
              onSuccess: (response: any) => resolve(response.data),
              onError: reject
            })
          })
          brandMap.set(brandName, (newBrand as any).brandID)
        } catch (error) {
          console.error(`创建品牌失败: ${brandName}`, error)
          // 如果创建失败，使用默认品牌ID，避免整个导入失败
          console.warn(`使用默认品牌ID替代: ${brandName}`)
          brandMap.set(brandName, 1) // 使用默认品牌ID
        }
      }
    }

    return brandMap
  }

  // 创建缺失的分类 - 优化版本，忽略分类错误确保商品导入成功
  const createMissingCategories = async (categories: Set<string>): Promise<Map<string, number>> => {
    const categoryMap = new Map<string, number>()
    
    // 先映射现有分类
    for (const category of existingCategories) {
      categoryMap.set(category.classify_name, category.classify1_ID)
    }

    // 获取默认分类ID（使用第一个现有分类或默认值1）
    const defaultCategoryId = existingCategories.length > 0 ? existingCategories[0].classify1_ID : 1

    // 分类层级映射 - 定义分类的父子关系
    const categoryHierarchy: Record<string, { parent: string | null, level: number }> = {
      // 一级分类
      '宠物食品': { parent: null, level: 1 },
      '洗护清洁': { parent: null, level: 1 },
      '宠物玩具': { parent: null, level: 1 },
      '宠物用品': { parent: null, level: 1 },
      '宠物健康': { parent: null, level: 1 },
      '宠物服饰': { parent: null, level: 1 },
      
      // 宠物食品 - 二级分类
      '狗粮': { parent: '宠物食品', level: 2 },
      '猫粮': { parent: '宠物食品', level: 2 },
      '宠物零食': { parent: '宠物食品', level: 2 },
      '宠物罐头': { parent: '宠物食品', level: 2 },
      '宠物冻干': { parent: '宠物食品', level: 2 },
      '宠物保健品': { parent: '宠物食品', level: 2 },
      
      // 洗护清洁 - 二级分类
      '洗护用品': { parent: '洗护清洁', level: 2 },
      '清洁用品': { parent: '洗护清洁', level: 2 },
      '口腔护理': { parent: '洗护清洁', level: 2 },
      '耳朵护理': { parent: '洗护清洁', level: 2 },
      
      // 宠物玩具 - 二级分类
      '互动玩具': { parent: '宠物玩具', level: 2 },
      '磨牙玩具': { parent: '宠物玩具', level: 2 },
      '益智玩具': { parent: '宠物玩具', level: 2 },
      '户外玩具': { parent: '宠物玩具', level: 2 },
      
      // 宠物用品 - 二级分类
      '食具水具': { parent: '宠物用品', level: 2 },
      '猫砂用品': { parent: '宠物用品', level: 2 },
      '窝垫用品': { parent: '宠物用品', level: 2 },
      '出行用品': { parent: '宠物用品', level: 2 },
      '笼具用品': { parent: '宠物用品', level: 2 },
      
      // 宠物健康 - 二级分类
      '医疗用品': { parent: '宠物健康', level: 2 },
      '营养补充': { parent: '宠物健康', level: 2 },
      '驱虫用品': { parent: '宠物健康', level: 2 },
      '急救用品': { parent: '宠物健康', level: 2 },
      
      // 宠物服饰 - 二级分类
      '服装': { parent: '宠物服饰', level: 2 },
      '配饰': { parent: '宠物服饰', level: 2 },
      '鞋袜': { parent: '宠物服饰', level: 2 },
      '保暖用品': { parent: '宠物服饰', level: 2 },
    }

    // 获取分类的父分类
    const getParentCategory = (categoryName: string): string | null => {
      return categoryHierarchy[categoryName]?.parent || null
    }

    // 按层级顺序创建分类（先创建父分类）
    const sortedCategories = Array.from(categories).sort((a, b) => {
      const levelA = categoryHierarchy[a]?.level || 1
      const levelB = categoryHierarchy[b]?.level || 1
      return levelA - levelB
    })

    let successCount = 0
    let failCount = 0

    // 创建新分类 - 优化错误处理
    for (const categoryName of sortedCategories) {
      if (!categoryMap.has(categoryName)) {
        try {
          const parentCategory = getParentCategory(categoryName)
          const parentId = parentCategory && categoryMap.has(parentCategory) 
            ? categoryMap.get(parentCategory) 
            : null

          const newCategory = await new Promise((resolve, reject) => {
            createClassify({ 
              name: categoryName,
              parentID: parentId
            }, {
              onSuccess: (response: any) => resolve(response.data),
              onError: reject
            })
          })
          categoryMap.set(categoryName, (newCategory as any).classify1_ID)
          successCount++
          console.log(`✅ 成功创建分类: ${categoryName} (父分类: ${parentCategory || '无'})`)
        } catch (error) {
          console.warn(`⚠️ 创建分类失败: ${categoryName}，使用默认分类ID: ${defaultCategoryId}`)
          // 分类创建失败时，使用默认分类ID，确保商品导入不会中断
          categoryMap.set(categoryName, defaultCategoryId)
          failCount++
        }
      }
    }

    // 显示分类创建结果
    if (failCount > 0) {
      toast.warning(`分类创建完成：成功 ${successCount} 个，失败 ${failCount} 个。失败的分类已使用默认分类，商品导入将继续进行。`)
    } else {
      toast.success(`分类创建完成：成功创建 ${successCount} 个分类`)
    }

    return categoryMap
  }

  // 执行导入
  const handleImport = async () => {
    if (!importReport || convertedProducts.length === 0) {
      toast.error("没有可导入的数据")
      return
    }

    setIsImporting(true)
    setImportProgress({ current: 0, total: convertedProducts.length })

    try {
      // 创建缺失的品牌和分类
      toast.info("正在创建缺失的品牌和分类...")
      const brandMap = await createMissingBrands(importReport.brands)
      const categoryMap = await createMissingCategories(importReport.categories)
      
      toast.success(`品牌和分类创建完成！`)

      // 按商品名称分组
      const productGroups = new Map<string, ConvertedProduct[]>()
      for (const product of convertedProducts) {
        const key = product.product_name
        if (!productGroups.has(key)) {
          productGroups.set(key, [])
        }
        productGroups.get(key)!.push(product)
      }

      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      // 逐个导入商品 - 优化版本，确保商品导入成功
      for (const [productName, specs] of productGroups) {
        let productData: any = null
        try {
          // 获取品牌ID，如果不存在则使用默认品牌ID
          const brandId = brandMap.get(specs[0].brand_name) || (existingBrands.length > 0 ? existingBrands[0].brandID : 1)
          
          // 获取分类ID，如果不存在则使用默认分类ID
          const categoryId = categoryMap.get(specs[0].classify_name) || (existingCategories.length > 0 ? existingCategories[0].classify1_ID : 1)

          // 构造商品数据 - 修复数据结构
          productData = {
            product_name: productName,
            brand_brandID: brandId,
            classify_level1_classify1_ID: categoryId,
            product_baozhiqi: specs[0].product_baozhiqi || 12, // 默认12个月
            local: specs[0].local || '中国', // 默认产地
            cover_image: specs[0].cover_image || '',
            specs: specs.map(spec => ({
              spec_type_id: 1, // 使用默认规格类型ID
              spec_name: spec.spec_name || '默认规格',
              spec_value: spec.spec_value || '标准',
              barcode: spec.barcode ? String(spec.barcode).trim() : '', // 改为字符串类型
              picture: spec.picture || '',
              total_stock: spec.total_stock || 0,
              unit: '个' // 默认单位
            }))
          }

          // 数据验证
          if (!productName || !productName.trim()) {
            throw new Error('商品名称不能为空')
          }
          
          if (!brandId || brandId <= 0) {
            throw new Error('品牌ID无效')
          }
          
          if (!categoryId || categoryId <= 0) {
            throw new Error('分类ID无效')
          }
          
          if (!productData.specs || productData.specs.length === 0) {
            throw new Error('商品规格不能为空')
          }
          
          // 验证规格数据
          for (const spec of productData.specs) {
            if (!spec.spec_name || !spec.spec_name.trim()) {
              throw new Error('规格名称不能为空')
            }
            if (spec.total_stock < 0) {
              throw new Error('库存不能为负数')
            }
            
            // 条形码验证
            if (spec.barcode) {
              // 检查条形码长度（一般条形码长度在8-20位之间）
              if (spec.barcode.length < 8 || spec.barcode.length > 20) {
                throw new Error(`条形码长度无效: ${spec.barcode} (长度: ${spec.barcode.length})`)
              }
              
              // 检查条形码是否已存在
              if (usedBarcodes.has(spec.barcode)) {
                throw new Error(`条形码重复: ${spec.barcode}`)
              }
              
              // 添加到已使用条形码集合
              setUsedBarcodes(prev => new Set(prev).add(spec.barcode))
            }
          }

          // 添加调试日志
          console.log(`准备创建商品: ${productName}`, productData)

          // 创建商品
          await new Promise((resolve, reject) => {
            createProduct(productData, {
              onSuccess: resolve,
              onError: reject
            })
          })

          successCount++
          console.log(`✅ 成功导入商品: ${productName}`)
        } catch (error) {
          // 详细的错误处理
          let errorMsg = `导入商品失败: ${productName}`
          
          if (error instanceof Error) {
            // 处理Axios错误
            if ('response' in error && error.response) {
              const axiosError = error as any
              const status = axiosError.response?.status
              const data = axiosError.response?.data
              
              if (status === 500) {
                errorMsg += ` - 服务器内部错误`
                if (data?.message) {
                  errorMsg += `: ${data.message}`
                }
              } else if (status === 400) {
                errorMsg += ` - 数据格式错误`
                if (data?.message) {
                  errorMsg += `: ${data.message}`
                }
              } else {
                errorMsg += ` - HTTP ${status}: ${data?.message || error.message}`
              }
            } else {
              errorMsg += ` - ${error.message}`
            }
          } else {
            errorMsg += ` - 未知错误: ${String(error)}`
          }
          
          console.error(`❌ ${errorMsg}`, error)
          console.error(`商品数据:`, productData || '数据构造失败')
          errors.push(errorMsg)
          errorCount++
        }

        setImportProgress(prev => ({ ...prev, current: prev.current + 1 }))
      }

      // 刷新数据
      refetchBrands()
      refetchClassify()

      // 显示详细的导入结果
      if (errorCount === 0) {
        toast.success(`导入完成！成功导入 ${successCount} 种商品`)
      } else {
        toast.warning(`导入完成！成功: ${successCount}，失败: ${errorCount}`)
        console.log("导入错误详情:", errors)
      }

      // 显示分类后期管理提示
      if (successCount > 0) {
        setTimeout(() => {
          toast.info(
            "💡 提示：导入完成后，您可以在分类管理页面中调整商品的分类归属，确保分类结构正确。",
            { duration: 8000 }
          )
        }, 2000)
      }
      
      if (onImportComplete) {
        onImportComplete()
      }

      // 重置状态
      setCsvData([])
      setConvertedProducts([])
      setImportReport(null)
      setShowPreview(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('导入过程中发生错误:', error)
      toast.error("导入过程中发生错误")
    } finally {
      setIsImporting(false)
      setImportProgress({ current: 0, total: 0 })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CSV商品导入
          </CardTitle>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 mt-0.5">💡</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">智能导入策略</p>
                <p>系统会自动处理分类和品牌问题，确保商品能够成功导入。分类错误不会阻止导入过程，您可以在导入完成后统一管理分类结构。</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 文件选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">选择CSV文件</label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                选择文件
              </Button>
              {csvData.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2"
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPreview ? '隐藏' : '预览'}数据
                </Button>
              )}
            </div>
          </div>

          {/* 导入报告 */}
          {importReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importReport.totalRows}</div>
                  <div className="text-sm text-blue-600">总行数</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importReport.validProducts}</div>
                  <div className="text-sm text-green-600">有效商品</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{importReport.groupedProducts}</div>
                  <div className="text-sm text-purple-600">商品种类</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{importReport.brands.size}</div>
                  <div className="text-sm text-orange-600">品牌数量</div>
                </div>
              </div>

              {/* 品牌和分类信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">发现的品牌</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(importReport.brands).map(brand => (
                      <Badge key={brand} variant="secondary">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">发现的分类</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(importReport.categories).slice(0, 10).map(category => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                    {importReport.categories.size > 10 && (
                      <Badge variant="outline">
                        +{importReport.categories.size - 10} 更多
                      </Badge>
                    )}
                  </div>
                </div>
              </div>


              {/* 导入按钮和状态提示 */}
              <div className="space-y-3">
                {/* 按钮状态提示 - 优化版本 */}
                {importReport.errors.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">发现数据问题，但可以继续导入</span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">
                      发现 {importReport.errors.length} 个数据问题，系统将使用默认值处理，确保商品能够成功导入：
                    </p>
                    <ul className="text-sm text-yellow-600 mt-2 space-y-1">
                      {importReport.errors.slice(0, 3).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importReport.errors.length > 3 && (
                        <li>• 还有 {importReport.errors.length - 3} 个问题...</li>
                      )}
                    </ul>
                    <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-700">
                        💡 <strong>提示：</strong>分类和品牌问题将在导入后统一处理，不会影响商品导入成功率
                      </p>
                    </div>
                  </div>
                )}
                
                {importReport.errors.length === 0 && importReport.validProducts > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">数据验证通过，可以开始导入</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      将导入 {importReport.validProducts} 种商品，创建 {importReport.brands.size} 个品牌和 {importReport.categories.size} 个分类
                    </p>
                  </div>
                )}
                
                {/* 导入按钮 - 优化版本 */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="flex items-center gap-2"
                    title="开始导入商品数据，系统会自动处理分类和品牌问题"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        导入中... ({importProgress.current}/{importProgress.total})
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        开始导入
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 数据预览 */}
          {showPreview && convertedProducts.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">数据预览（前10条）</h4>
              <div className="max-h-96 overflow-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">商品名称</th>
                      <th className="px-3 py-2 text-left">品牌</th>
                      <th className="px-3 py-2 text-left">分类</th>
                      <th className="px-3 py-2 text-left">规格</th>
                      <th className="px-3 py-2 text-left">库存</th>
                      <th className="px-3 py-2 text-left">价格</th>
                    </tr>
                  </thead>
                  <tbody>
                    {convertedProducts.slice(0, 10).map((product, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{product.product_name}</td>
                        <td className="px-3 py-2">{product.brand_name}</td>
                        <td className="px-3 py-2">{product.classify_name}</td>
                        <td className="px-3 py-2">{product.spec_value}</td>
                        <td className="px-3 py-2">{product.total_stock}</td>
                        <td className="px-3 py-2">¥{product.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
