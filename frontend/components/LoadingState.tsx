interface LoadingStateProps {
  label?: string;
  hint?: string;
}

export default function LoadingState({
  label = "Generating your itinerary...",
  hint = "Amazon Bedrock is planning the details.",
}: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-spinner" />
      <strong>{label}</strong>
      <span>{hint}</span>
    </div>
  );
}
