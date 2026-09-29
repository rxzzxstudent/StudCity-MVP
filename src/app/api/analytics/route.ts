import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { encryptData, hashUserId } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

function getGoogleSheetsWebhookUrl(): string {
  return process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';
}

// Helper to forward clean data to Google Sheets (3 tabs in 1 spreadsheet)
async function forwardToGoogleSheets(type: 'event' | 'redemption' | 'feedback' | 'spot', data: Record<string, unknown>) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheet_type: type,
        data,
        timestamp: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' }),
      }),
    });
  } catch (err) {
    console.warn('[Google Sheets Sync Error]:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    // 1. Handle Redemptions (Покупки на кассе)
    if (type === 'redemption') {
      const plainUserName = payload.userName || 'Горожанин';
      const encryptedUserName = encryptData(plainUserName);
      const hashedUserId = hashUserId(payload.userId || 'anonymous');

      const redemptionRecord = {
        code: payload.code,
        user_id: hashedUserId,
        user_name: encryptedUserName,
        venue_id: payload.venueId,
        venue_name: payload.venueName,
        amount: payload.amount,
        saved_amount: payload.savedAmount,
        original_price: payload.originalPrice || (payload.amount + payload.savedAmount),
        is_repeat: Boolean(payload.isRepeat),
        created_at: new Date().toISOString(),
      };

      // Save to Supabase
      if (isSupabaseConfigured && supabase) {
        await supabase.from('nooki_redemptions').insert([redemptionRecord]);
      }

      // Sync clean human-readable row to Google Sheets Tab "Покупки"
      await forwardToGoogleSheets('redemption', {
        date_time: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' }),
        user: plainUserName,
        venue: payload.venueName,
        code: payload.code,
        amount_kzt: payload.amount,
        saved_kzt: payload.savedAmount,
        is_repeat: payload.isRepeat ? 'Да (Retention)' : 'Первый раз',
      });

      return NextResponse.json({ ok: true, encrypted: true });
    }

    // 2. Handle Funnel Events (Воронка действий)
    if (type === 'event') {
      const plainUserName = payload.userName || 'Пользователь';
      const encryptedUserName = encryptData(plainUserName);
      const hashedUserId = hashUserId(payload.userId || 'anonymous');

      const eventRecord = {
        event_type: payload.eventType,
        user_id: hashedUserId,
        user_name: encryptedUserName,
        venue_id: payload.venueId || null,
        offer_id: payload.offerId || null,
        amount: payload.amount || null,
        metadata: payload.metadata || {},
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        await supabase.from('nooki_events').insert([eventRecord]);
      }

      await forwardToGoogleSheets('event', {
        date_time: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' }),
        event_name: payload.eventType,
        user: plainUserName,
        venue: payload.venueId || '—',
        amount_kzt: payload.amount || 0,
      });

      return NextResponse.json({ ok: true, encrypted: true });
    }

    // 3. Handle Feedback (Отзывы)
    if (type === 'feedback') {
      const plainUserName = payload.userName || 'Гость';
      const plainComment = payload.comment || '';
      const encryptedUserName = encryptData(plainUserName);
      const encryptedComment = encryptData(plainComment);
      const hashedUserId = hashUserId(payload.userId || 'anonymous');

      const feedbackRecord = {
        user_id: hashedUserId,
        user_name: encryptedUserName,
        venue_id: payload.venueId,
        rating: payload.rating,
        comment: encryptedComment,
        role: payload.role || 'guest',
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        await supabase.from('nooki_feedback').insert([feedbackRecord]);
      }

      await forwardToGoogleSheets('feedback', {
        date_time: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' }),
        user: plainUserName,
        venue: payload.venueId,
        rating: '⭐'.repeat(payload.rating) + ` (${payload.rating}/5)`,
        comment: plainComment || 'Без текста',
      });

      return NextResponse.json({ ok: true, encrypted: true });
    }

    // 4. Handle UGC Map Spot additions (Краудсорсинг точек)
    if (type === 'spot') {
      const plainUserName = payload.userName || 'Горожанин';
      const hashedUserId = hashUserId(payload.userId || 'anonymous');

      await forwardToGoogleSheets('spot', {
        date_time: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' }),
        user: plainUserName,
        title: payload.title,
        category: payload.category,
        address: payload.address,
        is_free: payload.isFree ? 'Да' : 'Нет',
        price_info: payload.priceInfo || '—',
        lat: payload.lat,
        lng: payload.lng,
      });

      // Also record event in funnel
      if (isSupabaseConfigured && supabase) {
        await supabase.from('nooki_events').insert([{
          event_type: 'user_spot_added',
          user_id: hashedUserId,
          metadata: { title: payload.title, category: payload.category },
          created_at: new Date().toISOString(),
        }]);
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'Unknown payload type' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Analytics API Route Error]:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
