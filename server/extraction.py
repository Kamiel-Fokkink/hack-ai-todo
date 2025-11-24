from orq_ai_sdk import Orq
from dotenv import load_dotenv

EXTRACTION_DEPLOYMENT = "instructions_extraction"

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


def extract(client: Orq, content: str) -> str:
    generation = client.deployments.invoke(
        key="instructions_extraction",
        messages=[
            {"role": "user", "content": content}
        ]
    )
    return generation.choices[0].message.content