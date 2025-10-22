import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../API/axios";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ Fetch order from API
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`orders/${orderId}/`);
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-300 text-lg">Fetching your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-300 text-lg">
          No order found. Please place an order first.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-[80vh] md:min-h-screen bg-black text-white py-6 md:py-12 px-4 flex flex-col items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(15,24,44,0.95), rgba(55,63,73,0.95))",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl space-y-6 md:space-y-8"
      >
        {/* ✅ Confirmation Icon */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
            className="mx-auto mb-4 md:mb-6 w-16 h-16 md:w-24 md:h-24 bg-green-500 rounded-full flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 md:h-12 md:w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-2xl md:text-4xl font-bold mb-2 text-yellow-400"
          >
            Order Confirmed!
          </motion.h1>
          <p className="text-sm md:text-lg text-gray-300">
            Thank you for your purchase, {order.shipping_info?.name || order.user_name}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* ✅ Order Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-700 shadow-md md:shadow-lg"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-yellow-400">
              Order Summary
            </h2>

            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-300">Order ID:</span>
                <span>#{order.id}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-300">Payment Method:</span>
                <span className="capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-300">Status:</span>
                <span className="capitalize text-green-400">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-300">Date:</span>
                <span>
                  {new Date(order.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3 md:pt-4 mb-3 md:mb-4">
              <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">
                Items Ordered
              </h3>
              <div className="space-y-3 max-h-48 md:max-h-60 overflow-y-auto pr-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 md:p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-12 h-12 md:w-14 md:h-14 object-contain rounded"
                      />
                      <div>
                        <p className="font-medium text-sm md:text-base">
                          {item.product_name}
                        </p>
                        <p className="text-gray-400 text-xs md:text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-yellow-400 font-bold text-sm md:text-base">
                      ₹{parseFloat(item.price).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3 md:pt-4 space-y-2 md:space-y-3">
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-300">Subtotal:</span>
                <span>₹{parseFloat(order.subtotal).toLocaleString()}</span>
              </div>
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-300">Discount:</span>
                  <span className="text-green-400">
                    -₹{parseFloat(order.discount).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-300">Shipping:</span>
                <span className="text-green-400">FREE</span>
              </div>
              <div className="flex justify-between text-base md:text-lg font-bold pt-2">
                <span>Total Paid:</span>
                <span className="text-yellow-400">
                  ₹{parseFloat(order.total).toLocaleString()}
                </span>
              </div>
            </div>

            {/* ✅ Razorpay Payment Details - Only show for Razorpay payments */}
            {order.payment_method === "Razorpay" && order.razorpay_payment_id && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-700 shadow-md md:shadow-lg mt-6"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-yellow-400">
                  Payment Details
                </h2>
                <div className="space-y-2 text-sm md:text-base text-gray-300">
                  <div className="flex justify-between">
                    <span>Razorpay Payment ID:</span>
                    <span>{order.razorpay_payment_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Razorpay Order ID:</span>
                    <span>{order.razorpay_order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signature:</span>
                    <span className="truncate max-w-[60%]">{order.razorpay_signature}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* ✅ Shipping Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-700 shadow-md md:shadow-lg flex flex-col"
          >
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-yellow-400">
                Shipping Details
              </h2>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h3 className="text-gray-400 text-xs md:text-sm mb-1">
                    Deliver to
                  </h3>
                  <p className="font-medium text-sm md:text-base">
                    {order.shipping_info.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-xs md:text-sm mb-1">
                    Address
                  </h3>
                  <p className="text-sm md:text-base">
                    {order.shipping_info.address}
                    <br />
                    {order.shipping_info.city}, {order.shipping_info.state} -{" "}
                    {order.shipping_info.zip_code}
                  </p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-xs md:text-sm mb-1">
                    Contact
                  </h3>
                  <p className="text-sm md:text-base">
                    {order.shipping_info.phone}
                    <br />
                    {order.shipping_info.email}
                  </p>
                </div>
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-800 rounded-lg border border-green-900">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 text-green-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-400 font-medium text-sm md:text-base">
                      Order Status: {order.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs md:text-sm mt-1 md:mt-2">
                    {order.payment_method === "Cash on Delivery" 
                      ? "Payment will be collected upon delivery"
                      : "Expected delivery: 3–5 business days"
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/shop")}
                className="w-full py-2 md:py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition shadow-lg text-sm md:text-base"
              >
                Continue Shopping
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/orders")}
                className="w-full py-2 md:py-3 border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold rounded-lg transition text-sm md:text-base"
              >
                View All Orders
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}