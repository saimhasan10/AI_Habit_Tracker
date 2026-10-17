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


def get_text_generation_model():

    try:

        models = list(
            client.models.list()
        )

        # Only keep models that can be used
        # for text generation.
        for model in models:

            supported_actions = getattr(
                model,
                "supported_actions",
                []
            )

            if (
                "generateContent"
                in supported_actions
            ):

                return model.name.replace(
                    "models/",
                    ""
                )

    except Exception as error:

        print(
            "Could not list Gemini models:",
            error
        )


    raise RuntimeError(
        "No suitable Gemini text-generation model "
        "is currently available."
    )


def generate_ai_response(prompt):

    model_name = get_text_generation_model()

    response = client.models.generate_content(
        model=model_name,
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