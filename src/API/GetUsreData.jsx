import axios from "axios";
import { UserApi } from "../Data/Api_EndPoint";

export async function GetUserData() {
  try {
    const response = await axios.get(UserApi);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
