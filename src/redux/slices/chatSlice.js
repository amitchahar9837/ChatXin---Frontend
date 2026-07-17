import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axiosInstance";

const initialState = {
  chats: [],
  messages: [],
  selectedUser: null,
  onlineUsers: [],
  typingUsers: {},
  isChatsLoading: false,
  isMessagesLoading: false,
  isLoadingMore: false,
  hasMoreMessages: true,
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
      return res.data.data; // { messages, hasMore }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const loadMoreMessages = createAsyncThunk(
  "chat/loadMoreMessages",
  async ({ userId, beforeId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/message/${userId}?before=${beforeId}&limit=30`,
      );
      return res.data.data; // { messages, hasMore }
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
      ...(image && { image }),
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
      console.log(action.payload);
      state.selectedUser = action.payload;
      state.messages = [];
      state.hasMoreMessages = true;

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
        const { messages, hasMore } = action.payload;
        state.messages = messages;
        state.hasMoreMessages = hasMore;
        state.isMessagesLoading = false;

        const latestMsg = messages[messages.length - 1];
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
      .addCase(loadMoreMessages.pending, (state) => {
        state.isLoadingMore = true;
      })
      .addCase(loadMoreMessages.fulfilled, (state, action) => {
        const { messages, hasMore } = action.payload;
        state.messages = [...messages, ...state.messages];
        state.hasMoreMessages = hasMore;
        state.isLoadingMore = false;
      })
      .addCase(loadMoreMessages.rejected, (state) => {
        state.isLoadingMore = false;
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
