import { NextRequest, NextResponse } from 'next/server';

// Serverless Webhook Route for Nooki Telegram Bot on Vercel
export const dynamic = 'force-dynamic';

function getBotToken(): string {
  return process.env.BOT_TOKEN || '';
}

function getWebAppUrl(): string {
  if (process.env.WEBAPP_URL) {
    return process.env.WEBAPP_URL;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://stud-city.vercel.app/';
}

async function callTelegramApi(method: string, data: Record<string, unknown> = {}) {
  const token = getBotToken();
  if (!token) {
    console.warn('[Nooki Bot] BOT_TOKEN is not set in environment variables');
    return { ok: false, error: 'BOT_TOKEN is missing' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Nooki Bot API Error] ${method}:`, message);
    return { ok: false, error: message };
  }
}

async function sendMessage(chatId: number | string, text: string, replyMarkup: unknown = null) {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  return await callTelegramApi('sendMessage', payload);
}

async function answerCallbackQuery(callbackQueryId: string) {
  return await callTelegramApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
  });
}

function getWelcomeMessage(firstName = 'Горожанин') {
  return (
    `👋 <b>Привет, ${firstName}!</b>\n\n` +
    `⚡ Добро пожаловать в <b>Nooki</b> — единый городской сервис смарт-доступа к услугам заведений в непиковые «тихие» часы и бесплатной карте городской инфраструктуры!\n\n` +
    `<b>Основные возможности Nooki:</b>\n\n` +
    `1️⃣ <b>Каталог непиковых слотов :</b>\n` +
    `Фиксированные скидки до 50% на горячие обеды (14:00–16:30), дневные проходки в залы и бьюти со скидкой до 40%.\n\n` +
    `2️⃣ <b>Городская карта инфраструктуры:</b>\n` +
    `Бесплатный навигатор по местам с проверенными чистыми санузлами, открытыми розетками, быстрым Wi-Fi  и тихими рабочими зонами.\n\n` +
    `3️⃣ <b>Мгновенное погашение на кассе:</b>\n` +
    `4-значный PIN-код или динамический QR для применения скидки за 3 секунды без сложного ПО.`
  );
}

function getWebAppKeyboard(webAppUrl: string) {
  return {
    inline_keyboard: [
      [
        {
          text: '⚡ Открыть Nooki WebApp',
          web_app: { url: webAppUrl },
        },
      ],
    ],
  };
}

// Handle Update
async function handleUpdate(update: Record<string, any>) {
  const webAppUrl = getWebAppUrl();

  // 1. Message handling: answer any message with greeting, site link, and WebApp button
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    if (!chatId) return;

    const firstName = msg.from?.first_name || 'Горожанин';
    await sendMessage(
      chatId, 
      getWelcomeMessage(firstName), 
      getWebAppKeyboard(webAppUrl)
    );
  }

  // 2. Callback query handling: also respond with greeting and WebApp button
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const firstName = cb.from?.first_name || 'Горожанин';

    if (chatId) {
      await sendMessage(
        chatId, 
        getWelcomeMessage(firstName), 
        getWebAppKeyboard(webAppUrl)
      );
    }

    if (cb.id) {
      await answerCallbackQuery(cb.id);
    }
  }
}

// POST: Telegram Webhook Entrypoint
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    await handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Nooki Bot Webhook Error]:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}

// GET: Health Check and Webhook Info
export async function GET() {
  const token = getBotToken();
  const webAppUrl = getWebAppUrl();

  return NextResponse.json({
    status: 'online',
    service: 'nooki-telegram-webhook',
    hasToken: Boolean(token),
    webAppUrl,
    timestamp: new Date().toISOString(),
  });
}
