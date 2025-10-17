import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { AuthContext } from "../Context/AuthProvider";
import { toast } from "react-hot-toast";
import { loginUser } from "../services/auth";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import api from "../API/axios";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [blockedUser, setBlockedUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) navigate("/");
  }, [navigate]);

  useEffect(() => window.scrollTo(0, 0), []);

  // 🧠 Normal login handler
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email required"),
      password: Yup.string().min(6, "Min 6 chars").required("Password required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      const matchedUser = await loginUser(values.email, values.password);

      if (!matchedUser) {
        toast.error("Invalid email or password 🚫");
        setSubmitting(false);
        return;
      }

      if (matchedUser.is_block) {
        setBlockedUser(matchedUser);
        setSubmitting(false);
        return;
      }

      // Normal login success
      login({
        userid: matchedUser.user_id,
        name: matchedUser.username,
        email: matchedUser.email,
        role: matchedUser.role,
        is_block: matchedUser.is_block,
      });

      toast.success("Login Successful 🎉");
      navigate(matchedUser.role === "Admin" ? "/admin" : "/", { replace: true });
      setSubmitting(false);
    },
  });



  // 🧠 Google login handler
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) return toast.error("Google authentication failed");

      const res = await api.post("users/google-login/", { token: credential });
      const accessToken = res.data.access;
      localStorage.setItem("access_token", accessToken);

      const decoded = jwtDecode(accessToken);
      if (decoded.is_block) {
        toast.error("Your account has been blocked 🚫");
        return;
      }

      login({
        userid: decoded.user_id,
        name: decoded.username,
        email: decoded.email,
        role: decoded.role,
        is_block: decoded.is_block,
      });

      toast.success("Google login successful 🎉");
      navigate(decoded.role === "Admin" ? "/admin" : "/", { replace: true });
    } catch (error) {
      console.error("Google login failed:", error.response?.data || error.message);
      toast.error("Google login failed ❌");
    }
  };




  if (blockedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-200 p-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 p-6 rounded-2xl shadow-lg max-w-md text-center"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">Account Blocked</h2>
          <p className="text-gray-400 mb-2">
            Sorry {blockedUser.username}, your account has been blocked by the admin.
          </p>
          <p className="text-gray-500 text-sm">Please contact support for more information.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-[90vh] md:min-h-screen flex items-center justify-center p-4 md:p-6"
      style={{ backgroundImage: "linear-gradient(135deg, #0f172a, #1e293b, #312e81)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden relative z-10"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-yellow-400 to-orange-500 p-4 md:p-8 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <img
                src="https://mohamedsaber.net/wp-content/uploads/2020/08/f-1.jpg"
                alt="Brand Logo"
                className="w-24 h-auto md:w-40 rounded-xl mx-auto mb-2 md:mb-4"
              />
              <h2 className="text-xl md:text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-800 mt-1 md:mt-2 text-sm md:text-base">
                Login to your MobileMart account
              </p>
            </motion.div>
          </div>

          {/* Right Form */}
          <div className="w-full md:w-1/2 p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">Login</h2>

              <form onSubmit={formik.handleSubmit} className="space-y-4 md:space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-gray-300 mb-1 text-xs md:text-sm">Email</label>
                  <input
                    type="email"
                    name="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    placeholder="you@example.com"
                    className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-gray-800 text-white border ${
                      formik.touched.email && formik.errors.email
                        ? "border-red-500"
                        : "border-gray-700"
                    } focus:outline-none focus:border-yellow-500 text-sm md:text-base`}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-400 text-xs">{formik.errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-300 mb-1 text-xs md:text-sm">Password</label>
                  <input
                    type="password"
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    placeholder="••••••••"
                    disabled={formik.isSubmitting}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-gray-800 text-white border ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500"
                        : "border-gray-700"
                    } focus:outline-none focus:border-yellow-500 text-sm md:text-base`}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-400 text-xs">{formik.errors.password}</p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={formik.isSubmitting}
                  className="w-full py-2 md:py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition shadow-md text-sm md:text-base"
                >
                  {formik.isSubmitting ? "Logging in..." : "Login"}
                </motion.button>
              </form>

              {/* Google Login */}
              <div className="mt-5 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => toast.error("Google Login Failed")}
                />
              </div>

              <p className="text-gray-400 text-center mt-4 md:mt-6 text-xs md:text-sm">
                New to MobileMart?{" "}
                <Link to="/register" className="text-yellow-400 hover:underline font-medium">
                  Create an account
                </Link>
              </p>

              <p className="text-gray-400 text-center mt-2 text-xs md:text-sm">
                Forgot your password?{" "}
                <Link to="/reset-password" className="text-yellow-400 hover:underline font-medium">
                  Reset here
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}