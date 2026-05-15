'use client';

import Image from 'next/image';
import AuthPanel from '@/components/landing/AuthPanel';
import LandingCollage from '@/components/landing/LandingCollage';
import { useI18n } from '@/lib/i18n';

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* ================= HEADER ================= */}
      <div className="w-full">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-6 flex items-start justify-between">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
            <Image
              src="/images/uit.png"
              alt="UIT logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                UITConnect
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t('landingTagline')}
              </p>
            </div>
          </div>

          <div className="hidden lg:block w-[380px]" />
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex items-start">
        <div className="mx-auto max-w-[1440px] w-full px-6 lg:px-12">
          
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-start">
            
            {/* ===== LEFT: HERO ===== */}
            <div className="pt-12 lg:pt-16">
              <div className="space-y-6">
                <h1 className="text-7xl lg:text-8xl font-black leading-tight tracking-tight">
                  <span className="block text-blue-900">{t('landingHeroBuild')}</span>

                  <span className="block text-blue-700 text-6xl lg:text-7xl">
                    {t('landingHeroCollaborate')}
                  </span>

                  <span className="block">
                    <span className="text-slate-600 text-4xl lg:text-5xl mr-2">
                      {t('landingHeroAnd')}
                    </span>
                    <span className="text-blue-500 text-7xl lg:text-8xl">
                      {t('landingHeroLaunch')}
                    </span>
                  </span>
                </h1>

                <p className="text-lg text-slate-600 leading-relaxed max-w-sm">
                  {t('landingDescription')}
                </p>
              </div>
            </div>

            {/* ===== CENTER: COLLAGE ===== */}
            <div className="flex justify-center">
              <LandingCollage />
            </div>

            {/* ===== RIGHT: AUTH ===== */}
            <div className="lg:sticky lg:top-6 flex justify-end">
              <AuthPanel />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
