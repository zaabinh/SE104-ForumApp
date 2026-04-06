'use client';

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

const SIDEBAR_COLLAPSED_KEY = 'forum-app-sidebar-collapsed';

export function useResponsiveSidebar() {
  const [desktopCollapsed, setDesktopCollapsed] = useState<boolean | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (desktopCollapsed !== null) {
      return;
    }

    const raw = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    const storedPreference = raw === null ? window.innerWidth < 1120 : raw === 'true';
    setDesktopCollapsed(storedPreference);
    setIsSidebarCollapsedState(window.innerWidth < 768 ? true : storedPreference);
  }, [desktopCollapsed]);

  useEffect(() => {
    let frameId = 0;

    const syncSidebarState = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        if (window.innerWidth < 768) {
          setIsSidebarCollapsedState(true);
          setIsMobileSidebarOpen(false);
          return;
        }

        const nextDesktopCollapsed = desktopCollapsed ?? window.innerWidth < 1120;
        setDesktopCollapsed(nextDesktopCollapsed);
        setIsSidebarCollapsedState(nextDesktopCollapsed);
      });
    };

    syncSidebarState();
    window.addEventListener('resize', syncSidebarState);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', syncSidebarState);
    };
  }, [desktopCollapsed]);

  useEffect(() => {
    if (desktopCollapsed === null) {
      return;
    }

    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(desktopCollapsed));
  }, [desktopCollapsed]);

  const setIsSidebarCollapsed = useCallback<Dispatch<SetStateAction<boolean>>>((value) => {
    setDesktopCollapsed((prev) => {
      const resolved = typeof value === 'function' ? value(prev ?? false) : value;

      if (window.innerWidth >= 768) {
        setIsSidebarCollapsedState(resolved);
      }

      return resolved;
    });
  }, []);

  return {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsSidebarCollapsed,
    setIsMobileSidebarOpen,
  };
}
