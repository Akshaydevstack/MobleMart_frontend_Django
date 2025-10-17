import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex flex-col items-center justify-center
        bg-gradient-to-br from-yellow-400/10 via-black to-black text-white px-4"
    >
      <h1 className="text-6xl font-bold mb-6">404</h1>
      <p className="text-xl mb-8 text-center max-w-md">
        Oops! The page you're looking for does not exist.
      </p>
      <Link
        to="/"
        className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded-full hover:bg-yellow-300 transition-colors duration-200"
      >
        Go back home
      </Link>
    </motion.div>
  );
}