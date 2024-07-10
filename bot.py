import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, CallbackContext, ContextTypes
import os
from dotenv import load_dotenv
import requests

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

def fetch_user_status(user_id):
    url = f'https://be-express-lime.vercel.app/api/telegram/status/{user_id}'
    headers = {
        'Authorization': f'Bearer {TG_API_BEARER_TOKEN}',
    }
    response = requests.get(url, headers=headers)
    return response.json()

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


def handle_webapp_data(update: Update, context: CallbackContext):
    query = update.callback_query
    data = query.data  # This will contain the JSON data sent from the mini app
    context.bot.answerCallbackQuery(query.id, text=f"Received data: {data}")


# async def learn(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:

#     """Send a message when the command /learn is issued."""
    
#     description = f"Tren Finance is unlocking liquidity for the long tail of crypto.\nBorrow trenUSD. Leverage up to 30x using over 100+ tokens."

#     keyboard = [
#         [
#             InlineKeyboardButton("Testnet", url='https://testnet.tren.finance'),
#             InlineKeyboardButton("Website", url='https://tren.finance')
#         ],
#         [
#             InlineKeyboardButton("Docs", url='https://docs.tren.finance'),
#             InlineKeyboardButton("Twitter", url='https://x.com/TrenFinance'),
#         ],
#         [
#             InlineKeyboardButton("Discord", url='https://discord.com/invite/trenfinance'),
#             InlineKeyboardButton("Telegram", url='https://t.me/trenfinance'),
#         ],
#     ]
#     reply_markup = InlineKeyboardMarkup(keyboard)

#     await update.message.reply_text(description, reply_markup=reply_markup)

def main() -> None:
    """Start the bot."""
    application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    # application.add_handler(CommandHandler("learn", learn))
    data_handler = CallbackQueryHandler(handle_webapp_data)
    application.add_handler(data_handler)
    application.run_polling()


if __name__ == '__main__':
    main()
