'use client';

import React, { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare, Send } from 'lucide-react';
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
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await trackFeedback({
      venueId,
      rating,
      comment: comment.trim(),
      role: 'guest',
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition"
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
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Отправить отзыв</span>
            </button>
          </form>
        ) : (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-black text-slate-900">Спасибо за отзыв!</h4>
            <p className="text-xs text-slate-500">Ваше мнение помогает нам и заведениям становиться лучше.</p>
          </div>
        )}
      </div>
    </div>
  );
};
