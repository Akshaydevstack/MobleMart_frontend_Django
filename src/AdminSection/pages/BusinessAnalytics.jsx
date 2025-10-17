import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, isWithinInterval, parseISO, subMonths } from "date-fns";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiRefreshCw, FiDownload } from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { UserApi } from "../../Data/Api_EndPoint";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BusinessAnalytics() {
  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filterType, setFilterType] = useState("monthly");
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    processData();
  }, [users, filterType, startDate, endDate]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(UserApi);
      setUsers(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching users", err);
      setIsLoading(false);
    }
  };

  const processData = () => {
    // Filter out cancelled orders
    let allOrders = users.flatMap(user =>
      (user.orders || [])
        .filter(order => order.status !== "cancelled")
        .map(order => ({
          ...order,
          date: format(new Date(order.date), "yyyy-MM-dd"),
          userName: user.name,
          userId: user.id
        }))
    );

    if (filterType === "range" && startDate && endDate) {
      allOrders = allOrders.filter(order =>
        isWithinInterval(parseISO(order.date), {
          start: parseISO(startDate),
          end: parseISO(endDate)
        })
      );
    }

    // Group by date for chart
    const grouped = {};
    allOrders.forEach(order => {
      if (!grouped[order.date]) grouped[order.date] = 0;
      grouped[order.date] += order.total;
    });

    const data = Object.keys(grouped).map(date => ({
      date,
      total: grouped[date]
    }));

    // Sort by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    setChartData(data);
  };

  const clearFilters = () => {
    setFilterType("monthly");
    setStartDate(format(subMonths(new Date(), 1), "yyyy-MM-dd"));
    setEndDate(format(new Date(), "yyyy-MM-dd"));
  };

  const refreshData = () => {
    fetchUsers();
  };

  const exportData = () => {
    // Implement your export logic here
    console.log("Exporting data...");
  };

  // Calculate metrics excluding cancelled orders
  const validOrders = users.flatMap(user => 
    (user.orders || []).filter(order => order.status !== "cancelled")
  );
  const totalSales = validOrders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = validOrders.length;
  const avgOrder = totalOrders ? (totalSales / totalOrders).toFixed(2) : 0;

  // Get all filtered orders for the table (excluding cancelled)
  const filteredOrders = users.flatMap(user =>
    (user.orders || [])
      .filter(order => order.status !== "cancelled")
      .map(order => ({
        ...order,
        date: format(new Date(order.date), "yyyy-MM-dd"),
        userName: user.name,
        userId: user.id
      }))
      .filter(order => {
        if (filterType === "range" && startDate && endDate) {
          return isWithinInterval(parseISO(order.date), {
            start: parseISO(startDate),
            end: parseISO(endDate)
          });
        }
        return true;
      })
  );

  // Prepare data for ChartJS
  const chartJSData = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        label: 'Total Sales',
        data: chartData.map(item => item.total),
        backgroundColor: 'rgba(250, 204, 21, 0.7)',
        borderColor: 'rgba(250, 204, 21, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₹${context.raw.toLocaleString()}`;
          },
          title: function(context) {
            return `Date: ${context[0].label}`;
          }
        },
        displayColors: false,
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#444',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(68, 68, 68, 0.5)',
        },
        ticks: {
          color: '#ccc',
        }
      },
      y: {
        grid: {
          color: 'rgba(68, 68, 68, 0.5)',
        },
        ticks: {
          color: '#ccc',
          callback: function(value) {
            return `₹${value}`;
          }
        }
      }
    },
    animation: {
      duration: 1500,
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">Business Dashboard</h2>
            <p className="text-gray-400 text-sm">Analyze sales trends and customer behavior</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
              title="Refresh data"
            >
              <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
              title="Export data"
            >
              <FiDownload />
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

        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
        >
          <FiX /> Clear Filters
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-green-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Total Sales</div>
              <div className="text-3xl font-bold text-green-400">₹{totalSales.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Excluding cancelled orders</div>
            </div>
            <div className="text-green-400 bg-green-900 bg-opacity-30 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-yellow-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Total Orders</div>
              <div className="text-3xl font-bold text-yellow-400">{totalOrders}</div>
              <div className="text-xs text-gray-500 mt-1">Completed orders only</div>
            </div>
            <div className="text-yellow-400 bg-yellow-900 bg-opacity-30 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Avg Order Value</div>
              <div className="text-3xl font-bold text-blue-400">₹{avgOrder}</div>
              <div className="text-xs text-gray-500 mt-1">Based on completed orders</div>
            </div>
            <div className="text-blue-400 bg-blue-900 bg-opacity-30 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-200">Sales Performance</h3>
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

        <div className="h-80">
          <Bar 
            data={chartJSData} 
            options={options}
          />
        </div>

        {/* Order Details Table */}
        {showDetails && (
          <div className="mt-8 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-300">Order Details</h4>
              <div className="text-sm text-gray-400">
                Showing {filteredOrders.length} orders
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-900 hover:bg-gray-850' : 'bg-gray-800 hover:bg-gray-750'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">₹{order.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'completed' ? 'bg-green-900 text-green-200' : 
                            order.status === 'processing' ? 'bg-blue-900 text-blue-200' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
          </div>
        )}
      </div>
    </div>
  );
}