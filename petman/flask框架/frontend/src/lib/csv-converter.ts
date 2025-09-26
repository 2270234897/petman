// CSV数据转换器 - 将门店导出的商品数据转换为系统格式
export interface CSVProductRow {
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

export interface ConvertedProduct {
  product_name: string
  brand_name: string
  classify_name: string
  parent_classify_name: string
  spec_name: string
  spec_value: string
  barcode: string
  picture: string
  总库存: number
  product_baozhiqi: number
  local: string
  product_details: string
  cover_image: string
  weight: number
  price: number
  sale_price?: number
  min_purchase: number
  status: string
  attributes: string
}

// 从类目属性中提取品牌信息
function extractBrandFromAttributes(attributes: string): string {
  if (!attributes) return ''
  
  const brandMatch = attributes.match(/品牌：([^；]+)/)
  if (brandMatch) {
    return brandMatch[1].trim()
  }
  
  return ''
}

// 从类目属性中提取产地信息
function extractOriginFromAttributes(attributes: string): string {
  if (!attributes) return '中国' // 默认产地
  
  const originMatch = attributes.match(/是否进口：([^；]+)/)
  if (originMatch) {
    const origin = originMatch[1].trim()
    return origin === '国产' ? '中国' : origin
  }
  
  return '中国' // 默认产地
}

// 从类目属性中提取保质期信息
function extractShelfLifeFromAttributes(attributes: string): number {
  if (!attributes) return 12 // 默认12个月
  
  const shelfLifeMatch = attributes.match(/保质期：(\d+)/)
  if (shelfLifeMatch) {
    return parseInt(shelfLifeMatch[1])
  }
  
  return 12 // 默认12个月
}

// 从商品名称中提取品牌信息（备用方法）
function extractBrandFromProductName(productName: string): string {
  if (!productName) return ''
  
  // 常见的品牌前缀
  const brandPrefixes = [
    'Wanpy/顽皮', '顽皮', 'Wanpy',
    'MYFOODIE/麦富迪', '麦富迪', 'MYFOODIE',
    'Alfie&Buddy/阿飞和巴弟', '阿飞和巴弟', 'Alfie&Buddy',
    'ROYAL CANIN/皇家', '皇家', 'ROYAL CANIN',
    'prominent/派得', '派得', 'prominent',
    '珍致', '冠能', 'PRO PLAN',
    '网易严选', '纯福', 'CHUN',
    '蓝氏', '江小傲', '鲜朗',
    '诚实一口', '福丸', '吉萌萌',
    '那非普', '小宠', '中宠',
    '路斯', 'Luscious', '靓贝',
    '好命天生', '卓享', 'EMINENCE UNIVERSE',
    '王漂亮', '宠诺莎', '馨萌',
    '瑞梦迪', '肉垫rodin', '贵族', 'Nature\'s Gift',
    '纯皓', '卓享'
  ]
  
  for (const prefix of brandPrefixes) {
    if (productName.includes(prefix)) {
      return prefix.replace(/\/.*$/, '') // 移除斜杠后的部分
    }
  }
  
  return ''
}

// 智能推断品牌信息
function inferBrand(productName: string, attributes: string): string {
  // 首先从属性中提取
  const brandFromAttributes = extractBrandFromAttributes(attributes)
  if (brandFromAttributes) return brandFromAttributes
  
  // 然后从商品名称中提取
  const brandFromName = extractBrandFromProductName(productName)
  if (brandFromName) return brandFromName
  
  // 最后使用默认品牌
  return '未知品牌'
}

// 智能推断分类信息
function inferCategoryFromProductName(productName: string): string {
  if (!productName) return '未分类'
  
  const name = productName.toLowerCase()
  
  // 宠物食品分类 - 高优先级
  if (name.includes('狗粮') || name.includes('犬粮') || name.includes('成犬') || name.includes('幼犬')) {
    return '狗粮'
  }
  if (name.includes('猫粮') || name.includes('成猫') || name.includes('幼猫') || name.includes('全期')) {
    return '猫粮'
  }
  if (name.includes('零食') || name.includes('饼干') || name.includes('肉干')) {
    return '宠物零食'
  }
  if (name.includes('罐头') || name.includes('湿粮')) {
    return '宠物罐头'
  }
  if (name.includes('冻干')) {
    return '宠物冻干'
  }
  if (name.includes('保健品') || name.includes('维生素') || name.includes('钙片') || name.includes('营养膏')) {
    return '宠物保健品'
  }
  
  // 洗护清洁分类 - 高优先级
  if (name.includes('湿巾') || name.includes('指套') || name.includes('清洁') || name.includes('去污') || name.includes('护理')) {
    return '清洁用品'
  }
  if (name.includes('洗护') || name.includes('香波') || name.includes('浴液')) {
    return '洗护用品'
  }
  if (name.includes('牙刷') || name.includes('牙膏') || name.includes('口腔')) {
    return '口腔护理'
  }
  if (name.includes('洗耳液') || name.includes('棉签') || name.includes('耳朵')) {
    return '耳朵护理'
  }
  
  // 宠物玩具分类 - 高优先级
  if (name.includes('逗猫棒') || name.includes('球') || name.includes('玩具')) {
    return '互动玩具'
  }
  if (name.includes('磨牙') || name.includes('骨头') || name.includes('磨牙棒')) {
    return '磨牙玩具'
  }
  if (name.includes('漏食器') || name.includes('拼图') || name.includes('益智')) {
    return '益智玩具'
  }
  if (name.includes('飞盘') || name.includes('牵引玩具')) {
    return '户外玩具'
  }
  
  // 宠物用品分类 - 中优先级
  if (name.includes('食盆') || name.includes('水盆') || name.includes('饮水器')) {
    return '食具水具'
  }
  if (name.includes('猫砂') || name.includes('猫砂盆') || name.includes('铲子')) {
    return '猫砂用品'
  }
  if (name.includes('窝') || name.includes('垫子') || name.includes('床')) {
    return '窝垫用品'
  }
  if (name.includes('牵引绳') || name.includes('项圈') || name.includes('胸背带')) {
    return '出行用品'
  }
  if (name.includes('笼子') || name.includes('围栏') || name.includes('航空箱')) {
    return '笼具用品'
  }
  
  // 宠物健康分类
  if (name.includes('体温计') || name.includes('注射器') || name.includes('医疗')) {
    return '医疗用品'
  }
  if (name.includes('营养补充') || name.includes('维生素') || name.includes('钙片')) {
    return '营养补充'
  }
  if (name.includes('驱虫药') || name.includes('驱虫项圈')) {
    return '驱虫用品'
  }
  if (name.includes('止血粉') || name.includes('绷带') || name.includes('急救')) {
    return '急救用品'
  }
  
  // 宠物服饰分类
  if (name.includes('衣服') || name.includes('雨衣') || name.includes('服装')) {
    return '服装'
  }
  if (name.includes('铃铛') || name.includes('配饰')) {
    return '配饰'
  }
  if (name.includes('鞋子') || name.includes('袜子')) {
    return '鞋袜'
  }
  if (name.includes('围巾') || name.includes('帽子') || name.includes('保暖')) {
    return '保暖用品'
  }
  
  // 兜底匹配 - 低优先级
  if (name.includes('用品') || name.includes('必备')) {
    return '宠物用品'
  }
  
  // 默认分类
  return '宠物用品'
}

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
function getParentCategory(categoryName: string): string | null {
  return categoryHierarchy[categoryName]?.parent || null
}

// 获取分类层级
function getCategoryLevel(categoryName: string): number {
  return categoryHierarchy[categoryName]?.level || 1
}

// 转换CSV行数据为系统格式
export function convertCSVRowToProduct(row: CSVProductRow): ConvertedProduct {
  // 使用智能推断品牌信息
  const brand = inferBrand(row.商品名称, row.类目属性)
  
  const origin = extractOriginFromAttributes(row.类目属性)
  const shelfLife = extractShelfLifeFromAttributes(row.类目属性)
  
  // 处理重量（可能包含单位）
  const weight = parseFloat(row.重量) || 0
  
  // 处理价格
  const price = parseFloat(row.售价) || 0
  const salePrice = row.活动价 ? parseFloat(row.活动价) : undefined
  
  // 处理库存
  const stock = parseInt(row.库存) || 0
  
  // 处理最低起购量
  const minPurchase = parseInt(row.商品最低起购量) || 1
  
  // 处理规格信息
  const specName = row.规格 || '默认规格'
  const specValue = row.规格 || '标准'
  
  // 处理条形码
  const barcode = row.商品条形码 || ''
  
  // 处理分类信息 - 使用智能分类推断
  const classifyName = row.商品三级类目 || row.商品二级类目 || row.商品一级类目 || inferCategoryFromProductName(row.商品名称)
  const parentClassifyName = getParentCategory(classifyName) || row.商品二级类目 || row.商品一级类目 || '宠物用品'
  
  return {
    product_name: row.商品名称,
    brand_name: brand,
    classify_name: classifyName,
    parent_classify_name: parentClassifyName,
    spec_name: specName,
    spec_value: specValue,
    barcode: barcode,
    picture: '', // 图片路径需要单独处理
    总库存: stock,
    product_baozhiqi: shelfLife,
    local: origin,
    product_details: row.类目属性 || '',
    cover_image: '', // 封面图片需要单独处理
    weight: weight,
    price: price,
    sale_price: salePrice,
    min_purchase: minPurchase,
    status: row.商品状态 === '上架' ? 'active' : 'inactive',
    attributes: row.类目属性 || ''
  }
}

// 批量转换CSV数据
export function convertCSVData(csvData: CSVProductRow[]): ConvertedProduct[] {
  return csvData.map(convertCSVRowToProduct)
}

// 按商品名称分组，合并相同商品的规格
export function groupProductsByName(products: ConvertedProduct[]): Map<string, ConvertedProduct[]> {
  const grouped = new Map<string, ConvertedProduct[]>()
  
  for (const product of products) {
    const key = product.product_name
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(product)
  }
  
  return grouped
}

// 生成导入报告
export interface ImportReport {
  totalRows: number
  validProducts: number
  groupedProducts: number
  brands: Set<string>
  categories: Set<string>
  errors: string[]
}

export function generateImportReport(csvData: CSVProductRow[]): ImportReport {
  const convertedProducts = convertCSVData(csvData)
  const groupedProducts = groupProductsByName(convertedProducts)
  
  const brands = new Set<string>()
  const categories = new Set<string>()
  const errors: string[] = []
  
  for (const product of convertedProducts) {
    if (product.brand_name) {
      brands.add(product.brand_name)
    }
    if (product.classify_name) {
      categories.add(product.classify_name)
    }
    if (product.parent_classify_name) {
      categories.add(product.parent_classify_name)
    }
    
    // 只检查真正必要的错误，不将"未知品牌"视为错误
    if (!product.product_name || !product.product_name.trim()) {
      errors.push(`商品名称不能为空`)
    }
    // 移除对"未知品牌"的检查，因为现在有智能推断
  }
  
  return {
    totalRows: csvData.length,
    validProducts: convertedProducts.length,
    groupedProducts: groupedProducts.size,
    brands,
    categories,
    errors
  }
}
