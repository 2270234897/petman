import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Heart,
  Users,
  Calendar,
  Package,
  Menu,
  X,
  Settings,
  Camera,
} from "lucide-react"

const navigation = [
  { name: "仪表板", href: "/", icon: Home },
  { name: "宠物管理", href: "/pets", icon: Heart },
  { name: "客户管理", href: "/customers", icon: Users },
  { name: "预约管理", href: "/appointments", icon: Calendar },
  { name: "库存管理", href: "/inventory", icon: Package },
  { name: "图片识别", href: "/image-recognition", icon: Camera },
  { name: "系统设置", href: "/settings", icon: Settings },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r transition-all duration-300 sidebar-gradient",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/20">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-white">宠物管理系统</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 text-white hover:bg-white/20"
        >
          {isCollapsed ? <Menu className="h-4 w-4 text-white" /> : <X className="h-4 w-4 text-white" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-white/20",
                isActive
                  ? "bg-white/30 text-white shadow-md"
                  : "text-white/90 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xs font-medium text-white">管</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">管理员</p>
              <p className="text-xs text-white/80 truncate">admin@pet.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}