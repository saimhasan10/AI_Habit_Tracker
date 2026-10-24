
import os

from google import genai
from google.genai import types


GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)


if not GEMINI_API_KEY:

    raise RuntimeError(
        "GEMINI_API_KEY is not configured."
    )


client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=types.HttpOptions(
        timeout=30000
    )
)


def generate_ai_response(prompt):

    try:

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=500,
                temperature=0.7,
            ),
        )

    except Exception as error:

        print(
            "Gemini API error:",
            repr(error)
        )

        raise RuntimeError(
            "Gemini API request failed."
        ) from error


    if response is None:

        raise RuntimeError(
            "Gemini returned an empty response."
        )


    if not response.text:

        raise RuntimeError(
            "Gemini returned empty text."
        )


    return response.text.strip()
