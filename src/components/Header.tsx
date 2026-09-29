'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Store, 
  MapPin, 
  Flame, 
  MessageSquareHeart, 
  Menu, 
  X 
} from 'lucide-react';

interface HeaderProps {
  onOpenFeedback?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFeedback }) => {
  const { 
    role, 
    setRole, 
    studentTab, 
    setStudentTab 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside and Escape handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs w-full max-w-full">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                setRole('student');
                setStudentTab('offers');
                setIsOpen(false);
              }}
              title="Nooki — Главная"
              className="flex items-center gap-2.5 shrink-0 group text-left focus:outline-hidden"
            >
              <img 
                src="/nooki-loop-app-icon(1).svg" 
                alt="Nooki Logo" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl shadow-xs transition-transform duration-200 group-hover:scale-105" 
              />
              <span className="font-black text-xl tracking-tight text-[#2563eb]">
                Nooki
              </span>
            </button>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-8 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setStudentTab('offers');
              }}
              className={`transition cursor-pointer relative py-1 ${
                role === 'student' && studentTab === 'offers'
                  ? 'text-[#2563eb] font-bold'
                  : 'text-slate-600 hover:text-[#2563eb]'
              }`}
            >
              <span>Скидки и слоты</span>
              {role === 'student' && studentTab === 'offers' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('student');
                setStudentTab('map');
              }}
              className={`transition cursor-pointer relative py-1 ${
                role === 'student' && studentTab === 'map'
                  ? 'text-[#2563eb] font-bold'
                  : 'text-slate-600 hover:text-[#2563eb]'
              }`}
            >
              <span>Карта города</span>
              {role === 'student' && studentTab === 'map' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setRole('cashier')}
              className={`transition cursor-pointer relative py-1 ${
                role === 'cashier'
                  ? 'text-[#2563eb] font-bold'
                  : 'text-slate-600 hover:text-[#2563eb]'
              }`}
            >
              <span>Кассирам / B2B</span>
              {role === 'cashier' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb] rounded-full" />
              )}
            </button>
          </nav>

          {/* Right: Actions & Compact Burger Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenFeedback && (
              <button
                type="button"
                onClick={onOpenFeedback}
                title="Оставить отзыв о сервисе"
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquareHeart className="w-3.5 h-3.5 sm:hidden" />
                <span>Отзыв</span>
              </button>
            )}

            {/* Mobile Dropdown Popover */}
            <div className="relative sm:hidden" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-800 flex items-center justify-center transition cursor-pointer border border-slate-200/70"
              >
                {isOpen ? (
                  <X className="w-5 h-5 text-slate-900" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-900" />
                )}
              </button>

              {/* Compact Floating Dropdown (Does NOT cover the screen) */}
              {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white/98 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 p-2 z-50 animate-scale-up space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setStudentTab('offers');
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-left text-xs font-bold transition cursor-pointer ${
                      role === 'student' && studentTab === 'offers'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Скидки и слоты</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setStudentTab('map');
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-left text-xs font-bold transition cursor-pointer ${
                      role === 'student' && studentTab === 'map'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Карта города</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('cashier');
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-left text-xs font-bold transition cursor-pointer ${
                      role === 'cashier'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Кассирам / B2B</span>
                  </button>

                  {onOpenFeedback && (
                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onOpenFeedback();
                        }}
                        className="w-full px-3.5 py-2 rounded-xl flex items-center gap-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <MessageSquareHeart className="w-4 h-4 text-pink-500 shrink-0" />
                        <span>Оставить отзыв</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
