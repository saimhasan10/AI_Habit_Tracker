from datetime import timedelta

from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Habit, HabitCompletion
from .serializers import HabitSerializer
from .services import calculate_streak


def week_start(date_value):
    return date_value - timedelta(
        days=date_value.weekday()
    )


def month_end(date_value):

    if date_value.month == 12:

        next_month = date_value.replace(
            year=date_value.year + 1,
            month=1,
            day=1
        )

    else:

        next_month = date_value.replace(
            month=date_value.month + 1,
            day=1
        )

    return next_month - timedelta(days=1)


class HabitListCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        habits = (
            Habit.objects
            .filter(user=request.user)
            .prefetch_related("completions")
        )

        serializer = HabitSerializer(
            habits,
            many=True
        )

        return Response(
            serializer.data
        )

    def post(self, request):

        serializer = HabitSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                user=request.user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class HabitDetailView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get_object(self, id, user):

        return Habit.objects.get(
            id=id,
            user=user
        )

    def get(self, request, id):

        try:

            habit = self.get_object(
                id,
                request.user
            )

        except Habit.DoesNotExist:

            return Response(
                {
                    "detail": "Habit not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = HabitSerializer(habit)

        return Response(
            serializer.data
        )

    def put(self, request, id):

        try:

            habit = self.get_object(
                id,
                request.user
            )

        except Habit.DoesNotExist:

            return Response(
                {
                    "detail": "Habit not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = HabitSerializer(
            habit,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, id):

        try:

            habit = self.get_object(
                id,
                request.user
            )

        except Habit.DoesNotExist:

            return Response(
                {
                    "detail": "Habit not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        habit.delete()

        return Response(
            {
                "message": "Habit deleted"
            }
        )


class CompleteHabitView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request, id):

        try:

            habit = Habit.objects.get(
                id=id,
                user=request.user
            )

        except Habit.DoesNotExist:

            return Response(
                {
                    "detail": "Habit not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        today = timezone.localdate()

        completion, created = (
            HabitCompletion.objects.get_or_create(
                habit=habit,
                date=today,
                defaults={
                    "completed": True
                }
            )
        )

        if not created:

            return Response(
                {
                    "message":
                        "Habit already completed today.",
                    "date":
                        completion.date,
                    "completed":
                        completion.completed,
                }
            )

        return Response(
            {
                "message": "Habit completed",
                "date": completion.date,
                "completed": True,
            },
            status=status.HTTP_201_CREATED
        )


class DashboardView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        today = timezone.localdate()

        current_week_start = week_start(today)

        current_month_start = today.replace(
            day=1
        )

        habits = (
            Habit.objects
            .filter(
                user=request.user,
                is_active=True
            )
            .prefetch_related("completions")
        )

        total_habits = habits.count()

        completed_today = 0

        today_expected = 0

        week_completed = 0

        week_expected = 0

        month_completed = 0

        month_expected = 0

        best_streak = 0

        habit_progress = []

        for habit in habits:

            completions = list(
                habit.completions.all()
            )

            completed_dates = {
                completion.date
                for completion in completions
                if completion.completed
            }

            today_completed = (
                today in completed_dates
            )

            streak = calculate_streak(
                completions
            )

            best_streak = max(
                best_streak,
                streak
            )

            if habit.frequency == "daily":

                if habit.created_at.date() <= today:

                    today_expected += 1

                    if today_completed:
                        completed_today += 1

                habit_week_completed = 0
                habit_week_expected = 0

                current_date = current_week_start

                while current_date <= today:

                    if (
                        current_date
                        >= habit.created_at.date()
                    ):

                        habit_week_expected += 1

                        if current_date in completed_dates:

                            habit_week_completed += 1

                    current_date += timedelta(days=1)

                habit_month_completed = 0
                habit_month_expected = 0

                current_date = current_month_start

                while current_date <= today:

                    if (
                        current_date
                        >= habit.created_at.date()
                    ):

                        habit_month_expected += 1

                        if current_date in completed_dates:

                            habit_month_completed += 1

                    current_date += timedelta(days=1)

            else:

                habit_week_expected = 1

                habit_week_completed = int(
                    any(
                        current_week_start
                        <= date_value
                        <= today
                        for date_value
                        in completed_dates
                    )
                )

                habit_month_expected = 0
                habit_month_completed = 0

                current_week = week_start(
                    current_month_start
                )

                while current_week <= today:

                    current_week_end = (
                        current_week
                        + timedelta(days=6)
                    )

                    actual_start = max(
                        current_week,
                        current_month_start
                    )

                    actual_end = min(
                        current_week_end,
                        today
                    )

                    if actual_start <= actual_end:

                        habit_month_expected += 1

                        completed = any(
                            actual_start
                            <= date_value
                            <= actual_end
                            for date_value
                            in completed_dates
                        )

                        if completed:
                            habit_month_completed += 1

                    current_week += timedelta(days=7)

                today_expected += 0

            week_expected += habit_week_expected
            week_completed += habit_week_completed

            month_expected += habit_month_expected
            month_completed += habit_month_completed

            habit_progress.append(
                {
                    "id": habit.id,
                    "title": habit.title,
                    "frequency": habit.frequency,
                    "today_completed": today_completed,
                    "streak": streak,
                    "week_completed":
                        habit_week_completed,
                    "week_expected":
                        habit_week_expected,
                    "month_completed":
                        habit_month_completed,
                    "month_expected":
                        habit_month_expected,
                }
            )

        today_consistency = (
            round(
                completed_today
                / today_expected
                * 100
            )
            if today_expected
            else 0
        )

        week_consistency = (
            round(
                week_completed
                / week_expected
                * 100
            )
            if week_expected
            else 0
        )

        month_consistency = (
            round(
                month_completed
                / month_expected
                * 100
            )
            if month_expected
            else 0
        )

        return Response(
            {
                "summary": {
                    "total_habits":
                        total_habits,

                    "completed_today":
                        completed_today,

                    "today_consistency":
                        today_consistency,

                    "week_consistency":
                        week_consistency,

                    "month_consistency":
                        month_consistency,

                    "best_streak":
                        best_streak,
                },

                "habits":
                    habit_progress,
            }
        )


class HabitHistoryView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        period = request.query_params.get(
            "period",
            "week"
        )

        today = timezone.localdate()

        habits = (
            Habit.objects
            .filter(
                user=request.user,
                is_active=True
            )
            .prefetch_related("completions")
        )

        if period == "month":

            start_date = today.replace(
                day=1
            )

            end_date = month_end(today)

        else:

            period = "week"

            start_date = week_start(today)

            end_date = start_date + timedelta(
                days=6
            )

        daily_history = []

        current_date = start_date

        while current_date <= min(
            end_date,
            today
        ):

            items = []

            for habit in habits:

                if habit.frequency != "daily":
                    continue

                if (
                    habit.created_at.date()
                    > current_date
                ):
                    continue

                completed = any(
                    completion.date == current_date
                    and completion.completed
                    for completion
                    in habit.completions.all()
                )

                items.append(
                    {
                        "habit_id": habit.id,
                        "habit_title": habit.title,
                        "completed": completed,
                    }
                )

            if items:

                daily_history.append(
                    {
                        "date": current_date,
                        "completed_count":
                            sum(
                                item["completed"]
                                for item in items
                            ),
                        "total_habits":
                            len(items),
                        "habits":
                            items,
                    }
                )

            current_date += timedelta(days=1)

        weekly_history = []

        current_week = week_start(
            start_date
        )

        while current_week <= end_date:

            week_end = (
                current_week
                + timedelta(days=6)
            )

            actual_start = max(
                current_week,
                start_date
            )

            actual_end = min(
                week_end,
                end_date,
                today
            )

            items = []

            if actual_start <= actual_end:

                for habit in habits:

                    if habit.frequency != "weekly":
                        continue

                    if (
                        habit.created_at.date()
                        > actual_end
                    ):
                        continue

                    completed = any(
                        actual_start
                        <= completion.date
                        <= actual_end
                        and completion.completed
                        for completion
                        in habit.completions.all()
                    )

                    items.append(
                        {
                            "habit_id":
                                habit.id,
                            "habit_title":
                                habit.title,
                            "completed":
                                completed,
                        }
                    )

                if items:

                    weekly_history.append(
                        {
                            "week_start":
                                actual_start,
                            "week_end":
                                actual_end,
                            "completed_count":
                                sum(
                                    item["completed"]
                                    for item in items
                                ),
                            "total_habits":
                                len(items),
                            "habits":
                                items,
                        }
                    )

            current_week += timedelta(days=7)

        return Response(
            {
                "period": period,
                "start_date": start_date,
                "end_date": end_date,
                "daily_history":
                    daily_history,
                "weekly_history":
                    weekly_history,
            }
        )