import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend,
  defaults 
} from "chart.js";
import { motion } from "framer-motion";
import api from "../../../API/axios";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

defaults.color = "#9CA3AF"; // gray-400
defaults.font.family = "Inter, sans-serif";
defaults.borderColor = "#374151"; // gray-700

export default function BrandDistribution() {
  const [brandData, setBrandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  // Fetch brand data from API
  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);
        const res = await api.get("brands/");
        
        // Transform the API response into chart data format
        const transformedData = res.data.results.map(brand => ({
          name: brand.name,
          value: brand.product_count
        }));
        
        setBrandData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching brand data", err);
        setError("Failed to load brand distribution data");
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, []);

  // Prepare data for Chart.js
  const chartData = {
    labels: brandData.map(item => item.name),
    datasets: [
      {
        label: "Products",
        data: brandData.map(item => item.value),
        backgroundColor: brandData.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 4,
        borderSkipped: false,
        hoverBackgroundColor: brandData.map((_, i) => `${COLORS[i % COLORS.length]}CC`),
      },
    ],
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800/70 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg space-y-3"
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800/70 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg space-y-3"
      >
        <div className="text-center text-red-400 py-8">
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  if (brandData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800/70 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg space-y-3"
      >
        <div className="text-center text-gray-400 py-8">
          <p>No brand data available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/70 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg space-y-3"
    >
      <h3 className="text-lg sm:text-xl font-bold text-yellow-400">
        Product Count by Brand
      </h3>
      <p className="text-sm text-gray-400 mb-2 max-w-md">
        This bar chart shows how many products you have listed under each brand,
        helping you quickly spot which brands dominate your inventory.
      </p>

      <div className="h-[250px] sm:h-[300px] w-full">
        <Bar 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false },
                ticks: { 
                  maxRotation: 45, 
                  minRotation: 45,
                  color: "#9CA3AF"
                }
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(55, 65, 81, 0.5)" },
                ticks: { color: "#9CA3AF" }
              }
            },
            plugins: {
              tooltip: {
                backgroundColor: "#111827",
                titleColor: "#FACC15", // yellow-400
                bodyColor: "#E5E7EB", // gray-200
                borderColor: "#374151", // gray-700
                borderWidth: 1,
                padding: 15,
                displayColors: false,
                callbacks: {
                  label: (context) => `Products: ${context.raw}`
                }
              },
              legend: { display: false }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }}
        />
      </div>
    </motion.div>
  );
}