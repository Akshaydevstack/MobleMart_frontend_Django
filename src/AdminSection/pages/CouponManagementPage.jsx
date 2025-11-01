import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiTag,
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../API/axios";

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "0",
    active: true,
    valid_from: "",
    valid_to: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin/coupons-management/");
      setCoupons(res.data);
    } catch (err) {
      console.error("Error fetching coupons", err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "0",
      active: true,
      valid_from: "",
      valid_to: "",
    });
    setIsFormOpen(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon.id);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      active: coupon.active,
      valid_from: coupon.valid_from.slice(0, 16),
      valid_to: coupon.valid_to.slice(0, 16),
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (editingCoupon) {
        await api.patch(`admin/coupons-management/${editingCoupon}/`, formData);
        toast.success("Coupon updated successfully!");
      } else {
        await api.post("admin/coupons-management/", formData);
        toast.success("Coupon created successfully!");
      }

      await fetchCoupons();
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error saving coupon", err);
      if (err.response?.data) {
        toast.error(`Error: ${JSON.stringify(err.response.data)}`);
      } else {
        toast.error("Error saving coupon");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        setLoading(true);
        await api.delete(`admin/coupons-management/${id}/`);
        await fetchCoupons();
        toast.success("Coupon deleted successfully!");
      } catch (err) {
        console.error("Error deleting coupon", err);
        toast.error("Error deleting coupon");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      setLoading(true);
      await api.patch(`admin/coupons-management/${coupon.id}/`, {
        active: !coupon.active,
      });
      await fetchCoupons();
      toast.success(`Coupon ${!coupon.active ? "activated" : "deactivated"}!`);
    } catch (err) {
      console.error("Error updating coupon status", err);
      toast.error("Error updating coupon status");
    } finally {
      setLoading(false);
    }
  };

  const isCouponValid = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validTo = new Date(coupon.valid_to);
    return coupon.active && now >= validFrom && now <= validTo;
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-3xl shadow-lg"
        >
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">
              Coupon Management
            </h1>
            <p className="text-sm text-gray-400">
              Manage discount coupons and promotions
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl shadow transition"
          >
            <FiPlus /> Add Coupon
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg"
          >
            <div className="text-gray-400 text-sm">Total Coupons</div>
            <div className="text-3xl font-bold text-yellow-400">
              {coupons.length}
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg"
          >
            <div className="text-gray-400 text-sm">Active Coupons</div>
            <div className="text-3xl font-bold text-green-400">
              {coupons.filter(c => c.active).length}
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg"
          >
            <div className="text-gray-400 text-sm">Valid Now</div>
            <div className="text-3xl font-bold text-blue-400">
              {coupons.filter(isCouponValid).length}
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg"
          >
            <div className="text-gray-400 text-sm">Expired</div>
            <div className="text-3xl font-bold text-red-400">
              {coupons.filter(c => new Date(c.valid_to) < new Date()).length}
            </div>
          </motion.div>
        </div>

        {/* Coupons Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-gray-900 rounded-3xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-3xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Min Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Validity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {coupons.map((coupon) => (
                    <motion.tr
                      key={coupon.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{
                        backgroundColor: "rgba(253, 224, 71, 0.1)",
                      }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FiTag className="text-yellow-400 mr-2" />
                          <div>
                            <div className="text-sm font-mono font-bold text-gray-100">
                              {coupon.code}
                            </div>
                            <div className="text-xs text-gray-400">
                              {coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-100">
                          {coupon.discount_type === 'percentage' ? (
                            <FiPercent className="text-green-400 mr-1" />
                          ) : (
                            <FiDollarSign className="text-green-400 mr-1" />
                          )}
                          {coupon.discount_value}
                          {coupon.discount_type === 'percentage' && '%'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        ₹{parseFloat(coupon.min_order_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400">
                          <div className="flex items-center">
                            <FiCalendar className="mr-1" size={12} />
                            {new Date(coupon.valid_from).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <FiClock className="mr-1" size={12} />
                            {new Date(coupon.valid_to).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              coupon.active
                                ? "bg-green-400/20 text-green-300"
                                : "bg-red-400/20 text-red-300"
                            }`}
                          >
                            {coupon.active ? "Active" : "Inactive"}
                          </span>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              isCouponValid(coupon)
                                ? "bg-blue-400/20 text-blue-300"
                                : "bg-gray-400/20 text-gray-300"
                            }`}
                          >
                            {isCouponValid(coupon) ? "Valid" : "Invalid"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="text-yellow-400 hover:text-yellow-500"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="text-red-400 hover:text-red-500"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                  <h2 className="text-2xl font-bold text-yellow-400">
                    {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="SUMMER2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Discount Type
                    </label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) =>
                        setFormData({ ...formData, discount_type: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData({ ...formData, discount_value: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Minimum Order Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.min_order_amount}
                      onChange={(e) =>
                        setFormData({ ...formData, min_order_amount: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Valid From
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.valid_from}
                      onChange={(e) =>
                        setFormData({ ...formData, valid_from: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Valid To
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.valid_to}
                      onChange={(e) =>
                        setFormData({ ...formData, valid_to: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
                    />
                    <span className="ml-2 text-sm text-gray-300">
                      Active Coupon
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={
                      loading ||
                      !formData.code.trim() ||
                      !formData.discount_value ||
                      !formData.valid_from ||
                      !formData.valid_to
                    }
                    className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    ) : (
                      <FiCheck />
                    )}
                    {editingCoupon ? "Update Coupon" : "Create Coupon"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}