import os

from google import genai


GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)


if not GEMINI_API_KEY:

    raise RuntimeError(
        "GEMINI_API_KEY is not configured."
    )


client = genai.Client(
    api_key=GEMINI_API_KEY
)


def generate_ai_response(prompt):

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt
    )

    if not response:

        raise RuntimeError(
            "Gemini returned an empty response."
        )

    if not response.text:

        raise RuntimeError(
            "Gemini returned an empty text response."
        )

    return response.text.strip()