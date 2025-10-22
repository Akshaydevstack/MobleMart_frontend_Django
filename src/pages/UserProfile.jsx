import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../API/axios";
import { toast } from "react-hot-toast";

export default function UserProfilePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [fullUserData, setFullUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [totalOrders,setTotalOrders ] = useState(0)
  const [totalWishlist,setTotalWishlist ] = useState(0)
  const [addressForm, setAddressForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
  });

  // Fetch user & addresses
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await api.get(`users/me/`);
        setFullUserData(userRes.data);

        const addrRes = await api.get(`users/addresses/`);
        setAddresses(addrRes.data.results || []);

        const totalOrders = await api.get(`orders/`)
        setTotalOrders(totalOrders.data.results.length)

        const totalWishlist = await api.get('wishlist/')
        setTotalWishlist(totalWishlist.data.products.length)

      } catch (err) {
        console.error("Failed to load data:", err);
        toast.error("Failed to load profile or addresses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Address Handlers
  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        // Update existing address
        const res = await api.patch(`users/addresses/${editingAddress.id}/`, addressForm);
        setAddresses(addresses.map(addr => addr.id === editingAddress.id ? res.data : addr));
        toast.success("Address updated successfully!");
        setEditingAddress(null);
      } else {
        // Create new address
        const res = await api.post("users/addresses/", addressForm);
        setAddresses([...addresses, res.data]);
        toast.success("Address added successfully!");
      }
      setShowAddressForm(false);
      resetAddressForm();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${editingAddress ? 'update' : 'add'} address.`);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      email: address.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await api.delete(`users/addresses/${addressId}/`);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      toast.success("Address deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address.");
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
    });
    setEditingAddress(null);
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    resetAddressForm();
  };



  if (!user) return null;
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const getStatusBadge = (isActive, isBlocked) => {
    if (isBlocked) return { text: "Blocked", color: "bg-red-500" };
    return isActive ? { text: "Active", color: "bg-green-500" } : { text: "Inactive", color: "bg-yellow-500" };
  };

  const status = getStatusBadge(fullUserData?.is_active, fullUserData?.is_block);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">User Profile</h1>
          <p className="text-gray-400">Manage your account information and addresses</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                  <div className="flex-shrink-0 relative">
                    <img
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${fullUserData?.username || user.name || "User"}&backgroundColor=4f46e5&textColor=ffffff`}
                      alt="User Avatar"
                      className="w-24 h-24 rounded-full border-4 border-yellow-400"
                    />
                    <div className={`absolute -bottom-2 -right-2 ${status.color} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
                      {status.text}
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {fullUserData?.username || user.name}
                    </h2>
                    <p className="text-gray-400 text-lg capitalize mb-4">
                      {fullUserData?.role || "User"} Account
                    </p>
                    <button
                      onClick={() => navigate("/edit-profile")}
                      className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* User Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <p className="text-gray-400 text-sm mb-1">User ID</p>
                      <p className="text-white font-semibold">{fullUserData?.id || user.userid}</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <p className="text-gray-400 text-sm mb-1">Email</p>
                      <p className="text-white font-semibold break-all">
                        {fullUserData?.email || user.email || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <p className="text-gray-400 text-sm mb-1">Member Since</p>
                      <p className="text-white font-semibold">
                        {formatDate(fullUserData?.created_at)}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <p className="text-gray-400 text-sm mb-1">Account Status</p>
                      <p className={`font-semibold ${fullUserData?.is_active ? 'text-green-400' : 'text-red-400'}`}>
                        {fullUserData?.is_active ? 'Active' : 'Inactive'}
                        {fullUserData?.is_block && ' (Blocked)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => navigate("/orders")}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    View Orders
                  </button>
                  <button
                    onClick={() => navigate("/wishlist")}
                    className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Wishlist
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Addresses Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Shipping Addresses</h3>
                    <p className="text-gray-400 text-sm">Manage your delivery addresses</p>
                  </div>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {showAddressForm ? "Cancel" : "Add Address"}
                  </button>
                </div>

                {/* Address Form */}
                {showAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-gray-800 p-6 rounded-xl mb-6"
                  >
                    <h4 className="text-lg font-semibold text-white mb-4">
                      {editingAddress ? "Edit Address" : "Add New Address"}
                    </h4>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={addressForm.name}
                            onChange={handleAddressChange}
                            placeholder="Enter full name"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={addressForm.email}
                            onChange={handleAddressChange}
                            placeholder="Enter email"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">Phone</label>
                          <input
                            type="text"
                            name="phone"
                            value={addressForm.phone}
                            onChange={handleAddressChange}
                            placeholder="Enter phone number"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">Address</label>
                          <input
                            type="text"
                            name="address"
                            value={addressForm.address}
                            onChange={handleAddressChange}
                            placeholder="Enter street address"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">City</label>
                          <input
                            type="text"
                            name="city"
                            value={addressForm.city}
                            onChange={handleAddressChange}
                            placeholder="Enter city"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2 text-sm font-medium">State</label>
                          <input
                            type="text"
                            name="state"
                            value={addressForm.state}
                            onChange={handleAddressChange}
                            placeholder="Enter state"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-gray-300 mb-2 text-sm font-medium">ZIP Code</label>
                          <input
                            type="text"
                            name="zip_code"
                            value={addressForm.zip_code}
                            onChange={handleAddressChange}
                            placeholder="Enter ZIP code"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {editingAddress ? "Update Address" : "Save Address"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelAddressForm}
                          className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Address List */}
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-400 mb-4">No addresses added yet.</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-full font-semibold transition-all duration-300"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <motion.div
                        key={addr.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-white font-semibold text-lg">{addr.name}</p>
                              {addr.is_default && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-2">
                              <span className="text-gray-300">📧</span> {addr.email} | <span className="text-gray-300">📞</span> {addr.phone}
                            </p>
                            <p className="text-gray-400 text-sm">
                              <span className="text-gray-300">📍</span> {addr.address}, {addr.city}, {addr.state} - {addr.zip_code}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all duration-300"
                              title="Edit Address"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-all duration-300"
                              title="Delete Address"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-8">
            {/* Account Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Account Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Total Orders</span>
                  <span className="text-white font-semibold">{totalOrders}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Wishlist Items</span>
                  <span className="text-white font-semibold">{totalWishlist}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Addresses</span>
                  <span className="text-white font-semibold">{addresses.length}</span>
                </div>
              </div>
            </motion.div>

            {/* Security Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Security Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Email Verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Account Active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Last Updated</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/edit-profile")}
                className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Manage Security
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}