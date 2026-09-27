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



    def put(self, request, id):

        habit = self.get_object(
            id,
            request.user
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
            serializer.errors
        )



    def delete(self, request, id):

        habit = self.get_object(
            id,
            request.user
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

        habit = Habit.objects.get(
            id=id,
            user=request.user
        )


        completion = HabitCompletion.objects.create(
            habit=habit
        )


        return Response(
            {
                "message": "Habit completed",
                "date": completion.date
            }
        )



class DashboardView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def get(self, request):

        habits = Habit.objects.filter(
            user=request.user
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