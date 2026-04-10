from rest_framework import serializers
from .models import TelegramUser, Meeting, MeetingAnalysis, ActionItem, Decision


class TelegramUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelegramUser
        fields = '__all__'


class DecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decision
        fields = ['id', 'text', 'created_at']


class ActionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionItem
        fields = ['id', 'text', 'assignee', 'deadline', 'status', 'created_at']


class MeetingAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingAnalysis
        fields = ['id', 'summary', 'decisions', 'topics', 'created_at', 'updated_at']


class MeetingListSerializer(serializers.ModelSerializer):
    open_action_items = serializers.SerializerMethodField()
    summary = serializers.SerializerMethodField()

    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'status', 'source_type',
            'created_at', 'open_action_items', 'summary'
        ]

    def get_open_action_items(self, obj):
        return obj.action_items.exclude(status='done').count()

    def get_summary(self, obj):
        if hasattr(obj, 'analysis') and obj.analysis:
            return obj.analysis.summary
        return None


class MeetingDetailSerializer(serializers.ModelSerializer):
    analysis = MeetingAnalysisSerializer(read_only=True)
    action_items = ActionItemSerializer(many=True, read_only=True)
    decisions = DecisionSerializer(many=True, read_only=True)
    user = TelegramUserSerializer(read_only=True)

    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'transcript', 'status',
            'source_type', 'created_at', 'updated_at',
            'user', 'analysis', 'action_items', 'decisions'
        ]