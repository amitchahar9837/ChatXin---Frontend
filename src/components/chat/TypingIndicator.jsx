export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-2 max-w-[70%]">
      <div className="bg-surface-2 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-marigold animate-bounce-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
