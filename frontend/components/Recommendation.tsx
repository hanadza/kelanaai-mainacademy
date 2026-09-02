import { FormattedMarkdown } from "@/lib/markdown";

export default function Recommendation({ content }: { content: string }) {
  if (!content) {
    return (
      <p className="no-recommendation text-xs text-slate-500 italic">
        No AI recommendation saved for this trip yet.
      </p>
    );
  }

  return (
    <div className="recommendation border-2 border-slate-900 bg-white p-5 rounded-xl shadow-[5px_5px_0_#176b50] mt-6">
      <h3 className="text-lg font-black text-[#176b50] border-b-2 border-slate-900 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
        <span>✨</span>
        <span>AI Travel Itinerary & Recommendation</span>
      </h3>
      <div className="bg-[#176b50] text-white p-5 rounded-lg shadow-inner">
        <FormattedMarkdown content={content} />
      </div>
    </div>
  );
}
