import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../Context/AuthProvider";
import { motion } from "framer-motion";
import axios from "axios";
import { UserApi } from "../Data/Api_EndPoint";

export default function AdminRoutes() {
  const { user, logout, setcartlength } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [showWarning, setShowWarning] = useState(false);
  const [attempts, setAttempts] = useState(() => {
    return parseInt(localStorage.getItem("adminAttempts")) || 0;
  });

  useEffect(() => {
    if (user && user.role === "Admin") {
      localStorage.removeItem("adminAttempts");
      setAttempts(0);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === "Admin" && location.pathname === "/") {
      navigate("/admin", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    if (user === null) return;

    if (
      location.pathname.startsWith("/admin") &&
      (!user || user.role !== "Admin")
    ) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("adminAttempts", newAttempts.toString());
      setShowWarning(true);
    }
  }, [location.pathname, user]);

  useEffect(() => {
    if (attempts < 1) return;

    const timeout = setTimeout(async () => {
      if (attempts >= 3) {
        console.log("🔒 Blocking user after attempts:", attempts);

        if (user && !user.isBlock && user.userid) {
          try {
            await axios.patch(`${UserApi}/${user.userid}`, {
              isBlock: true,
            });
            console.log("✅ User blocked in backend.");
          } catch (err) {
            console.error("❌ Failed to block user:", err);
          }
        }
        localStorage.removeItem("adminAttempts");
        await logout?.();
      }
      navigate("/", { replace: true });
    }, 3000);
    setcartlength(0);
    return () => clearTimeout(timeout);
  }, [attempts, user, logout, navigate]);

  if (showWarning) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-200 p-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 p-6 rounded-2xl shadow-lg max-w-md text-center"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            {attempts >= 3 ? "Account Blocked" : "Access Denied"}
          </h2>
          <p className="text-gray-400 mb-2">
            {attempts >= 3
              ? "Your account has been blocked due to multiple unauthorized access attempts."
              : "You do not have permission to access the admin panel."}
          </p>
          {attempts < 3 && (
            <p className="text-gray-500 text-sm">
              Attempt {attempts} of 3 — You will be blocked after 3 failed
              attempts.
            </p>
          )}
          <p className="text-gray-600 text-xs mt-2">
            Redirecting to login in a moment...
          </p>
        </motion.div>
      </div>
    );
  }

  if (user && user.role === "Admin") {
    return <Outlet />;
  }

  return null;
}
