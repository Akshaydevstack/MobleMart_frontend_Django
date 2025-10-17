// src/API/ProductService.js
import api from "../API/axios"; // your axios instance

// ✅ Get all products
export const getProducts = async ({
  brandId = null,
  priceGte = null,
  priceLte = null,
  search = "",
  ordering = "",
  page = 1
} = {}) => {
  try {
    const params = {};
    if (brandId) params['brand__id'] = brandId;
    if (priceGte !== null) params['price__gte'] = priceGte;
    if (priceLte !== null) params['price__lte'] = priceLte;
    if (search) params['search'] = search;
    if (ordering) params['ordering'] = ordering;
    if (page) params['page'] = page;

    const res = await api.get("products/", { params });
    return res.data; // { results: [], total_pages: n }
  } catch (err) {
    console.error("Failed to fetch products:", err.response?.data || err.message);
    return { results: [], total_pages: 1 };
  }
};



// ✅ Get single product by id
export const getProductById = async (id) => {
  try {
    const res = await api.get(`products/${id}/`);
    return res.data;
  } catch (err) {
    console.error(`Failed to fetch product ${id}:`, err.response?.data || err.message);
    return null;
  }
};

// ✅ Create a new product (single or multiple)
export const createProducts = async (products) => {
  try {
    // products can be an object or an array
    const res = await api.post("products/", products);
    return res.data;
  } catch (err) {
    console.error("Failed to create product(s):", err.response?.data || err.message);
    return null;
  }
};

// ✅ Update a product by id
export const updateProduct = async (id, updatedData) => {
  try {
    const res = await api.put(`products/${id}/`, updatedData);
    return res.data;
  } catch (err) {
    console.error(`Failed to update product ${id}:`, err.response?.data || err.message);
    return null;
  }
};

// ✅ Delete a product by id
export const deleteProduct = async (id) => {
  try {
    await api.delete(`products/${id}/`);
    return true;
  } catch (err) {
    console.error(`Failed to delete product ${id}:`, err.response?.data || err.message);
    return false;
  }
};