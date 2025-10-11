import { Menu, Bell, Search } from "lucide-react";
import { useState } from "react";
import { MobileSidebar } from "./mobile-sidebar";

export function MobileHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Center: Logo/Title */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">🐾 PetMan</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            <button className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}



