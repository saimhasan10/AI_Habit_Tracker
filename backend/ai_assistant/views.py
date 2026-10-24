
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


from .models import AIRequest
from .serializers import AIRequestSerializer
from .gemini import generate_ai_response


class AIChatView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def post(
        self,
        request
    ):

        question = request.data.get(
            "question"
        )


        if not question:

            return Response(
                {
                    "error":
                        "Question is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        question = str(
            question
        ).strip()


        if not question:

            return Response(
                {
                    "error":
                        "Question cannot be empty."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if len(question) > 2000:

            return Response(
                {
                    "error":
                        "Question is too long. "
                        "Maximum 2000 characters."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        prompt = f"""
You are an AI habit coach.

The user is using a simple habit tracking application.

User question:
{question}

Give simple, practical, encouraging advice.

Keep the response concise and easy to understand.
"""


        try:

            answer = generate_ai_response(
                prompt
            )

        except Exception as error:

            print(
                "Gemini error:",
                repr(error)
            )

            return Response(
                {
                    "error":
                        "AI service is temporarily unavailable."
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


        if not answer:

            return Response(
                {
                    "error":
                        "AI returned an empty response."
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


        try:

            ai_request = AIRequest.objects.create(
                user=request.user,
                question=question,
                response=answer
            )

        except Exception as error:

            print(
                "AI history database error:",
                repr(error)
            )

            return Response(
                {
                    "error":
                        "AI response was generated, "
                        "but could not be saved."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


        return Response(
            AIRequestSerializer(
                ai_request
            ).data,
            status=status.HTTP_201_CREATED
        )



class AIHistoryView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def get(
        self,
        request
    ):

        history = (
            AIRequest.objects
            .filter(
                user=request.user
            )
            .order_by(
                "-created_at"
            )
        )


        serializer = AIRequestSerializer(
            history,
            many=True
        )


        return Response(
            serializer.data
        )
