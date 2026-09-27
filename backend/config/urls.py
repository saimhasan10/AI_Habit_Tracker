from django.contrib import admin
from django.urls import path, include



urlpatterns = [

    path(
        "admin/",
        admin.site.urls
    ),


    path(
        "api/accounts/",
        include("accounts.urls")
    ),


    path(
        "api/habits/",
        include("habits.urls")
    ),


    path(
        "api/ai/",
        include("ai_assistant.urls")
    ),

]