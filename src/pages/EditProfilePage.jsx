import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import api from "../API/axios";

export default function EditProfilePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  // Fetch user data for the form
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    api
      .get(`users/me/`)
      .then((res) => {
        setInitialData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load user data:", err);
        toast.error("Failed to load profile data");
        setLoading(false);
      });
  }, [user, navigate]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Account Settings
          </h1>
          <p className="text-gray-400 text-lg">Manage your profile and security settings</p>
        </motion.div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Profile Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col h-full"
          >
            <ProfileInformationSection 
              user={user} 
              initialData={initialData} 
              updateUser={updateUser} 
              navigate={navigate} 
            />
          </motion.div>

          {/* Change Email Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col h-full"
          >
            <ChangeEmailSection />
          </motion.div>

          {/* Account Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col h-full"
          >
            <AccountStatusSection initialData={initialData} />
          </motion.div>

          {/* Change Password Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col h-full"
          >
            <ChangePasswordSection />
          </motion.div>
        </div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-blue-900/20 border border-blue-700 rounded-2xl max-w-6xl mx-auto"
        >
          <div className="flex items-start gap-4">
            <div className="text-blue-400 mt-1 flex-shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-blue-300 text-lg font-semibold mb-2">Security Information</p>
              <p className="text-blue-400 text-sm">
                Your account security is our priority. All changes are logged and monitored.
                You will receive email notifications for important account changes.
                Contact support immediately if you notice any suspicious activity.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Profile Information Section Component
function ProfileInformationSection({ user, initialData, updateUser, navigate }) {
  const validationSchema = Yup.object({
    username: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .required("Name is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: initialData?.username || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const hasChanges = values.username !== initialData.username;

        if (!hasChanges) {
          toast("No changes detected", { icon: "ℹ️" });
          setSubmitting(false);
          return;
        }

        const response = await api.patch(`users/me/update/`, values);

        updateUser({
          ...user,
          name: response.data.username,
        });

        toast.success("Profile updated successfully! 🎉");
      } catch (error) {
        console.error("Update failed:", error);
        if (error.response?.data?.username) {
          toast.error(`Username: ${error.response.data.username}`);
        } else {
          toast.error("Failed to update profile. Please try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <img
            src={`https://api.dicebear.com/6.x/initials/svg?seed=${
              formik.values.username || user.name || "User"
            }&backgroundColor=4f46e5&textColor=ffffff`}
            alt="User Avatar"
            className="w-16 h-16 rounded-full border-2 border-yellow-400"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-gray-900 rounded-full"></div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Profile Information</h2>
          <p className="text-gray-400 text-sm">Update your personal details</p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="mb-4">
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              name="username"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
              placeholder="Enter your full name"
              disabled={formik.isSubmitting}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border transition-colors ${
                formik.touched.username && formik.errors.username
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-600 focus:border-yellow-500"
              } focus:outline-none focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {formik.touched.username && formik.errors.username && (
              <p className="text-red-400 text-sm mt-2">
                {formik.errors.username}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                User ID
              </label>
              <div className="px-3 py-2 rounded-lg bg-gray-800/50 text-gray-300 text-sm">
                {initialData?.id || user.userid}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                Current Email
              </label>
              <div className="px-3 py-2 rounded-lg bg-gray-800/50 text-gray-300 text-sm truncate">
                {initialData?.email || user.email}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 mt-auto">
          <motion.button
            type="submit"
            whileHover={!formik.isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!formik.isSubmitting ? { scale: 0.98 } : {}}
            disabled={formik.isSubmitting}
            className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {formik.isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </motion.button>

          <button
            type="button"
            onClick={() => navigate("/user")}
            disabled={formik.isSubmitting}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Account Status Section Component
function AccountStatusSection({ initialData }) {
  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Account Status</h2>
          <p className="text-gray-400 text-sm">Your account overview</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center py-3 px-4 bg-gray-800/50 rounded-lg">
          <div>
            <span className="text-gray-400 block text-sm">Member Since</span>
            <span className="text-white text-sm font-medium">
              {initialData?.created_at
                ? new Date(initialData.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="flex justify-between items-center py-3 px-4 bg-gray-800/50 rounded-lg">
          <div>
            <span className="text-gray-400 block text-sm">Account Status</span>
            <span
              className={`font-semibold text-sm ${
                initialData?.is_active ? "text-green-400" : "text-red-400"
              }`}
            >
              {initialData?.is_active ? "Active" : "Inactive"}
              {initialData?.is_block && " (Blocked)"}
            </span>
          </div>
          {initialData?.is_active ? (
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <div className="flex justify-between items-center py-3 px-4 bg-gray-800/50 rounded-lg">
          <div>
            <span className="text-gray-400 block text-sm">Role</span>
            <span className="text-white text-sm font-medium capitalize">
              {initialData?.role || "User"}
            </span>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      <div className="mt-6 p-3 bg-purple-900/20 rounded-lg border border-purple-800/50">
        <p className="text-purple-300 text-xs">
          📊 Your account is in good standing. Keep your information updated for better security.
        </p>
      </div>
    </div>
  );
}

// Change Email Section Component
function ChangeEmailSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      new_email: "",
      confirm_email: "",
    },
    validationSchema: Yup.object({
      new_email: Yup.string()
        .email("Invalid email address")
        .required("New email is required"),
      confirm_email: Yup.string()
        .oneOf([Yup.ref("new_email"), null], "Emails must match")
        .required("Please confirm your email"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        await api.patch("users/change-email/", {
          new_email: values.new_email,
          confirm_email: values.confirm_email,
        });
        toast.success("Email updated successfully! Check your inbox for verification.");
        resetForm();
      } catch (error) {
        console.error("Email update failed:", error);
        const errorMsg = error.response?.data?.detail || 
                        error.response?.data?.new_email?.[0] ||
                        "Failed to change email. Please try again.";
        toast.error(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Change Email</h2>
          <p className="text-gray-400 text-sm">Update your email address</p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              New Email Address
            </label>
            <input
              type="email"
              name="new_email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.new_email}
              placeholder="Enter new email address"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border transition-colors ${
                formik.touched.new_email && formik.errors.new_email
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-600 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {formik.touched.new_email && formik.errors.new_email && (
              <p className="text-red-400 text-sm mt-2">
                {formik.errors.new_email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Confirm New Email
            </label>
            <input
              type="email"
              name="confirm_email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirm_email}
              placeholder="Confirm new email address"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border transition-colors ${
                formik.touched.confirm_email && formik.errors.confirm_email
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-600 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {formik.touched.confirm_email && formik.errors.confirm_email && (
              <p className="text-red-400 text-sm mt-2">
                {formik.errors.confirm_email}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          <motion.button
            type="submit"
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating Email...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Update Email Address
              </>
            )}
          </motion.button>

          <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
            <p className="text-blue-300 text-xs">
              💡 You will receive a verification email at your new address. Your email will be updated after verification.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

// Change Password Section Component
function ChangePasswordSection() {
  const formik = useFormik({
    initialValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      old_password: Yup.string().required("Current password is required"),
      new_password: Yup.string()
        .min(6, "New password must be at least 6 characters")
        .required("New password is required")
        .notOneOf(
          [Yup.ref("old_password")],
          "New password must be different from current password"
        ),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("new_password"), null], "Passwords must match")
        .required("Confirm your new password"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await api.patch("users/change-password/", {
          old_password: values.old_password,
          new_password: values.new_password,
          confirm_password: values.confirm_password,
        });
        toast.success("Password updated successfully! 🔒");
        resetForm();
      } catch (error) {
        console.error("Password update failed:", error);
        if (error.response?.data) {
          if (error.response.data.old_password) {
            toast.error("Current password is incorrect");
          } else if (error.response.data.new_password) {
            toast.error(error.response.data.new_password);
          } else {
            Object.values(error.response.data).forEach((msg) => {
              if (typeof msg === "string") {
                toast.error(msg);
              }
            });
          }
        } else {
          toast.error("Failed to change password. Please try again.");
        }
      }
    },
  });

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Change Password</h2>
          <p className="text-gray-400 text-sm">Update your security password</p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Current Password
            </label>
            <input
              type="password"
              name="old_password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.old_password}
              placeholder="Enter current password"
              disabled={formik.isSubmitting}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border transition-colors ${
                formik.touched.old_password && formik.errors.old_password
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-600 focus:border-green-500"
              } focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {formik.touched.old_password && formik.errors.old_password && (
              <p className="text-red-400 text-sm mt-2">
                {formik.errors.old_password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              New Password
            </label>
            <input
              type="password"
              name="new_password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.new_password}
              placeholder="Enter new password"
              disabled={formik.isSubmitting}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border transition-colors ${
                formik.touched.new_password && formik.errors.new_password
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-600 focus:border-green-500"
              } focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {formik.touched.new_password && formik.errors.new_password && (
              <p className="text-red-400 text-sm mt-2">
                {formik.errors.new_password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirm_password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirm_password}
              placeholder="Confirm new password"
              disabled={formik.isSubmitting}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border transition-colors ${
                formik.touched.confirm_password && formik.errors.confirm_password
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-600 focus:border-green-500"
              } focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {formik.touched.confirm_password && formik.errors.confirm_password && (
              <p className="text-red-400 text-sm mt-2">
                {formik.errors.confirm_password}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          <motion.button
            type="submit"
            whileHover={!formik.isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!formik.isSubmitting ? { scale: 0.98 } : {}}
            disabled={formik.isSubmitting}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {formik.isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating Password...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Update Password
              </>
            )}
          </motion.button>

          <div className="p-3 bg-green-900/20 rounded-lg border border-green-800/50">
            <p className="text-green-300 text-xs">
              🔒 Use a strong password with letters, numbers, and special characters for better security.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}