from django.contrib import admin
from .models import TelegramUser, Meeting, MeetingAnalysis, ActionItem, Decision


@admin.register(TelegramUser)
class TelegramUserAdmin(admin.ModelAdmin):
    list_display = ['telegram_id', 'first_name', 'username', 'created_at']
    search_fields = ['username', 'first_name', 'telegram_id']


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'status', 'source_type', 'created_at']
    list_filter = ['status', 'source_type', 'created_at']
    search_fields = ['title', 'transcript']


@admin.register(MeetingAnalysis)
class MeetingAnalysisAdmin(admin.ModelAdmin):
    list_display = ['meeting', 'created_at']


@admin.register(ActionItem)
class ActionItemAdmin(admin.ModelAdmin):
    list_display = ['text', 'assignee', 'status', 'deadline', 'meeting']
    list_filter = ['status']
    search_fields = ['text', 'assignee']


@admin.register(Decision)
class DecisionAdmin(admin.ModelAdmin):
    list_display = ['text', 'meeting', 'created_at']