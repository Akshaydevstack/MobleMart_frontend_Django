import { useState,useEffect } from "react";
import { motion } from "framer-motion";
import api from "../API/axios";

export default function ResetPassword() {

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    
    try {
      await api.post("users/password-reset/", { email });
      setMessage("If your email exists, a reset link has been sent!");
    } catch (err) {
      setError("Something went wrong, try again.");
    } finally {
      setIsLoading(false);
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
          <div className="w-full bg-gradient-to-br from-yellow-400 to-orange-500 p-6 md:p-8 flex items-center justify-center">
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
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Reset Password</h2>
              <p className="text-gray-800 mt-2 text-sm md:text-base">
                Recover your MobileMart account
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
                Forgot Your Password?
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm md:text-base">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-yellow-500 text-sm md:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  disabled={isLoading}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-all shadow-md text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-yellow-500 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
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
                  className="text-yellow-400 hover:underline font-medium transition-colors"
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