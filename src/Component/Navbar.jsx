import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  LogIn,
  X,
  User,
  Heart,
  PackageCheck,
  Bell,
} from "lucide-react";
import { AuthContext } from "../Context/AuthProvider";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;

  const {
    user,
    logout,
    cartLength,
    setCartLength,
    setHasNewNotification,
    hasNewNotification,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const handillogout = () => {
    const result = confirm("Do you want to logout");
    if (result) {
      logout();
      setCartLength(0);
    }
  };

  return (
    <nav className="bg-black shadow-md p-3 overflow-hidden sticky top-0 z-1000">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-3xl font-bold text-yellow-400">
          MobileMart
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link
            to="/"
            className={`${
              currentPath === "/"
                ? "text-yellow-400 font-semibold"
                : "text-white"
            } hover:text-yellow-400 transition`}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className={`${
              currentPath === "/shop"
                ? "text-yellow-400 font-semibold"
                : "text-white"
            } hover:text-yellow-400 transition`}
          >
            Shop
          </Link>
          <Link
            to="/cart"
            className={`relative flex items-center ${
              currentPath === "/cart"
                ? "text-yellow-400 font-semibold"
                : "text-white"
            } hover:text-yellow-400 transition`}
          >
            <ShoppingCart className="w-5 h-5 mr-1" /> Cart
            {cartLength > 0 && (
              <span className="absolute -top-2 -right-4 text-white text-[13px] px-1 py-[1px] rounded-full">
                {cartLength}
              </span>
            )}
          </Link>

          {user && (
            <>
              <Link
                to="/wishlist"
                className={`flex items-center ${
                  currentPath === "/wishlist"
                    ? "text-yellow-400 font-semibold"
                    : "text-white"
                } hover:text-yellow-400 transition`}
              >
                <Heart className="w-5 h-5 mr-1" /> Wishlist
              </Link>
              <Link
                to="/orders"
                className={`flex items-center ${
                  currentPath === "/orders"
                    ? "text-yellow-400 font-semibold"
                    : "text-white"
                } hover:text-yellow-400 transition`}
              >
                <PackageCheck className="w-5 h-5 mr-1" /> Orders
              </Link>
              <Link
                to="/UserNotifications"
                onClick={() => setHasNewNotification(false)} // ✅ Mark as seen
                className={`relative flex items-center ${
                  currentPath === "/UserNotifications"
                    ? "text-yellow-400 font-semibold"
                    : "text-white"
                } hover:text-yellow-400 transition`}
              >
                {/* 🔔 Bell turns red when notification exists */}
                <Bell
                  className={`w-5 h-5 mr-1 transition-colors duration-300 ${
                    hasNewNotification ? "text-red-500 animate-pulse" : ""
                  }`}
                />
                Notifications
              </Link>
            </>
          )}

          {user ? (
            <>
              <span
                onClick={() => navigate("/user")}
                className="text-yellow-400 flex items-center hover:text-yellow-300 hover:underline cursor-pointer"
              >
                <User className="w-5 h-5 mr-1" /> {user.name}
              </span>
              <button
                onClick={handillogout}
                className="flex items-center px-4 py-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`flex items-center px-4 py-2 rounded-full transition ${
                currentPath === "/login"
                  ? "bg-yellow-400 text-black"
                  : "bg-yellow-400 text-black hover:bg-yellow-300"
              }`}
            >
              <LogIn className="w-5 h-5 mr-2" /> Login
            </Link>
          )}
        </div>

        {/* Mobile Buttons */}
        <div className="md:hidden flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-800"></button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-gray-800"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-yellow-400" />
            ) : (
              <svg
                className="w-6 h-6 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 shadow-md">
          <div className="flex flex-col p-4 space-y-4">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={`${
                currentPath === "/"
                  ? "text-yellow-400 font-semibold"
                  : "text-white"
              } hover:text-yellow-400 transition`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMenuOpen(false)}
              className={`${
                currentPath === "/shop"
                  ? "text-yellow-400 font-semibold"
                  : "text-white"
              } hover:text-yellow-400 transition`}
            >
              Shop
            </Link>
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className={`relative flex items-center ${
                currentPath === "/cart"
                  ? "text-yellow-400 font-semibold"
                  : "text-white"
              } hover:text-yellow-400 transition`}
            >
              <ShoppingCart className="w-5 h-5 mr-1" /> Cart
            </Link>

            {user && (
              <>
                <Link
                  to="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center ${
                    currentPath === "/wishlist"
                      ? "text-yellow-400 font-semibold"
                      : "text-white"
                  } hover:text-yellow-400 transition`}
                >
                  <Heart className="w-5 h-5 mr-1" /> Wishlist
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center ${
                    currentPath === "/orders"
                      ? "text-yellow-400 font-semibold"
                      : "text-white"
                  } hover:text-yellow-400 transition`}
                >
                  <PackageCheck className="w-5 h-5 mr-1" /> Orders
                </Link>
                <Link
                  to="/UserNotifications"
                  onClick={() => setHasNewNotification(false)} // ✅ Mark as seen
                  className={`relative flex items-center ${
                    currentPath === "/UserNotifications"
                      ? "text-yellow-400 font-semibold"
                      : "text-white"
                  } hover:text-yellow-400 transition`}
                >
                  <Bell className="w-5 h-5 mr-1" /> Notifications
                  {/* 🔴 Notification indicator */}
                  {hasNewNotification && (
                    <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>
              </>
            )}

            {user ? (
              <>
                <span
                  onClick={() => navigate("/user")}
                  className="text-yellow-400 flex items-center hover:text-yellow-300 hover:underline cursor-pointer"
                >
                  <User className="w-5 h-5 mr-1" /> {user.name}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 transition"
              >
                <LogIn className="w-5 h-5 mr-2" /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
