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
1. Make sure your virtual environment is activated and you have a `.env` file in the project root with your `DATABASE_URL`.
2. Ensure your PostgreSQL server is running and the database (e.g., `kelana_db`) is created.
3. Start the FastAPI server from the `backend/` folder because the application imports `database`, `models`, and `services` directly:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
4. Open the interactive API documentation at:
   **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

## Session 5 - from rule-based logic to your first AI-Generated itinerary

### Features Added
- Integrated **AWS Bedrock Runtime** with the Amazon Nova Lite model.
- Added an AI prompt that generates a detailed itinerary based on destination, duration, budget, month, travel season, and travel style.
- The generated itinerary includes morning, afternoon, and evening activities, transportation, and estimated costs.
- Stored the AI-generated recommendation in the `ai_recommendation` column of each trip.
- Added an endpoint to generate or regenerate an itinerary for an existing trip.

### AWS Bedrock Configuration
Create a `.env` file in the project root and add the required configuration:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kelana_db
AWS_BEARER_TOKEN_BEDROCK=your_bedrock_token
AWS_REGION=ap-southeast-2
MODEL_ID=amazon.nova-lite-v1:0
```

Do not commit `.env` or expose the Bedrock token. The `.env` file is already excluded by `.gitignore`.

### AI Itinerary Endpoints
- `POST /api/v1/trips` : Creates and saves a trip, then generates an AI itinerary.
- `POST /api/v1/trips/{id}/generate` : Generates or regenerates the AI itinerary for an existing trip.

Example request for `POST /api/v1/trips`:

```json
{
  "destination": "Japan",
  "days": 5,
  "budget": 2000,
  "month": "April",
  "travel_style": "Family"
}
```

The API returns the saved trip together with the generated Markdown itinerary in `ai_recommendation`.

## Session 6 - Next.js Frontend

Session 6 adds a web interface so users can interact with KelanaAI through a browser instead of calling the API directly.

### Features Added

- Created a **Next.js** frontend using React and TypeScript in the `frontend/` folder.
- Built a travel form for destination, budget, duration, month, and travel style.
- Connected the form to `POST http://localhost:8000/api/v1/trips` using the browser `fetch` API.
- Displays the generated trip details and AI itinerary returned by Amazon Bedrock.
- Parses the Markdown itinerary into headings, paragraphs, and bullet lists for readable rendering.
- Added destination imagery with a fallback image for unsupported destinations.
- Added loading and error states, including a retry action when the API request fails.

### Run the Full Application

Start the backend in one terminal:

```bash
source .venv/bin/activate
cd backend
uvicorn main:app --reload
```

Start the Next.js frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at **[http://localhost:3000](http://localhost:3000)**. The frontend expects the FastAPI backend to be available at **[http://localhost:8000](http://localhost:8000)**.

### Frontend Structure

- `frontend/app/page.tsx` : Main planner page, form handling, API request, and itinerary display.
- `frontend/app/globals.css` : Global styles, responsive layout, loading animation, and error state styling.
- `frontend/public/` : Static assets used by the frontend.