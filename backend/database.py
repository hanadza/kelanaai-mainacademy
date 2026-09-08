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

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

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

    # Execute migrations for user_id in trips and google_id / avatar in users table
    with engine.connect() as conn:
        conn.execute(text("""
            DO $$
            BEGIN
                -- Add user_id to trips table if not existing
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='trips' AND column_name='user_id'
                ) THEN
                    ALTER TABLE trips ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
                END IF;

                -- Add google_id to users table if not existing
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='google_id'
                ) THEN
                    ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
                    CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users(google_id);
                END IF;

                -- Add avatar to users table if not existing
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='avatar'
                ) THEN
                    ALTER TABLE users ADD COLUMN avatar VARCHAR(512);
                END IF;

                -- Make password_hash nullable for OAuth users
                ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

                -- Add reset_otp to users table if not existing
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='reset_otp'
                ) THEN
                    ALTER TABLE users ADD COLUMN reset_otp VARCHAR(10);
                END IF;

                -- Add reset_otp_expires_at to users table if not existing
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='reset_otp_expires_at'
                ) THEN
                    ALTER TABLE users ADD COLUMN reset_otp_expires_at TIMESTAMP WITH TIME ZONE;
                END IF;
            END $$;
        """))
        conn.commit()