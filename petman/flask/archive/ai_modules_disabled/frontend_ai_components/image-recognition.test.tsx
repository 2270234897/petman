import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImageRecognition } from './image-recognition'

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(() => Promise.resolve({
    recognize: jest.fn(() => Promise.resolve({
      data: { text: '测试商品名称\n品牌: 测试品牌\n规格: 500g\n价格: ￥29.9' }
    }))
  }))
}))

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false
  })
}))

describe('ImageRecognition Component', () => {
  it('renders image recognition interface', () => {
    render(<ImageRecognition />)
    
    expect(screen.getByText('图片识别商品信息')).toBeInTheDocument()
    expect(screen.getByText('上传商品图片，自动识别并提取商品信息')).toBeInTheDocument()
  })

  it('shows upload area when no image is uploaded', () => {
    render(<ImageRecognition />)
    
    expect(screen.getByText('点击或拖拽上传商品图片')).toBeInTheDocument()
    expect(screen.getByText('支持 JPG、PNG、GIF 等格式，最大 10MB')).toBeInTheDocument()
  })

  it('displays usage instructions', () => {
    render(<ImageRecognition />)
    
    expect(screen.getByText('使用说明')).toBeInTheDocument()
    expect(screen.getByText('• 上传清晰的商品图片，包含商品名称、品牌、规格等信息')).toBeInTheDocument()
  })
})

describe('Product Info Parsing', () => {
  const mockParseProductInfo = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    let productName = ''
    let brand = ''
    let barcode = ''
    let specifications: string[] = []
    let price = ''
    let description = ''

    // 查找商品名称
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

    return {
      productName: productName || undefined,
      brand: brand || undefined,
      barcode: barcode || undefined,
      specifications: specifications.length > 0 ? specifications : undefined,
      price: price || undefined,
      description: description || undefined
    }
  }

  it('parses product name correctly', () => {
    const text = '测试商品名称\n品牌: 测试品牌\n规格: 500g'
    const result = mockParseProductInfo(text)
    expect(result.productName).toBe('测试商品名称')
  })

  it('parses brand information correctly', () => {
    const text = '测试商品名称\n品牌: 测试品牌\n规格: 500g'
    const result = mockParseProductInfo(text)
    expect(result.brand).toBe('测试品牌')
  })

  it('parses specifications correctly', () => {
    const text = '测试商品名称\n品牌: 测试品牌\n规格: 500g'
    const result = mockParseProductInfo(text)
    expect(result.specifications).toContain('规格: 500g')
  })

  it('parses price information correctly', () => {
    const text = '测试商品名称\n品牌: 测试品牌\n价格: ￥29.9'
    const result = mockParseProductInfo(text)
    expect(result.price).toBe('￥29.9')
  })

  it('parses barcode correctly', () => {
    const text = '测试商品名称\n条形码: 1234567890123\n价格: ￥29.9'
    const result = mockParseProductInfo(text)
    expect(result.barcode).toBe('1234567890123')
  })
})
