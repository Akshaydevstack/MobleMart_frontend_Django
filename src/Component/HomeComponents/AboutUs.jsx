import React from "react";
import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <div className="relative bg-black text-white py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-black" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
      >
        {/* Text Section */}
        <div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 border-b-4 border-yellow-400 inline-block pb-2">
            About Us
          </h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Welcome to <span className="text-yellow-400 font-semibold">MobileMart</span> — 
            your one-stop destination for the latest smartphones at unbeatable prices.
            We are passionate about bringing you top-notch devices, outstanding customer support,
            and seamless shopping experiences.
          </p>
          <p className="text-gray-400">
            Explore our extensive collection, watch in-depth reviews,
            and discover why thousands trust us for their mobile needs.
          </p>
        </div>

        {/* Video Section */}
        <div className="rounded-3xl overflow-hidden transform hover:scale-105 transition duration-500">
          <video
            className="w-full h-56 sm:h-64 md:h-80 lg:h-96 object-cover"
            src="https://asia-exstatic-vivofs.vivo.com/PSee2l50xoirPK7y/funtouch/1733193409448/zip/img/pc/WaterLike.mp4"
            autoPlay
            muted
            loop
            playsInline
          ></video>
        </div>
      </motion.div>
    </div>
  );
}