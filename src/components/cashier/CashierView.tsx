'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import confetti from 'canvas-confetti';
import { 
  Users, 
  TrendingUp, 
  Percent, 
  CheckCircle2, 
  Sparkles, 
  Power, 
  Clock, 
  History, 
  BadgePercent,
  Receipt,
  TrendingDown,
  Building2,
  Store,
  Sliders,
  BarChart3,
  Flame,
  Check,
  MapPin,
  Eye,
  BellRing,
  AlertCircle
} from 'lucide-react';

export const CashierView: React.FC = () => {
  const {
    offers,
    updateVenueOffer,
    urboHappyHoursActive,
    toggleUrboHappyHours,
    activeStudentCode,
    validateCode,
    lastValidatedCode,
    clearLastValidation,
    b2bMetrics,
    redemptionLogs,
    setRole,
  } = useApp();

  // Selected sub-tab in partner dashboard: 'pos' (Касса), 'builder' (Конструктор слота), 'analytics' (Аналитика района)
  const [partnerTab, setPartnerTab] = useState<'pos' | 'builder' | 'analytics'>('pos');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('coffeemoon-cafe');
  const [inputCode, setInputCode] = useState<string>(activeStudentCode ? activeStudentCode.code : '7492');
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeVenue = offers.find((o) => o.id === selectedVenueId) || offers[0];

  // Offer builder form state synced with activeVenue
  const [offerTitle, setOfferTitle] = useState(activeVenue.title);
  const [originalPrice, setOriginalPrice] = useState(activeVenue.originalPrice);
  const [discountPercent, setDiscountPercent] = useState(activeVenue.discountPercent);
  const [quietStart, setQuietStart] = useState('14:30');
  const [quietEnd, setQuietEnd] = useState('16:30');
  const [dailySlots, setDailySlots] = useState(activeVenue.slotsTotal || 15);
  const [builderSavedMessage, setBuilderSavedMessage] = useState(false);

  // Sync form when venue selection changes
  useEffect(() => {
    setOfferTitle(activeVenue.title);
    setOriginalPrice(activeVenue.originalPrice);
    setDiscountPercent(activeVenue.discountPercent);
    if (activeVenue.quietHoursWindow) {
      const parts = activeVenue.quietHoursWindow.split('–').map((s) => s.trim());
      if (parts[0]) setQuietStart(parts[0]);
      if (parts[1]) setQuietEnd(parts[1]);
    }
    if (activeVenue.slotsTotal) setDailySlots(activeVenue.slotsTotal);
  }, [activeVenue]);

  // Derived price for guest
  const calculatedDiscountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));
  const guestSavings = Math.max(0, originalPrice - calculatedDiscountedPrice);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }
  };

  const handleValidate = (codeToCheck?: string) => {
    const code = (codeToCheck || inputCode).trim();
    if (!code) {
      setValidationError('Пожалуйста, введите 4-значный PIN код студента (например, 7492)');
      return;
    }
    setValidationError(null);
    const result = validateCode(code, activeVenue.id);
    if (result.success) {
      triggerConfetti();
    }
  };

  const handleUseCurrentStudentCode = () => {
    if (activeStudentCode) {
      setInputCode(activeStudentCode.code);
      if (activeStudentCode.venueId) {
        setSelectedVenueId(activeStudentCode.venueId);
      }
    } else {
      setInputCode('7492');
    }
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const windowStr = `${quietStart} – ${quietEnd}`;
    updateVenueOffer(activeVenue.id, {
      title: offerTitle,
      originalPrice,
      discountPercent,
      discountedPrice: calculatedDiscountedPrice,
      quietHoursWindow: windowStr,
      slotsTotal: dailySlots,
      slotsRemaining: dailySlots,
    });

    setBuilderSavedMessage(true);
    setTimeout(() => {
      setBuilderSavedMessage(false);
    }, 3500);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-7 space-y-6 animate-fade-in transition-all">
      
      {/* 1. Partner Header & Venue Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/15 to-blue-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 font-bold shrink-0 shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeVenue.name}
              </h1>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-xl border border-indigo-100">
                Кабинет Бизнес-партнера
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeVenue.address}</span>
            </p>
          </div>
        </div>

        {/* Venue Switcher & Return to User Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-2xl">
            <Store className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-600">Заведение:</span>
            <select
              value={selectedVenueId}
              onChange={(e) => {
                setSelectedVenueId(e.target.value);
                clearLastValidation();
              }}
              className="bg-transparent text-xs sm:text-sm font-extrabold text-slate-900 outline-hidden cursor-pointer"
            >
              {offers.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.name} (-{off.discountPercent}%)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setRole('student')}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-2xl transition cursor-pointer"
          >
            ← В режим пользователя
          </button>
        </div>
      </div>

      {/* 2. Partner Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setPartnerTab('pos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            partnerTab === 'pos'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Касса (Ввод PIN)</span>
        </button>

        <button
          type="button"
          onClick={() => setPartnerTab('builder')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            partnerTab === 'builder'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Конструктор слота (Скидки & SKU)</span>
        </button>

        <button
          type="button"
          onClick={() => setPartnerTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            partnerTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Аналитика района (B2B Данные)</span>
          <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full">PRO</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: POS PIN VALIDATOR */}
      {/* ======================================================== */}
      {partnerTab === 'pos' && (
        <div className="space-y-6">
          {/* Main 3-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Column 1: POS PIN Validator */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                        Валидатор PIN-кода
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Введите 4 цифры, которые назвал гость на кассе
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input Controls */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      4-значный PIN покупателя:
                    </label>
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => {
                        setInputCode(e.target.value);
                        setValidationError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleValidate();
                      }}
                      placeholder="7492"
                      maxLength={4}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl px-4 py-3 font-mono font-black text-2xl text-slate-900 tracking-widest text-center transition outline-hidden"
                    />
                  </div>

                  <div>
                    <button
                      onClick={() => handleValidate()}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Проверить PIN-код</span>
                    </button>
                  </div>

                  {/* Quick Helper for Demo */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs">
                    {activeStudentCode ? (
                      <button
                        onClick={handleUseCurrentStudentCode}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition cursor-pointer border border-blue-100"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>PIN студента: {activeStudentCode.code} ({activeStudentCode.venueName})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setInputCode('7492')}
                        className="text-xs text-slate-600 hover:text-blue-600 font-bold flex items-center gap-1.5 bg-slate-100 hover:bg-blue-50 px-2.5 py-1.5 rounded-xl transition cursor-pointer border border-slate-200/70"
                      >
                        <span>Тестовый PIN: 7492</span>
                      </button>
                    )}

                    <span className="text-[11px] text-slate-400">
                      Проверка занимает ~3 сек
                    </span>
                  </div>

                  {validationError && (
                    <p className="text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                      {validationError}
                    </p>
                  )}
                </div>

                {/* Validation Result Box */}
                {lastValidatedCode && (
                  <div className={`p-4 rounded-2xl border-2 transition-all animate-scale-up ${
                    lastValidatedCode.success 
                      ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950' 
                      : 'bg-red-50 border-red-400 text-red-950'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                          lastValidatedCode.success ? 'bg-emerald-600 shadow-sm' : 'bg-red-600'
                        }`}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                            {lastValidatedCode.success ? `PIN ${lastValidatedCode.codeData?.code || inputCode} подтвержден!` : 'Ошибка проверки PIN'}
                          </h4>
                          <p className={`text-xs mt-0.5 font-medium ${lastValidatedCode.success ? 'text-emerald-700' : 'text-red-700'}`}>
                            {lastValidatedCode.message}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={clearLastValidation}
                        className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-white transition cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {lastValidatedCode.codeData && (
                      <div className="mt-3 pt-3 border-t border-emerald-200/80 grid grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] font-medium">Студент:</span>
                          <strong className="text-slate-900 font-bold block truncate">{lastValidatedCode.codeData.studentName || 'Алихан С.'}</strong>
                          <span className="text-[10px] text-slate-500 truncate block">{lastValidatedCode.codeData.studentUni || 'КазНУ'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-medium">Скидка:</span>
                          <span className="font-black text-emerald-700 text-sm">-{lastValidatedCode.codeData.discountPercent}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-medium">До скидки:</span>
                          <span className="text-slate-400 line-through font-semibold text-xs">{lastValidatedCode.codeData.originalPrice?.toLocaleString() || '2 800'} ₸</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-medium">К оплате:</span>
                          <strong className="text-sm font-black text-slate-900 block">
                            {lastValidatedCode.codeData.finalPrice.toLocaleString()} ₸
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Express Analytics */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                      Экспресс-аналитика
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Метрики выручки за сегодня
                    </p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-xl">
                    Смена 15:00
                  </span>
                </div>

                {/* 3 Metric Tiles */}
                <div className="space-y-3 mt-4">
                  <div className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium block">Привлечено гостей:</span>
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          {b2bMetrics.studentsToday} чел.
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-xl shrink-0">
                      +18% к ср.
                    </span>
                  </div>

                  <div className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium block">Выручка в непик:</span>
                        <span className="text-base sm:text-lg font-black text-emerald-700">
                          +{b2bMetrics.additionalRevenue.toLocaleString()} ₸
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-xl shrink-0">
                      Чистый доход
                    </span>
                  </div>

                  <div className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <Percent className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium block">Возврат гостей (LTV):</span>
                        <span className="text-base sm:text-lg font-black text-indigo-900">
                          {b2bMetrics.repeatConversionPercent}%
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-xl shrink-0">
                      Постоянные
                    </span>
                  </div>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Текущая заполняемость зала</span>
                  <span className="text-blue-600">{b2bMetrics.currentCapacity}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${b2bMetrics.currentCapacity}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Скидки Nooki привлекают студентов именно в пустые часы, выравнивая суточную нагрузку кухни.
                </p>
              </div>
            </div>

            {/* Column 3: Nooki Discount Control */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      activeVenue.happyHoursActive 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      <BadgePercent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                        Скидка Nooki
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Управление потоком гостей
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                    {activeVenue.happyHoursActive
                      ? `Скидка ${activeVenue.discountPercent}% активна в ${activeVenue.name}`
                      : 'Скидка временно отключена'}
                  </h4>

                  <p className="text-xs leading-relaxed text-slate-500">
                    {activeVenue.happyHoursActive
                      ? `Заведение принимает 4-значные PIN-коды со скидкой ${activeVenue.discountPercent}% (${activeVenue.quietHoursWindow || 'непик'}). Гости приходят в тихие часы.`
                      : 'Поток гостей приостановлен. Включите, когда зал пустует, чтобы привлечь горожан со скидкой.'}
                  </p>
                </div>

                {/* Parameter Details */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Период действия:</span>
                    <span className="font-bold text-slate-900">{activeVenue.quietHoursWindow || 'Тихие часы'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Размер скидки:</span>
                    <span className="font-black text-emerald-600 text-sm">-{activeVenue.discountPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Остаток слотов:</span>
                    <span className="font-bold text-slate-900">{activeVenue.slotsRemaining ?? '—'} из {activeVenue.slotsTotal ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">Тип валидации:</span>
                    <span className="font-semibold text-slate-800">4-значный PIN / QR</span>
                  </div>
                </div>
              </div>

              {/* Toggle Button */}
              <div className="pt-2">
                <button
                  onClick={toggleUrboHappyHours}
                  className={`w-full py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
                    activeVenue.happyHoursActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{activeVenue.happyHoursActive ? 'Акция ВКЛЮЧЕНА' : 'ВКЛЮЧИТЬ АКЦИЮ'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Shift Redemption History Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-slate-500" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Журнал погашений за сегодня
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">
                Всего погашено: {redemptionLogs.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                    <th className="pb-3 font-semibold">Время</th>
                    <th className="pb-3 font-semibold">PIN код</th>
                    <th className="pb-3 font-semibold">Заведение</th>
                    <th className="pb-3 font-semibold">Гость / ВУЗ</th>
                    <th className="pb-3 font-semibold text-right">Сумма чека</th>
                    <th className="pb-3 font-semibold text-right">Скидка Nooki</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {redemptionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="py-3 font-mono font-bold text-blue-600">{log.code}</td>
                      <td className="py-3 text-slate-900 font-bold">{log.venueName}</td>
                      <td className="py-3 text-slate-600 font-medium">{log.studentUni}</td>
                      <td className="py-3 text-right font-black text-slate-900">
                        {log.amount.toLocaleString()} ₸
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-600">
                        -{log.savedAmount.toLocaleString()} ₸
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SLOT BUILDER (CUSTOM SKU, SLIDER & TIME WINDOW) */}
      {/* ======================================================== */}
      {partnerTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Builder Form (7 Cols) */}
          <form 
            onSubmit={handleSaveOffer}
            className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5"
          >
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Конструктор непикового слота
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Настройте предложение на отдельный товар или комбо в тихие часы
                </p>
              </div>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-100">
                {activeVenue.name}
              </span>
            </div>

            {/* 1. Item title (SKU) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Название блюда, комбо или услуги (SKU):
              </label>
              <input
                type="text"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                placeholder="например: Сет: Американо + свежий круассан"
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-hidden transition"
              />
              <span className="text-[11px] text-slate-400 block">
                💡 Бизнесу выгоднее давать скидку на маржинальные комбо, чем на все меню сразу.
              </span>
            </div>

            {/* 2. Original Price & Discount Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Базовая цена (до скидки):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={200}
                    step={50}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Math.max(100, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl pl-4 pr-9 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-hidden transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₸</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Скидка:
                  </label>
                  <span className="text-sm font-black text-blue-600">
                    -{discountPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg mt-2"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                  <span>10%</span>
                  <span>25%</span>
                  <span>40%</span>
                  <span>60%</span>
                </div>
              </div>
            </div>

            {/* 3. Live Price Calculation summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Цена для гостя со скидкой:
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700">
                  {calculatedDiscountedPrice.toLocaleString()} ₸
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-600 font-semibold block">
                  Экономия гостя:
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-800">
                  -{guestSavings.toLocaleString()} ₸ (-{discountPercent}%)
                </span>
              </div>
            </div>

            {/* 4. Quiet hours time window (С ... По ...) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Время «тихих часов» (От и До):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">С:</span>
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl pl-8 pr-3 py-2 text-xs sm:text-sm font-bold text-slate-900 outline-hidden transition"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">По:</span>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl pl-8 pr-3 py-2 text-xs sm:text-sm font-bold text-slate-900 outline-hidden transition"
                  />
                </div>
              </div>
            </div>

            {/* 5. Daily limit (Smart Cap) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Лимит мест на день:
                </label>
                <span className="text-xs font-black text-slate-900">
                  {dailySlots} мест в день
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={dailySlots}
                onChange={(e) => setDailySlots(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <span className="text-[11px] text-slate-400 block">
                Защита от перегруза кухни: когда лимит исчерпан, предложение скрывается до следующего дня.
              </span>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Сохранить и опубликовать слот</span>
              </button>
            </div>

            {builderSavedMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Слот успешно обновлен! Студенты и горожане уже видят новые условия в каталоге.</span>
              </div>
            )}
          </form>

          {/* Live Preview Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Превью карточки для пользователей в каталоге:</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border-2 border-blue-500 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                    {activeVenue.categoryLabel}
                  </span>
                  <h4 className="font-black text-base sm:text-lg text-slate-900 mt-0.5">
                    {activeVenue.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeVenue.address}</span>
                  </p>
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm px-3 py-1.5 rounded-2xl shadow-xs shrink-0">
                  -{discountPercent}%
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-800">
                  {offerTitle}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 line-through block">
                    {originalPrice.toLocaleString()} ₸
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {calculatedDiscountedPrice.toLocaleString()} ₸
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    Тихие часы:
                  </span>
                  <span className="text-xs font-extrabold text-blue-600">
                    {quietStart} – {quietEnd}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className="w-full py-2.5 rounded-2xl bg-blue-50 text-blue-700 font-extrabold text-xs flex items-center justify-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Осталось мест: {dailySlots} из {dailySlots}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: B2B MARKET & COMPETITOR ANALYTICS */}
      {/* ======================================================== */}
      {partnerTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-400 text-slate-950 tracking-wider uppercase inline-block">
                Закрытые B2B-данные Nooki
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Аналитика непикового спроса в вашем районе
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Обычные пользователи видят только скидки на карте. Для партнеров мы аккумулируем данные о пешеходном трафике, пиках поиска и упущенной выгоде вокруг вашего заведения.
              </p>
            </div>
          </div>

          {/* 4 Deep Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Footfall Demand */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Спрос в радиусе 1 км:</span>
                <h4 className="text-2xl font-black text-slate-900 mt-0.5">384 чел.</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Искали обед и кофе в районе Satbayev / КазНУ за последние 24 часа.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Пик поиска:</span>
                <span className="font-extrabold text-blue-600">14:30 – 16:30</span>
              </div>
            </div>

            {/* Card 2: Missed Opportunity */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Упущенный трафик:</span>
                <h4 className="text-2xl font-black text-amber-600 mt-0.5">86 визитов</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Студенты открыли карточку категории «Еда», но ушли без активации из-за исчерпания слотов.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Потенциал выручки:</span>
                <span className="font-extrabold text-emerald-600">+103 000 ₸/мес</span>
              </div>
            </div>

            {/* Card 3: Competitor Benchmark */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Средний чек района:</span>
                <h4 className="text-2xl font-black text-emerald-700 mt-0.5">1 450 ₸</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Средний непиковый чек в соседних заведениях общепита в радиусе 800м.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Ваша цена:</span>
                <span className="font-extrabold text-slate-900">{calculatedDiscountedPrice.toLocaleString()} ₸ (выгоднее 70%)</span>
              </div>
            </div>

            {/* Card 4: Retention */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Возвращаемость (LTV):</span>
                <h4 className="text-2xl font-black text-indigo-900 mt-0.5">38%</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Горожан, пришедших по скидке Nooki, возвращаются повторно по стандартному прайсу.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Конверсия в постоянных:</span>
                <span className="font-extrabold text-indigo-700">Высокая</span>
              </div>
            </div>
          </div>

          {/* Pro Marketing Tools for Business */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <BellRing className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Дополнительные инструменты монетизации трафика (Nooki Pro)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>📍 Гео-пуш по радиусу</span>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded-full">Pro</span>
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Отправка пуш-уведомления студентам и горожанам в радиусе 1 км при открытии тихих часов (до 500 касаний).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>🔥 Закрепление в каталоге</span>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded-full">Pro</span>
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Первая строчка в списке заведений с бейджем «Рекомендация Nooki» и яркая пульсирующая метка на карте города.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>📊 Экспорт отчетов кассы</span>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded-full">Pro</span>
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Автоматическая синхронизация всех списаний с 1С, iiko или Google Таблицами для бухгалтерии и сверки.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
