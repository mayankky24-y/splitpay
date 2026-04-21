import { useEffect, useState } from "react";
import {
  FileText,
  Calendar,
  DollarSign,
  Package,
  Loader2,
  AlertCircle,
  ChevronRight,
  Edit,
  Trash2,
  Users,
} from "lucide-react";
import { BillService } from "../services/billService";
import { useNavigate } from "react-router-dom";
import type { Receipt } from "../models/receipt";

interface GroupedBills {
  [date: string]: Receipt[];
}

export default function CreatedBills() {
  const [bills, setBills] = useState<Receipt[]>([]);
  const [groupedBills, setGroupedBills] = useState<GroupedBills>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        setError(null);
        const billsData = (await BillService.getBillsByCurrentCreator()) ?? [];

        const sortedBills = billsData.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.billDate);
          const dateB = new Date(b.createdAt || b.billDate);
          return dateB.getTime() - dateA.getTime();
        });

        setBills(sortedBills);

        const grouped = sortedBills.reduce((acc, bill) => {
          const date = new Date(bill.createdAt || bill.billDate);
          const dateKey = date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(bill);
          return acc;
        }, {} as GroupedBills);

        setGroupedBills(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch bills");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const calculateTotalAmount = (bill: Receipt) => {
    const subtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
    return subtotal + (bill.tax || 0);
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleBillClick = (billId: string) => {
    navigate(`/payment-status/${billId}`);
    console.log("Navigate to payment status:", billId);
  };

  const handleEditBill = (e: React.MouseEvent, billId: string) => {
    e.stopPropagation();
    navigate(`/edit-bill/${billId}`);
    console.log("Navigate to edit bill:", billId);
  };

  const handleDeleteBill = async (e: React.MouseEvent, billId: string) => {
    e.stopPropagation();

    if (
      window.confirm(
        "Are you sure you want to delete this bill? This action cannot be undone."
      )
    ) {
      try {
        setDeletingBillId(billId);
        await BillService.deleteBill(billId);

        setBills((prevBills) =>
          prevBills.filter((bill) => bill.billId !== billId)
        );

        setGroupedBills((prevGrouped) => {
          const newGrouped = { ...prevGrouped };
          Object.keys(newGrouped).forEach((dateKey) => {
            newGrouped[dateKey] = newGrouped[dateKey].filter(
              (bill) => bill.billId !== billId
            );
            if (newGrouped[dateKey].length === 0) {
              delete newGrouped[dateKey];
            }
          });
          return newGrouped;
        });

        console.log("Bill deleted successfully:", billId);
      } catch (err) {
        console.error("Failed to delete bill:", err);
        alert("Failed to delete bill. Please try again.");
      } finally {
        setDeletingBillId(null);
      }
    }
  };

  const handleAssignParticipants = (e: React.MouseEvent, billId: string) => {
    e.stopPropagation();
    navigate(`/assign-participants/${billId}`);
    console.log("Navigate to assign participants:", billId);
  };

  const hasAnyPaidParticipant = (bill: Receipt): boolean => {
    return (
      bill.items?.some((item) =>
        item.participants?.some(
          (participant) => participant?.isPaid?.trim() !== ""
        )
      ) ?? false
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 text-purple-300 animate-spin" />
            <span className="text-white text-xl font-semibold">
              Loading bills...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">Error</h3>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalBills = bills.length;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Created Bills
          </h1>
          <p className="text-purple-200 text-sm sm:text-base">
            {totalBills === 0
              ? "No bills found"
              : `${totalBills} bill${totalBills !== 1 ? "s" : ""} created`}
          </p>
        </div>

        {totalBills === 0 ? (
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 sm:p-12 shadow-2xl text-center">
            <div className="p-3 sm:p-4 bg-white/10 rounded-full inline-block mb-4 sm:mb-6">
              <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-purple-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
              No Bills Created Yet
            </h3>
            <p className="text-purple-200 text-base sm:text-lg">
              Start creating bills to see them appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(groupedBills).map(([dateKey, billsForDate]) => (
              <div key={dateKey} className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
                  <h2 className="text-lg sm:text-xl font-bold text-purple-200 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 rounded-lg border border-purple-400/20">
                    {dateKey}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {billsForDate.map((bill, index) => {
                    const totalAmount = calculateTotalAmount(bill);

                    return (
                      <div key={index} className="group">
                        <div
                          onClick={() => handleBillClick(bill.billId!)}
                          className="bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 border backdrop-blur-sm border-white/20 rounded-2xl p-4 pb-1 sm:pb-6 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-400/30 cursor-pointer hover:brightness-110"
                        >
                          <div className="block sm:hidden">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 rounded-xl flex-shrink-0">
                                <FileText className="w-5 h-5 text-purple-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-white mb-1 truncate">
                                  {bill.storeName}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-purple-200">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span>
                                      {new Date(
                                        bill.billDate
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  {/* <div className="flex items-center gap-1">
                                    <Package className="w-3 h-3 flex-shrink-0" />
                                    <span>{bill.items.length} items</span>
                                  </div> */}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xl font-bold text-white flex items-center justify-end gap-0">
                                  <DollarSign className="w-4 h-4 text-purple-300" />
                                  {formatCurrency(totalAmount)}
                                </div>
                                <div className="text-purple-200 text-xs">
                                  Total
                                </div>
                              </div>
                            </div>

                            {!hasAnyPaidParticipant(bill) && (
                              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 mb-2">
                                <button
                                  onClick={(e) =>
                                    handleEditBill(e, bill.billId!)
                                  }
                                  className="p-2.5 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 hover:text-purple-100 transition-all duration-200 border border-purple-400/30 hover:border-purple-400/50 touch-manipulation"
                                  title="Edit Bill"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={(e) =>
                                    handleAssignParticipants(e, bill.billId!)
                                  }
                                  className="p-2.5 rounded-lg bg-gradient-to-r from-fuchsia-500/30 to-purple-500/30 text-white hover:from-fuchsia-500/40 hover:to-purple-500/40 transition-all duration-200 border border-fuchsia-400/40 hover:border-fuchsia-400/60 shadow-lg hover:shadow-xl touch-manipulation"
                                  title="Assign Participants"
                                >
                                  <Users className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={(e) =>
                                    handleDeleteBill(e, bill.billId!)
                                  }
                                  disabled={deletingBillId === bill.billId}
                                  className="p-2.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all duration-200 border border-red-500/20 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                                  title="Delete Bill"
                                >
                                  {deletingBillId === bill.billId ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="hidden sm:flex sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="p-3 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 rounded-xl flex-shrink-0">
                                <FileText className="w-6 h-6 text-purple-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white mb-1 truncate">
                                  {bill.storeName}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-purple-200">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span>
                                      {new Date(
                                        bill.billDate
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Package className="w-4 h-4 flex-shrink-0" />
                                    <span>{bill.items.length} items</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-white flex items-center gap-0">
                                  <DollarSign className="w-5 h-5 text-purple-300 translate-y-0.5" />
                                  {formatCurrency(totalAmount)}
                                </div>
                                <div className="text-purple-200 text-sm">
                                  Total
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {!hasAnyPaidParticipant(bill) && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) =>
                                        handleEditBill(e, bill.billId!)
                                      }
                                      className="p-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 hover:text-purple-100 transition-all duration-200 border border-purple-400/30 hover:border-purple-400/50"
                                      title="Edit Bill"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={(e) =>
                                        handleAssignParticipants(
                                          e,
                                          bill.billId!
                                        )
                                      }
                                      className="p-2 rounded-lg bg-gradient-to-r from-fuchsia-500/30 to-purple-500/30 text-white hover:from-fuchsia-500/40 hover:to-purple-500/40 transition-all duration-200 border border-fuchsia-400/40 hover:border-fuchsia-400/60 shadow-lg hover:shadow-xl"
                                      title="Assign Participants"
                                    >
                                      <Users className="w-4 h-4" />
                                    </button>

                                    <button
                                      onClick={(e) =>
                                        handleDeleteBill(e, bill.billId!)
                                      }
                                      disabled={deletingBillId === bill.billId}
                                      className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all duration-200 border border-red-500/20 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Delete Bill"
                                    >
                                      {deletingBillId === bill.billId ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                )}

                                <ChevronRight className="w-6 h-6 text-purple-300 group-hover:translate-x-1 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
