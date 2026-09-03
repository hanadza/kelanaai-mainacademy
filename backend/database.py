from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# load .env so os.getenv() can read it
load_dotenv()
#connection string from .env - never hardcode secrets
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL belum dikonfigurasi. Buat file .env di root project "
        "dan isi DATABASE_URL PostgreSQL."
    )

# engine = the connection pool
engine = create_engine(DATABASE_URL)
# SessionLocal = a factory for DB sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Base = all ORM models inherit from this
Base = declarative_base()

# create all tables
def init_db() -> None:
    """Create all SQLAlchemy tables for the configured database and migrate columns if needed."""
    from models.user import User  # noqa: F401
    from models.trip import Trip  # noqa: F401
    from models.conversation import Conversation, Message  # noqa: F401
    from sqlalchemy import text

    Base.metadata.create_all(bind=engine)

    # Check and add user_id column to trips if it doesn't exist yet
    with engine.connect() as conn:
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='trips' AND column_name='user_id'
                ) THEN
                    ALTER TABLE trips ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
                END IF;
            END $$;
        """))
        conn.commit()