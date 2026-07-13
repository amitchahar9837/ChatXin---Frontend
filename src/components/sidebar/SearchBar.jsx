import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Search, X } from "lucide-react";
import { axiosInstance } from "../../lib/axiosInstance";
import { setSelectedUser } from "../../redux/slices/chatSlice";
import Avatar from "../ui/Avatar";

export default function SearchBar() {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await axiosInstance.get("/search", { params: { q: query } });
        setResults(res.data.data);
      } catch {
        setResults(null);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  const pickUser = (user) => {
    dispatch(setSelectedUser(user));
    setQuery("");
    setResults(null);
    setIsOpen(false);
  };

  return (
    <div className="relative px-3 pt-3 pb-2">
      <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2">
        <Search size={16} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search people or messages..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X size={14} className="text-muted" />
          </button>
        )}
      </div>

      {isOpen && results && (
        <div className="absolute left-3 right-3 mt-1 bg-surface border border-surface-3 rounded-xl shadow-xl max-h-80 overflow-y-auto thin-scroll z-10">
          {results.chatUsers.length === 0 &&
          results.allUsers.length === 0 &&
          results.fromMessages.length === 0 ? (
            <p className="text-center text-muted text-xs py-4">No results found</p>
          ) : (
            <>
              {results.chatUsers.map(({ user }) => (
                <button
                  key={user._id}
                  onClick={() => pickUser(user)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-2 text-left"
                >
                  <Avatar src={user.profilePic} name={user.fullName} size="sm" />
                  <span className="text-sm">{user.fullName}</span>
                </button>
              ))}
              {results.allUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => pickUser(user)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-2 text-left"
                >
                  <Avatar src={user.profilePic} name={user.fullName} size="sm" />
                  <div>
                    <p className="text-sm">{user.fullName}</p>
                    <p className="text-[10px] text-muted">New contact</p>
                  </div>
                </button>
              ))}
              {results.fromMessages.map(({ user, matchedMessage, messageId }) => (
                <button
                  key={messageId}
                  onClick={() => pickUser(user)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-2 text-left"
                >
                  <Avatar src={user.profilePic} name={user.fullName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm">{user.fullName}</p>
                    <p className="text-[10px] text-muted truncate">"{matchedMessage}"</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
