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

    if not snippets and not formatted_user_docs:
        return "Maaf, tidak ditemukan informasi yang relevan dalam Knowledge Base maupun Dokumen Referensi yang diunggah."

    context = "\n\n".join(snippets)
    prompt = (
        f"You are KelanaAI travel assistant. Answer the user's question accurately using ONLY the provided context information and reference documents below.\n"
        f"If the context does not contain enough information to answer, state that clearly.\n"
        f"Use the previous conversation history and user reference documents if helpful.\n\n"
        f"{formatted_history}"
        f"{formatted_user_docs}"
        f"AWS Knowledge Base Context:\n{context}\n\n"
        f"Question: {question}"
    )

    runtime_client = get_bedrock_client()
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    llm_response = runtime_client.converse(
        modelId=model_id,
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
