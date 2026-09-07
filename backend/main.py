from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Optional, List, Dict
import os
import re
import random
from datetime import datetime, timedelta, timezone
from google.oauth2 import id_token


from google.auth.transport import requests as google_requests

from sqlalchemy.orm import Session
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation_recommendation,
    get_travel_season,
)
from services.bedrock_service import get_ai_recommendation
from services.kb_service import ask_knowledge_base
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_optional_current_user,
    get_db,
)
from services.conversation_service import (
    create_conversation,
    get_user_conversations,
    get_conversation_by_id,
    add_message,
    delete_conversation,
    update_conversation_title,
)
from database import init_db
from models.trip import Trip
from models.user import User
from models.conversation import Conversation, Message

load_dotenv()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleLoginRequest(BaseModel):
    credential: Optional[str] = None
    token: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    google_id: Optional[str] = None
    avatar: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str


class VerifyOTPRequest(BaseModel):
    email: str
    otp: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str




class TripRequest(BaseModel):
    destination:    str
    days:           int
    budget:         float
    month:          str
    travel_style:   str

class TripUpdate(BaseModel):
    budget: float


class ChatMessage(BaseModel):
    role: str
    content: str


class UserDocument(BaseModel):
    name: str
    content: str


class ConversationCreateRequest(BaseModel):
    title: Optional[str] = "Obrolan Baru"


class ConversationTitleUpdate(BaseModel):
    title: str


class MessageCreateRequest(BaseModel):
    content: str


class QuestionRequest(BaseModel):
    question: str
    conversation_id: Optional[int] = None
    history: Optional[List[ChatMessage]] = None
    user_documents: Optional[List[UserDocument]] = None

# FastAPI validates the JSON body against this model
# If a field is missing or wrong type, it returns 422 automatically


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# a GET endpoint at the root path
@app.get("/")
def home():
  return {
    "message" : "Welcome to KelanaAI"
  }

# a GET health endpoint at the root path
@app.get("/health")
def health():
  return {
    "status" : "Ok"
  }

  # a GET trip categories list endpoint at the root path
@app.get("/trip-categories")
def trip_category():
    return ["Backpacker", "Standart", "Luxury"]

# a GET recommendations place list endpoint at the root path
@app.get("/api/v1/recommendations")
def recommendations():
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]

# a GET transportations list endpoint at the root path
@app.get("/api/v1/transportations")
def transportations():
    return ["Bus", "Train", "Flight"]


@app.post("/api/v1/auth/register", status_code=201)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # 1. Validate Name (letters, spaces, hyphens, apostrophes only)
    clean_name = request.name.strip()
    if not clean_name or not re.match(r"^[a-zA-Z\s'-]+$", clean_name):
        raise HTTPException(
            status_code=400,
            detail="Nama hanya boleh berisi huruf dan spasi."
        )

    # 2. Validate Email format
    clean_email = request.email.strip().lower()
    email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not clean_email or not re.match(email_regex, clean_email):
        raise HTTPException(
            status_code=400,
            detail="Format email tidak valid (contoh: user@email.com)."
        )

    # 3. Validate Password requirements
    if len(request.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password minimal 8 karakter."
        )
    if not re.search(r"[0-9]", request.password):
        raise HTTPException(
            status_code=400,
            detail="Password harus mengandung minimal 1 angka."
        )
    if not re.search(r"[^A-Za-z0-9]", request.password):
        raise HTTPException(
            status_code=400,
            detail="Password harus mengandung minimal 1 karakter spesial (contoh: $, !, @, %, &)."
        )
    if request.password.strip() != request.password:
        raise HTTPException(
            status_code=400,
            detail="Password tidak boleh diawali atau diakhiri dengan spasi."
        )

    # 4. Check duplicate email in PostgreSQL DB
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email sudah terdaftar. Silakan gunakan email lain atau masuk."
        )

    # Hash password and create User (never store plain text)
    hashed_password = hash_password(request.password)
    user = User(
        name=clean_name,
        email=clean_email,
        password_hash=hashed_password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        }
    }


