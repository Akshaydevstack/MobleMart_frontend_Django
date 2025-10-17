import { motion } from "framer-motion";

export default function UpcomingProducts({ upcomingProducts }) {
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
      .format(price);

  return (
    <div className="bg-gray-900 py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 text-center tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Upcoming Launches
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingProducts.map((item, index) => {
            const numericPrice = parseInt(item.price.replace(/[^0-9]/g, ''));

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => alert("We'll notify you when available!")}
                className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-yellow-500/30 transition duration-300 cursor-pointer group"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 left-2 px-3 py-1 bg-yellow-400/20 text-yellow-400 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                </div>
                <div className="p-5 flex flex-col space-y-2 text-center">
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <p className="text-yellow-400 font-bold text-md">{formatPrice(numericPrice)}</p>
                  <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("We'll notify you when available!");
                    }}
                    className="mt-3 bg-yellow-400 text-black px-5 py-2 rounded-full hover:bg-yellow-300 transition font-semibold shadow"
                  >
                    Notify Me
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}