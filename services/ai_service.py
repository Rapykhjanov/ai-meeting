import os
import json
import asyncio
from dotenv import load_dotenv
from asgiref.sync import sync_to_async

load_dotenv()

MOCK_MODE = True  # Поменяй на False когда пополнишь баланс OpenAI

try:
    from openai import OpenAI

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception:
    client = None

ANALYSIS_PROMPT = """
    Ты — помощник для анализа встреч. Проанализируй транскрипт встречи и верни результат СТРОГО в JSON формате.
    
    Верни ТОЛЬКО JSON без каких-либо пояснений, без markdown, без json.
    
    Формат ответа:
    {
        "title": "Краткое название встречи (5-7 слов)",
        "summary": "Краткое резюме встречи в 3-5 предложениях",
        "topics": ["тема 1", "тема 2", "тема 3"],
        "decisions": ["решение 1", "решение 2"],
        "action_items": [
            {
                "text": "Что нужно сделать",
                "assignee": "Имя ответственного или null",
                "deadline": "YYYY-MM-DD или null"
            }
        ]
    }
    
    Транскрипт встречи:
    """

ADJUST_PROMPTS = {
    "shorter": "Make the meeting summary shorter, maximum 2 sentences. Keep everything else.",
    "tasks_only": "Return only action_items. Make summary empty.",
    "formal": "Rewrite everything in formal business style.",
}


def get_mock_analysis() -> dict:
    return {
        "title": "Product Launch Meeting",
        "summary": "The team discussed the new product launch. Assigned responsibilities and deadlines. Decided to use React for frontend and Django for backend.",
        "topics": ["Product Launch", "Task Assignment", "Tech Stack"],
        "decisions": [
            "Use React for frontend",
            "Launch scheduled for Friday",
            "Weekly meetings on Mondays"
        ],
        "action_items": [
            {
                "text": "Develop frontend",
                "assignee": "Ivan",
                "deadline": "2026-04-15"
            },
            {
                "text": "Prepare client presentation",
                "assignee": "Maria",
                "deadline": "2026-04-14"
            },
            {
                "text": "Set up server",
                "assignee": "Alexey",
                "deadline": "2026-04-13"
            }
        ]
    }


def transcribe_audio(audio_path: str) -> str:
    if MOCK_MODE:
        return "This is a mock transcript for testing purposes."

    file_size = os.path.getsize(audio_path)
    max_size = 25 * 1024 * 1024

    if file_size <= max_size:
        with open(audio_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="ru"
            )
        return transcript.text
    else:
        return transcribe_long_audio(audio_path)


def transcribe_long_audio(audio_path: str) -> str:
    try:
        from pydub import AudioSegment
    except ImportError:
        raise Exception("pydub not installed. Run: pip install pydub")

    audio = AudioSegment.from_file(audio_path)
    chunk_length = 10 * 60 * 1000
    chunks = [audio[i:i + chunk_length] for i in range(0, len(audio), chunk_length)]

    transcripts = []
    temp_dir = "media/audio/chunks"
    os.makedirs(temp_dir, exist_ok=True)

    for i, chunk in enumerate(chunks):
        chunk_path = f"{temp_dir}/chunk_{i}.mp3"
        chunk.export(chunk_path, format="mp3")
        with open(chunk_path, "rb") as f:
            result = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language="ru"
            )
        transcripts.append(result.text)
        os.remove(chunk_path)

    return " ".join(transcripts)


def analyze_transcript(transcript: str) -> dict:
    if MOCK_MODE:
        return get_mock_analysis()

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": ANALYSIS_PROMPT + transcript
            }
        ],
        temperature=0.3,
        max_tokens=2000,
    )

    raw_text = response.choices[0].message.content.strip()

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            result = {
                "title": "Meeting",
                "summary": raw_text,
                "topics": [],
                "decisions": [],
                "action_items": []
            }

    return result


@sync_to_async
def get_or_create_user_async(telegram_id: int, username: str, first_name: str):
    from meetings.models import TelegramUser
    user, created = TelegramUser.objects.get_or_create(
        telegram_id=telegram_id,
        defaults={
            "username": username or "",
            "first_name": first_name or "",
        }
    )
    return user


