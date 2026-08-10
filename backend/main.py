#1
# Variables store the trip data
# destination = "Japan"
# days = 5
# budget = 1500
# travel_style = "Family"

#2
# destination = input("Destination: ")
# days = int(input("Days: "))
# budget = float(input("Budget: "))
# travel_style = input("Travel Style: ")

#1
# print(destination)
# print(days)
# print(budget)
# print(travel_style)

#2
# print("===========================")
# print(f"Destination: {destination}")
# print(f"Days: {days}")
# print(f"Budget: {budget}")
# print(f"Style: {travel_style}")

def print_trip_summary(destination, days, budget, travel_style):
    print("=================================")
    print("KalanaAI")
    print("=================================")
    print(f"Destination: {destination}")
    print(f"Days: {days}")
    print(f"Budget: {budget}")
    print(f"Style: {travel_style}")

print_trip_summary("Japan", 5, 1500, "Family")
print_trip_summary("Bali", 3, 800, "Backpacker")

# Core Challenge: Add a cost breakdown
hotel_cost = 500
transportation_cost = 200
food_cost = 300
miscellaneous_cost = 100

total = hotel_cost + transportation_cost + food_cost + miscellaneous_cost
print("=================================")
print(f"Hotel Cost: {hotel_cost}")
print(f"Transportation Cost: {transportation_cost}")
print(f"Food Cost: {food_cost}")
print(f"Miscellaneous Cost: {miscellaneous_cost}")
print(f"Total Estimated Cost: {total}")

# Bonus: Budget exceeded alert
budget = 1000
if total > budget:
    print("⚠️ Budget exceeded.")