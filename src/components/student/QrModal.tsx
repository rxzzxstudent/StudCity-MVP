'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  Clock, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Copy, 
  KeyRound,
  Check
} from 'lucide-react';
import { NookiLogo } from '../NookiLogo';

export const QrModal: React.FC = () => {
  const {
    activeOfferForQr,
    activeStudentCode,
    closeQrModal,
    generateNewCode,
    codeTimeRemaining,
    setRole,
  } = useApp();

  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeQrModal();
      }
    };
    if (activeOfferForQr) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeOfferForQr, closeQrModal]);

  if (!activeOfferForQr || !activeStudentCode) return null;

  const progressPercent = Math.max(0, Math.min(100, (codeTimeRemaining / 300) * 100));

  // Format time as MM:SS
  const minutes = Math.floor(codeTimeRemaining / 60);
  const seconds = codeTimeRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Extract digits for PIN boxes
  const pinDigits = (activeStudentCode.code.replace(/[^0-9]/g, '') || '7492').slice(0, 4).padEnd(4, '0').split('');
  const cleanPin = pinDigits.join('');

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(cleanPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDemoToCashier = () => {
    closeQrModal();
    setRole('cashier');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={closeQrModal}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-scale-up max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-5 text-white relative shrink-0">
          <button
            onClick={closeQrModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <NookiLogo size="xs" textColor="white" layout="horizontal" animated={false} />
            <span className="bg-blue-500/20 text-blue-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30">
              Смарт-доступ
            </span>
          </div>

          <h3 className="text-xl font-black text-white">{activeOfferForQr.name}</h3>
          <p className="text-xs text-slate-300 mt-0.5">{activeOfferForQr.title}</p>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto text-center space-y-4">
          
          {/* Price & Savings Pill */}
          <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
            <div className="text-left">
              <span className="text-[11px] text-slate-500 font-medium block">К оплате со скидкой:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900">
                  {activeOfferForQr.discountedPrice.toLocaleString()} ₸
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {activeOfferForQr.originalPrice.toLocaleString()} ₸
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-xs">
              -{activeOfferForQr.discountPercent}%
            </div>
          </div>

          {/* MAIN PIN DISPLAY */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-inner space-y-3">
            <div className="text-[11px] text-blue-200 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Назовите этот 4-значный PIN кассиру:</span>
            </div>

            {/* 4 Digit Boxes */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-1">
              {pinDigits.map((digit, idx) => (
                <div
                  key={idx}
                  className="w-13 h-16 sm:w-14 sm:h-18 bg-slate-800/90 border-2 border-blue-500/40 rounded-2xl flex items-center justify-center font-mono font-black text-3xl sm:text-4xl text-white shadow-lg tracking-tight"
                >
                  {digit}
                </div>
              ))}
            </div>

            {/* Full code string and Copy action */}
            <div className="flex items-center justify-center pt-1">
              <button
                onClick={handleCopy}
                className="w-full max-w-xs justify-center py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-white/10"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-300" />}
                <span>{copied ? 'Скопировано в буфер!' : 'Скопировать 4-значный PIN'}</span>
              </button>
            </div>
          </div>

          {/* Timer & Refresh */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Окно действия: <strong className="text-slate-900 font-mono">{timeFormatted}</strong></span>
              </span>
              <button
                onClick={generateNewCode}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold text-xs cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Новый код</span>
              </button>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 rounded-full ${
                  codeTimeRemaining > 60 ? 'bg-blue-600' : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cashier Instructions */}
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Покажите экран кассиру в тихие часы <span className="font-bold text-slate-700">до {activeOfferForQr.happyHoursEnd}</span>. Кассир введет 4 цифры за 3 секунды.
          </p>

          {/* Venue Address */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-left flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-slate-600 truncate text-[11px]">{activeOfferForQr.address}</span>
            </div>
            {activeOfferForQr.mapUrl && (
              <a
                href={activeOfferForQr.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline shrink-0"
              >
                Карта
              </a>
            )}
          </div>

          {/* Quick Demo: Verify on Cashier */}
          <button
            onClick={handleDemoToCashier}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Демо: Проверить на терминале кассира</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>
    </div>
  );
};

