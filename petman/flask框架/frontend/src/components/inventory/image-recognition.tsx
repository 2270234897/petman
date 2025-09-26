import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { createWorker } from "tesseract.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Eye,
  Copy,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface ImageRecognitionProps {
  onProductInfoExtracted?: (productInfo: any) => void
  onClose?: () => void
}

interface ExtractedInfo {
  productName?: string
  brand?: string
  barcode?: string
  specifications?: string[]
  price?: string
  description?: string
  rawText: string
}

export function ImageRecognition({ onProductInfoExtracted, onClose }: ImageRecognitionProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [worker, setWorker] = useState<any>(null)

  // 初始化OCR工作器
  const initializeWorker = useCallback(async () => {
    if (!worker) {
      try {
        const newWorker = await createWorker('chi_sim+eng', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR进度: ${Math.round(m.progress * 100)}%`)
            }
          }
        })
        setWorker(newWorker)
        return newWorker
      } catch (error) {
        console.error('OCR工作器初始化失败:', error)
        toast.error('OCR功能初始化失败')
        return null
      }
    }
    return worker
  }, [worker])

  // 文件上传处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
        setExtractedInfo(null)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  // 执行OCR识别
  const performOCR = async () => {
    if (!uploadedImage) {
      toast.error('请先上传图片')
      return
    }

    setIsRecognizing(true)
    try {
      const ocrWorker = await initializeWorker()
      if (!ocrWorker) {
        toast.error('OCR功能不可用')
        return
      }

      const { data: { text } } = await ocrWorker.recognize(uploadedImage)
      
      // 解析提取的商品信息
      const productInfo = parseProductInfo(text)
      setExtractedInfo({
        ...productInfo,
        rawText: text
      })
      
      toast.success('图片识别完成！')
    } catch (error) {
      console.error('OCR识别失败:', error)
      toast.error('图片识别失败，请重试')
    } finally {
      setIsRecognizing(false)
    }
  }

  // 解析商品信息
  const parseProductInfo = (text: string): Partial<ExtractedInfo> => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    let productName = ''
    let brand = ''
    let barcode = ''
    let specifications: string[] = []
    let price = ''
    let description = ''

    // 查找商品名称（通常在标题位置）
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      if (lines[i].length > 2 && !lines[i].match(/^\d+$/) && !lines[i].includes('￥') && !lines[i].includes('元')) {
        productName = lines[i]
        break
      }
    }

    // 查找品牌信息
    const brandKeywords = ['品牌', 'Brand', '厂家', '制造商']
    for (const line of lines) {
      for (const keyword of brandKeywords) {
        if (line.includes(keyword)) {
          brand = line.replace(keyword, '').replace(':', '').trim()
          break
        }
      }
      if (brand) break
    }

    // 查找条形码
    const barcodePattern = /\b\d{8,13}\b/
    for (const line of lines) {
      const match = line.match(barcodePattern)
      if (match) {
        barcode = match[0]
        break
      }
    }

    // 查找价格信息
    const pricePattern = /[￥¥$]\s*\d+(?:\.\d{2})?/
    for (const line of lines) {
      const match = line.match(pricePattern)
      if (match) {
        price = match[0]
        break
      }
    }

    // 查找规格信息
    const specKeywords = ['规格', 'Spec', '净含量', '重量', '容量', '尺寸']
    for (const line of lines) {
      for (const keyword of specKeywords) {
        if (line.includes(keyword)) {
          specifications.push(line)
          break
        }
      }
    }

    // 查找描述信息
    const descLines = lines.filter(line => 
      line.length > 10 && 
      !line.includes('￥') && 
      !line.includes('元') &&
      !line.match(/^\d+$/) &&
      !specifications.includes(line)
    )
    if (descLines.length > 0) {
      description = descLines.slice(0, 3).join(' ')
    }

    return {
      productName: productName || undefined,
      brand: brand || undefined,
      barcode: barcode || undefined,
      specifications: specifications.length > 0 ? specifications : undefined,
      price: price || undefined,
      description: description || undefined
    }
  }

  // 应用提取的信息到商品表单
  const applyExtractedInfo = () => {
    if (extractedInfo && onProductInfoExtracted) {
      const productData = {
        product_name: extractedInfo.productName || '',
        brand: extractedInfo.brand || '',
        barcode: extractedInfo.barcode || '',
        description: extractedInfo.description || '',
        specifications: extractedInfo.specifications || [],
        price: extractedInfo.price || ''
      }
      onProductInfoExtracted(productData)
      toast.success('商品信息已应用到表单')
    }
  }

  // 复制原始文本
  const copyRawText = () => {
    if (extractedInfo?.rawText) {
      navigator.clipboard.writeText(extractedInfo.rawText)
      toast.success('原始文本已复制到剪贴板')
    }
  }

  // 重新识别
  const reRecognize = () => {
    setExtractedInfo(null)
    performOCR()
  }

  // 清理资源
  const cleanup = async () => {
    if (worker) {
      await worker.terminate()
      setWorker(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">图片识别商品信息</h2>
          <p className="text-muted-foreground">
            上传商品图片，自动识别并提取商品信息
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        )}
      </div>

      {/* 图片上传区域 */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`cursor-pointer text-center py-8 ${
              isDragActive ? 'bg-blue-50' : 'bg-gray-50'
            } rounded-lg transition-colors`}
          >
            <input {...getInputProps()} />
            {uploadedImage ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="上传的图片"
                    className="max-w-full max-h-64 rounded-lg shadow-md"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setUploadedImage(null)
                      setExtractedInfo(null)
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      performOCR()
                    }}
                    disabled={isRecognizing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isRecognizing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        识别中...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        开始识别
                      </>
                    )}
                  </Button>
                  {extractedInfo && (
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        reRecognize()
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      重新识别
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? '松开鼠标上传图片' : '点击或拖拽上传商品图片'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    支持 JPG、PNG、GIF 等格式，最大 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 识别结果 */}
      {extractedInfo && (
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">识别结果</h3>
            </div>
            
            <div className="space-y-4">
              {/* 商品名称 */}
              {extractedInfo.productName && (
                <div>
                  <label className="text-sm font-medium text-gray-700">商品名称</label>
                  <Input
                    value={extractedInfo.productName}
                    readOnly
                    className="mt-1 bg-white"
                  />
                </div>
              )}

              {/* 品牌 */}
              {extractedInfo.brand && (
                <div>
                  <label className="text-sm font-medium text-gray-700">品牌</label>
                  <Input
                    value={extractedInfo.brand}
                    readOnly
                    className="mt-1 bg-white"
                  />
                </div>
              )}

              {/* 条形码 */}
              {extractedInfo.barcode && (
                <div>
                  <label className="text-sm font-medium text-gray-700">条形码</label>
                  <Input
                    value={extractedInfo.barcode}
                    readOnly
                    className="mt-1 bg-white font-mono"
                  />
                </div>
              )}

              {/* 价格 */}
              {extractedInfo.price && (
                <div>
                  <label className="text-sm font-medium text-gray-700">价格</label>
                  <Input
                    value={extractedInfo.price}
                    readOnly
                    className="mt-1 bg-white"
                  />
                </div>
              )}

              {/* 规格信息 */}
              {extractedInfo.specifications && extractedInfo.specifications.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">规格信息</label>
                  <div className="mt-1 space-y-1">
                    {extractedInfo.specifications.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 描述 */}
              {extractedInfo.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">描述信息</label>
                  <Textarea
                    value={extractedInfo.description}
                    readOnly
                    className="mt-1 bg-white"
                    rows={3}
                  />
                </div>
              )}

              {/* 原始文本 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">原始识别文本</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyRawText}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    复制
                  </Button>
                </div>
                <Textarea
                  value={extractedInfo.rawText}
                  readOnly
                  className="bg-white text-xs"
                  rows={6}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedImage(null)
                  setExtractedInfo(null)
                }}
              >
                重新上传
              </Button>
              <Button
                onClick={applyExtractedInfo}
                className="bg-green-600 hover:bg-green-700"
              >
                应用到商品表单
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 mb-2">使用说明</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 上传清晰的商品图片，包含商品名称、品牌、规格等信息</li>
            <li>• 系统会自动识别图片中的文字信息并提取商品信息</li>
            <li>• 识别结果可以自动填充到商品表单中，提高录入效率</li>
            <li>• 建议使用清晰、光线充足的商品图片以获得更好的识别效果</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
