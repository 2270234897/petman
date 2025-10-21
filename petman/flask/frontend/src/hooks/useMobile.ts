import { useState, useEffect } from 'react';

/**
 * Hook to detect if the device is mobile
 * Enhanced with multiple detection methods
 * @param breakpoint - The breakpoint width in pixels (default: 768)
 * @returns boolean indicating if the device is mobile
 */
export function useMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      // Method 1: Check screen width
      const widthCheck = window.innerWidth < breakpoint;
      
      // Method 2: Check User-Agent
      const ua = navigator.userAgent.toLowerCase();
      const uaCheck = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
      
      // Method 3: Check touch device
      const touchCheck = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Consider mobile if: width check passes OR (it's a mobile UA AND supports touch)
      const result = widthCheck || (uaCheck && touchCheck);
      
      // Debug log (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Mobile Detection:', {
          width: window.innerWidth,
          widthCheck,
          uaCheck,
          touchCheck,
          result,
          ua: ua.substring(0, 60) + '...'
        });
      }
      
      setIsMobile(result);
    };

    // Check on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect device type with more granular breakpoints
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
}

/**
 * Hook to detect touch device
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    );
  }, []);

  return isTouch;
}

/**
 * Hook to detect screen orientation
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return orientation;
}

/**
 * Hook to check if app is running as PWA
 */
export function useIsPWA(): boolean {
  const [isPWA, setIsPWA] = useState<boolean>(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // @ts-ignore
    const isIOSStandalone = window.navigator.standalone === true;
    setIsPWA(isStandalone || isIOSStandalone);
  }, []);

  return isPWA;
}



