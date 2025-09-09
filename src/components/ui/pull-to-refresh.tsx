'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pullStartRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = container.scrollTop;
      setIsAtTop(scrollTop === 0);
      
      if (scrollTop === 0) {
        pullStartRef.current = e.touches[0].clientY;
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop || disabled) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - pullStartRef.current);
      
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(distance);
        setIsPulling(distance > 20);
      }
    };

    const handleTouchEnd = async () => {
      if (!isAtTop || disabled) return;

      if (pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setPullDistance(0);
      setIsPulling(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAtTop, pullDistance, threshold, onRefresh, isRefreshing, disabled]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = isPulling || isRefreshing;

  return (
    <div className={cn("relative", className)}>
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-10 flex items-center justify-center transition-all duration-200",
          shouldShowIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: `${Math.min(pullDistance, threshold)}px`,
          transform: `translateY(${Math.min(pullDistance - threshold, 0)}px)`,
        }}
      >
        <div className="flex items-center space-x-2 text-gray-500">
          <RefreshCw
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              isRefreshing && "animate-spin",
              pullProgress > 0.8 && "text-blue-500"
            )}
            style={{
              transform: `rotate(${pullProgress * 180}deg)`,
            }}
          />
          <span className="text-sm">
            {isRefreshing
              ? "Atualizando..."
              : pullProgress > 0.8
              ? "Solte para atualizar"
              : "Puxe para atualizar"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="h-full overflow-auto"
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.5, threshold * 0.5)}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
