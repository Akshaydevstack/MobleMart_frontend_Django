import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { AuthContext } from "../Context/AuthProvider";
import { toast } from "react-hot-toast";
import { registerUser } from "../services/auth";
import { GOOGLE_CLIENT_ID } from "../App";
import api from "../API/axios";
import { jwtDecode } from "jwt-decode";

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // ----------------- Normal Formik Registration -----------------
  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const userData = await registerUser(
          values.username,
          values.email,
          values.password
        );

        register({
          userid: userData.user_id,
          name: userData.username,
          email: userData.email,
          role: userData.role,
          is_block: userData.is_block,
        });

        toast.success("🎉 Registration Successful!");
        navigate("/");
      } catch (err) {
        console.error("Registration error:", err);

        if (err.response && err.response.data && err.response.data.error) {
          toast.error(`⚠️ ${err.response.data.error}`);
        } else {
          toast.error("❌ Something went wrong. Please try again.");
        }
      }
    },
  });

  // ----------------- Google OAuth Handler -----------------
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

      register({
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

  // ----------------- Load Google SDK -----------------
  useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);

  script.onload = () => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });

    const buttonDiv = document.getElementById("google-signin-button");
    if (buttonDiv) {
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
      });
    }
  };
}, []);


  return (
    <div
      className="w-full min-h-[90vh] md:min-h-screen flex items-center justify-center p-4 md:p-6"
      style={{
        backgroundImage: "linear-gradient(135deg, #312e81, #1e293b, #0f172a)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden relative z-10"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Brand */}
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
                className="w-24 h-auto md:w-48 rounded-xl mx-auto mb-2 md:mb-4"
              />
              <h2 className="text-xl md:text-3xl font-bold text-gray-900">
                Join MobileMart
              </h2>
              <p className="text-gray-800 mt-1 md:mt-2 text-sm md:text-base">
                Create your account today
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
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">
                Create Account
              </h2>

              {/* Normal Registration Form */}
              <form
                onSubmit={formik.handleSubmit}
                className="space-y-4 md:space-y-5"
              >
                {/* Username */}
                <div>
                  <label className="block text-gray-300 mb-1 text-xs md:text-sm">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="username"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.username}
                    placeholder="John Doe"
                    className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-gray-800 text-white border 
                      ${
                        formik.touched.username && formik.errors.username
                          ? "border-red-500"
                          : "border-gray-700"
                      }
                      focus:outline-none focus:border-yellow-500 text-sm md:text-base`}
                  />
                  <div className="min-h-[1rem] md:min-h-[1.25rem]">
                    {formik.touched.username && formik.errors.username && (
                      <p className="text-red-400 text-xs">
                        {formik.errors.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-300 mb-1 text-xs md:text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    placeholder="you@example.com"
                    className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-gray-800 text-white border 
                      ${
                        formik.touched.email && formik.errors.email
                          ? "border-red-500"
                          : "border-gray-700"
                      }
                      focus:outline-none focus:border-yellow-500 text-sm md:text-base`}
                  />
                  <div className="min-h-[1rem] md:min-h-[1.25rem]">
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-400 text-xs">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-300 mb-1 text-xs md:text-sm">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    placeholder="••••••••"
                    className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-gray-800 text-white border 
                      ${
                        formik.touched.password && formik.errors.password
                          ? "border-red-500"
                          : "border-gray-700"
                      }
                      focus:outline-none focus:border-yellow-500 text-sm md:text-base`}
                  />
                  <div className="min-h-[1rem] md:min-h-[1.25rem]">
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-red-400 text-xs">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 md:py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition shadow-md text-sm md:text-base"
                >
                  Register
                </motion.button>
              </form>

              {/* Divider */}
              <div className="my-4 flex items-center justify-center text-gray-400">
                <span className="border-b border-gray-600 w-full mr-2"></span>
                <span>OR</span>
                <span className="border-b border-gray-600 w-full ml-2"></span>
              </div>

              {/* Google Sign-In Button */}
              <div
                id="google-signin-button"
                className="flex justify-center"
                style={{ width: "100%" }}
              ></div>

              <p className="text-gray-400 text-center mt-4 md:mt-6 text-xs md:text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-yellow-400 hover:underline font-medium"
                >
                  Login here
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}