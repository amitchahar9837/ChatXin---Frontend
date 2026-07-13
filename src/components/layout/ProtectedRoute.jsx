import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({ children }) {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-ink">
        <Spinner size={32} />
      </div>
    );
  }

  if (!authUser) return <Navigate to="/auth" replace />;
  return children;
}
