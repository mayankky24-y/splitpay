import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { FriendService } from "../services/friendService";
import type { User } from "../models/user";
import type { Friend } from "../models/friend";
import type { PendingFriend } from "../models/pending-friend";
import { useWallet } from "../contexts/WalletContext";

interface FriendContextType {
  addFriend: (currUser: User, friend: User) => Promise<string | null>;
  getFriends: (userWalletAddress: string) => Promise<Friend[]>;
  getPendingFriends: (userWalletAddress: string) => Promise<PendingFriend[]>;
  getPendingRequests: (userWalletAddress: string) => Promise<PendingFriend[]>;
  addNickname: (
    userWalletAddress: string,
    friendWalletAddress: string,
    nickname: string
  ) => Promise<string | null>;
  acceptRequest: (id: string) => Promise<void>;
  declineRequest: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshFriendsData: () => Promise<void>;
  friends: Friend[];
  pendingFriends: PendingFriend[];
  pendingRequests: PendingFriend[];
}

const FriendContext = createContext<FriendContextType>({
  addFriend: async () => null,
  getFriends: async () => [],
  getPendingFriends: async () => [],
  getPendingRequests: async () => [],
  addNickname: async () => null,
  acceptRequest: async () => {},
  declineRequest: async () => {},
  isLoading: false,
  error: null,
  refreshFriendsData: async () => {},
  friends: [],
  pendingFriends: [],
  pendingRequests: [],
});

export const FriendProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accountId } = useWallet();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingFriends, setPendingFriends] = useState<PendingFriend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingFriend[]>([]);

  const fetchFriends = async () => {
    const result = await getFriends(accountId!);
    setFriends(result);
  };

  const fetchPendingFriends = async () => {
    const result = await getPendingFriends(accountId!);
    setPendingFriends(result);
  };

  const fetchPendingRequests = async () => {
    const result = await getPendingRequests(accountId!);
    const filteredResult = result.filter((req) => req.status === "Pending");
    setPendingRequests(filteredResult);
  };

  const refreshFriendsData = useCallback(async () => {
    if (!accountId) return;

    try {
      await Promise.all([
        fetchFriends(),
        fetchPendingFriends(),
        fetchPendingRequests(),
      ]);
    } catch (err) {
      console.error("Error fetching friend data", err);
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    refreshFriendsData();
  }, [refreshFriendsData]);

  const addFriend = async (
    currUser: User,
    friend: User
  ): Promise<string | null> => {
    setError(null);
    try {
      await FriendService.addFriend(currUser, friend);
      return null;
    } catch (err: any) {
      setError(err.message);
      return err.message;
    }
  };

  const getFriends = async (userWalletAddress: string): Promise<Friend[]> => {
    setError(null);
    try {
      return await FriendService.getFriends(userWalletAddress);
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  const getPendingFriends = async (
    userWalletAddress: string
  ): Promise<PendingFriend[]> => {
    setError(null);
    try {
      return await FriendService.getPendingFriends(userWalletAddress);
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  const getPendingRequests = async (
    userWalletAddress: string
  ): Promise<PendingFriend[]> => {
    setError(null);
    try {
      return await FriendService.getPendingRequests(userWalletAddress);
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  const addNickname = async (
    userWalletAddress: string,
    friendWalletAddress: string,
    nickname: string
  ): Promise<string | null> => {
    setError(null);
    try {
      await FriendService.addNickname(
        userWalletAddress,
        friendWalletAddress,
        nickname
      );
      return null;
    } catch (err: any) {
      setError(err.message);
      return err.message;
    }
  };

  const acceptRequest = async (id: string) => {
    setError(null);
    try {
      await FriendService.acceptRequest(id);
      return null;
    } catch (err: any) {
      setError(err.message);
      return err.message;
    }
  };

  const declineRequest = async (id: string) => {
    setError(null);
    try {
      await FriendService.declineRequest(id);
      return null;
    } catch (err: any) {
      setError(err.message);
      return err.message;
    }
  };

  return (
    <FriendContext.Provider
      value={{
        addFriend,
        getFriends,
        getPendingFriends,
        getPendingRequests,
        addNickname,
        acceptRequest,
        declineRequest,
        isLoading,
        error,
        refreshFriendsData,
        friends,
        pendingFriends,
        pendingRequests,
      }}
    >
      {children}
    </FriendContext.Provider>
  );
};

export const useFriend = () => useContext(FriendContext);
