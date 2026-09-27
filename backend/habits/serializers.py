from rest_framework import serializers

from .models import Habit, HabitCompletion



class HabitCompletionSerializer(serializers.ModelSerializer):

    class Meta:

        model = HabitCompletion

        fields = [
            "id",
            "date",
            "completed"
        ]



class HabitSerializer(serializers.ModelSerializer):

    completions = HabitCompletionSerializer(
        many=True,
        read_only=True
    )


    class Meta:

        model = Habit

        fields = [
            "id",
            "title",
            "description",
            "frequency",
            "created_at",
            "is_active",
            "completions"
        ]