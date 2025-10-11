import { useState, useRef, TouchEvent, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

/**
 * Mobile Pull-to-Refresh Component
 * Allows users to pull down to refresh content
 */
export function MobilePullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80 
}: MobilePullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isRefreshing || !containerRef.current || containerRef.current.scrollTop > 0) {
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  const rotation = isRefreshing ? "animate-spin" : "";
  const indicatorOpacity = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all"
        style={{
          height: pullDistance,
          opacity: indicatorOpacity,
        }}
      >
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <RefreshCw className={cn("h-5 w-5", rotation)} />
          <span>
            {isRefreshing
              ? "正在刷新..."
              : pullDistance >= threshold
              ? "松开刷新"
              : "下拉刷新"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? "transform 0.3s" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}



