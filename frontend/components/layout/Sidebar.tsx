'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiBookmark,
  FiChevronLeft,
  FiCompass,
  FiHome,
  FiLogOut,
  FiPlusSquare,
  FiSettings,
  FiShield,
  FiUser,
  FiUsers
} from 'react-icons/fi';
import { getStoredUser, logout } from '@/lib/axios';

type SidebarProps = {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

type SidebarItem = {
  label: string;
  href: string;
  icon: typeof FiHome;
  match?: 'exact' | 'startsWith' | 'never';
};

function Sidebar({ isCollapsed, isMobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const storedUser = useMemo(() => getStoredUser(), []);
  const currentProfileHref = storedUser?.username ? `/profile/${storedUser.username}` : '/profile/current-user';
  const desktopWidthClass = isCollapsed ? 'md:w-16' : 'md:w-60';
  const sectionVisibilityClass = isCollapsed ? 'md:hidden' : 'md:block';
  const justifyClass = isCollapsed ? 'md:justify-center' : 'md:justify-start';
  const isAdmin = storedUser?.role?.toLowerCase() === 'admin';
  const menuItems = useMemo<SidebarItem[]>(
    () => [
      { label: 'For You', href: '/feed', icon: FiHome, match: 'exact' },
      { label: 'Following', href: '/feed', icon: FiUsers, match: 'never' },
      { label: 'Explore', href: '/feed', icon: FiCompass, match: 'never' },
      { label: 'My Profile', href: currentProfileHref, icon: FiUser, match: 'startsWith' },
      { label: 'Bookmarks', href: currentProfileHref, icon: FiBookmark, match: 'never' },
      { label: 'Settings', href: '/settings', icon: FiSettings, match: 'startsWith' },
      ...(isAdmin ? [{ label: 'Admin', href: '/dashboard', icon: FiShield, match: 'startsWith' as const }] : []),
    ],
    [currentProfileHref, isAdmin]
  );

  const isItemActive = ({ href, label, match = 'exact' }: SidebarItem) => {
    if (match === 'never') {
      return false;
    }

    if (match === 'startsWith') {
      if (label === 'My Profile') {
        return pathname.startsWith('/users');
      }

      return pathname.startsWith(href);
    }

    return pathname === href;
  };

  const isCreateActive = pathname === '/create';

  return (
    <>
      {isMobileOpen ? <button type="button" className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" onClick={onCloseMobile} aria-label="Close sidebar" /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] max-h-[100dvh] w-60 flex-col overflow-hidden border-r border-slate-200/80 bg-white px-3 py-4 shadow-[0_20px_44px_rgba(15,23,42,0.08)] will-change-[width,transform,opacity] transition-[width] duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${desktopWidthClass} md:translate-x-0`}
      >
        <div className={`mb-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3`}>
          <div className={`min-w-0 ${sectionVisibilityClass}`}>
            <p className="text-[13px] font-medium text-ink-400">Menu</p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden h-10 w-10 cursor-pointer select-none items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-ink-600 transition-transform duration-300 ease-in-out hover:border-uit-300 hover:text-uit-700 md:flex ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className={`sidebar-scroll min-h-0 overflow-y-auto ${isCollapsed ? 'pr-0' : 'pr-1'}`}>
            <div className={`mb-5 ${isCollapsed ? 'flex justify-center' : ''}`}>
              <Link
                href="/create"
                onClick={onCloseMobile}
                className={`group flex h-14 items-center gap-3 overflow-hidden rounded-[18px] px-3 text-[15px] font-medium transition-all duration-300 ease-in-out ${
                  isCreateActive ? 'bg-slate-100 text-ink-900' : 'text-ink-600 hover:bg-slate-100 hover:text-ink-900'
                } ${justifyClass} ${isCollapsed ? 'md:w-14 md:px-0' : 'w-full'}`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ease-in-out ${
                    isCreateActive ? 'bg-slate-100 scale-105 text-ink-900' : 'text-ink-500 group-hover:text-ink-900'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <FiPlusSquare className="h-5 w-5 shrink-0" />
                  </span>
                </span>
                <span
                  className={`inline-block overflow-hidden whitespace-nowrap leading-none transition-[opacity,transform,max-width] duration-200 ease-in-out delay-50 will-change-[opacity,transform] ${
                    isCollapsed ? 'md:opacity-0 md:translate-x-1.5 md:max-w-0' : 'opacity-100 translate-x-0 max-w-[9rem]'
                  }`}
                >
                  New post
                </span>
              </Link>
            </div>

            <nav className={`space-y-1.5 ${isCollapsed ? 'px-0.5' : ''}`}>
              {menuItems.map((item) => {
                const { label, href, icon: Icon } = item;
                const isActive = isItemActive(item);

                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={onCloseMobile}
                    className={`group flex cursor-pointer select-none items-center gap-3 rounded-[18px] px-3 py-3 text-[15px] font-medium transition-all duration-300 hover:bg-slate-100 hover:text-ink-900 ${
                      isActive ? 'bg-slate-100 text-ink-900' : 'text-ink-600'
                    } ${justifyClass} ${isCollapsed ? 'md:px-0' : ''}`}
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ease-in-out group-hover:scale-105 ${
                        isActive ? 'bg-slate-100 scale-105 text-ink-900' : 'text-ink-500'
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                        <Icon className="h-5 w-5 shrink-0" />
                      </span>
                    </span>
                    <span
                      className={`inline-block overflow-hidden whitespace-nowrap leading-none transition-[opacity,transform,max-width] duration-200 ease-in-out delay-50 will-change-[opacity,transform] ${
                        isCollapsed ? 'md:opacity-0 md:translate-x-1.5 md:max-w-0' : 'opacity-100 translate-x-0 max-w-[10rem]'
                      }`}
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            await logout();
            onCloseMobile();
            window.location.href = '/login';
          }}
          className={`mt-4 flex cursor-pointer select-none items-center gap-3 rounded-[18px] px-3 py-3 text-sm font-medium text-ink-500 transition-all duration-300 hover:bg-rose-50 hover:text-rose-500 ${justifyClass} ${
            isCollapsed ? 'md:px-0' : ''
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">
              <FiLogOut className="h-5 w-5 shrink-0" />
            </span>
          </span>
          <span
            className={`inline-block overflow-hidden whitespace-nowrap transition-[opacity,transform,max-width] duration-200 ease-in-out delay-50 will-change-[opacity,transform] ${
              isCollapsed ? 'md:opacity-0 md:translate-x-1.5 md:max-w-0' : 'opacity-100 translate-x-0 max-w-[8rem]'
            }`}
          >
            Logout
          </span>
        </button>
      </aside>
    </>
  );
}

export default memo(Sidebar);
