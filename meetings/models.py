from django.db import models


class TelegramUser(models.Model):
    telegram_id = models.BigIntegerField(unique=True)
    username = models.CharField(max_length=255, blank=True, null=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} ({self.telegram_id})"

    class Meta:
        verbose_name = "Telegram пользователь"
        verbose_name_plural = "Telegram пользователи"


class Meeting(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Обрабатывается'),
        ('done', 'Готово'),
        ('error', 'Ошибка'),
    ]

    user = models.ForeignKey(
        TelegramUser,
        on_delete=models.CASCADE,
        related_name='meetings'
    )
    title = models.CharField(max_length=500, blank=True, null=True)
    transcript = models.TextField(blank=True, null=True)
    audio_file = models.FileField(upload_to='audio/', blank=True, null=True)
    source_type = models.CharField(
        max_length=20,
        choices=[('audio', 'Аудио'), ('text', 'Текст')],
        default='audio'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='processing'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Meeting {self.id} — {self.user}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Встреча"
        verbose_name_plural = "Встречи"


class MeetingAnalysis(models.Model):
    meeting = models.OneToOneField(
        Meeting,
        on_delete=models.CASCADE,
        related_name='analysis'
    )
    summary = models.TextField(blank=True, null=True)
    decisions = models.JSONField(default=list)
    topics = models.JSONField(default=list)
    raw_response = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analysis for Meeting {self.meeting.id}"

    class Meta:
        verbose_name = "Анализ встречи"
        verbose_name_plural = "Анализы встреч"


class ActionItem(models.Model):
    STATUS_CHOICES = [
        ('todo', 'Нужно сделать'),
        ('in_progress', 'В процессе'),
        ('done', 'Готово'),
    ]

    meeting = models.ForeignKey(
        Meeting,
        on_delete=models.CASCADE,
        related_name='action_items'
    )
    text = models.TextField()
    assignee = models.CharField(max_length=255, blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='todo'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.text[:50]} — {self.assignee}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Задача"
        verbose_name_plural = "Задачи"


class Decision(models.Model):
    meeting = models.ForeignKey(
        Meeting,
        on_delete=models.CASCADE,
        related_name='decisions'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text[:100]

    class Meta:
        verbose_name = "Решение"
        verbose_name_plural = "Решения"