import axios from "axios";
import { UserApi } from "../Data/Api_EndPoint";

export default async function UserRegister(formData) {
  try {
    const response = await axios.post(UserApi, formData);
    return response.data;  
  } catch (err) {
    console.error("Registration failed:", err.message);
    throw err; 
  }
}