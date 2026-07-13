import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Image as ImageIcon, Send, X } from "lucide-react";
import { getSocket } from "../../lib/socket";
import { sendMessage } from "../../redux/slices/chatSlice";

let typingTimeout = null;

export default function MessageInput() {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { selectedUser, isSending } = useSelector((state) => state.chat);
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const emitTyping = () => {
    const socket = getSocket();
    if (!socket || !selectedUser) return;
    socket.emit("typing", { senderId: authUser._id, receiverId: selectedUser._id });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", { senderId: authUser._id, receiverId: selectedUser._id });
    }, 1500);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (!selectedUser) return;

    await dispatch(
      sendMessage({ receiverId: selectedUser._id, text: text.trim(), image: imagePreview })
    );

    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSend} className="border-t border-surface-2 p-3 bg-ink">
      {imagePreview && (
        <div className="relative inline-block mb-2 ml-1">
          <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded-lg" />
          <button
            type="button"
            onClick={() => setImagePreview(null)}
            className="absolute -top-2 -right-2 bg-surface-3 rounded-full p-1"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl text-muted hover:text-ink-text hover:bg-surface-2 transition-colors"
        >
          <ImageIcon size={20} />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageSelect} />
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            emitTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 bg-surface-2 text-ink-text placeholder:text-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-teal"
        />
        <button
          type="submit"
          disabled={isSending || (!text.trim() && !imagePreview)}
          className="p-2.5 rounded-xl bg-marigold text-ink disabled:opacity-40 hover:bg-marigold/90 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
