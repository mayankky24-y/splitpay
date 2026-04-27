import axios from "axios";
import type { Receipt } from "../models/receipt";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${
  import.meta.env.VITE_API_VERSION
}`;

export const ReceiptService = {
  async postReceipt(file: File): Promise<Receipt> {
    try {
      const processedFile = await optimizeReceiptFile(file);
      const formData = new FormData();
      formData.append("file", processedFile);
      const response = await axios.post(`${BASE_URL}/receipt`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 35000,
      });
      return response.data.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          throw new Error(
            "Receipt processing timed out. Please retry with a clearer, smaller image."
          );
        }
        const errorMessage =
          err.response?.data?.error || "Unknown error occurred";
        throw new Error(errorMessage);
      } else {
        throw new Error("Unexpected error");
      }
    }
  },
};

async function optimizeReceiptFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.8)
  );

  if (!blob) return file;
  return new File([blob], "receipt.jpg", { type: "image/jpeg" });
}
