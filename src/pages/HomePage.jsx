import { useSelector } from "react-redux";
import Sidebar from "../components/sidebar/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";

export default function HomePage() {
  const { selectedUser } = useSelector((state) => state.chat);

  return (
    <div className="h-screen flex bg-ink text-ink-text overflow-hidden">
      <div
        className={`${selectedUser ? "hidden md:flex" : "flex-1  "} flex-col`}
      >
        <Sidebar />
      </div>
      <div className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1`}>
        <ChatWindow />
      </div>
    </div>
  );
}
