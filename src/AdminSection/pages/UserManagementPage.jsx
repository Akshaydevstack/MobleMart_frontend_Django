import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiUser,
  FiShield,
  FiLock,
  FiShoppingBag,
  FiHeart,
  FiShoppingCart,
  FiX,
  FiFilter,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { UserApi } from "../../Data/Api_EndPoint";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await axios.get(UserApi);
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users", err);
      toast.error("Failed to load users");
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const updateUser = async (id, updatedFields) => {
    try {
      await axios.patch(`${UserApi}/${id}`, updatedFields);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, ...updatedFields } : user
        )
      );
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, ...updatedFields });
      }
      toast.success("User updated successfully!");
    } catch (err) {
      console.error("Error updating user", err);
      toast.error("Failed to update user");
    }
  };

  const deleteUser = async (user) => {
    if (user.role === "Admin") {
      toast.error("Cannot delete an admin user");
      return;
    }
    const confirmed = window.confirm(`Delete ${user.name} permanently?`);
    if (!confirmed) return;
    try {
      await axios.delete(`${UserApi}/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (selectedUser?.id === user.id) setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user", err);
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase());
    
    // Role filter
    const matchesRole = 
      filters.role === "all" || 
      (filters.role === "admin" && user.role === "Admin") ||
      (filters.role === "user" && user.role === "User");
    
    // Status filter
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" && !user.isBlock) ||
      (filters.status === "blocked" && user.isBlock);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatPrice = (price) => {
    if (typeof price === "string") return price;
    return new Intl.NumberFormat("en-IN").format(price);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID"
              className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            
            <div className="flex gap-2">
              {/* Role Filter */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <FiShield className="text-sm" />
                </div>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              {/* Status Filter */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <FiLock className="text-sm" />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="pl-8 pr-4 py-2 w-full rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
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
            <div className="text-2xl font-bold text-yellow-400">
              {users.length}
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-400">Admins</div>
            <div className="text-2xl font-bold text-purple-400">
              {users.filter((user) => user.role === "Admin").length}
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-2 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-400">Blocked Users</div>
            <div className="text-2xl font-bold text-red-400">
              {users.filter((user) => user.isBlock).length}
            </div>
          </motion.div>
        </div>

        {/* Filter Info */}
        {(filters.role !== "all" || filters.status !== "all") && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex items-center gap-2"
          >
            <FiFilter className="text-yellow-400" />
            <span className="text-sm text-gray-300">
              Filters: 
              {filters.role !== "all" && (
                <span className="ml-1 px-2 py-1 bg-gray-700 rounded-md text-yellow-400">
                  {filters.role === "admin" ? "Admin" : "User"}
                </span>
              )}
              {filters.status !== "all" && (
                <span className="ml-1 px-2 py-1 bg-gray-700 rounded-md text-yellow-400">
                  {filters.status === "active" ? "Active" : "Blocked"}
                </span>
              )}
              <button 
                onClick={() => setFilters({ role: "all", status: "all" })}
                className="ml-2 text-xs text-red-400 hover:text-red-300"
              >
                Clear all
              </button>
            </span>
          </motion.div>
        )}

        {/* User Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleUserClick(user)}
              className="bg-gray-800/70 border border-gray-700 rounded-xl p-5 shadow-lg transition duration-300 space-y-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gray-700 p-2 rounded-lg text-yellow-400">
                  <FiUser className="text-lg" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-yellow-400 truncate">
                    {user.name}
                    <span className="text-sm text-gray-400">
                      {" "}
                      (ID: {user.id})
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm break-words">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <div className="flex items-center gap-1 text-sm text-purple-400">
                  <FiShield /> {user.role}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    user.isBlock ? "text-red-400" : "text-green-400"
                  }`}
                >
                  <FiLock /> {user.isBlock ? "Blocked" : "Active"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Users */}
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-center"
          >
            No users found matching your criteria.
          </motion.div>
        )}

        {/* User Details Modal */}
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
                    {selectedUser.name}'s Account
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-white"
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
                      {selectedUser.name}
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>{" "}
                      {selectedUser.email}
                    </div>
                    <div>
                      <span className="text-gray-400">Role:</span>{" "}
                      <span
                        className={
                          selectedUser.role === "Admin"
                            ? "text-purple-400"
                            : "text-yellow-400"
                        }
                      >
                        {selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>{" "}
                      <span
                        className={
                          selectedUser.isBlock
                            ? "text-red-400"
                            : "text-green-400"
                        }
                      >
                        {selectedUser.isBlock ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      updateUser(selectedUser.id, {
                        isBlock: !selectedUser.isBlock,
                      })
                    }
                    className={`${
                      selectedUser.isBlock
                        ? "bg-green-500 hover:bg-green-600 text-gray-900"
                        : "bg-red-500 hover:bg-red-600 text-gray-100"
                    } px-4 py-4 rounded-lg font-semibold`}
                  >
                    {selectedUser.isBlock ? "Unblock" : "Block"}
                  </button>

                  <button
                    onClick={() =>
                      updateUser(selectedUser.id, {
                        role: selectedUser.role === "Admin" ? "User" : "Admin",
                      })
                    }
                    className={`${
                      selectedUser.role === "Admin"
                        ? "bg-purple-400 hover:bg-purple-500 text-gray-900"
                        : "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                    } px-4 py-4 rounded-lg font-semibold`}
                  >
                    {selectedUser.role === "Admin"
                      ? "Demote to User"
                      : "Make Admin"}
                  </button>

                  {selectedUser.role !== "Admin" && (
                    <button
                      onClick={() => deleteUser(selectedUser)}
                      className="px-4 py-4 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Orders */}
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    <FiShoppingBag className="inline" /> Orders
                  </h3>
                  {selectedUser.orders?.length ? (
                    selectedUser.orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 mb-2"
                      >
                        <div className="flex justify-between">
                          <div>Order #{order.id}</div>
                          <div className="text-yellow-400">
                            ₹{formatPrice(order.total)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No orders found</div>
                  )}
                </div>

                {/* Wishlist */}
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
                          src={item.image[0]}
                          alt={item.name}
                          className="w-12 h-12 object-contain rounded border border-gray-700"
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-yellow-400">
                            ₹{formatPrice(item.price)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">Wishlist is empty</div>
                  )}
                </div>

                {/* Cart */}
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
                          src={item.image[0]}
                          alt={item.name}
                          className="w-12 h-12 object-contain rounded border border-gray-700"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-400">
                            {item.brand}
                          </div>
                          <div className="text-yellow-400">
                            ₹{formatPrice(item.price)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">Cart is empty</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}