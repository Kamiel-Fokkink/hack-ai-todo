from orq_ai_sdk import Orq
from dotenv import load_dotenv

SIMPLIFY_DEPLOYMENT = "instructions_user_simplify"

load_dotenv()

# Language proficiency level guidelines
LEVEL_GUIDELINES = {
    "Basic": """
TARGET AUDIENCE: Beginner language learners with limited vocabulary and grammar knowledge.

LANGUAGE CHARACTERISTICS:
- Use simple present tense primarily, with basic past and future when necessary
- Short, direct sentences (5-10 words average)
- Common, everyday vocabulary (top 1000-2000 most frequent words)
- Avoid idioms, slang, and figurative language
- Use concrete, tangible concepts rather than abstract ideas

GRAMMAR TO USE:
- Simple sentence structures: Subject + Verb + Object
- Present simple, present continuous for current actions
- Simple past for completed actions
- "Going to" for future plans
- Basic conjunctions: and, but, or, because

GRAMMAR TO AVOID:
- Complex verb tenses (perfect tenses, conditionals)
- Passive voice
- Relative clauses
- Subjunctive mood
- Multiple clause sentences

EXAMPLES:
Complex: "Having completed the registration process, participants should proceed to the main hall."
Simple: "Finish registration. Then go to the main hall."

Complex: "The medication should be administered twice daily with meals."
Simple: "Take this medicine two times each day. Take it with food."
""",

    "Intermediate": """
TARGET AUDIENCE: Language learners with working knowledge who can handle everyday situations but struggle with complex topics.

LANGUAGE CHARACTERISTICS:
- Mix of common and moderately complex vocabulary
- Varied sentence structure with some complexity
- Can include some abstract concepts if clearly explained
- Moderate use of idioms (only very common ones)
- Average sentence length: 10-15 words

GRAMMAR TO USE:
- All basic tenses plus perfect tenses when needed
- Conditional sentences (if/when clauses)
- Some passive voice for natural expression
- Relative clauses (who, which, that) for clarity
- Compound and some complex sentences
- Modal verbs (should, could, might, must)

GRAMMAR TO AVOID:
- Overly complex nested clauses
- Rare or archaic constructions
- Very advanced vocabulary
- Obscure idioms or cultural references

EXAMPLES:
Complex: "Notwithstanding the aforementioned constraints, participants are required to submit documentation."
Intermediate: "Despite these limits, you must submit your documents."

Complex: "The therapeutic intervention necessitates immediate implementation."
Intermediate: "This treatment should be started right away."
""",

    "Fluent": """
TARGET AUDIENCE: Advanced language learners who can understand sophisticated content and nuanced communication.

LANGUAGE CHARACTERISTICS:
- Full range of vocabulary including specialized terms
- Natural, varied sentence structures
- Can handle abstract and complex ideas
- Idiomatic expressions used naturally
- Longer, more sophisticated sentences when appropriate

GRAMMAR TO USE:
- All tenses and aspects as needed
- Passive and active voice naturally mixed
- Complex sentence structures with multiple clauses
- Advanced conjunctions and transitions
- Subjunctive mood where appropriate
- Formal and informal registers as needed

SIMPLIFICATION FOCUS:
- Clarify technical jargon (provide brief explanations)
- Organize information logically
- Make implicit connections explicit
- Break down extremely dense information
- Maintain sophistication while improving clarity

EXAMPLES:
Very Complex: "The epistemological ramifications of the aforementioned paradigmatic shift necessitate a fundamental reconsideration of our methodological approach vis-à-vis data interpretation."
Fluent: "This major change in thinking requires us to fundamentally rethink how we interpret data."

Complex legal: "The party of the first part hereby agrees to indemnify and hold harmless the party of the second part."
Fluent: "The first party agrees to protect the second party from legal liability and compensate them for any losses."
"""
}

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
    # Get guidelines for the specified level
    guidelines = LEVEL_GUIDELINES.get(level)

    if not guidelines:
        raise ValueError(f"Invalid level: {level}. Must be one of: Basic, Intermediate, Fluent")

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