import axios from "axios";


// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api/", // your DRF backend
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // send HttpOnly cookies automatically
});


// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor to handle access token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Request new access token (using HttpOnly cookie)
        const res = await api.post("users/refresh/");
        const newAccess = res.data.access;
        localStorage.setItem("access_token", newAccess);

        // Retry the original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh failed, logout via context or state
        localStorage.removeItem("access_token");

        // Instead of full page reload, navigate using react-router
        window.dispatchEvent(
          new CustomEvent("logout", { detail: "token_expired" })
        );

        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;