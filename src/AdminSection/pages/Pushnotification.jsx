import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FiTrash2, FiSend, FiImage, FiX } from "react-icons/fi";
import { NotificationApi } from "../../Data/Api_EndPoint";

export default function PushNotification() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);

  // Fetch existing notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(NotificationApi);
        setNotifications(response.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handlePush = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      setSending(true);
      const newNotification = {
        title: title.trim(),
        message: message.trim(),
        imageUrl: imageUrl.trim(),
        createdAt: new Date().toISOString(),
      };

      const response = await axios.post(
        NotificationApi,
        newNotification
      );
      const savedNotification = response.data;

      setNotifications((prev) => [savedNotification, ...prev]);
      toast.success("Notification sent!");
      setTitle("");
      setMessage("");
      setImageUrl("");
      setShowImageInput(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Invalid notification id");
      return;
    }

    try {
      await axios.delete(`${NotificationApi}/${id}`);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
      toast.success("Notification deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">
            Push Notifications Dashboard
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage and review all push notifications sent to users.
          </p>
        </div>

        {/* Notification Form */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Create New Notification
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message*</label>
              <textarea
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your notification message here..."
                required
              />
            </div>

            {showImageInput ? (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Image URL (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="flex-1 p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    onClick={() => {
                      setImageUrl("");
                      setShowImageInput(false);
                    }}
                    className="p-3 text-gray-400 hover:text-white"
                    title="Remove image"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowImageInput(true)}
                className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300"
              >
                <FiImage /> Add Image URL (Optional)
              </button>
            )}

            <button
              className={`mt-4 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-lg font-medium transition-colors ${
                sending ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={handlePush}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Notification"}
              <FiSend className="inline" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-3">
            Notification History
          </h3>

          {loading ? (
            <div className="text-center py-12">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No notifications yet
            </div>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li
                  key={notification.id || notification.createdAt}
                  className="bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-yellow-400 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {notification.title && (
                        <h4 className="text-lg font-semibold text-yellow-400 mb-1">
                          {notification.title}
                        </h4>
                      )}
                      <p className="text-white">{notification.message}</p>
                      {notification.imageUrl && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-400">
                            Image URL:{" "}
                          </span>
                          <span className="text-xs text-blue-400 break-all">
                            {notification.imageUrl}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-400 hover:text-red-300 p-2 ml-2"
                      title="Delete notification"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
