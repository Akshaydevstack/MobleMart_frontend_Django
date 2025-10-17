import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserApi } from "../Data/Api_EndPoint";

export default function useCart() {
  const { user, setcartlength } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  // Fetch cart when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCart([]);
        return;
      }
      
      try {
        const res = await axios.get(`${UserApi}/${user.userid}`);
        setCart(res.data.cart || []);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCart([]);
      }
    };
    
    fetchCart();
  }, [user]);

  const addToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // Fetch latest user data
      const res = await axios.get(`${UserApi}/${user.userid}`);
      const userData = res.data;

      // Create product object with added date
      const productWithDate = {
        ...product,
        addedDate: new Date().toISOString()
      };

      const updatedCart = [...(userData.cart || []), productWithDate];
      
      await axios.patch(`${UserApi}/${user.userid}`, {
        cart: updatedCart,
      });
      
      setCart(updatedCart); // Update local cart state
      setcartlength(updatedCart.length);
      toast.success(`${product.name} added to cart 🎉`);
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add product to cart");
    }
  };

  return { cart, addToCart }; // Now returning both cart and addToCart
}