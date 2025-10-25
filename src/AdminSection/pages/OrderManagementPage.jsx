import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { 
  FiRefreshCw, 
  FiSearch, 
  FiX, 
  FiCalendar, 
  FiUser, 
  FiShoppingBag, 
  FiDollarSign, 
  FiCreditCard, 
  FiTruck, 
  FiFilter 
} from "react-icons/fi";
import api from "../../API/axios";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ordering, setOrdering] = useState("-created_at");
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    next: null,
    previous: null,
  });
  const [stats, setStats] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Debounced load orders function
  const debouncedLoadOrders = useCallback(
    debounce(async (page = 1, search = "", date = "", status = "all", orderBy = "-created_at") => {
      try {
        setLoading(true);
        const params = { page, ordering: orderBy };
        if (search) params.search = search;
        if (status !== "all") params.status = status;
        if (date) params.date = date;

        const res = await api.get("admin/order-management/", { params });

        setOrders(res.data.results);
        setPagination({
          current_page: res.data.current_page,
          total_pages: res.data.total_pages,
          next: res.data.next,
          previous: res.data.previous,
        });
        setStats(res.data.stats);
      } catch (err) {
        console.error("Error loading orders", err);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Load orders whenever filters, ordering, or current page changes
  useEffect(() => {
    debouncedLoadOrders(pagination.current_page, searchQuery, selectedDate, statusFilter, ordering);
  }, [pagination.current_page, searchQuery, selectedDate, statusFilter, ordering, debouncedLoadOrders]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedLoadOrders.cancel();
    };
  }, [debouncedLoadOrders]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setSavingOrderId(orderId);
      await api.patch(`admin/order-management/${orderId}/`, { status: newStatus });
      debouncedLoadOrders(pagination.current_page, searchQuery, selectedDate, statusFilter, ordering);
    } catch (err) {
      console.error("Error updating order status", err);
    } finally {
      setSavingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending": return "bg-blue-500/20 text-blue-400";
      case "Processing": return "bg-orange-500/20 text-orange-400";
      case "Delivered": return "bg-green-500/20 text-green-400";
      case "Cancelled": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  // Calculate stats for display
  const allOrders = orders;
  const cancelledOrders = orders.filter(order => order.status === "Cancelled");

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
            onClick={() => debouncedLoadOrders(1, searchQuery, selectedDate, statusFilter, ordering)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-xl shadow transition"
          >
            <FiRefreshCw className="text-lg" /> Refresh Orders
          </button>
        </motion.div>

        {/* Filters Section */}
        <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => { setPagination(prev => ({ ...prev, current_page: 1 })); setSearchQuery(e.target.value); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            
            {/* Date */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-500" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setPagination(prev => ({ ...prev, current_page: 1 })); setSelectedDate(e.target.value); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-500" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setPagination(prev => ({ ...prev, current_page: 1 })); setStatusFilter(e.target.value); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Ordering */}
            <div className="relative">
              <select
                value={ordering}
                onChange={(e) => { setPagination(prev => ({ ...prev, current_page: 1 })); setOrdering(e.target.value); }}
                className="w-full pl-4 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="-total">Highest Total</option>
                <option value="total">Lowest Total</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setPagination(prev => ({ ...prev, current_page: 1 }));
                setSearchQuery("");
                setSelectedDate("");
                setStatusFilter("all");
                setOrdering("-created_at");
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
            <div className="text-2xl font-bold text-yellow-400">{stats.all}</div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg cursor-pointer"
            onClick={() => setStatusFilter("pending")}
          >
            <div className="text-sm text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-blue-400">
              {stats.pending}
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg cursor-pointer"
            onClick={() => setStatusFilter("processing")}
          >
            <div className="text-sm text-gray-400">Processing</div>
            <div className="text-2xl font-bold text-orange-400">
              {stats.processing}
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg cursor-pointer"
            onClick={() => setStatusFilter("delivered")}
          >
            <div className="text-sm text-gray-400">Delivered</div>
            <div className="text-2xl font-bold text-green-400">
              {stats.delivered}
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg cursor-pointer"
            onClick={() => setStatusFilter("cancelled")}
          >
            <div className="text-sm text-gray-400">Cancelled</div>
            <div className="text-2xl font-bold text-red-400">
              {stats.cancelled}
            </div>
          </motion.div>
        </div>

        {/* Main Orders List */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-gray-900 rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-200">
              {statusFilter === "all" ? "All Orders" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders`}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {orders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  getStatusColor={getStatusColor}
                  updateOrderStatus={updateOrderStatus}
                  savingOrderId={savingOrderId}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-200 disabled:opacity-50 hover:bg-gray-700 transition"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                disabled={pagination.current_page >= pagination.total_pages}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-200 disabled:opacity-50 hover:bg-gray-700 transition"
              >
                Next
              </button>
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

// Order Card Component with previous UI style
function OrderCard({ order, getStatusColor, updateOrderStatus, savingOrderId }) {
  const formatPrice = (price) => {
    return `₹${parseInt(price).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 20) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
              <span>{formatDate(order.created_at)}</span>
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
            <h4 className="font-medium text-gray-200">{order.user_name}</h4>
            <p className="text-sm text-gray-400">{order.shipping_info.email}</p>
          </div>
        </div>
        <div className="pl-11 space-y-1 text-sm text-gray-400">
          <p className="flex items-center gap-2">
            <span className="font-medium text-gray-300">Phone:</span> {order.shipping_info.phone}
          </p>
          <p className="flex items-start gap-2">
            <span className="font-medium text-gray-300">Address:</span>
            <span>
              {order.shipping_info.address}, {order.shipping_info.city},<br />
              {order.shipping_info.state} - {order.shipping_info.zip_code}
            </span>
          </p>
        </div>
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
                src={item.product_image} 
                alt={item.product_name} 
                className="h-12 w-12 rounded-lg object-cover border border-gray-700"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200">{item.product_name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-yellow-400">{formatPrice(item.price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Razorpay Payment Details */}
      {order.payment_method === "Razorpay" && (
        <div className="p-5 border-b border-gray-800 bg-purple-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <FiCreditCard className="text-lg" />
            </div>
            <h4 className="font-medium text-gray-200">Razorpay Payment Details</h4>
          </div>
          <div className="pl-11 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Order ID:</span>
              <span className="text-gray-200 font-mono text-xs">
                {truncateText(order.razorpay_order_id, 24)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Payment ID:</span>
              <span className="text-gray-200 font-mono text-xs">
                {truncateText(order.razorpay_payment_id, 24)}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-400 font-medium">Signature:</span>
              <span className="text-gray-200 font-mono text-xs text-right">
                {truncateText(order.razorpay_signature, 30)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg text-yellow-400">
              <FiDollarSign className="text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Subtotal</p>
              <p className="font-medium text-gray-200">{formatPrice(order.subtotal)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gray-800 rounded-lg ${
              order.payment_method === "Razorpay" ? "text-purple-400" : "text-yellow-400"
            }`}>
              <FiCreditCard className="text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment</p>
              <p className="font-medium text-gray-200 capitalize">{order.payment_method}</p>
            </div>
          </div>
        </div>

        {parseFloat(order.discount) > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Discount</span>
            <span className="text-sm text-red-400">-{formatPrice(order.discount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-800">
          <span className="font-bold text-gray-200">Total</span>
          <span className="text-xl font-bold text-yellow-400">{formatPrice(order.total)}</span>
        </div>

        {/* Status Update */}
        <div className="mt-4 flex items-center gap-3">
          <div className="p-2 bg-gray-800 rounded-lg text-yellow-400">
            <FiTruck className="text-lg" />
          </div>
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
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