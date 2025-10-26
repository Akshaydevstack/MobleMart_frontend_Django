import React, { useContext } from 'react';
import { UsersIcon,ProductsIcon,OrdersIcon,CartIcon } from '../Icons/icons';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../Context/AuthProvider';

export default function Actioncard({ stats }) {
  const navigate = useNavigate();
  const { abandoned } = useContext(AuthContext);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
      <StatCard
        icon={<UsersIcon />}
        iconBg="bg-blue-500/20"
        label="Total Users"
        count={stats.users.total}
        trend={`+${stats.users.new_this_month} this month`} 
        extra={`${stats.users.pending_approvals} pending approvals`}
        btnColor="bg-blue-600 hover:bg-blue-500"
        onClick={() => navigate("/admin/UserMagagement")}
      />
      <StatCard
        icon={<ProductsIcon />}
        iconBg="bg-purple-500/20"
        label="Total Products"
        count={stats.products.total}
        trend={`+${stats.products.new_listings} new listings`}
        extra={`${stats.products.out_of_stock} out-of-stock items`}
        btnColor="bg-purple-600 hover:bg-purple-500"
        onClick={() => navigate("/admin/ProductManagement")}
      />
      <StatCard
        icon={<OrdersIcon />}
        iconBg="bg-green-500/20"
        label="Total Orders"
        count={stats.orders.total}
        trend={`${stats.orders.pending_shipments} pending shipments`}
        extra={`${stats.orders.Processing} under review`}
        btnColor="bg-green-600 hover:bg-green-500"
        onClick={() => navigate("/admin/OrderManagement")}
      />
      <StatCard
        icon={<CartIcon />}
        iconBg="bg-yellow-500/20"
        label="Items in Carts"
        count={stats.carts.total_items}
        trend={`+${stats.carts.items_added_today} Items added to day`}
        extra={`${stats.carts.abandoned_carts} abandoned carts`}
        btnColor="bg-yellow-600 hover:bg-yellow-500"
        onClick={() => navigate("/admin/CartManagement")}
      />
    </div>
  );
}

function StatCard({ icon, iconBg, label, count, trend, extra, btnColor, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={`${iconBg} backdrop-blur-sm border border-gray-700 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg flex flex-col transition duration-300 hover:shadow-lg ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className={`p-2 sm:p-3 rounded-lg ${iconBg.replace("/20", "/30")} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-xs sm:text-sm font-medium truncate">
            {label}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 truncate">
            {count}
          </h2>
          <p className="text-green-400 text-xs mt-1 truncate">{trend}</p>
        </div>
      </div>
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700/50">
        <p className="text-gray-400 text-xs truncate">{extra}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick && onClick();
          }}
          className={`mt-2 sm:mt-3 w-full py-1 sm:py-2 ${btnColor} text-white text-xs sm:text-sm font-medium rounded-lg transition shadow-md`}
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}