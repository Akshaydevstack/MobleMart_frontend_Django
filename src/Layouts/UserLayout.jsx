import React, { useEffect, useRef, useContext } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import { toast } from "react-hot-toast";
import { AuthContext } from "../Context/AuthProvider";

export default function MainLayout() {
  const ws = useRef(null);
  const { setHasNewNotification } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // ✅ Load base URL from environment
    const baseWS = import.meta.env.VITE_WS_BASE_URL;

    // ✅ Append token as query param
    ws.current = new WebSocket(`${baseWS}?token=${token}`);

    ws.current.onopen = () => console.log("✅ WebSocket connected");

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setHasNewNotification(true);
      toast.success(data.message || "You have a new notification!", {
        style: {
          background: "#1f1f1f",
          color: "#fff",
          border: "1px solid #facc15",
        },
      });
    };

    ws.current.onclose = () => console.warn("❌ WebSocket closed");
    ws.current.onerror = (err) => console.error("⚠️ WebSocket error:", err);

    return () => ws.current?.close();
  }, [setHasNewNotification]);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}