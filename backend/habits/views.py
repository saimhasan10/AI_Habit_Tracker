from datetime import timedelta

from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Habit, HabitCompletion
from .serializers import HabitSerializer
from .services import calculate_streak


def get_week_start(date_value):

    return date_value - timedelta(
        days=date_value.weekday()
    )


def get_week_end(date_value):

    return get_week_start(
        date_value
    ) + timedelta(days=6)


def get_month_end(date_value):

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

    return next_month - timedelta(
        days=1
    )


def build_period_dates(
    start_date,
    end_date
):

    dates = []

    current_date = start_date

    while current_date <= end_date:

        dates.append(
            current_date
        )

        current_date += timedelta(
            days=1
        )

    return dates


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

    def get_object(
        self,
        id,
        user
    ):

        return Habit.objects.get(
            id=id,
            user=user
        )

    def get(
        self,
        request,
        id
    ):

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
            habit
        )

        return Response(
            serializer.data
        )

    def put(
        self,
        request,
        id
    ):

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

    def delete(
        self,
        request,
        id
    ):

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
            },
            status=status.HTTP_200_OK
        )


class CompleteHabitView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request,
        id
    ):

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

        completion = (
            HabitCompletion.objects
            .filter(
                habit=habit,
                date=today
            )
            .first()
        )

        if completion:

            return Response(
                {
                    "message":
                        "Habit already completed today.",
                    "date":
                        completion.date,
                    "completed":
                        completion.completed,
                },
                status=status.HTTP_200_OK
            )

        completion = HabitCompletion.objects.create(
            habit=habit,
            completed=True
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

    def get(
        self,
        request
    ):

        today = timezone.localdate()

        week_start = get_week_start(
            today
        )

        week_end = get_week_end(
            today
        )

        month_start = today.replace(
            day=1
        )

        month_end = get_month_end(
            today
        )

        habits = (
            Habit.objects
            .filter(user=request.user)
            .prefetch_related("completions")
        )

        habit_data = []

        total_today_completed = 0

        total_today_expected = 0

        total_week_completed = 0

        total_week_expected = 0

        total_month_completed = 0

        total_month_expected = 0

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

            if habit.frequency == "daily":

                if (
                    habit.created_at.date()
                    <= today
                ):

                    total_today_expected += 1

                    if today_completed:
                        total_today_completed += 1

                week_expected = 0
                week_completed = 0

                current_date = week_start

                while current_date <= today:

                    if (
                        habit.created_at.date()
                        <= current_date
                    ):

                        week_expected += 1

                        if current_date in completed_dates:

                            week_completed += 1

                    current_date += timedelta(
                        days=1
                    )

                month_expected = 0
                month_completed = 0

                current_date = month_start

                while current_date <= today:

                    if (
                        habit.created_at.date()
                        <= current_date
                    ):

                        month_expected += 1

                        if current_date in completed_dates:

                            month_completed += 1

                    current_date += timedelta(
                        days=1
                    )

            else:

                total_today_expected += 0

                week_expected = 1

                current_week_start = week_start

                week_completed = any(
                    current_week_start
                    <= completion_date
                    <= today
                    for completion_date
                    in completed_dates
                )

                week_completed = (
                    1
                    if week_completed
                    else 0
                )

                month_expected = 0

                month_completed = 0

                current_week_start = get_week_start(
                    month_start
                )

                while current_week_start <= month_end:

                    current_week_end = (
                        current_week_start
                        + timedelta(days=6)
                    )

                    actual_start = max(
                        current_week_start,
                        month_start
                    )

                    actual_end = min(
                        current_week_end,
                        today
                    )

                    if actual_start <= actual_end:

                        month_expected += 1

                        week_done = any(
                            actual_start
                            <= completion_date
                            <= actual_end
                            for completion_date
                            in completed_dates
                        )

                        if week_done:
                            month_completed += 1

                    current_week_start += timedelta(
                        days=7
                    )

            total_week_expected += week_expected
            total_week_completed += week_completed

            total_month_expected += month_expected
            total_month_completed += month_completed

            streak = calculate_streak(
                completions
            )

            habit_data.append(
                {
                    "id": habit.id,
                    "title": habit.title,
                    "frequency": habit.frequency,
                    "today_completed": today_completed,
                    "streak": streak,
                    "week_completed": week_completed,
                    "week_expected": week_expected,
                    "month_completed": month_completed,
                    "month_expected": month_expected,
                }
            )

        today_consistency = (
            round(
                (
                    total_today_completed
                    / total_today_expected
                ) * 100
            )
            if total_today_expected > 0
            else 0
        )

        week_consistency = (
            round(
                (
                    total_week_completed
                    / total_week_expected
                ) * 100
            )
            if total_week_expected > 0
            else 0
        )

        month_consistency = (
            round(
                (
                    total_month_completed
                    / total_month_expected
                ) * 100
            )
            if total_month_expected > 0
            else 0
        )

        best_streak = max(
            (
                item["streak"]
                for item in habit_data
            ),
            default=0
        )

        return Response(
            {
                "summary": {
                    "total_habits": len(habit_data),
                    "completed_today":
                        total_today_completed,
                    "today_consistency":
                        today_consistency,
                    "week_consistency":
                        week_consistency,
                    "month_consistency":
                        month_consistency,
                    "best_streak":
                        best_streak,
                },
                "habits": habit_data,
            }
        )


class HabitHistoryView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request
    ):

        period = request.query_params.get(
            "period",
            "week"
        )

        today = timezone.localdate()

        if period == "month":

            start_date = today.replace(
                day=1
            )

            end_date = get_month_end(
                today
            )

        else:

            period = "week"

            start_date = get_week_start(
                today
            )

            end_date = get_week_end(
                today
            )

        habits = (
            Habit.objects
            .filter(user=request.user)
            .prefetch_related("completions")
        )

        history = []

        # ==========================
        # DAILY HISTORY
        # ==========================

        daily_dates = build_period_dates(
            start_date,
            min(end_date, today)
        )

        for current_date in daily_dates:

            daily_habits = []

            for habit in habits:

                if habit.frequency != "daily":
                    continue

                if (
                    current_date
                    < habit.created_at.date()
                ):
                    continue

                completed = any(
                    completion.date == current_date
                    and completion.completed
                    for completion
                    in habit.completions.all()
                )

                daily_habits.append(
                    {
                        "habit_id":
                            habit.id,
                        "habit_title":
                            habit.title,
                        "completed":
                            completed,
                    }
                )

            if daily_habits:

                history.append(
                    {
                        "date":
                            current_date,
                        "type":
                            "daily",
                        "completed_count":
                            sum(
                                1
                                for item
                                in daily_habits
                                if item["completed"]
                            ),
                        "total_habits":
                            len(daily_habits),
                        "habits":
                            daily_habits,
                    }
                )

        # ==========================
        # WEEKLY HISTORY
        # ==========================

        weekly_history = []

        current_week_start = get_week_start(
            start_date
        )

        while current_week_start <= end_date:

            current_week_end = (
                current_week_start
                + timedelta(days=6)
            )

            actual_start = max(
                current_week_start,
                start_date
            )

            actual_end = min(
                current_week_end,
                end_date,
                today
            )

            weekly_habits = []

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

                    weekly_habits.append(
                        {
                            "habit_id":
                                habit.id,
                            "habit_title":
                                habit.title,
                            "completed":
                                completed,
                        }
                    )

                if weekly_habits:

                    weekly_history.append(
                        {
                            "week_start":
                                actual_start,
                            "week_end":
                                actual_end,
                            "type":
                                "weekly",
                            "completed_count":
                                sum(
                                    1
                                    for item
                                    in weekly_habits
                                    if item["completed"]
                                ),
                            "total_habits":
                                len(weekly_habits),
                            "habits":
                                weekly_habits,
                        }
                    )

            current_week_start += timedelta(
                days=7
            )

        return Response(
            {
                "period": period,
                "start_date": start_date,
                "end_date": end_date,
                "daily_history": history,
                "weekly_history":
                    weekly_history,
            }
        )