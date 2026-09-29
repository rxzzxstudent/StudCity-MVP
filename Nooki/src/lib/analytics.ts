export interface EventPayload {
  venueId?: string;
  offerId?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}

export interface RedemptionPayload {
  code: string;
  venueId: string;
  venueName: string;
  amount: number;
  savedAmount: number;
  originalPrice?: number;
}

export interface FeedbackPayload {
  venueId: string;
  rating: number;
  comment?: string;
  role?: 'guest' | 'manager';
}

// Generate or retrieve persistent user identity
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'server_user';

  // 1. Check if launched inside Telegram WebApp
  try {
    const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser?.id) {
      return `tg_${tgUser.id}`;
    }
  } catch {
    // ignore
  }

  // 2. Fallback to persistent browser UUID
  try {
    const existing = localStorage.getItem('nooki_analytics_user_id');
    if (existing) return existing;

    const newId = `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    localStorage.setItem('nooki_analytics_user_id', newId);
    return newId;
  } catch {
    return 'anonymous_user';
  }
}

export function getUserDisplayName(): string {
  if (typeof window === 'undefined') return 'Пользователь';

  try {
    const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser) {
      return tgUser.username ? `@${tgUser.username}` : `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim();
    }
  } catch {
    // ignore
  }

  return 'Горожанин';
}

async function sendToAnalyticsApi(type: 'event' | 'redemption' | 'feedback', payload: Record<string, unknown>) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        payload: {
          ...payload,
          userId: getOrCreateUserId(),
          userName: getUserDisplayName(),
        },
      }),
    });
  } catch (err) {
    console.warn('[Analytics Client Error]:', err);
  }
}

// 1. Track Funnel Events ('app_open', 'pin_generated', 'pin_redeemed', 'spot_viewed')
export async function trackEvent(eventType: string, payload: EventPayload = {}) {
  console.log(`[Nooki Analytics] Event: ${eventType}`, payload);
  await sendToAnalyticsApi('event', {
    eventType,
    ...payload,
  });
}

// 2. Track Successful Redemptions (Revenue & Retention)
export async function trackRedemption(payload: RedemptionPayload) {
  const userId = getOrCreateUserId();
  let isRepeat = false;

  if (typeof window !== 'undefined') {
    try {
      const priorCount = parseInt(localStorage.getItem(`nooki_redemptions_${userId}`) || '0', 10);
      if (priorCount > 0) {
        isRepeat = true;
      }
      localStorage.setItem(`nooki_redemptions_${userId}`, (priorCount + 1).toString());
    } catch {
      // ignore
    }
  }

  console.log('[Nooki Analytics] Redemption recorded:', payload);
  await sendToAnalyticsApi('redemption', {
    ...payload,
    isRepeat,
  });
}

// 3. Track Feedback & NPS
export async function trackFeedback(payload: FeedbackPayload) {
  console.log('[Nooki Analytics] Feedback submitted:', payload);
  await sendToAnalyticsApi('feedback', payload as unknown as Record<string, unknown>);
}
