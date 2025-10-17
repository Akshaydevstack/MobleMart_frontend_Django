import React from "react";
import { motion } from "framer-motion";
import { Smile } from "lucide-react";

export default function WelcomeAdmin() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/70 border border-gray-700 rounded-xl sm:rounded-2xl p-3 shadow-lg flex items-center space-x-4"
    >
      <div className="bg-yellow-400 text-gray-900 rounded-full p-3">
        <Smile size={28} />
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400">
          Welcome back Admin!
        </h2>
        <p className="text-gray-300 mt-1">Here's what's happening today.</p>
      </div>
    </motion.div>
  );
}