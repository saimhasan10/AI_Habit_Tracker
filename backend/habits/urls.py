from django.urls import path

from .views import (
    HabitListCreateView,
    HabitDetailView,
    CompleteHabitView,
    DashboardView
)



urlpatterns = [

    path(
        "",
        HabitListCreateView.as_view()
    ),

    path(
        "<int:id>/",
        HabitDetailView.as_view()
    ),

    path(
        "<int:id>/complete/",
        CompleteHabitView.as_view()
    ),

    path(
        "dashboard/",
        DashboardView.as_view()
    ),

]