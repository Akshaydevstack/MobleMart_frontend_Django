import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiShoppingCart, FiBarChart2, FiRefreshCw } from "react-icons/fi";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "../../API/axios";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function CartManagement() {
  const [productCartData, setProductCartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProductCartData();
  }, []);

  const loadProductCartData = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin/product-cart-countView");
      setProductCartData(res.data || []);
    } catch (err) {
      console.error("Error loading product cart data", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate unique colors for each product
  const generateUniqueColors = (count) => {
    const colors = [
      "rgba(255, 99, 132, 0.8)",    // Red
      "rgba(54, 162, 235, 0.8)",    // Blue
      "rgba(255, 206, 86, 0.8)",    // Yellow
      "rgba(75, 192, 192, 0.8)",    // Teal
      "rgba(153, 102, 255, 0.8)",   // Purple
      "rgba(255, 159, 64, 0.8)",    // Orange
      "rgba(199, 199, 199, 0.8)",   // Gray
      "rgba(83, 102, 255, 0.8)",    // Indigo
      "rgba(40, 159, 56, 0.8)",     // Green
      "rgba(255, 99, 255, 0.8)",    // Pink
      "rgba(255, 205, 86, 0.8)",    // Gold
      "rgba(75, 192, 192, 0.8)",    // Cyan
      "rgba(153, 102, 255, 0.8)",   // Violet
      "rgba(255, 159, 64, 0.8)",    // Coral
      "rgba(54, 162, 235, 0.8)"     // Sky Blue
    ];
    
    return colors.slice(0, count);
  };

  // Generate data for the bar chart - Top 10 products across all carts
  const getProductDistributionData = () => {
    // Sort products by total_cart_count (descending) and take top 10
    const sortedProducts = [...productCartData]
      .sort((a, b) => b.total_cart_count - a.total_cart_count)
      .slice(0, 10);

    const labels = sortedProducts.map(product => product.product__name);
    const data = sortedProducts.map(product => product.total_cart_count);
    const brands = sortedProducts.map(product => product.product__brand__name);
    const prices = sortedProducts.map(product => product.product__price);

    // Generate unique colors for each product
    const backgroundColors = generateUniqueColors(labels.length);

    return {
      labels,
      datasets: [
        {
          label: 'Number of Carts',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
      brands,
      prices,
      backgroundColors
    };
  };

  const chartData = getProductDistributionData();

  // Calculate statistics from the new data
  const totalUniqueProducts = productCartData.length;
  const totalCartCount = productCartData.reduce((total, product) => total + product.total_cart_count, 0);
  const totalPotentialRevenue = productCartData.reduce((total, product) => 
    total + (product.product__price * product.total_cart_count), 0
  );

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Products in Active Carts',
        color: '#fbbf24',
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: {
          bottom: 25
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fbbf24',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(251, 191, 36, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const productName = context.label;
            const brand = chartData.brands[context.dataIndex];
            const price = chartData.prices[context.dataIndex];
            return [
              `Product: ${productName}`,
              `Brand: ${brand}`,
              `Price: ₹${price.toLocaleString()}`,
              `In ${value} ${value === 1 ? 'cart' : 'carts'}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
            weight: '500'
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          drawBorder: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9ca3af',
          stepSize: 1,
          font: {
            size: 11,
            weight: '500'
          },
          precision: 0
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          drawBorder: false
        },
        title: {
          display: true,
          text: 'Number of Carts',
          color: '#9ca3af',
          font: {
            size: 12,
            weight: '600'
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pl-0 lg:pl-4 transition-all duration-300">
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-gray-900 to-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700"
          >
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400 mb-2">
                🛒 Cart Analytics Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-300">
                Track product popularity and cart performance across all users
              </p>
            </div>
            <button
              onClick={loadProductCartData}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-yellow-400/25 transition-all duration-200 w-full lg:w-auto"
            >
              {loading ? (
                <FiRefreshCw className="text-lg animate-spin" />
              ) : (
                <FiShoppingCart className="text-lg" />
              )}
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -2, scale: 1.01 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium">Products in Carts</div>
                  <div className="text-xl sm:text-2xl font-bold text-yellow-400 mt-1">
                    {totalUniqueProducts}
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                  <FiShoppingCart className="text-yellow-400 text-lg sm:text-xl" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -2, scale: 1.01 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium">Total Cart Entries</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-1">
                    {totalCartCount}
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-400/10 rounded-xl flex items-center justify-center">
                  <FiBarChart2 className="text-blue-400 text-lg sm:text-xl" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -2, scale: 1.01 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium">Potential Revenue</div>
                  <div className="text-xl sm:text-2xl font-bold text-green-400 mt-1">
                    ₹{totalPotentialRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-400/10 rounded-xl flex items-center justify-center">
                  <span className="text-green-400 text-lg sm:text-xl font-bold">₹</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Distribution Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                  <FiBarChart2 className="text-yellow-400 text-base sm:text-lg lg:text-xl" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-200">
                    Product Distribution in Active Carts
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Top {chartData.labels.length} most popular products across all user carts
                  </p>
                </div>
              </div>
            </div>
            
            {productCartData.length > 0 ? (
              <>
                <div className="h-64 sm:h-72 lg:h-80 xl:h-96 mb-6 sm:mb-8">
                  <Bar data={chartData} options={chartOptions} />
                </div>

                {/* Product Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {chartData.labels.map((label, index) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gray-800/50 p-3 sm:p-4 rounded-xl border-l-4 backdrop-blur-sm hover:shadow-lg transition-all duration-200"
                      style={{ borderLeftColor: chartData.backgroundColors[index] }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-2">
                          <h3 className="font-semibold text-gray-200 text-xs sm:text-sm line-clamp-2 mb-1 sm:mb-2">
                            {label}
                          </h3>
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <span 
                              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: chartData.backgroundColors[index] }}
                            />
                            <span className="text-xs text-gray-400 font-medium">
                              {chartData.brands[index]}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            ₹{chartData.prices[index].toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg sm:text-xl font-bold text-yellow-400">
                            {chartData.datasets[0].data[index]}
                          </div>
                          <div className="text-xs text-gray-400">
                            {chartData.datasets[0].data[index] === 1 ? 'cart' : 'carts'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-1 sm:mb-2">
                  {loading ? 'Loading Data...' : 'No Cart Data Available'}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-md">
                  {loading ? 'Loading product cart data...' : 'No products found in user carts. Data will appear here when users add products to their carts.'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}