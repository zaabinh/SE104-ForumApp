'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiBell, FiCommand, FiGrid, FiMenu, FiSearch } from 'react-icons/fi';
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
  const sidebarOffsetClass = isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60';

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
    <header className={`sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-[margin] duration-300 ease-in-out ${sidebarOffsetClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden items-center gap-3 md:inline-flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
              <Image src="/images/uit.png" alt="UIT logo" width={28} height={28} className="h-7 w-7 object-contain" priority />
            </div>
            <p className="text-lg font-semibold tracking-tight text-ink-900">UITConnect</p>
          </div>
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="flex h-10 w-10 cursor-pointer select-none items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700 md:hidden"
            aria-label="Open sidebar menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
        </div>

        <div className="order-3 w-full md:order-none md:flex-1 md:px-4">
          <div className="mx-auto w-full max-w-2xl">
            <label className="relative block">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder="Search"
                autoComplete="off"
                className="h-14 w-full rounded-[22px] border border-slate-200/80 bg-white pl-11 pr-20 text-sm text-ink-700 outline-none shadow-card transition-all duration-200 placeholder:text-ink-400 focus:border-uit-300"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-ink-500 sm:inline-flex">
                <FiCommand className="h-3 w-3" />
                K
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2" ref={menuRef}>
          <button
            type="button"
            className="hidden h-11 w-11 cursor-pointer select-none items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700 md:flex"
            aria-label="Workspace apps"
          >
            <FiGrid className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="relative flex h-11 w-11 cursor-pointer select-none items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700"
            aria-label="Notifications"
          >
            <FiBell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-ai-mint" />
          </button>
          <div className="relative">
            <button
              type="button"
              className="flex cursor-pointer select-none items-center gap-3 rounded-[22px] border border-slate-200/80 bg-white px-2 py-1.5 shadow-card transition-all duration-200 hover:border-uit-300 hover:bg-white"
              onClick={() => setOpen((prev) => !prev)}
            >
              <Avatar src={storedUser?.avatar_url} alt={storedUser?.full_name || 'User avatar'} size={36} />
              <div className="hidden text-left lg:block">
                <p className="max-w-36 truncate cursor-default select-none text-sm font-semibold text-ink-800">{userEmail || 'Guest'}</p>
              </div>
            </button>
            {open ? (
              <div className="absolute right-0 top-14 w-52 rounded-[24px] border border-slate-200/80 bg-white p-2 shadow-dashboard">
                <button
                  type="button"
                  className="block w-full cursor-pointer select-none rounded-2xl px-3 py-2.5 text-left text-sm text-ink-700 transition-all duration-200 hover:bg-uit-50"
                  onClick={() => {
                  if (storedUser?.username) {
                    router.push(`/profile/${storedUser.username}`);
                  } else {
                    router.push('/login'); // fallback
                  }
                  setOpen(false);
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
      </div>
    </header>
  );
}

export default memo(Topbar);
