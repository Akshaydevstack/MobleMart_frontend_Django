import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-gray-900 via-gray-900 to-black border-t border-gray-800 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 text-center"
      >
        <h4 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text drop-shadow-lg">
          MobileMart
        </h4>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Premium smartphones. Trusted brands. Best deals across India.
        </p>
        
        <div className="flex justify-center space-x-6 mb-10">
          <a
            href="#"
            className="p-3 rounded-full bg-gray-800 hover:bg-yellow-400 text-gray-300 hover:text-black transition transform hover:scale-110 shadow-lg"
          >
            <FaFacebookF size={20} />
          </a>
          <a
            href="#"
            className="p-3 rounded-full bg-gray-800 hover:bg-yellow-400 text-gray-300 hover:text-black transition transform hover:scale-110 shadow-lg"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="#"
            className="p-3 rounded-full bg-gray-800 hover:bg-yellow-400 text-gray-300 hover:text-black transition transform hover:scale-110 shadow-lg"
          >
            <FaInstagram size={20} />
          </a>
        </div>

        <div className="text-gray-500 text-sm">
          © {new Date().getFullYear()} MobileMart. All rights reserved.
        </div>
      </motion.div>
    </footer>
  );
}