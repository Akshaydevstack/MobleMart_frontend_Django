import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthProvider";
import { AddressTemplate } from "../Data/AddresTemplate";
import { toast } from "react-hot-toast";
import LoaderPage from "../Component/LoaderPage";
import api from "../API/axios";

export default function BuyNowPage() {
  const { setCartLength } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activePaymentTab, setActivePaymentTab] = useState("credit-card");
  const [formData, setFormData] = useState(AddressTemplate);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [orderId, setOrderId] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const DEFAULT_COUPON = "SAVE10";

  // ✅ Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      if (!storedUser) {
        navigate("/login");
        return;
      }
      try {
        const res = await api.get("cart/");
        setCartItems(res.data.items || []);
        console.log("🛒 Cart:", res.data.items);
      } catch (err) {
        console.error("Error fetching cart:", err);
        toast.error("Failed to fetch cart data");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  // ✅ Calculate totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.subtotal || 0),
    0
  );
  const total = subtotal - discount;

  // ✅ Coupon Handlers
  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === DEFAULT_COUPON) {
      setAppliedCoupon(true);
      setDiscount(subtotal * 0.1);
      toast.success("Coupon applied! 10% discount added.");
    } else {
      setAppliedCoupon(false);
      setDiscount(0);
      toast.error("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(false);
    setDiscount(0);
    setCouponCode("");
    toast("Coupon removed", { icon: "ℹ️" });
  };

  // ✅ Form Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (touched[name])
      validateField(name, type === "checkbox" ? checked : value);
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, type === "checkbox" ? checked : value);
  };

  const validateField = (name, value) => {
    let error = "";
    if (!value) error = "This field is required";
    else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = "Please enter a valid email address";
    else if (name === "phone" && !/^\d{10}$/.test(value))
      error = "Please enter a valid 10-digit phone number";
    else if (name === "zip" && !/^\d{6}$/.test(value))
      error = "Please enter a valid 6-digit ZIP code";
    else if (name === "upiId" && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(value))
      error = "Please enter a valid UPI ID (e.g., name@upi)";
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // ✅ Final Order Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      // ✅ Fetch the latest cart data
      const res = await api.get("cart/");
      const cart = res.data.items || [];

      if (cart.length === 0) {
        toast.error("Your cart is empty!");
        setIsSubmitting(false);
        return;
      }

      // ✅ Calculate totals
      const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
      const total = subtotal - discount;

      // ✅ Prepare order payload
      const orderData = {
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
        payment_method:
          activePaymentTab === "credit-card"
            ? "Card"
            : activePaymentTab === "upi"
            ? "UPI"
            : activePaymentTab === "net-banking"
            ? "Net Banking"
            : "COD",
        items: cart.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
          price: parseFloat(item.product.price).toFixed(2),
        })),
        shipping_info: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip,
        },
      };

      // ✅ Create the order
      const newOrder = await api.post("orders/", orderData);
      const createdOrder = newOrder.data;

      // ✅ Clear cart after successful order
      try {
        await api.delete("cart/clear/");
      } catch {
        await api.patch("cart/", { items: [] });
      }

      setCartLength(0);
      toast.success("Order placed successfully!");

      // ✅ Redirect to confirmation page with order data
      navigate(`/order-confirmation/${createdOrder.id}`, {
        state: { order: createdOrder },
      });
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-black text-white py-8 px-4 sm:px-6 flex items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(15,24,44,0.95), rgba(55,63,73,0.95))",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl space-y-6 md:space-y-8"
      >
        <motion.h2
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center text-yellow-400"
        >
          Complete Your Purchase
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 md:gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 p-4 sm:p-6 rounded-xl md:rounded-2xl border border-gray-700 shadow-lg"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-yellow-400">
              Order Summary
            </h3>
            {cartItems.length === 0 ? (
              <p className="text-gray-400">Your cart is empty.</p>
            ) : (
              <>
                <div className="max-h-[360px] sm:max-h-[480px] overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center mb-4 p-3 sm:p-4 bg-gray-800 rounded-lg sm:rounded-xl"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.brand_name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg"
                      />
                      <div className="ml-3 sm:ml-4">
                        <h4 className="font-semibold text-sm sm:text-base">
                          {item.product.name}
                        </h4>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          {item.color} • {item.storage}
                        </p>
                        <p className="text-yellow-400 font-bold text-sm sm:text-base">
                          ₹{item.product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-800 rounded-lg sm:rounded-xl">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">
                    Apply Coupon
                  </h4>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm sm:text-base"
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-green-900/30 p-2 sm:p-3 rounded-lg">
                      <div>
                        <p className="text-green-400 font-medium text-sm sm:text-base">
                          Coupon Applied: {couponCode}
                        </p>
                        <p className="text-xs text-gray-300">
                          10% discount applied
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-400 hover:text-red-300 text-xs sm:text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Try using code: <strong>{DEFAULT_COUPON}</strong> for 10%
                    off
                  </p>
                </div>

                {/* Order Totals */}
                <div className="space-y-3 sm:space-y-4 border-t border-gray-700 pt-3 sm:pt-4">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-300">Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-300">Discount:</span>
                      <span className="text-green-400">
                        -₹{discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-300">Shipping:</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold border-t border-gray-700 pt-2 sm:pt-3">
                    <span>Total:</span>
                    <span className="text-yellow-400">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Payment & Shipping */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 p-4 sm:p-6 rounded-xl md:rounded-2xl border border-gray-700 shadow-lg"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-yellow-400">
                Payment Method
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-0 border-b border-gray-700 mb-4 sm:mb-6 overflow-x-auto pb-2">
                {["credit-card", "upi", "net-banking", "cod"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`px-3 py-1 sm:px-4 sm:py-2 font-medium text-xs sm:text-sm ${
                      activePaymentTab === type
                        ? "text-yellow-400 border-b-2 border-yellow-400"
                        : "text-gray-400 hover:text-yellow-300"
                    }`}
                    onClick={() => setActivePaymentTab(type)}
                  >
                    {type === "credit-card"
                      ? "Card"
                      : type === "upi"
                      ? "UPI"
                      : type === "net-banking"
                      ? "Net Banking"
                      : "COD"}
                  </button>
                ))}
              </div>

              {activePaymentTab === "credit-card" && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <input
                      className={`w-full bg-gray-800 border ${
                        errors.cardNumber && touched.cardNumber
                          ? "border-red-500"
                          : "border-gray-700 focus:border-yellow-400"
                      } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                      placeholder="Card Number"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength="19"
                    />
                    {errors.cardNumber && touched.cardNumber && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      className={`w-full bg-gray-800 border ${
                        errors.cardName && touched.cardName
                          ? "border-red-500"
                          : "border-gray-700 focus:border-yellow-400"
                      } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                      placeholder="Name on Card"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.cardName && touched.cardName && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.cardName}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <input
                        className={`w-full bg-gray-800 border ${
                          errors.expiry && touched.expiry
                            ? "border-red-500"
                            : "border-gray-700 focus:border-yellow-400"
                        } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                        placeholder="MM/YY"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength="5"
                      />
                      {errors.expiry && touched.expiry && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.expiry}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        className={`w-full bg-gray-800 border ${
                          errors.cvv && touched.cvv
                            ? "border-red-500"
                            : "border-gray-700 focus:border-yellow-400"
                        } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                        placeholder="CVV"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength="4"
                        type="password"
                      />
                      {errors.cvv && touched.cvv && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="saveCard"
                      checked={formData.saveCard}
                      onChange={handleChange}
                      className="text-yellow-400 rounded focus:ring-yellow-400"
                    />
                    <span className="text-gray-300 text-xs sm:text-sm">
                      Save card for future payments
                    </span>
                  </label>
                </div>
              )}

              {activePaymentTab === "upi" && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <input
                      className={`w-full bg-gray-800 border ${
                        errors.upiId && touched.upiId
                          ? "border-red-500"
                          : "border-gray-700 focus:border-yellow-400"
                      } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                      placeholder="yourname@upi"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.upiId && touched.upiId && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.upiId}
                      </p>
                    )}
                  </div>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 w-full py-2 sm:py-3 rounded-lg font-bold transition text-sm sm:text-base"
                    type="button"
                  >
                    Pay via UPI
                  </button>
                </div>
              )}

              {activePaymentTab === "net-banking" && (
                <div>
                  <select className="w-full bg-gray-800 border border-gray-700 focus:border-yellow-400 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base">
                    <option value="">Select your bank</option>
                    <option value="SBI">SBI</option>
                    <option value="HDFC">HDFC</option>
                    <option value="ICICI">ICICI</option>
                    <option value="Axis">Axis</option>
                  </select>
                  <button
                    className="bg-purple-500 hover:bg-purple-600 w-full mt-3 sm:mt-4 py-2 sm:py-3 rounded-lg font-bold transition text-sm sm:text-base"
                    type="button"
                  >
                    Proceed to Bank
                  </button>
                </div>
              )}

              {activePaymentTab === "cod" && (
                <div className="text-center py-3 sm:py-4">
                  <p className="text-gray-300 mb-2 text-sm sm:text-base">
                    Pay cash when your order is delivered.
                  </p>
                  <p className="text-green-400 text-xs sm:text-sm">
                    No additional charges apply.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Shipping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 p-4 sm:p-6 rounded-xl md:rounded-2xl border border-gray-700 shadow-lg"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-yellow-400">
                Shipping Information
              </h3>
              <form className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <input
                      className={`w-full bg-gray-800 border ${
                        errors.name && touched.name
                          ? "border-red-500"
                          : "border-gray-700 focus:border-yellow-400"
                      } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                      placeholder="Full Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.name && touched.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      className={`w-full bg-gray-800 border ${
                        errors.email && touched.email
                          ? "border-red-500"
                          : "border-gray-700 focus:border-yellow-400"
                      } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                      placeholder="Email *"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="email"
                    />
                    {errors.email && touched.email && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    className={`w-full bg-gray-800 border ${
                      errors.phone && touched.phone
                        ? "border-red-500"
                        : "border-gray-700 focus:border-yellow-400"
                    } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                    placeholder="Phone Number *"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength="10"
                  />
                  {errors.phone && touched.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <input
                    className={`w-full bg-gray-800 border ${
                      errors.address && touched.address
                        ? "border-red-500"
                        : "border-gray-700 focus:border-yellow-400"
                    } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                    placeholder="Address *"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.address && touched.address && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <input
                      className={`w-full bg-gray-800 border ${
                        errors.city && touched.city
                          ? "border-red-500"
                          : "border-gray-700 focus:border-yellow-400"
                      } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                      placeholder="City *"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.city && touched.city && (
                      <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <input
                      className={`w-full bg-gray-800 border ${
                        errors.state && touched.state
                          ? "border-red-500"
                          : "border-gray-700 focus:border-yellow-400"
                      } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                      placeholder="State *"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.state && touched.state && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      className={`w-full bg-gray-800 border ${
                        errors.zip && touched.zip
                          ? "border-red-500"
                          : "border-gray-700 focus:border-yellow-400"
                      } rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm sm:text-base`}
                      placeholder="ZIP Code *"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength="6"
                    />
                    {errors.zip && touched.zip && (
                      <p className="text-red-400 text-xs mt-1">{errors.zip}</p>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 sm:py-4 rounded-lg font-bold transition shadow-lg ${
                isSubmitting
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-300 text-black"
              } text-sm sm:text-base`}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
