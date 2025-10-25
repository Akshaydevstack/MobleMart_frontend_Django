import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import api from "../../../API/axios";


export default function OrderStatus() {
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const [outerRadius, setOuterRadius] = useState(125);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 400) {
        setOuterRadius(70);
      } else if (window.innerWidth < 640) {
        setOuterRadius(90);
      } else {
        setOuterRadius(125);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch order stats from API
  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("admin/order-management/");
        
        // Transform the stats data into pie chart format
        const stats = res.data.stats;
        const transformedData = [
          { name: "Pending", value: stats.pending },
          { name: "Processing", value: stats.processing },
          { name: "Delivered", value: stats.delivered },
          { name: "Cancelled", value: stats.cancelled },
        ].filter(item => item.value > 0); // Only show statuses with orders
        
        setPieData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching order stats", err);
        setError("Failed to load order statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStats();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 shadow-lg">
          <p className="font-semibold text-yellow-400">{data.name}</p>
          <p className="text-gray-200">
            <span className="text-gray-400">Count: </span>
            <span className="font-medium">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800/70 border border-gray-700 rounded-xl p-4 sm:p-6 shadow-lg"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800/70 border border-gray-700 rounded-xl p-4 sm:p-6 shadow-lg"
      >
        <div className="text-center text-red-400 py-8">
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  if (pieData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800/70 border border-gray-700 rounded-xl p-4 sm:p-6 shadow-lg"
      >
        <div className="text-center text-gray-400 py-8">
          <p>No order data available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/70 border border-gray-700 rounded-xl p-4 sm:p-6 shadow-lg"
    >
      <h3 className="text-lg sm:text-xl font-bold text-yellow-400 text-center sm:text-left mb-2">
        Order Status Distribution
      </h3>
      <p className="text-sm text-gray-400 text-center sm:text-left mb-4 max-w-2xl mx-auto sm:mx-0">
        This pie chart breaks down your orders by their current status —
        such as Pending, Processing, Delivered, or Cancelled.
      </p>

      <div className="flex flex-col items-center">
        <div className="h-[220px] xs:h-[250px] sm:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
                fill="#8884d8"
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {pieData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-300 text-sm">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}