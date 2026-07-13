import Avatar from "../ui/Avatar";
import { formatMessageTime } from "../../utils/formatTime";

export default function ChatListItem({
  chat,
  isSelected,
  isOnline,
  isTyping,
  onClick,
}) {
  const { user, lastMessage, unreadCount } = chat;

  const preview = isTyping
    ? "typing..."
    : lastMessage?.image && !lastMessage?.text
      ? "📷 Photo"
      : lastMessage?.text || "";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isSelected ? "bg-surface-2" : "hover:bg-surface-2/60"
      }`}
    >
      <Avatar src={user.profilePic} name={user.fullName} online={isOnline} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-display font-medium text-sm truncate">
            {user.fullName}
          </p>
          {lastMessage && !unreadCount && (
            <span className="text-[10px] font-mono text-muted shrink-0">
              {formatMessageTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-xs truncate ${
              isTyping ? "text-teal font-medium" : "text-muted"
            }`}
          >
            {preview}
          </p>
          {unreadCount > 0 && (
            <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-marigold text-ink text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
