import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import SalesTable from "../Table/SalesTable";
import DailySalesChart from "./DailySalesChart";
import DailyStats from "./DailyStats";
import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../API/axios";
export default function DailySection() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyTotals, setDailyTotals] = useState({});
  const [dailySalesData, setDailySalesData] = useState([]);

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const formattedDate = selectedDate.toLocaleDateString("en-CA");
        const response = await api.get(
          `admin/daily-sales/?date=${formattedDate}`
        );

        const data = response.data;

        setDailyTotals(data.daily_totals || {});
        setDailySalesData(data.hourly_sales || []);
      } catch (error) {
        console.error("Error fetching daily analytics:", error);
      }
    };

    fetchDailyData();
  }, [selectedDate]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="lg:col-span-2 bg-gray-800/70 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-yellow-400">
            Hourly Sales, Revenue & Profit for {selectedDate.toDateString()}
          </h3>
          <p className="text-sm text-gray-400 max-w-md">
            This chart shows how your orders, revenue, and profit vary across
            each hour, helping you identify peak business hours.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          <span className="text-xs text-gray-400 mb-1">
            Select a day to view sales summary:
          </span>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            className="bg-gray-800 border border-gray-600 text-gray-200 rounded px-3 py-1 w-full sm:w-auto"
          />
        </div>
      </div>

      <DailyStats stats={{ dailyTotals }} />
      <DailySalesChart dailySalesData={dailySalesData} />
      <SalesTable dailySalesData={dailySalesData} stats={{ dailyTotals }} />
    </motion.div>
  );
}
