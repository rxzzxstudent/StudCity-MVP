'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, MessageSquare, Send, Loader2 } from 'lucide-react';
import { trackFeedback } from '@/lib/analytics';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId?: string;
  venueName?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  venueId = 'general',
  venueName = 'Nooki',
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSubmitted(false);
    setIsSubmitting(false);
    setComment('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Haptic feedback if in Telegram WebApp
    try {
      (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
    } catch {
      // ignore
    }

    try {
      await Promise.race([
        trackFeedback({
          venueId,
          rating,
          comment: comment.trim(),
          role: 'guest',
        }),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch (err) {
      console.warn('Feedback tracking error:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);

      // Success haptic feedback
      try {
        (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
      } catch {
        // ignore
      }

      // Auto close after 3.5s if user doesn't close manually
      setTimeout(() => {
        handleClose();
      }, 3500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              Как прошел ваш визит?
            </h3>
            <p className="text-xs text-slate-500">
              Оцените качество и обслуживание в <strong>{venueName}</strong>:
            </p>

            {/* 5 Stars Rating Bar */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-hidden"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Что понравилось или что улучшить? (необязательно)"
              rows={3}
              className="w-full text-xs text-slate-800 bg-slate-50 p-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:bg-white outline-hidden resize-none transition"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Отправка отзыва...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Отправить отзыв</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900">Отзыв успешно отправлен!</h4>
              <p className="text-xs text-slate-500 mt-1">Спасибо за обратную связь</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] font-semibold text-slate-600">
                Ваша оценка: {rating} из 5
              </p>
              {comment.trim() && (
                <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">
                  «{comment.trim()}»
                </p>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Ваше мнение передано заведению и сервису Nooki.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs py-3.5 rounded-xl transition shadow-md shadow-blue-500/20"
            >
              Отлично
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
