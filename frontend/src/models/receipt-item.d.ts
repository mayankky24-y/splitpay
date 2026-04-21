import type { Participant } from "./participant";

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  participants: Participant[];
}
