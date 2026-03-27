'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AiOutlineCompass, AiOutlineHome, AiOutlineUser } from 'react-icons/ai';
import { BsBookmark } from 'react-icons/bs';
import { FiChevronLeft, FiLogOut, FiPlusSquare, FiTag, FiUsers } from 'react-icons/fi';
import Button from '@/components/ui/Button';

type SidebarProps = {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

const menuItems = [
  { label: 'Home', href: '/feed', icon: AiOutlineHome },
  { label: 'Following', href: '/feed', icon: FiUsers },
  { label: 'Explore', href: '/feed', icon: AiOutlineCompass },
  { label: 'Bookmarks', href: '/profile/current-user', icon: BsBookmark },
  { label: 'Tags', href: '/feed', icon: FiTag },
  { label: 'Profile', href: '/profile/current-user', icon: AiOutlineUser },
];

export default function Sidebar({ isCollapsed, isMobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const desktopWidthClass = isCollapsed ? 'md:w-20' : 'md:w-60';
  const labelVisibilityClass = isCollapsed ? 'md:hidden' : 'md:inline';
  const justifyClass = isCollapsed ? 'md:justify-center' : 'md:justify-start';

  return (
    <>
      {isMobileOpen ? <button type="button" className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" onClick={onCloseMobile} aria-label="Close sidebar" /> : null}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-sm transition-all duration-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${desktopWidthClass} md:translate-x-0`}
      >
        <div className={`mb-6 flex items-center gap-3 ${isCollapsed ? 'justify-center md:justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 text-forum-primary ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
              <Image src="/images/uit.png" alt="UIT logo" width={44} height={44} className="h-11 w-11 object-contain" />
            </div>
            <div className={`cursor-default select-none ${labelVisibilityClass}`}>
              <p className="text-lg font-extrabold">Forum.dev</p>
              <p className="text-xs text-slate-500">Developer community</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden h-10 w-10 cursor-pointer select-none items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all duration-200 hover:border-forum-primary hover:text-forum-primary md:flex ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <Link href="/create" className="mb-6">
          <Button className={`flex w-full cursor-pointer select-none items-center gap-2 ${justifyClass}`}>
            <FiPlusSquare className="h-4 w-4 shrink-0" />
            <span className={labelVisibilityClass}>New Post</span>
          </Button>
        </Link>

        <nav className="space-y-2">
          {menuItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={onCloseMobile}
              className={`flex cursor-pointer select-none items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-forum-primary ${justifyClass}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={labelVisibilityClass}>{label}</span>
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className={`mt-auto flex cursor-pointer select-none items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-rose-500 ${justifyClass}`}
        >
          <FiLogOut className="h-5 w-5 shrink-0" />
          <span className={labelVisibilityClass}>Logout</span>
        </Link>
      </aside>
    </>
  );
}
