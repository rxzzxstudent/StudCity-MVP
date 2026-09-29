'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, Store, X, ArrowRight } from 'lucide-react';

export const PartnerRestrictionModal: React.FC = () => {
  const { partnerErrorModalOpen, setPartnerErrorModalOpen, setRole } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPartnerErrorModalOpen(false);
      }
    };
    if (partnerErrorModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [partnerErrorModalOpen, setPartnerErrorModalOpen]);

  if (!partnerErrorModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="fixed inset-0"
        onClick={() => setPartnerErrorModalOpen(false)}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-5 animate-scale-up text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setPartnerErrorModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
              Ограничение роли
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Бизнес-партнер не может брать скидки
            </h3>
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
          <p>
            Этот раздел предназначен исключительно для гостей и студентов, оформляющих скидочные PIN-коды на кассе.
          </p>
          <p className="font-semibold text-slate-700">
            Как партнер, вы управляете скидками своего заведения и проверяете PIN-коды клиентов в разделе <span className="text-indigo-600 font-bold">«Касса»</span>.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setPartnerErrorModalOpen(false);
              setRole('cashier');
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Store className="w-4 h-4" />
            <span>Перейти в Кассу</span>
            <ArrowRight className="w-4 h-4 ml-auto sm:ml-0" />
          </button>

          <button
            type="button"
            onClick={() => setPartnerErrorModalOpen(false)}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
