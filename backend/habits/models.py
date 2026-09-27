from django.db import models
from django.contrib.auth.models import User


class Habit(models.Model):

    FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="habits"
    )

    title = models.CharField(
        max_length=100
    )

    description = models.TextField(
        blank=True
    )

    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default="daily"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    is_active = models.BooleanField(
        default=True
    )


    def __str__(self):
        return self.title



class HabitCompletion(models.Model):

    habit = models.ForeignKey(
        Habit,
        on_delete=models.CASCADE,
        related_name="completions"
    )

    date = models.DateField(
        auto_now_add=True
    )

    completed = models.BooleanField(
        default=True
    )


    def __str__(self):
        return f"{self.habit.title} - {self.date}"