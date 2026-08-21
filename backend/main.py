from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend.services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation_recommendation
)
from backend.models.trip import Trip
from backend.database import SessionLocal, init_db

app = FastAPI()

@app.on_event("startup")
def on_startup():
    init_db()
    
class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str = "Standard"

class UpdateTripRequest(BaseModel):
    budget: float

@app.get("/")
def home():
    return {
        "message" : "Welcome to KelanaAI"
    }

# Health check - used by hosting platforms.
@app.get("/health")
def health():
    return {
        "status": "OK"
    }

# POST endpoint - receives JSON, returns JSON
@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    # reuse Session 2 business logic
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    
    # create a Trip ORM object
    trip = Trip(
        destination = request.destination,
        days        = request.days,
        budget      = request.budget,
        category    = category,
        daily_budget = daily_budget,
    )
    
    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()
    return trip

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip

@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: UpdateTripRequest):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        
    # Update budget and recalculate
    trip.budget = request.budget
    trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)
    trip.category = get_trip_category(trip.budget)
    
    db.commit()
    db.refresh(trip)
    db.close()
    
    return trip

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        
    db.delete(trip)
    db.commit()
    db.close()
    
    return {"message": f"Trip {trip_id} successfully deleted"}

# List Trip Categories
@app.get("/api/v1/trip-categories")
def get_trip_categories():
    return [
        "Backpacker",
        "Standard",
        "Luxury"
    ]

@app.get("/api/v1/recommendations")
def get_recommendations():
    return [
        "Tokyo Tower",
        "Mount Fuji",
        "Shibuya"
    ]

@app.get("/api/v1/transportations")
def get_transportations():
    return [
        "Bus",
        "Train",
        "Flight"
    ]