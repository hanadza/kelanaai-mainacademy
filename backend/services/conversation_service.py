from typing import List, Optional
from sqlalchemy.orm import Session
from models.conversation import Conversation, Message


def create_conversation(
    db: Session,
    title: str = "Obrolan Baru",
    user_id: Optional[int] = None
) -> Conversation:
    """Create a new conversation session."""
    conversation = Conversation(
        user_id=user_id,
        title=title,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def get_user_conversations(
    db: Session,
    user_id: Optional[int] = None
) -> List[Conversation]:
    """
    Get all conversations for a specific user (or guest sessions if user_id is None).
    Ordered by created_at descending.
    """
    query = db.query(Conversation)
    if user_id is not None:
        query = query.filter(Conversation.user_id == user_id)
    else:
        query = query.filter(Conversation.user_id.is_(None))

    return query.order_by(Conversation.id.desc()).all()


def get_conversation_by_id(
    db: Session,
    conversation_id: int,
    user_id: Optional[int] = None
) -> Optional[Conversation]:
    """Get a specific conversation by ID with ownership verification."""
    query = db.query(Conversation).filter(Conversation.id == conversation_id)
    if user_id is not None:
        query = query.filter(Conversation.user_id == user_id)
    return query.first()


def add_message(
    db: Session,
    conversation_id: int,
    role: str,
    content: str
) -> Message:
    """Add a user or assistant message to a conversation thread."""
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def delete_conversation(
    db: Session,
    conversation_id: int,
    user_id: Optional[int] = None
) -> bool:
    """Delete a conversation and all its messages."""
    conversation = get_conversation_by_id(db, conversation_id, user_id=user_id)
    if not conversation:
        return False

    db.delete(conversation)
    db.commit()
    return True


def update_conversation_title(
    db: Session,
    conversation_id: int,
    title: str,
    user_id: Optional[int] = None
) -> Optional[Conversation]:
    """Update title of a conversation session."""
    conversation = get_conversation_by_id(db, conversation_id, user_id=user_id)
    if not conversation:
        return None

    conversation.title = title
    db.commit()
    db.refresh(conversation)
    return conversation
