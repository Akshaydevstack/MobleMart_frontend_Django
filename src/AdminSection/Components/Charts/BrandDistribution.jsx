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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

defaults.color = "#9CA3AF"; // gray-400
defaults.font.family = "Inter, sans-serif";
defaults.borderColor = "#374151"; // gray-700

export default function BrandDistribution({ categoryData }) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  // Prepare data for Chart.js
  const chartData = {
    labels: categoryData.map(item => item.name),
    datasets: [
      {
        label: "Products",
        data: categoryData.map(item => item.value),
        backgroundColor: categoryData.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 4,
        borderSkipped: false,
        hoverBackgroundColor: categoryData.map((_, i) => `${COLORS[i % COLORS.length]}CC`),
      },
    ],
  };

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
                ticks: { maxRotation: 45, minRotation: 45 }
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(55, 65, 81, 0.5)" }
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