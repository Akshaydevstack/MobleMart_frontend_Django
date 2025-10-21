import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useCart from "../../Hooks/useCart";
import LoaderPage from "../LoaderPage";
import toast from "react-hot-toast";

export default function PremiumPicks({ featuredItems = [] }) {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const isLoading = featuredItems.length === 0;

  return (
    <div className="bg-gray-900 py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-10 text-center tracking-wide text-yellow-400"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Premium Picks for You
        </motion.h2>

        {/* Loader */}
        {isLoading ? (
         <LoaderPage/>
        ) : (
          <div className="space-y-12">
            {featuredItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="flex flex-col md:flex-row bg-black border border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Image Section */}
                <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto h-auto overflow-hidden">
                  <motion.img
                    onClick={() => navigate(`/product/${item.id}`)}
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>

                {/* Text Content */}
                <div className="flex-1 p-6 flex flex-col justify-center space-y-4">
                  <h3 className="text-2xl font-semibold">{item.name}</h3>
                  <p className="text-gray-400 text-lg">₹{item.price}</p>
                  <p className="text-gray-300 text-sm md:text-base">
                    {item.description}
                  </p>

                  <motion.button
                    onClick={() => {
                      if (!storedUser) {
                        navigate("/login");
                      } else {
                        addToCart(item);
                        toast.success(`${item.name} added to cart`)
                      }
                    }}
                    className="w-max bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-300 transition font-semibold shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add to Cart
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}