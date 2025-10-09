import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  Search,
  Check
} from "lucide-react"

interface Category {
  classify1_ID: number
  name: string
  parent_name?: string
  parentID?: number
  level?: number
  children?: Category[]
}

interface TreeSelectProps {
  categories: Category[]
  value?: number
  onValueChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
}

export function TreeSelect({ 
  categories, 
  value, 
  onValueChange, 
  placeholder = "请选择分类",
  disabled = false 
}: TreeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  // 构建分类树结构
  const categoryTree = useMemo(() => {
    if (!categories || categories.length === 0) return []
    
    const categoryMap = new Map<number, Category>()
    const rootCategories: Category[] = []
    
    // 首先创建所有分类节点
    categories.forEach((cat: any) => {
      categoryMap.set(cat.classify1_ID, {
        classify1_ID: cat.classify1_ID,
        name: cat.name,
        parentID: cat.parentID,
        parent_name: cat.parent_name,
        level: cat.parentID ? 2 : 1,
        children: []
      })
    })
    
    // 构建树结构
    categories.forEach((cat: any) => {
      const category = categoryMap.get(cat.classify1_ID)!
      if (cat.parentID) {
        const parent = categoryMap.get(cat.parentID)
        if (parent) {
          parent.children!.push(category)
          category.level = 2
        }
      } else {
        category.level = 1
        rootCategories.push(category)
      }
    })
    
    return rootCategories
  }, [categories])

  // 过滤分类
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categoryTree
    
    const filterCategories = (cats: Category[]): Category[] => {
      return cats.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        const hasMatchingChildren = cat.children && filterCategories(cat.children).length > 0
        return matchesSearch || hasMatchingChildren
      }).map(cat => ({
        ...cat,
        children: cat.children ? filterCategories(cat.children) : []
      }))
    }
    
    return filterCategories(categoryTree)
  }, [categoryTree, searchTerm])

  // 获取选中的分类名称
  const selectedCategory = useMemo(() => {
    if (!value) return null
    
    const findCategory = (cats: Category[]): Category | null => {
      for (const cat of cats) {
        if (cat.classify1_ID === value) return cat
        if (cat.children) {
          const found = findCategory(cat.children)
          if (found) return found
        }
      }
      return null
    }
    
    const found = findCategory(categoryTree)
    console.log('TreeSelect - selectedCategory:', found, 'value:', value) // 调试信息
    return found
  }, [value, categoryTree])

  const toggleExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCategorySelect = (categoryId: number) => {
    console.log('TreeSelect - handleCategorySelect:', categoryId) // 调试信息
    onValueChange(categoryId)
    setIsOpen(false)
  }

  const renderCategoryTree = (categories: Category[], level: number = 0) => {
    return categories.map((category) => {
      const isExpanded = expandedCategories.has(category.classify1_ID)
      const hasChildren = category.children && category.children.length > 0
      const isSelected = value === category.classify1_ID
      
      return (
        <div key={category.classify1_ID} className="space-y-1">
          <div 
            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors hover:bg-gray-50 ${
              isSelected ? 'bg-blue-100 border-blue-400' : 'border-gray-200'
            }`}
            style={{ marginLeft: `${level * 16}px` }}
            onClick={() => handleCategorySelect(category.classify1_ID)}
          >
            {/* 展开/收起按钮 */}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpansion(category.classify1_ID)
                }}
                className="p-1 h-5 w-5"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            
            {/* 分类图标和名称 */}
            <div className="flex items-center gap-2 flex-1">
              {level === 0 ? (
                <FolderOpen className="h-4 w-4 text-blue-600" />
              ) : (
                <Folder className="h-4 w-4 text-green-600" />
              )}
              <span className={`text-sm ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                {category.name}
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  level === 0 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                  'bg-green-100 text-green-700 border-green-300'
                }`}
              >
                {level === 0 ? '一级分类' : '二级分类'}
              </Badge>
              {isSelected && (
                <Check className="h-4 w-4 text-blue-600 ml-auto" />
              )}
            </div>
          </div>
          
          {/* 递归渲染子分类 */}
          {hasChildren && isExpanded && (
            <div className="space-y-1">
              {renderCategoryTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <Select open={isOpen} onOpenChange={setIsOpen} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              {selectedCategory.level === 1 ? (
                <FolderOpen className="h-4 w-4 text-blue-600" />
              ) : (
                <Folder className="h-4 w-4 text-green-600" />
              )}
              <span>{selectedCategory.name}</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  selectedCategory.level === 1 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                  'bg-green-100 text-green-700 border-green-300'
                }`}
              >
                {selectedCategory.level === 1 ? '一级分类' : '二级分类'}
              </Badge>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-full">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索分类..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-2">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchTerm ? "未找到匹配的分类" : "暂无分类数据"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {renderCategoryTree(filteredCategories)}
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  )
}
