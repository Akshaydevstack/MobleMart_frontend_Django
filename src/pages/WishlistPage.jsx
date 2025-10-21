import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import LoaderPage from "../Component/LoaderPage";
import useWishlist from "../Hooks/useWishlist";
import useCart from "../Hooks/useCart";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, loading, removeFromWishlist, addToCart: addToWishlistCart } = useWishlist();
  const { addToCart } = useCart(); // Your existing DRF cart hook

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // if (loading) return <LoaderPage />;

  return (
    <div className="min-h-screen text-white py-12 px-4 relative"
      style={{ background: "linear-gradient(135deg, rgba(48, 54, 72, 0.95), rgba(4, 28, 62, 0.95))" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto relative z-10">
        <motion.h2 initial={{ y: -20 }} animate={{ y: 0 }}
          className="text-4xl font-bold mb-10 text-center text-yellow-400">
          Your Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
        </motion.h2>

        {wishlist.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center p-8 bg-gray-900 bg-opacity-70 rounded-2xl border border-gray-700">
            <p className="text-gray-400 text-xl mb-4">Your wishlist is empty ❤️</p>
            <Link to="/shop" className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2 rounded-full transition">
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {wishlist.map((item) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 bg-opacity-70 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow"
    >
      {/* Product Image */}
      <img
        onClick={() => navigate(`/product/${item.id}`)}
        src={item.images[0]}
        alt={item.name}
        className="w-48 h-48 object-cover rounded-xl mb-4 cursor-pointer hover:scale-105 transition-transform"
      />

      {/* Product Info */}
      <h3 className="text-2xl font-semibold mb-1">{item.name}</h3>
      <p className="text-gray-400 mb-2">{item.brand_name}</p>
      <p className="text-yellow-400 font-bold text-xl mb-4">₹{item.price}</p>

      {/* Buttons */}
      <div className="flex space-x-3">
        {/* Add to Cart / Out of Stock Button */}
        <motion.button
          whileHover={{ scale: item.count > 0 ? 1.05 : 1 }}
          whileTap={{ scale: item.count > 0 ? 0.95 : 1 }}
          onClick={() => item.count > 0 && addToWishlistCart(item, addToCart)}
          disabled={item.count === 0}
          className={`px-6 py-2 rounded-full transition shadow-md font-semibold ${
            item.count === 0
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-yellow-400 hover:bg-yellow-300 text-black"
          }`}
        >
          {item.count === 0 ? "Out of Stock" : "Add to Cart"}
        </motion.button>

        {/* Remove from Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => removeFromWishlist(item.id)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full transition shadow-md"
        >
          Remove
        </motion.button>
      </div>
    </motion.div>
  ))}
</div>
        )}
      </motion.div>
    </div>
  );
}