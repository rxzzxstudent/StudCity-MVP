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

function getMainKeyboard(webAppUrl: string) {
  return {
    inline_keyboard: [
      [
        {
          text: '⚡ Открыть Nooki WebApp',
          web_app: { url: webAppUrl },
        },
      ],
      [
        { text: '🔥 Непиковые слоты', callback_data: 'view_deals' },
        { text: '🗺️ Карта инфраструктуры', callback_data: 'view_map' },
      ],
      [
        { text: '🔢 4-значный PIN кассира', callback_data: 'view_code_info' },
        { text: '💼 Режим кассира / B2B', callback_data: 'view_cashier' },
      ],
      [
        { text: 'ℹ️ О сервисе Nooki', callback_data: 'view_about' },
      ],
    ],
  };
}

function getWelcomeMessage(firstName = 'Горожанин') {
  return (
    `👋 <b>Привет, ${firstName}!</b>\n\n` +
    `⚡ Добро пожаловать в <b>Nooki</b> — единый городской сервис смарт-доступа к услугам заведений в непиковые «тихие» часы и бесплатной карте городской инфраструктуры!\n\n` +
    `📱 <b>Основные возможности Nooki:</b>\n\n` +
    `1️⃣ <b>Каталог непиковых слотов (Quiet Hours):</b>\n` +
    `Фиксированные скидки до 50% на горячие обеды (14:00–16:30), дневные проходки в залы и бьюти со скидкой до 40%.\n\n` +
    `2️⃣ <b>Городская карта инфраструктуры:</b>\n` +
    `Бесплатный навигатор по местам с проверенными чистыми санузлами 🚻, открытыми розетками 🔌, быстрым Wi-Fi 📶 и тихими рабочими зонами 🤫.\n\n` +
    `3️⃣ <b>Мгновенное погашение на кассе:</b>\n` +
    `4-значный PIN-код или динамический QR для применения скидки за 3 секунды без сложного ПО.\n\n` +
    `👇 <i>Нажмите кнопку ниже, чтобы запустить приложение прямо в Telegram:</i>`
  );
}

function getDealsMessage(webAppUrl: string) {
  return (
    `🔥 <b>Горящие слоты в «тихие часы» заведений:</b>\n\n` +
    `🍔 <b>Сытные комбо-обеды</b>\n` +
    `📍 Локальные кафе и столовые (14:00–16:30)\n` +
    `💰 1 100 – 1 200 ₸ вместо 1 800 ₸ (-35%)\n\n` +
    `☕ <b>Coffee Moon — Cafe & Wine</b>\n` +
    `📍 ул. Манаса, 51\n` +
    `🎁 <i>Любой авторский лимонад / айс-ти в подарок к любому блюду!</i>\n\n` +
    `💻 <b>Smart Service — Сервисный центр</b>\n` +
    `📍 пр. Абая, 52В (БЦ Bayzak, 3 этаж)\n` +
    `🔧 <i>Скидка 10–20% на чистку, замену термопасты и ремонт</i>\n\n` +
    `🏋️ <b>Фитнес и спорт:</b>\n` +
    `Разовый дневной проход за 1 500 ₸ (11:00–16:00)\n\n` +
    `👇 <i>Забронируйте слот и получите PIN в Nooki WebApp:</i>`
  );
}

function getMapMessage() {
  return (
    `🗺️ <b>Карта городской инфраструктуры Nooki:</b>\n\n` +
    `🚻 <b>Чистые санузлы (WC):</b>\n` +
    `• ТЦ Promenade (пр. Абая 44) — 1 и 2 этажи, свободный вход.\n` +
    `• ТРЦ Forum (пр. Сейфуллина 617) — чистый просторный санузел.\n` +
    `• БЦ Bayzak (пр. Абая 52В) — чистый WC на 3 этаже.\n\n` +
    `🔌 <b>Розетки и подзарядка:</b>\n` +
    `• Коворкинги и библиотеки кампусов — открытые розетки и удлинители.\n` +
    `• Coffee Moon (Манаса 51) — розетки у каждого столика.\n\n` +
    `📶 <b>Бесплатный Wi-Fi:</b>\n` +
    `• Coffee Moon Guest, открытые сети ТРЦ и коворкингов.\n\n` +
    `🤫 <b>Тихие зоны для учебы и работы:</b>\n` +
    `• Бесплатные читальные залы и тихие уголки коворкингов.\n\n` +
    `👇 <i>Все точки доступны на интерактивной карте:</i>`
  );
}

function getCodeInfoMessage() {
  return (
    `🔢 <b>Как работает 4-значный PIN-код Nooki:</b>\n\n` +
    `1️⃣ Выберите акцию или комбо в WebApp.\n` +
    `2️⃣ Нажмите <b>«Получить скидку»</b>.\n` +
    `3️⃣ На экране отобразится <b>4-значный PIN</b> (например, <code>4821</code>) и QR-код.\n` +
    `4️⃣ Покажите экран кассиру или назовите 4 цифры.\n` +
    `5️⃣ Кассир введет PIN за 3 секунды, и скидка применится к чеку!\n\n` +
    `⏱️ <i>Слот и код активны в течение указанного времени действия непикового часа.</i>`
  );
}

