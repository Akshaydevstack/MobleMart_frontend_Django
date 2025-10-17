import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserApi } from "../Data/Api_EndPoint";
import LoaderPage from "../Component/LoaderPage";

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!storedUser) {
        navigate("/login");
        return;
      }
      try {
        const res = await axios.get(
          `${UserApi}/${storedUser.userid}`
        );
        setOrders(res.data.orders?.reverse() || []); // Show newest orders first
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status?.toLowerCase()) {
      case "shipped":
        return `${baseClasses} bg-blue-500/20 text-blue-400`;
      case "delivered":
        return `${baseClasses} bg-green-500/20 text-green-400`;
      case "cancelled":
        return `${baseClasses} bg-red-500/20 text-red-400`;
      default:
        return `${baseClasses} bg-yellow-500/20 text-yellow-400`;
    }
  };

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmed) return;

    try {
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: "Cancelled" } : order
      );

      await axios.patch(`${UserApi}/${storedUser.userid}`, {
        orders: updatedOrders,
      });

      setOrders(updatedOrders);
      toast.success("Order cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error("Failed to cancel the order. Please try again.");
    }
  };

{
  loading&& <LoaderPage/>
}

  return (
    <div
      className="min-h-screen bg-black text-white py-12 px-4"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(15,24,44,0.95), rgba(55,63,73,0.95))",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-4xl font-bold text-center text-yellow-400 mb-10"
        >
          Your Order History
        </motion.h1>

        {loading ? (
         <LoaderPage/>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 bg-gray-900 rounded-2xl border border-gray-700"
          >
            <p className="text-gray-400 text-xl mb-6">
              You haven't placed any orders yet
            </p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition shadow-lg"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-900 p-6 rounded-2xl border border-gray-700 shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-yellow-400">
                      Order #{order.id}
                    </h3>
                    <div className="flex gap-3 text-sm">
                      <span className="text-gray-400">Placed on:</span>
                      <span>
                        {new Date(order.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <span className="text-gray-400">Payment:</span>
                      <span className="capitalize">
                        {order.paymentMethod === "credit-card"
                          ? "Credit Card"
                          : order.paymentMethod === "upi"
                          ? "UPI"
                          : order.paymentMethod === "net-banking"
                          ? "Net Banking"
                          : "Cash on Delivery"}
                      </span>
                    </div>
                    {order.couponUsed && (
                      <div className="flex gap-3 text-sm">
                        <span className="text-gray-400">Coupon:</span>
                        <span className="text-green-400">{order.couponUsed}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm">Status:</span>
                      <span className={getStatusBadge(order.status)}>
                        {order.status || "Processing"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-300 text-sm">Total Paid:</div>
                      <div className="text-2xl font-bold text-yellow-400">
                        ₹{order.total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="font-bold mb-4">Order Items</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="flex items-center space-x-4 bg-gray-800 p-4 rounded-xl cursor-pointer hover:bg-gray-700 transition"
                      >
                        <img
                          src={
                            Array.isArray(item.image) ? item.image[0] : item.image
                          }
                          alt={item.name}
                          className="w-16 h-16 object-contain rounded-lg"
                        />
                        <div>
                          <h4 className="font-medium line-clamp-1">{item.name}</h4>
                          <p className="text-gray-400 text-xs">
                            {item.color} • {item.storage}
                          </p>
                          <p className="text-yellow-400 font-bold">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate("/orderconfirmation", { state: { order } })
                      }
                      className="px-4 py-2 border border-gray-500 text-gray-300 hover:bg-gray-700 rounded-lg text-sm transition"
                    >
                      View Details
                    </motion.button>
                    {order.status !== "Delivered" &&
                      order.status !== "Cancelled" && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition"
                        >
                          Cancel Order
                        </motion.button>
                      )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}