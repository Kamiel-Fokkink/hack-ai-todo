import os
from functools import lru_cache

from orq_ai_sdk import Orq
from dotenv import load_dotenv

SIMPLIFY_DEPLOYMENT = "instructions_user_simplify"

load_dotenv()

BASE_PROMPT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompt", "user")

GUIDELINE_FILES = {
    "Basic": os.path.join(BASE_PROMPT_DIR, "basic.txt"),
    "Intermediate": os.path.join(BASE_PROMPT_DIR, "intermediate.txt"),
    "Fluent": os.path.join(BASE_PROMPT_DIR, "fluent.txt"),
}


@lru_cache(maxsize=None)
def load_guidelines(level: str) -> str:
    path = GUIDELINE_FILES.get(level)
    if not path or not os.path.exists(path):
        raise ValueError(f"Invalid level: {level}. Must be one of: {', '.join(GUIDELINE_FILES.keys())}")
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()

def get_orq_client(api_key: str) -> Orq:
    try:
        client = Orq(api_key=api_key, environment="production")
        return client
    except Exception as e:
        raise KeyError(
            "Failed to connect to Orq AI service",
            {"error": str(e), "status_code": 503}
        )


def simplify(client: Orq, language: str, level: str, content: str) -> str:
    guidelines = load_guidelines(level)

    generation = client.deployments.invoke(
        key=SIMPLIFY_DEPLOYMENT,
        inputs={
            "language": language,
            "level": level,
            "guidelines": guidelines
        },
        messages=[
            {"role": "user", "content": content}
        ]
    )
    return generation.choices[0].message.content