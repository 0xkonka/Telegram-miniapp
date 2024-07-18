from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, CallbackContext, ContextTypes
import os
from dotenv import load_dotenv
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import nest_asyncio
nest_asyncio.apply()

app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "https://miniapp.tren.finance"}})
CORS(app)

# Load environment variables
load_dotenv()

# Telegram bot token
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TG_API_BEARER_TOKEN = os.getenv('TG_API_BEARER_TOKEN')
# Ceate bot instance
application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

def fetch_user_status(user_id):
    url = f'https://be-express-lime.vercel.app/api/telegram/status/{user_id}'
    headers = {
        # 'Authorization': f'Bearer {TG_API_BEARER_TOKEN}',
    }
    response = requests.get(url, headers=headers)
    return response.json()

# @app.route('/get-test', methods=['GET'])
# def getTest():
#     return "abcde"

@app.route('/referral-success', methods=['POST'])
async def referral_success():
    data = request.get_json()
    reference_id = data.get("reference_id", 0)
    if reference_id == 0:
        return jsonify({"status": "fail"}), 400
    
    user_chat_id = reference_id

    # Sending Referral Success 2000 point bonus notification
    message_text = "You’ve earned 2,000 points through a successful referral.\n\nYour friend has also received 2,000 points. Keep up the good work!"
    
    TASK_WEB_APP_URL_REFER = 'https://miniapp.tren.finance/refer.html'
    keyboard = [
        [InlineKeyboardButton("→ Refer more friends", web_app=WebAppInfo(url=TASK_WEB_APP_URL_REFER))],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await application.bot.send_message(chat_id=user_chat_id, text=message_text, reply_markup=reply_markup)
    # await asyncio.sleep(2)

    #  Sending referral bonus for 5, 10, 25 friends
    bounsPoints = 0
    status_response = fetch_user_status(reference_id)
    referral_count = len(status_response['data']['referrers'])
    if referral_count == 5:
        bounsPoints = 2500
    elif referral_count == 10:
        bounsPoints = 5000
    elif referral_count == 25:
        bounsPoints = 12500

    if bounsPoints != 0:
        bonus_message = f"You’ve got a {bounsPoints:,} points bonus by successfully referring {referral_count} people. Keep up the good work!"
        await application.bot.send_message(chat_id=user_chat_id, text=bonus_message, reply_markup=reply_markup)
        # await asyncio.sleep(5)

    return jsonify({"status": "You have succesfully received bonus"}), 200


@app.route('/completed-farming', methods=['POST'])
async def completedFarming():
    data = request.get_json()
    user_id = data.get("user_id", 0)
    if user_id == 0:
        return jsonify({"status": "fail"}), 400

    message_text = "Congrats!\n\nYou’ve earned 200 points by farming. Head over to the app to start farming again."

    # Constructing the inline keyboard markup
    TASK_WEB_APP_URL_FARM = 'https://miniapp.tren.finance/farm.html'
    keyboard = [
        [InlineKeyboardButton("→ Start Farming", web_app=WebAppInfo(url=TASK_WEB_APP_URL_FARM))],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    # Sending message with inline keyboard
    
    await application.bot.send_message(chat_id=user_id , text=message_text, reply_markup=reply_markup)
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
    """Send a message when the command /start is issued."""
    
    # Call the external API to get user status
    status_response = fetch_user_status(user.id)
    if status_response['result']:
        TASK_WEB_APP_URL_EXTENDED = f'https://miniapp.tren.finance/farm.html?referralId={referralId}'
    else:
        TASK_WEB_APP_URL_EXTENDED = f'https://miniapp.tren.finance/?referralId={referralId}'

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
