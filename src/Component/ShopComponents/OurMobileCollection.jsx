import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { FiSearch, FiX, FiShoppingCart, FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useCart from "../../Hooks/useCart";
import useWishlist from "../../Hooks/useWishlist"; // DRF wishlist hook

export default function OurMobileCollection({
  products,
  searchQuery,
  setSearchQuery,
  loading,
}) {
  const { cart, addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(parseInt(price.replace(/[^0-9]/g, "")));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        <h3 className="text-2xl">No products found for "{searchQuery}"</h3>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-300 transition font-semibold"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  const handleWishlistClick = (product, isInWishlist) => {
    if (isInWishlist) {
      // Optimistic removal
      removeFromWishlist(product.id);
    } else {
      // Optimistic addition
      addToWishlist(product);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 md:gap-0">
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Explore Our Mobile Collection
        </motion.h2>

        <div className="relative w-full max-w-md md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search mobiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition shadow-sm hover:shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <FiX className="text-gray-400 hover:text-white w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const isInCart = cart.items.some((item) => item.product.id === product.id);
          const isInWishlist = wishlist.some((item) => item.id === product.id);
          const stockStatus =
            product.count === 0
              ? "Out of Stock"
              : product.count < 10
              ? "Limited Stock"
              : null;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate(`/product/${product.id}`)}
              className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group cursor-pointer relative"
            >
              {stockStatus && (
                <div
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold z-10 ${
                    stockStatus === "Out of Stock"
                      ? "bg-red-600 text-white"
                      : "bg-yellow-500 text-black"
                  }`}
                >
                  {stockStatus}
                </div>
              )}

              <div className="h-64 overflow-hidden relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <span className="text-yellow-400 font-bold">{formatPrice(product.price)}</span>
                </div>
              </div>

              <div className="p-6 flex flex-col space-y-3 items-center text-center flex-grow">
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="text-gray-400 text-sm flex-grow">{product.description.slice(0, 30)}...</p>

                <div className="flex space-x-3 mt-4">
                  {isInCart ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate("/cart"); }}
                      className="px-4 py-2 rounded-full bg-green-600 text-white transition font-semibold shadow hover:shadow-md hover:bg-green-500 flex items-center gap-2 text-sm"
                    >
                      <FiShoppingCart /> Go to Cart
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); if(product.count>0) addToCart(product); toast.success(`${product.name} added to cart`) }}
                      disabled={product.count === 0}
                      className={`px-4 py-2 rounded-full transition font-semibold shadow hover:shadow-md text-sm ${
                        product.count === 0
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-yellow-400 text-black hover:bg-yellow-300"
                      }`}
                    >
                      {product.count === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); handleWishlistClick(product, isInWishlist); }}
                    disabled = {isInWishlist}
                    className={`px-2 py-2 rounded-full transition font-semibold shadow hover:shadow-md flex items-center gap-1 text-sm ${
                      isInWishlist
                        ? "bg-green-600/20 text-green-400"
                        : "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                    }`}
                  >
                    <FiHeart className={isInWishlist ? "fill-current" : ""} />
                    {isInWishlist ? "In Wishlist" : "Wishlist"}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}