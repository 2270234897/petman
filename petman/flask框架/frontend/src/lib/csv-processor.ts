// CSV文件处理器 - 专门处理门店导出的商品数据
import { convertCSVData, generateImportReport, type CSVProductRow } from './csv-converter'

export interface ProcessedCSVResult {
  success: boolean
  data?: CSVProductRow[]
  report?: any
  error?: string
}

// 处理CSV文件内容
export async function processCSVFile(file: File): Promise<ProcessedCSVResult> {
  try {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV文件格式不正确，至少需要标题行和一行数据'
      }
    }

    // 解析标题行
    const headers = parseCSVLine(lines[0])
    
    // 验证必要的列是否存在
    const requiredColumns = ['商品名称', '商品条形码', '售价', '库存']
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))
    
    if (missingColumns.length > 0) {
      return {
        success: false,
        error: `缺少必要的列: ${missingColumns.join(', ')}`
      }
    }

    // 解析数据行
    const data: CSVProductRow[] = []
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
      
      // 只处理有效的商品数据
      if (row['商品名称'] && row['商品名称'].trim()) {
        data.push(row as CSVProductRow)
      }
    }

    if (data.length === 0) {
      return {
        success: false,
        error: '没有找到有效的商品数据'
      }
    }

    // 生成导入报告
    const report = generateImportReport(data)

    return {
      success: true,
      data,
      report
    }
  } catch (error) {
    console.error('处理CSV文件失败:', error)
    return {
      success: false,
      error: `处理文件失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

// 解析CSV行，处理引号和逗号
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 转义的引号
        current += '"'
        i++ // 跳过下一个引号
      } else {
        // 开始或结束引号
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // 添加最后一个字段
  result.push(current.trim())
  
  return result
}

// 验证CSV数据质量
export function validateCSVData(data: CSVProductRow[]): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 2 // 考虑标题行
    
    // 必填字段检查 - 只检查真正必要的字段
    if (!row.商品名称 || !row.商品名称.trim()) {
      errors.push(`第${rowNum}行: 商品名称不能为空`)
    }
    
    // 价格检查 - 允许0价格（可能是免费商品）
    if (!row.售价 || isNaN(parseFloat(row.售价))) {
      errors.push(`第${rowNum}行: 售价必须是有效数字`)
    }
    
    // 库存检查 - 允许0库存
    if (!row.库存 || isNaN(parseInt(row.库存))) {
      errors.push(`第${rowNum}行: 库存必须是有效数字`)
    }
    
    // 只对严重的警告进行提示
    if (parseInt(row.库存) < 0) {
      warnings.push(`第${rowNum}行: 库存为负数`)
    }
    
    // 不再将条形码和分类缺失作为警告，因为有智能推断
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// 生成数据统计
export function generateDataStats(data: CSVProductRow[]) {
  const stats = {
    totalRows: data.length,
    uniqueProducts: new Set(data.map(row => row.商品名称)).size,
    brands: new Set<string>(),
    categories: new Set<string>(),
    totalValue: 0,
    totalStock: 0,
    priceRange: { min: Infinity, max: 0 },
    stockRange: { min: Infinity, max: 0 }
  }
  
  for (const row of data) {
    // 品牌统计
    if (row.类目属性) {
      const brandMatch = row.类目属性.match(/品牌：([^；]+)/)
      if (brandMatch) {
        stats.brands.add(brandMatch[1].trim())
      }
    }
    
    // 分类统计
    if (row.商品一级类目) stats.categories.add(row.商品一级类目)
    if (row.商品二级类目) stats.categories.add(row.商品二级类目)
    if (row.商品三级类目) stats.categories.add(row.商品三级类目)
    
    // 价格和库存统计
    const price = parseFloat(row.售价) || 0
    const stock = parseInt(row.库存) || 0
    
    stats.totalValue += price * stock
    stats.totalStock += stock
    
    if (price > 0) {
      stats.priceRange.min = Math.min(stats.priceRange.min, price)
      stats.priceRange.max = Math.max(stats.priceRange.max, price)
    }
    
    if (stock >= 0) {
      stats.stockRange.min = Math.min(stats.stockRange.min, stock)
      stats.stockRange.max = Math.max(stats.stockRange.max, stock)
    }
  }
  
  // 处理边界情况
  if (stats.priceRange.min === Infinity) stats.priceRange.min = 0
  if (stats.stockRange.min === Infinity) stats.stockRange.min = 0
  
  return {
    ...stats,
    brands: Array.from(stats.brands),
    categories: Array.from(stats.categories)
  }
}
