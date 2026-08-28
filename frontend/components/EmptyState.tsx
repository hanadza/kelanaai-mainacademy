import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon = "✈",
  title,
  message,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="empty-banner">
      <div className="empty-banner-inner">
        <span className="empty-banner-icon" aria-hidden="true">
          {icon}
        </span>
        <strong>{title}</strong>
        <span>{message}</span>
        {actionLabel && actionHref && (
          <Link href={actionHref} className="empty-banner-action">
            {actionLabel} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
