from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Meeting, ActionItem, MeetingAnalysis, Decision
from .serializers import (
    MeetingListSerializer,
    MeetingDetailSerializer,
    ActionItemSerializer,
    MeetingAnalysisSerializer,
)


class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.select_related('analysis', 'user').prefetch_related(
        'action_items', 'decisions'
    )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MeetingDetailSerializer
        return MeetingListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Поиск по ключевым словам
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(transcript__icontains=search) |
                Q(analysis__summary__icontains=search)
            )

        # Фильтр по дате
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        return queryset

    @action(detail=True, methods=['patch'])
    def update_analysis(self, request, pk=None):
        meeting = self.get_object()
        analysis, created = MeetingAnalysis.objects.get_or_create(meeting=meeting)
        serializer = MeetingAnalysisSerializer(analysis, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActionItemViewSet(viewsets.ModelViewSet):
    queryset = ActionItem.objects.select_related('meeting').all()
    serializer_class = ActionItemSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Фильтр по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Фильтр по ответственному
        assignee = self.request.query_params.get('assignee')
        if assignee:
            queryset = queryset.filter(assignee__icontains=assignee)

        return queryset

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        item = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['todo', 'in_progress', 'done']:
            return Response(
                {'error': 'Неверный статус'},
                status=status.HTTP_400_BAD_REQUEST
            )
        item.status = new_status
        item.save()
        return Response(ActionItemSerializer(item).data)