'use client';

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { StudentView } from '@/components/student/StudentView';
import { CashierView } from '@/components/cashier/CashierView';
import { UnifiedCityMap } from '@/components/map/UnifiedCityMap';
import { FeedbackModal } from '@/components/FeedbackModal';
import { NookiLogo } from '@/components/NookiLogo';
import { Heart, Flame, MapPin, Store } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

import { QrModal } from '@/components/student/QrModal';

function AppContent() {
  const { role, setRole, studentTab, setStudentTab } = useApp();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    trackEvent('app_open', {
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      },
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden pb-24 sm:pb-0">
      <Header onOpenFeedback={() => setFeedbackOpen(true)} />
      
      <main className="flex-1 w-full max-w-full">
        {role === 'student' ? (
          studentTab === 'offers' ? <StudentView /> : <UnifiedCityMap />
        ) : (
          <CashierView />
        )}
      </main>

      <footer className="py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <NookiLogo size="xs" layout="horizontal" animated={false} />
            <span className="text-slate-400 font-normal">• Городской сервис</span>
          </div>
          <p className="text-slate-400">
            Смарт-доступ к непиковым слотам & Карта инфраструктуры города
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Сделано с заботой</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>о горожанах</span>
          </div>
        </div>
      </footer>

      {/* Modern Mobile Bottom Navigation Bar (3 Clean Tabs) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-2 py-2 pb-3">
        <div className="grid grid-cols-3 max-w-md mx-auto">
          {/* 1. Offers / Slots Tab */}
          <button
            onClick={() => {
              setRole('student');
              setStudentTab('offers');
            }}
            className="flex flex-col items-center justify-center py-1 px-2 transition active:scale-95 cursor-pointer group"
          >
            <div className={`px-5 py-1.5 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              role === 'student' && studentTab === 'offers'
                ? 'bg-blue-50 text-blue-600 scale-105'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              <Flame className={`w-6 h-6 transition-all ${
                role === 'student' && studentTab === 'offers' ? 'stroke-[2.2]' : 'stroke-[1.8]'
              }`} />
            </div>
            <span className={`text-xs mt-0.5 tracking-tight transition-colors ${
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
            <div className={`px-5 py-1.5 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              role === 'student' && studentTab === 'map'
                ? 'bg-blue-50 text-blue-600 scale-105'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              <MapPin className={`w-6 h-6 transition-all ${
                role === 'student' && studentTab === 'map' ? 'stroke-[2.2]' : 'stroke-[1.8]'
              }`} />
            </div>
            <span className={`text-xs mt-0.5 tracking-tight transition-colors ${
              role === 'student' && studentTab === 'map'
                ? 'font-black text-blue-600'
                : 'font-semibold text-slate-500'
            }`}>
              Карта
            </span>
          </button>

          {/* 3. Cashier Tab */}
          <button
            onClick={() => setRole('cashier')}
            className="flex flex-col items-center justify-center py-1 px-2 transition active:scale-95 cursor-pointer group"
          >
            <div className={`px-5 py-1.5 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              role === 'cashier'
                ? 'bg-blue-50 text-blue-600 scale-105'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              <Store className={`w-6 h-6 transition-all ${
                role === 'cashier' ? 'stroke-[2.2]' : 'stroke-[1.8]'
              }`} />
            </div>
            <span className={`text-xs mt-0.5 tracking-tight transition-colors ${
              role === 'cashier'
                ? 'font-black text-blue-600'
                : 'font-semibold text-slate-500'
            }`}>
              Касса
            </span>
          </button>
        </div>
      </nav>

      {/* Global PIN & QR Access Modal */}
      <QrModal />

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
