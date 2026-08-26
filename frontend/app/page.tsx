"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

interface Trip {
  id: number;
  destination: string;
  budget: number;
  days: number;
  month: string;
  travel_style: string;
  category: string;
  daily_budget: number;
  travel_season: string;
  ai_recommendation: string | null;
}

type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

function parseRecommendation(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let currentList: string[] | null = null;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      currentList = null;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      currentList = null;
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      if (!currentList) {
        currentList = [];
        blocks.push({ type: "list", items: currentList });
      }
      currentList.push(bullet[1]);
      continue;
    }

    currentList = null;
    blocks.push({ type: "paragraph", text: line });
  }

  return blocks;
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <span key={index}>{part}</span>,
  );
}

function getDestinationImage(destination: string): string {
  const name = destination.toLowerCase();
  const destinationImages: Record<string, string> = {
    japan: "photo-1493976040374-85c8e12f0c0e",
    indonesia: "photo-1537996194471-e657df975ab4",
    bali: "photo-1537996194471-e657df975ab4",
    thailand: "photo-1552465011-b4e21bf6e79a",
    vietnam: "photo-1528127269322-539801943592",
    malaysia: "photo-1596422846543-75c6fc197f07",
    singapore: "photo-1525625293386-3f8f99389edd",
    philippines: "photo-1518509562904-e7ef99cdcc86",
    cambodia: "photo-1563492065599-3520f775eeed",
    laos: "photo-1570366583862-f91883984fde",
    "south korea": "photo-1538485399081-7c8972b7d5e5",
    korea: "photo-1538485399081-7c8972b7d5e5",
    china: "photo-1508804185872-d7badad00f7d",
    india: "photo-1524492412937-b28074a5d7da",
    nepal: "photo-1544735716-392fe2489ffa",
    "sri lanka": "photo-1586613830950-3b6a5b3f9b3d",
    taiwan: "photo-1470004914212-05527e49370b",
    mongolia: "photo-1506869640319-fe1a24fd76dc",
    turkey: "photo-1524231757912-21f4fe3a7200",
    "united arab emirates": "photo-1512453979798-5ea266f8880c",
    dubai: "photo-1512453979798-5ea266f8880c",
  };

  const matchedCountry = Object.keys(destinationImages).find((country) =>
    name.includes(country),
  );
  if (matchedCountry) {
    return `https://images.unsplash.com/${destinationImages[matchedCountry]}?auto=format&fit=crop&w=1400&q=85`;
  }

  if (name.includes("italy")) return "https://images.unsplash.com/photo-1529260830199-42c8a36f70d4?auto=format&fit=crop&w=1400&q=85";
  if (name.includes("peru")) return "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1400&q=85";
  return "/petadunia.webp";
}

