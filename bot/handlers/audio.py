import os
import aiofiles
from aiogram import Router, Bot
from aiogram.types import Message
from aiogram.fsm.context import FSMContext

router = Router()


@router.message(lambda m: m.voice or m.audio)
async def handle_audio(message: Message, bot: Bot, state: FSMContext):
    # Статус обработки
    status_msg = await message.answer("⏳ Получил аудио, обрабатываю...")

    try:
        # Получаем файл
        if message.voice:
            file_id = message.voice.file_id
        else:
            file_id = message.audio.file_id

        file = await bot.get_file(file_id)
        file_path = file.file_path

        # Скачиваем файл
        audio_bytes = await bot.download_file(file_path)

        # Сохраняем временно
        temp_path = f"media/audio/temp_{message.from_user.id}_{file_id[:10]}.ogg"
        os.makedirs("media/audio", exist_ok=True)

        async with aiofiles.open(temp_path, 'wb') as f:
            await f.write(audio_bytes.read())

        await status_msg.edit_text("🔄 Транскрибирую аудио...")

        # Импортируем сервисы Django
        from services.ai_service import process_audio

        result = await process_audio(
            audio_path=temp_path,
            user_telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
        )

        if result["success"]:
            from bot.utils import format_meeting_result
            response_text = format_meeting_result(result["analysis"])
            await status_msg.edit_text(response_text, parse_mode="HTML")

            # Сохраняем meeting_id для возможных уточнений
            await state.update_data(last_meeting_id=result["meeting_id"])
        else:
            await status_msg.edit_text(
                f"❌ Ошибка при обработке: {result['error']}\n\n"
                "Попробуй ещё раз или отправь текст транскрипта."
            )

    except Exception as e:
        await status_msg.edit_text(
            "❌ Что-то пошло не так. Попробуй ещё раз."
        )
        print(repr(e))