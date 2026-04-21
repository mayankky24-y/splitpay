import axios from "axios";
import type { User } from "../models/user";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${
  import.meta.env.VITE_API_VERSION
}`;

export const UserService = {
  async registerUser(user: User) {
    try {
      const response = await axios.post(`${BASE_URL}/users/`, {
        wallet_address: user.wallet_address,
      });
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.error || "Unknown error occurred";
        throw new Error(errorMessage);
      } else {
        throw new Error("Unexpected error");
      }
    }
  },
  async getRate(): Promise<number> {
    try {
      const response = await axios.get(`${BASE_URL}/get-rate`);
      return response.data.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.error || "Unknown error occurred";
        throw new Error(errorMessage);
      } else {
        throw new Error("Unexpected error");
      }
    }
  },
};