export default function Home() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [month, setMonth] = useState("April");
  const [travelStyle, setTravelStyle] = useState("Family");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await generateTrip();
  }

  async function generateTrip() {
    setLoading(true);
    setError("");
    setTrip(null);

    try {
      const response = await fetch("http://localhost:8000/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination.trim(),
          budget: Number(budget),
          days: Number(days),
          month: month.trim(),
          travel_style: travelStyle.trim(),
        }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.detail || `Request failed (HTTP ${response.status}).`);
      }

      setTrip(body);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate the trip.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="intro mb-8 border-b-2 border-slate-900 pb-6 sm:mb-10">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow">AI travel planner</p>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Beta</span>
        </div>
        <h1 className="mt-2 text-6xl font-black leading-none tracking-tight sm:text-8xl">Kelana<span>AI</span></h1>
        <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">Plan your next adventure with a personalized itinerary.</p>
      </header>

      <div className="content-grid mb-10">
        <div className="hero-image relative min-h-[300px] overflow-hidden border-2 border-slate-900 bg-slate-200 shadow-[8px_8px_0_#176b50] lg:min-h-[520px]">
          <Image src="/petadunia.webp" alt="A globe representing worldwide travel" fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover p-16" />
          <div className="absolute inset-x-0 bottom-0 bg-slate-950/75 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">Your next chapter</p>
            <p className="mt-2 max-w-md text-2xl font-bold">Go somewhere that gives you a story to tell.</p>
          </div>
        </div>
        <form id="planner" className="trip-form" onSubmit={handleSubmit}>
          <p className="eyebrow">Start planning</p>
          <h2 className="text-3xl font-bold">Build your trip</h2>
          <label>Destination<input value={destination} placeholder="e.g. Japan, Italy, Bali" onChange={(event) => setDestination(event.target.value.replace(/\d/g, ""))} required /></label>
          <div className="two-columns">
            <label>Budget (USD)<input type="number" min="1" value={budget} placeholder="e.g. 2000" onChange={(event) => setBudget(event.target.value)} required /></label>
            <label>Days<input type="number" min="1" value={days} placeholder="e.g. 5" onChange={(event) => setDays(event.target.value)} required /></label>
          </div>
          <label>
            Month
            <span className="select-wrapper">
              <select value={month} onChange={(event) => setMonth(event.target.value)} required>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </span>
          </label>
          <label>
            Travel style
            <span className="select-wrapper">
              <select value={travelStyle} onChange={(event) => setTravelStyle(event.target.value)} required>
                <option value="Backpacker">Backpacker</option>
                <option value="Family">Family</option>
                <option value="Adventure">Adventure</option>
                <option value="Cultural">Cultural</option>
                <option value="Relaxing">Relaxing</option>
                <option value="Luxury">Luxury</option>
              </select>
            </span>
          </label>
          <button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate AI Trip"}</button>
        </form>
      </div>

      <section id="results" className="result-panel mb-10 w-full">
          {loading && (
            <div className="loading-state" role="status" aria-live="polite">
              <span className="loading-spinner" />
              <strong>Generating your itinerary...</strong>
              <span>Amazon Bedrock is planning the details.</span>
            </div>
          )}
          {!loading && error && (
            <div className="error-state" role="alert">
              <span className="error-icon">!</span>
              <strong>Unable to generate itinerary</strong>
              <span>{error}</span>
              <button type="button" onClick={generateTrip}>Try again</button>
            </div>
          )}
          {!loading && !error && !trip && <div className="empty-result"><strong>Your trip details will appear here</strong><span>Complete the form and generate your itinerary.</span></div>}
          {trip && (
            <div className="trip-result">
              <p className="eyebrow">Your generated trip</p>
              <div className="destination-image relative h-40 overflow-hidden sm:h-52">
                <Image src={getDestinationImage(trip.destination)} fill sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" alt={`Travel view for ${trip.destination}`} unoptimized />
              </div>
              <h2>{trip.destination}</h2>
              <div className="detail-grid">
                <div><span>Destination</span><strong>{trip.destination}</strong></div>
                <div><span>Budget</span><strong>USD {trip.budget.toLocaleString()}</strong></div>
                <div><span>Travel Style</span><strong>{trip.travel_style}</strong></div>
                <div><span>Duration</span><strong>{trip.days} days</strong></div>
              </div>
              {trip.ai_recommendation && (
                <Recommendation content={trip.ai_recommendation} />
              )}
            </div>
          )}
      </section>
      <footer className="site-footer mt-auto flex flex-col gap-3 border-t-2 border-slate-900 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <span>KelanaAI <span>·</span> AI-powered travel planning</span>
        <nav className="flex gap-5"><a href="#planner">Planner</a><a href="#results">Results</a><a href="mailto:hello@kelana.ai">Contact</a></nav>
        <span>&copy; 2026 KelanaAI</span>
      </footer>
    </main>
  );
}

function Recommendation({ content }: { content: string }) {
  const blocks = parseRecommendation(content);
  const overview = blocks.find(
    (block): block is Extract<MarkdownBlock, { type: "heading" }> =>
      block.type === "heading" && block.level === 1,
  );
  const cards: Array<{ title: string; blocks: MarkdownBlock[] }> = [];
  let currentCard: { title: string; blocks: MarkdownBlock[] } | null = null;

  for (const block of blocks) {
    if (block.type === "heading" && block.level === 1) {
      continue;
    }
    if (block.type === "heading" && block.level === 2) {
      currentCard = { title: block.text, blocks: [] };
      cards.push(currentCard);
    } else if (currentCard) {
      currentCard.blocks.push(block);
    }
  }

  return (
    <div className="recommendation">
      <h3>AI Recommendation</h3>
      {overview && <p className="recommendation-overview">{renderInline(overview.text)}</p>}
      <div className="recommendation-cards">
        {cards.map((card, cardIndex) => (
          <article className="recommendation-card" key={`${card.title}-${cardIndex}`}>
            <h4>{renderInline(card.title)}</h4>
            {card.blocks.map((block, index) => {
              if (block.type === "heading") {
                return <h5 key={index}>{renderInline(block.text)}</h5>;
              }
              if (block.type === "list") {
                return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ul>;
              }
              return <p key={index}>{renderInline(block.text)}</p>;
            })}
          </article>
        ))}
      </div>
    </div>
  );
}
