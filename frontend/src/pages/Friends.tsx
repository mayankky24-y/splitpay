import { UserPlus, Check, X, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useFriend } from "../contexts/FriendContext";
import { useWallet } from "../contexts/WalletContext";
import type { User } from "../models/user";

const Friends = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);
  const [friendWalletAddress, setFriendWalletAddress] = useState("");
  const [friendNickname, setFriendNickname] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [tabName, setTabName] = useState("Friends");
  const { accountId } = useWallet();
  const {
    addFriend,
    addNickname,
    acceptRequest,
    declineRequest,
    refreshFriendsData,
    friends,
    pendingFriends,
    pendingRequests,
    isLoading,
  } = useFriend();

  useEffect(() => {
    if (!errMsg) return;

    const timeout = setTimeout(() => {
      setErrMsg("");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [errMsg]);

  const handleAddFriend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const friendWalletAddress = e.currentTarget.FriendWalletAddress.value;

    const currUser: User = {
      wallet_address: accountId!,
    };

    const friend: User = {
      wallet_address: friendWalletAddress,
    };

    const error = await addFriend(currUser, friend);
    if (error != null) {
      setErrMsg(error);
    } else {
      setIsOpen(false);
      setErrMsg("");
      refreshFriendsData();
    }
  };

  const handleAddNickname = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nickname = e.currentTarget.Nickname.value;

    const error = await addNickname(accountId!, friendWalletAddress, nickname);
    if (error != null) {
      setErrMsg(error);
    } else {
      setIsOpen1(false);
      setErrMsg("");
      refreshFriendsData();
    }
  };

  const handleAcceptRequest = async (id: string) => {
    await acceptRequest(id);
    refreshFriendsData();
  };

  const handleDeclineRequest = async (id: string) => {
    await declineRequest(id);
    refreshFriendsData();
  };

  const LoadingSpinner = () => (
    <svg className="mr-2 size-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
      />
    </svg>
  );

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          Manage Friends
        </h2>
        <p className="text-purple-200 text-base md:text-lg">
          Add and manage your SplitPay friends
        </p>
      </div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="fixed inset-0 bg-black opacity-100"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 rounded-xl p-4 md:p-6 shadow-lg border border-white/10 w-full max-w-sm md:max-w-md">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-white">
              Add Friend
            </h2>
            <form onSubmit={handleAddFriend} className="flex flex-col gap-4">
              <label
                htmlFor="FriendWalletAddress"
                className="text-sm md:text-base"
              >
                Friend Wallet Address
              </label>
              <input
                type="text"
                name="FriendWalletAddress"
                placeholder="Input your Friend Wallet Address"
                className="bg-purple-800/30 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
              />
              {errMsg && (
                <div className="text-sm text-red-500 text-center">{errMsg}</div>
              )}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-4 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-purple-600/10 hover:bg-purple-600/40 transition-all text-white rounded-lg cursor-pointer text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-fuchsia-700/50 hover:bg-fuchsia-700/80 transition-all text-white rounded-lg cursor-pointer text-sm md:text-base"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOpen1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="fixed inset-0 bg-black opacity-100"
            onClick={() => setIsOpen1(false)}
          />
          <div className="relative bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 rounded-xl p-4 md:p-6 shadow-lg border border-white/10 w-full max-w-sm md:max-w-md">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-white">
              Edit Friend Nickname
            </h2>
            <form onSubmit={handleAddNickname} className="flex flex-col gap-4">
              <label htmlFor="Nickname" className="text-sm md:text-base">
                Friend Nickname
              </label>
              <input
                type="text"
                name="Nickname"
                placeholder="Input your Friend Nickname"
                className="bg-purple-800/30 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white text-sm md:text-base"
                defaultValue={friendNickname}
              />
              {errMsg && (
                <div className="text-sm text-red-500 text-center">{errMsg}</div>
              )}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-4 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen1(false)}
                  className="px-4 py-2 bg-purple-600/10 hover:bg-purple-600/40 transition-all text-white rounded-lg cursor-pointer text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-fuchsia-700/50 hover:bg-fuchsia-700/80 transition-all text-white rounded-lg cursor-pointer text-sm md:text-base"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-purple-800/30 rounded-xl p-4 md:p-6 border border-purple-600/30">
          {/* Header with tabs and add button */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="bg-purple-900 p-2 rounded-xl overflow-x-auto">
              <div className="flex gap-1 md:gap-2 min-w-max">
                {[
                  { key: "Friends", label: "Friends" },
                  { key: "Sent", label: "Sent" },
                  { key: "Requests", label: "Requests" },
                ].map((tab) => (
                  <div
                    key={tab.key}
                    className={`font-semibold py-2 px-2 md:px-4 rounded-lg transition duration-200 ease-in-out cursor-pointer text-xs md:text-sm whitespace-nowrap ${
                      tabName === tab.key
                        ? "bg-fuchsia-900"
                        : "hover:bg-purple-800/50"
                    }`}
                    onClick={() => {
                      setTabName(tab.key);
                      refreshFriendsData();
                    }}
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      <span>
                        {tab.key === "Requests"
                          ? "Received"
                          : tab.key === "Sent"
                          ? "Sent Requests"
                          : tab.label}
                      </span>
                      {tab.key === "Requests" &&
                        pendingRequests.length !== 0 && (
                          <div
                            className={`text-xs flex items-center justify-center min-w-[20px] h-5 rounded-full ${
                              tabName === "Requests"
                                ? "bg-fuchsia-700/80"
                                : "bg-fuchsia-700/50"
                            }`}
                          >
                            {pendingRequests.length}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Friend Button */}
            <button
              className="flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg hover:from-purple-500 hover:to-fuchsia-500 transition-all duration-300 text-sm md:text-base whitespace-nowrap"
              onClick={() => setIsOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Friend</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Content Area */}
          {tabName === "Friends" ? (
            <div className="flex flex-col gap-4">
              <div className="text-lg md:text-xl font-semibold">
                All Friends
              </div>
              <div className="space-y-3 md:space-y-4">
                {isLoading ? (
                  <div className="flex items-center p-4 bg-purple-900/30 rounded-lg justify-center">
                    <LoadingSpinner />
                  </div>
                ) : friends.length === 0 ? (
                  <div className="flex items-center p-4 bg-purple-900/30 rounded-lg justify-center">
                    <div className="text-sm text-purple-300">No Data</div>
                  </div>
                ) : (
                  friends.map((friend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 md:p-4 bg-purple-900/30 rounded-lg gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-purple-100 text-sm md:text-base">
                            {friend.nickname ?? "-"}
                          </div>
                          <div className="text-xs md:text-sm text-purple-300 truncate">
                            {friend.friend_wallet_address}
                          </div>
                        </div>
                      </div>
                      <button
                        className="p-2 md:p-3 bg-fuchsia-500/20 hover:bg-fuchsia-500/50 transition-all rounded-lg cursor-pointer flex-shrink-0"
                        onClick={() => {
                          setFriendNickname(friend.nickname);
                          setFriendWalletAddress(friend.friend_wallet_address);
                          setIsOpen1(true);
                        }}
                      >
                        <Pencil size={14} className="md:w-4 md:h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : tabName === "Sent" ? (
            <div className="flex flex-col gap-4">
              <div className="text-lg md:text-xl font-semibold">
                Friend Requests You Sent
              </div>
              <div className="space-y-3 md:space-y-4">
                {isLoading ? (
                  <div className="flex items-center p-4 bg-purple-900/30 rounded-lg justify-center">
                    <LoadingSpinner />
                  </div>
                ) : pendingFriends.length === 0 ? (
                  <div className="flex items-center p-4 bg-purple-900/30 rounded-lg justify-center">
                    <div className="text-sm text-purple-300">No Data</div>
                  </div>
                ) : (
                  pendingFriends.map((friend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 md:p-4 bg-purple-900/30 rounded-lg gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="text-xs md:text-sm text-purple-300 truncate">
                          {friend.friend_wallet_address}
                        </div>
                      </div>
                      <div
                        className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded-full whitespace-nowrap ${
                          friend.status === "Pending"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-red-800/50 text-red-300"
                        }`}
                      >
                        {friend.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-lg md:text-xl font-semibold">
                Friend Requests You Received
              </div>
              <div className="space-y-3 md:space-y-4">
                {isLoading ? (
                  <div className="flex items-center p-4 bg-purple-900/30 rounded-lg justify-center">
                    <LoadingSpinner />
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="flex items-center p-4 bg-purple-900/30 rounded-lg justify-center">
                    <div className="text-sm text-purple-300">No Data</div>
                  </div>
                ) : (
                  pendingRequests.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 md:p-4 bg-purple-900/30 rounded-lg gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="text-xs md:text-sm text-purple-300 truncate">
                          {req.user_wallet_address}
                        </div>
                      </div>
                      <div className="flex gap-2 md:gap-3 flex-shrink-0">
                        <button
                          className="p-2 md:px-3 md:py-2 bg-green-500/20 hover:bg-green-500/50 transition-all rounded-lg cursor-pointer"
                          onClick={() => handleAcceptRequest(req.id)}
                        >
                          <Check className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                          className="p-2 md:px-3 md:py-2 bg-red-500/20 hover:bg-red-500/50 transition-all rounded-lg cursor-pointer"
                          onClick={() => handleDeclineRequest(req.id)}
                        >
                          <X className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
