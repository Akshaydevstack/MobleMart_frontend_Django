import api from "../API/axios";
import { jwtDecode } from "jwt-decode";


export const registerUser = async (username, email, password) => {
  const res = await api.post("users/register/", { username, email, password });

  const token = res.data.access; // ✅ define the token
  localStorage.setItem("access_token", token);

  // ✅ Decode token payload
  const decoded = jwtDecode(token);

  // ✅ Return user info extracted from token
  return {
    user_id: decoded.user_id,
    username: decoded.username,
    email: decoded.email,
    role: decoded.role,
  };
};


export const loginUser = async (email, password) => {
  try {
    const res = await api.post("users/login/", { email, password });
    const accessToken = res.data.access;

    if (!accessToken) return null; // if no token, return null

    localStorage.setItem("access_token", accessToken);

    let decoded;
    try {
      decoded = jwtDecode(accessToken);
    } catch (decodeError) {
      console.error("Token decode failed:", decodeError);
      return null;
    }

    return {
      user_id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      is_block: decoded.is_block || false,
    };
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return null;
  }
};



export const logoutUser = async () => {
  try {
    await api.post("users/logout/"); 
  } catch (err) {
    console.log(err);
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user")
  }
};