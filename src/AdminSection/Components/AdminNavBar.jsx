import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../Context/AuthProvider";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  LogOut,
  ShoppingCart,
  Bell,
  BarChart2,
  Tag,
  Ticket 
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    const confirmed = window.confirm("Do you want to logout?");
    if (confirmed) {
      await logout();
      toast.success("Logged out successfully!");
      navigate("/login", { replace: true });
    }
  };

  const navLinks = [
    {
      path: "/admin/OrderManagement",
      icon: <ShoppingBag size={22} />,
      label: "Orders",
    },
    {
      path: "/admin/ProductManagement",
      icon: <LayoutDashboard size={22} />,
      label: "Products",
    },
    {
      path: "/admin/UserMagagement",
      icon: <Users size={22} />,
      label: "Users",
    },
    {
      path: "/admin/CartManagement",
      icon: <ShoppingCart size={22} />,
      label: "Cart Status",
    },
    {
      path: "/admin/PushNotification",
      icon: <Bell size={22} />,
      label: "Push Notifications",
    },
     {
      path: "/admin/BusinessAnalytics",
      icon: <BarChart2 size={22} />,
      label: "BusinessAnalytics",
    },
    {
      path: "/admin/BannerOffersManagement",
      icon: <Tag size={22} />,
      label: "Banner Offers",
    },
    {
      path: "/admin/CouponManagement",
      icon: <Ticket size={22} />,
      label: "Coupons",
    },
  ];

  const textVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "tween", ease: "easeOut", duration: 0.2 },
    },
  };

  return (
    <div className="fixed left-0 top-0 h-full z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 group w-16 hover:w-56 transition-all duration-300 ease-in-out flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700 flex justify-center group-hover:justify-start items-center h-16">
        <Link to="/admin" className="flex items-center gap-1 text-yellow-400 font-bold text-lg hover:text-yellow-300 transition-colors">
          <LayoutDashboard size={24} className="transition-transform group-hover:scale-105" />
          <motion.span
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="hidden group-hover:inline whitespace-nowrap ml-3"
          >
            Admin
          </motion.span>
        </Link>
      </div>

      {/* Links */}
      <div className="flex-1 flex flex-col p-2 space-y-1 overflow-y-auto">
        {navLinks.map((link, index) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`
                flex items-center h-11 px-2 rounded-lg
                transition-colors duration-200 ease-in-out
                ${
                  isActive
                    ? "bg-gray-800/60 text-yellow-400 border-l-2 border-yellow-400"
                    : "text-gray-300 hover:bg-gray-800/40 hover:text-yellow-300"
                }
              `}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {link.icon}
              </div>
              <motion.span
                initial="hidden"
                animate="visible"
                variants={textVariants}
                transition={{ delay: 0.05 + index * 0.03 }}
                className="hidden group-hover:inline text-sm font-medium whitespace-nowrap ml-3"
              >
                {link.label}
              </motion.span>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-2 border-t border-gray-700 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center h-11 w-full px-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium transition-colors duration-200 ease-in-out"
        >
          <LogOut size={22} className="transition-transform group-hover:scale-105" />
          <motion.span
            initial="hidden"
            animate="visible"
            variants={textVariants}
            transition={{ delay: 0.2 }}
            className="hidden group-hover:inline text-sm font-medium whitespace-nowrap ml-3"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </div>
  );
}