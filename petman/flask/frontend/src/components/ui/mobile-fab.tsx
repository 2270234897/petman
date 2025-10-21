import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MobileFABProps {
  onClick: () => void;
  icon?: ReactNode;
  className?: string;
  label?: string;
}

/**
 * Mobile Floating Action Button (FAB)
 * A floating button typically used for primary actions on mobile
 */
export function MobileFAB({ 
  onClick, 
  icon = <Plus className="h-6 w-6" />, 
  className,
  label 
}: MobileFABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-40",
        "flex items-center justify-center",
        "rounded-full shadow-lg",
        "bg-primary text-primary-foreground",
        "transition-all duration-200",
        "active:scale-90",
        label ? "px-6 h-14 space-x-2" : "w-14 h-14",
        className
      )}
    >
      {icon}
      {label && <span className="font-medium">{label}</span>}
    </button>
  );
}







