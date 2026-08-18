from fastapi import FastAPI
from pydantic import BaseModel
from backend.services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation_recommendation
)

app = FastAPI()

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str = "Standard"

# Welcome endpoint - the home route.
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
    daily_budget = calculate_daily_budget(
        request.budget, request.days
    )
    category = get_trip_category(
        request.budget
    )
    # Reusing business rule for transportation
    transportation = get_transportation_recommendation(
        request.travel_style
    )
    
    return {
        "destination" : request.destination,
        "budget" : request.budget,
        "daily_budget" : daily_budget,
        "category" : category,
        "recommendation_transport": transportation
    }

# Bonus: List Trip Categories
@app.get("/api/v1/trip-categories")
def get_trip_categories():
    return [
        "Backpacker",
        "Standard",
        "Luxury"
    ]

# Homework 01: Recommendations
@app.get("/api/v1/recommendations")
def get_recommendations():
    return [
        "Tokyo Tower",
        "Mount Fuji",
        "Shibuya"
    ]

# Homework 02: Transportations
@app.get("/api/v1/transportations")
def get_transportations():
    return [
        "Bus",
        "Train",
        "Flight"
    ]

# # Meet Sesi 1
# def print_trip_summary(destination, country, days, budget, currency, travel_month):
#     season = get_travel_season(travel_month)
#     print("\n=================================")
#     print("KelanaAI")
#     print("=================================")
#     print(f"Destination : {destination}")
#     print(f"Country     : {country}")
#     print(f"Days        : {days}")
#     print(f"Budget      : {budget} {currency}")
#     print(f"Currency    : {currency}")
#     print(f"Travel Month: {travel_month}")
#     print(f"Season      : {season}")
#     print("=================================\n")

# print("\n=================================")
# print("Input Data KelanaAI")
# print("=================================")
# destinations = []
# while True:
#     dest = input("Destination (type 'done' to finish): ")
#     if dest.lower() == 'done':
#         break
#     destinations.append(dest)

# print("Your Destinations", end="")
# for i, d in enumerate(destinations):
#     print(f" {i+1}. {d}", end="")
# print()

# destination = ", ".join(destinations)
# country = input("Country: ")
# days = int(input("Days: "))
# budget = float(input("Budget: "))
# currency = input("Currency: ")
# travel_month = input("Travel Month: ")

# print_trip_summary(destination, country, days, budget, currency, travel_month)


# # Challenge: Add a cost breakdown
# def print_cost_breakdown(hotel_cost, transportation_cost, food_cost, miscellaneous_cost):
#     total = hotel_cost + transportation_cost + food_cost + miscellaneous_cost
#     print("\n=================================")
#     print("Cost Breakdown")
#     print("=================================")
#     print(f"Hotel Cost: {hotel_cost}")
#     print(f"Transportation Cost: {transportation_cost}")
#     print(f"Food Cost: {food_cost}")
#     print(f"Miscellaneous Cost: {miscellaneous_cost}")
#     print("=================================")
#     print(f"Total Estimated Cost: {total}")
#     return total

# hotel_cost = float(input("Hotel Cost: "))
# transportation_cost = float(input("Transportation Cost: "))
# food_cost = float(input("Food Cost: "))
# miscellaneous_cost = float(input("Miscellaneous Cost: "))

# total_cost = print_cost_breakdown(hotel_cost, transportation_cost, food_cost, miscellaneous_cost)

# # Budget exceeded alert
# if total_cost > budget:
#     print(f"Budget exceeded by {total_cost - budget} {currency}!")
# else:
#     print(f"Budget is sufficient. Remaining budget: {budget - total_cost} {currency}")

# # Meet Sesi 2
# category = get_trip_category(budget)
# print(f"Travel Category: {category}")

# transportation = get_transportation_recommendation(category)
# print(f"Recommended Transportation: {transportation}")

# daily_budget = calculate_daily_budget(budget, days)
# print(f"Daily Budget: {daily_budget} {currency}/day")

# # List of Dictionaries
# print("\n=================================")
# print("Recommended Places")
# print("=================================")
# # Loop through the list of destinations
# for dest in destinations:
#     print(f"|=== {dest} ===|")
#     recommended_places = get_recommended_places(dest)
#     for place in recommended_places:
#         print(f" - {place}")
#     print("|===============|")