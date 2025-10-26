import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import PerformanceRadarChart from "./Components/Charts/PerfmsChart";
import BrandDistribution from "./Components/Charts/BrandDistribution";
import OrderStatus from "./Components/Charts/OrderStatus";
import DailySection from "./Components/Charts/DailySection";
import Actioncard from "./Components/Cards/Actioncard";
import WelcomeAdmin from "./Components/Cards/GreetingCard";
import api from "../API/axios";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  // ✅ Store full response objects (not just totals)
  const [stats, setStats] = useState({
    users: {},
    products: {},
    orders: {},
    carts: {},
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        const res = await api.get("admin/dashboard-overview/");

        setStats({
          users: res.data.users || {},
          products: res.data.products || {},
          orders: res.data.orders || {},
          carts: res.data.carts || {},
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7.5xl mx-auto p-4 sm:p-6">
      <WelcomeAdmin />
      <Actioncard stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <DailySection />
        <OrderStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <BrandDistribution />
        <PerformanceRadarChart />
      </div>
    </div>
  );
}
