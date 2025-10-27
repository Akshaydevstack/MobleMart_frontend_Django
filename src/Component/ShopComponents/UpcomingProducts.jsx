import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../../API/axios";

export default function UpcomingProducts() {
  const [upcomingProducts, setUpcomingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    next: null,
    previous: null,
  });

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  // Fetch upcoming products
  const fetchUpcomingProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`product/upcoming-productView/?page=${page}`);

      setUpcomingProducts(response.data.results);
      setPagination({
        current_page: page,
        next: response.data.next,
        previous: response.data.previous,
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching upcoming products:", err);
      setError("Failed to load upcoming products");
      setUpcomingProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingProducts(1);
  }, []);

  // ✅ Handle "Notify Me" click
  const handleNotify = async (productId, productName) => {
    try {
      // Send request to backend to subscribe for this product
      const response = await api.post(`notifications/subscribe/${productId}/`);
      toast.success(response.data.message || `You'll be notified when ${productName} is available.`);
    } catch (error) {
      console.error("Error subscribing for notification:", error);
      if (error.response?.status === 401) {
        toast.error("Please login to subscribe for notifications.");
      } else {
        toast.error("Something went wrong. Try again later.");
      }
    }
  };

  const loadNextPage = () => {
    if (pagination.next) {
      fetchUpcomingProducts(pagination.current_page + 1);
    }
  };

  const loadPrevPage = () => {
    if (pagination.previous) {
      fetchUpcomingProducts(pagination.current_page - 1);
    }
  };

  // 🌀 Loading state
  if (loading) {
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
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // ⚠️ Error state
  if (error) {
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
          <div className="text-center text-red-400">
            <p>{error}</p>
            <button
              onClick={() => fetchUpcomingProducts(1)}
              className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-300 transition font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 💤 Empty state
  if (upcomingProducts.length === 0) {
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
          <div className="text-center text-gray-400">
            <p className="text-lg">No upcoming products at the moment.</p>
            <p className="text-sm mt-2">Check back later for new launches!</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Main content
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
            const numericPrice = parseFloat(item.price);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-yellow-500/30 transition duration-300 cursor-pointer group"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x300?text=Image+Not+Found";
                    }}
                  />
                  <div className="absolute top-2 left-2 px-3 py-1 bg-yellow-400/20 text-yellow-400 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800/80 text-gray-300 text-xs rounded-full">
                    {item.brand.name}
                  </div>
                </div>

                <div className="p-5 flex flex-col space-y-2 text-center">
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <p className="text-yellow-400 font-bold text-md">{formatPrice(numericPrice)}</p>
                  <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotify(item.id, item.name);
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

        {/* Pagination */}
        {(pagination.next || pagination.previous) && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={loadPrevPage}
              disabled={!pagination.previous}
              className="px-6 py-2 bg-gray-800 text-gray-300 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Previous
            </button>

            <span className="text-gray-400 text-sm">Page {pagination.current_page}</span>

            <button
              onClick={loadNextPage}
              disabled={!pagination.next}
              className="px-6 py-2 bg-gray-800 text-gray-300 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}