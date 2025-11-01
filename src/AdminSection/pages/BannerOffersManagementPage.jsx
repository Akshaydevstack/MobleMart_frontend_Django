import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiTag,
  FiToggleLeft,
  FiToggleRight,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../API/axios";

export default function BannerOffersManagement() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    message: "",
    is_active: true,
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin/banner-management/");
      setOffers(res.data);
    } catch (err) {
      console.error("Error fetching offers", err);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingOffer(null);
    setFormData({ message: "", is_active: true });
    setIsFormOpen(true);
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer.id);
    setFormData({
      message: offer.message,
      is_active: offer.is_active,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (editingOffer) {
        await api.patch(`admin/banner-management/${editingOffer}/`, formData);
        toast.success("Offer updated successfully!");
      } else {
        await api.post("admin/banner-management/", formData);
        toast.success("Offer created successfully!");
      }

      await fetchOffers();
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error saving offer", err);
      toast.error("Error saving offer");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        setLoading(true);
        await api.delete(`admin/banner-management/${id}/`);
        await fetchOffers();
        toast.success("Offer deleted successfully!");
      } catch (err) {
        console.error("Error deleting offer", err);
        toast.error("Error deleting offer");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleOfferStatus = async (offer) => {
    try {
      setLoading(true);
      await api.patch(`admin/banner-management/${offer.id}/`, {
        is_active: !offer.is_active,
      });
      await fetchOffers();
      toast.success(`Offer ${!offer.is_active ? "activated" : "deactivated"}!`);
    } catch (err) {
      console.error("Error updating offer status", err);
      toast.error("Error updating offer status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-3xl shadow-lg"
        >
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">
              Banner Offers Management
            </h1>
            <p className="text-sm text-gray-400">
              Manage promotional banner offers
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl shadow transition"
          >
            <FiPlus /> Add Offer
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg"
          >
            <div className="text-gray-400 text-sm">Total Offers</div>
            <div className="text-3xl font-bold text-yellow-400">
              {offers.length}
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg"
          >
            <div className="text-gray-400 text-sm">Active Offers</div>
            <div className="text-3xl font-bold text-green-400">
              {offers.filter(o => o.is_active).length}
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg"
          >
            <div className="text-gray-400 text-sm">Inactive Offers</div>
            <div className="text-3xl font-bold text-red-400">
              {offers.filter(o => !o.is_active).length}
            </div>
          </motion.div>
        </div>

        {/* Offers Table */}
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
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {offers.map((offer) => (
                    <motion.tr
                      key={offer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{
                        backgroundColor: "rgba(253, 224, 71, 0.1)",
                      }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-100">
                          {offer.message}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleOfferStatus(offer)}
                          className="flex items-center gap-2"
                        >
                          {offer.is_active ? (
                            <FiToggleRight className="text-green-400" size={24} />
                          ) : (
                            <FiToggleLeft className="text-red-400" size={24} />
                          )}
                          <span
                            className={`text-sm ${
                              offer.is_active ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {offer.is_active ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(offer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(offer)}
                            className="text-yellow-400 hover:text-yellow-500"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(offer.id)}
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
              className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl w-full max-w-2xl"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                  <h2 className="text-2xl font-bold text-yellow-400">
                    {editingOffer ? "Edit Offer" : "Add New Offer"}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Offer Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Enter promotional message..."
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        Active Offer
                      </span>
                    </label>
                  </div>
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
                    disabled={loading || !formData.message.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    ) : (
                      <FiCheck />
                    )}
                    {editingOffer ? "Update Offer" : "Create Offer"}
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