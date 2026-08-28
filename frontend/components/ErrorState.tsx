interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <span className="error-icon">!</span>
      <strong>Unable to generate itinerary</strong>
      <span>{message}</span>
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
