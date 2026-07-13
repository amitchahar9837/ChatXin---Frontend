import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import SearchBar from "./SearchBar";
import ChatListItem from "./ChatListItem";
import Avatar from "../ui/Avatar";
import Spinner from "../ui/Spinner";
import { getChats, setSelectedUser } from "../../redux/slices/chatSlice";
import { logout } from "../../redux/slices/authSlice";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { chats, isChatsLoading, selectedUser, onlineUsers, typingUsers } =
    useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(getChats());
  }, [dispatch]);

  return (
    <aside className="w-full md:w-80 shrink-0 border-r border-surface-2 flex flex-col h-full bg-ink">
      {/* Logo */}
      <div className=""></div>

      <SearchBar />

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto thin-scroll">
        {isChatsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : chats.length === 0 ? (
          <p className="text-center text-muted text-sm mt-8 px-4">
            No conversations yet — search for someone to start chatting.
          </p>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat.user._id}
              chat={chat}
              isSelected={selectedUser?._id === chat.user._id}
              isOnline={onlineUsers.includes(chat.user._id)}
              isTyping={!!typingUsers[chat.user._id]}
              onClick={() => dispatch(setSelectedUser(chat.user))}
            />
          ))
        )}
      </div>

      {/* Profile footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-surface-2">
        <Avatar
          src={authUser?.profilePic}
          name={authUser?.fullName}
          size="sm"
        />
        <p className="flex-1 text-sm font-medium truncate">
          {authUser?.fullName}
        </p>
        <Link to="/profile" className="p-2 text-muted hover:text-ink-text">
          <Settings size={18} />
        </Link>
        <button
          onClick={() => dispatch(logout())}
          className="p-2 text-muted hover:text-red-400"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
