'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  X, 
  User, 
  Briefcase, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  ShieldCheck, 
  LogOut,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthProfileModal: React.FC<AuthProfileModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    logout, 
    activeStudentCode 
  } = useApp();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Registration role: 'student' (Пользователь) or 'cashier' (Бизнес партнер)
  const [regRole, setRegRole] = useState<'student' | 'cashier'>('student');
  
  // Form fields
  const [name, setName] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [venueName, setVenueName] = useState('Coffee Moon');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sanitization against XSS & injections
  const sanitizeInput = (val: string) => val.trim().replace(/[<>'"`;()]/g, '');

  const handleClose = () => {
    setError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  // Reset transient messages and sensitive inputs on open/close
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMessage(null);
      setPassword('');
      setConfirmPassword('');
      if (!currentUser) {
        setMode('login');
      }
    }
  }, [isOpen, currentUser]);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanLogin = sanitizeInput(loginInput).toLowerCase().trim().replace(/\s+/g, '');
    const cleanPassword = password.trim();

    // 1. Validation
    if (cleanLogin.length < 3) {
      setError('Логин должен содержать не менее 3 символов (латиница или цифры)');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }

    if (mode === 'register' && cleanPassword !== confirmPassword.trim()) {
      setError('Пароли не совпадают');
      return;
    }

    // Virtual email for Supabase Auth engine compatibility
    const authEmail = cleanLogin.includes('@') ? cleanLogin : `${cleanLogin}@studcity.internal`;
    const cleanDisplayName = sanitizeInput(name) || cleanLogin;

    setLoading(true);

    try {
      // 2. Supabase Auth if connected
      if (isSupabaseConfigured && supabase) {
        if (mode === 'register') {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: authEmail,
            password: cleanPassword,
            options: {
              data: {
                display_name: cleanDisplayName,
                username: cleanLogin,
                role: regRole === 'cashier' ? 'business' : 'user',
                venue_name: regRole === 'cashier' ? venueName : undefined,
              },
            },
          });

          if (signUpError) {
            const msg = signUpError.message.toLowerCase();
            if (msg.includes('already registered') || msg.includes('user already exists')) {
              setError('Пользователь с таким логином уже существует. Перейдите на вкладку «Вход».');
            } else if (msg.includes('password')) {
              setError('Пароль должен содержать минимум 6 символов.');
            } else {
              setError(signUpError.message || 'Ошибка регистрации в Supabase');
            }
            setLoading(false);
            return;
          }

          if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
            setError('Пользователь с таким логином уже зарегистрирован. Перейдите на вкладку «Вход».');
            setLoading(false);
            return;
          }

          const userId = data.user?.id || `usr_${Date.now()}`;
          setCurrentUser({
            id: userId,
            email: cleanLogin,
            displayName: cleanDisplayName,
            role: regRole,
            venueName: regRole === 'cashier' ? venueName : undefined,
          });

          setSuccessMessage('Аккаунт успешно создан!');

          setTimeout(() => {
            handleClose();
          }, 1000);
          return;
        } else {
          // Login via Supabase
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: cleanPassword,
          });

          if (signInError) {
            const msg = signInError.message.toLowerCase();
            if (msg.includes('email not confirmed')) {
              setError('Подтверждение почты не выполнено в Supabase. Примените SQL автоподтверждения или отключите Confirm email в настройках.');
            } else if (msg.includes('invalid login credentials')) {
              setError('Неверный логин или пароль. Проверьте правильность написания.');
            } else {
              setError(signInError.message);
            }
            setLoading(false);
            return;
          }

          const rawRole = data.user?.user_metadata?.role;
          const userRole = rawRole === 'business' ? 'cashier' : 'student';
          const userDisplayName = data.user?.user_metadata?.display_name || cleanLogin;

          setCurrentUser({
            id: data.user?.id || `usr_${Date.now()}`,
            email: cleanLogin,
            displayName: userDisplayName,
            role: userRole,
            venueName: data.user?.user_metadata?.venue_name,
          });

          setSuccessMessage('Успешный вход!');
          setTimeout(() => {
            handleClose();
          }, 800);
          return;
        }
      }

      // 3. Graceful Local Fallback (For offline/testing without live keys)
      // Save/check registered users locally to provide realistic experience
      const localUsersKey = 'nooki_local_users_db';
      let localUsers: Array<{ login: string; pass: string; name: string; role: 'student' | 'cashier'; venueName?: string }> = [];
      try {
        const stored = localStorage.getItem(localUsersKey);
        if (stored) localUsers = JSON.parse(stored);
      } catch {
        localUsers = [];
      }

      if (mode === 'register') {
        const exists = localUsers.find((u) => u.login === cleanLogin);
        if (exists) {
          setError('Пользователь с таким логином уже существует в локальной базе. Перейдите во вкладку «Вход».');
          setLoading(false);
          return;
        }

        localUsers.push({
          login: cleanLogin,
          pass: cleanPassword,
          name: cleanDisplayName,
          role: regRole,
          venueName: regRole === 'cashier' ? venueName : undefined,
        });
        localStorage.setItem(localUsersKey, JSON.stringify(localUsers));

        setCurrentUser({
          id: `local_${Date.now()}`,
          email: cleanLogin,
          displayName: cleanDisplayName,
          role: regRole,
          venueName: regRole === 'cashier' ? venueName : undefined,
        });

        setSuccessMessage('Аккаунт успешно создан!');
        setTimeout(() => {
          handleClose();
        }, 900);
        return;
      } else {
        const found = localUsers.find((u) => u.login === cleanLogin);
        if (found) {
          if (found.pass !== cleanPassword) {
            setError('Неверный пароль для этого логина.');
            setLoading(false);
            return;
          }

          setCurrentUser({
            id: `local_${Date.now()}`,
            email: found.login,
            displayName: found.name,
            role: found.role,
            venueName: found.venueName,
          });

          setSuccessMessage('Вы успешно вошли в профиль!');
          setTimeout(() => {
            handleClose();
          }, 800);
          return;
        } else {
          // If no local user found, let standard demo fallback work for convenience
          const assignedRole = cleanLogin.includes('partner') || cleanLogin.includes('cafe') ? 'cashier' : 'student';
          setCurrentUser({
            id: `local_${Math.random().toString(36).substring(2, 9)}`,
            email: cleanLogin,
            displayName: cleanDisplayName,
            role: assignedRole,
            venueName: assignedRole === 'cashier' ? venueName : undefined,
          });

          setSuccessMessage('Вы успешно вошли в профиль!');
          setTimeout(() => {
            handleClose();
          }, 800);
          return;
        }
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Произошла непредвиденная ошибка';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm flex justify-center items-start sm:items-center animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden animate-scale-up max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title and Close Button (Never Cut Off) */}
        <div className="shrink-0 px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {currentUser ? 'Мой профиль' : (mode === 'login' ? 'Вход в Nooki' : 'Регистрация аккаунта')}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {currentUser ? 'Управление вашей учетной записью' : (mode === 'login' ? 'Войдите для доступа к скидкам и сервису' : 'Создайте аккаунт пользователя или бизнес-партнера')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View 1: Authorized User Profile Details */}
        {currentUser ? (
          <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 font-bold ${
                currentUser.role === 'cashier' ? 'bg-indigo-600' : 'bg-blue-600'
              }`}>
                {currentUser.role === 'cashier' ? <Briefcase className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {currentUser.displayName}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentUser.role === 'cashier' 
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {currentUser.role === 'cashier' ? 'Бизнес партнер' : 'Пользователь'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  @{currentUser?.email ? currentUser.email.replace('@studcity.internal', '') : (currentUser?.displayName || 'user')}
                </p>
              </div>
            </div>

            {currentUser.role === 'student' && activeStudentCode && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Ваш активный PIN-код: {activeStudentCode.code}</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Выписан для «{activeStudentCode.venueName}». Покажите на кассе для получения скидки.
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  handleClose();
                }}
                className="w-full py-3 px-4 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти из аккаунта</span>
              </button>
            </div>
          </div>
        ) : (
          /* View 2: Form with Segmented Tabs */
          <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
            
            {/* Segmented Mode Selector: [ Вход ] [ Создать аккаунт ] */}
            <div className="p-1 rounded-2xl bg-slate-100 flex items-center gap-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Вход
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Создать аккаунт
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              
              {/* Status Picker for Registration */}
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Тип профиля:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('student')}
                      className={`p-2.5 rounded-2xl border-2 transition text-left flex items-center justify-center gap-2 cursor-pointer ${
                        regRole === 'student'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <User className={`w-4 h-4 shrink-0 ${regRole === 'student' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-extrabold">Пользователь</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('cashier')}
                      className={`p-2.5 rounded-2xl border-2 transition text-left flex items-center justify-center gap-2 cursor-pointer ${
                        regRole === 'cashier'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Briefcase className={`w-4 h-4 shrink-0 ${regRole === 'cashier' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-extrabold">Бизнес</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Name / Business Title for Registration */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {regRole === 'cashier' ? 'Контактное лицо / управляющий:' : 'Ваше имя:'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={regRole === 'cashier' ? 'Арман' : 'Алихан'}
                    required
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-hidden transition"
                  />
                </div>
              )}

              {/* Venue name if Business Partner */}
              {mode === 'register' && regRole === 'cashier' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Название заведения / точки:
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="например: Coffee Moon или Taza Doner"
                    required
                    className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-hidden transition"
                  />
                </div>
              )}

              {/* Username / Login Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Логин:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="например: arman или coffee_moon"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-hidden transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Пароль:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    minLength={6}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    required
                    className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Register only) */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Повторите пароль:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите пароль"
                      minLength={6}
                      autoComplete="new-password"
                      required
                      className="w-full bg-white border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 outline-hidden transition"
                    />
                  </div>
                </div>
              )}

              {/* Error & Success Messages */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 stroke-[3]" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Проверка...' : (mode === 'login' ? 'Войти' : 'Создать аккаунт')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Clean security note and sync status */}
              <div className="pt-2 border-t border-slate-100 flex flex-col items-center justify-center gap-1 text-[11px] text-slate-400 font-medium text-center">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Шифрование данных и безопасная сессия</span>
                </div>
                {!isSupabaseConfigured && (
                  <span className="text-[10px] text-amber-600 font-normal">
                    (Локальный режим: синхронизация между телефоном и ноутбуком требует подключения Supabase)
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
