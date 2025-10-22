import React from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import axios from "axios";
import { GetUserData } from "../API/GetUsreData";
import { toast } from "react-hot-toast";
import { UserApi } from "../Data/Api_EndPoint";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      newPassword: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      newPassword: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("New password is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const users = await GetUserData();
        const existingUser = users.find((u) => u.email === values.email);

        if (existingUser) {
          await axios.patch(`${UserApi}/${existingUser.id}`, {
            password: values.newPassword,
          });

          toast.success("Password reset successfully! Please login.");
          resetForm();
          navigate("/login");
        } else {
          toast.error("Email not found. Please check and try again.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again later.");
      }
    },
  });

  return (
    <div
      className="w-full min-h-[90vh] md:min-h-screen flex items-center justify-center p-4 md:p-6"
      style={{
        backgroundImage: "linear-gradient(135deg, #0f172a, #1e293b, #312e81)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden relative z-10"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left brand / image - Mobile optimized */}
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
              <h2 className="text-xl md:text-3xl font-bold text-gray-900">
                Reset Your Password
              </h2>
              <p className="text-gray-800 mt-1 md:mt-2 text-sm md:text-base">
                Enter your email & new password
              </p>
            </motion.div>
          </div>

          {/* Right form - Mobile optimized */}
          <div className="w-full md:w-1/2 p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">
                Reset Password
              </h2>

              <form
                onSubmit={formik.handleSubmit}
                className="space-y-4 md:space-y-5"
              >
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

                {/* New password */}
                <div>
                  <label className="block text-gray-300 mb-1 text-xs md:text-sm">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.newPassword}
                    placeholder="••••••••"
                    className={`w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-gray-800 text-white border 
                      ${
                        formik.touched.newPassword && formik.errors.newPassword
                          ? "border-red-500"
                          : "border-gray-700"
                      }
                      focus:outline-none focus:border-yellow-500 text-sm md:text-base`}
                  />
                  <div className="min-h-[1rem] md:min-h-[1.25rem]">
                    {formik.touched.newPassword &&
                      formik.errors.newPassword && (
                        <p className="text-red-400 text-xs">
                          {formik.errors.newPassword}
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
                  Reset Password
                </motion.button>
              </form>

              <p className="text-gray-400 text-center mt-4 md:mt-6 text-xs md:text-sm">
                Remembered your password?{" "}
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
