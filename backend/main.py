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

def print_trip_summary(destination, country, days, budget, currency, travel_month):
    print("\n=================================")
    print("KelanaAI")
    print("=================================")
    print(f"Destination : {destination}")
    print(f"Country     : {country}")
    print(f"Days        : {days}")
    print(f"Budget      : {budget} {currency}")
    print(f"Currency    : {currency}")
    print(f"Travel Month: {travel_month}")
    print("=================================\n")

destination = input("Destination: ")
country = input("Country: ")
days = int(input("Days: "))
budget = float(input("Budget: "))
currency = input("Currency: ")
travel_month = input("Travel Month: ")

print_trip_summary(destination, country, days, budget, currency, travel_month)


# Challenge: Add a cost breakdown
def print_cost_breakdown(hotel_cost, transportation_cost, food_cost, miscellaneous_cost):
    total = hotel_cost + transportation_cost + food_cost + miscellaneous_cost
    print("\n=================================")
    print("Cost Breakdown")
    print("=================================")
    print(f"Hotel Cost: {hotel_cost}")
    print(f"Transportation Cost: {transportation_cost}")
    print(f"Food Cost: {food_cost}")
    print(f"Miscellaneous Cost: {miscellaneous_cost}")
    print("=================================")
    print(f"Total Estimated Cost: {total}")
    return total

hotel_cost = float(input("Hotel Cost: "))
transportation_cost = float(input("Transportation Cost: "))
food_cost = float(input("Food Cost: "))
miscellaneous_cost = float(input("Miscellaneous Cost: "))

total_cost = print_cost_breakdown(hotel_cost, transportation_cost, food_cost, miscellaneous_cost)

# Budget exceeded alert
if total_cost > budget:
    print(f"Budget exceeded by {total_cost - budget} {currency}!")
else:
    print(f"Budget is sufficient. Remaining budget: {budget - total_cost} {currency}")