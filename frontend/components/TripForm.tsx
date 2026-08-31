"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import type { TripRequest } from "@/types/trip";
import { getDestinationFlag, DESTINATION_CATALOG, type DestinationItem } from "@/lib/destinationHelpers";

interface TripFormProps {
  onGenerate: (payload: TripRequest) => void;
  loading: boolean;
}

const TRAVEL_STYLES = [
  { id: "Family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: "Solo", label: "Solo", icon: "🎒" },
  { id: "Couple", label: "Couple", icon: "💑" },
  { id: "Adventure", label: "Adventure", icon: "🧗" },
  { id: "Cultural", label: "Cultural", icon: "🏛️" },
  { id: "Relaxing", label: "Relaxing", icon: "🏖️" },
];

const POPULAR_DESTINATIONS = [
  { name: "Japan", flag: "🇯🇵" },
  { name: "Bali", flag: "🇮🇩" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "France", flag: "🇫🇷" },
  { name: "Thailand", flag: "🇹🇭" },
];

export default function TripForm({ onGenerate, loading }: TripFormProps) {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [month, setMonth] = useState("April");
  const [travelStyle, setTravelStyle] = useState("Family");

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const destinationWrapperRef = useRef<HTMLDivElement>(null);

  // Filter recommendations based on user input
  const trimmedDest = destination.trim().toLowerCase();
  const filteredDestinations: DestinationItem[] = trimmedDest.length > 0
    ? DESTINATION_CATALOG.filter(
      (item) =>
        item.name.toLowerCase().includes(trimmedDest) ||
        item.country.toLowerCase().includes(trimmedDest)
    ).slice(0, 6)
    : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        destinationWrapperRef.current &&
        !destinationWrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate live category preview based on backend business rules
  const numBudget = Number(budget);
  const numDays = Number(days);
  let liveCategory = null;
  if (numBudget > 0) {
    if (numBudget < 1000) {
      liveCategory = { name: "Backpacker", bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300" };
    } else if (numBudget <= 3000) {
      liveCategory = { name: "Standard", bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300" };
    } else {
      liveCategory = { name: "Luxury", bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300" };
    }
  }

  // Calculate live daily budget preview
  const dailyEstimate = numBudget > 0 && numDays > 0 ? Math.round(numBudget / numDays) : null;

  function selectDestination(name: string) {
    setDestination(name);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || filteredDestinations.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredDestinations.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredDestinations.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectDestination(filteredDestinations[highlightedIndex].name);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onGenerate({
      destination: destination.trim(),
      budget: Number(budget),
      days: Number(days),
      month: month.trim(),
      travel_style: travelStyle.trim(),
    });
  }

  const destinationFlag = destination ? getDestinationFlag(destination) : "📍";

  return (
    <form id="planner" className="trip-form !p-4 sm:!p-5 !gap-2.5 flex flex-col justify-between" onSubmit={handleSubmit}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <p className="eyebrow !mb-0 !text-[11px]">Start planning</p>
          {liveCategory && (
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${liveCategory.bg} ${liveCategory.text} ${liveCategory.border}`}
            >
              Tier: {liveCategory.name}
            </span>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Build your trip</h2>
      </div>

      {/* Destination Field with Live Autocomplete Suggestions */}
      <div className="space-y-1 relative" ref={destinationWrapperRef}>
        <label className="!gap-1 !text-[11px]">
          <div className="flex items-center justify-between">
            <span>Destination</span>
            <span className="text-[10px] font-normal normal-case text-slate-500">Auto-suggest enabled</span>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-base select-none pointer-events-none" aria-hidden="true">
              {destinationFlag}
            </span>
            <input
              className="!pl-9 !py-1.5 !text-sm"
              value={destination}
              placeholder="e.g. Japan, Bali, Italy, Paris"
              onChange={(event) => {
                setDestination(event.target.value.replace(/\d/g, ""));
                setShowSuggestions(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => {
                if (trimmedDest.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              required
            />
          </div>
        </label>

        {/* Floating Autocomplete Dropdown */}
        {showSuggestions && filteredDestinations.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-48 overflow-y-auto border-2 border-slate-900 bg-[#fffdf8] shadow-[4px_4px_0_#176b50]">
            <div className="border-b border-slate-200 bg-slate-100 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Suggested Destinations
            </div>
            {filteredDestinations.map((item, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => selectDestination(item.name)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold transition-colors ${isHighlighted ? "bg-yellow-200 text-slate-900" : "text-slate-800 hover:bg-yellow-100"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{item.flag}</span>
                    <span>{item.name}</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">
                    {item.country}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Destination Chips */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Popular:</span>
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => selectDestination(dest.name)}
              className={`!border !py-0.5 !px-1.5 text-[10px] font-bold uppercase tracking-wide transition-all ${destination.toLowerCase().includes(dest.name.toLowerCase())
                  ? "!bg-slate-900 !text-white !border-slate-900"
                  : "!bg-[#fffdf8] !text-slate-700 !border-slate-300 hover:!bg-yellow-100"
                }`}
            >
              {dest.flag} {dest.name}
            </button>
          ))}
        </div>
      </div>

      {/* Budget, Days, and Month in compact row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <label className="!gap-1 !text-[11px]">
          <div className="flex items-center justify-between">
            <span>Budget (USD)</span>
            {dailyEstimate && (
              <span className="text-[9px] font-semibold text-emerald-700 normal-case">
                ~${dailyEstimate}/d
              </span>
            )}
          </div>
          <input
            className="!py-1.5 !text-sm"
            type="number"
            min="1"
            value={budget}
            placeholder="e.g. 2000"
            onChange={(event) => setBudget(event.target.value)}
            required
          />
        </label>

        <label className="!gap-1 !text-[11px]">
          <span>Duration (Days)</span>
          <input
            className="!py-1.5 !text-sm"
            type="number"
            min="1"
            value={days}
            placeholder="e.g. 5"
            onChange={(event) => setDays(event.target.value)}
            required
          />
        </label>

        <label className="!gap-1 !text-[11px] col-span-2 sm:col-span-1">
          <span>Month</span>
          <span className="select-wrapper">
            <select
              className="!py-1.5 !text-sm"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              required
            >
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
      </div>

      {/* Travel Style Selector */}
      <div>
        <label className="mb-1 block !text-[11px]">
          <span>Travel Style</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {TRAVEL_STYLES.map((style) => {
            const isSelected = travelStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setTravelStyle(style.id)}
                className={`!border-2 !py-1.5 !px-2 flex items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${isSelected
                    ? "!border-slate-900 !bg-slate-900 !text-white shadow-[2px_2px_0_#f4dc4d]"
                    : "!border-slate-300 !bg-[#fffdf8] !text-slate-800 hover:!border-slate-900 hover:!bg-yellow-50"
                  }`}
              >
                <span className="text-sm select-none shrink-0">{style.icon}</span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
                  {style.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Action Button */}
      <button
        type="submit"
        disabled={loading}
        className="!border-2 !border-slate-900 !bg-[#f4dc4d] !p-2.5 sm:!p-3 mt-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 shadow-[3px_3px_0_#176b50] hover:!bg-[#fae255] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#176b50] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#176b50] transition-all duration-150 disabled:opacity-50 disabled:cursor-wait"
      >
        {loading ? (
          <>
            <span className="loading-spinner !h-3.5 !w-3.5 !border-2" />
            <span>Generating AI Itinerary...</span>
          </>
        ) : (
          <>
            <span>Generate AI Trip</span>
            <span aria-hidden="true">→</span>
          </>
        )}
      </button>
    </form>
  );
}
