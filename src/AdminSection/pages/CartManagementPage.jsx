import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiUser, FiShoppingCart, FiTrash2,} from "react-icons/fi";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { UserApi } from "../../Data/Api_EndPoint";


// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function CartManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsersWithCarts();
  }, []);

  const loadUsersWithCarts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(UserApi);
      const usersWithCarts = res.data.filter(
        (user) => Array.isArray(user.cart) && user.cart.length > 0
      );
      setUsers(usersWithCarts);
    } catch (err) {
      console.error("Error loading users with carts", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate data for the pie chart
  const getProductDistributionData = () => {
    const productCounts = {};

    // Count occurrences of each product across all carts
    users.forEach((user) => {
      user.cart.forEach((item) => {
        const productName = item.name;
        productCounts[productName] = (productCounts[productName] || 0) + 1;
      });
    });

    // Sort products by count (descending)
    const sortedProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Take top 5 products

    const labels = sortedProducts.map(([name]) => name);
    const data = sortedProducts.map(([_, count]) => count);

    // Generate distinct colors for each product
    const backgroundColors = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: backgroundColors.map((color) =>
            color.replace("0.7", "1")
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  const removeFromCart = async (userId, productId) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const updatedCart = user.cart.filter((item) => item.id !== productId);
      await axios.patch(`http://localhost:3000/users/${userId}`, {
        cart: updatedCart,
      });
      await loadUsersWithCarts();

      if (selectedUser && selectedUser.id === userId) {
        if (updatedCart.length === 0) {
          setSelectedUser(null);
        } else {
          setSelectedUser({ ...selectedUser, cart: updatedCart });
        }
      }
    } catch (err) {
      console.error("Error removing item from cart", err);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateCartTotal = (cart) => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => {
      const price =
        typeof item.price === "string"
          ? parseFloat(item.price.replace(/,/g, ""))
          : item.price;
      return total + price * (item.quantity || 1);
    }, 0);
  };

  const chartData = getProductDistributionData();

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
            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">
              Cart Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              View and manage active user carts
            </p>
          </div>
          <button
            onClick={loadUsersWithCarts}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-xl shadow transition"
          >
            <FiShoppingCart className="text-lg" /> Refresh Carts
          </button>
        </motion.div>

        {/* Search Filter */}
        <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-400">Active Carts</div>
            <div className="text-2xl font-bold text-yellow-400">
              {users.length}
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-400">Total Items</div>
            <div className="text-2xl font-bold text-blue-400">
              {users.reduce(
                (total, user) => total + (user.cart?.length || 0),
                0
              )}
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-4 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-400">Potential Revenue</div>
            <div className="text-2xl font-bold text-green-400">
              ₹
              {users
                .reduce(
                  (total, user) => total + calculateCartTotal(user.cart),
                  0
                )
                .toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Product Distribution Pie Chart */}
       {users.length > 0 && (
  <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
    <h2 className="text-lg font-bold text-gray-200 mb-2">
      Most Added Products
    </h2>
    <p className="text-sm text-gray-400 mb-4">
      This chart shows the products most frequently added to carts by users, giving insight into trending interests.
    </p>
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="w-full md:w-1/3 max-w-xs">
        <Doughnut
          data={chartData}
          options={{
            cutout: "60%", // Makes it a doughnut
            plugins: {
              legend: {
                position: "right",
                labels: {
                  color: "#e5e7eb",
                  font: {
                    size: 12,
                  },
                },
              },
            },
          }}
        />
      </div>
      <div className="w-full md:w-2/3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chartData.labels.map((label, index) => (
            <div key={label} className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor:
                      chartData.datasets[0].backgroundColor[index],
                  }}
                />
                <span className="font-medium text-gray-200">
                  {label}
                </span>
                <span className="ml-auto text-yellow-400">
                  {chartData.datasets[0].data[index]}{" "}
                  {chartData.datasets[0].data[index] === 1
                    ? "cart"
                    : "carts"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-gray-900 rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-bold text-gray-200">
                Users with Active Carts
              </h2>
              {filteredUsers.length > 0 ? (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedUser(user)}
                      className={`p-4 rounded-xl cursor-pointer transition ${
                        selectedUser?.id === user.id
                          ? "bg-yellow-400/10 border border-yellow-400/30"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-700 p-2 rounded-lg text-yellow-400">
                          <FiUser className="text-lg" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-200">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                            {user.cart.length} items
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-900 rounded-2xl p-8 text-center">
                  <div className="text-yellow-400 text-5xl mb-4">🛒</div>
                  <h3 className="text-xl font-bold text-gray-200 mb-2">
                    No Active Carts
                  </h3>
                  <p className="text-gray-400">
                    No users currently have items in their cart
                  </p>
                </div>
              )}
            </div>

            {/* Cart Details */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
                  {/* Cart Header */}
                  <div className="p-5 border-b border-gray-800">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold text-yellow-400">
                          {selectedUser.name}'s Cart
                        </h2>
                        <p className="text-sm text-gray-400">
                          {selectedUser.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Cart Total</div>
                        <div className="text-xl font-bold text-green-400">
                          ₹
                          {calculateCartTotal(
                            selectedUser.cart
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="p-5 space-y-4">
                    <h3 className="font-medium text-gray-200 flex items-center gap-2">
                      <FiShoppingCart /> Items ({selectedUser.cart.length})
                    </h3>
                    {selectedUser.cart.length > 0 ? (
                      <div className="space-y-4">
                        {selectedUser.cart.map((item) => (
                          <motion.div
                            key={`${item.id}-${Math.random()}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-4 p-3 bg-gray-800 rounded-lg"
                          >
                            <img
                              src={
                                item.image?.[0] ||
                                "https://via.placeholder.com/64"
                              }
                              alt={item.name}
                              className="h-16 w-16 rounded-lg object-cover border border-gray-700"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-200">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-400">
                                  Brand: {item.brand}
                                </span>
                                <span className="text-sm text-gray-400">
                                  Qty: {item.quantity || 1}
                                </span>
                                <span className="text-sm font-medium text-yellow-400">
                                  ₹
                                  {typeof item.price === "string"
                                    ? item.price
                                    : item.price.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                removeFromCart(selectedUser.id, item.id)
                              }
                              className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-red-400/10 transition"
                            >
                              <FiTrash2 />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                        Cart is empty
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
                  <div className="text-yellow-400 text-5xl mb-4">👈</div>
                  <h3 className="text-xl font-bold text-gray-200 mb-2">
                    Select a User
                  </h3>
                  <p className="text-gray-400">
                    Choose a user from the list to view their cart details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
