import { X, Package, ShoppingCart, Tag, Building2, Palette, FileBarChart, Upload, Camera, Search as SearchIcon, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuSections = [
  {
    title: "库存管理",
    items: [
      { icon: Package, label: "商品管理", path: "/inventory/products" },
      { icon: ShoppingCart, label: "库存管理", path: "/inventory/stock" },
      { icon: Tag, label: "规格管理", path: "/inventory/specs" },
      { icon: Building2, label: "供应商", path: "/inventory/dealers" },
      { icon: Palette, label: "分类管理", path: "/inventory/classify" },
      { icon: FileBarChart, label: "品牌管理", path: "/inventory/brands" },
    ],
  },
  {
    title: "快捷工具",
    items: [
      { icon: Upload, label: "快速导入", path: "/quick-import" },
      { icon: Camera, label: "图像识别", path: "/image-recognition" },
      { icon: SearchIcon, label: "智能搜索", path: "/smart-search" },
      { icon: Zap, label: "AI助手", path: "/agent-assistant" },
    ],
  },
];

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-background border-r transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">菜单</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {menuSections.map((section) => (
            <div key={section.title} className="py-4">
              <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors"
                    >
                      <Icon className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}



