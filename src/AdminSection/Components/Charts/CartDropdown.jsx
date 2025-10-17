import React from 'react'

export default function CartDropdown({timeRange,setTimeRange}) {
  return (
   <>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-yellow-400">
              Daily Sales Report
            </h3>
            <div className="flex gap-2">
              <select
                className="bg-gray-700 border border-gray-600 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm rounded-lg px-3 py-1 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export
              </button>
            </div>
          </div>
   </>
  )
}
