export interface DestinationItem {
  name: string;
  country: string;
  flag: string;
  popular?: boolean;
}

export const DESTINATION_CATALOG: DestinationItem[] = [
  { name: "Japan", country: "Japan", flag: "🇯🇵", popular: true },
  { name: "Tokyo, Japan", country: "Japan", flag: "🇯🇵" },
  { name: "Kyoto, Japan", country: "Japan", flag: "🇯🇵" },
  { name: "Osaka, Japan", country: "Japan", flag: "🇯🇵" },
  { name: "Bali, Indonesia", country: "Indonesia", flag: "🇮🇩", popular: true },
  { name: "Indonesia", country: "Indonesia", flag: "🇮🇩" },
  { name: "Yogyakarta, Indonesia", country: "Indonesia", flag: "🇮🇩" },
  { name: "Lombok, Indonesia", country: "Indonesia", flag: "🇮🇩" },
  { name: "Italy", country: "Italy", flag: "🇮🇹", popular: true },
  { name: "Rome, Italy", country: "Italy", flag: "🇮🇹" },
  { name: "Florence, Italy", country: "Italy", flag: "🇮🇹" },
  { name: "Venice, Italy", country: "Italy", flag: "🇮🇹" },
  { name: "Paris, France", country: "France", flag: "🇫🇷" },
  { name: "France", country: "France", flag: "🇫🇷", popular: true },
  { name: "Nice, France", country: "France", flag: "🇫🇷" },
  { name: "Thailand", country: "Thailand", flag: "🇹🇭", popular: true },
  { name: "Bangkok, Thailand", country: "Thailand", flag: "🇹🇭" },
  { name: "Phuket, Thailand", country: "Thailand", flag: "🇹🇭" },
  { name: "South Korea", country: "South Korea", flag: "🇰🇷", popular: true },
  { name: "Seoul, South Korea", country: "South Korea", flag: "🇰🇷" },
  { name: "Jeju Island, South Korea", country: "South Korea", flag: "🇰🇷" },
  { name: "Singapore", country: "Singapore", flag: "🇸🇬", popular: true },
  { name: "Malaysia", country: "Malaysia", flag: "🇲🇾" },
  { name: "Kuala Lumpur, Malaysia", country: "Malaysia", flag: "🇲🇾" },
  { name: "Penang, Malaysia", country: "Malaysia", flag: "🇲🇾" },
  { name: "Vietnam", country: "Vietnam", flag: "🇻🇳" },
  { name: "Hanoi, Vietnam", country: "Vietnam", flag: "🇻🇳" },
  { name: "Da Nang, Vietnam", country: "Vietnam", flag: "🇻🇳" },
  { name: "United States", country: "USA", flag: "🇺🇸" },
  { name: "New York, USA", country: "USA", flag: "🇺🇸" },
  { name: "California, USA", country: "USA", flag: "🇺🇸" },
  { name: "Hawaii, USA", country: "USA", flag: "🇺🇸" },
  { name: "United Kingdom", country: "UK", flag: "🇬🇧" },
  { name: "London, UK", country: "UK", flag: "🇬🇧" },
  { name: "Edinburgh, UK", country: "UK", flag: "🇬🇧" },
  { name: "Australia", country: "Australia", flag: "🇦🇺" },
  { name: "Sydney, Australia", country: "Australia", flag: "🇦🇺" },
  { name: "Melbourne, Australia", country: "Australia", flag: "🇦🇺" },
  { name: "Germany", country: "Germany", flag: "🇩🇪" },
  { name: "Berlin, Germany", country: "Germany", flag: "🇩🇪" },
  { name: "Munich, Germany", country: "Germany", flag: "🇩🇪" },
  { name: "Spain", country: "Spain", flag: "🇪🇸" },
  { name: "Barcelona, Spain", country: "Spain", flag: "🇪🇸" },
  { name: "Madrid, Spain", country: "Spain", flag: "🇪🇸" },
  { name: "Switzerland", country: "Switzerland", flag: "🇨🇭" },
  { name: "Interlaken, Switzerland", country: "Switzerland", flag: "🇨🇭" },
  { name: "Turkey", country: "Turkey", flag: "🇹🇷" },
  { name: "Istanbul, Turkey", country: "Turkey", flag: "🇹🇷" },
  { name: "Cappadocia, Turkey", country: "Turkey", flag: "🇹🇷" },
  { name: "Dubai, UAE", country: "UAE", flag: "🇦🇪" },
  { name: "United Arab Emirates", country: "UAE", flag: "🇦🇪" },
  { name: "Egypt", country: "Egypt", flag: "🇪🇬" },
  { name: "Cairo, Egypt", country: "Egypt", flag: "🇪🇬" },
  { name: "Greece", country: "Greece", flag: "🇬🇷" },
  { name: "Santorini, Greece", country: "Greece", flag: "🇬🇷" },
  { name: "Athens, Greece", country: "Greece", flag: "🇬🇷" },
  { name: "Netherlands", country: "Netherlands", flag: "🇳🇱" },
  { name: "Amsterdam, Netherlands", country: "Netherlands", flag: "🇳🇱" },
  { name: "New Zealand", country: "New Zealand", flag: "🇳🇿" },
  { name: "Queenstown, New Zealand", country: "New Zealand", flag: "🇳🇿" },
  { name: "Canada", country: "Canada", flag: "🇨🇦" },
  { name: "Vancouver, Canada", country: "Canada", flag: "🇨🇦" },
  { name: "Brazil", country: "Brazil", flag: "🇧🇷" },
  { name: "Rio de Janeiro, Brazil", country: "Brazil", flag: "🇧🇷" },
  { name: "India", country: "India", flag: "🇮🇳" },
  { name: "Philippines", country: "Philippines", flag: "🇵🇭" },
  { name: "Saudi Arabia", country: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Taiwan", country: "Taiwan", flag: "🇹🇼" },
];

export function getDestinationFlag(destination: string): string {
  const name = destination.toLowerCase().trim();

  for (const item of DESTINATION_CATALOG) {
    if (name.includes(item.country.toLowerCase()) || name.includes(item.name.toLowerCase())) {
      return item.flag;
    }
  }

  const EXTRA_MAP: Record<string, string> = {
    japan: "🇯🇵",
    indonesia: "🇮🇩",
    bali: "🇮🇩",
    italy: "🇮🇹",
    france: "🇫🇷",
    usa: "🇺🇸",
    america: "🇺🇸",
    uk: "🇬🇧",
    thailand: "🇹🇭",
    korea: "🇰🇷",
    singapore: "🇸🇬",
    malaysia: "🇲🇾",
    vietnam: "🇻🇳",
    australia: "🇦🇺",
    germany: "🇩🇪",
    spain: "🇪🇸",
    switzerland: "🇨🇭",
    china: "🇨🇳",
    philippines: "🇵🇭",
    turkey: "🇹🇷",
    uae: "🇦🇪",
    dubai: "🇦🇪",
    egypt: "🇪🇬",
    india: "🇮🇳",
    netherlands: "🇳🇱",
    greece: "🇬🇷",
    brazil: "🇧🇷",
    canada: "🇨🇦",
    mexico: "🇲🇽",
    nepal: "🇳🇵",
    taiwan: "🇹🇼",
  };

  for (const [key, flag] of Object.entries(EXTRA_MAP)) {
    if (name.includes(key)) {
      return flag;
    }
  }

  return "✈️";
}

export function formatBudget(budget: number): string {
  if (typeof budget !== "number" || isNaN(budget)) {
    return "USD 0";
  }
  return `USD ${budget.toLocaleString("en-US")}`;
}
