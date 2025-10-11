import { Link, useLocation } from "react-router-dom";
import { Home, Users, Package, Calendar, Settings } from "lucide-react";

const navItems = [
  { name: "首页", href: "/", icon: Home },
  { name: "客户", href: "/customers", icon: Users },
  { name: "库存", href: "/inventory", icon: Package },
  { name: "预约", href: "/appointments", icon: Calendar },
  { name: "设置", href: "/settings", icon: Settings },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
