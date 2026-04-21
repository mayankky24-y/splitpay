import axios from "axios";
import type { User } from "../models/user";
import type { Friend } from "../models/friend";
import type { PendingFriend } from "../models/pending-friend";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${
  import.meta.env.VITE_API_VERSION
}`;

export const FriendService = {
  async addFriend(currUser: User, friend: User) {
    try {
      const response = await axios.post(`${BASE_URL}/friends/add`, {
        friend_wallet_address: friend.wallet_address,
        user_wallet_address: currUser.wallet_address,
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

  async getFriends(userWalletAddress: string): Promise<Friend[]> {
    try {
      const response = await axios.get(
        `${BASE_URL}/friends/${userWalletAddress}`
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

  async getPendingFriends(userWalletAddress: string): Promise<PendingFriend[]> {
    try {
      const response = await axios.get(
        `${BASE_URL}/friends/get-pending-request/${userWalletAddress}`
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

  async getPendingRequests(
    userWalletAddress: string
  ): Promise<PendingFriend[]> {
    try {
      const response = await axios.get(
        `${BASE_URL}/friends/get-pending-request-by-friend/${userWalletAddress}`
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

  async addNickname(
    userWalletAddress: string,
    friendWalletAddress: string,
    nickname: string
  ) {
    try {
      const response = await axios.post(`${BASE_URL}/friends/alias`, {
        friend_wallet_address: friendWalletAddress,
        nickname: nickname,
        user_wallet_address: userWalletAddress,
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

  async acceptRequest(id: string) {
    try {
      const response = await axios.post(`${BASE_URL}/friends/accept`, {
        id: id,
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

  async declineRequest(id: string) {
    try {
      const response = await axios.post(`${BASE_URL}/friends/decline`, {
        id: id,
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
};
