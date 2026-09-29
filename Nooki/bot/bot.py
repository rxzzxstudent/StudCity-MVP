"""
Nooki Telegram Bot (Python Version)
Standalone runner / Webhook support for Nooki (https://stud-city.vercel.app/)
"""

import os
import sys
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes

BOT_TOKEN = os.getenv("BOT_TOKEN", "8799330353:AAE9byJyPWDOQQC-q8XtMVUBrzmPzbpnU5g")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://stud-city.vercel.app/")

def get_main_keyboard():
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("⚡ Открыть Nooki WebApp", web_app=WebAppInfo(url=WEBAPP_URL))
        ],
        [
            InlineKeyboardButton("🔥 Непиковые слоты", callback_data="view_deals"),
            InlineKeyboardButton("🗺️ Карта инфраструктуры", callback_data="view_map")
        ],
        [
            InlineKeyboardButton("🔢 4-значный PIN", callback_data="view_code"),
            InlineKeyboardButton("💼 Режим кассира", callback_data="view_cashier")
        ]
    ])

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_name = update.effective_user.first_name if update.effective_user else "Горожанин"
    text = (
        f"👋 <b>Привет, {user_name}!</b>\n\n"
        f"⚡ Добро пожаловать в <b>Nooki</b> — единый городской сервис смарт-доступа к непиковым слотам и инфраструктуре города!\n\n"
        f"📱 <b>3 главных экрана:</b>\n"
        f"1️⃣ <b>Лента непиковых слотов:</b> Скидки до 50% с живым таймером и счетчиком остатка.\n"
        f"2️⃣ <b>Карта инфраструктуры:</b> Розетки, Wi-Fi, чистые санузлы и тихие зоны.\n"
        f"3️⃣ <b>Экран погашения:</b> 4-значный PIN кассира для моментальной скидки за 3 секунды.\n\n"
        f"Нажми кнопку ниже, чтобы открыть Nooki прямо в Telegram:"
    )
    await update.message.reply_html(text, reply_markup=get_main_keyboard())

async def deals(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "🔥 <b>Горящие слоты в «тихие часы» (14:00–16:30):</b>\n\n"
        "☕ <b>Coffee Moon — Cafe & Wine</b> (ул. Манаса, 51)\n"
        "🎁 Лимонад/айс-ти в подарок к любому блюду (-40%)\n\n"
        "💻 <b>Smart Service</b> (БЦ Bayzak, Абая 52В)\n"
        "🔧 Скидка 10-20% на ремонт ноутбуков и сервис ПК\n\n"
        "🥞 <b>De Tulp Dutch Pancakes</b> (Зеленый Базар)\n"
        "🥞 Скидки на панкейки и комбо"
    )
    await update.message.reply_html(text, reply_markup=get_main_keyboard())

async def map_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "🗺️ <b>Карта городской инфраструктуры Nooki:</b>\n\n"
        "🚻 Чистые туалеты (Promenade, Forum, Bayzak)\n"
        "🔌 Розетки (Библиотеки, Coffee Moon, Коворкинги)\n"
        "📶 Быстрый бесплатный Wi-Fi\n"
        "🤫 Тихие зоны для работы и учебы"
    )
    await update.message.reply_html(text, reply_markup=get_main_keyboard())

def main():
    if not BOT_TOKEN:
        print("Ошибка: BOT_TOKEN не указан!")
        sys.exit(1)

    print(f"Запуск Nooki бота ({WEBAPP_URL})...")
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("deals", deals))
    app.add_handler(CommandHandler("map", map_command))

    app.run_polling()

if __name__ == "__main__":
    main()