@app.post("/api/v1/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email atau password yang Anda masukkan salah."
        )
    if not user.password_hash or not verify_password(request.password, user.password_hash):
        if user.google_id and not user.password_hash:
            raise HTTPException(
                status_code=401,
                detail="Akun ini terdaftar menggunakan Google. Silakan masuk menggunakan tombol 'Masuk dengan Google'."
            )
        raise HTTPException(
            status_code=401,
            detail="Email atau password yang Anda masukkan salah."
        )

    # Generate JWT access token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "name": user.name}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "google_id": user.google_id,
            "avatar": user.avatar,
        }
    }


@app.post("/api/v1/auth/google")
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Google Sign-In/Sign-Up endpoint.
    Decodes/verifies Google ID token or token payload to extract email, name, google_id, avatar.
    Upserts user record into PostgreSQL users table and returns KelanaAI JWT token.
    """
    token = request.credential or request.token
    email = request.email
    name = request.name
    google_id = request.google_id
    avatar = request.avatar
    google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")

    if token:
        verified_info = None
        # 1. Try Google ID Token verification
        try:
            verified_info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                google_client_id if google_client_id else None
            )
        except Exception:
            pass

        # 2. Fallback to Google Userinfo endpoint if token is an OAuth2 Access Token
        if not verified_info:
            try:
                import requests
                resp = requests.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=5
                )
                if resp.status_code == 200:
                    verified_info = resp.json()
            except Exception:
                pass

        if verified_info:
            email = verified_info.get("email") or email
            name = verified_info.get("name") or name or (email.split("@")[0] if email else "Google User")
            google_id = verified_info.get("sub") or google_id
            avatar = verified_info.get("picture") or avatar

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email wajib ada untuk otentikasi Google."
        )

    # Search user by google_id first, then email
    user = None
    if google_id:
        user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create new user record in PostgreSQL DB
        user = User(
            name=name or email.split("@")[0],
            email=email,
            google_id=google_id,
            password_hash=None,
            avatar=avatar,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Sync google_id, avatar, and name if updated
        updated = False
        if google_id and not user.google_id:
            user.google_id = google_id
            updated = True
        if avatar and user.avatar != avatar:
            user.avatar = avatar
            updated = True
        if name and user.name != name:
            user.name = name
            updated = True
        if updated:
            db.commit()
            db.refresh(user)

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "name": user.name}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "google_id": user.google_id,
            "avatar": user.avatar,
        }
    }




# Challenge Endpoint: GET /api/v1/auth/me (Returns current user info and total trip count)
@app.get("/api/v1/auth/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_trips = db.query(Trip).filter(Trip.user_id == current_user.id).count()
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "google_id": current_user.google_id,
        "avatar": current_user.avatar,
        "total_trips": total_trips,
        "created_at": current_user.created_at,
    }


# Password Reset via OTP Endpoints
@app.post("/api/v1/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    clean_email = request.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email tidak ditemukan. Pastikan email yang Anda masukkan sudah terdaftar."
        )
    if not user.password_hash:
        raise HTTPException(
            status_code=400,
            detail="Akun ini terdaftar via Google. Silakan masuk langsung menggunakan tombol 'Masuk dengan Google'."
        )

    # Generate 6-digit OTP code valid for 15 minutes
    otp = f"{random.randint(100000, 999999)}"
    user.reset_otp = otp
    user.reset_otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.commit()

    print(f"[OTP LOG] Reset OTP code for {clean_email}: {otp}")

    return {
        "message": f"Kode OTP telah dikirim ke email {clean_email}.",
        "otp": otp
    }


@app.post("/api/v1/auth/verify-otp")
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    clean_email = request.email.strip().lower()
    clean_otp = request.otp.strip()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or user.reset_otp != clean_otp:
        raise HTTPException(
            status_code=400,
            detail="Kode OTP yang Anda masukkan salah."
        )

    if user.reset_otp_expires_at:
        expires_at = user.reset_otp_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=400,
                detail="Kode OTP telah kadaluarsa (berlaku 15 menit). Silakan minta kode baru."
            )

    return {"message": "Kode OTP valid. Silakan masukkan password baru."}


@app.post("/api/v1/auth/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    clean_email = request.email.strip().lower()
    clean_otp = request.otp.strip()
    new_password = request.new_password

    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password baru minimal 8 karakter."
        )
    if not re.search(r"[0-9]", new_password):
        raise HTTPException(
            status_code=400,
            detail="Password baru harus mengandung minimal 1 angka."
        )
    if not re.search(r"[^A-Za-z0-9]", new_password):
        raise HTTPException(
            status_code=400,
            detail="Password baru harus mengandung minimal 1 karakter spesial (contoh: $, !, @, %, &)."
        )
    if new_password.strip() != new_password:
        raise HTTPException(
            status_code=400,
            detail="Password baru tidak boleh diawali atau diakhiri dengan spasi."
        )

    user = db.query(User).filter(User.email == clean_email).first()
    if not user or user.reset_otp != clean_otp:
        raise HTTPException(
            status_code=400,
            detail="Kode OTP salah atau telah terpakai."
        )

    if user.reset_otp_expires_at:
        expires_at = user.reset_otp_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=400,
                detail="Kode OTP telah kadaluarsa. Silakan minta kode baru."
            )

    # Hash new password, update User, and clear OTP
    user.password_hash = hash_password(new_password)
    user.reset_otp = None
    user.reset_otp_expires_at = None
    db.commit()

    return {"message": "Password Anda berhasil diperbarui! Silakan masuk dengan password baru Anda."}


# Protected Trip Endpoints (Session 8 Parts 5 & 6 + Homework Ownership Protection 403)
@app.get("/api/v1/trips")
def list_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Filter trips belonging exclusively to current_user
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).order_by(Trip.id.desc()).all()
    return trips


@app.get("/api/v1/trips/{trip_id}")
def get_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this trip")
    return trip


@app.post("/api/v1/trips")
def create_trip(
    request: TripRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    travel_season = get_travel_season(request.month)
    ai_recommendation = get_ai_recommendation(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        month=request.month,
        travel_style=request.travel_style,
        travel_season=travel_season,
    )

    # Automatically assign user_id from the authenticated JWT token
    trip = Trip(
        user_id             = current_user.id,
        destination         = request.destination,
        days                = request.days,
        month               = request.month,
        travel_season       = travel_season,
        budget              = request.budget,
        daily_budget        = daily_budget,
        travel_style        = request.travel_style,
        category            = category,        
        ai_recommendation   = ai_recommendation,
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@app.post("/api/v1/trips/{id}/generate")
def generate_trip_recommendation(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {id} not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this trip")

    try:
        recommendation = get_ai_recommendation(
            destination=trip.destination,
            days=trip.days,
            budget=trip.budget,
            month=trip.month,
            travel_style=trip.travel_style,
            travel_season=trip.travel_season,
        )

        trip.ai_recommendation = recommendation
        db.commit()
        db.refresh(trip)

        return {
            "id": trip.id,
            "destination": trip.destination,
            "ai_recommendation": trip.ai_recommendation
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI recommendation: {str(e)}"
        )


@app.put("/api/v1/trips/{trip_id}")
def update_trip(
    trip_id: int,
    trip_data: TripUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this trip")

    trip.budget = trip_data.budget
    trip.category = get_trip_category(trip_data.budget)
    trip.daily_budget = calculate_daily_budget(trip_data.budget, trip.days)

    db.commit()
    db.refresh(trip)
    return trip


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this trip")

    db.delete(trip)
    db.commit()

    return {
        "message": f"Trip with id {trip_id} successfully deleted"
    }


# Session 10 - Conversation History & Memory Endpoints

def format_local_timestamp(dt: Optional[datetime]) -> str:
    """Convert UTC or naive datetime to local machine timezone formatted as HH:MM."""
    if not dt:
        return ""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone().strftime("%H:%M")


@app.get("/api/v1/conversations")
def list_conversations(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """List all previous conversations for authenticated user or guest (Session 10 Part 3)."""
    user_id = current_user.id if current_user else None
    convs = get_user_conversations(db, user_id=user_id)
    return [
        {
            "id": c.id,
            "conversation_id": c.id,
            "title": c.title,
            "user_id": c.user_id,
            "created_at": c.created_at.astimezone().strftime("%Y-%m-%d %H:%M") if c.created_at else "",
            "messages_count": len(c.messages),
        }
        for c in convs
    ]


@app.post("/api/v1/conversations", status_code=201)
def create_new_conversation(
    request: Optional[ConversationCreateRequest] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Create a new conversation row and return its identifier (Session 10 Part 3)."""
    user_id = current_user.id if current_user else None
    title = request.title if request and request.title else "Obrolan Baru"
    conv = create_conversation(db, title=title, user_id=user_id)
    return {
        "conversation_id": conv.id,
        "id": str(conv.id),
        "title": conv.title,
        "user_id": conv.user_id,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "messages": [],
    }


