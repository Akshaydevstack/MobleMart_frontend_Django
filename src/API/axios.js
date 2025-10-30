import axios from "axios";

 const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ send cookies automatically (for HttpOnly)
});

// ✅ Request interceptor — attach access token
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


// ✅ Response interceptor — refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🚫 Prevent infinite loop for refresh endpoint
    if (originalRequest.url.includes("users/refresh/")) {
      return Promise.reject(error);
    }

    // ✅ Handle expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (which reads HttpOnly cookie)
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}users/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccess = res.data.access;
        if (newAccess) {
          localStorage.setItem("access_token", newAccess);
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
          return api(originalRequest); // retry original request
        }
      } catch (refreshErr) {
        console.error("Refresh token failed:", refreshErr);
        localStorage.removeItem("access_token");
        window.dispatchEvent(new CustomEvent("logout", { detail: "token_expired" }));
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;