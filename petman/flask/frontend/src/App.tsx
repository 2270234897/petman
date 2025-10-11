import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { queryClient } from "@/lib/query"
import { AppLayout } from "@/components/layout/app-layout"
import { Dashboard } from "@/pages/dashboard"
import { Pets } from "@/pages/pets"
import { Customers } from "@/pages/customers"
import { Appointments } from "@/pages/appointments"
import { Inventory } from "@/pages/inventory"
import { InventoryProducts } from "@/pages/inventory/products"
import { InventoryStock } from "@/pages/inventory/stock"
import { InventorySpecs } from "@/pages/inventory/specs"
import { Classify } from "@/pages/inventory/classify"
import { Brands } from "@/pages/inventory/brands"
import { Dealers } from "@/pages/inventory/dealers"
import { ImportPage } from "@/pages/inventory/import"
import { QuickImport } from "@/pages/quick-import"
import { ImageRecognitionPage } from "@/pages/image-recognition"
import AgentAssistant from "@/pages/agent-assistant"
import { SmartSearch } from "@/pages/smart-search"
import { Toaster } from "sonner"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/products" element={<InventoryProducts />} />
            <Route path="/inventory/stock" element={<InventoryStock />} />
            <Route path="/inventory/specs" element={<InventorySpecs />} />
            <Route path="/inventory/classify" element={<Classify />} />
            <Route path="/inventory/brands" element={<Brands />} />
            <Route path="/inventory/dealers" element={<Dealers />} />
            <Route path="/inventory/import" element={<ImportPage />} />
            <Route path="/quick-import" element={<QuickImport />} />
            <Route path="/image-recognition" element={<ImageRecognitionPage />} />
            <Route path="/agent-assistant" element={<AgentAssistant />} />
            <Route path="/smart-search" element={<SmartSearch />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App