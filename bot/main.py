import asyncio
import os
import django
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / '.env')

sys.path.append(str(Path(__file__).resolve().parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from bot.handlers import commands, audio, text
from services.reminder_service import reminder_loop

TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')


async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher(storage=MemoryStorage())

    dp.include_router(commands.router)
    dp.include_router(audio.router)
    dp.include_router(text.router)

    print("Bot started...")

    # Запускаем напоминания параллельно с ботом
    await asyncio.gather(
        dp.start_polling(bot),
        reminder_loop(bot)
    )


if __name__ == '__main__':
    asyncio.run(main())