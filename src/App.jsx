import "./App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./Context/AuthProvider";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UserRoutes from "./Routes/UserRoutes";
import AdminDashboard from "./AdminSection/AdminDashBoard";
import AdminRoutes from "./Routes/AdminRoute";
import UserLayout from "./Layouts/UserLayout";
import UserManagement from "./AdminSection/pages/UserManagementPage";
import AdminLayout from "./Layouts/AdminLayout";
import ProductManagement from "./AdminSection/pages/ProductManagementPage";
import OrderManagement from "./AdminSection/pages/OrderManagementPage";
import CartManagement from "./AdminSection/pages/CartManagementPage";
import PushNotification from "./AdminSection/pages/Pushnotification";
import UserNotifications from "./pages/UserNotifications";
import BusinessAnalytics from "./AdminSection/pages/BusinessAnalytics";
import LoaderPage from "./Component/LoaderPage";
const HomePage = lazy(() => import("./pages/HomePage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const BuyNowPage = lazy(() => import("./pages/BuyNowPage"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmationpage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ViewOrders = lazy(() => import("./pages/ViewOrdersPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfile"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export const GOOGLE_CLIENT_ID = "452036882317-m55vuhdiqaqmcjeal86aitpadnnrgc4b.apps.googleusercontent.com";

function App() {
  return (
    <BrowserRouter>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              marginTop: "60px",
            },
          }}
        />
        <Suspense fallback={<LoaderPage />}>
          <Routes>
            <Route element={<AdminRoutes />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route
                  path="/admin/UserMagagement"
                  element={<UserManagement />}
                />
                <Route
                  path="/admin/ProductManagement"
                  element={<ProductManagement />}
                />
                <Route
                  path="/admin/OrderManagement"
                  element={<OrderManagement />}
                />
                <Route
                  path="/admin/CartManagement"
                  element={<CartManagement />}
                />
                <Route
                  path="/admin/PushNotification"
                  element={<PushNotification />}
                />
                <Route
                  path="/admin/BusinessAnalytics"
                  element={<BusinessAnalytics />}
                />
              </Route>
            </Route>
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route element={<UserRoutes />}>
                <Route path="/user" element={<UserProfilePage />} />
                <Route path="/buynow" element={<BuyNowPage />} />
                <Route
                  path="/order-confirmation/:orderId"
                  element={<OrderConfirmation />}
                />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/orders" element={<ViewOrders />} />
                <Route
                  path="/UserNotifications"
                  element={<UserNotifications />}
                />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;
