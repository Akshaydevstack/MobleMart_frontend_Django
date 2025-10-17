import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ProductApi } from "../Data/Api_EndPoint";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const order = state?.order;
  const navigate = useNavigate();

  const [updatingInventory, setUpdatingInventory] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // ⚡ If there's an order, reduce product counts
    async function updateInventory() {
      if (!order) {
        setUpdatingInventory(false);
        return;
      }

      try {
        for (const item of order.items) {
          // Fetch the current product from your JSON server
          const { data: product } = await axios.get(`${ProductApi}/${item.id}`);

          // Reduce count
          const newCount = product.count - 1 >= 0 ? product.count - 1 : 0;

          // Update it back on server
          await axios.patch(`${ProductApi}/${item.id}`, {
            count: newCount
          });
        }
      } catch (err) {
        console.error("Failed to update inventory:", err.message);
      } finally {
        setUpdatingInventory(false);
      }
    }

    updateInventory();
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-300 text-lg">No order found. Please place an order first.</p>
      </div>
    );
  }

  return (
  <div
    className="min-h-[80vh] md:min-h-screen bg-black text-white py-6 md:py-12 px-4 flex flex-col items-center justify-center"
    style={{
      backgroundImage: "linear-gradient(135deg, rgba(15,24,44,0.95), rgba(55,63,73,0.95))"
    }}
  >
    {/* Loading overlay while updating */}
    {updatingInventory && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Updating inventory...</p>
        </div>
      </div>
    )}

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl space-y-6 md:space-y-8"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
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
        <p className="text-sm md:text-lg text-gray-300">Thank you for your purchase.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-700 shadow-md md:shadow-lg"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-yellow-400">Order Summary</h2>
          
          <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-300">Order ID:</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-300">Date:</span>
              <span>{new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-300">Payment Method:</span>
              <span className="capitalize">
                {order.paymentMethod === "credit-card" ? "Credit Card" : 
                 order.paymentMethod === "upi" ? "UPI" :
                 order.paymentMethod === "net-banking" ? "Net Banking" : "Cash on Delivery"}
              </span>
            </div>
            {order.couponUsed && (
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-300">Coupon Applied:</span>
                <span className="text-green-400">{order.couponUsed}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-700 pt-3 md:pt-4 mb-3 md:mb-4">
            <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Items Ordered</h3>
            <div className="space-y-3 max-h-48 md:max-h-60 overflow-y-auto pr-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center p-2 md:p-3 bg-gray-800 rounded-lg">
                  <img
                    src={item.image[0]}
                    alt={item.name}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-lg mr-3 md:mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm md:text-base">{item.name}</h4>
                    <p className="text-gray-400 text-xs md:text-sm">
                      {item.color} • {item.storage}
                    </p>
                  </div>
                  <p className="text-yellow-400 font-bold text-sm md:text-base">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-3 md:pt-4 space-y-2 md:space-y-3">
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-300">Subtotal:</span>
              <span>₹{order.subtotal?.toLocaleString() || order.total.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-300">Discount:</span>
                <span className="text-green-400">-₹{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-300">Shipping:</span>
              <span className="text-green-400">FREE</span>
            </div>
            <div className="flex justify-between text-base md:text-lg font-bold pt-2">
              <span>Total Paid:</span>
              <span className="text-yellow-400">₹{order.total.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Shipping Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-700 shadow-md md:shadow-lg flex flex-col"
        >
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-yellow-400">Shipping Details</h2>
            <div className="space-y-3 md:space-y-4">
              <div>
                <h3 className="text-gray-400 text-xs md:text-sm mb-1">Deliver to</h3>
                <p className="font-medium text-sm md:text-base">{order.shippingInfo.name}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-xs md:text-sm mb-1">Address</h3>
                <p className="text-sm md:text-base">
                  {order.shippingInfo.address}<br />
                  {order.shippingInfo.city}, {order.shippingInfo.state} - {order.shippingInfo.zip}
                </p>
              </div>
              <div>
                <h3 className="text-gray-400 text-xs md:text-sm mb-1">Contact</h3>
                <p className="text-sm md:text-base">
                  {order.shippingInfo.phone}<br />
                  {order.shippingInfo.email}
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
                  <span className="text-green-400 font-medium text-sm md:text-base">Order Status: {order.status}</span>
                </div>
                <p className="text-gray-300 text-xs md:text-sm mt-1 md:mt-2">
                  Expected delivery: 3-5 business days
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.print()}
              className="w-full py-2 md:py-3 border border-gray-400 text-gray-400 hover:bg-gray-700 font-bold rounded-lg transition sm:col-span-2 text-sm md:text-base"
            >
              Print Receipt
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  </div>
)
}