import "./App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./Context/AuthProvider";
import LoaderPage from "./Component/LoaderPage";
import AdminRoutes from "./Routes/AdminRoute";
import UserRoutes from "./Routes/UserRoutes";
import AdminLayout from "./Layouts/AdminLayout";
import UserLayout from "./Layouts/UserLayout";
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Lazy-loaded pages
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
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PasswordResetConfirm = lazy(() => import("./pages/PasswordResetConfirm"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const UserNotifications = lazy(()=> import("./pages/UserNotifications"))


// Admin pages
const AdminDashboard = lazy(() => import("./AdminSection/AdminDashBoard"));
const UserManagement = lazy(() => import("./AdminSection/pages/UserManagementPage"));
const ProductManagement = lazy(() => import("./AdminSection/pages/ProductManagementPage"));
const OrderManagement = lazy(() => import("./AdminSection/pages/OrderManagementPage"));
const CartManagement = lazy(() => import("./AdminSection/pages/CartManagementPage"));
const PushNotification = lazy(() => import("./AdminSection/pages/Pushnotification"));
const BusinessAnalytics = lazy(() => import("./AdminSection/pages/BusinessAnalytics"));

function App() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{ style: { marginTop: "60px" } }}
          />

          <Suspense fallback={<LoaderPage />}>
            <Routes>
              {/* ✅ Admin Section */}
              <Route element={<AdminRoutes />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/UserMagagement" element={<UserManagement />} />
                  <Route path="/admin/ProductManagement" element={<ProductManagement />} />
                  <Route path="/admin/OrderManagement" element={<OrderManagement />} />
                  <Route path="/admin/CartManagement" element={<CartManagement />} />
                  <Route path="/admin/PushNotification" element={<PushNotification />} />
                  <Route path="/admin/BusinessAnalytics" element={<BusinessAnalytics />} />
                </Route>
              </Route>

              {/* ✅ User Section */}
              <Route element={<UserLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:uid/:token" element={<PasswordResetConfirm />} />

                <Route element={<UserRoutes />}>
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/user" element={<UserProfilePage />} />
                  <Route path="/edit-profile" element={<EditProfilePage />} />
                  <Route path="/buynow" element={<BuyNowPage />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/orders" element={<ViewOrders />} />
                  <Route path="/UserNotifications" element={<UserNotifications />} />
                </Route>
              </Route>

              {/* ✅ 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;