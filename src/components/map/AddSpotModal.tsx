'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapSpot, MapSpotCategory } from '@/types';
import { 
  X, 
  PlusCircle, 
  MapPin, 
  Check, 
  Camera, 
  Coins, 
  Wifi, 
  Zap, 
  Clock, 
  Crosshair,
  Printer,
  Sparkles,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoords: { lat: number; lng: number } | null;
  onAddSpot: (spot: Omit<MapSpot, 'id'>) => void;
}

export const AddSpotModal: React.FC<AddSpotModalProps> = ({
  isOpen,
  onClose,
  initialCoords,
  onAddSpot,
}) => {
  const [category, setCategory] = useState<MapSpotCategory>('toilet');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(initialCoords);
  const [isLocating, setIsLocating] = useState(false);

  // Price state - no autofilled strings
  const [isFree, setIsFree] = useState(true);
  const [numericPrice, setNumericPrice] = useState<number | ''>('');
  const [priceCustomText, setPriceCustomText] = useState('');

  // Photo state - clean and optional, no forced preset
  const [imageUrl, setImageUrl] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optional fields - empty by default without autofill
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialCoords) {
      setCoords(initialCoords);
    }
  }, [initialCoords]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setAddress('');
      setHours('');
      setDescription('');
      setIsFree(true);
      setNumericPrice('');
      setPriceCustomText('');
      setImageUrl('');
      setShowPhotoInput(false);
      if (initialCoords) setCoords(initialCoords);
    }
  }, [isOpen, initialCoords]);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setIsLocating(false);
        alert('Не удалось получить геопозицию: ' + err.message);
      },
      { timeout: 8000 }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Размер фото не должен превышать 4 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !coords) return;

    const categoryLabels: Record<MapSpotCategory, string> = {
      toilet: 'Туалет',
      wifi: 'Wi-Fi спот',
      outlet: 'Розетки / Учеба',
      deal: 'Скидка Nooki',
      print: 'Печать / Копицентр',
    };

    let formattedPrice = 'Бесплатно';
    if (!isFree) {
      if (priceCustomText.trim()) {
        formattedPrice = priceCustomText.trim();
      } else if (numericPrice) {
        formattedPrice = `${numericPrice} ₸`;
      } else {
        formattedPrice = 'Платно';
      }
    }

    onAddSpot({
      title: title.trim(),
      category,
      categoryLabel: categoryLabels[category],
      lat: coords.lat,
      lng: coords.lng,
      address: address.trim() || 'Алматы, точка на карте OpenStreetMap',
      isFree,
      price: isFree ? 0 : Number(numericPrice) || 0,
      priceInfo: formattedPrice,
      hours: hours.trim() || undefined,
      description: description.trim() || categoryLabels[category],
      imageUrl: imageUrl.trim() || undefined,
      tags: ['Добавлено пользователем', categoryLabels[category]],
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 sm:p-6 my-auto max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Добавить точку на карту
              </h3>
              <p className="text-xs text-slate-500">
                Быстрое сохранение проверенного студенческого места
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean, Lightweight Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-3 text-left">
          
          {/* 1. Category Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Категория места *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'toilet', label: 'Санузел', icon: '🚻' },
                { id: 'outlet', label: 'Розетки', icon: '⚡' },
                { id: 'wifi', label: 'Wi-Fi', icon: '📶' },
                { id: 'print', label: 'Печать', icon: '🖨️' },
                { id: 'deal', label: 'Скидка', icon: '🔥' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as MapSpotCategory)}
                  className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    category === cat.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[11px] leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Spot Name (No autofill) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Название места *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Санузел в ТРЦ Forum 2 этаж или Коворкинг"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-hidden transition"
            />
          </div>

          {/* 3. Address / Landmark */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Адрес или ориентир
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ул. Сейфуллина, 617 или около центрального входа"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-hidden transition"
            />
          </div>

          {/* 4. Coordinates / Location status */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 truncate">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate font-mono">
                {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Кликните на карту'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-blue-600 rounded-xl font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shrink-0"
            >
              <Crosshair className="w-3 h-3" />
              <span>{isLocating ? 'Ищем...' : 'Где я'}</span>
            </button>
          </div>

          {/* 5. Access / Pricing */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Условия доступа
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsFree(true)}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                  isFree
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Бесплатно
              </button>
              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                  !isFree
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Платно (₸)
              </button>
            </div>

            {!isFree && (
              <div className="mt-2 flex gap-2 animate-fade-in">
                <input
                  type="number"
                  value={numericPrice}
                  onChange={(e) => setNumericPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Цена в ₸ (например, 100)"
                  className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden"
                />
                <input
                  type="text"
                  value={priceCustomText}
                  onChange={(e) => setPriceCustomText(e.target.value)}
                  placeholder="Или условие (по чеку)"
                  className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>
            )}
          </div>

          {/* 6. Hours & Comment (No autofill) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Часы работы (опционально)
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="24/7 или 09:00 – 22:00"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Подсказка как найти
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Этаж, код двери, как пройти..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 outline-hidden transition"
              />
            </div>
          </div>

          {/* 7. Optional Photo (clean & collapsed, no forced preset) */}
          <div className="pt-1">
            {!showPhotoInput && !imageUrl ? (
              <button
                type="button"
                onClick={() => setShowPhotoInput(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Прикрепить фото (по желанию)</span>
              </button>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Фотография места:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setShowPhotoInput(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Скрыть ✕
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Вставьте ссылку на фото или загрузите файл"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Файл
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {imageUrl && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Фото прикреплено</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !coords}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md ${
                title.trim() && coords
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Сохранить точку</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
