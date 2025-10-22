import { useState,useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../API/axios";

export default function PasswordResetConfirm() {
  
    useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");



  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await api.post("users/password-reset-confirm/", {
        uidb64: uid,
        token: token,
        new_password: formData.newPassword,
      });
      setMessage("Password reset successful! Redirecting to login...");
      setError("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired link");
      setMessage("");
    }
  };

  return (
    <div
      className="w-full min-h-[90vh] md:min-h-screen flex items-center justify-center p-4 md:p-6"
      style={{ backgroundImage: "linear-gradient(135deg, #0f172a, #1e293b, #312e81)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden relative z-10"
      >
        <div className="flex flex-col">
          {/* Header Section */}
          <div className="w-full bg-gradient-to-br from-green-400 to-emerald-500 p-6 md:p-8 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <img
                src="https://mohamedsaber.net/wp-content/uploads/2020/08/f-1.jpg"
                alt="Brand Logo"
                className="w-20 h-auto md:w-24 rounded-xl mx-auto mb-3"
              />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Set New Password</h2>
              <p className="text-gray-800 mt-2 text-sm md:text-base">
                Secure your MobileMart account
              </p>
            </motion.div>
          </div>

          {/* Form Section */}
          <div className="w-full p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto"
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">
                Create New Password
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm md:text-base">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border ${
                      errors.newPassword ? "border-red-500" : "border-gray-700"
                    } focus:outline-none focus:border-green-500 text-sm md:text-base transition-colors`}
                  />
                  {errors.newPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm md:text-base">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-700"
                    } focus:outline-none focus:border-green-500 text-sm md:text-base transition-colors`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-green-500 hover:bg-green-400 text-gray-900 font-bold rounded-lg transition-all shadow-md text-sm md:text-base"
                >
                  Reset Password
                </motion.button>
              </form>

              {/* Messages */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg"
                >
                  <p className="text-green-400 text-sm text-center">{message}</p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg"
                >
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}

              {/* Back to Login */}
              <p className="text-gray-400 text-center mt-6 text-sm md:text-base">
                Remember your password?{" "}
                <a 
                  href="/login" 
                  className="text-green-400 hover:underline font-medium transition-colors"
                >
                  Back to Login
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}