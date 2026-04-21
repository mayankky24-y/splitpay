import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, X, Check, Search, FileText } from "lucide-react";
import type { Friend } from "../models/friend";
import { FriendService } from "../services/friendService";
import { BillService } from "../services/billService";
import { useWallet } from "../contexts/WalletContext";
import type { ReceiptItem } from "../models/receipt-item";
import type { Participant } from "../models/participant";
import type { Receipt } from "../models/receipt";
import { UserService } from "../services/userService";

interface BillProps {
  receipt: Receipt;
  onBack?: () => void;
  onSave?: (receipt: Receipt) => void;
}

const Bill: React.FC<BillProps> = ({ receipt, onSave }) => {
  const navigate = useNavigate();
  const [HBAR_RATE, setHBAR_RATE] = useState(0);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const { accountId } = useWallet();

  const currentUserFriend: Friend = {
    ID: "current_user",
    friend_wallet_address: accountId || "",
    nickname: "You",
  };

  useEffect(() => {
    const initializedItems = receipt.items.map((item) => ({
      ...item,
    }));
    setReceiptItems(initializedItems);
  }, [receipt.items]);

  useEffect(() => {
    const fetchHBARRate = async () => {
      try {
        const rate = await UserService.getRate();
        console.log("Fetched HBAR rate:", rate);
        setHBAR_RATE(rate);
      } catch (error) {
        console.error("Failed to fetch HBAR rate:", error);
      }
    };

    fetchHBARRate();
  }, []);

  useEffect(() => {
    if (showFriendSelector) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showFriendSelector]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);

        if (!accountId) {
          console.error("No wallet connected");
          return;
        }

        const friends = await FriendService.getFriends(accountId);
        setFriends(friends);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [accountId]);

  const assignFriendToItem = (itemIndex: number, friend: Friend) => {
    setReceiptItems((prev) => {
      const newItems = [...prev];
      const item = newItems[itemIndex];

      if (!item.participants) item.participants = [];

      const participant: Participant = {
        participantId: friend.friend_wallet_address,
        isPaid: "",
      };

      if (
        !item.participants.some(
          (p) => p.participantId === friend.friend_wallet_address
        )
      ) {
        item.participants.push(participant);
      }

      return newItems;
    });
  };

  const removeFriendFromItem = (
    itemIndex: number,
    friendWalletAddress: string
  ) => {
    setReceiptItems((prev) => {
      const newItems = [...prev];
      const item = newItems[itemIndex];

      if (!item.participants) item.participants = [];

      item.participants = item.participants.filter(
        (participant) => participant.participantId !== friendWalletAddress
      );

      return newItems;
    });
  };

  const calculateFriendTotal = (friendWalletAddress: string) => {
    let subtotalPortion = 0;

    for (const item of receiptItems) {
      if (!item.participants) continue;

      const isParticipant = item.participants.find(
        (p) => p.participantId === friendWalletAddress
      );

      if (isParticipant) {
        const portionPerParticipant = item.price / item.participants.length;
        subtotalPortion += portionPerParticipant;
      }
    }

    const totalSubtotal = receiptItems.reduce(
      (sum, item) => sum + item.price,
      0
    );
    const taxPortion =
      totalSubtotal > 0 ? (subtotalPortion / totalSubtotal) * receipt.tax : 0;

    return subtotalPortion + taxPortion;
  };

  const subtotal = receipt.items.reduce((sum, item) => sum + item.price, 0);

  const grandTotal = subtotal + receipt.tax;

  const allParticipants = [currentUserFriend, ...friends];
  console.log(friends);
  const filteredFriends = allParticipants.filter(
    (friend) =>
      (friend.nickname?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      friend.friend_wallet_address
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowFriendSelector(false);
      setSelectedItem(null);
      setSearchQuery("");
      setIsClosing(false);
    }, 300);
  };

  const handleContinueToPayment = async () => {
    try {
      const updatedReceipt = {
        ...receipt,
        items: receiptItems,
      };

      await BillService.updateBill(updatedReceipt);

      onSave?.(updatedReceipt);

      navigate(`/created-bills`);
    } catch (error) {
      console.error("Failed to update bill:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl w-full mx-auto -mt-4">
        <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-white">Loading friends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto -mt-4">
      <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 px-6 py-4 border-b border-white/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="w-6 h-6 text-purple-300" />
            </div>
            {receipt.storeName}
          </h3>
          <p className="text-purple-200 text-sm ml-[3.35rem]">
            {receipt.items.length} items •{" "}
            {new Date(receipt.billDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-8">
            <h4 className="text-lg font-semibold text-white mb-4">
              Assign Items
            </h4>
            {receipt.items.map((item, itemIndex) => {
              const itemWithParticipants = receiptItems[itemIndex];
              const assignedParticipants =
                itemWithParticipants?.participants || [];

              return (
                <div
                  key={itemIndex}
                  className="bg-white/5 rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="text-white font-semibold text-lg">
                        {item.name}
                      </h5>
                      <p className="text-purple-200 text-sm">
                        {item.quantity}× ${item.price.toFixed(2)} = $
                        {item.price.toFixed(2)} (
                        {(item.price * HBAR_RATE).toFixed(2)} ℏ)
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItem(itemIndex);
                        setShowFriendSelector(true);
                      }}
                      className="p-2.5 rounded-lg bg-white/10 text-purple-300 hover:bg-white/20 hover:text-purple-200 transition-all duration-200 border border-white/10 hover:border-white/30 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>

                  {assignedParticipants.length > 0 ? (
                    <div className="space-y-2">
                      {assignedParticipants.map((participant) => {
                        const portion = participant
                          ? itemWithParticipants.price /
                            assignedParticipants.length
                          : 0;

                        const itemTaxPortion =
                          (itemWithParticipants.price / subtotal) * receipt.tax;

                        const taxPerParticipant =
                          itemTaxPortion / assignedParticipants.length;
                        const totalWithTax = portion + taxPerParticipant;

                        const correspondingFriend = allParticipants.find(
                          (f) =>
                            f.friend_wallet_address ===
                            participant.participantId
                        );

                        const isCurrentUser =
                          correspondingFriend?.ID === "current_user";

                        return (
                          <div
                            key={participant.participantId}
                            className={`flex items-center justify-between rounded-lg p-3 animate-in slide-in-from-left duration-200 ${
                              isCurrentUser
                                ? "bg-fuchsia-600/20 border border-fuchsia-500/50 shadow-lg shadow-fuchsia-500/20"
                                : "bg-white/10"
                            }`}
                          >
                            <div>
                              <span
                                className={`font-medium ${
                                  isCurrentUser
                                    ? "text-fuchsia-100"
                                    : "text-white"
                                }`}
                              >
                                {correspondingFriend?.nickname ||
                                  participant.participantId}
                              </span>
                              <span
                                className={`text-sm ml-2 ${
                                  isCurrentUser
                                    ? "text-fuchsia-200"
                                    : "text-purple-200"
                                }`}
                              >
                                ${totalWithTax.toFixed(2)} ($
                                {portion.toFixed(2)} + Fees $
                                {taxPerParticipant.toFixed(2)}) (
                                {(totalWithTax * HBAR_RATE).toFixed(2)} ℏ)
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                removeFriendFromItem(
                                  itemIndex,
                                  participant.participantId
                                )
                              }
                              className={`p-1 rounded cursor-pointer ${
                                isCurrentUser
                                  ? "text-fuchsia-100 hover:bg-fuchsia-600/30"
                                  : "text-white hover:bg-white/20"
                              }`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-3 border-2 border-dashed border-white/20 rounded-lg">
                      <p className="text-white/60 text-sm">
                        No friends assigned
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Summary</h4>

            <div className="space-y-2 mb-4">
              {allParticipants.map((friend) => {
                const total = calculateFriendTotal(
                  friend.friend_wallet_address
                );
                if (total === 0) return null;

                const isCurrentUser = friend.ID === "current_user";

                return (
                  <div
                    key={friend.friend_wallet_address}
                    className="flex justify-between items-center text-lg"
                  >
                    <span
                      className={`font-semibold ${
                        isCurrentUser ? "text-fuchsia-100" : "text-purple-200"
                      }`}
                    >
                      {friend.nickname}
                    </span>
                    <span
                      className={`font-semibold ${
                        isCurrentUser ? "text-fuchsia-100" : "text-purple-200"
                      }`}
                    >
                      ${total.toFixed(2)} ({(total * HBAR_RATE).toFixed(2)} ℏ)
                    </span>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-white">
                  <span className="font-semibold text-lg">Subtotal</span>
                  <span className="font-semibold text-lg">
                    ${subtotal.toFixed(2)} ({(subtotal * HBAR_RATE).toFixed(2)}{" "}
                    ℏ)
                  </span>
                </div>

                <div className="flex justify-between items-center text-purple-200">
                  <span className="font-semibold text-lg">Tax & Fees</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg bg-gradient-to-r">
                      ${receipt.tax.toFixed(2)} (
                      {(receipt.tax * HBAR_RATE).toFixed(2)} ℏ)
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg text-white">
                    Total
                  </span>
                  <span className="font-semibold text-lg bg-gradient-to-r text-white">
                    ${grandTotal.toFixed(2)} (
                    {(grandTotal * HBAR_RATE).toFixed(2)} ℏ)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleContinueToPayment}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {showFriendSelector && selectedItem !== null && (
        <>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
            }
            @keyframes slideIn {
              from { 
                opacity: 0;
                transform: scale(0.9) translateY(20px);
              }
              to { 
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            @keyframes slideOut {
              from { 
                opacity: 1;
                transform: scale(1) translateY(0);
              }
              to { 
                opacity: 0;
                transform: scale(0.9) translateY(20px);
              }
            }
            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            style={{
              animation: isClosing
                ? "fadeOut 300ms ease-out forwards"
                : "fadeIn 300ms ease-out forwards",
            }}
          >
            <div
              className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl max-w-2xl w-full overflow-hidden"
              style={{
                animation: isClosing
                  ? "slideOut 300ms ease-out forwards"
                  : "slideIn 300ms ease-out forwards",
              }}
            >
              <div className="bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 px-8 py-5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-semibold text-white">
                    Select Participants
                  </h4>
                  <button
                    onClick={closeModal}
                    className="p-2.5 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search friends by name or wallet address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:border-purple-400 focus:bg-white/15 outline-none placeholder-white/50"
                    autoFocus
                  />
                </div>

                <div className="h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredFriends.length > 0 ? (
                      filteredFriends.map((friend, index) => {
                        const isAssigned =
                          selectedItem !== null &&
                          receiptItems[selectedItem]?.participants?.some(
                            (p) =>
                              p.participantId === friend.friend_wallet_address
                          );

                        const isCurrentUser = friend.ID === "current_user";

                        return (
                          <button
                            key={friend.friend_wallet_address}
                            onClick={() => {
                              if (isAssigned) {
                                removeFriendFromItem(
                                  selectedItem,
                                  friend.friend_wallet_address
                                );
                              } else {
                                assignFriendToItem(selectedItem, friend);
                              }
                            }}
                            className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                              isAssigned
                                ? "bg-purple-600/20 border-purple-400/50 text-white shadow-lg shadow-purple-500/20"
                                : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10"
                            }`}
                            style={{
                              animationDelay: `${index * 30}ms`,
                              animation: "slideInUp 300ms ease-out forwards",
                            }}
                          >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg bg-gradient-to-br from-purple-400 to-fuchsia-400">
                              <span className="text-white font-bold text-lg">
                                {friend.nickname
                                  ? friend.nickname.charAt(0).toUpperCase()
                                  : "-"}
                              </span>
                            </div>

                            <div className="text-center flex-1">
                              <div className="font-semibold text-sm mb-1 truncate w-full">
                                {friend.nickname}
                              </div>
                              <div className="text-xs opacity-75 font-mono truncate w-full">
                                {isCurrentUser
                                  ? "Your wallet"
                                  : friend.friend_wallet_address}
                              </div>
                            </div>

                            {isAssigned && (
                              <div
                                className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg bg-purple-500
                                }`}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-3 text-center pb-20 pt-10">
                        <div className="p-">
                          <p className="text-white/60 text-lg">
                            No friends found matching your search
                          </p>
                          <p className="text-white/40 text-base mt-2">
                            Try adjusting your search terms
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Bill;
