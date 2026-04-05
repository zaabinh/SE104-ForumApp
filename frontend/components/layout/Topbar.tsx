'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiBell, FiCommand, FiMenu, FiSearch, FiZap } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import { getStoredUser, logout } from '@/lib/axios';

type TopbarProps = {
  isSidebarCollapsed: boolean;
  onOpenMobileSidebar: () => void;
  userEmail: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
};

function Topbar({ isSidebarCollapsed, onOpenMobileSidebar, userEmail, searchQuery = '', onSearchChange }: TopbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const storedUser = useMemo(() => getStoredUser(), []);
  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60';

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push('/login');
  };

  return (
    <header className={`sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-white/50 bg-white/72 px-4 py-3 backdrop-blur-xl transition-all duration-300 ${sidebarOffsetClass}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden items-center gap-3 rounded-[22px] border border-white/70 bg-white/80 px-3 py-2 shadow-card md:inline-flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/85">
            <Image src="/images/uit.png" alt="UIT logo" width={32} height={32} className="h-8 w-8 object-contain" priority />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink-900">UIT Nexus</p>
            <p className="text-xs text-ink-500">Community workspace</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex h-10 w-10 cursor-pointer select-none items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700 md:hidden"
          aria-label="Open sidebar menu"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <div className="hidden rounded-full border border-white/70 bg-gradient-to-r from-uit-50 to-ai-cyan/10 px-3 py-2 text-xs font-semibold text-uit-700 shadow-sm md:inline-flex md:items-center md:gap-2">
          <FiZap className="h-4 w-4" />
          AI community copilot active
        </div>
      </div>

      <div className="order-3 w-full md:order-none md:flex-1 md:px-4">
        <div className="mx-auto w-full max-w-xl">
          <label className="relative block">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search posts, people, tags, and AI insights..."
              autoComplete="off"
              className="h-12 w-full rounded-full border border-white/70 bg-white/86 pl-11 pr-14 text-sm text-ink-700 outline-none shadow-card transition-all duration-200 placeholder:text-ink-400 focus:border-uit-300"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full border border-uit-100 bg-uit-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-uit-700 sm:inline-flex">
              <FiCommand className="h-3 w-3" />
              K
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2" ref={menuRef}>
        <button
          type="button"
          className="relative flex h-11 w-11 cursor-pointer select-none items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700"
          aria-label="Notifications"
        >
          <FiBell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-ai-mint" />
        </button>
        <div className="relative">
          <button
            type="button"
            className="flex cursor-pointer select-none items-center gap-3 rounded-[22px] border border-white/70 bg-white/80 px-2 py-1.5 shadow-card transition-all duration-200 hover:border-uit-300 hover:bg-white"
            onClick={() => setOpen((prev) => !prev)}
          >
            <Avatar src={storedUser?.avatar_url} alt={storedUser?.full_name || 'User avatar'} size={36} />
            <div className="hidden text-left md:block">
              <p className="max-w-32 truncate cursor-default select-none text-sm font-semibold text-ink-800">{userEmail || 'Guest'}</p>
              <p className="cursor-default select-none text-xs text-ink-500">Workspace account</p>
            </div>
          </button>
          {open ? (
            <div className="absolute right-0 top-14 w-52 rounded-[24px] border border-white/70 bg-white/88 p-2 shadow-dashboard backdrop-blur-2xl">
              <button
                type="button"
                className="block w-full cursor-pointer select-none rounded-2xl px-3 py-2.5 text-left text-sm text-ink-700 transition-all duration-200 hover:bg-uit-50"
                onClick={() => {
                  if (storedUser?.username) {
                    router.push(`/profile/${storedUser.username}`);
                    setOpen(false);
                  }
                }}
              >
                Profile
              </button>
              <button
                type="button"
                className="block w-full cursor-pointer select-none rounded-2xl px-3 py-2.5 text-left text-sm text-ink-700 transition-all duration-200 hover:bg-uit-50"
                onClick={() => {
                  router.push('/settings');
                  setOpen(false);
                }}
              >
                Settings
              </button>
              <button
                type="button"
                className="block w-full cursor-pointer select-none rounded-2xl px-3 py-2.5 text-left text-sm text-rose-500 transition-all duration-200 hover:bg-rose-50"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default memo(Topbar);
