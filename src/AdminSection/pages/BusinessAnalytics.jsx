import React, { useEffect, useState } from "react";
import { format, isWithinInterval, parseISO, subMonths } from "date-fns";
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiPackage,
  FiUserCheck,
  FiStar,
  FiBarChart2,
} from "react-icons/fi";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../API/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function BusinessAnalytics() {
  const [orders, setOrders] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({});
  const [filterType, setFilterType] = useState("monthly");
  const [startDate, setStartDate] = useState(
    format(subMonths(new Date(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("daily"); // daily, monthly, products
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (url = "admin/business-analytics/", page = 1) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (filterType === "range" && startDate && endDate) {
        params.append("start_date", startDate);
        params.append("end_date", endDate);
      }

      if (url === "admin/business-analytics/") {
        params.append("page", page);
      }

      const fullUrl = url.includes("?")
        ? `${url}&${params.toString()}`
        : `${url}?${params.toString()}`;

      const res = await api.get(fullUrl);
      setOrders(res.data.results);
      setAnalyticsData(res.data.chart_data || {});
      setPagination({
        count: res.data.count,
        next: res.data.next,
        previous: res.data.previous,
        currentPage: page,
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching analytics", err);
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterType("monthly");
    setStartDate(format(subMonths(new Date(), 1), "yyyy-MM-dd"));
    setEndDate(format(new Date(), "yyyy-MM-dd"));
    fetchAnalytics();
  };

  const applyDateFilter = () => {
    if (filterType === "range" && startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be after end date");
        return;
      }
    }
    fetchAnalytics();
  };

  const refreshData = () => fetchAnalytics();
  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `business-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handlePageChange = (url, page) => {
    if (url) {
      fetchAnalytics(url, page);
    }
  };

  // Calculate total pages
  const pageSize = 20;
  const totalPages = Math.ceil(pagination.count / pageSize);

  // Status badge colors
  const statusClasses = {
    delivered: "bg-green-900 text-green-200",
    processing: "bg-blue-900 text-blue-200",
    pending: "bg-yellow-900 text-yellow-200",
    cancelled: "bg-red-900 text-red-200",
  };

  // Chart data configurations
  const dailySalesChart = {
    labels: analyticsData.daily_sales ? Object.keys(analyticsData.daily_sales) : [],
    datasets: [
      {
        label: "Daily Sales (₹)",
        data: analyticsData.daily_sales ? Object.values(analyticsData.daily_sales) : [],
        backgroundColor: "rgba(250, 204, 21, 0.7)",
        borderColor: "rgba(250, 204, 21, 1)",
        borderWidth: 2,
        borderRadius: 4,
        fill: true,
      },
    ],
  };

  const monthlySalesChart = {
    labels: analyticsData.monthly_sales ? Object.keys(analyticsData.monthly_sales) : [],
    datasets: [
      {
        label: "Monthly Sales (₹)",
        data: analyticsData.monthly_sales ? Object.values(analyticsData.monthly_sales) : [],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const bestSellingProductsChart = {
    labels: analyticsData.best_selling_products 
      ? analyticsData.best_selling_products.map(p => p.product__name) 
      : [],
    datasets: [
      {
        label: "Quantity Sold",
        data: analyticsData.best_selling_products 
          ? analyticsData.best_selling_products.map(p => p.total_qty) 
          : [],
        backgroundColor: [
          "rgba(250, 204, 21, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
        borderColor: [
          "rgba(250, 204, 21, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(139, 92, 246, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const orderStatusChart = {
    labels: ["Completed", "Pending", "Cancelled", "Returned"],
    datasets: [
      {
        data: [
          analyticsData.completed_orders || 0,
          analyticsData.pending_orders || 0,
          analyticsData.cancelled_orders || 0,
          analyticsData.returned_orders || 0,
        ],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(156, 163, 175, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          color: '#ccc',
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.label.includes('Sales')) {
              return `₹${ctx.raw.toLocaleString()}`;
            }
            return `${ctx.dataset.label}: ${ctx.raw}`;
          },
        },
        displayColors: true,
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    scales: {
      x: { 
        grid: { color: 'rgba(75, 85, 99, 0.3)' }, 
        ticks: { color: '#9ca3af' } 
      },
      y: {
        grid: { color: 'rgba(75, 85, 99, 0.3)' },
        ticks: { 
          color: '#9ca3af', 
          callback: (val) => {
            if (val >= 1000) return `₹${(val/1000).toFixed(0)}k`;
            return `₹${val}`;
          } 
        },
      },
    },
    animation: { duration: 1000 },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ccc',
          font: { size: 11 }
        }
      },
    },
    cutout: '60%',
  };

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">
              Business Analytics Dashboard
            </h2>
            <p className="text-gray-400 text-sm">
              Comprehensive insights into sales, orders, and customer behavior
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
              title="Refresh data"
            >
              <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-colors"
              title="Export data"
            >
              <FiDownload />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-900 p-4 rounded-2xl shadow-lg border border-gray-800">
        <div className="flex items-center gap-2">
          <FiFilter className="text-yellow-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="monthly">Monthly Overview</option>
            <option value="range">Custom Date Range</option>
          </select>
        </div>

        {filterType === "range" && (
          <div className="flex flex-col sm:flex-row gap-4 flex-grow">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={applyDateFilter}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-colors"
          >
            Apply Filter
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
          >
            <FiX /> Clear Filters
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-green-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm flex items-center gap-2">
                <FiDollarSign className="text-green-400" />
                Total Sales
              </div>
              <div className="text-2xl font-bold text-green-400 mt-2">
                ₹{(analyticsData.total_sales || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-green-400 bg-green-900 bg-opacity-30 p-3 rounded-full">
              <FiTrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-yellow-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm flex items-center gap-2">
                <FiShoppingCart className="text-yellow-400" />
                Total Orders
              </div>
              <div className="text-2xl font-bold text-yellow-400 mt-2">
                {analyticsData.total_orders || 0}
              </div>
            </div>
            <div className="text-yellow-400 bg-yellow-900 bg-opacity-30 p-3 rounded-full">
              <FiPackage size={24} />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm flex items-center gap-2">
                <FiBarChart2 className="text-blue-400" />
                Avg Order Value
              </div>
              <div className="text-2xl font-bold text-blue-400 mt-2">
                ₹{(analyticsData.average_order_value || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-blue-400 bg-blue-900 bg-opacity-30 p-3 rounded-full">
              <FiTrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Unique Customers */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm flex items-center gap-2">
                <FiUsers className="text-purple-400" />
                Unique Customers
              </div>
              <div className="text-2xl font-bold text-purple-400 mt-2">
                {analyticsData.unique_customers || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {analyticsData.repeat_customers || 0} repeat customers
              </div>
            </div>
            <div className="text-purple-400 bg-purple-900 bg-opacity-30 p-3 rounded-full">
              <FiUserCheck size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 text-center">
          <div className="text-green-400 text-sm">Completed</div>
          <div className="text-2xl font-bold text-green-400">{analyticsData.completed_orders || 0}</div>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 text-center">
          <div className="text-yellow-400 text-sm">Pending</div>
          <div className="text-2xl font-bold text-yellow-400">{analyticsData.pending_orders || 0}</div>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
          <div className="text-red-400 text-sm">Cancelled</div>
          <div className="text-2xl font-bold text-red-400">{analyticsData.cancelled_orders || 0}</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-gray-400 text-sm">Returned</div>
          <div className="text-2xl font-bold text-gray-400">{analyticsData.returned_orders || 0}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Charts */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-200">Sales Performance</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveChart("daily")}
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeChart === "daily" 
                    ? "bg-yellow-500 text-black" 
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setActiveChart("monthly")}
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeChart === "monthly" 
                    ? "bg-yellow-500 text-black" 
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="h-80">
            {activeChart === "daily" ? (
              <Bar data={dailySalesChart} options={chartOptions} />
            ) : (
              <Line data={monthlySalesChart} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Right Column - Two smaller charts */}
        <div className="space-y-6">
          {/* Best Selling Products */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800">
            <h3 className="text-xl font-bold text-gray-200 mb-4">Best Selling Products</h3>
            <div className="h-64">
              <Bar data={bestSellingProductsChart} options={chartOptions} />
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800">
            <h3 className="text-xl font-bold text-gray-200 mb-4">Order Status Distribution</h3>
            <div className="h-64">
              <Doughnut data={orderStatusChart} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Table */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-200">Order Details</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
          >
            {showDetails ? (
              <>
                <span>Hide Details</span>
                <FiChevronUp />
              </>
            ) : (
              <>
                <span>Show Details</span>
                <FiChevronDown />
              </>
            )}
          </button>
        </div>

        {showDetails && (
          <div className="overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-400">
                Showing {orders.length} orders (Page {pagination.currentPage} of {totalPages})
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {orders.length > 0 ? (
                    orders.map((order, index) => (
                      <tr key={order.id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {(pagination.currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {format(new Date(order.created_at), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {order.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                          ₹{parseFloat(order.total).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              statusClasses[order.status.toLowerCase()] || "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-400">
                        No orders found for the selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.count > 0 && (
              <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-400">
                  Total: {pagination.count} records
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.previous, pagination.currentPage - 1)}
                    disabled={!pagination.previous}
                    className={`p-2 rounded-lg border ${
                      pagination.previous
                        ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                        : "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <FiChevronLeft size={18} />
                  </button>

                  <span className="px-3 py-1 text-sm text-gray-300">
                    {pagination.currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.next, pagination.currentPage + 1)}
                    disabled={!pagination.next}
                    className={`p-2 rounded-lg border ${
                      pagination.next
                        ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                        : "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>

                <div className="text-sm text-gray-400">
                  Page {pagination.currentPage} of {totalPages}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}