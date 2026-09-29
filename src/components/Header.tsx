'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { User, Briefcase } from 'lucide-react';

interface HeaderProps {
  onOpenFeedback?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFeedback }) => {
  const { 
    role, 
    setRole, 
    studentTab, 
    setStudentTab,
    currentUser,
    setAuthModalOpen 
  } = useApp();

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
              }}
              title="Nooki — Главная"
              className="flex items-center gap-2.5 shrink-0 group text-left focus:outline-hidden cursor-pointer"
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
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Login / Profile button */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className={`px-3 sm:px-4 py-2 rounded-full font-bold text-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                role === 'cashier'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title={currentUser ? `Профиль: ${currentUser.displayName}` : 'Войти в профиль'}
            >
              {currentUser ? (
                currentUser.role === 'cashier' ? (
                  <>
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="max-w-[120px] truncate">{currentUser.venueName || currentUser.displayName}</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span className="max-w-[100px] truncate">{currentUser.displayName}</span>
                  </>
                )
              ) : (
                role === 'cashier' ? (
                  <>
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden xs:inline">Бизнес партнер</span>
                    <span className="xs:hidden">Бизнес</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Войти</span>
                  </>
                )
              )}
            </button>

            {onOpenFeedback && (
              <button
                type="button"
                onClick={onOpenFeedback}
                title="Оставить отзыв о сервисе"
                className="px-3.5 sm:px-4 py-2 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Отзыв</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