@sync_to_async
def save_meeting_async(user, transcript: str, analysis: dict, source_type: str, audio_path: str = None):
    from meetings.models import Meeting, MeetingAnalysis, ActionItem, Decision

    meeting = Meeting.objects.create(
        user=user,
        title=analysis.get("title", "Meeting"),
        transcript=transcript,
        source_type=source_type,
        status="done",
    )

    if audio_path and os.path.exists(audio_path):
        from django.core.files import File
        with open(audio_path, "rb") as f:
            meeting.audio_file.save(
                os.path.basename(audio_path),
                File(f),
                save=True
            )

    MeetingAnalysis.objects.create(
        meeting=meeting,
        summary=analysis.get("summary", ""),
        decisions=analysis.get("decisions", []),
        topics=analysis.get("topics", []),
        raw_response=analysis,
    )

    for item in analysis.get("action_items", []):
        ActionItem.objects.create(
            meeting=meeting,
            text=item.get("text", ""),
            assignee=item.get("assignee"),
            deadline=item.get("deadline"),
            status="todo",
        )

    for decision in analysis.get("decisions", []):
        Decision.objects.create(
            meeting=meeting,
            text=decision,
        )

    return meeting


@sync_to_async
def get_meeting_async(meeting_id: int):
    from meetings.models import Meeting
    return Meeting.objects.select_related('analysis').get(id=meeting_id)


@sync_to_async
def update_analysis_async(meeting, analysis: dict):
    from meetings.models import MeetingAnalysis, ActionItem
    MeetingAnalysis.objects.filter(meeting=meeting).update(
        summary=analysis.get("summary", ""),
        decisions=analysis.get("decisions", []),
        topics=analysis.get("topics", []),
        raw_response=analysis,
    )
    ActionItem.objects.filter(meeting=meeting).delete()
    for item in analysis.get("action_items", []):
        ActionItem.objects.create(
            meeting=meeting,
            text=item.get("text", ""),
            assignee=item.get("assignee"),
            deadline=item.get("deadline"),
            status="todo",
        )


async def process_audio(audio_path: str, user_telegram_id: int, username: str, first_name: str) -> dict:
    try:
        loop = asyncio.get_event_loop()

        transcript = await loop.run_in_executor(None, transcribe_audio, audio_path)
        analysis = await loop.run_in_executor(None, analyze_transcript, transcript)

        user = await get_or_create_user_async(user_telegram_id, username, first_name)
        meeting = await save_meeting_async(user, transcript, analysis, "audio", audio_path)

        return {
            "success": True,
            "meeting_id": meeting.id,
            "analysis": analysis,
        }

    except Exception as e:
        return {
            "success": False,
            "error": repr(e),
        }


async def process_text(transcript: str, user_telegram_id: int, username: str, first_name: str) -> dict:
    try:
        loop = asyncio.get_event_loop()

        analysis = await loop.run_in_executor(None, analyze_transcript, transcript)

        user = await get_or_create_user_async(user_telegram_id, username, first_name)
        meeting = await save_meeting_async(user, transcript, analysis, "text")

        return {
            "success": True,
            "meeting_id": meeting.id,
            "analysis": analysis,
        }

    except Exception as e:
        return {
            "success": False,
            "error": repr(e),
        }


async def adjust_analysis(meeting_id: int, adjustment: str) -> dict:
    try:
        loop = asyncio.get_event_loop()

        meeting = await get_meeting_async(meeting_id)
        transcript = meeting.transcript
        prompt = ADJUST_PROMPTS.get(adjustment, "")
        full_prompt = f"{prompt}\n\nTranscript:\n{transcript}"

        analysis = await loop.run_in_executor(None, analyze_transcript, full_prompt)
        await update_analysis_async(meeting, analysis)

        return {
            "success": True,
            "analysis": analysis,
        }

    except Exception as e:
        return {
            "success": False,
            "error": repr(e),
        }
