'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { StudentView } from '@/components/student/StudentView';
import { NookiLogo } from '@/components/NookiLogo';
import { Heart, Flame, MapPin, Store } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { QrModal } from '@/components/student/QrModal';
import { AuthProfileModal } from '@/components/AuthProfileModal';
import { PartnerRestrictionModal } from '@/components/PartnerRestrictionModal';

// Code splitting (React.lazy) for heavy components to minimize initial bundle size and transfer
const UnifiedCityMap = dynamic(
  () => import('@/components/map/UnifiedCityMap').then((mod) => mod.UnifiedCityMap),
  {
    loading: () => (
      <div className="w-full max-w-[1600px] mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Загрузка карты инфраструктуры...</p>
      </div>
    ),
    ssr: false,
  }
);

const CashierView = dynamic(
  () => import('@/components/cashier/CashierView').then((mod) => mod.CashierView),
  {
    loading: () => (
      <div className="w-full max-w-[1600px] mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">Загрузка терминала кассира...</p>
      </div>
    ),
    ssr: false,
  }
);

const FeedbackModal = dynamic(
  () => import('@/components/FeedbackModal').then((mod) => mod.FeedbackModal),
  { ssr: false }
);

function AppContent() {
  const { role, setRole, studentTab, setStudentTab, isAuthModalOpen, setAuthModalOpen, currentUser } = useApp();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    trackEvent('app_open', {
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      },
    });
  }, []);

  const isBusinessUser = currentUser?.role === 'cashier';

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden ${
      role === 'student' && studentTab === 'map' ? 'pb-20 sm:pb-0' : 'pb-24 sm:pb-0'
    }`}>
      <Header onOpenFeedback={() => setFeedbackOpen(true)} />
      
      <main className="flex-1 w-full max-w-full">
        {role === 'student' ? (
          studentTab === 'offers' ? <StudentView /> : <UnifiedCityMap />
        ) : (
          <CashierView />
        )}
      </main>

      {/* Footer: hidden on mobile when Map is active for clean viewport */}
      <footer className={`py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500 ${
        role === 'student' && studentTab === 'map' ? 'hidden sm:block' : 'block'
      }`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <NookiLogo size="xs" layout="horizontal" animated={false} />
            <span className="text-slate-400 font-normal">• Городской сервис</span>
          </div>
          <p className="text-slate-400">
            Смарт-доступ к непиковым слотам & Карта инфраструктуры города
          </p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Сделано с заботой</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </footer>

      {/* Modern Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-3 py-2 pb-3">
        <div className={`grid ${isBusinessUser ? 'grid-cols-3' : 'grid-cols-2'} max-w-xs mx-auto gap-1`}>
          {/* 1. Offers / Slots Tab */}
          <button
            onClick={() => {
              setRole('student');
              setStudentTab('offers');
            }}
            className="flex flex-col items-center justify-center py-1 px-2 transition active:scale-95 cursor-pointer group"
          >
            <div className={`px-4 sm:px-6 py-1.5 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              role === 'student' && studentTab === 'offers'
                ? 'bg-blue-50 text-blue-600 scale-105'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              <Flame className={`w-5 h-5 transition-all ${
                role === 'student' && studentTab === 'offers' ? 'stroke-[2.2]' : 'stroke-[1.8]'
              }`} />
            </div>
            <span className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
              role === 'student' && studentTab === 'offers'
                ? 'font-black text-blue-600'
                : 'font-semibold text-slate-500'
            }`}>
              Скидки
            </span>
          </button>

          {/* 2. Map Tab */}
          <button
            onClick={() => {
              setRole('student');
              setStudentTab('map');
            }}
            className="flex flex-col items-center justify-center py-1 px-2 transition active:scale-95 cursor-pointer group"
          >
            <div className={`px-4 sm:px-6 py-1.5 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              role === 'student' && studentTab === 'map'
                ? 'bg-blue-50 text-blue-600 scale-105'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              <MapPin className={`w-5 h-5 transition-all ${
                role === 'student' && studentTab === 'map' ? 'stroke-[2.2]' : 'stroke-[1.8]'
              }`} />
            </div>
            <span className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
              role === 'student' && studentTab === 'map'
                ? 'font-black text-blue-600'
                : 'font-semibold text-slate-500'
            }`}>
              Карта
            </span>
          </button>

          {/* 3. Cashier Tab (Always available for Business users on mobile) */}
          {isBusinessUser && (
            <button
              onClick={() => {
                setRole('cashier');
              }}
              className="flex flex-col items-center justify-center py-1 px-2 transition active:scale-95 cursor-pointer group"
            >
              <div className={`px-4 sm:px-6 py-1.5 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                role === 'cashier'
                  ? 'bg-indigo-50 text-indigo-600 scale-105'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                <Store className={`w-5 h-5 transition-all ${
                  role === 'cashier' ? 'stroke-[2.2]' : 'stroke-[1.8]'
                }`} />
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                role === 'cashier'
                  ? 'font-black text-indigo-600'
                  : 'font-semibold text-slate-500'
              }`}>
                Касса
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Global PIN & QR Access Modal */}
      <QrModal />

      {/* Business Partner Restriction Notice Modal */}
      <PartnerRestrictionModal />

      {/* Global Auth & Profile Modal */}
      <AuthProfileModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
