'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiBell, FiCommand, FiGrid, FiMenu, FiSearch, FiTrash2 } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import { getStoredUser, logout } from '@/lib/axios';
import { useI18n } from '@/lib/i18n';
import { deleteReadNotification, getMyNotifications, markNotificationRead, NotificationItem } from '@/lib/profileApi';

type TopbarProps = {
  isSidebarCollapsed: boolean;
  onOpenMobileSidebar: () => void;
  userEmail: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
};

function formatNotificationTime(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function Topbar({ onOpenMobileSidebar, userEmail, searchQuery = '', onSearchChange }: TopbarProps) {
  const router = useRouter();
  const { locale, toggleLocale, t } = useI18n();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const storedUser = useMemo(() => getStoredUser(), []);
  const displayEmail = storedUser?.email || userEmail;
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  useEffect(() => {
    if (!isNotificationOpen) {
      return;
    }

    let cancelled = false;
    setIsLoadingNotifications(true);
    setNotificationError('');

    getMyNotifications()
      .then((items) => {
        if (!cancelled) {
          setNotifications(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotificationError(t('topbarNotificationsError'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingNotifications(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isNotificationOpen, t]);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    router.push('/login');
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (notification.is_read) {
      return;
    }

    try {
      const updatedNotification = await markNotificationRead(notification.id);
      setNotifications((items) => items.map((item) => (item.id === notification.id ? updatedNotification : item)));
    } catch {
      setNotifications((items) => items.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)));
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    setNotifications((items) => items.filter((item) => item.id !== notificationId));
    try {
      await deleteReadNotification(notificationId);
    } catch {
      getMyNotifications()
        .then((items) => setNotifications(items))
        .catch(() => setNotificationError(t('topbarNotificationsError')));
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
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
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700 md:hidden"
            aria-label={t('topbarOpenSidebarMenu')}
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
                placeholder={t('topbarSearchPlaceholder')}
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
            onClick={toggleLocale}
            className="flex h-11 min-w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700"
            aria-label={t('topbarToggleLang')}
            title={t('topbarToggleLang')}
          >
            {locale}
          </button>
          <button
            type="button"
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700 md:flex"
            aria-label={t('topbarWorkspaceApps')}
          >
            <FiGrid className="h-5 w-5" />
          </button>
          <div className="relative">
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-ink-600 transition-all duration-200 hover:border-uit-300 hover:text-uit-700"
              aria-label={t('topbarNotifications')}
              onClick={() => {
                setIsNotificationOpen((prev) => !prev);
                setIsProfileOpen(false);
              }}
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ai-mint px-1 text-[10px] font-bold text-ink-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </button>
            {isNotificationOpen ? (
              <div className="absolute right-0 top-14 w-[22rem] max-w-[calc(100vw-2rem)] rounded-[24px] border border-slate-200/80 bg-white p-2 shadow-dashboard">
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-sm font-semibold text-ink-900">{t('topbarNotifications')}</p>
                  {unreadCount > 0 ? <span className="rounded-full bg-uit-50 px-2 py-0.5 text-xs font-semibold text-uit-700">{unreadCount}</span> : null}
                </div>

                {isLoadingNotifications ? <p className="px-3 py-6 text-sm text-ink-500">{t('topbarNotificationsLoading')}</p> : null}
                {!isLoadingNotifications && notificationError ? <p className="px-3 py-6 text-sm text-rose-500">{notificationError}</p> : null}
                {!isLoadingNotifications && !notificationError && notifications.length === 0 ? (
                  <p className="px-3 py-6 text-sm text-ink-500">{t('topbarNotificationsEmpty')}</p>
                ) : null}

                {!isLoadingNotifications && !notificationError && notifications.length > 0 ? (
                  <div className="max-h-[24rem] overflow-y-auto pr-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex w-full items-start gap-2 rounded-2xl px-3 py-3 text-left transition-all duration-200 hover:bg-uit-50 ${
                          notification.is_read ? 'text-ink-600' : 'bg-slate-50 text-ink-900'
                        }`}
                      >
                        {!notification.is_read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ai-mint" /> : <span className="w-2 shrink-0" />}
                        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => handleNotificationClick(notification)}>
                          <span className="block">
                            <span className="block text-sm font-semibold">{notification.title}</span>
                            {notification.message ? <span className="mt-1 block text-xs leading-5 text-ink-500">{notification.message}</span> : null}
                            <span className="mt-1 block text-[11px] font-medium text-ink-400">{formatNotificationTime(notification.created_at, locale)}</span>
                          </span>
                        </button>
                        {notification.is_read ? (
                          <button
                            type="button"
                            className="mt-0.5 shrink-0 rounded-xl border border-slate-200 p-2 text-ink-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                            aria-label={t('topbarNotificationsDelete')}
                            title={t('topbarNotificationsDelete')}
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-3 rounded-[22px] border border-slate-200/80 bg-white px-2 py-1.5 shadow-card transition-all duration-200 hover:border-uit-300 hover:bg-white"
              onClick={() => {
                setIsProfileOpen((prev) => !prev);
                setIsNotificationOpen(false);
              }}
            >
              <Avatar src={storedUser?.avatar_url} alt={storedUser?.full_name || t('topbarUserAvatar')} size={36} />
              <div className="hidden text-left lg:block">
                <p className="max-w-36 truncate text-sm font-semibold text-ink-800">{displayEmail || t('topbarGuest')}</p>
              </div>
            </button>
            {isProfileOpen ? (
              <div className="absolute right-0 top-14 w-52 rounded-[24px] border border-slate-200/80 bg-white p-2 shadow-dashboard">
                <button
                  type="button"
                  className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-ink-700 transition-all duration-200 hover:bg-uit-50"
                  onClick={() => {
                    if (storedUser?.username) {
                      router.push(`/profile/${storedUser.username}`);
                    } else {
                      router.push('/login');
                    }
                    setIsProfileOpen(false);
                  }}
                >
                  {t('topbarProfile')}
                </button>
                <button
                  type="button"
                  className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-ink-700 transition-all duration-200 hover:bg-uit-50"
                  onClick={() => {
                    router.push('/settings');
                    setIsProfileOpen(false);
                  }}
                >
                  {t('topbarSettings')}
                </button>
                <button
                  type="button"
                  className="block w-full rounded-2xl px-3 py-2.5 text-left text-sm text-rose-500 transition-all duration-200 hover:bg-rose-50"
                  onClick={handleLogout}
                >
                  {t('topbarLogout')}
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
