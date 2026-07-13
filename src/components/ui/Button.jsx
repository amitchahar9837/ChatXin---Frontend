export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-body font-medium text-sm px-4 py-2.5 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-marigold text-ink hover:bg-marigold/90 active:bg-marigold-dim",
    ghost: "bg-transparent text-ink-text hover:bg-surface-2",
    outline: "border border-surface-3 text-ink-text hover:bg-surface-2",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
