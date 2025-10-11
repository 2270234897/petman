import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Package, 
  ShoppingCart,
  Tag,
  Building2,
  Palette,
  FileBarChart,
  Upload,
  Camera,
  Search,
  Sparkles
} from "lucide-react"

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "仪表盘", path: "/" },
  { icon: Calendar, label: "预约管理", path: "/appointments" },
  { icon: Users, label: "客户管理", path: "/customers" },
  { icon: Package, label: "库存管理", path: "/inventory" },
];

const inventoryItems = [
  { icon: Package, label: "商品管理", path: "/inventory/products" },
  { icon: ShoppingCart, label: "库存管理", path: "/inventory/stock" },
  { icon: Tag, label: "规格管理", path: "/inventory/specs" },
  { icon: Building2, label: "供应商", path: "/inventory/dealers" },
  { icon: Palette, label: "分类管理", path: "/inventory/classify" },
  { icon: FileBarChart, label: "品牌管理", path: "/inventory/brands" },
];

const toolItems = [
  { icon: Upload, label: "快速导入", path: "/quick-import" },
  { icon: Camera, label: "图像识别", path: "/image-recognition" },
  { icon: Search, label: "智能搜索", path: "/smart-search" },
  { icon: Sparkles, label: "AI助手", path: "/agent-assistant" },
];

export function ResponsiveSidebar({ className, onNavigate }: SidebarProps) {
  const location = useLocation();

  const NavLink = ({ item }: { item: typeof menuItems[0] }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <Link
        to={item.path}
        onClick={onNavigate}
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
          "text-sm font-medium",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Logo */}
      <div className="px-4 py-5 border-b">
        <h2 className="text-2xl font-bold">🐾 PetMan</h2>
        <p className="text-xs text-muted-foreground mt-1">宠物管理系统</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Menu */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            主菜单
          </h3>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Inventory Submenu */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            库存管理
          </h3>
          <div className="space-y-1">
            {inventoryItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            快捷工具
          </h3>
          <div className="space-y-1">
            {toolItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}



