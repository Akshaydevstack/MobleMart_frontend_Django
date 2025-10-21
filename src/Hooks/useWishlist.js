import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../API/axios";
import { AuthContext } from "../Context/AuthProvider";

export default function useWishlist() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Use useCallback to prevent unnecessary re-renders
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get("wishlist/"); // GET /api/wishlist/
      setWishlist(res.data.products || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      toast.error("Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ✅ Add product to wishlist
  const addToWishlist = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await api.post("wishlist/", { product_id: product.id });
      toast.success(`${product.name} added to wishlist ❤️`);
      // 🔁 Re-fetch after adding to sync state immediately
      await fetchWishlist();
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      toast.error("Failed to add product to wishlist");
    }
  };

  // ✅ Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`wishlist/${productId}/`);
      toast.success("Item removed from wishlist");
      // 🔁 Re-fetch after removing to sync state immediately
      await fetchWishlist();
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      toast.error("Failed to remove item");
    }
  };

  // ✅ Add product to cart from wishlist
  const addToCart = async (product, addToCartFn) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await addToCartFn(product);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart");
    }
  };

  // ✅ Fetch wishlist whenever user changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    addToCart,
  };
}