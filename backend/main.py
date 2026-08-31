from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from sqlalchemy.orm import Session
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation_recommendation,
    get_travel_season,
)
from services.bedrock_service import get_ai_recommendation
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_db,
)
from database import init_db
from models.trip import Trip
from models.user import User

load_dotenv()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TripRequest(BaseModel):
    destination:    str
    days:           int
    budget:         float
    month:          str
    travel_style:   str

class TripUpdate(BaseModel):
    budget: float

# FastAPI validates the JSON body against this model
# If a field is missing or wrong type, it returns 422 automatically


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Reads the Next.js origin from backend/.env (FRONTEND_URL). In
    # production this is the only line you change - e.g. to your Vercel URL.
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://127.0.0.1:3000",
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


# Auth Endpoints (Session 8)
@app.post("/api/v1/auth/register", status_code=201)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    # Hash password and create User (never store plain text)
    hashed_password = hash_password(request.password)
    user = User(
        name=request.name,
        email=request.email,
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
    if not user or not verify_password(request.password, user.password_hash):
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
        "total_trips": total_trips,
        "created_at": current_user.created_at,
    }


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