'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiBell, FiMenu, FiSearch } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';

type TopbarProps = {
  isSidebarCollapsed: boolean;
  onOpenMobileSidebar: () => void;
  userEmail: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
};

export default function Topbar({ isSidebarCollapsed, onOpenMobileSidebar, userEmail, searchQuery = '', onSearchChange }: TopbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setOpen(false);
    router.push('/login');
  };

  return (
    <header className={`sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur transition-all duration-200 ${sidebarOffsetClass}`}>
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex h-10 w-10 cursor-pointer select-none items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all duration-200 hover:border-forum-primary hover:text-forum-primary md:hidden"
          aria-label="Open sidebar menu"
        >
          <FiMenu className="h-5 w-5" />
        </button>
      </div>

      <div className="order-3 w-full md:order-none md:flex-1 md:px-4">
        <div className="mx-auto w-full max-w-xl">
          <label className="relative block">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search posts, tags, authors..."
              autoComplete="off"
              className="h-11 w-full rounded-full border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-700 caret-transparent outline-none transition-all duration-200 focus:border-forum-primary focus:caret-forum-primary"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2" ref={menuRef}>
        <button
          type="button"
          className="flex h-10 w-10 cursor-pointer select-none items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all duration-200 hover:border-forum-primary hover:text-forum-primary"
          aria-label="Notifications"
        >
          <FiBell className="h-5 w-5" />
        </button>
        <div className="relative">
          <button
            type="button"
            className="flex cursor-pointer select-none items-center gap-3 rounded-2xl border border-slate-200 px-2 py-1.5 transition-all duration-200 hover:border-forum-primary hover:bg-slate-50"
            onClick={() => setOpen((prev) => !prev)}
          >
            <Avatar src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80" alt="User avatar" size={36} />
            <div className="hidden text-left md:block">
              <p className="max-w-32 truncate cursor-default select-none text-sm font-semibold text-slate-800">{userEmail || 'Guest'}</p>
              <p className="cursor-default select-none text-xs text-slate-500">Account</p>
            </div>
          </button>
          {open ? (
            <div className="absolute right-0 top-14 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
              <button
                type="button"
                className="block w-full cursor-pointer select-none rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-all duration-200 hover:bg-slate-100"
              >
                Profile
              </button>
              <button
                type="button"
                className="block w-full cursor-pointer select-none rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-all duration-200 hover:bg-slate-100"
              >
                Settings
              </button>
              <button
                type="button"
                className="block w-full cursor-pointer select-none rounded-xl px-3 py-2 text-left text-sm text-rose-500 transition-all duration-200 hover:bg-rose-50"
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
