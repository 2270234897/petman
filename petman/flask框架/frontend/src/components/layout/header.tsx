import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Search,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
} from "lucide-react"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className={`flex h-16 items-center justify-between border-b px-6 ${className} vibrant-card-blue`}>
      {/* Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索宠物、客户、预约..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 btn-vibrant-purple"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-white" />
          ) : (
            <Moon className="h-4 w-4 text-white" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative btn-vibrant-pink">
          <Bell className="h-4 w-4 text-white" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <User className="h-4 w-4 text-purple-700 dark:text-purple-300" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">管理员</p>
            <p className="text-xs text-muted-foreground">admin@pet.com</p>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 btn-vibrant-teal">
            <LogOut className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </header>
  )
}