import os
import json
import boto3
import certifi
from dotenv import load_dotenv
from services.bedrock_service import get_bedrock_client

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")
KNOWLEDGE_BASE_MODEL_ARN = os.getenv("KNOWLEDGE_BASE_MODEL_ARN")


def get_bedrock_agent_runtime_client():
    """
    Build and return a boto3 Bedrock Agent Runtime client.

    Bedrock Agent Runtime uses standard AWS credentials.
    """
    return boto3.client(
        service_name="bedrock-agent-runtime",
        region_name=AWS_REGION,
    )


from typing import Optional, List, Dict

def ask_knowledge_base(
    question: str,
    history: Optional[List[Dict[str, str]]] = None,
    user_documents: Optional[List[Dict[str, str]]] = None,
) -> str:
    """
    Query the Bedrock Knowledge Base and custom user reference documents to generate a grounded answer.

    Args:
        question:       The user's question.
        history:        Optional list of previous messages [{"role": "user"/"assistant", "content": "..."}]
        user_documents: Optional list of user uploaded reference documents [{"name": "...", "content": "..."}]

    Returns:
        The grounded answer string.

    Raises:
        ValueError: If required environment variables are missing.
    """
    if not KNOWLEDGE_BASE_ID:
        raise ValueError("KNOWLEDGE_BASE_ID is not set in environment variables.")

    agent_client = get_bedrock_agent_runtime_client()

    # Attempt RetrieveAndGenerate if model ARN is provided and no history/user_docs override
    if KNOWLEDGE_BASE_MODEL_ARN and not history and not user_documents:
        try:
            response = agent_client.retrieve_and_generate(
                input={"text": question},
                retrieveAndGenerateConfiguration={
                    "type": "KNOWLEDGE_BASE",
                    "knowledgeBaseConfiguration": {
                        "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                        "modelArn": KNOWLEDGE_BASE_MODEL_ARN,
                    },
                },
            )
            return response.get("output", {}).get("text", "")
        except Exception:
            # Fallback to retrieve + Bedrock LLM generation if RetrieveAndGenerate is unsupported for managed KB
            pass

    # Retrieve relevant document passages from AWS Bedrock KB
    response = agent_client.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": question},
        retrievalConfiguration={
            "managedSearchConfiguration": {
                "numberOfResults": 5,
            },
        },
    )

    snippets = [
        result.get("content", {}).get("text", "").strip()
        for result in response.get("retrievalResults", [])
        if result.get("content", {}).get("text", "").strip()
    ]

    # Format previous conversation history if provided
    formatted_history = ""
    if history:
        turns = []
        for msg in history[-6:]:
            role_label = "User" if msg.get("role") == "user" else "Assistant"
            content = msg.get("content", "").strip()
            if content:
                turns.append(f"{role_label}: {content}")
        if turns:
            formatted_history = "Previous Conversation History:\n" + "\n".join(turns) + "\n\n"

    # Format user uploaded reference documents if provided
    formatted_user_docs = ""
    if user_documents:
        user_doc_parts = []
        for doc in user_documents:
            doc_name = doc.get("name", "Attached Document")
            doc_content = doc.get("content", "").strip()
            if doc_content:
                user_doc_parts.append(f"--- Document: {doc_name} ---\n{doc_content}")
        if user_doc_parts:
            formatted_user_docs = "Uploaded User Reference Documents:\n" + "\n\n".join(user_doc_parts) + "\n\n"

    context = "\n\n".join(snippets) if snippets else "No specific AWS Knowledge Base passages retrieved."

    system_prompts = [
        {
            "text": (
                "You are KelanaAI, an AI Travel Assistant dedicated strictly to travel planning, itineraries, destinations, travel guides, visas, local culture, transportation, accommodation, travel budgets, and travel advice.\n\n"
                "STRICT DOMAIN BOUNDARY RULE:\n"
                "1. You must ONLY answer topics related to travel, tourism, holiday planning, itineraries, travel documents/visas, destinations, local culture, transport, or travel tips.\n"
                "2. If the user asks about topics OUTSIDE of travel (e.g. coding/programming, writing computer code, math equations, non-travel homework, medical diagnosis, financial advice unrelated to travel, or general non-travel queries):\n"
                "   - You MUST politely decline to answer.\n"
                "   - Respond in friendly Indonesian: 'Maaf, sebagai asisten perjalanan KelanaAI, saya hanya fokus membantu seputar perencanaan perjalanan, rekomendasi destinasi wisata, panduan visa, dan informasi liburan. Ada yang bisa saya bantu mengenai rencana perjalanan Anda?'\n"
                "3. For travel questions, prioritize information from the provided AWS Knowledge Base passages and User Reference Documents. If specific document passages are not available, use your general travel knowledge to provide helpful and accurate travel advice in Indonesian (or the user's language)."
            )
        }
    ]

    prompt = (
        f"Use the previous conversation history, user reference documents, and AWS Knowledge Base context below to answer the user's question.\n\n"
        f"{formatted_history}"
        f"{formatted_user_docs}"
        f"AWS Knowledge Base Context:\n{context}\n\n"
        f"Question: {question}"
    )

    runtime_client = get_bedrock_client()
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    llm_response = runtime_client.converse(
        modelId=model_id,
        system=system_prompts,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
        inferenceConfig={
            "maxTokens": 1500,
            "temperature": 0.3,
        },
    )

    output_message = llm_response["output"]["message"]
    answer = "".join(
        block["text"]
        for block in output_message["content"]
        if "text" in block
    )
    return answer


# Alias for compatibility with retrieve_and_generate function naming
retrieve_and_generate = ask_knowledge_base
