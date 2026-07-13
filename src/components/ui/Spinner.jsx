export default function Spinner({ size = 24 }) {
  return (
    <div
      className="border-2 border-surface-3 border-t-marigold rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}
