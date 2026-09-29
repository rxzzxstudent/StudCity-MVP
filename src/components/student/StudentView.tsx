'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Category, VenueOffer } from '@/types';
import { 
  MapPin, 
  Clock, 
  ChevronDown, 
  CheckCircle2, 
  KeyRound, 
  Coffee, 
  Utensils, 
  Printer, 
  Laptop, 
  Sparkles, 
  Layers, 
  Flame,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  GraduationCap,
  Wrench,
  Cake,
  Globe,
  ExternalLink,
  Instagram,
  Phone,
  Dumbbell,
  Scissors,
  Users
} from 'lucide-react';

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Все слоты', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'food', label: 'Ланчи и обеды', icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'fitness', label: 'Спорт и залы', icon: <Dumbbell className="w-3.5 h-3.5" /> },
  { id: 'beauty', label: 'Бьюти и уход', icon: <Scissors className="w-3.5 h-3.5" /> },
  { id: 'coffee', label: 'Кофе и напитки', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'service', label: 'Сервис и ПК', icon: <Wrench className="w-3.5 h-3.5" /> },
  { id: 'dessert', label: 'Десерты и выпечка', icon: <Cake className="w-3.5 h-3.5" /> },
];

const CLUSTERS = [
  'Все кластеры Алматы',
  'Кластер Сатпаева — Байтурсынова',
  'Кампус КазНУ (ГУК)',
  'Кластер Толе би — Абылай хана (КБТУ/КазНАУ)',
  'Кампус Satbayev University (Polytech)',
];

