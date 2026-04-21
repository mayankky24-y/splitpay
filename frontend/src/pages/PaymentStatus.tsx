import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, Clock, FileText } from "lucide-react";
import { BillService } from "../services/billService";
import { UserService } from "../services/userService";
import { useWallet } from "../contexts/WalletContext";
import type { Receipt } from "../models/receipt";
import type { Friend } from "../models/friend";
import { FriendService } from "../services/friendService";
import { WalletService } from "../services/walletService";

const PaymentStatus = () => {
  const { billId } = useParams<{ billId: string }>();
  const { accountId } = useWallet();
  const [bill, setBill] = useState<Receipt | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [HBAR_RATE, setHBAR_RATE] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!billId || !accountId) return;

    try {
      setLoading(true);

      const billData = await BillService.getBillByBillId(billId);
      setBill(billData);

      const friendsData = await FriendService.getFriends(accountId);
      setFriends(friendsData);

      const rate = await UserService.getRate();
      setHBAR_RATE(rate);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [billId, accountId]);

  const calculateFriendTotal = (friendWalletAddress: string) => {
    if (!bill) return 0;

    const subtotal = bill.items.reduce((total, item) => {
      if (!item.participants) return total;
      const participantInItem = item.participants.find(
        (p) => p.participantId === friendWalletAddress
      );
      if (participantInItem) {
        const itemPrice = item.price;
        const portionPerParticipant = itemPrice / item.participants.length;
        return total + portionPerParticipant;
      }
      return total;
    }, 0);

    const totalSubtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
    const taxPortion =
      totalSubtotal > 0 ? (subtotal / totalSubtotal) * bill.tax : 0;

    return subtotal + taxPortion;
  };

  const calculateFriendTotalWithBreakdown = (friendWalletAddress: string) => {
    if (!bill) return { total: 0, serviceCharge: 0 };

    const subtotal = bill.items.reduce((total, item) => {
      if (!item.participants) return total;
      const participantInItem = item.participants.find(
        (p) => p.participantId === friendWalletAddress
      );
      if (participantInItem) {
        const itemPrice = item.price;
        const portionPerParticipant = itemPrice / item.participants.length;
        return total + portionPerParticipant;
      }
      return total;
    }, 0);

    const totalSubtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
    const taxPortion =
      totalSubtotal > 0 ? (subtotal / totalSubtotal) * bill.tax : 0;

    const baseTotal = subtotal + taxPortion;

    const isOwner = friendWalletAddress === bill.creatorId;
    const serviceCharge = isOwner ? 0 : baseTotal * 0.01;
    const total = baseTotal + serviceCharge;

    return { total, serviceCharge };
  };

  const getPaymentStatus = (friendWalletAddress: string) => {
    if (!bill) return "pending";

    if (friendWalletAddress === bill.creatorId) {
      return "paid";
    }

    const hasUnpaidItems = bill.items.some((item) => {
      if (!item.participants) return false;
      const participantInItem = item.participants.find(
        (p) => p.participantId === friendWalletAddress
      );
      return (
        participantInItem &&
        (!participantInItem.isPaid || participantInItem.isPaid === "")
      );
    });

    return hasUnpaidItems ? "pending" : "paid";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-300 border-green-400/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    }
  };

  const getParticipantDisplayName = (participantId: string) => {
    if (!participantId) {
      console.log("getParticipantDisplayName: participantId is empty");
      return "Unknown";
    }

    if (participantId === accountId) {
      console.log(
        "getParticipantDisplayName: returning 'You' for",
        participantId
      );
      return "You";
    }

    const friend = friends.find(
      (f) => f.friend_wallet_address === participantId
    );
    if (friend) {
      console.log(
        "getParticipantDisplayName: found friend",
        friend.nickname,
        "for",
        participantId
      );
      return friend.nickname;
    }

    console.log(
      "getParticipantDisplayName: returning 'Anonymous' for",
      participantId
    );
    return "Anonymous";
  };

  const getAllBillParticipants = () => {
    if (!bill) return [];

    const participantIds = new Set<string>();

    if (accountId) {
      participantIds.add(accountId);
    }

    bill.items.forEach((item) => {
      if (item.participants) {
        item.participants.forEach((participant) => {
          if (participant.participantId) {
            participantIds.add(participant.participantId);
          }
        });
      }
    });

    const participants = Array.from(participantIds).map((participantId) => {
      const displayName = getParticipantDisplayName(participantId);
      return {
        participantId,
        displayName,
        isCurrentUser: participantId === accountId,
      };
    });

    console.log("All participants:", participants);
    console.log("Friends:", friends);
    console.log("Account ID:", accountId);

    return participants;
  };

  const sendTransaction = async (
    toAddress: string,
    amount: number,
    serviceCharge: number
  ): Promise<string> => {
    console.log("Sending transaction to:", toAddress, "Amount:", amount);
    const transactionId = await WalletService.sendTransaction(
      toAddress,
      amount,
      serviceCharge
    );
    if (!transactionId) {
      throw new Error("Transaction failed");
    }
    return transactionId;
  };

  if (loading) {
    return (
      <div className="max-w-2xl w-full mx-auto -mt-4">
        <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-white">Loading payment status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="max-w-2xl w-full mx-auto -mt-4">
        <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="text-center">
            <p className="text-white">Bill not found</p>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = subtotal + bill.tax;
  const { total, serviceCharge } = calculateFriendTotalWithBreakdown(
    accountId!
  );
  const realTotal = calculateFriendTotal(accountId!);
  const hbarAmount = Math.floor(total * HBAR_RATE * 100) / 100;

  const realHbarAmount = Math.floor(realTotal * HBAR_RATE * 100) / 100;
  const serviceChargeHbar = Math.floor(serviceCharge * HBAR_RATE * 100) / 100;

  return (
    <div className="max-w-2xl w-full mx-auto -mt-4">
      <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-300" />
                  </div>
                  {bill.storeName}
                </h3>
                <p className="text-purple-200 text-sm ml-[3.35rem]">
                  {bill.items.length} items •{" "}
                  {new Date(bill.billDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Bill Details
            </h4>

            <div className="space-y-4">
              {bill.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="text-white font-semibold text-lg">
                        {item.name}
                      </h5>
                      <p className="text-purple-200 text-sm">
                        {item.quantity}× $
                        {(item.price / item.quantity).toFixed(2)} = $
                        {item.price.toFixed(2)} (
                        {(item.price * HBAR_RATE).toFixed(2)} ℏ)
                      </p>
                    </div>
                  </div>

                  {item.participants && item.participants.length > 0 ? (
                    <div className="space-y-2">
                      {item.participants.map((participant, pIndex) => {
                        const portion = item.price / item.participants.length;
                        const displayName = getParticipantDisplayName(
                          participant.participantId
                        );
                        const isCurrentUser =
                          participant.participantId === accountId;
                        const itemTax = (item.price / subtotal) * bill.tax;
                        const taxPerPerson = itemTax / item.participants.length;
                        const totalWithTax = portion + taxPerPerson;

                        return (
                          <div
                            key={pIndex}
                            className={`flex items-center justify-between rounded-lg p-3 ${
                              isCurrentUser
                                ? "bg-fuchsia-600/20 border border-fuchsia-500/50 shadow-lg shadow-fuchsia-500/20"
                                : "bg-white/10"
                            }`}
                          >
                            <div>
                              <span
                                className={`font-medium ${
                                  isCurrentUser
                                    ? "text-violet-200"
                                    : "text-white"
                                }`}
                              >
                                {displayName || "Anonymous"}
                              </span>
                              <span
                                className={`text-sm ml-2 ${
                                  isCurrentUser
                                    ? "text-violet-300"
                                    : "text-purple-200"
                                }`}
                              >
                                ${totalWithTax.toFixed(2)} ( $
                                {portion.toFixed(2)} + Fees $
                                {taxPerPerson.toFixed(2)}) (
                                {(totalWithTax * HBAR_RATE).toFixed(2)} ℏ)
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(
                                getPaymentStatus(participant.participantId)
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-3 border-2 border-dashed border-white/20 rounded-lg">
                      <p className="text-white/60 text-sm">
                        No participants assigned
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
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
                  <span className="font-semibold text-lg">
                    ${bill.tax.toFixed(2)} ({(bill.tax * HBAR_RATE).toFixed(2)}{" "}
                    ℏ)
                  </span>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg text-white">
                    Total
                  </span>
                  <span className="font-semibold text-lg text-white">
                    ${grandTotal.toFixed(2)} (
                    {(grandTotal * HBAR_RATE).toFixed(2)} ℏ)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              Payment Summary
            </h4>

            {getAllBillParticipants().map((participant) => {
              const { total, serviceCharge } =
                calculateFriendTotalWithBreakdown(participant.participantId);

              if (total === 0) return null;

              const status = getPaymentStatus(participant.participantId);

              return (
                <div
                  key={participant.participantId}
                  className={`rounded-xl p-4 border ${
                    participant.isCurrentUser
                      ? "bg-fuchsia-600/20 border border-fuchsia-500/50 shadow-lg shadow-fuchsia-500/20"
                      : "bg-white/5 border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-fuchsia-400
                        }`}
                      >
                        <span className="text-white font-bold">
                          {(participant.displayName || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div
                          className={`font-semibold text-lg ${
                            participant.isCurrentUser
                              ? "text-violet-200"
                              : "text-white"
                          }`}
                        >
                          {participant.displayName || "Anonymous"}
                        </div>
                        <div
                          className={`text-sm ${
                            participant.isCurrentUser
                              ? "text-violet-300"
                              : "text-purple-200"
                          }`}
                        >
                          ${total.toFixed(2)} ({(total * HBAR_RATE).toFixed(2)}{" "}
                          ℏ)
                          {serviceCharge > 0 ? (
                            <div className="text-xs text-fuchsia-300 mt-0.5">
                              Includes ${serviceCharge.toFixed(2)} service
                              charge ({(serviceCharge * HBAR_RATE).toFixed(2)}{" "}
                              ℏ)
                            </div>
                          ) : (
                            <div className="text-xs text-fuchsia-300 mt-0.5">
                              Bill Owner
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          status
                        )}`}
                      >
                        {status === "paid" ? "Paid" : "Pending"}
                      </span>
                      {getStatusIcon(status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {getPaymentStatus(accountId!) === "pending" && (
            <div className="flex gap-3 mt-6 items-center justify-between">
              <button
                onClick={async () => {
                  const toAddress = bill.creatorId;

                  try {
                    const transactionId = await sendTransaction(
                      toAddress,
                      realHbarAmount,
                      serviceChargeHbar
                    );

                    const updatedItems = bill.items.map((item) => {
                      if (!item.participants) return item;

                      const updatedParticipants = item.participants.map((p) => {
                        if (p.participantId === accountId) {
                          return { ...p, isPaid: transactionId };
                        }
                        return p;
                      });

                      return { ...item, participants: updatedParticipants };
                    });

                    setBill({ ...bill, items: updatedItems });

                    await BillService.updateBill({
                      ...bill,
                      items: updatedItems,
                    });
                    window.location.reload();
                  } catch (error) {
                    alert("Payment failed. Please try again later.");
                    console.error("Payment error:", error);
                  }
                }}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                Pay ${total.toFixed(2)} ({hbarAmount.toFixed(2)} ℏ)
              </button>
            </div>
          )}

          {(() => {
            const transactionIds = new Set<string>();

            bill.items.forEach((item) => {
              item.participants?.forEach((participant) => {
                if (participant.isPaid && participant.isPaid.trim() !== "") {
                  transactionIds.add(participant.isPaid);
                }
              });
            });

            const transactions = Array.from(transactionIds)
              .map((txId) => {
                const [_, timestampPart] = txId.split("@");
                const timestamp = Number(timestampPart);
                const date = new Date(Math.round(timestamp * 1000));
                return {
                  txId,
                  date,
                  timestamp,
                  formattedDate: date.toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }),
                };
              })
              .sort((a, b) => b.timestamp - a.timestamp);

            return transactions.length > 0 ? (
              <div className="mb-10">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  Payment History
                </h4>

                <div className="space-y-3">
                  {transactions.map(({ txId, formattedDate }, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl p-4 border border-white/10 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10 transition-shadow"
                    >
                      <div className="text-sm text-purple-200 break-words">
                        <div className="mb-1">
                          <span className="font-semibold text-white">
                            Transaction ID:
                          </span>{" "}
                          <span className="text-purple-100">{txId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-purple-300" />
                          <span className="text-purple-100">
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`https://hashscan.io/testnet/transaction/${txId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 sm:mt-0 text-sm px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-purple-300 transition-all duration-200 self-start sm:self-auto"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
