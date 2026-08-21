from backend.models.trip import Trip

# 1. lib function
def calculate_daily_budget(budget, days):
    return budget / days

# 2. Conditional Logic
def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif budget < 3000:
        return "Standard"
    else:
        return "Luxury"

# 3. Data Structures (Dictionary)
def get_transportation_recommendation(category):
    if category == "Backpacker":
        return "Bus"
    elif category == "Standard":
        return "Train"
    else:
        return "Flight"

# 4. List inside Dictionary (Nested Data Structure)
def get_recommended_places(destination):
    recommendations = {
        "Japan": ["Tokyo Tower", "Shibuya", "Mount Fuji"],
        "Bali": ["Ubud", "Kuta Beach", "Tanah Lot"],
        "Singapore": ["Marina Bay Sands", "Gardens by the Bay", "Sentosa"],
    }
    
    return recommendations.get(destination, ["City Center", "Local Market", "Popular Landmark"])

# 5. Travel Season Logic
def get_travel_season(month):
    if month == "December" or month == "12":
        return "Peak Season"
    elif month == "June" or month == "6":
        return "Holiday Season"
    else:
        return "Regular Season"