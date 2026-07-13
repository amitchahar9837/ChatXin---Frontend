import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axiosInstance";
import { connectSocket, disconnectSocket } from "../../lib/socket";
import { setOnlineUsers } from "./chatSlice";

const initialState = {
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
};

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/auth/check");
      const user = res.data.data.user;
      dispatch(bootSocket(user._id));
      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      const user = res.data.data.user;
      toast.success("Account created!");
      dispatch(bootSocket(user._id));
      return user;
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      toast.error(message);
      return rejectWithValue(err.response?.data);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      const user = res.data.data.user;
      toast.success("Welcome back!");
      dispatch(bootSocket(user._id));
      return user;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      toast.error(message);
      return rejectWithValue(err.response?.data);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, { dispatch }) => {
  try {
    await axiosInstance.post("/auth/logout");
  } finally {
    disconnectSocket();
    dispatch(setOnlineUsers([]));
    toast.success("Logged out");
  }
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", formData);
      toast.success("Profile updated");
      return res.data.data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Update failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Socket connect karke online-users listener attach karta hai
const bootSocket = (userId) => (dispatch) => {
  const socket = connectSocket(userId);
  socket.off("getOnlineUsers");
  socket.on("getOnlineUsers", (userIds) => dispatch(setOnlineUsers(userIds)));
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.authUser = null;
        state.isCheckingAuth = false;
      })
      .addCase(signup.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isSigningUp = false;
      })
      .addCase(signup.rejected, (state) => {
        state.isSigningUp = false;
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isUpdatingProfile = false;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.isUpdatingProfile = false;
      });
  },
});

export default authSlice.reducer;
