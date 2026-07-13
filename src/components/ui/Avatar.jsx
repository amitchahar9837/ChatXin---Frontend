export default function Avatar({ src, name = "", size = "md", online = false }) {
  const sizes = {
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative shrink-0">
      <div
        className={`${sizes[size]} rounded-full overflow-hidden bg-surface-3 flex items-center justify-center font-display font-semibold text-ink-text`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials || "?"}</span>
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-teal ring-2 ring-ink animate-pulse-ring" />
      )}
    </div>
  );
}
