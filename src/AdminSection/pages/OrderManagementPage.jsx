import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiRefreshCw, FiSearch, FiX, FiCalendar, FiUser, FiShoppingBag, FiDollarSign, FiCreditCard, FiTruck, FiFilter } from "react-icons/fi";
import { UserApi } from "../../Data/Api_EndPoint";

export default function OrderManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'processing', 'delivered', 'cancelled'

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(UserApi);
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users/orders", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (userId, orderId, newStatus) => {
    try {
      setSavingOrderId(orderId);
      const user = users.find(u => u.id === userId);
      if (!user) return;
      const updatedOrders = user.orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      await axios.patch(`${UserApi}/${userId}`, { orders: updatedOrders });
      await loadUsers();
    } catch (err) {
      console.error("Error updating order status", err);
    } finally {
      setSavingOrderId(null);
    }
  };

  const allOrders = users.flatMap(user =>
  (user.orders || []).map(order => ({
    ...order,
    userId: user.id,
    userName: user.name,
    userEmail: user.email
  }))
).sort((a, b) => new Date(b.date) - new Date(a.date)); // sort by date desc

  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchQuery.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = selectedDate
      ? new Date(order.date).toISOString().split("T")[0] === selectedDate
      : true;

    const matchesStatus = statusFilter === "all" 
      ? true 
      : order.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDate && matchesStatus;
  });

  const cancelledOrders = allOrders.filter(order => order.status === "Cancelled");

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending": return "bg-blue-500/20 text-blue-400";
      case "Processing": return "bg-orange-500/20 text-orange-400";
      case "Delivered": return "bg-green-500/20 text-green-400";
      case "Cancelled": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 p-6 rounded-2xl shadow-lg"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">Order Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Manage and track all customer orders</p>
          </div>
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-xl shadow transition"
          >
            <FiRefreshCw className="text-lg" /> Refresh Orders
          </button>
        </motion.div>

        {/* Filters Section */}
        <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-500" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-500" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={() => { 
                setSearchQuery(""); 
                setSelectedDate(""); 
                setStatusFilter("all");
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition"
            >
              <FiX /> Clear Filters
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg cursor-pointer"
            onClick={() => setStatusFilter("all")}
          >
            <div className="text-sm text-gray-400">Total Orders</div>
            <div className="text-2xl font-bold text-yellow-400">{allOrders.length}</div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg cursor-pointer"
            onClick={() => setStatusFilter("pending")}
          >
            <div className="text-sm text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-blue-400">
              {allOrders.filter(o => o.status === "Pending").length}
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg cursor-pointer"
            onClick={() => setStatusFilter("processing")}
          >
            <div className="text-sm text-gray-400">Processing</div>
            <div className="text-2xl font-bold text-orange-400">
              {allOrders.filter(o => o.status === "Processing").length}
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg cursor-pointer"
            onClick={() => setStatusFilter("delivered")}
          >
            <div className="text-sm text-gray-400">Delivered</div>
            <div className="text-2xl font-bold text-green-400">
              {allOrders.filter(o => o.status === "Delivered").length}
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg cursor-pointer"
            onClick={() => setStatusFilter("cancelled")}
          >
            <div className="text-sm text-gray-400">Cancelled</div>
            <div className="text-2xl font-bold text-red-400">
              {cancelledOrders.length}
            </div>
          </motion.div>
        </div>

        {/* Main Orders List */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-gray-900 rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-200">
              {statusFilter === "all" ? "All Orders" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders`}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  getStatusColor={getStatusColor}
                  updateOrderStatus={updateOrderStatus}
                  savingOrderId={savingOrderId}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            <div className="text-yellow-400 text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">No Orders Found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Cancelled Orders Section (shown when not already filtered by cancelled) */}
        {statusFilter !== "cancelled" && cancelledOrders.length > 0 && (
          <div className="mt-10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-200">Cancelled Orders</h2>
              <button 
                onClick={() => setStatusFilter("cancelled")}
                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                View All ({cancelledOrders.length}) <span>→</span>
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cancelledOrders.slice(0, 2).map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  getStatusColor={getStatusColor}
                  updateOrderStatus={updateOrderStatus}
                  savingOrderId={savingOrderId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Extracted Order Card Component for better readability
function OrderCard({ order, getStatusColor, updateOrderStatus, savingOrderId }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.01 }}
      className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 hover:border-yellow-400/30 transition-all"
    >
      {/* Order Header */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-yellow-400">Order #{order.id}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <FiCalendar className="text-yellow-500" />
              <span>{new Date(order.date).toLocaleString()}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gray-800 rounded-lg text-yellow-400">
            <FiUser className="text-lg" />
          </div>
          <div>
            <h4 className="font-medium text-gray-200">{order.userName}</h4>
            <p className="text-sm text-gray-400">{order.userEmail}</p>
          </div>
        </div>
        {order.shippingInfo && (
          <div className="pl-11 space-y-1 text-sm text-gray-400">
            <p className="flex items-center gap-2">
              <span className="font-medium text-gray-300">Phone:</span> {order.shippingInfo.phone}
            </p>
            <p className="flex items-start gap-2">
              <span className="font-medium text-gray-300">Address:</span>
              <span>
                {order.shippingInfo.address}, {order.shippingInfo.city},<br />
                {order.shippingInfo.state} - {order.shippingInfo.zip}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gray-800 rounded-lg text-yellow-400">
            <FiShoppingBag className="text-lg" />
          </div>
          <h4 className="font-medium text-gray-200">Items ({order.items.length})</h4>
        </div>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <img 
                src={item.image[0]} 
                alt={item.name} 
                className="h-12 w-12 rounded-lg object-cover border border-gray-700"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-yellow-400">₹{item.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg text-yellow-400">
              <FiDollarSign className="text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Subtotal</p>
              <p className="font-medium text-gray-200">₹{order.subtotal?.toLocaleString() || order.total.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg text-yellow-400">
              <FiCreditCard className="text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment</p>
              <p className="font-medium text-gray-200 capitalize">{order.paymentMethod}</p>
            </div>
          </div>
        </div>

        {order.discount > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Discount</span>
            <span className="text-sm text-red-400">-₹{order.discount.toLocaleString()}</span>
          </div>
        )}

        {order.couponUsed && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Coupon Applied</span>
            <span className="text-sm text-green-400">{order.couponUsed}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-800">
          <span className="font-bold text-gray-200">Total</span>
          <span className="text-xl font-bold text-yellow-400">₹{order.total.toLocaleString()}</span>
        </div>

        {/* Status Update */}
        <div className="mt-4 flex items-center gap-3">
          <div className="p-2 bg-gray-800 rounded-lg text-yellow-400">
            <FiTruck className="text-lg" />
          </div>
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(order.userId, order.id, e.target.value)}
            disabled={savingOrderId === order.id}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {["Pending", "Processing", "Delivered", "Cancelled"].map(status => (
              <option 
                key={status} 
                value={status}
                className="bg-gray-900"
              >
                {status}
              </option>
            ))}
          </select>
          {savingOrderId === order.id && (
            <div className="animate-spin h-5 w-5 border-b-2 border-yellow-400 rounded-full"></div>
          )}
        </div>
      </div>
    </motion.div>
  );
}