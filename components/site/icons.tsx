// Inline SVG icons copied from the original markup.

const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function BuildingIcon() {
  return (
    <svg {...stroke}>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M12 8v4M10 10h4" />
    </svg>
  );
}

export function PinIcon(props: { "aria-hidden"?: boolean }) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function ClockIcon(props: { "aria-hidden"?: boolean }) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg {...stroke}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function PhoneIcon(props: { "aria-hidden"?: boolean }) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

export function MailIcon(props: { "aria-hidden"?: boolean }) {
  return (
    <svg {...stroke} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function GlobeIcon(props: { "aria-hidden"?: boolean }) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.9 3.9 5.9 3.9 9s-1.3 6.1-3.9 9c-2.6-2.9-3.9-5.9-3.9-9S9.4 5.9 12 3z" />
    </svg>
  );
}

export function PersonSilhouette() {
  return (
    <svg viewBox="0 0 64 64">
      <circle cx="32" cy="21" r="12" />
      <path d="M8 60c0-14 10.7-23 24-23s24 9 24 23z" />
    </svg>
  );
}

export function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg {...stroke} strokeWidth={2} aria-hidden="true">
      <path d={direction === "left" ? "M14.5 6 8.5 12l6 6" : "M9.5 6l6 6-6 6"} />
    </svg>
  );
}

const STAR = "M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.46l-5.8 3.04 1.1-6.47L2.6 9.45l6.5-.95z";

/** Five stars, filled to `value` out of 5 (fractions shown as a partial star). */
export function StarRating({ value, label }: { value: number; label: string }) {
  const filled = `${Math.max(0, Math.min(5, value)) * 20}%`;
  const row = (
    <svg viewBox="0 0 120 24" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={STAR} transform={`translate(${i * 24} 0)`} />
      ))}
    </svg>
  );
  return (
    <span className="stars" role="img" aria-label={label}>
      <span className="stars-empty">{row}</span>
      <span className="stars-filled" style={{ width: filled }}>
        {row}
      </span>
    </span>
  );
}
