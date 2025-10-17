import React from 'react'

export default function DailyStats({stats}) {
  return (
  <>
  <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-700/50 p-2 rounded-lg">
              <p className="text-gray-400 text-xs">Today's Orders</p>
              <p className="text-white font-bold">
                {stats.dailyTotals?.orders || 0}
              </p>
              <p className="text-green-400 text-xs">+2 from yesterday</p>
            </div>
            <div className="bg-gray-700/50 p-2 rounded-lg">
              <p className="text-gray-400 text-xs">Revenue</p>
              <p className="text-white font-bold">
                ₹{(stats.dailyTotals?.revenue || 0).toLocaleString()}
              </p>
              <p className="text-green-400 text-xs">12% increase</p>
            </div>
            <div className="bg-gray-700/50 p-2 rounded-lg">
              <p className="text-gray-400 text-xs">Avg. Order Value</p>
              <p className="text-white font-bold">
                ₹
                {Math.round(
                  stats.dailyTotals?.avgOrderValue || 0
                ).toLocaleString()}
              </p>
              <p className="text-red-400 text-xs">5% decrease</p>
            </div>
          </div>
  </>
  )
}