@app.get("/api/v1/conversations/{conversation_id}")
def get_conversation_detail(
    conversation_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific conversation and all its messages."""
    user_id = current_user.id if current_user else None
    conv = get_conversation_by_id(db, conversation_id=conversation_id, user_id=user_id)
    if not conv:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")

    return {
        "conversation_id": conv.id,
        "id": str(conv.id),
        "title": conv.title,
        "user_id": conv.user_id,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "messages": [
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None,
                "timestamp": format_local_timestamp(m.created_at),
            }
            for m in conv.messages
        ],
    }


@app.delete("/api/v1/conversations/{conversation_id}")
def remove_conversation(
    conversation_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Delete a conversation thread."""
    user_id = current_user.id if current_user else None
    success = delete_conversation(db, conversation_id=conversation_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
    return {"message": f"Conversation {conversation_id} deleted successfully"}


@app.patch("/api/v1/conversations/{conversation_id}")
@app.patch("/api/v1/conversations/{conversation_id}/title")
def rename_conversation(
    conversation_id: int,
    request: ConversationTitleUpdate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Update title of a conversation (Bonus Challenge: Rename Conversations)."""
    user_id = current_user.id if current_user else None
    conv = update_conversation_title(db, conversation_id=conversation_id, title=request.title, user_id=user_id)
    if not conv:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
    return {"conversation_id": conv.id, "id": str(conv.id), "title": conv.title}


# Session 10 Part 4 — Send Message API Endpoint (Orchestration Flow)
@app.post("/api/v1/conversations/{conversation_id}/messages")
def send_message_endpoint(
    conversation_id: int,
    request: MessageCreateRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Session 10 Part 4 & Part 5 - Send Message API with Prompt Builder.
    7-Step Orchestration:
    01. Receive User Message
    02. Save Message (in DB)
    03. Load Previous Messages (from DB)
    04. Build Prompt (Context-Aware Prompt Builder)
    05. Query Amazon Bedrock
    06. Save AI Response (in DB)
    07. Return Response
    """
    try:
        user_id = current_user.id if current_user else None
        conversation = get_conversation_by_id(db, conversation_id=conversation_id, user_id=user_id)

        if not conversation:
            default_title = request.content[:30] + ("..." if len(request.content) > 30 else "")
            conversation = create_conversation(db, title=default_title, user_id=user_id)

        # Step 01 & 02: Save User Message
        add_message(db, conversation_id=conversation.id, role="user", content=request.content)

        # Step 03 & 04: Load Previous Messages & Build Context-Aware Prompt History
        # (Session 10 Part 8: Trim Context Window to last N turns for efficiency & token limit safety)
        MAX_HISTORY_TURNS = 20
        db.refresh(conversation)
        history_payload = [
            {"role": m.role, "content": m.content}
            for m in conversation.messages
        ][-MAX_HISTORY_TURNS:]

        # Step 05: Call Amazon Bedrock with Context-Aware Prompt
        answer = ask_knowledge_base(
            question=request.content,
            history=history_payload,
        )

        # Step 06: Save AI Response in DB
        add_message(db, conversation_id=conversation.id, role="assistant", content=answer)

        # Auto update session title if default "Obrolan Baru"
        if conversation.title == "Obrolan Baru":
            new_title = request.content[:30] + ("..." if len(request.content) > 30 else "")
            update_conversation_title(db, conversation_id=conversation.id, title=new_title, user_id=user_id)

        # Step 07: Return Response
        return {
            "conversation_id": conversation.id,
            "question": request.content,
            "answer": answer,
            "history": [
                {
                    "id": m.id,
                    "role": m.role,
                    "content": m.content,
                    "created_at": m.created_at.isoformat() if m.created_at else None,
                    "timestamp": format_local_timestamp(m.created_at),
                }
                for m in conversation.messages
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process message: {str(e)}"
        )


# Session 9 & 10 - RAG Knowledge Base Endpoint with Persistent Memory
@app.post("/api/v1/ask")
def ask_endpoint(
    request: QuestionRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Knowledge Base RAG endpoint with persistent conversation memory.
    Saves user questions and AI responses to PostgreSQL and feeds complete
    conversation history to Bedrock so the AI remembers context across turns.
    """
    try:
        user_id = current_user.id if current_user else None
        conversation = None

        # 1. Retrieve or create conversation session in DB
        if request.conversation_id:
            conversation = get_conversation_by_id(db, conversation_id=request.conversation_id, user_id=user_id)

        if not conversation:
            default_title = request.question[:30] + ("..." if len(request.question) > 30 else "")
            conversation = create_conversation(db, title=default_title, user_id=user_id)

        # Server-side Guest Quota Guard (3 questions max)
        if current_user is None:
            user_msg_count = sum(1 for m in conversation.messages if m.role == "user")
            if user_msg_count >= 3:
                raise HTTPException(
                    status_code=403,
                    detail="Batas 3 pertanyaan gratis tercapai. Silakan Login atau Register untuk terus bertanya tanpa batas & menyimpan riwayat!"
                )

        # 2. Persist the new user question message in DB
        add_message(db, conversation_id=conversation.id, role="user", content=request.question)

        # 3. Retrieve messages to build multi-turn memory (trimmed to last N turns per Part 8)
        MAX_HISTORY_TURNS = 20
        db.refresh(conversation)

        history_payload = [
            {"role": m.role, "content": m.content}
            for m in conversation.messages
        ][-MAX_HISTORY_TURNS:]

        user_docs_list = [doc.model_dump() for doc in request.user_documents] if request.user_documents else None

        # 4. Ask Knowledge Base RAG with complete conversation memory history
        answer = ask_knowledge_base(
            question=request.question,
            history=history_payload,
            user_documents=user_docs_list,
        )

        # 5. Persist the AI assistant response message in DB
        add_message(db, conversation_id=conversation.id, role="assistant", content=answer)

        # 6. Auto-update title if it's currently default "Obrolan Baru"
        if conversation.title == "Obrolan Baru":
            new_title = request.question[:30] + ("..." if len(request.question) > 30 else "")
            update_conversation_title(db, conversation_id=conversation.id, title=new_title, user_id=user_id)

        return {
            "conversation_id": str(conversation.id),
            "question": request.question,
            "answer": answer,
            "history": [
                {
                    "id": str(m.id),
                    "role": m.role,
                    "content": m.content,
                    "created_at": m.created_at.isoformat() if m.created_at else None,
                    "timestamp": format_local_timestamp(m.created_at),
                }
                for m in conversation.messages
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"[ASK API ERROR] {e}")
        raise HTTPException(
            status_code=500,
            detail="Terjadi kendala koneksi ke server. Silakan coba lagi beberapa saat lagi."
        )