'use client';

import { useEffect, useState } from 'react';

export function useResponsiveSidebar() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const syncSidebarState = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
        setIsMobileSidebarOpen(false);
        return;
      }

      setIsSidebarCollapsed(window.innerWidth < 1280);
    };

    syncSidebarState();
    window.addEventListener('resize', syncSidebarState);

    return () => window.removeEventListener('resize', syncSidebarState);
  }, []);

  return {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsSidebarCollapsed,
    setIsMobileSidebarOpen,
  };
}
