import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../API/axios";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);

  // Map API response to frontend keys
  const mapNotification = (notif) => ({
    id: notif.id,
    title: notif.title,
    message: notif.message,
    imageUrl: notif.image_url, // map snake_case to camelCase
    createdAt: notif.created_at,
    isRead: notif.is_read,
  });

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const res = await api.get("admin/user-notifications/");
      const mapped = res.data.map(mapNotification);
      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      toast.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    // ✅ Initial fetch from API
    fetchNotifications();

    // ✅ Connect WebSocket for real-time notifications
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/notifications/");

    socket.onopen = () => console.log("✅ WebSocket connected!");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const mapped = mapNotification(data);

      // Add new notification to top of list
      setNotifications((prev) => [mapped, ...prev]);
    };

    socket.onclose = () => console.warn("❌ WebSocket disconnected");
    socket.onerror = (err) => console.error("⚠️ WebSocket error:", err);

    return () => socket.close();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
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
          Live Notifications
        </h2>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No notifications yet...
          </div>
        ) : (
          <ul className="relative border-l border-gray-700 space-y-6 pl-6">
            {notifications.map((notif) => (
              <motion.li
                key={notif.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition relative"
              >
                <div className="absolute -left-3 top-4 w-6 h-6 bg-yellow-400 rounded-full border-4 border-gray-900"></div>

                {notif.title && (
                  <h3 className="text-lg font-bold text-yellow-400 mb-1">
                    {notif.title}
                  </h3>
                )}
                <p className="text-white mb-2">{notif.message}</p>

                {notif.imageUrl && notif.imageUrl.trim() !== "" && (
                  <img
                    src={notif.imageUrl}
                    alt="Notification"
                    className="mt-2 w-full max-w-sm rounded-lg border border-gray-700"
                  />
                )}

                <p className="text-sm text-gray-400 mt-2">
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