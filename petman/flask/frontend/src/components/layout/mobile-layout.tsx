import { Outlet } from "react-router-dom";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileHeader } from "./mobile-header";

export function MobileLayout() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content - scrollable area */}
      <main className="flex-1 overflow-y-auto pb-16">
        <div className="container mx-auto p-4">
          <Outlet />
        </div>
      </main>
      
      {/* Bottom Navigation - fixed at bottom */}
      <MobileBottomNav />
    </div>
  );
}



