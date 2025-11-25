from orq_ai_sdk import Orq
from dotenv import load_dotenv
import json

CLASSIFY_DEPLOYMENT = "instructions_classify"

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


def classify_tasks(client: Orq, simplified_json: dict) -> dict:
    """
    Classifies each section of the simplified JSON to determine if it contains tasks.

    Args:
        client: Orq client instance
        simplified_json: The simplified content as a dictionary

    Returns:
        Dictionary with section keys mapped to boolean (True if contains tasks, False otherwise)
        Example: {"Daily_Tasks": True, "Contact_Info": False}
    """
    # Convert the JSON to string for the LLM
    content_str = json.dumps(simplified_json, indent=2)

    generation = client.deployments.invoke(
        key=CLASSIFY_DEPLOYMENT,
        messages=[
            {"role": "user", "content": content_str}
        ]
    )

    result = generation.choices[0].message.content

    # Parse the result
    try:
        # Remove markdown code blocks if present
        clean_result = result.strip()
        if clean_result.startswith("```json"):
            clean_result = clean_result[7:]
        elif clean_result.startswith("```"):
            clean_result = clean_result[3:]

        if clean_result.endswith("```"):
            clean_result = clean_result[:-3]

        classification = json.loads(clean_result.strip())
        return classification
    except json.JSONDecodeError:
        # If parsing fails, return empty dict (all sections treated as non-tasks)
        print(f"Warning: Could not parse task classification: {result}")
        return {}
