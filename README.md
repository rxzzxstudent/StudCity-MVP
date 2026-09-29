# StudCity-MVP — Nooki ⚡

> **Nooki** — единый городской сервис смарт-доступа к непиковым слотам локального бизнеса со скидками до 50% и бесплатная интерактивная карта городской инфраструктуры (Wi-Fi, розетки, проверенные санузлы).

---

## 🏛️ Архитектура экосистемы

- **Web-приложение / Telegram Mini App:** Next.js 14 App Router, Tailwind CSS, Leaflet Maps, Lucide Icons, QR/PIN генерация.
- **Telegram Bot (Serverless):** Развернут прямо внутри Next.js (`/api/bot` и `/api/webhook`), работает через Webhook на Vercel (полный Zero-Backend без необходимости отдельного VPS/сервера).
- **Деплоймент:** Vercel (Hobby / Free Tier).

---

## 🚀 Быстрый старт и запуск

### 1. Установка зависимостей
```bash
cd Nooki
npm install
```

### 2. Запуск локального сервера разработки
```bash
npm run dev
```
Приложение доступно по адресу `http://localhost:3000`.

### 3. Сборка и проверка проекта
```bash
npm run build
# или
npm run validate
```

---

## 🤖 Настройка Telegram-бота через Vercel Webhook

Бот работает бессерверно через Vercel Route Handler `/api/bot`.

### 1. Переменные окружения на Vercel
В панели управления проектом на Vercel добавьте следующие переменные:
- `BOT_TOKEN` — токен вашего Telegram бота от [@BotFather](https://t.me/BotFather).
- `WEBAPP_URL` — ссылка на развернутый проект Vercel (например, `https://nooki.vercel.app` или ваш домен).

### 2. Регистрация Webhook в Telegram
После деплоя на Vercel зарегистрируйте Webhook одной командой:
```bash
node Nooki/scripts/setup-webhook.mjs <BOT_TOKEN> https://ваш-домен.vercel.app
```
Скрипт автоматически:
- Привяжет Webhook к `https://ваш-домен.vercel.app/api/bot`
- Настроит кнопку меню Telegram WebApp (`⚡ Nooki`)
- Установит список команд (`/start`, `/deals`, `/map`, `/code`, `/cashier`, `/help`)
- Обновит описание бота в Telegram.
