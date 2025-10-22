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
  const [activePaymentTab, setActivePaymentTab] = useState("");
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
  const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showSaveAddressPrompt, setShowSaveAddressPrompt] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const DEFAULT_COUPON = "SAVE10";

    useEffect(() => {
  window.scrollTo(0, 0);
}, []);


  // ✅ Fetch cart data and user addresses
  useEffect(() => {
    const fetchData = async () => {
      if (!storedUser) {
        navigate("/login");
        return;
      }
      try {
        const [cartRes, addressesRes] = await Promise.all([
          api.get("cart/"),
          api.get("users/addresses/")
        ]);
        
        setCartItems(cartRes.data.items || []);
        setUserAddresses(addressesRes.data.results || []);
        
        // Auto-select the first address if available
        if (addressesRes.data.results?.length > 0) {
          const firstAddress = addressesRes.data.results[0];
          setSelectedAddress(firstAddress);
          populateFormWithAddress(firstAddress);
        }
        
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to fetch cart or address data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // ✅ Populate form with selected address
  const populateFormWithAddress = (address) => {
    setFormData({
      name: address.name || "",
      email: address.email || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip_code || "",
    });
  };

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
    
    if (!value || value.trim() === "") {
      error = "This field is required";
    } else {
      switch (name) {
        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = "Please enter a valid email address";
          }
          break;
        case "phone":
          if (!/^\d{10}$/.test(value)) {
            error = "Please enter a valid 10-digit phone number";
          }
          break;
        case "zip":
          if (!/^\d{6}$/.test(value)) {
            error = "Please enter a valid 6-digit ZIP code";
          }
          break;
        default:
          break;
      }
    }
    
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // ✅ Validate entire form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const fieldsToValidate = ["name", "email", "phone", "address", "city", "state", "zip"];

    fieldsToValidate.forEach((field) => {
      const value = formData[field];
      validateField(field, value);
      if (!value || value.trim() === "") {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    setTouched(
      fieldsToValidate.reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    return isValid && Object.values(newErrors).every(error => !error);
  };

  // ✅ Save new address to user's address list
  const saveNewAddress = async () => {
    try {
      const addressData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip,
      };

      const res = await api.post("users/addresses/", addressData);
      setUserAddresses(prev => [...prev, res.data]);
      setSelectedAddress(res.data);
      toast.success("Address saved to your address book!");
      setShowSaveAddressPrompt(false);
    } catch (err) {
      console.error("Failed to save address:", err);
      toast.error("Failed to save address");
    }
  };

  // ✅ Process order after payment (for both COD and Online)
  const processOrder = async (orderData) => {
    setOrderProcessing(true);
    try {
      const newOrder = await api.post("orders/", orderData);
      const createdOrder = newOrder.data;

      // Clear cart
      try {
        await api.delete("cart/clear/");
      } catch {
        await api.patch("cart/", { items: [] });
      }

      setCartLength(0);
      return createdOrder;
    } finally {
      setOrderProcessing(false);
    }
  };

  // ✅ Final Order Submission
const handleSubmit = async (e) => {
  // Prevent default only if event exists (when called from form submit)
  if (e) {
    e.preventDefault();
  }
  
  if (!validateForm()) {
    toast.error("Please fix the errors in the form");
    return;
  }

  // Check if this is a new address (not in user's address list)
  const isNewAddress = !userAddresses.some(addr => 
    addr.name === formData.name &&
    addr.email === formData.email &&
    addr.phone === formData.phone &&
    addr.address === formData.address &&
    addr.city === formData.city &&
    addr.state === formData.state &&
    addr.zip_code === formData.zip
  );

  if (isNewAddress && !showSaveAddressPrompt) {
    setShowSaveAddressPrompt(true);
    return;
  }

  setIsSubmitting(true);

  try {
    // ✅ Fetch cart
    const res = await api.get("cart/");
    const cart = res.data.items || [];

    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      setIsSubmitting(false);
      return;
    }

    // ✅ Totals
    const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const total = subtotal - discount;

    // 🧾 Shared order data
    const orderData = {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      payment_method: paymentMethod,
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

    // 🪙 If Cash on Delivery → Process directly
    if (paymentMethod === "Cash On Delivery") {
      const createdOrder = await processOrder(orderData);
      toast.success("Order placed with Cash on Delivery! 📧 Sending confirmation...");
      navigate(`/order-confirmation/${createdOrder.id}`, {
        state: { order: createdOrder },
        replace: true
      });
      return;
    }

    // 💳 Otherwise — Online Payment (Razorpay)
    const { data: razorOrder } = await api.post("create-order/", {
      amount: total,
    });

    const options = {
      key: "rzp_test_RVoZd9UTCaOnZS",
      amount: razorOrder.amount,
      currency: razorOrder.currency,
      name: "Mobile Mart",
      description: "Order Payment",
      order_id: razorOrder.id,
      handler: async function (response) {
        toast.success("Payment successful! 📧 Processing your order...");

        const paidOrderData = {
          ...orderData,
          payment_method: "Razorpay",
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        };

        const createdOrder = await processOrder(paidOrderData);
        navigate(`/order-confirmation/${createdOrder.id}`, {
          state: { order: createdOrder },
        });
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#F37254",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Error:", err);
    toast.error("Something went wrong during checkout.");
  } finally {
    setIsSubmitting(false);
  }
};
  // Show loading while fetching cart
  if (loading) {
    return <LoaderPage />;
  }

  // Show order processing overlay
  if (orderProcessing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Processing Your Order</h2>
          <p className="text-gray-400 text-lg mb-2">Please wait while we confirm your order</p>
          <p className="text-gray-500 text-sm">Sending confirmation email...</p>
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Creating order</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Sending confirmation</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Clearing cart</span>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // ✅ Save Address Prompt Modal
if (showSaveAddressPrompt) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">Save This Address?</h3>
        <p className="text-gray-300 mb-6">
          Would you like to save this shipping address to your address book for future orders?
        </p>
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <p className="text-white font-semibold">{formData.name}</p>
          <p className="text-gray-400 text-sm">{formData.email} | {formData.phone}</p>
          <p className="text-gray-400 text-sm">
            {formData.address}, {formData.city}, {formData.state} - {formData.zip}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={saveNewAddress}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-semibold transition-all"
          >
            Save & Continue
          </button>
          <button
            onClick={() => {
              setShowSaveAddressPrompt(false);
              // Remove the event parameter and call handleSubmit directly
              handleSubmit();
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-semibold transition-all"
          >
            Continue Without Saving
          </button>
        </div>
      </motion.div>
    </div>
  );
}

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
            {/* Address Selection */}
            {userAddresses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 p-4 sm:p-6 rounded-xl md:rounded-2xl border border-gray-700 shadow-lg"
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-yellow-400">
                  Select Shipping Address
                </h3>
                
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {userAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAddress?.id === address.id
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                      }`}
                      onClick={() => {
                        setSelectedAddress(address);
                        populateFormWithAddress(address);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white font-semibold">{address.name}</p>
                          <p className="text-gray-400 text-sm">{address.email} | {address.phone}</p>
                          <p className="text-gray-400 text-sm">
                            {address.address}, {address.city}, {address.state} - {address.zip_code}
                          </p>
                        </div>
                        {selectedAddress?.id === address.id && (
                          <div className="text-yellow-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-semibold transition-all text-sm"
                  >
                    {showAddressForm ? "Cancel New Address" : "Add New Address"}
                  </button>
                  <button
                    onClick={() => navigate("/user")}
                    className="px-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-all text-sm"
                  >
                    Manage Addresses
                  </button>
                </div>
              </motion.div>
            )}

            {/* Shipping Form */}
            {(showAddressForm || userAddresses.length === 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 p-4 sm:p-6 rounded-xl md:rounded-2xl border border-gray-700 shadow-lg"
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-yellow-400">
                  {userAddresses.length === 0 ? "Shipping Information" : "Add New Address"}
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
            )}

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
                {["Online Payment", "Cash On Delivery"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`px-3 py-1 sm:px-4 sm:py-2 font-medium text-xs sm:text-sm ${
                      activePaymentTab === type
                        ? "text-yellow-400 border-b-2 border-yellow-400"
                        : "text-gray-400 hover:text-yellow-300"
                    }`}
                    onClick={() =>{
                       setActivePaymentTab(type)
                       setPaymentMethod(type)
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Online Payment Section */}
              {activePaymentTab === "Online Payment" && (
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-gray-300 text-sm sm:text-base mb-2">
                    You will be redirected to Razorpay to complete the payment.
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`bg-yellow-400 hover:bg-yellow-300 w-full py-2 sm:py-3 rounded-lg font-bold text-black text-sm sm:text-base flex items-center justify-center gap-2 ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Preparing Payment...
                      </>
                    ) : (
                      "Pay Now"
                    )}
                  </button>
                </div>
              )}

              {/* Cash On Delivery Section */}
              {activePaymentTab === "Cash On Delivery" && (
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 sm:py-4 rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-300 text-black"
              } text-sm sm:text-base`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}