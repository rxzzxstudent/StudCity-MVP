# Nooki — Сервис смарт-доступа к непиковым слотам и инфраструктуре города

[![Next.js](https://img.shields.io/badge/Next.js-14.2_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Vanilla_Styled-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ecf8e?logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Zero_Backend_Deploy-black?logo=vercel)](https://vercel.com/)
[![Telegram](https://img.shields.io/badge/Telegram_Bot-wn__nooki__bot-229ED9?logo=telegram)](https://t.me/wn_nooki_bot)

- Веб-сайт: https://studcitymvpproject.vercel.app/
- Telegram-бот: https://t.me/wn_nooki_bot

---

## Ребрендинг: StudCity в Nooki

Проект масштабирован из локального университетского концепта **StudCity** в общегородскую платформу **Nooki** для всех жителей и заведений Алматы. 

Сервис решает две задачи:
1. **Для жителей Алматы (B2C):** Постоянные скидки до 50% на фиксированные комбо в дневные «тихие часы» заведений + бесплатная карта городской инфраструктуры (проверенные санузлы, розетки для зарядки, быстрый Wi-Fi).
2. **Для локального бизнеса (B2B):** Заполнение пустующих залов в непик через ограниченные квоты (Smart Cap) без размытия среднего чека и без установки сложного софта на кассы.

---

## Реализованные функции

### Для пользователей (B2C)
- **Каталог слотов:** Предложения кафе, залов и услуг с таймером действия тихих часов и счетчиком оставшихся мест.
- **Быстрый 4-значный PIN:** Генерация кода со сроком жизни 5 минут (300 сек) без привязки банковских карт.
- **Карта инфраструктуры:** Фильтры по санузлам, свободным розеткам, Wi-Fi, тихим местам для работы и заведениям со скидками.
- **PWA и Telegram Mini App:** Адаптивный веб-интерфейс для ПК, смартфонов и внутри Telegram.

### Для бизнеса (B2B)
- **Веб-касса:** Погашение 4-значного PIN-кода гостя за 3 секунды без интеграции с 1С/iiko.
- **Конструктор скидки:** Управление скидкой (10–60%), суточным лимитом мест (5–50) и временем тихих часов с интерактивным превью.
- **Тумблер акции:** Моментальное отключение предложения одной кнопкой при наплыве постоянных гостей.
- **Безопасность и роли:** Касса доступна только бизнес-аккаунтам. Партнерам заблокировано оформление клиентских скидок для защиты от накрутки.

---

## Стек технологий

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **Карты:** Leaflet, OpenStreetMap (динамическая подгрузка без тяжелых библиотек).
- **База данных и Auth:** Supabase (PostgreSQL, GoTrue, Row Level Security).
- **Серверная часть и деплой:** Vercel Serverless Route Handlers (Zero-Backend, обработка вебхуков Telegram-бота).

---

## Использованные AI-инструменты

- **Google DeepMind Antigravity AI IDE:** Проектирование клиентской архитектуры состояния, устранение конфликтов таймеров и оптимизация бандла до 180 КБ First Load JS под лимиты Vercel Free Tier.
- **Claude 3.5 Sonnet / Gemini Pro:** Проектирование TypeScript-интерфейсов, разработка SQL-схемы с RLS-политиками для Supabase, генерация продуктовых B2B/B2C сценариев.
- **AI-генерация графики:** Векторная айдентика Nooki Loop (SVG) и оптимизация статики в WebP.
