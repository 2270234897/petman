import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@radix-ui/react-popover"
import { Card } from "@/components/ui/card"

interface CompactFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  searchTerm: string
  onSearchChange: (value: string) => void
  onFilterClick?: () => void
  placeholder?: string
  className?: string
}

export const CompactFilter = React.forwardRef<HTMLDivElement, CompactFilterProps>(
  ({ searchTerm, onSearchChange, onFilterClick, placeholder = "搜索...", className, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 p-2 bg-background rounded-lg border shadow-sm w-fit",
          className
        )}
        {...props}
      >
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 w-40 focus:w-60 transition-all duration-300"
          />
        </div>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="z-50 w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            align="end"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">筛选选项</h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  在这里添加筛选选项
                </p>
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => {
                    onFilterClick?.()
                    setIsOpen(false)
                  }}>
                    应用筛选
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)
CompactFilter.displayName = "CompactFilter"