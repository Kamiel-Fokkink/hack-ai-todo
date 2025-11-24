from orq_ai_sdk import Orq
from dotenv import load_dotenv
import os

SIMPLIFY_DEPLOYMENT = "instructions_user_simplify"

load_dotenv()

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
    project_root = os.path.dirname(os.path.dirname(__file__))
    guidelines_path = os.path.join(project_root, "prompt", "user", "language", f"{level.lower()}.txt")
    with open(guidelines_path, "r") as f:
        guidelines = f.read()

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