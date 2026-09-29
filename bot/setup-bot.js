const BOT_TOKEN = process.env.BOT_TOKEN || '8799330353:AAE9byJyPWDOQQC-q8XtMVUBrzmPzbpnU5g';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://stud-city.vercel.app/';

async function setup() {
  console.log('Настройка бота Nooki...');

  // 1. Set Menu Button
  const menuRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      menu_button: {
        type: 'web_app',
        text: '⚡ Nooki',
        web_app: { url: WEBAPP_URL }
      }
    })
  }).then(r => r.json());
  console.log('1. setChatMenuButton:', menuRes);

  // 2. Set Commands
  const cmdRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commands: [
        { command: 'start', description: '⚡ Открыть Nooki WebApp' },
        { command: 'deals', description: '🔥 Непиковые слоты и скидки' },
        { command: 'map', description: '🗺️ Карта Wi-Fi, розеток и WC' },
        { command: 'code', description: '🔢 Инструкция по 4-значному PIN' },
        { command: 'cashier', description: '💼 Режим кассира' },
        { command: 'help', description: 'ℹ️ Помощь и информация' }
      ]
    })
  }).then(r => r.json());
  console.log('2. setMyCommands:', cmdRes);

  // 3. Set Description
  const descRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyDescription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: '⚡ Nooki — единый городской сервис смарт-доступа к непиковым слотам заведений (ланчи, спорт, бьюти со скидкой до 50%) и бесплатная карта городской инфраструктуры (Wi-Fi, розетки, чистые санузлы).'
    })
  }).then(r => r.json());
  console.log('3. setMyDescription:', descRes);

  // 4. Set Short Description
  const shortDescRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyShortDescription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      short_description: '⚡ Смарт-доступ к непиковым слотам + Карта города (Wi-Fi, розетки, WC)'
    })
  }).then(r => r.json());
  console.log('4. setMyShortDescription:', shortDescRes);

  console.log('\n✅ Настройки Telegram бота успешно обновлены!');
}

setup().catch(console.error);