function getCashierMessage() {
  return (
    `💼 <b>Режим кассира и партнера Nooki:</b>\n\n` +
    `Для заведений не требуется покупка сложного ПО:\n` +
    `• Мгновенная валидация 4-значных PIN-кодов за 3 секунды.\n` +
    `• Переключение непиковых «тихих часов» (вкл/выкл одной кнопкой).\n` +
    `• Безрисковая модель: оплата только за реальных гостей.\n\n` +
    `Откройте WebApp и переключитесь на роль кассира / B2B:`
  );
}

function getAboutMessage(webAppUrl: string) {
  return (
    `⚡ <b>Nooki</b> — смарт-доступ к тихим часам заведений и городской инфраструктуре.\n\n` +
    `<b>Для горожан и студентов:</b>\n` +
    `• Экономия до 50% на обедах, спорте, кофе и бьюти.\n` +
    `• Бесплатная карта розеток, скоростного Wi-Fi и чистых туалетов.\n\n` +
    `<b>Для бизнеса:</b>\n` +
    `• Дополнительная загрузка в мертвые часы без риска для основного чека.\n` +
    `• Простейшая валидация по 4-значному PIN-коду.\n\n` +
    `🌐 WebApp: ${webAppUrl}`
  );
}

function getHelpMessage() {
  return (
    `💡 <b>Команды бота Nooki:</b>\n\n` +
    `/start — Запустить бота и открыть Nooki WebApp\n` +
    `/deals — Непиковые слоты и скидки до 50%\n` +
    `/map — Карта инфраструктуры (WC, Wi-Fi, розетки)\n` +
    `/code — Инструкция по 4-значному PIN кассира\n` +
    `/cashier — Вход для кассиров и партнеров\n` +
    `/help — Справка и возможности\n\n` +
    `📌 <i>Или воспользуйтесь кнопкой внизу чата для запуска WebApp!</i>`
  );
}

// Handle Update
async function handleUpdate(update: Record<string, any>) {
  const webAppUrl = getWebAppUrl();

  // 1. Message handling
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    if (!chatId) return;

    const text = (msg.text || '').trim();
    const firstName = msg.from?.first_name || 'Горожанин';

    if (text.startsWith('/start')) {
      await sendMessage(chatId, getWelcomeMessage(firstName), getMainKeyboard(webAppUrl));
    } else if (text.startsWith('/deals')) {
      await sendMessage(chatId, getDealsMessage(webAppUrl), {
        inline_keyboard: [
          [{ text: '⚡ Открыть Nooki WebApp', web_app: { url: webAppUrl } }],
          [{ text: '« В главное меню', callback_data: 'view_about' }],
        ],
      });
    } else if (text.startsWith('/map')) {
      await sendMessage(chatId, getMapMessage(), {
        inline_keyboard: [
          [{ text: '🗺️ Открыть карту в WebApp', web_app: { url: webAppUrl } }],
          [{ text: '« В главное меню', callback_data: 'view_about' }],
        ],
      });
    } else if (text.startsWith('/code') || text.startsWith('/pin')) {
      await sendMessage(chatId, getCodeInfoMessage(), {
        inline_keyboard: [
          [{ text: '⚡ Получить PIN в Nooki WebApp', web_app: { url: webAppUrl } }],
        ],
      });
    } else if (text.startsWith('/cashier')) {
      await sendMessage(chatId, getCashierMessage(), {
        inline_keyboard: [
          [{ text: '💼 Открыть Nooki (Кассир)', web_app: { url: webAppUrl } }],
        ],
      });
    } else if (text.startsWith('/help')) {
      await sendMessage(chatId, getHelpMessage(), {
        inline_keyboard: [
          [{ text: '⚡ Открыть Nooki WebApp', web_app: { url: webAppUrl } }],
        ],
      });
    } else {
      await sendMessage(
        chatId,
        `⚡ Нажмите кнопку ниже, чтобы открыть Nooki:`,
        getMainKeyboard(webAppUrl)
      );
    }
  }

  // 2. Callback query handling
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const data = cb.data;

    if (chatId) {
      if (data === 'view_deals') {
        await sendMessage(chatId, getDealsMessage(webAppUrl), {
          inline_keyboard: [
            [{ text: '⚡ Открыть Nooki WebApp', web_app: { url: webAppUrl } }],
            [{ text: '« В главное меню', callback_data: 'view_about' }],
          ],
        });
      } else if (data === 'view_map') {
        await sendMessage(chatId, getMapMessage(), {
          inline_keyboard: [
            [{ text: '🗺️ Открыть карту в WebApp', web_app: { url: webAppUrl } }],
            [{ text: '« В главное меню', callback_data: 'view_about' }],
          ],
        });
      } else if (data === 'view_code_info') {
        await sendMessage(chatId, getCodeInfoMessage(), {
          inline_keyboard: [
            [{ text: '⚡ Получить PIN в Nooki WebApp', web_app: { url: webAppUrl } }],
          ],
        });
      } else if (data === 'view_cashier') {
        await sendMessage(chatId, getCashierMessage(), {
          inline_keyboard: [
            [{ text: '💼 Открыть Nooki (Кассир)', web_app: { url: webAppUrl } }],
          ],
        });
      } else if (data === 'view_about') {
        await sendMessage(chatId, getAboutMessage(webAppUrl), getMainKeyboard(webAppUrl));
      }
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
