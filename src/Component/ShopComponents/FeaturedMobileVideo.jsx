import React from "react";
import { motion } from "framer-motion";

export default function FeaturedMobileVideo() {
  return (
    <section className="py-16 px-4">
      
      {/* Text Section centered inside max-w-7xl */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-10 max-w-7xl mx-auto"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
          Experience the Future
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Discover how the latest mobiles perform in real life. Watch our showcase video to explore innovations up close.
        </p>
      </motion.div>

      {/* Video full width */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="rounded-none overflow-hidden shadow-xl w-full"
      >
        <video
          src="https://image01.realme.net/general/20250528/174839646527172af45401a7c413a92b43a5702ef9689.mp4?size=14068235"
          className="w-full h-[600px] object-cover"
          autoPlay
          muted
          loop
          playsInline
        ></video>
      </motion.div>
    </section>
  );
}