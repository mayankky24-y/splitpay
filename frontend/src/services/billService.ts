import axios from "axios";
import type { Receipt } from "../models/receipt";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${
  import.meta.env.VITE_API_VERSION
}`;

export const BillService = {
  async createBill(bill: Receipt) {
    bill.creatorId = localStorage.getItem("wallet_account_id") || "";
    try {
      const response = await axios.post(
        `${BASE_URL}/bills/bill-without-participant`,
        bill
      );
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

  async updateBill(bill: Receipt) {
    try {
      const response = await axios.patch(
        `${BASE_URL}/bills/update-bill`,
        bill
      );
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

  async deleteBill(billId: string) {
    try {
      const response = await axios.delete(
        `${BASE_URL}/bills/delete-bill/${billId}`
      );
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

  async getBillsByCreator(creatorId: string): Promise<Receipt[]> {
    try {
      const params = new URLSearchParams();
      params.append("creatorId", creatorId);

      const response = await axios.get(
        `${BASE_URL}/bills/by-creator?${params.toString()}`
      );
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

  async getBillsByCurrentCreator(): Promise<Receipt[]> {
    const creatorId = localStorage.getItem("wallet_account_id") || "";
    return this.getBillsByCreator(creatorId);
  },

  async getBillByBillId(billId: string): Promise<Receipt> {
    try {
      const response = await axios.get(`${BASE_URL}/bills/by-billId/${billId}`);
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

  async getBillsByParticipantId(participantId: string): Promise<Receipt[]> {
    try {
      const response = await axios.get(`${BASE_URL}/bills/by-participant/${participantId}`);
      return response.data.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error || "Unknown error occurred";
        throw new Error(errorMessage);
      } else {
        throw new Error("Unexpected error");
      }
    }
  },
};
