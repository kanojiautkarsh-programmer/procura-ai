from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from .config import settings


def get_llm(api_key: str | None = None):
    return ChatOpenAI(
        model=settings.model_class,
        temperature=settings.temperature,
        max_tokens=settings.max_tokens,
        api_key=api_key or settings.openai_api_key or None,
    )


def get_embeddings(api_key: str | None = None):
    return OpenAIEmbeddings(
        model=settings.embedding_model,
        api_key=api_key or settings.openai_api_key or None,
    )
