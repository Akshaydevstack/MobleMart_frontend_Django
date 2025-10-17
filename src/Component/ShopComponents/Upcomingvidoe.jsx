import React from "react";
import { motion } from "framer-motion";

export default function UpcomingProductVideo() {
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
          Upcoming Product Reveal
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Get an exclusive first look at our next-generation product. Designed to elevate your lifestyle — stay tuned for the official launch!
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
          src="https://in-exstatic-vivofs.vivo.com/gdHFRinHEMrj3yPG/activity/1751946771546/zip/img/pc/vivo-x200-fe-new-model-in-the-vivo-x-series-blue.webm"
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