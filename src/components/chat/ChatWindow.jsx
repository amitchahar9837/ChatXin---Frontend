import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, MessageCircle, Video } from "lucide-react";
import Avatar from "../ui/Avatar";
import Spinner from "../ui/Spinner";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { getMessages, setSelectedUser } from "../../redux/slices/chatSlice";
import { useVideoCallContext } from "./VideoCallContext";

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const {
    selectedUser,
    messages,
    isMessagesLoading,
    onlineUsers,
    typingUsers,
  } = useSelector((state) => state.chat);
  const { callUser, callStatus } = useVideoCallContext();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (selectedUser) dispatch(getMessages(selectedUser._id));
  }, [selectedUser, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (!selectedUser) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-3 text-muted">
        <MessageCircle size={48} strokeWidth={1.5} />
        <p className="font-display text-lg text-ink-text">
          Select a chat to start messaging
        </p>
        <p className="text-sm">Your conversations will appear here</p>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-2">
        <button
          className="md:hidden text-muted hover:text-ink-text"
          onClick={() => dispatch(setSelectedUser(null))}
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar
          src={selectedUser.profilePic}
          name={selectedUser.fullName}
          online={isOnline}
        />
        <div className="flex-1">
          <p className="font-display font-semibold text-sm">
            {selectedUser.fullName}
          </p>
          <p className="text-xs text-muted">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
        <button
          onClick={() =>
            callUser(selectedUser._id, {
              name: selectedUser.fullName,
              profilePic: selectedUser.profilePic,
            })
          }
          disabled={!isOnline || callStatus !== "idle"}
          className="p-2 rounded-full hover:bg-surface-2 text-muted hover:text-teal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title={isOnline ? "Start video call" : "User is offline"}
        >
          <Video size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto thin-scroll py-3">
        {isMessagesLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted text-sm mt-10">
            No messages yet — say hi to {selectedUser.fullName.split(" ")[0]} 👋
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.senderId === authUser._id}
            />
          ))
        )}
        {typingUsers[selectedUser._id] && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  );
}
