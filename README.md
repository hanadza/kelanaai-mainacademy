# KelanaAI

## Session 1 Homework - Enrich the Trip Summary

This project contains a Python script (`backend/main.py`) that collects trip details from the user via input and prints a formatted trip summary.

### Features

- Reads destination, country, days, budget, currency, and travel month.
- Displays a formatted trip summary using f-strings.
- Challenge: Calculates and displays cost breakdown.
- Alerts if budget is exceeded.

## Session 2 Homework - Layered Architecture & Business Rules

### Features Added
- Extracted business logic into `services/trip_service.py`.
- Added logic for Travel Category, Transportation Recommendation, and Multiple Destinations.
- Added Travel Season recommendation based on month.

## Session 3 - Web API with FastAPI & Pydantic

### Features Added
- Converted the CLI application into a REST API using **FastAPI**.
- Used **Pydantic** to validate incoming JSON requests (`TripRequest`).
- Reused existing business logic from `trip_service.py` to process API requests.
- Explored API interaction via auto-generated **Swagger UI**.

### Endpoints Available
- `GET /` : Welcome page.
- `GET /health` : API Health check for monitoring.
- `POST /api/v1/trips` : Core endpoint to calculate daily budget and get travel & transport recommendations based on budget and travel style.
- `GET /api/v1/trip-categories` : (Bonus) Lists all valid trip categories.
- `GET /api/v1/recommendations` : (Homework) Lists sample recommended places.
- `GET /api/v1/transportations` : (Homework) Lists available transportation modes.

### How to Run
1. Make sure your virtual environment is activated.
2. Start the FastAPI server using Uvicorn from the root folder:
   ```bash
   uvicorn backend.main:app --reload
   ```
3. Open the interactive API documentation at:
   **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**