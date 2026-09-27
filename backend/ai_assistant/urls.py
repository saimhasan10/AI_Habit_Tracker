from django.urls import path

from .views import (
    AIChatView,
    AIHistoryView
)



urlpatterns = [

    path(
        "chat/",
        AIChatView.as_view()
    ),


    path(
        "history/",
        AIHistoryView.as_view()
    ),

]