import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../API/axios";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format backend data into frontend-friendly keys
  const mapNotification = (notif) => ({
    id: notif.id,
    title: notif.title,
    message: notif.message,
    imageUrl: notif.image_url,
    createdAt: notif.created_at,
    isRead: notif.is_read,
  });

  // Fetch all notifications for logged-in user (includes global + personal)
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Please log in to view notifications.");
        setLoading(false);
        return;
      }

      const res = await api.get("admin/user-notifications/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = res.data.map(mapNotification);
      setNotifications(
        mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchNotifications();

    // Setup WebSocket connection for real-time updates
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const baseWS = import.meta.env.VITE_WS_BASE_URL;

    const socket = new WebSocket(`${baseWS}?token=${token}`);

    socket.onopen = () => console.log("✅ WebSocket connected!");
    socket.onclose = () => console.warn("❌ WebSocket disconnected");
    socket.onerror = (err) => console.error("⚠️ WebSocket error:", err);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const mapped = mapNotification(data);
        setNotifications((prev) => [mapped, ...prev]);
        toast.success("📢 New Notification!");
      } catch (e) {
        console.error("Invalid WebSocket message:", e);
      }
    };
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-yellow-400 mb-8 text-center">
          🔔 Notifications
        </h2>

        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No notifications yet...
          </div>
        ) : (
          <ul className="relative border-l border-gray-700 space-y-6 pl-6">
            {notifications.map((notif) => (
              <motion.li
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg shadow-md relative ${
                  notif.isRead
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-gray-700 border border-yellow-500"
                }`}
              >
                <div className="absolute -left-3 top-4 w-6 h-6 bg-yellow-400 rounded-full border-4 border-gray-900"></div>

                {notif.title && (
                  <h3 className="text-lg font-bold text-yellow-400 mb-1">
                    {notif.title}
                  </h3>
                )}
                <p className="text-gray-200">{notif.message}</p>

                {notif.imageUrl && notif.imageUrl.trim() !== "" && (
                  <img
                    src={notif.imageUrl}
                    alt="Notification"
                    className="mt-3 w-full max-w-sm rounded-lg border border-gray-700"
                  />
                )}

                <p className="text-sm text-gray-400 mt-3">
                  {formatDate(notif.createdAt)}
                </p>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}