import { useEffect, useState } from "react";
import BillDetails from "../components/BillDetails";
import type { Receipt } from "../models/receipt";
import { BillService } from "../services/billService";
import { useParams } from "react-router-dom";

export default function EditBill() {
  const { billId } = useParams<{ billId: string }>();
  const [bill, setBill] = useState<Receipt | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      if (!billId) return;
      try {
        const bill = await BillService.getBillByBillId(billId);
        setBill(bill);
      } catch (err) {}
    };

    fetchBills();
  }, [billId]);

  const handleCreateBill = async () => {
    if (!bill) return;
    await BillService.updateBill(bill);
  };

  if (bill) {
    return (
      <BillDetails
        receipt={bill}
        onChange={setBill}
        createBill={handleCreateBill}
      />
    );
  }

  return null;
}
