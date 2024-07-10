import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes
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
    # start_param = context.args[0] if context.args else None
    # if start_param:
    #     update.message.reply_text(f'User invited with parameter: {start_param}')
    # else:
    #     update.message.reply_text('Hello!')
    args = context.args
    referralId = ''
    if args:
        referralId = args[0]
        await update.message.reply_text('Hello!')

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
    description = f"Hey there, {user_name}!\nWelcome To Tren Finance!\n\n👋🏻 Farm Tren Points before the launch of Mainnet to get a head start. \n👯 Got friends? Invite them! Spread the fun and multiply your points together. \n\nThat’s all you need to know to get started. ⬇️"

    # Main menu buttons
    keyboard = [
        [InlineKeyboardButton("💰 Open App", web_app=WebAppInfo(url=TASK_WEB_APP_URL_EXTENDED))],
        [
            InlineKeyboardButton("Join Chat", url='https://t.me/trenfinance'),
            InlineKeyboardButton("Discord", url='https://discord.com/invite/trenfinance')
        ],
        [
            InlineKeyboardButton("Twitter", url='https://twitter.com/TrenFinance'),
            InlineKeyboardButton("Linkedin", url='https://www.linkedin.com/company/tren-finance/'),
        ],
        [
            InlineKeyboardButton("News", url='https://blog.tren.finance/'),
            InlineKeyboardButton("Learn More", url='https://docs.tren.finance/'),
        ],
        [InlineKeyboardButton("📨 Invite Friends", switch_inline_query="Check out TREN App! Complete social tasks, earn, and have a blast! 🚀 [Join now] (https://t.me/trenfinance_bot)")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(description, reply_markup=reply_markup)


def main() -> None:
    """Start the bot."""
    application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.run_polling()


if __name__ == '__main__':
    main()
