import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import {
  FiUser,
  FiShield,
  FiLock,
  FiShoppingBag,
  FiHeart,
  FiShoppingCart,
  FiX,
  FiFilter,
  FiPackage,
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiLoader,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../../API/axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeSection, setActiveSection] = useState("orders");
  const [filters, setFilters] = useState({ role: "all", status: "all" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingStates, setLoadingStates] = useState({});
  const [loadingUser, setLoadingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [userStatus, setUserStatus] = useState({});

  // Proper debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setPage(1);
    }, 500),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    loadUsers();
  }, [page, pageSize, search, filters,selectedUser]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        search: search || undefined,
        role: filters.role !== "all" ? filters.role : undefined,
        is_block: filters.status !== "all" ? filters.status : undefined,
      };

      // Remove undefined parameters
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const res = await api.get("admin/users-management/", { params });
      setUsers(res.data.results || []);
      setTotalUsers(res.data.count || 0);
      setUserStatus({
        totalUsers: res.data.total_users,
        blockedUsers: res.data.blocked_users,
        adminUsers: res.data.admin_users,
      });
    } catch (err) {
      console.error("Error loading users", err);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserOrders = async (userId) => {
    try {
      const res = await api.get(`admin/order-management/${userId}`);
      return res.data.results || [];
    } catch (err) {
      console.error("Error loading orders", err);
      toast.error("Failed to load orders");
      return [];
    }
  };

  const handleUserClick = async (user) => {
    setLoadingUser(user.id);
    try {
      const [wishlistRes, cartRes, ordersRes] = await Promise.all([
        api.get(`admin/wishlist-management/${user.id}/`),
        api.get(`admin/cart-management/${user.id}/`),
        loadUserOrders(user.id),
      ]);

      setSelectedUser({
        ...user,
        wishlist: wishlistRes.data.products || [],
        cart: (cartRes.data.items || []).map((item) => ({
          ...item.product,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        total: cartRes.data.total || 0,
        orders: ordersRes,
      });
      setActiveSection("orders");
    } catch (err) {
      console.error("Error loading user data", err);
      toast.error("Failed to load user details");
    } finally {
      setLoadingUser(null);
    }
  };

  const updateUser = async (id, updatedFields, actionType = "block") => {
    setLoadingStates((prev) => ({ ...prev, [`${id}-${actionType}`]: true }));
    try {
      await api.patch(`admin/users-management/${id}/`, updatedFields);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updatedFields } : u))
      );
      if (selectedUser?.id === id)
        setSelectedUser((prev) => ({ ...prev, ...updatedFields }));
      toast.success("User updated successfully!");
    } catch (err) {
      console.error("Error updating user", err);
      toast.error("Failed to update user");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`${id}-${actionType}`]: false }));
    }
  };

  const deleteUser = async (user) => {
    if (user.role === "Admin") {
      toast.error("Cannot delete an admin user");
      return;
    }
    const confirmed = window.confirm(`Delete ${user.username} permanently?`);
    if (!confirmed) return;

    try {
      await api.delete(`admin/users-management/${user.id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (selectedUser?.id === user.id) setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user", err);
      toast.error("Failed to delete user");
    }
  };

  const formatPrice = (price) => {
    if (!price) return 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "processing":
        return "text-blue-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getCardGradient = (user) => {
    if (user.role === "Admin") {
      return "from-purple-600/20 to-purple-800/30 border-purple-500/30";
    }
    return "from-gray-700/50 to-gray-800/50 border-gray-600/30";
  };

  const getRoleTextColor = (user) => {
    if (user.role === "Admin") {
      return "text-purple-400";
    }
    return "text-gray-300";
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Update input immediately for better UX
    setSearchInput(value);
    // Debounce the API call
    debouncedSearch(value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setPage(1);
  };

  const totalPages = Math.ceil(totalUsers / pageSize) || 1;

  const renderSectionContent = () => {
    switch (activeSection) {
      case "orders":
        return (
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
              <FiPackage className="inline" /> Order History
            </h3>
            {selectedUser.orders?.length ? (
              <div className="space-y-4">
                {selectedUser.orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                      <div>
                        <div className="font-semibold text-yellow-400">
                          Order #{order.id}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                          <FiCalendar size={14} />
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-1 justify-end">
                          <FiDollarSign size={14} />
                          {order.payment_method}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 items-center p-2 bg-gray-700/30 rounded"
                        >
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-10 h-10 object-contain rounded border border-gray-600"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {item.product_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-gray-700">
                      <div className="text-sm">
                        <div className="text-gray-400">
                          Subtotal: {formatPrice(order.subtotal)}
                        </div>
                        {order.discount && (
                          <div className="text-green-400">
                            Discount: -{formatPrice(order.discount)}
                          </div>
                        )}
                        <div className="text-yellow-400 font-semibold">
                          Total: {formatPrice(order.total)}
                        </div>
                      </div>

                      {order.shipping_info && (
                        <div className="text-xs text-gray-400 max-w-[200px]">
                          <div className="flex items-center gap-1">
                            <FiMapPin size={12} />
                            {order.shipping_info.city},{" "}
                            {order.shipping_info.state}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 bg-gray-800/30 p-4 rounded-lg text-center">
                No orders found
              </div>
            )}
          </div>
        );

      case "wishlist":
        return (
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              <FiHeart className="inline" /> Wishlist
            </h3>
            {selectedUser.wishlist?.length ? (
              selectedUser.wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 mb-2 flex gap-3"
                >
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-12 h-12 object-contain rounded border border-gray-700"
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-yellow-400">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">Wishlist is empty</div>
            )}
          </div>
        );

      case "cart":
        return (
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              <FiShoppingCart className="inline" /> Cart
            </h3>
            {selectedUser.cart?.length ? (
              selectedUser.cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex gap-3 mb-2"
                >
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-12 h-12 object-contain rounded border border-gray-700"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-400">
                      {item.brand_name}
                    </div>
                    <div className="text-yellow-400">
                      {formatPrice(item.price)} x {item.quantity} ={" "}
                      {formatPrice(item.subtotal)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">Cart is empty</div>
            )}
            {selectedUser.total && (
              <div className="text-yellow-400 font-semibold mt-2">
                Total: {formatPrice(selectedUser.total)}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 p-6 rounded-2xl shadow-lg"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">
              User Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage user accounts, roles, and access status easily.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-2/3">
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by name, email or ID"
              className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />

            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                >
                  <option value="all">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </div>
              <div className="relative flex-1">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="pl-8 pr-4 py-2 w-full rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="false">Active</option>
                  <option value="true">Blocked</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-400">Total Users</div>
            <div className="text-2xl font-bold text-yellow-400">{userStatus.totalUsers}</div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-400">Admins</div>
            <div className="text-2xl font-bold text-purple-400">{userStatus.adminUsers}</div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-2 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-400">Blocked Users</div>
            <div className="text-2xl font-bold text-red-400">{userStatus.blockedUsers}</div>
          </motion.div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <FiLoader className="animate-spin text-yellow-400 text-2xl" />
          </div>
        )}

        {/* User Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleUserClick(user)}
              className={`bg-gradient-to-br ${getCardGradient(
                user
              )} border rounded-xl p-5 shadow-lg transition duration-300 space-y-3 cursor-pointer relative overflow-hidden`}
            >
              {/* Loading overlay */}
              {loadingUser === user.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl z-10">
                  <FiLoader className="animate-spin text-yellow-400 text-2xl" />
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="bg-gray-700/50 p-2 rounded-lg text-yellow-400">
                  <FiUser className="text-lg" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-yellow-400 truncate">
                    {user.username}{" "}
                    <span className="text-sm text-gray-300">
                      (ID: {user.id})
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm break-words">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <div
                  className={`flex items-center gap-1 text-sm ${getRoleTextColor(
                    user
                  )}`}
                >
                  <FiShield /> {user.role}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    user.is_block ? "text-red-400" : "text-green-400"
                  }`}
                >
                  <FiLock /> {user.is_block ? "Blocked" : "Active"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Users State */}
        {!isLoading && users.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No users found matching your criteria.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-2 bg-gray-700 rounded-lg text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <span className="text-gray-300 px-4">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-700 rounded-lg text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* User Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto text-gray-200"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                  <h2 className="text-2xl font-bold text-yellow-400">
                    {selectedUser.username}'s Account
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Account Info + Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-400">ID:</span>{" "}
                      {selectedUser.id}
                    </div>
                    <div>
                      <span className="text-gray-400">Name:</span>{" "}
                      {selectedUser.username}
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>{" "}
                      {selectedUser.email}
                    </div>
                    <div>
                      <span className="text-gray-400">Role:</span>{" "}
                      <span className={getRoleTextColor(selectedUser)}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>{" "}
                      <span
                        className={
                          selectedUser.is_block
                            ? "text-red-400"
                            : "text-green-400"
                        }
                      >
                        {selectedUser.is_block ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      updateUser(
                        selectedUser.id,
                        {
                          is_block: !selectedUser.is_block,
                        },
                        "block"
                      )
                    }
                    disabled={loadingStates[`${selectedUser.id}-block`]}
                    className={`${
                      selectedUser.is_block
                        ? "bg-green-500 hover:bg-green-600 text-gray-900"
                        : "bg-red-500 hover:bg-red-600 text-gray-100"
                    } px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px] justify-center`}
                  >
                    {loadingStates[`${selectedUser.id}-block`] ? (
                      <FiLoader className="animate-spin" />
                    ) : null}
                    {selectedUser.is_block ? "Unblock" : "Block"}
                  </button>
                  <button
                    onClick={() =>
                      updateUser(
                        selectedUser.id,
                        {
                          role:
                            selectedUser.role === "Admin" ? "User" : "Admin",
                        },
                        "role"
                      )
                    }
                    disabled={loadingStates[`${selectedUser.id}-role`]}
                    className={`${
                      selectedUser.role === "Admin"
                        ? "bg-purple-400 hover:bg-purple-500 text-gray-900"
                        : "bg-blue-400 hover:bg-blue-500 text-gray-900"
                    } px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[150px] justify-center`}
                  >
                    {loadingStates[`${selectedUser.id}-role`] ? (
                      <FiLoader className="animate-spin" />
                    ) : null}
                    {selectedUser.role === "Admin"
                      ? "Demote to User"
                      : "Make Admin"}
                  </button>
                  {selectedUser.role !== "Admin" && (
                    <button
                      onClick={() => deleteUser(selectedUser)}
                      className="px-4 py-2 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Section Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
                  <button
                    onClick={() => setActiveSection("orders")}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                      activeSection === "orders"
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <FiPackage />
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveSection("wishlist")}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                      activeSection === "wishlist"
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <FiHeart />
                    Wishlist
                  </button>
                  <button
                    onClick={() => setActiveSection("cart")}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                      activeSection === "cart"
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <FiShoppingCart />
                    Cart
                  </button>
                </div>

                {/* Dynamic Section Content */}
                {renderSectionContent()}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
