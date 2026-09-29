require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN || '8799330353:AAE9byJyPWDOQQC-q8XtMVUBrzmPzbpnU5g';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://stud-city.vercel.app/';

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Helper to call Telegram API
async function api(method, data = {}) {
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API error on ${method}:`, err.message);
    return { ok: false, error: err.message };
  }
}

// Send message helper
async function sendMessage(chatId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  return await api('sendMessage', payload);
}

// Answer callback query
async function answerCallbackQuery(callbackQueryId) {
  return await api('answerCallbackQuery', { callback_query_id: callbackQueryId });
}

// Main inline keyboard markup with WebApp button
function getMainKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '⚡ Открыть Nooki WebApp',
          web_app: { url: WEBAPP_URL }
        }
      ],
      [
        { text: '🔥 Flash-слоты (14:00–16:30)', callback_data: 'view_deals' },
        { text: '🗺️ Карта инфраструктуры', callback_data: 'view_map' }
      ],
      [
        { text: '🔢 4-значный PIN кассира', callback_data: 'view_code_info' },
        { text: '💼 Режим кассира', callback_data: 'view_cashier' }
      ],
      [
        { text: 'ℹ️ О проекте Nooki', callback_data: 'view_about' }
      ]
    ]
  };
}

// Message templates
function getWelcomeMessage(firstName = 'Горожанин') {
  return (
    `👋 <b>Привет, ${firstName}!</b>\n\n` +
    `⚡ Добро пожаловать в <b>Nooki</b> — единый городской сервис смарт-доступа к непиковым слотам заведений и карте инфраструктуры города!\n\n` +
    `📱 <b>3 главных экрана приложения:</b>\n\n` +
    `1️⃣ <b>Лента Flash-слотов:</b>\n` +
    `Ограниченные скидки до 50% в ресторанах и кофейнях в непиковые часы (14:00–16:30). Живой таймер и счетчик оставшихся слотов!\n\n` +
    `2️⃣ <b>Карта инфраструктуры:</b>\n` +
    `Интерактивная карта с бесплатными розетками 🔌, быстрым Wi-Fi 📶, чистыми WC 🚻 и тихими зонами для работы/учебы 🤫.\n\n` +
    `3️⃣ <b>Экран погашения:</b>\n` +
    `Уникальный 4-значный PIN-код и динамический QR для мгновенного подтверждения скидки на кассе.\n\n` +
    `👇 <i>Нажми кнопку ниже, чтобы запустить приложение прямо в Telegram:</i>`
  );
}

function getDealsMessage() {
  return (
    `🔥 <b>Горящие Flash-слоты в непиковые часы (14:00–16:30):</b>\n\n` +
    `☕ <b>Coffee Moon — Cafe & Wine</b>\n` +
    `📍 ул. Манаса, 51\n` +
    `🎁 <i>Любой авторский лимонад / айс-ти в подарок к любому блюду!</i>\n` +
    `💰 1 600 ₸ вместо 2 800 ₸ (-40%)\n` +
    `⏱️ Доступно прямо сейчас!\n\n` +
    `💻 <b>Smart Service — Ремонт ПК и ноутбуков</b>\n` +
    `📍 проспект Абая, 52В (БЦ Bayzak, 3 этаж)\n` +
    `🔧 <i>Скидка 10–20% на чистку, замену термопасты и апгрейд ноутбука</i>\n` +
    `💰 От 4 800 ₸ вместо 6 000 ₸\n\n` +
    `🥞 <b>De Tulp Dutch Pancake House</b>\n` +
    `📍 Зеленый Базар\n` +
    `🥞 <i>Скидка на сладкие и сытные голландские панкейки</i>\n\n` +
    `👇 <i>Забронируйте слот и получите 4-значный PIN в WebApp:</i>`
  );
}

function getMapMessage() {
  return (
    `🗺️ <b>Карта городской инфраструктуры Nooki:</b>\n\n` +
    `🚻 <b>Чистые туалеты (WC):</b>\n` +
    `• ТЦ Promenade (ул. Абая 44) — 1 и 2 этажи, свободный вход.\n` +
    `• ТРЦ Forum (Сейфуллина 617) — просторный, чистый санузел.\n` +
    `• БЦ Bayzak (Абая 52В) — чистый WC на 3 этаже.\n\n` +
    `🔌 <b>Розетки и подзарядка:</b>\n` +
    `• Коворкинги и библиотеки — открытые удлинители и розетки.\n` +
    `• Coffee Moon (Манаса 51) — розетки вдоль диванов.\n\n` +
    `📶 <b>Бесплатный Wi-Fi:</b>\n` +
    `• Coffee Moon Guest (пароль в приложении)\n` +
    `• Открытые высокоскоростные сети в ТЦ.\n\n` +
    `🤫 <b>Тихие зоны:</b>\n` +
    `• Читальные залы библиотек и тихие коворкинги.\n\n` +
    `👇 <i>Все точки с метками на интерактивной карте:</i>`
  );
}

function getCodeInfoMessage() {
  return (
    `🔢 <b>Как работает 4-значный PIN-код:</b>\n\n` +
    `1️⃣ Выберите акцию или комбо в WebApp.\n` +
    `2️⃣ Нажмите <b>«Получить скидку»</b>.\n` +
    `3️⃣ На экране появится крупный <b>4-значный PIN</b> (например, <code>4821</code>) и QR-код.\n` +
    `4️⃣ Покажите экран кассиру или просто назовите 4 цифры.\n` +
    `5️⃣ Кассир введет PIN в свою систему, на экране отобразится зеленая печать <b>«ПОГАШЕНО ✓»</b>, и скидка применится к чеку!\n\n` +
    `⏱️ <i>Код активен в течение непикового окна.</i>`
  );
}

function getCashierMessage() {
  return (
    `💼 <b>Режим кассира и партнера Nooki:</b>\n\n` +
    `В WebApp предусмотрен специальный интерфейс для заведений:\n` +
    `• Быстрая проверка 4-значных PIN-кодов гостей.\n` +
    `• Управление тихими часами (Quiet Hours On/Off).\n` +
    `• Мониторинг выручки и загрузки зала в непиковые часы.\n\n` +
    `Откройте WebApp и переключитесь на роль кассира:`
  );
}

function getAboutMessage() {
  return (
    `⚡ <b>Nooki</b> — единый городской сервис доступа к непиковым слотам заведений.\n\n` +
    `Мы решаем две ключевые задачи:\n` +
    `1. Рестораны получают дополнительный поток гостей в непиковые часы (14:00–16:30).\n` +
    `2. Горожане и студенты экономят до 50% на питании и легко находят розетки, Wi-Fi и санузлы.\n\n` +
    `🌐 Веб-сайт: ${WEBAPP_URL}\n` +
    `🤖 Telegram бот: @Stud_city_bot`
  );
}

function getHelpMessage() {
  return (
    `💡 <b>Команды бота Nooki:</b>\n\n` +
    `/start — Запустить бота и открыть WebApp\n` +
    `/deals — Горящие Flash-слоты со скидками до 50%\n` +
    `/map — Карта городской инфраструктуры\n` +
    `/code — Инструкция по 4-значному PIN кассира\n` +
    `/cashier — Вход для кассиров и партнеров\n` +
    `/help — Справка и контакты\n\n` +
    `📌 <i>Или используйте кнопку «⚡ Nooki» в нижнем левом углу чата!</i>`
  );
}

// Handle incoming messages
async function handleMessage(msg) {
  if (!msg || !msg.chat) return;
  const chatId = msg.chat.id;
  const text = msg.text ? msg.text.trim() : '';
  const firstName = msg.from?.first_name || 'Горожанин';

  console.log(`[Message] от ${firstName} (${chatId}): ${text}`);

  if (text.startsWith('/start')) {
    await sendMessage(chatId, getWelcomeMessage(firstName), getMainKeyboard());
  } else if (text.startsWith('/deals')) {
    await sendMessage(chatId, getDealsMessage(), {
      inline_keyboard: [
        [{ text: '⚡ Открыть скидки в WebApp', web_app: { url: WEBAPP_URL } }],
        [{ text: '« В главное меню', callback_data: 'view_about' }]
      ]
    });
  } else if (text.startsWith('/map')) {
    await sendMessage(chatId, getMapMessage(), {
      inline_keyboard: [
        [{ text: '🗺️ Открыть карту', web_app: { url: WEBAPP_URL } }],
        [{ text: '« В главное меню', callback_data: 'view_about' }]
      ]
    });
  } else if (text.startsWith('/code')) {
    await sendMessage(chatId, getCodeInfoMessage(), {
      inline_keyboard: [
        [{ text: '⚡ Получить PIN в приложении', web_app: { url: WEBAPP_URL } }]
      ]
    });
  } else if (text.startsWith('/cashier')) {
    await sendMessage(chatId, getCashierMessage(), {
      inline_keyboard: [
        [{ text: '💼 Открыть Nooki', web_app: { url: WEBAPP_URL } }]
      ]
    });
  } else if (text.startsWith('/help')) {
    await sendMessage(chatId, getHelpMessage(), {
      inline_keyboard: [
        [{ text: '⚡ Открыть Nooki', web_app: { url: WEBAPP_URL } }]
      ]
    });
  } else {
    // Default reply for any other text
    await sendMessage(chatId, `⚡ Нажмите кнопку ниже, чтобы открыть Nooki:`, getMainKeyboard());
  }
}

// Handle callback queries (inline buttons)
async function handleCallbackQuery(cb) {
  if (!cb || !cb.message) return;
  const chatId = cb.message.chat.id;
  const data = cb.data;

  console.log(`[Callback] ${data} от ${cb.from?.first_name} (${chatId})`);

  if (data === 'view_deals') {
    await sendMessage(chatId, getDealsMessage(), {
      inline_keyboard: [
        [{ text: '⚡ Открыть скидки в WebApp', web_app: { url: WEBAPP_URL } }],
        [{ text: '« В главное меню', callback_data: 'view_about' }]
      ]
    });
  } else if (data === 'view_map') {
    await sendMessage(chatId, getMapMessage(), {
      inline_keyboard: [
        [{ text: '🗺️ Открыть карту', web_app: { url: WEBAPP_URL } }],
        [{ text: '« В главное меню', callback_data: 'view_about' }]
      ]
    });
  } else if (data === 'view_code_info') {
    await sendMessage(chatId, getCodeInfoMessage(), {
      inline_keyboard: [
        [{ text: '⚡ Получить PIN в приложении', web_app: { url: WEBAPP_URL } }]
      ]
    });
  } else if (data === 'view_cashier') {
    await sendMessage(chatId, getCashierMessage(), {
      inline_keyboard: [
        [{ text: '💼 Открыть Nooki', web_app: { url: WEBAPP_URL } }]
      ]
    });
  } else if (data === 'view_about') {
    await sendMessage(chatId, getAboutMessage(), getMainKeyboard());
  }

  await answerCallbackQuery(cb.id);
}

// Long Polling Loop
let offset = 0;
let isRunning = true;

async function pollUpdates() {
  while (isRunning) {
    try {
      const res = await api('getUpdates', {
        offset: offset,
        timeout: 25,
        allowed_updates: ['message', 'callback_query']
      });

      if (res && res.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          offset = update.update_id + 1;
          if (update.message) {
            await handleMessage(update.message);
          } else if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
          }
        }
      }
    } catch (err) {
      console.error('Polling cycle error:', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// Start
async function startBot() {
  console.log(`🚀 Nooki Telegram Bot запущен!`);
  console.log(`📡 URL WebApp: ${WEBAPP_URL}`);
  console.log(`💡 Режим: Long Polling (для локальной отладки)`);
  
  await pollUpdates();
}

startBot().catch(console.error);

process.on('SIGINT', () => {
  console.log('\nОстановка бота Nooki...');
  isRunning = false;
  process.exit(0);
});
