import axios from "axios";
import { ProductApi } from "../Data/Api_EndPoint";

export async function GetProduct() {
  try {
    const response = await axios.get(ProductApi);
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
