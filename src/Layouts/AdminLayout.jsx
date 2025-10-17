import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminNavbar from "../AdminSection/Components/AdminNavBar";

export default function AdminLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar - ONLY visible on desktop */}
      {!isMobile && (
        <div
          className={`fixed left-0 top-0 h-full bg-gray-900 transition-all duration-300 ease-in-out z-40
            ${isSidebarExpanded ? "w-56" : "w-16"}
          `}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >
          <AdminNavbar isExpanded={isSidebarExpanded} />
        </div>
      )}

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out min-h-screen
          ${!isMobile ? (isSidebarExpanded ? "ml-56" : "ml-16") : "ml-0"}`}
      >
        <Outlet />
      </div>
    </div>
  );
}