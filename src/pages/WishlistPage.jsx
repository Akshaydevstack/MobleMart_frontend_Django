import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AuthContext } from "../Context/AuthProvider";
import { UserApi } from "../Data/Api_EndPoint";
import LoaderPage from "../Component/LoaderPage";

export default function WishlistPage() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setcartlength,  } = useContext(AuthContext);
  const storedUser = JSON.parse(localStorage.getItem("user"));

useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(
          `${UserApi}/${storedUser.userid}`
        );
        setWishlist(res.data.wishlist || []);
       
      } catch (err) {
        console.log("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeItem = async (id) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== id);
    setWishlist(updatedWishlist);

    try {
      await axios.patch(`${UserApi}/${storedUser.userid}`, {
        wishlist: updatedWishlist,
      });
      toast.success("Item removed from wishlist");
    } catch (err) {
      console.log("Error updating wishlist:", err);
      toast.error("Failed to remove item");
    }
  };

  const addToCart = async (item) => {
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(
        `${UserApi}/${storedUser.userid}`
      );
      const user = res.data;

      const alreadyInCart = user.cart?.some((p) => p.id === item.id);
      if (alreadyInCart) {
        toast.warn("Product already in cart");
        return;
      }

      const updatedCart = [...(user.cart || []), item];
      await axios.patch(`${UserApi}/${storedUser.userid}`, {
        cart: updatedCart,
      });
      setcartlength((prev) => prev + 1);
      toast.success("Item added to cart successfully");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add item to cart");
    }
  };

  if (loading) {
    return <LoaderPage/>
  }

  return (
    <div
      className="min-h-screen text-white py-12 px-4 relative"
      style={{
        background:
          "linear-gradient(135deg, rgba(48, 54, 72, 0.95), rgba(4, 28, 62, 0.95))",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <motion.h2
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-4xl font-bold mb-10 text-center text-yellow-400"
        >
          Your Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
        </motion.h2>

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 bg-gray-900 bg-opacity-70 rounded-2xl border border-gray-700"
          >
            <p className="text-gray-400 text-xl mb-4">
              Your wishlist is empty ❤️
            </p>
            <Link
              to="/shop"
              className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2 rounded-full transition"
            >
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
                <img
                  onClick={() => navigate(`/product/${item.id}`)}
                  src={item.image[0]}
                  alt={item.name}
                  className="w-48 h-48 object-cover rounded-xl mb-4 cursor-pointer hover:scale-105 transition-transform"
                />
                <h3 className="text-2xl font-semibold mb-1">{item.name}</h3>
                <p className="text-gray-400 mb-2">{item.brand}</p>
                <p className="text-yellow-400 font-bold text-xl mb-4">
                  ₹{item.price}
                </p>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      addToCart(item);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2 rounded-full transition shadow-md"
                  >
                    Add to Cart
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      removeItem(item.id);
                    }}
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
