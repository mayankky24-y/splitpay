import React, { useState } from "react";
import { Edit3, Check, X, Plus, Minus, Trash2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Receipt } from "../models/receipt";
import type { ReceiptItem } from "../models/receipt-item";

interface BillDetailsProps {
  receipt: Receipt;
  onChange?: (updated: Receipt) => void;
  createBill?: (receipt: Receipt) => Promise<void>;
}

const BillDetails: React.FC<BillDetailsProps> = ({
  receipt,
  onChange,
  createBill,
}) => {
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingTax, setEditingTax] = useState(false);
  const [editingStoreName, setEditingStoreName] = useState(false);
  const [editingBillDate, setEditingBillDate] = useState(false);
  const [tempItem, setTempItem] = useState<ReceiptItem | null>(null);
  const [tempTax, setTempTax] = useState("");
  const [tempStoreName, setTempStoreName] = useState("");
  const [tempBillDate, setTempBillDate] = useState("");
  const navigate = useNavigate();

  const updateItem = (idx: number, updatedItem: ReceiptItem) => {
    const newItems = receipt.items.map((item, i) =>
      i === idx ? updatedItem : item
    );
    onChange?.({ ...receipt, items: newItems });
  };

  const removeItem = (idx: number) => {
    const newItems = receipt.items.filter((_, i) => i !== idx);
    onChange?.({ ...receipt, items: newItems });
  };

  const startEditingItem = (idx: number) => {
    setEditingItem(idx);
    setTempItem({ ...receipt.items[idx] });
  };

  const saveItemEdit = (idx: number) => {
    if (tempItem) {
      const updatedItem = {
        ...tempItem,
        unitPrice: tempItem.price / tempItem.quantity,
      };
      updateItem(idx, updatedItem);
    }
    setEditingItem(null);
    setTempItem(null);
  };

  const cancelItemEdit = () => {
    setEditingItem(null);
    setTempItem(null);
  };

  const updateTempItem = (field: keyof ReceiptItem, value: string | number) => {
    if (!tempItem) return;

    let newValue: string | number = value;

    if (field === "quantity") {
      newValue = Math.max(1, parseInt(String(value), 10));
    } else if (field === "price") {
      const parsed = parseFloat(String(value));
      newValue = Math.max(0, Math.round(parsed * 100) / 100);
    } else if (field === "name") {
      newValue = String(value);
    }

    setTempItem({
      ...tempItem,
      [field]: newValue,
    });
  };

  const adjustTempQuantity = (delta: number) => {
    if (tempItem) {
      const newQty = Math.max(1, tempItem.quantity + delta);
      setTempItem({
        ...tempItem,
        quantity: newQty,
      });
    }
  };

  const startEditingTax = (tax: number) => {
    setEditingTax(true);
    setTempTax(tax.toString());
  };

  const saveTaxEdit = () => {
    onChange?.({ ...receipt, tax: Math.max(0, Number(tempTax)) });
    setEditingTax(false);
    setTempTax("");
  };

  const cancelTaxEdit = () => {
    setEditingTax(false);
    setTempTax("");
  };

  const startEditingStoreName = () => {
    setEditingStoreName(true);
    setTempStoreName(receipt.storeName);
  };

  const saveStoreNameEdit = () => {
    if (tempStoreName.trim()) {
      onChange?.({ ...receipt, storeName: tempStoreName.trim() });
    }
    setEditingStoreName(false);
    setTempStoreName("");
  };

  const cancelStoreNameEdit = () => {
    setEditingStoreName(false);
    setTempStoreName("");
  };

  const startEditingBillDate = () => {
    setEditingBillDate(true);
    const date = new Date(receipt.billDate);
    setTempBillDate(date.toISOString().split("T")[0]);
  };

  const saveBillDateEdit = () => {
    if (tempBillDate) {
      const newDate = new Date(tempBillDate);
      if (!isNaN(newDate.getTime())) {
        onChange?.({ ...receipt, billDate: newDate.toISOString() });
      }
    }
    setEditingBillDate(false);
    setTempBillDate("");
  };

  const cancelBillDateEdit = () => {
    setEditingBillDate(false);
    setTempBillDate("");
  };

  const handleSave = () => {
    createBill?.(receipt)
      .then(() => {
        navigate("/created-bills");
      })
      .catch((error) => {
        console.error("Error creating bill:", error);
        alert("Failed to create bill. Please try again.");
      });
  };

  const subtotal = receipt.items.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = subtotal + receipt.tax;

  return (
    <div className="max-w-2xl w-full mx-auto px-4 sm:px-0 -mt-4">
      <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 px-4 sm:px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
            </div>
            {editingStoreName ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  value={tempStoreName}
                  onChange={(e) => setTempStoreName(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-white/10 text-white text-lg sm:text-xl font-bold rounded-lg border border-purple-400 focus:border-purple-300 focus:bg-white/15 outline-none"
                  placeholder="Store name"
                  autoFocus
                  onKeyPress={(e) => e.key === "Enter" && saveStoreNameEdit()}
                />
                <button
                  onClick={saveStoreNameEdit}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelStoreNameEdit}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={startEditingStoreName}
                className="text-lg sm:text-xl font-bold text-white hover:text-purple-200 transition-colors cursor-pointer group flex items-center gap-2 flex-1 text-left"
              >
                <span className="truncate">{receipt.storeName}</span>
                <Edit3 className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            )}
          </div>

          <div className="ml-0 sm:ml-[3.35rem] mt-3 sm:mt-2">
            {editingBillDate ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={tempBillDate}
                  onChange={(e) => setTempBillDate(e.target.value)}
                  className="px-3 py-1 bg-white/10 text-purple-200 text-sm rounded-lg border border-purple-400 focus:border-purple-300 focus:bg-white/15 outline-none"
                  autoFocus
                />
                <button
                  onClick={saveBillDateEdit}
                  className="p-1 text-purple-200 hover:bg-white/10 rounded transition-colors cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={cancelBillDateEdit}
                  className="p-1 text-purple-200 hover:bg-white/10 rounded transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={startEditingBillDate}
                className="text-purple-200 text-sm hover:text-purple-100 transition-colors cursor-pointer group flex items-center gap-1"
              >
                {new Date(receipt.billDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {receipt.items.map((item, idx) => (
              <div key={idx} className="group relative">
                <div className="bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-xl p-3 sm:p-4 border border-white/5 hover:border-white/20">
                  {editingItem === idx && tempItem ? (
                    <div className="space-y-4">
                      <input
                        value={tempItem.name}
                        onChange={(e) => updateTempItem("name", e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white/10 text-white rounded-lg border border-white/20 focus:border-purple-400 focus:bg-white/15 outline-none text-base sm:text-lg font-medium placeholder-white/50"
                        placeholder="Item name"
                        autoFocus
                      />

                      <div className="flex gap-3 sm:gap-4">
                        <div className="flex items-center bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                          <button
                            onClick={() => adjustTempQuantity(-1)}
                            disabled={tempItem.quantity <= 1}
                            className="p-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                          </button>
                          <div className="px-4 py-2 sm:py-3 text-white font-semibold min-w-[3rem] text-center">
                            {tempItem.quantity}
                          </div>
                          <button
                            onClick={() => adjustTempQuantity(1)}
                            className="p-2 hover:bg-white/10 transition-colors"
                          >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                          </button>
                        </div>

                        <div className="flex-1">
                          <input
                            min="0"
                            type="number"
                            step="0.01"
                            value={tempItem.price}
                            onChange={(e) =>
                              updateTempItem("price", e.target.value)
                            }
                            className="w-full px-3 sm:px-4 py-2.5 bg-white/10 text-white text-right rounded-lg border border-white/20 focus:border-purple-400 focus:bg-white/15 outline-none text-base sm:text-lg font-semibold"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => saveItemEdit(idx)}
                          className="flex-1 px-4 py-3 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg text-white transition-all duration-300 hover:brightness-110 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                        <button
                          onClick={cancelItemEdit}
                          className="flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 border border-white/20 hover:border-white/30 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 border border-purple-400/30 self-start">
                        <span className="text-white font-bold text-base sm:text-lg">
                          {item.quantity}×
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-base sm:text-lg break-words">
                          {item.name}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="text-white font-bold text-lg sm:text-xl">
                          ${item.price.toFixed(2)}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingItem(idx)}
                            className="p-2 sm:p-2.5 rounded-lg bg-white/10 text-purple-300 hover:bg-white/20 hover:text-purple-200 transition-all duration-200 border border-white/10 hover:border-white/30 cursor-pointer"
                            title="Edit item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(idx)}
                            className="p-2 sm:p-2.5 rounded-lg bg-white/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 border border-white/10 hover:border-red-400/30 cursor-pointer"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>

          <div>
            <div className="space-y-3 sm:space-y-2">
              <div className="flex justify-between items-center text-white">
                <span className="font-semibold text-lg sm:text-xl">
                  Subtotal
                </span>
                <span className="font-semibold text-lg sm:text-xl">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-purple-200">
                <span className="font-semibold text-lg sm:text-xl">
                  Tax & Fees
                </span>
                <div className="flex items-center gap-2">
                  {editingTax ? (
                    <div className="flex items-center gap-2">
                      <input
                        min={0}
                        step="0.01"
                        value={tempTax}
                        onChange={(e) => setTempTax(e.target.value)}
                        className="w-20 sm:w-24 px-3 py-2 bg-white/10 text-white text-right rounded-lg border border-purple-400 focus:border-purple-300 focus:bg-white/15 outline-none font-medium"
                        autoFocus
                        onKeyPress={(e) => e.key === "Enter" && saveTaxEdit()}
                      />
                      <button
                        onClick={saveTaxEdit}
                        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelTaxEdit}
                        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditingTax(receipt.tax)}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white/10 transition-colors group/tax cursor-pointer"
                    >
                      <span className="text-purple-200 font-semibold text-lg sm:text-xl">
                        ${receipt.tax.toFixed(2)}
                      </span>
                      <Edit3 className="w-4 h-4 text-white opacity-60 group-hover/tax:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg sm:text-xl text-white">
                  Total
                </span>
                <span className="font-semibold text-lg sm:text-xl bg-gradient-to-r text-white">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <button
              className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetails;
