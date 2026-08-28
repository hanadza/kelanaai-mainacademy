export interface Trip {
  id: number;
  destination: string;
  budget: number;
  days: number;
  month: string;
  travel_season: string;
  travel_style: string;
  category: string;
  daily_budget: number;
  ai_recommendation: string | null;
}

export interface TripRequest {
  destination: string;
  budget: number;
  days: number;
  month: string;
  travel_style: string;
}
