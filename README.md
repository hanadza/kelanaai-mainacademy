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

## Session 4 - Persistent Data with PostgreSQL & SQLAlchemy (CRUD)

### Features Added
- Integrated **PostgreSQL** database to save trip data persistently.
- Implemented **SQLAlchemy ORM** to interact with the database using Python objects instead of Raw SQL.
- Structured the project by separating database configuration (`backend/database.py`) and data models (`backend/models/trip.py`).
- Used **python-dotenv** to securely load database credentials from a `.env` file.
- **Completed full CRUD API:**
  - `POST /api/v1/trips` : Saves the new trip to PostgreSQL and auto-generates an ID and `created_at` timestamp.
  - `GET /api/v1/trips` : Retrieves all saved trips from the database.
  - `GET /api/v1/trips/{id}` : Retrieves a specific trip by its ID.
  - `PUT /api/v1/trips/{id}` : Updates the budget of an existing trip and recalculates its category and daily budget.
  - `DELETE /api/v1/trips/{id}` : Deletes a trip from the database.

### How to Run
1. Make sure your virtual environment is activated and you have a `.env` file inside the `backend/` folder with your `DATABASE_URL`.
2. Ensure your PostgreSQL server is running and the database (e.g., `kelana_db`) is created.
3. Start the FastAPI server using Uvicorn from the root folder:
   ```bash
   uvicorn backend.main:app --reload
   ```
4. Open the interactive API documentation at:
   **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**