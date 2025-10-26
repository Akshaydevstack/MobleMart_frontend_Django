import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../API/axios";
import { logoutUser } from "../services/auth";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [cartLength, setCartLength] = useState(0);
  const [abandoned, setAbandoned] = useState(0);
  const navigate = useNavigate();
  const [hasNewNotification, setHasNewNotification] = useState(false); // ✅

  // Helper: fetch cart info
  const fetchCart = async () => {
    try {
      const res = await api.get(`/cart/`);
      setCartLength(res.data.items.length);
    } catch (err) {
      console.log("Failed to load cart:", err);
    }
  };

  // Initialize user from access token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userData = {
          userid: decoded.user_id,
          name: decoded.username,
          email: decoded.email,
          role: decoded.role,
          is_block: decoded.is_block,
        };
        setUser(userData);

        if (!decoded.is_block) {
          fetchCart(decoded.user_id);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Invalid token:", err);
        logout();
      }
    }
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Listen for global logout event (e.g., token refresh failed)
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);

  // Login sets user and stores access token
  const login = (userData) => {
    setUser(userData);
    if (!userData.is_block) fetchCart(userData.user_id);
  };

  const register = (userData)=>{
    setUser(userData)
  }

  // Logout clears user & token
  const logout = () => {
    setUser(null);
    logoutUser()
    navigate("/", { replace: true });
  };

  const updateUser = (updatedUserData) => {
  setUser(updatedUserData);
  localStorage.setItem("user", JSON.stringify(updatedUserData));
};


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        cartLength,
        setCartLength,
        abandoned,
        setAbandoned,
        register,
        updateUser,
        hasNewNotification,
        setHasNewNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
