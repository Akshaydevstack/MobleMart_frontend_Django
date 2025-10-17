import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { UserApi } from "../Data/Api_EndPoint";

export default function UserProfilePage() {
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [fullUserData, setFullUserData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
     
      axios
        .get(`${UserApi}/${user.userid}`)
        .then((res) => setFullUserData(res.data))
        .catch((err) => console.error("Failed to load user data:", err));
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,rgba(26,30,43,0.95),rgba(46,68,99,0.95))] text-white py-16 px-6">
      <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-8"
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${
                user.name || "User"
              }`}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-yellow-400"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">
              {fullUserData?.name || user.name}
            </h2>
            <p className="text-gray-400 mb-4">
              User ID: <span className="text-white">{user.userid}</span>
            </p>
            <p className="text-gray-300 mb-2">
              Email:{" "}
              <span className="text-white">
                {fullUserData?.email || user.email || "N/A"}
              </span>
            </p>
            <p className="text-gray-300 mb-2">
              Joined on:{" "}
              <span className="text-white">
                {fullUserData?.joined || "2025-07-10"}
              </span>
            </p>

            <div className="mt-6">
              <button
                onClick={() => navigate("/orders")}
                className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-300 transition"
              >
                View Orders
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
