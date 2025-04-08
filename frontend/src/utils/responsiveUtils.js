import { useState, useEffect } from 'react';

/**
 * Hook pentru a detecta dimensiunea ferestrei și a returna breakpoint-ul curent
 * Util pentru a aplica logică în funcție de dimensiunea ecranului
 */
export const useBreakpoint = () => {
  // Definirea breakpoint-urilor (corespund cu cele din Tailwind)
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };

  const getDeviceConfig = (width) => {
    if (width < breakpoints.sm) {
      return 'xs';
    } else if (width < breakpoints.md) {
      return 'sm';
    } else if (width < breakpoints.lg) {
      return 'md';
    } else if (width < breakpoints.xl) {
      return 'lg';
    } else if (width < breakpoints['2xl']) {
      return 'xl';
    } else {
      return '2xl';
    }
  };

  const [breakpoint, setBreakpoint] = useState(() => {
    // Verificăm dacă suntem pe client sau server (SSR)
    if (typeof window !== 'undefined') {
      return getDeviceConfig(window.innerWidth);
    }
    return 'md'; // Valoare implicită pentru SSR
  });

  useEffect(() => {
    // Verificăm dacă suntem pe client
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setBreakpoint(getDeviceConfig(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

/**
 * Hook pentru a detecta dacă dispozitivul este mobil
 */
export const useMobileDetect = () => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  
  return { isMobile, breakpoint };
};

/**
 * Hook pentru a preveni scrollarea în fundal când un modal este deschis
 * Util pentru experiența pe mobil
 */
export const usePreventBodyScroll = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Previne scrollarea pe body când modalul este deschis
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurează scrollarea normală
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
};

/**
 * Utilitar pentru a simplifica adăugarea claselor responsive
 * Exemplu: responsiveClasses('p-2', 'md:p-4', 'lg:p-6')
 */
export const responsiveClasses = (...classes) => {
  return classes.filter(Boolean).join(' ');
};