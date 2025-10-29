import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiX,
  FiCheck,
  FiImage,
  FiFilter,
  FiUpload,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../API/axios";

// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = "dxsimc9dz";
export const CLOUDINARY_UPLOAD_PRESET = "ml_default";
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Upload Constants
const MAX_FILE_SIZE_MB = 2; // maximum size per image
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(getEmptyProduct());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandDescription, setNewBrandDescription] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    next: null,
    previous: null,
  });
  const [stats, setStats] = useState({
    total_products: 0,
    active_products: 0,
    outofstock: 0,
    lowstock: 0,
    inactive: 0,
    upcoming_products: 0,
  });

  // Cloudinary Image Upload Function
  const handleImageUpload = async (files) => {
    const validFiles = [];

    // Validate files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`❌ ${file.name} is not a valid image type.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`⚠️ ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadingImages(true);

    const uploadedUrls = [];
    for (const file of validFiles) {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      try {
        const res = await axios.post(CLOUDINARY_URL, uploadFormData);
        uploadedUrls.push(res.data.secure_url);
        toast.success(`✅ ${file.name} uploaded successfully`);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        toast.error(`❌ Failed to upload ${file.name}`);
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }));

    setUploadingImages(false);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleImageUpload(files);
    }
    // Reset input
    e.target.value = '';
  };

  // Handle drag and drop - FIXED
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  // Handle drag over - FIXED
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle removing individual image
  const handleRemoveImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  // Debounced search function
  const debouncedLoadProducts = useCallback(
    debounce(
      async (
        page = 1,
        searchTerm = "",
        brand = "all",
        stock = "all",
        active = "all"
      ) => {
        try {
          setLoading(true);
          const params = { page };
          if (searchTerm) params.search = searchTerm;
          if (brand !== "all") params.brand_id = brand;
          if (stock !== "all") params.stock = stock;
          if (active !== "all") {
            if (active === "upcoming") {
              params.upcoming = true;
            } else {
              params.active = active === "active";
            }
          }

          const res = await api.get("admin/manage-products/", { params });

          setProducts(res.data.results);
          setPagination({
            current_page: res.data.current_page,
            total_pages: res.data.total_pages,
            next: res.data.next,
            previous: res.data.previous,
          });
          setStats({
            total_products: res.data.total_products,
            active_products: res.data.active_products,
            outofstock: res.data.outofstock,
            lowstock: res.data.lowstock,
            inactive: res.data.inactive || 0,
            upcoming_products: res.data.upcoming_products || 0,
          });
        } catch (err) {
          console.error("Error loading products", err);
        } finally {
          setLoading(false);
        }
      },
      500
    ),
    []
  );

  useEffect(() => {
    loadBrands();
    debouncedLoadProducts(1, search, brandFilter, stockFilter, activeFilter);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedLoadProducts.cancel();
    };
  }, [debouncedLoadProducts]);

  const loadBrands = async () => {
    try {
      const res = await api.get("admin/manage-products/?brands=true");
      setBrands(res.data);
    } catch (err) {
      console.error("Error loading brands", err);
    }
  };

  function getEmptyProduct() {
    return {
      brand: "",
      name: "",
      price: "",
      description: "",
      count: 0,
      is_active: true,
      upcoming: false,
      images: [],
    };
  }

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setFormData({
      brand: product.brand_detail.id,
      name: product.name,
      price: product.price,
      description: product.description,
      count: product.count,
      is_active: product.is_active,
      upcoming: product.upcoming,
      images: product.image_urls || product.images || [],
    });
    setShowNewBrandInput(false);
    setNewBrandName("");
    setNewBrandDescription("");
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData(getEmptyProduct());
    setShowNewBrandInput(false);
    setNewBrandName("");
    setNewBrandDescription("");
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let brandData;

      if (showNewBrandInput && newBrandName.trim()) {
        brandData = {
          name: newBrandName.trim(),
          description: newBrandDescription.trim(),
        };
      } else {
        brandData = parseInt(formData.brand);
      }

      // Prepare data for API - matching your required structure
      const apiData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price).toFixed(2),
        count: parseInt(formData.count),
        upcoming: formData.upcoming,
        is_active:formData.is_active,
        brand: brandData,
        images: formData.images, // Array of Cloudinary URLs
      };

      console.log("Saving product:", apiData); // Debug log

      if (editingProduct) {
        await api.patch(`admin/manage-products/${editingProduct}/`, apiData);
        toast.success("Product updated successfully!");
      } else {
        await api.post(`admin/manage-products/`, apiData);
        toast.success("Product created successfully!");
      }

      await debouncedLoadProducts(
        pagination.current_page,
        search,
        brandFilter,
        stockFilter,
        activeFilter
      );
      setIsFormOpen(false);

      if (showNewBrandInput && newBrandName.trim()) {
        await loadBrands();
      }
    } catch (err) {
      console.error("Error saving product", err);
      if (err.response?.data) {
        toast.error(`Error: ${JSON.stringify(err.response.data)}`);
      } else {
        toast.error("Error saving product");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setLoading(true);
        await api.delete(`admin/manage-products/${id}/`);
        await debouncedLoadProducts(
          pagination.current_page,
          search,
          brandFilter,
          stockFilter,
          activeFilter
        );
        toast.success("Product deleted successfully!");
      } catch (err) {
        console.error("Error deleting product", err);
        if (err.response?.data) {
          toast.error(`Error: ${JSON.stringify(err.response.data)}`);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle filter changes with debouncing
  const handleSearchChange = (value) => {
    setSearch(value);
    debouncedLoadProducts(1, value, brandFilter, stockFilter, activeFilter);
  };

  const handleBrandFilterChange = (value) => {
    setBrandFilter(value);
    debouncedLoadProducts(1, search, value, stockFilter, activeFilter);
  };

  const handleStockFilterChange = (value) => {
    setStockFilter(value);
    debouncedLoadProducts(1, search, brandFilter, value, activeFilter);
  };

  const handleActiveFilterChange = (value) => {
    setActiveFilter(value);
    debouncedLoadProducts(1, search, brandFilter, stockFilter, value);
  };

  const clearAllFilters = () => {
    setSearch("");
    setBrandFilter("all");
    setStockFilter("all");
    setActiveFilter("all");
    debouncedLoadProducts(1, "", "all", "all", "all");
  };

  const loadPage = (page) => {
    debouncedLoadProducts(page, search, brandFilter, stockFilter, activeFilter);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - unchanged */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-6 rounded-3xl shadow-lg"
        >
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">
              Product Management
            </h1>
            <p className="text-sm text-gray-400">
              Manage your product inventory
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            {/* Active Status Filter */}
            <select
              value={activeFilter}
              onChange={(e) => handleActiveFilterChange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="upcoming">Upcoming</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => handleStockFilterChange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>

            <select
              value={brandFilter}
              onChange={(e) => handleBrandFilterChange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl shadow transition"
            >
              <FiPlus /> Add Product
            </button>
          </div>
        </motion.div>

        {/* Stats Cards - unchanged */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Total Products */}
          <motion.div
            onClick={() => {
              setStockFilter("all");
              setActiveFilter("all");
              debouncedLoadProducts(1, search, brandFilter, "all", "all");
            }}
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg cursor-pointer"
          >
            <div className="text-gray-400 text-sm">Total Products</div>
            <div className="text-3xl font-bold text-yellow-400">
              {stats.total_products}
            </div>
          </motion.div>

          {/* Active Products */}
          <motion.div
            onClick={() => {
              setStockFilter("all");
              setActiveFilter("active");
              debouncedLoadProducts(1, search, brandFilter, "all", "active");
            }}
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg cursor-pointer"
          >
            <div className="text-gray-400 text-sm">Active Products</div>
            <div className="text-3xl font-bold text-green-400">
              {stats.active_products}
            </div>
          </motion.div>

          {/* Inactive Products */}
          <motion.div
            onClick={() => {
              setStockFilter("all");
              setActiveFilter("inactive");
              debouncedLoadProducts(1, search, brandFilter, "all", "inactive");
            }}
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg cursor-pointer"
          >
            <div className="text-gray-400 text-sm">Inactive Products</div>
            <div className="text-3xl font-bold text-red-500">
              {stats.inactive}
            </div>
          </motion.div>

          {/* Upcoming Products */}
          <motion.div
            onClick={() => {
              setStockFilter("all");
              setActiveFilter("upcoming");
              debouncedLoadProducts(1, search, brandFilter, "all", "upcoming");
            }}
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg cursor-pointer"
          >
            <div className="text-gray-400 text-sm">Upcoming Products</div>
            <div className="text-3xl font-bold text-blue-400">
              {stats.upcoming_products}
            </div>
          </motion.div>

          {/* Out of Stock */}
          <motion.div
            onClick={() => {
              setActiveFilter("all");
              setStockFilter("out");
              debouncedLoadProducts(1, search, brandFilter, "out", "all");
            }}
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg cursor-pointer"
          >
            <div className="text-gray-400 text-sm">Out of Stock</div>
            <div className="text-3xl font-bold text-red-400">
              {stats.outofstock}
            </div>
          </motion.div>

          {/* Low Stock */}
          <motion.div
            onClick={() => {
              setActiveFilter("all");
              setStockFilter("low");
              debouncedLoadProducts(1, search, brandFilter, "low", "all");
            }}
            whileHover={{ y: -3 }}
            className="bg-gray-900 p-6 rounded-3xl shadow-lg cursor-pointer"
          >
            <div className="text-gray-400 text-sm">Low Stock</div>
            <div className="text-3xl font-bold text-orange-400">
              {stats.lowstock}
            </div>
          </motion.div>
        </div>

        {/* Active Filters - unchanged */}
        {(search ||
          brandFilter !== "all" ||
          stockFilter !== "all" ||
          activeFilter !== "all") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex items-center gap-3"
          >
            <FiFilter className="text-yellow-400" />
            <span className="text-sm text-gray-300">
              Active filters:
              {search && (
                <span className="ml-1 px-2 py-1 bg-gray-700 rounded-md text-yellow-400">
                  Search: "{search}"
                </span>
              )}
              {brandFilter !== "all" && (
                <span className="ml-1 px-2 py-1 bg-gray-700 rounded-md text-yellow-400">
                  Brand:{" "}
                  {brands.find((b) => b.id == brandFilter)?.name || brandFilter}
                </span>
              )}
              {stockFilter !== "all" && (
                <span className="ml-1 px-2 py-1 bg-gray-700 rounded-md text-yellow-400">
                  {stockFilter === "low" && "Low Stock"}
                  {stockFilter === "out" && "Out of Stock"}
                </span>
              )}
              {activeFilter !== "all" && (
                <span className="ml-1 px-2 py-1 bg-gray-700 rounded-md text-yellow-400">
                  {activeFilter === "active" && "Active Products"}
                  {activeFilter === "inactive" && "Inactive Products"}
                  {activeFilter === "upcoming" && "Upcoming Products"}
                </span>
              )}
            </span>
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <FiX size={14} /> Clear all
            </button>
          </motion.div>
        )}

        {/* Product Table - unchanged */}
        {loading && !isFormOpen ? (
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
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Stock
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
                  {products.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{
                        backgroundColor: "rgba(253, 224, 71, 0.1)",
                      }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-400">
                            {(pagination.current_page - 1) * 10 + index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.image_urls && product.image_urls[0] ? (
                            <img
                              className="h-10 w-10 rounded-md object-cover mr-3"
                              src={product.image_urls[0]}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-800 rounded-md flex items-center justify-center mr-3">
                              <FiImage className="text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-100">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-100">
                        {product.brand_detail.name}
                      </td>
                      <td className="px-6 py-4 text-yellow-400">
                        ₹{parseFloat(product.price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm ${
                            product.count > 0
                              ? product.count < 10
                                ? "text-orange-400"
                                : "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {product.count} in stock
                          {product.count > 0 && product.count < 10 && " (Low)"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.upcoming
                              ? "bg-blue-400/20 text-blue-300"
                              : product.is_active
                              ? "bg-green-400/20 text-green-300"
                              : "bg-red-400/20 text-red-300"
                          }`}
                        >
                          {product.upcoming ? "Upcoming" : product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-yellow-400 hover:text-yellow-500"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
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

            {/* Pagination - unchanged */}
            {pagination.total_pages > 1 && (
              <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Page {pagination.current_page} of {pagination.total_pages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadPage(pagination.current_page - 1)}
                      disabled={!pagination.previous}
                      className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => loadPage(pagination.current_page + 1)}
                      disabled={!pagination.next}
                      className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit/Add Form Modal - FIXED */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                  <h2 className="text-2xl font-bold text-yellow-400">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Brand Selection */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-400">
                          Brand
                        </label>
                        {!showNewBrandInput ? (
                          <div className="flex gap-2">
                            <select
                              value={formData.brand}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  brand: e.target.value,
                                })
                              }
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            >
                              <option value="">Select Brand</option>
                              {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                  {brand.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setShowNewBrandInput(true)}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              New Brand
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="New Brand Name"
                                value={newBrandName}
                                onChange={(e) =>
                                  setNewBrandName(e.target.value)
                                }
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setShowNewBrandInput(false);
                                  setNewBrandName("");
                                  setNewBrandDescription("");
                                }}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                            <textarea
                              placeholder="Brand Description (optional)"
                              value={newBrandDescription}
                              onChange={(e) =>
                                setNewBrandDescription(e.target.value)
                              }
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-400">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-400">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-400">
                          Stock Count
                        </label>
                        <input
                          type="number"
                          value={formData.count}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              count: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-400">
                          Status
                        </label>
                        <div className="flex items-center mt-1">
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
                              Active Product
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-400">
                          Product Type
                        </label>
                        <div className="flex items-center mt-1">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.upcoming}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  upcoming: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-blue-400 bg-gray-800 border-gray-700 rounded focus:ring-blue-400"
                            />
                            <span className="ml-2 text-sm text-gray-300">
                              Upcoming Product
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-400">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Cloudinary Image Upload - FIXED */}
                  <div className="w-full md:w-1/3 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-400">
                        Product Images ({formData.images.length} images)
                      </label>
                      
                      {/* Drag & Drop Upload Area - FIXED */}
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors cursor-pointer"
                      >
                        <FiUpload className="mx-auto text-gray-400 mb-3" size={32} />
                        <p className="text-lg text-gray-300 mb-2">
                          {uploadingImages ? 'Uploading...' : 'Drag & drop images here'}
                        </p>
                        <p className="text-sm text-gray-400 mb-3">
                          or click to browse files
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                          id="image-upload"
                          disabled={uploadingImages}
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-block px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg cursor-pointer hover:bg-yellow-500 transition-colors"
                        >
                          Select Images
                        </label>
                        <p className="text-xs text-gray-500 mt-3">
                          Supports JPG, PNG, WebP • Max {MAX_FILE_SIZE_MB}MB per image
                        </p>
                      </div>

                      {/* Upload Progress */}
                      {uploadingImages && (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-400">Uploading images to Cloudinary...</p>
                        </div>
                      )}

                      {/* Image Preview Grid */}
                      <div className="h-48 bg-gray-800 border border-gray-700 rounded-lg overflow-y-auto p-2">
                        {formData.images.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {formData.images.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-20 object-cover rounded border border-gray-600"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <FiImage size={48} className="opacity-50 mx-auto mb-2" />
                              <p className="text-sm">No images uploaded</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Count Info */}
                      <div className="text-xs text-gray-400">
                        {formData.images.length} image(s) uploaded. Drag & drop or click to add more.
                      </div>
                    </div>
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
                    disabled={
                      loading ||
                      uploadingImages ||
                      (!showNewBrandInput && !formData.brand) ||
                      (showNewBrandInput && !newBrandName.trim())
                    }
                    className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    ) : (
                      <FiCheck />
                    )}
                    Save Product
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