import { Check, CheckCheck } from "lucide-react";
import { formatMessageTime } from "../../utils/formatTime";

const StatusTick = ({ status }) => {
  if (status === "seen") return <CheckCheck size={14} className="text-teal" />;
  if (status === "delivered") return <CheckCheck size={14} className="text-muted" />;
  return <Check size={14} className="text-muted" />;
};

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-1`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? "bg-marigold text-ink rounded-br-sm"
            : "bg-surface-2 text-ink-text rounded-bl-sm"
        }`}
      >
        {message.image && (
          <img
            src={message.image}
            alt="attachment"
            className="rounded-lg mb-1.5 max-w-full max-h-64 object-cover"
          />
        )}
        {message.text && <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>}
        <div
          className={`flex items-center gap-1 mt-1 justify-end font-mono text-[10px] ${
            isOwn ? "text-ink/70" : "text-muted"
          }`}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          {isOwn && <StatusTick status={message.status} />}
        </div>
      </div>
    </div>
  );
}
