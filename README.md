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

# Session 7: origin allowed to call the API (CORS). Defaults to
# http://localhost:3000 if not set - only needed to override for prod.
FRONTEND_URL=http://localhost:3000
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

## Session 7 - Connecting the Brain and the Face (Organize & Present Information)

### Why
Up to Session 6, `app/page.tsx` did everything: form state, `fetch()` calls, image lookup, Markdown parsing, and rendering. That doesn't scale. Session 7 splits KelanaAI into a proper multi-page app with a clean architecture - and makes sure the app talks to Amazon Bedrock only when it actually needs to (Part 1: "Don't call Bedrock every time").

### Project Structure
```
frontend/
├── app/
│   ├── page.tsx                    # / - single-screen trip form (generates a trip, then redirects)
│   ├── layout.tsx                  # Root layout & font configurations
│   ├── globals.css                 # Custom design tokens, retro-editorial styling, and theme
│   └── trips/
│       ├── page.tsx                # /trips - trip history dashboard (Server Component)
│       └── [id]/
│           ├── page.tsx            # /trips/[id] - trip detail (dynamic route)
│           └── not-found.tsx       # friendly 404 for a missing trip id
├── components/                      # Reusable UI components
│   ├── DeleteTripButton.tsx        # Delete action with safety confirmation modal
│   ├── EmptyState.tsx              # Fallback state when no trips exist
│   ├── ErrorState.tsx              # Error display with retry handler
│   ├── LoadingState.tsx            # Loading spinner and overlay
│   ├── Recommendation.tsx          # Markdown itinerary renderer
│   ├── TripCard.tsx                # Rich trip card (flags, budget formatting, color-coded badges)
│   ├── TripForm.tsx                # Travel planning form
│   └── TripListWithPagination.tsx  # Paginated list container (10 items per page)
├── lib/
│   ├── destinationHelpers.ts       # Flag emoji detector & currency formatter
│   ├── destinationImage.ts         # Photo lookup per destination
│   └── markdown.tsx                # Markdown parser + inline bold renderer
├── services/
│   └── tripService.ts              # Centralized API calls (getTrips, getTrip, generateTrip, deleteTrip)
├── types/
│   └── trip.ts                     # Trip / TripRequest TypeScript interfaces
└── public/                         # Static assets (world map image, icons)
```

### Features Implemented
- **Centralized API Service (`services/tripService.ts`)**: `getTrips()`, `getTrip(id)`, `generateTrip(data)`, and `deleteTrip(id)`. Pages import these helpers instead of making raw `fetch()` calls.
- **Dynamic Routing (`/trips/[id]`)**: Single template serving each trip detail with representative hero photography and formatted AI itinerary.
- **Delete Trip History**: Ability to delete saved trips from both the dashboard list and detail view with confirmation dialogs, calling `DELETE /api/v1/trips/{id}`.
- **Enhanced Trip Cards (`TripCard.tsx`)**:
  - 🚩 **Destination Flags/Icons**: Country flags (e.g., 🇯🇵 Japan, 🇮🇩 Indonesia/Bali, 🇮🇹 Italy, 🇫🇷 France, 🇺🇸 USA, 🇹🇭 Thailand) mapped automatically.
  - 💰 **Currency & Budget Formatting**: Clean formatting (e.g., `USD 2,000` instead of raw numbers).
  - 🏷️ **Color-Coded Category Badges**: Distinct badges for *Backpacker* (Amber), *Standard* (Emerald), and *Luxury* (Purple).
  - 🎒 **Travel Style Badges**: Visual tags with icons for *Family* (👨‍👩‍👧‍👦), *Solo* (🎒), *Couple* (💑), *Adventure* (🧗), *Cultural* (🏛️), and *Relaxing* (🏖️).
- **Pagination (`TripListWithPagination.tsx`)**: Automatic pagination controls (10 items per page) with page number buttons, item counts, and next/previous controls.
- **Single-Screen Homepage (`page.tsx`)**: Streamlined single-page viewport on desktop with a modal loading overlay when generating itineraries.
- **Consistent Retro Button Styling**: Unified yellow block action buttons with bold borders and offset drop-shadows.

### How to Run

1. **Start the Backend (Terminal 1):**
   ```powershell
   .venv\Scripts\Activate.ps1
   cd backend
   uvicorn main:app --reload --port 8000
   ```
   - API Docs: **[http://localhost:8000/docs](http://localhost:8000/docs)**

2. **Start the Frontend (Terminal 2):**
   ```powershell
   cd frontend
   npm run dev
   ```
   - Web App: **[http://localhost:3000](http://localhost:3000)**

### Testing the 3-Page Flow:
1. Open `http://localhost:3000`, enter your trip preferences, and click **Generate AI Trip**.
2. After the AI generation modal finishes, you will be automatically redirected to `http://localhost:3000/trips`.
3. View the new trip at the top of the history list with flags, badges, and formatted budget.
4. Click **View Details →** to inspect the full AI itinerary and travel breakdown.
5. Click **Delete Trip** (either from list or detail page) to safely remove the record from PostgreSQL.