'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiBookmark,
  FiChevronLeft,
  FiCompass,
  FiHome,
  FiLogOut,
  FiMessageSquare,
  FiPlusSquare,
  FiSettings,
  FiShield,
  FiUser,
  FiZap,
} from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { getStoredUser, logout } from '@/lib/axios';

type SidebarProps = {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

function Sidebar({ isCollapsed, isMobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const storedUser = useMemo(() => getStoredUser(), []);
  const currentProfileHref = storedUser?.username ? `/profile/${storedUser.username}` : '/profile/current-user';
  const desktopWidthClass = isCollapsed ? 'md:w-20' : 'md:w-60';
  const labelVisibilityClass = isCollapsed ? 'md:hidden' : 'md:inline';
  const justifyClass = isCollapsed ? 'md:justify-center' : 'md:justify-start';
  const isAdmin = storedUser?.role?.toLowerCase() === 'admin';
  const menuItems = useMemo(
    () => [
      { label: 'Home / Feed', href: '/feed', icon: FiHome },
      { label: 'Explore', href: '/feed', icon: FiCompass },
      { label: 'My Profile', href: currentProfileHref, icon: FiUser },
      { label: 'Messages', href: '/feed', icon: FiMessageSquare },
      { label: 'Bookmarks', href: currentProfileHref, icon: FiBookmark },
      { label: 'AI Suggestions', href: '/feed', icon: FiZap },
      { label: 'Settings', href: '/settings', icon: FiSettings },
      ...(isAdmin ? [{ label: 'Admin', href: '/dashboard', icon: FiShield }] : []),
    ],
    [currentProfileHref, isAdmin]
  );

  return (
    <>
      {isMobileOpen ? <button type="button" className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" onClick={onCloseMobile} aria-label="Close sidebar" /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] max-h-[100dvh] w-60 flex-col overflow-hidden border-r border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(246,250,255,0.88)_100%)] px-4 py-5 shadow-glass backdrop-blur-xl transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${desktopWidthClass} md:translate-x-0`}
      >
        <div className={`mb-6 flex items-center gap-3 ${isCollapsed ? 'justify-center md:justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-2 shadow-card">
              <Image src="/images/uit.png" alt="UIT logo" width={44} height={44} className="h-11 w-11 object-contain" />
            </div>
            <div className={`cursor-default select-none ${labelVisibilityClass}`}>
              <p className="text-lg font-extrabold text-ink-900">UIT Nexus</p>
              <p className="text-xs text-ink-500">Modern AI community</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden h-10 w-10 cursor-pointer select-none items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700 md:flex ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto pr-1">
            <div className={`mb-5 rounded-[26px] border border-uit-100 bg-gradient-to-br from-uit-50 via-white to-ai-cyan/10 p-4 shadow-card ${isCollapsed ? 'md:px-2' : ''}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.28em] text-uit-700 ${labelVisibilityClass}`}>Workspace</p>
              <p className={`mt-2 text-sm text-ink-600 ${labelVisibilityClass}`}>Discuss technology, discover people, and surface AI-driven insights.</p>
              <Link href="/create" className="mt-4 block">
                <Button className={`flex w-full cursor-pointer select-none items-center gap-2 ${justifyClass}`}>
                  <FiPlusSquare className="h-4 w-4 shrink-0" />
                  <span className={labelVisibilityClass}>Create post</span>
                </Button>
              </Link>
            </div>

            <div className={`mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-400 ${labelVisibilityClass}`}>Navigation</div>
            <nav className="space-y-2">
              {menuItems.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={onCloseMobile}
                  className={`group flex cursor-pointer select-none items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-ink-600 transition-all duration-200 hover:bg-uit-50 hover:text-uit-700 ${justifyClass}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-ink-500 shadow-sm transition-all duration-200 group-hover:bg-gradient-to-br group-hover:from-uit-100 group-hover:to-ai-cyan/30 group-hover:text-uit-700">
                    <Icon className="h-5 w-5 shrink-0" />
                  </span>
                  <span className={labelVisibilityClass}>{label}</span>
                </Link>
              ))}
            </nav>

            <div className={`mt-6 rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-sm ${isCollapsed ? 'hidden' : 'hidden md:block'}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-400">Live status</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-ai-mint animate-pulse-soft" />
                <p className="text-sm text-ink-600">92% healthy conversations this week</p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            await logout();
            onCloseMobile();
            window.location.href = '/login';
          }}
          className={`mt-auto flex cursor-pointer select-none items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-ink-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-500 ${justifyClass}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
            <FiLogOut className="h-5 w-5 shrink-0" />
          </span>
          <span className={labelVisibilityClass}>Logout</span>
        </button>
      </aside>
    </>
  );
}

export default memo(Sidebar);
