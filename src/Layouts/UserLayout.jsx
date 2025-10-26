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
    ws.current = new WebSocket("ws://127.0.0.1:8000/ws/notifications/");

    ws.current.onopen = () => console.log("✅ WebSocket connected");

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // ✅ Mark new notification as unseen
      setHasNewNotification(true);

      // ✅ Show toast
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