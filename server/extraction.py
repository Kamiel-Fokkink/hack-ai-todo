from orq_ai_sdk import Orq
from dotenv import load_dotenv

EXTRACTION_DEPLOYMENT = "instructions_extraction"

load_dotenv()

class MockClient:
    pass

def get_orq_client(api_key: str) -> Orq:
    if api_key == "DUMMY":
        return MockClient()
    try:
        client = Orq(api_key=api_key, environment="production")
        return client
    except Exception as e:
        raise KeyError(
            "Failed to connect to Orq AI service",
            {"error": str(e), "status_code": 503}
        )


def extract(client: Orq, content: str) -> str:
    if isinstance(client, MockClient):
        return '{"summary": "This is a mock extraction", "steps": ["Step 1", "Step 2"]}'
    generation = client.deployments.invoke(
        key="instructions_extraction",
        inputs={"content": content}
    )
    return generation.choices[0].message.content