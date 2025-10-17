import React from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 p-4 rounded-xl border border-gray-700 shadow-2xl backdrop-blur-sm">
        <p className="font-bold text-yellow-400">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: payload[0].color }}
          />
          <p className="text-gray-200">
            <span className="font-medium">Sales: </span>
            <span className="text-yellow-300">{payload[0].value}</span>
          </p>
        </div>
        {payload[0].payload.description && (
          <p className="text-xs text-gray-400 mt-2 max-w-xs">
            {payload[0].payload.description}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function PerformanceRadarChart({ performanceData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-gray-800/70 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg space-y-3"
    >
      <h3 className="text-lg sm:text-xl font-bold text-yellow-400">
        Brand Sales Performance
      </h3>
      <p className="text-sm text-gray-400 mb-2 max-w-md">
        This radar chart compares the total quantity of products sold across
        different brands, highlighting your top-performing brands and
        identifying opportunities to improve sales distribution.
      </p>

      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="80%"
            data={performanceData}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <PolarGrid stroke="#374151" strokeWidth={0.5} />
            <PolarAngleAxis
              dataKey="subject"
              stroke="#D1D5DB"
              fontSize={12}
              tickLine={false}
            />
            <PolarRadiusAxis 
              angle={30} 
              stroke="#9CA3AF" 
              axisLine={false}
              tick={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Radar
              name="Sales Performance"
              dataKey="A"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="#f59e0b"
              fillOpacity={0.4}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: 12,
                paddingTop: '20px'
              }}
              formatter={(value) => (
                <span className="text-gray-300 text-xs">{value}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}