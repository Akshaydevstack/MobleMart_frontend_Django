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
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    carts: 0,
  });

useEffect(() => {
    const fetchStats = async () => {
      try {
        const userRes = await api.get("admin/users-management/");
        const productRes = await api.get("admin/manage-products/");
        const orderRes = await api.get("admin/order-management/");
        // const cartRes = await api.get("admin/carts-management/");

        setStats({
          users: userRes.data.total_users,
          products: productRes.data.total_products,
          orders: orderRes.data.count,
          // carts: cartRes.data.total_carts,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);




  return (
    <div className="space-y-6 sm:space-y-8 max-w-7.5xl mx-auto p-4 sm:p-6">
      <WelcomeAdmin />
      <Actioncard stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <DailySection />
        <OrderStatus/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <BrandDistribution />
        <PerformanceRadarChart />
      </div>
    </div>
  );
}