export const StudentView: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedCluster,
    setSelectedCluster,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    offers,
    openQrModal,
    viewMode,
    setStudentTab,
  } = useApp();

  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Format seconds to hh:mm:ss
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Filter & Search & Sort Logic
  const filteredOffers = offers
    .filter((offer) => {
      // Category filter
      if (selectedCategory !== 'all' && offer.category !== selectedCategory) {
        return false;
      }
      // Cluster filter
      if (selectedCluster !== 'Все кластеры Алматы' && offer.cluster !== selectedCluster) {
        // keep URBO and match if needed
      }
      // Text search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = offer.name.toLowerCase().includes(query);
        const matchesTitle = offer.title.toLowerCase().includes(query);
        const matchesDesc = offer.description.toLowerCase().includes(query);
        const matchesCategory = offer.categoryLabel.toLowerCase().includes(query);
        const matchesAddress = offer.address.toLowerCase().includes(query);
        return matchesName || matchesTitle || matchesDesc || matchesCategory || matchesAddress;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      if (sortBy === 'expiring') return a.remainingSeconds - b.remainingSeconds;
      if (sortBy === 'distance') {
        const distA = parseInt(a.distance) || 999;
        const distB = parseInt(b.distance) || 999;
        return distA - distB;
      }
      return 0; // default order
    });

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'fitness':
        return <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />;
      case 'beauty':
        return <Scissors className="w-3.5 h-3.5 text-purple-600" />;
      case 'service':
        return <Wrench className="w-3.5 h-3.5 text-blue-600" />;
      case 'dessert':
        return <Cake className="w-3.5 h-3.5 text-pink-600" />;
      case 'coffee':
        return <Coffee className="w-3.5 h-3.5 text-amber-600" />;
      case 'food':
        return <Utensils className="w-3.5 h-3.5 text-orange-600" />;
      case 'print':
        return <Printer className="w-3.5 h-3.5 text-indigo-600" />;
      case 'coworking':
        return <Laptop className="w-3.5 h-3.5 text-cyan-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8 transition-all duration-300">
      
      {/* 1. Hero Banner: Kangaroo Mascot with Content Overlay */}
      <div className="relative mb-8 sm:mb-12 rounded-[32px] sm:rounded-[44px] overflow-hidden border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] min-h-[360px] sm:min-h-[440px] lg:min-h-[480px] flex flex-col justify-center items-center py-10 sm:py-16 px-4 sm:px-8">
        {/* Background Mascot Image */}
        <img
          src="/Kangaroo_mascot_wearing_sunglasses_20260929171723.jpg"
          alt="Nooki — Скидки в тихие часы"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />

        {/* Balanced Cinematic Overlay (Moderate contrast for crisp text readability while preserving mascot colors) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/35 to-slate-950/45" />

        {/* Content Elements Layer (Внутренний уровень сверху плашки) */}
        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          {/* Clean Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight text-center leading-[1.12] drop-shadow-md">
            Скидки в тихие часы
          </h1>

          {/* Subtitle */}
          <p className="mt-3.5 sm:mt-5 text-sm sm:text-base lg:text-lg text-white/95 text-center max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
            Заведения Алматы открывают свободные столы и смарт-слоты со скидкой до 50%. Забирайте 4-значный PIN за 3 секунды без сложной регистрации.
          </p>

          {/* Action Button (Pleasant Blue text, friendly white pill) */}
          <div className="mt-6 sm:mt-8">
            <a
              href="#catalog-offers"
              className="px-8 py-3.5 rounded-full bg-white hover:bg-blue-50/90 text-[#2563eb] font-extrabold text-sm sm:text-base shadow-lg hover:shadow-2xl transition-all duration-200 active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Выбрать заведение</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Search & Category Bar */}
      <div id="catalog-offers" className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/90 shadow-sm mb-6 sm:mb-8 space-y-3 sm:space-y-4 scroll-mt-24">
        
        {/* Top Search and Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search bar */}
          <div className="sm:col-span-8 lg:col-span-9 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск заведения, ланча, донера, кофе, зала, копицентра..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 pl-11 pr-8 py-2.5 sm:py-3 rounded-2xl border border-slate-200 focus:border-blue-600 outline-hidden transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
          <div className="sm:col-span-4 lg:col-span-3 relative">
            <button
              onClick={() => {
                setSortDropdownOpen(!sortDropdownOpen);
                setClusterDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold transition"
            >
              <div className="flex items-center gap-2 truncate">
                <ArrowUpDown className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">
                  {sortBy === 'popular' && 'По популярности'}
                  {sortBy === 'discount' && 'Скидка %'}
                  {sortBy === 'expiring' && 'Таймер'}
                  {sortBy === 'distance' && 'Ближайшие'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute top-full right-0 left-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
                <button
                  onClick={() => { setSortBy('popular'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between ${sortBy === 'popular' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>🔥 По популярности</span>
                </button>
                <button
                  onClick={() => { setSortBy('discount'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between ${sortBy === 'discount' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>🏷️ Макс. скидка %</span>
                </button>
                <button
                  onClick={() => { setSortBy('expiring'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between ${sortBy === 'expiring' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>⏳ Скоро закончатся</span>
                </button>
                <button
                  onClick={() => { setSortBy('distance'); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between ${sortBy === 'distance' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>📍 Ближайшие к кампусу</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Category Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Cards Grid (4 columns on desktop & laptops) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {filteredOffers.map((offer: VenueOffer) => {
          const isDisabled = !offer.happyHoursActive;

          return (
            <div
              key={offer.id}
              className={`group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden ${
                isDisabled ? 'opacity-70 grayscale-[30%]' : ''
              }`}
            >
              {/* Card Cover Image Header with Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={offer.image}
                  alt={offer.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/partners/torte-studio.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Bottom Left Discount Chip */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm px-3 py-1 rounded-xl shadow-md flex items-center gap-1 border border-white/20">
                    <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>-{offer.discountPercent}%</span>
                  </div>
                  <span className="text-xs text-white/90 font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
                    {offer.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                
                <div className="space-y-2.5">
                  {/* Category & Live Timer Row */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      {getCategoryIcon(offer.category)}
                      <span className="text-slate-900 text-sm">{offer.name}</span>
                    </div>

                    {offer.happyHoursActive ? (
                      <div className="flex items-center gap-1 text-amber-600 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-xs">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{formatTime(offer.remainingSeconds)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Спад окончен</span>
                    )}
                  </div>

                  {/* Main Offer Title */}
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-blue-600 transition">
                    {offer.title}
                  </h3>

                  {/* Description Snippet */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {offer.description}
                  </p>

                  {/* Social / Group Discount Badge */}
                  {offer.groupDiscountText && (
                    <div className="text-xs text-indigo-800 bg-indigo-50/90 font-medium px-3 py-1.5 rounded-xl border border-indigo-200/80 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{offer.groupDiscountText}</span>
                    </div>
                  )}
                  
                  {/* Address & Quick Links */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-700">{offer.address}</span>
                    </p>

                    {/* Interactive partner badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {offer.quietHoursWindow && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          <span>{offer.quietHoursWindow}</span>
                        </span>
                      )}

                      {offer.mapUrl && (
                        <a
                          href={offer.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/80 transition"
                        >
                          <MapPin className="w-2.5 h-2.5" />
                          <span>Яндекс Карты</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      )}

                      {offer.instagram && (
                        <a
                          href={offer.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-md border border-pink-200/80 transition"
                        >
                          <Instagram className="w-2.5 h-2.5" />
                          <span>{offer.instagram.replace('https://instagram.com/', '@')}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & CTA Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400 line-through block leading-tight font-medium">
                      {offer.originalPrice.toLocaleString()} ₸
                    </span>
                    <span className="text-xl font-black text-slate-900 leading-none">
                      {offer.discountedPrice.toLocaleString()} ₸
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!offer.happyHoursActive}
                    onClick={() => openQrModal(offer)}
                    className={`py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all duration-200 shadow-sm cursor-pointer ${
                      offer.happyHoursActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white shadow-blue-500/25'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{offer.happyHoursActive ? 'Забрать PIN' : 'На паузе'}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State if no search matches */}
      {filteredOffers.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-8">
          <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">Предложений не найдено</h4>
          <p className="text-xs text-slate-500 mt-1">Попробуйте изменить категорию или поисковый запрос</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

    </div>
  );
};
