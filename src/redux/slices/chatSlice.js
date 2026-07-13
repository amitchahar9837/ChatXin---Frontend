import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axiosInstance";

const initialState = {
  chats: [], // [{ user, lastMessage, unreadCount }]
  messages: [],
  selectedUser: null,
  onlineUsers: [],
  typingUsers: {}, // { [userId]: true } — sirf open chat nahi, poore sidebar ke liye track hota hai
  isChatsLoading: false,
  isMessagesLoading: false,
  isSending: false,
};

export const getChats = createAsyncThunk(
  "chat/getChats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/message/users");
      return res.data.data.chats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      return res.data.data.messages;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiverId, text, image }, { rejectWithValue }) => {
    const payload = {
      ...(text.trim().length > 0 && { text }),
      ...(image && image),
    };
    try {
      const res = await axiosInstance.post(
        `/message/send/${receiverId}`,
        payload,
      );
      return res.data.data.message;
    } catch (err) {
      const message = err.response?.data?.message || "Message failed to send";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.messages = [];

      // Chat open karte hi unread badge clear karo (backend bhi seen mark karega getMessages call mein)
      if (action.payload) {
        const chatIndex = state.chats.findIndex(
          (c) => c.user._id === action.payload._id,
        );
        if (chatIndex !== -1) state.chats[chatIndex].unreadCount = 0;
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setUserTyping: (state, action) => {
      state.typingUsers[action.payload] = true;
    },
    clearUserTyping: (state, action) => {
      delete state.typingUsers[action.payload];
    },
    // Socket se live aaya naya message. myId zaroori hai taaki "otherUserId" sahi nikle
    // (pehle ye galti se selectedUser pe depend karta tha, isliye naye/unopened conversation
    // ka message miss ho jaata tha).
    receiveMessage: (state, action) => {
      const { message: msg, sender, myId } = action.payload;
      const otherUserId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      const isChatOpen = state.selectedUser?._id === otherUserId;

      if (isChatOpen) {
        state.messages.push(msg);
      }

      const chatIndex = state.chats.findIndex(
        (c) => c.user._id === otherUserId,
      );
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = msg;
        if (!isChatOpen)
          state.chats[chatIndex].unreadCount =
            (state.chats[chatIndex].unreadCount || 0) + 1;
        const [chat] = state.chats.splice(chatIndex, 1);
        state.chats.unshift(chat);
      } else if (sender) {
        // Pehli baar is user ne message bheja hai — sidebar mein naya conversation
        // turant add karo, reload ka wait nahi karna
        state.chats.unshift({
          user: sender,
          lastMessage: msg,
          unreadCount: isChatOpen ? 0 : 1,
        });
      }
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg) msg.status = status;
    },
    markMessagesSeenLocally: (state, action) => {
      const { messageIds } = action.payload;
      state.messages = state.messages.map((m) =>
        messageIds.includes(m._id) ? { ...m, status: "seen" } : m,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChats.pending, (state) => {
        state.isChatsLoading = true;
      })
      .addCase(getChats.fulfilled, (state, action) => {
        state.chats = action.payload;
        state.isChatsLoading = false;
      })
      .addCase(getChats.rejected, (state) => {
        state.isChatsLoading = false;
      })
      .addCase(getMessages.pending, (state) => {
        state.isMessagesLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.isMessagesLoading = false;

        // Chat open karte waqt sidebar preview bhi sync kar do — kabhi kabhi
        // socket event miss ho jaata hai (tab background mein tha, reconnect hua, etc.)
        // toh yahan se bhi source-of-truth theek ho jaata hai
        const latestMsg = action.payload[action.payload.length - 1];
        if (latestMsg && state.selectedUser) {
          const chatIndex = state.chats.findIndex(
            (c) => c.user._id === state.selectedUser._id,
          );
          if (chatIndex !== -1) {
            const existingTime = new Date(
              state.chats[chatIndex].lastMessage?.createdAt || 0,
            );
            const newTime = new Date(latestMsg.createdAt);
            if (newTime >= existingTime) {
              state.chats[chatIndex].lastMessage = latestMsg;
            }
          } else {
            state.chats.unshift({
              user: state.selectedUser,
              lastMessage: latestMsg,
            });
          }
        }
      })
      .addCase(getMessages.rejected, (state) => {
        state.isMessagesLoading = false;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        state.messages.push(msg);
        state.isSending = false;

        const otherUserId = state.selectedUser?._id;
        if (otherUserId) {
          const chatIndex = state.chats.findIndex(
            (c) => c.user._id === otherUserId,
          );
          if (chatIndex !== -1) {
            state.chats[chatIndex].lastMessage = msg;
            const [chat] = state.chats.splice(chatIndex, 1);
            state.chats.unshift(chat);
          } else {
            // Pehli baar isi user ko message bheja — sidebar mein naya conversation add karo
            state.chats.unshift({ user: state.selectedUser, lastMessage: msg });
          }
        }
      })
      .addCase(sendMessage.rejected, (state) => {
        state.isSending = false;
      });
  },
});

export const {
  setSelectedUser,
  setOnlineUsers,
  setUserTyping,
  clearUserTyping,
  receiveMessage,
  updateMessageStatus,
  markMessagesSeenLocally,
} = chatSlice.actions;

export default chatSlice.reducer;
