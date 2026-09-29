'use client';

import React, { useState } from 'react';
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
  ArrowRight,
  TrendingDown,
  Building2,
  Store
} from 'lucide-react';

export const CashierView: React.FC = () => {
  const {
    offers,
    urboHappyHoursActive,
    toggleUrboHappyHours,
    activeStudentCode,
    validateCode,
    lastValidatedCode,
    clearLastValidation,
    b2bMetrics,
    redemptionLogs,
  } = useApp();

  const [selectedVenueId, setSelectedVenueId] = useState<string>('coffeemoon-cafe');
  const [inputCode, setInputCode] = useState<string>(activeStudentCode ? activeStudentCode.code : '7492');
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeVenue = offers.find((o) => o.id === selectedVenueId) || offers[0];

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

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 animate-fade-in transition-all">
      
      {/* 1. Venue POS Header & Live Status */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/15 to-orange-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold shrink-0 shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeVenue.name}
              </h1>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-200/70">
                Касса партнера • Nooki POS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeVenue.address}</span>
            </p>
          </div>
        </div>

        {/* Venue Switcher & Clock */}
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

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Окно: {activeVenue.quietHoursWindow || '14:00 – 16:30'}</span>
          </div>

          <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200/70 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold text-amber-800">
            <TrendingDown className="w-4 h-4 text-amber-600" />
            <span>Спад: загрузка {b2bMetrics.currentCapacity}%</span>
          </div>
        </div>
      </div>

      {/* 2. Main 3-Column Section: PIN Validator, Express Analytics & Nooki Discount Control */}
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
                  urboHappyHoursActive 
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
                <span className="font-bold text-slate-900">{activeVenue.slotsRemaining ?? '—'} из {activeVenue.totalSlots ?? '—'}</span>
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

      {/* 4. Shift Redemption History Table */}
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
  );
};
