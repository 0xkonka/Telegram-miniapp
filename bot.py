import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, CallbackContext, ContextTypes
import os
from dotenv import load_dotenv
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS 
import asyncio

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://telegram-mini-app-kappa.vercel.app"}})

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Telegram bot token
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TG_API_BEARER_TOKEN = os.getenv('TG_API_BEARER_TOKEN')
application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

def fetch_user_status(user_id):
    url = f'https://be-express-lime.vercel.app/api/telegram/status/{user_id}'
    headers = {
        'Authorization': f'Bearer {TG_API_BEARER_TOKEN}',
    }
    response = requests.get(url, headers=headers)
    return response.json()

@app.route('/sendData', methods=['POST'])
async def receive_data():
    data = request.get_json()
    # Process the received data here
    message_text = data.get("message", "Hey, You received test notification from TG Mini App")
    
    # Send the message asynchronously using the global application instance
    async with application:
        user_chat_id = 5040516536  # Assuming user_id is the chat ID where we want to send the message
        await application.bot.send_message(chat_id=user_chat_id, text=message_text)
    return jsonify({"status": "success"}), 200

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    args = context.args
    referralId = ''
    if args:
        referralId = args[0]
        # await update.message.reply_text('Hello!')

    """Send a message when the command /start is issued."""
    # logger.info("Referral ID: %s", referral_id)
    user = update.message.from_user
    user_name = user.username
    
    # Call the external API to get user status
    status_response = fetch_user_status(user.id)
    if status_response['result']:
        TASK_WEB_APP_URL_EXTENDED = f'https://telegram-mini-app-kappa.vercel.app/farm.html?referralId={referralId}'
    else:
        TASK_WEB_APP_URL_EXTENDED = f'https://telegram-mini-app-kappa.vercel.app/?referralId={referralId}'

    # Description and banner (placeholder)
    description = f"Welcome to Tren Finance!\n\nStart farming points as an early adopter.\n\nFor every friend you refer, you both get 2,000 bonus points.\n\nHit the button below to start the app."

    # Main menu buttons
    keyboard = [
        [InlineKeyboardButton("→ Launch App", web_app=WebAppInfo(url=TASK_WEB_APP_URL_EXTENDED))],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(description, reply_markup=reply_markup)


def main() -> None:
    """Start the bot."""
    # application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.run_polling()


if __name__ == '__main__':
    from threading import Thread
    flask_thread = Thread(target=lambda: app.run(host='0.0.0.0', port=80))
    flask_thread.start()
    main()
