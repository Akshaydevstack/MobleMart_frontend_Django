import { useContext, useState, useEffect } from "react";
import api from "../API/axios";
import { AuthContext } from "../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function useCart() {
  const { user, setCartLength } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], total: 0 });
      setCartLength(0);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get("cart/"); // GET /api/cart/
      setCart(res.data); // store full cart object
      setCartLength(res.data.items.length);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart({ items: [], total: 0 });
      setCartLength(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
  if (!user) {
    navigate("/login");
    return;
  }

  try {
    // POST the item to cart
    await api.post("cart/", {
      product_id: product.id,
      quantity,
    });

    // Fetch the updated full cart
    const res = await api.get("cart/");
    setCart(res.data);
    setCartLength(res.data.items.length);

    
  } catch (err) {
    console.error("Add to cart error:", err);
    toast.error("Failed to add product to cart");
  }
};

const removeFromCart = async (cartItemId) => {
  try {
    await api.delete(`cart/${cartItemId}/`);

    // Fetch full cart after deletion
    const res = await api.get("cart/");
    setCart(res.data);
    setCartLength(res.data.items.length);
  } catch (err) {
    console.error("Remove from cart error:", err);
    toast.error("Failed to remove product");
  }
};

  return { cart, addToCart, removeFromCart, fetchCart, loading };
}


