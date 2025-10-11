import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Info,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

export function SmartSearch() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [initialStock, setInitialStock] = useState(10)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('请输入商品名称')
      return
    }

    setIsSearching(true)
    setSearchResult(null)

    try {
      const response = await fetch('http://localhost:5000/api/search/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      const data = await response.json()

      if (data.success) {
        setSearchResult(data)
        toast.success('✅ 搜索成功！找到商品信息')
      } else {
        toast.error('❌ 搜索失败: ' + data.error)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('搜索请求失败')
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreateProduct = async () => {
    if (!searchResult) return

    setIsSearching(true)

    try {
      const response = await fetch('http://localhost:5000/api/search/product/create-from-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          auto_save: true,
          initial_stock: initialStock 
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        toast.info(`商品ID: ${data.product_id}，规格ID: ${data.spec_id}`)
        setSearchResult(null)
        setQuery('')
      } else {
        toast.error('创建失败: ' + data.error)
      }
    } catch (error) {
      console.error('Create error:', error)
      toast.error('创建请求失败')
    } finally {
      setIsSearching(false)
    }
  }

  const handleQuickCreate = async () => {
    if (!query.trim()) {
      toast.error('请输入商品名称')
      return
    }

    setIsSearching(true)

    try {
      // 直接创建，一步到位
      const response = await fetch('http://localhost:5000/api/search/product/create-from-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          auto_save: true,
          initial_stock: initialStock 
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('🎉 ' + data.message)
        
        // 显示详情
        const details = data.details
        toast.info(
          `品牌: ${details.brand} | 分类: ${details.category} | 价格: ¥${details.price}`,
          { duration: 5000 }
        )
        
        setQuery('')
        setSearchResult(data)
      } else {
        toast.error('创建失败: ' + data.error)
      }
    } catch (error) {
      console.error('Quick create error:', error)
      toast.error('创建请求失败')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">🌐 AI智能搜索建商品</h1>
        </div>
        <p className="text-gray-600">
          告诉AI你要卖什么，AI自动搜索网上信息并创建商品实体
        </p>
      </div>

      {/* 搜索框 */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              商品名称
            </label>
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例如：皇家猫粮成猫2kg、宝路狗粮10kg、猫砂膨润土..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                搜索
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">
              初始库存数量:
            </label>
            <Input
              type="number"
              value={initialStock}
              onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
              className="w-32"
              min="0"
            />
            <Button
              onClick={handleQuickCreate}
              disabled={isSearching || !query.trim()}
              variant="default"
              className="ml-auto"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              🚀 一键创建商品
            </Button>
          </div>
        </div>
      </Card>

      {/* 使用说明 */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">💡 使用方法：</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>方式1</strong>：输入商品名 → 点击"搜索" → 查看详情 → 确认创建</li>
              <li><strong>方式2（推荐）</strong>：输入商品名 → 设置初始库存 → 点击"🚀 一键创建商品"</li>
            </ul>
            <p className="mt-2 text-xs">
              ⚡ AI会自动从网上搜索商品信息（品牌、规格、价格、产地等），并创建完整的商品实体
            </p>
          </div>
        </div>
      </Card>

      {/* 搜索结果 */}
      {searchResult && searchResult.product_data && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">搜索结果</h2>
            {searchResult.auto_saved ? (
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                已创建
              </Badge>
            ) : (
              <Badge variant="outline">待确认</Badge>
            )}
          </div>

          <div className="space-y-4">
            {/* 商品基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">商品名称</label>
                <p className="font-semibold text-lg">
                  {searchResult.product_data.product_name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">品牌</label>
                <p className="font-semibold">{searchResult.product_data.brand}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">规格</label>
                <p className="font-semibold">{searchResult.product_data.specification || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">类别</label>
                <p className="font-semibold">{searchResult.product_data.category}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">适用动物</label>
                <p className="font-semibold">{searchResult.product_data.target_animal || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">产地</label>
                <p className="font-semibold">{searchResult.product_data.origin || '-'}</p>
              </div>
            </div>

            {/* 价格信息 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                价格信息
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500 mb-1">市场最低价</p>
                  <p className="text-lg font-bold text-green-600">
                    ¥{searchResult.product_data.market_price_min || 0}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500 mb-1">市场最高价</p>
                  <p className="text-lg font-bold text-red-600">
                    ¥{searchResult.product_data.market_price_max || 0}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500 mb-1">平均价格</p>
                  <p className="text-lg font-bold text-blue-600">
                    ¥{searchResult.product_data.market_price_avg || 0}
                  </p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded border-2 border-yellow-400">
                  <p className="text-xs text-gray-500 mb-1">建议零售价</p>
                  <p className="text-lg font-bold text-yellow-600">
                    ¥{searchResult.product_data.suggested_retail_price || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* 产品特点 */}
            {searchResult.product_data.features && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  产品特点
                </h3>
                <p className="text-sm text-gray-700">
                  {searchResult.product_data.features}
                </p>
              </div>
            )}

            {/* 成分 */}
            {searchResult.product_data.ingredients && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">主要成分</h3>
                <p className="text-sm text-gray-700">
                  {searchResult.product_data.ingredients}
                </p>
              </div>
            )}

            {/* 库存建议 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                库存建议
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">建议库存量</p>
                  <p className="text-lg font-semibold">
                    {searchResult.product_data.suggested_stock_quantity || 10} 件
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">搜索置信度</p>
                  <Badge variant={
                    searchResult.product_data.search_confidence === '高' ? 'default' :
                    searchResult.product_data.search_confidence === '中' ? 'secondary' : 'outline'
                  }>
                    {searchResult.product_data.search_confidence || '中'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 进货渠道建议 */}
            {searchResult.product_data.supplier_suggestions && 
             searchResult.product_data.supplier_suggestions.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  进货渠道建议
                </h3>
                <div className="flex flex-wrap gap-2">
                  {searchResult.product_data.supplier_suggestions.map((supplier: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {supplier}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 数据来源 */}
            {searchResult.product_data.data_sources && 
             searchResult.product_data.data_sources.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm text-gray-500 mb-2">数据来源</h3>
                <div className="flex flex-wrap gap-2">
                  {searchResult.product_data.data_sources.map((source: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            {!searchResult.auto_saved && (
              <div className="border-t pt-4 flex gap-3">
                <Button
                  onClick={handleCreateProduct}
                  disabled={isSearching}
                  className="flex-1"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  确认创建商品
                </Button>
                <Button
                  onClick={() => setSearchResult(null)}
                  variant="outline"
                >
                  取消
                </Button>
              </div>
            )}

            {searchResult.auto_saved && searchResult.details && (
              <div className="border-t pt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 mb-2">
                        商品已成功创建！
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">商品ID:</span>{' '}
                          <span className="font-mono">{searchResult.product_id}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">规格ID:</span>{' '}
                          <span className="font-mono">{searchResult.spec_id}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">品牌:</span>{' '}
                          <span>{searchResult.details.brand}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">分类:</span>{' '}
                          <span>{searchResult.details.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">零售价:</span>{' '}
                          <span className="font-semibold">¥{searchResult.details.price}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">初始库存:</span>{' '}
                          <span>{searchResult.details.initial_stock} 件</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 功能特色 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">智能搜索</h3>
          </div>
          <p className="text-sm text-gray-600">
            AI自动从网上搜索商品的详细信息，包括品牌、规格、价格等
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold">价格参考</h3>
          </div>
          <p className="text-sm text-gray-600">
            提供市场价格区间和建议零售价，帮助您合理定价
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">一键创建</h3>
          </div>
          <p className="text-sm text-gray-600">
            自动创建商品、规格、品牌、分类，无需手动填写
          </p>
        </Card>
      </div>

      {/* 示例 */}
      <Card className="p-4 mt-6">
        <h3 className="font-semibold mb-3">💡 试试这些示例：</h3>
        <div className="flex flex-wrap gap-2">
          {[
            '皇家猫粮成猫2kg',
            '宝路狗粮10kg',
            '膨润土猫砂5L',
            '宠物智能饮水机',
            '狗狗磨牙玩具',
            '猫抓板'
          ].map((example, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => setQuery(example)}
            >
              {example}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  )
}
