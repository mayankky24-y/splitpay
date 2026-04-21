import axios from "axios";
import type { Receipt } from "../models/receipt";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${
  import.meta.env.VITE_API_VERSION
}`;

export const ReceiptService = {
  async postReceipt(file: File): Promise<Receipt> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${BASE_URL}/receipt`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
