from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from .config import settings


def get_llm():
    return ChatOpenAI(
        model=settings.model_class,
        temperature=settings.temperature,
        max_tokens=settings.max_tokens,
        api_key=settings.openai_api_key,
    )


def get_embeddings():
    return OpenAIEmbeddings(
        model=settings.embedding_model,
        api_key=settings.openai_api_key,
    )
