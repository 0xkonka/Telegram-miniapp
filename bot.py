import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, CallbackContext, ContextTypes
import os
from dotenv import load_dotenv
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import asyncio

app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "https://telegram-mini-app-kappa.vercel.app"}})
CORS(app)

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
# Ceate bot instance
application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
# Global User Id
gUserId = 0

def fetch_user_status(user_id):
    url = f'https://be-express-lime.vercel.app/api/telegram/status/{user_id}'
    headers = {
        'Authorization': f'Bearer {TG_API_BEARER_TOKEN}',
    }
    response = requests.get(url, headers=headers)
    return response.json()


@app.route('/get-test', methods=['GET'])
def getTest():
    return "abcde"

@app.route('/referral-success', methods=['POST'])
async def referral_success():
    data = request.get_json()
    reference_id = data.get("reference_id", 0)
    if reference_id == 0:
        return jsonify({"status": "fail"}), 400
    
    user_chat_id = reference_id
    message_text = "You’ve earned 2,000 points through a successful referral.\n\nYour friend has also received 2,000 points. Keep up the good work!"

    # Constructing the inline keyboard markup
    TASK_WEB_APP_URL_REFER = 'https://telegram-mini-app-kappa.vercel.app/refer.html'
    keyboard = [
        [InlineKeyboardButton("→ Refer more friends", web_app=WebAppInfo(url=TASK_WEB_APP_URL_REFER))],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    # Sending message with inline keyboard
    try:
        await application.bot.send_message(chat_id=user_chat_id, text=message_text, reply_markup=reply_markup)
        await asyncio.sleep(5)
        return jsonify({"status": "success"}), 200
    except requests.RequestException as e:
        logger.error(f"Error fetching user status: {e}")
        return {"result": False}


@app.route('/referral-bonus', methods=['POST'])
async def referral_bonus():
    data = request.get_json()
    reference_id = data.get("reference_id", 0)
    message = data.get("message", "Congrats Bonus")
    if reference_id == 0:
        return jsonify({"status": "fail"}), 400
    
    user_chat_id = reference_id
    message_text = message

    # Constructing the inline keyboard markup
    TASK_WEB_APP_URL_REFER = 'https://telegram-mini-app-kappa.vercel.app/refer.html'
    keyboard = [
        [InlineKeyboardButton("→ Refer more friends", web_app=WebAppInfo(url=TASK_WEB_APP_URL_REFER))],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    # Sending message with inline keyboard
    await application.bot.send_message(chat_id=user_chat_id, text=message_text, reply_markup=reply_markup)
    await asyncio.sleep(5)
    return jsonify({"status": "success"}), 200


@app.route('/completed-farming', methods=['POST'])
async def completedFarming():
    message_text = "Congrats!\n\nYou’ve earned 200 points by farming. Head to the app to claim."

    # Constructing the inline keyboard markup
    TASK_WEB_APP_URL_FARM = 'https://telegram-mini-app-kappa.vercel.app/farm.html'
    keyboard = [
        [InlineKeyboardButton("→ Claim tokens", web_app=WebAppInfo(url=TASK_WEB_APP_URL_FARM))],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    # Sending message with inline keyboard
    global gUserId
    await application.bot.send_message(chat_id=gUserId , text=message_text, reply_markup=reply_markup)
    await asyncio.sleep(5)
    return jsonify({"status": "success"}), 200


@app.route('/sendData', methods=['POST'])
async def receive_data():
    data = request.get_json()
    # Process the received data here
    message_text = data.get("message", "Hey, You received test notification from TG Mini App")

    # Send the message asynchronously using the global application instance
    user_chat_id = 5040516536  # Assuming user_id is the chat ID where we want to send the message
    await application.bot.send_message(chat_id=user_chat_id, text=message_text)
    return jsonify({"status": "success"}), 200

    # return "success"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    args = context.args
    referralId = ''
    if args:
        referralId = args[0]
    user = update.message.from_user
    global gUserId
    gUserId = user.id
    """Send a message when the command /start is issued."""
    
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
    flask_thread = Thread(target=lambda: app.run(host='0.0.0.0', port=5000))
    flask_thread.start()
    asyncio.run(main())
