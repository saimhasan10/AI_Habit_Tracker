from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated

from .models import AIRequest
from .serializers import AIRequestSerializer

from .gemini import generate_ai_response



class AIChatView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def post(self, request):

        question = request.data.get(
            "question"
        )


        prompt = f"""
        You are an AI habit coach.

        User question:
        {question}

        Give simple practical advice.
        """


        answer = generate_ai_response(
            prompt
        )


        ai_request = AIRequest.objects.create(

            user=request.user,

            question=question,

            response=answer
        )


        return Response(
            AIRequestSerializer(
                ai_request
            ).data
        )



class AIHistoryView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def get(self, request):

        history = AIRequest.objects.filter(
            user=request.user
        )


        serializer = AIRequestSerializer(
            history,
            many=True
        )


        return Response(
            serializer.data
        )