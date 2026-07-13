import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { checkAuth } from "./redux/slices/authSlice";
import { useSocketListeners } from "./hooks/useSocketListeners";

export default function App() {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useSocketListeners();

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#1A1C29", color: "#EDEBF5", fontSize: "14px" },
        }}
      />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={authUser ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="*"
          element={<Navigate to={authUser ? "/" : "/auth"} replace />}
        />
      </Routes>
    </>
  );
}
