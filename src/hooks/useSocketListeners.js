import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../lib/socket";
import {
  receiveMessage,
  updateMessageStatus,
  markMessagesSeenLocally,
  setUserTyping,
  clearUserTyping,
} from "../redux/slices/chatSlice";

export const useSocketListeners = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!authUser) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = ({ message, sender }) =>
      dispatch(receiveMessage({ message, sender, myId: authUser._id }));
    const handleStatusUpdate = (payload) =>
      dispatch(updateMessageStatus(payload));
    const handleSeen = (payload) => dispatch(markMessagesSeenLocally(payload));
    const handleTyping = ({ senderId }) => dispatch(setUserTyping(senderId));
    const handleStopTyping = ({ senderId }) =>
      dispatch(clearUserTyping(senderId));

    socket.on("newMessage", handleNewMessage);
    socket.on("messageStatusUpdate", handleStatusUpdate);
    socket.on("messagesSeen", handleSeen);
    socket.on("userTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageStatusUpdate", handleStatusUpdate);
      socket.off("messagesSeen", handleSeen);
      socket.off("userTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
    };
  }, [authUser, dispatch]);
};
