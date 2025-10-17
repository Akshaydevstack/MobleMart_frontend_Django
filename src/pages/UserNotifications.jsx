import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { NotificationApi } from "../Data/Api_EndPoint";
import LoaderPage from "../Component/LoaderPage";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(NotificationApi);
        // Sort latest first
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(sorted);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
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
          Notifications
        </h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No notifications yet 🎉</div>
        ) : (
          <ul className="relative border-l border-gray-700 space-y-6 pl-6">
            {notifications.map((notif) => (
              <motion.li
                key={notif.id || notif.createdAt}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition relative"
              >
                <div className="absolute -left-3 top-4 w-6 h-6 bg-yellow-400 rounded-full border-4 border-gray-900"></div>
                
                {/* Title */}
                {notif.title && (
                  <h3 className="text-lg font-bold text-yellow-400 mb-1">
                    {notif.title}
                  </h3>
                )}
                
                {/* Message */}
                <p className="text-white mb-2">{notif.message}</p>

                {/* Optional Image */}
                {notif.imageUrl && notif.imageUrl.trim() !== "" && (
                  <img
                    src={notif.imageUrl}
                    alt="Notification"
                    className="mt-2 w-full h-half max-w-sm rounded-lg border border-gray-700"
                  />
                )}

                <p className="text-sm text-gray-400 mt-2">{formatDate(notif.createdAt)}</p>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}