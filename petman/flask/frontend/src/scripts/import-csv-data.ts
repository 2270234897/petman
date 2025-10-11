// 直接导入CSV数据的脚本
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// 模拟API调用（实际使用时需要替换为真实的API调用）
const API_BASE_URL = 'http://localhost:5000/api' // 假设后端运行在5000端口

interface CSVRow {
  商品ID: string
  规格: string
  商品条形码: string
  商品名称: string
  商品一级类目: string
  商品二级类目: string
  商品三级类目: string
  重量: string
  售价: string
  活动价: string
  库存: string
  商品最低起购量: string
  商品状态: string
  月售: string
  店铺内一级分类名称: string
  店铺内二级分类名称: string
  商品自定义ID: string
  规格自定义ID: string
  货架号: string
  图片数量: string
  属性: string
  是否有附加加工服务: string
  加工品属性: string
  是否称重品: string
  称重类型: string
  售卖单位: string
  售卖单位重量: string
  限购开始时间: string
  限购结束时间: string
  限购周期: string
  限购周期内每人限购件数: string
  是否为组合商品: string
  是否有营销头图: string
  API专用ID: string
  组套商品类型: string
  组套内商品条形码: string
  组合子品名称: string
  类目属性: string
}

// 解析CSV行
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

// 从类目属性中提取品牌
function extractBrand(attributes: string): string {
  if (!attributes) return ''
  
  const brandMatch = attributes.match(/品牌：([^；]+)/)
  if (brandMatch) {
    return brandMatch[1].trim()
  }
  return ''
}

// 从类目属性中提取保质期
function extractShelfLife(attributes: string): number {
  if (!attributes) return 12
  
  const shelfLifeMatch = attributes.match(/保质期：(\d+)/)
  if (shelfLifeMatch) {
    return parseInt(shelfLifeMatch[1])
  }
  return 12
}

// 从类目属性中提取产地
function extractOrigin(attributes: string): string {
  if (!attributes) return '中国'
  
  const originMatch = attributes.match(/是否进口：([^；]+)/)
  if (originMatch) {
    const origin = originMatch[1].trim()
    return origin === '国产' ? '中国' : origin
  }
  return '中国'
}

// 模拟API调用
async function mockApiCall(endpoint: string, data: any): Promise<any> {
  console.log(`[API] ${endpoint}:`, JSON.stringify(data, null, 2))
  return { success: true, data: { id: Math.floor(Math.random() * 1000) + 1 } }
}

// 创建品牌
async function createBrand(brandName: string): Promise<number> {
  const result = await mockApiCall('POST /api/inventory/brands', { brandname: brandName })
  return result.data.id
}

// 创建分类
async function createClassify(className: string, parentId?: number): Promise<number> {
  const result = await mockApiCall('POST /api/inventory/classify', { 
    classify_name: className,
    parent_id: parentId 
  })
  return result.data.id
}

// 创建商品
async function createProduct(productData: any): Promise<number> {
  const result = await mockApiCall('POST /api/inventory/products', productData)
  return result.data.id
}

// 主导入函数
async function importCSVData(csvFilePath: string) {
  try {
    console.log('开始导入CSV数据...')
    
    // 读取CSV文件
    const csvContent = readFileSync(csvFilePath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error('CSV文件格式不正确')
    }
    
    // 解析标题行
    const headers = parseCSVLine(lines[0])
    console.log('CSV标题行:', headers)
    
    // 解析数据行
    const data: CSVRow[] = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const values = parseCSVLine(line)
      if (values.length < headers.length) {
        console.warn(`第${i + 1}行数据不完整，跳过`)
        continue
      }
      
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      if (row['商品名称'] && row['商品名称'].trim()) {
        data.push(row as CSVRow)
      }
    }
    
    console.log(`解析到 ${data.length} 条商品数据`)
    
    // 统计信息
    const brands = new Set<string>()
    const categories = new Set<string>()
    const products = new Map<string, CSVRow[]>()
    
    for (const row of data) {
      // 收集品牌
      const brand = extractBrand(row.类目属性)
      if (brand) brands.add(brand)
      
      // 收集分类
      if (row.商品一级类目) categories.add(row.商品一级类目)
      if (row.商品二级类目) categories.add(row.商品二级类目)
      if (row.商品三级类目) categories.add(row.商品三级类目)
      
      // 按商品名称分组
      const productName = row.商品名称
      if (!products.has(productName)) {
        products.set(productName, [])
      }
      products.get(productName)!.push(row)
    }
    
    console.log(`发现 ${brands.size} 个品牌:`, Array.from(brands))
    console.log(`发现 ${categories.size} 个分类:`, Array.from(categories))
    console.log(`发现 ${products.size} 种商品`)
    
    // 创建品牌映射
    const brandMap = new Map<string, number>()
    for (const brandName of brands) {
      const brandId = await createBrand(brandName)
      brandMap.set(brandName, brandId)
      console.log(`创建品牌: ${brandName} (ID: ${brandId})`)
    }
    
    // 创建分类映射
    const categoryMap = new Map<string, number>()
    for (const categoryName of categories) {
      const categoryId = await createClassify(categoryName)
      categoryMap.set(categoryName, categoryId)
      console.log(`创建分类: ${categoryName} (ID: ${categoryId})`)
    }
    
    // 创建商品
    let successCount = 0
    let errorCount = 0
    
    for (const [productName, specs] of products) {
      try {
        const firstSpec = specs[0]
        const brand = extractBrand(firstSpec.类目属性)
        const brandId = brandMap.get(brand)
        const categoryId = categoryMap.get(firstSpec.商品三级类目 || firstSpec.商品二级类目 || firstSpec.商品一级类目)
        
        if (!brandId || !categoryId) {
          console.error(`商品 ${productName} 缺少品牌或分类信息`)
          errorCount++
          continue
        }
        
        const productData = {
          product_name: productName,
          brand_brandID: brandId,
          classify_level1_classify1_ID: categoryId,
          product_baozhiqi: extractShelfLife(firstSpec.类目属性),
          local: extractOrigin(firstSpec.类目属性),
          cover_image: '',
          specs: specs.map(spec => ({
            spec_name: spec.规格 || '默认规格',
            spec_value: spec.规格 || '标准',
            barcode: spec.商品条形码 || '',
            picture: '',
            total_stock: parseInt(spec.stock) || 0,
            unit: '个'
          }))
        }
        
        const productId = await createProduct(productData)
        console.log(`创建商品: ${productName} (ID: ${productId})`)
        successCount++
        
      } catch (error) {
        console.error(`创建商品失败: ${productName}`, error)
        errorCount++
      }
    }
    
    console.log(`\n导入完成!`)
    console.log(`成功: ${successCount} 个商品`)
    console.log(`失败: ${errorCount} 个商品`)
    console.log(`创建了 ${brands.size} 个品牌和 ${categories.size} 个分类`)
    
  } catch (error) {
    console.error('导入过程中发生错误:', error)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const csvFilePath = 'e:\\edgedownloads\\门店导出商品-导出结果 -猫狗日记-2025-09-21.csv'
  importCSVData(csvFilePath)
}

export { importCSVData }
