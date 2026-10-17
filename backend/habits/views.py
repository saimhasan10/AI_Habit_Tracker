from datetime import timedelta

from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Habit, HabitCompletion
from .serializers import HabitSerializer
from .services import calculate_streak


class HabitListCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        habits = Habit.objects.filter(
            user=request.user
        ).prefetch_related(
            "completions"
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

        serializer = HabitSerializer(
            habit
        )

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
            },
            status=status.HTTP_200_OK
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

        completion = HabitCompletion.objects.filter(
            habit=habit,
            date=today
        ).first()

        if completion:

            return Response(
                {
                    "message": "Habit already completed today.",
                    "date": completion.date
                },
                status=status.HTTP_200_OK
            )

        completion = HabitCompletion.objects.create(
            habit=habit
        )

        return Response(
            {
                "message": "Habit completed",
                "date": completion.date
            },
            status=status.HTTP_201_CREATED
        )


class DashboardView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        habits = Habit.objects.filter(
            user=request.user
        ).prefetch_related(
            "completions"
        )

        data = []

        for habit in habits:

            streak = calculate_streak(
                habit.completions.all()
            )

            data.append(
                {
                    "habit": habit.title,
                    "streak": streak
                }
            )

        return Response(
            data
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

        if period == "month":

            start_date = today.replace(
                day=1
            )

            if start_date.month == 12:

                next_month = start_date.replace(
                    year=start_date.year + 1,
                    month=1
                )

            else:

                next_month = start_date.replace(
                    month=start_date.month + 1
                )

            end_date = next_month - timedelta(
                days=1
            )

        else:

            start_date = today - timedelta(
                days=today.weekday()
            )

            end_date = start_date + timedelta(
                days=6
            )

            period = "week"

        habits = Habit.objects.filter(
            user=request.user
        ).prefetch_related(
            "completions"
        )

        history = []

        current_date = start_date

        while current_date <= end_date:

            day_habits = []

            for habit in habits:

                completion = next(
                    (
                        item
                        for item in habit.completions.all()
                        if item.date == current_date
                    ),
                    None
                )

                day_habits.append(
                    {
                        "habit_id": habit.id,
                        "habit_title": habit.title,
                        "completed": (
                            completion is not None
                            and completion.completed
                        )
                    }
                )

            history.append(
                {
                    "date": current_date,
                    "completed_count": sum(
                        1
                        for item in day_habits
                        if item["completed"]
                    ),
                    "total_habits": len(day_habits),
                    "habits": day_habits
                }
            )

            current_date += timedelta(
                days=1
            )

        return Response(
            {
                "period": period,
                "start_date": start_date,
                "end_date": end_date,
                "history": history
            }
        )