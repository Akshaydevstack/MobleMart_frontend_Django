import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 p-3 rounded-xl border border-gray-700 shadow-2xl backdrop-blur-sm">
        <p className="font-bold text-yellow-400">Hour: {label}:00</p>
        <div className="space-y-2 mt-2">
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-gray-200">
                <span className="font-medium capitalize">{entry.name}: </span>
                <span className={entry.name === 'Revenue' ? 'text-emerald-300' : 'text-yellow-300'}>
                  {entry.name === 'Revenue' ? `₹${entry.value.toLocaleString()}` : entry.value}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function DailySalesChart({ dailySalesData }) {
  return (
    <div className="h-[250px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={dailySalesData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="colorDailyOrders"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#facc15" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#facc15" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient
              id="colorDailyRevenue"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
          <XAxis
            dataKey="hour"
            stroke="#9CA3AF"
            fontSize={10}
            tickMargin={10}
            tickFormatter={(value) => `${value}:00`}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={10}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#4B5563', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
            formatter={(value) => {
              if (value === "revenue") return "Revenue (₹)";
              return value.charAt(0).toUpperCase() + value.slice(1);
            }}
          />
          <Area
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="#facc15"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDailyOrders)"
            activeDot={{ r: 6, strokeWidth: 2 }}
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#34d399"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDailyRevenue)"
            activeDot={{ r: 6, strokeWidth: 2 }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}