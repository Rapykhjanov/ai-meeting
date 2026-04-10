from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

router = Router()


@router.message(Command("start"))
async def cmd_start(message: Message):
    await message.answer(
        "👋 Привет! Я AI Meeting Notes Bot.\n\n"
        "Я помогу превратить запись встречи в структурированные заметки.\n\n"
        "📎 Отправь мне:\n"
        "• Голосовое сообщение\n"
        "• Аудио файл\n"
        "• Текст транскрипта\n\n"
        "И я выдам:\n"
        "✅ Краткое резюме\n"
        "✅ Ключевые решения\n"
        "✅ Задачи с ответственными\n"
        "✅ Темы встречи\n\n"
        "Используй /help для списка команд."
    )


@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "📋 Команды:\n\n"
        "/start — начало работы\n"
        "/help — список команд\n\n"
        "После получения результата ты можешь написать:\n"
        "• <b>сделай короче</b> — краткая версия\n"
        "• <b>только задачи</b> — только action items\n"
        "• <b>более формально</b> — формальный стиль\n",
        parse_mode="HTML"
    )