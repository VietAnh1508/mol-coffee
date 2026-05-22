interface Props {
  className?: string;
}

export function ClockIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="6" cy="6" r="4.5" />
      <polyline points="6,3.5 6,6 7.5,7.5" />
    </svg>
  );
}
