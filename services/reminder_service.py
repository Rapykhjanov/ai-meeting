import asyncio
import os
from datetime import date, timedelta
from dotenv import load_dotenv

load_dotenv()


async def send_reminders(bot):
    from meetings.models import ActionItem

    tomorrow = date.today() + timedelta(days=1)

    # Находим задачи с дедлайном завтра которые не выполнены
    items = ActionItem.objects.filter(
        deadline=tomorrow,
        status__in=['todo', 'in_progress']
    ).select_related('meeting__user')

    for item in items:
        user = item.meeting.user
        if not user.telegram_id:
            continue

        text = (
            f"⏰ <b>Напоминание о задаче</b>\n\n"
            f"Завтра дедлайн:\n"
            f"<b>{item.text}</b>\n\n"
            f"Встреча: {item.meeting.title}\n"
            f"Статус: {item.get_status_display()}\n\n"
            f"Не забудь выполнить вовремя!"
        )

        try:
            await bot.send_message(
                chat_id=user.telegram_id,
                text=text,
                parse_mode="HTML"
            )
        except Exception as e:
            print(repr(e))


async def reminder_loop(bot):
    while True:
        try:
            await send_reminders(bot)
        except Exception as e:
            print(repr(e))

        await asyncio.sleep(6 * 60 * 60)
