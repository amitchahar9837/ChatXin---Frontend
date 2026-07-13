import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>
      )}
      <input
        ref={ref}
        className={`bg-surface-2 text-ink-text placeholder:text-muted rounded-xl px-4 py-2.5 text-sm border border-transparent focus:border-teal outline-none transition-colors ${
          error ? "border-red-500/60" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
