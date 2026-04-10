from aiogram import Router
from aiogram.types import Message
from aiogram.fsm.context import FSMContext

router = Router()

ADJUST_COMMANDS = {
    "сделай короче": "shorter",
    "только задачи": "tasks_only",
    "более формально": "formal",
}


@router.message(lambda m: m.text and not m.text.startswith("/"))
async def handle_text(message: Message, state: FSMContext):
    text = message.text.lower().strip()

    # Проверяем команды уточнения
    if text in ADJUST_COMMANDS:
        data = await state.get_data()
        meeting_id = data.get("last_meeting_id")

        if not meeting_id:
            await message.answer(
                "⚠️ Сначала отправь аудио или текст встречи."
            )
            return

        status_msg = await message.answer("🔄 Обновляю результат...")

        try:
            from services.ai_service import adjust_analysis
            result = await adjust_analysis(
                meeting_id=meeting_id,
                adjustment=ADJUST_COMMANDS[text]
            )

            if result["success"]:
                from bot.utils import format_meeting_result
                response_text = format_meeting_result(result["analysis"])
                await status_msg.edit_text(response_text, parse_mode="HTML")
            else:
                await status_msg.edit_text("❌ Не удалось обновить. Попробуй ещё раз.")
        except Exception as e:
            await status_msg.edit_text("❌ Ошибка. Попробуй ещё раз.")
            print(repr(e))
        return

    # Обычный текст — обрабатываем как транскрипт
    if len(text) < 50:
        await message.answer(
            "⚠️ Текст слишком короткий.\n\n"
            "Отправь полный транскрипт встречи или голосовое сообщение."
        )
        return

    status_msg = await message.answer("Analyzing...")

    try:
        from services.ai_service import process_text

        result = await process_text(
            transcript=message.text,
            user_telegram_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
        )

        if result["success"]:
            from bot.utils import format_meeting_result
            response_text = format_meeting_result(result["analysis"])
            await status_msg.edit_text(response_text, parse_mode="HTML")
            await state.update_data(last_meeting_id=result["meeting_id"])
        else:
            await status_msg.edit_text(
                f"❌ Ошибка: {result['error']}"
            )

    except Exception as e:
        await status_msg.edit_text("❌ Что-то пошло не так. Попробуй ещё раз.")
        print(repr(e))