/**
 * Nooki Telegram Bot Setup & Webhook Registration Script
 * 
 * Usage:
 *   node scripts/setup-webhook.mjs [BOT_TOKEN] [VERCEL_URL]
 *   or with environment variables:
 *   BOT_TOKEN=... WEBHOOK_URL=https://.../api/bot node scripts/setup-webhook.mjs
 */

const token = process.argv[2] || process.env.BOT_TOKEN;
const rawUrl = process.argv[3] || process.env.WEBHOOK_URL || process.env.WEBAPP_URL || 'https://stud-city.vercel.app';

if (!token) {
  console.error('❌ Ошибка: Не указан BOT_TOKEN.');
  console.error('Пример запуска: node scripts/setup-webhook.mjs <ВАШ_ТОКЕН> https://ваш-домен.vercel.app');
  process.exit(1);
}

const baseUrl = rawUrl.replace(/\/+$/, '');
const webhookUrl = baseUrl.endsWith('/api/bot') || baseUrl.endsWith('/api/webhook')
  ? baseUrl
  : `${baseUrl}/api/bot`;
const webAppUrl = baseUrl.endsWith('/api/bot') || baseUrl.endsWith('/api/webhook')
  ? baseUrl.replace(/\/api\/(bot|webhook)$/, '')
  : baseUrl;

const TELEGRAM_API = `https://api.telegram.org/bot${token}`;

async function callTg(method, body = {}) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function main() {
  console.log('🚀 Настройка Telegram-бота Nooki на Vercel...');
  console.log(`📡 Webhook URL: ${webhookUrl}`);
  console.log(`🌐 WebApp URL:  ${webAppUrl}\n`);

  // 1. Register Webhook
  console.log('1. Регистрация Webhook...');
  const webhookRes = await callTg('setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });
  console.log('   Результат setWebhook:', webhookRes);

  // 2. Set Menu Button
  console.log('2. Установка кнопки меню (Web App)...');
  const menuRes = await callTg('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '⚡ Nooki',
      web_app: { url: webAppUrl },
    },
  });
  console.log('   Результат setChatMenuButton:', menuRes);

  // 3. Set Bot Commands
  console.log('3. Установка списка команд бота...');
  const cmdRes = await callTg('setMyCommands', {
    commands: [
      { command: 'start', description: '⚡ Открыть Nooki WebApp' },
      { command: 'deals', description: '🔥 Непиковые слоты и комбо со скидкой' },
      { command: 'map', description: '🗺️ Карта городской инфраструктуры (Wi-Fi, WC)' },
      { command: 'code', description: '🔢 Инструкция по 4-значному PIN' },
      { command: 'cashier', description: '💼 Режим кассира / партнера' },
      { command: 'help', description: 'ℹ️ Справка и возможности Nooki' },
    ],
  });
  console.log('   Результат setMyCommands:', cmdRes);

  // 4. Set Description
  console.log('4. Обновление описания бота...');
  const descRes = await callTg('setMyDescription', {
    description:
      '⚡ Nooki — единый городской сервис смарт-доступа к непиковым слотам заведений (ланчи, спорт, бьюти со скидкой до 50%) и бесплатная карта городской инфраструктуры (Wi-Fi, розетки, чистые санузлы).',
  });
  console.log('   Результат setMyDescription:', descRes);

  // 5. Set Short Description
  console.log('5. Обновление краткого описания...');
  const shortDescRes = await callTg('setMyShortDescription', {
    short_description: '⚡ Смарт-доступ к непиковым слотам заведений + Карта инфраструктуры города',
  });
  console.log('   Результат setMyShortDescription:', shortDescRes);

  // 6. Get Webhook Info verification
  console.log('\n🔍 Проверка статуса Webhook...');
  const infoRes = await callTg('getWebhookInfo');
  console.log('   Webhook Info:', infoRes);

  console.log('\n🎉 Бот Nooki успешно настроен и подключен к Vercel Webhook!');
}

main().catch(console.error);
