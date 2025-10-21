import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ children, className, onClick }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-4",
        "transition-all duration-200",
        onClick && "active:scale-95 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardHeader({ children, className }: MobileCardHeaderProps) {
  return (
    <div className={cn("mb-3", className)}>
      {children}
    </div>
  );
}

interface MobileCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardTitle({ children, className }: MobileCardTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold", className)}>
      {children}
    </h3>
  );
}

interface MobileCardContentProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardContent({ children, className }: MobileCardContentProps) {
  return (
    <div className={cn("text-sm", className)}>
      {children}
    </div>
  );
}

interface MobileCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function MobileCardFooter({ children, className }: MobileCardFooterProps) {
  return (
    <div className={cn("mt-3 pt-3 border-t", className)}>
      {children}
    </div>
  );
}







