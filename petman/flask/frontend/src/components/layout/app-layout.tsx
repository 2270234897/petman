import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MobileLayout } from "./mobile-layout"
import { useMobile } from "@/hooks/useMobile"

export function AppLayout() {
  const isMobile = useMobile()

  // Use mobile layout for mobile devices
  if (isMobile) {
    return <MobileLayout />
  }

  // Use desktop layout for desktop devices
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

