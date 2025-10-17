import React, { useState } from "react";

export default function SalesTable({ dailySalesData, stats }) {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowTable(!showTable)}
        className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-lg shadow transition duration-300"
      >
        {showTable ? "Hide Sales Table" : "Show Sales Table"}
      </button>

      {showTable && (
        <div className="mt-4 overflow-x-auto animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-2 text-white">Time</th>
                <th className="pb-2 text-white">Orders</th>
                <th className="pb-2 text-right text-white">Revenue</th>
                <th className="pb-2 text-right text-white">Avg. Value</th>
              </tr>
            </thead>
            <tbody>
              {dailySalesData.map((hour, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700/30 hover:bg-gray-700/20"
                >
                  <td className="py-2 text-white">{hour.hour}</td>
                  <td className="text-white">{hour.orders}</td>
                  <td className="text-right text-white">
                    ₹{hour.revenue.toLocaleString()}
                  </td>
                  <td className="text-right text-white">
                    ₹
                    {hour.orders > 0
                      ? Math.round(hour.revenue / hour.orders).toLocaleString()
                      : 0}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="pt-2 text-white">Total</td>
                <td className="pt-2 text-white">{stats.dailyTotals?.orders || 0}</td>
                <td className="pt-2 text-right text-white">
                  ₹{(stats.dailyTotals?.revenue || 0).toLocaleString()}
                </td>
                <td className="pt-2 text-right text-white">
                  ₹
                  {Math.round(stats.dailyTotals?.avgOrderValue || 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}