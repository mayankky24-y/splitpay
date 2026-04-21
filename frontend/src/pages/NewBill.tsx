import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import {
  Upload as UploadIcon,
  Camera,
  FileText,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { ReceiptService } from "../services/receiptService";
import BillDetails from "../components/BillDetails";
import { BillService } from "../services/billService";
import type { Receipt } from "../models/receipt";

const NewBill = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const [result, setResult] = useState<Receipt | null>(null);

  useEffect(() => {
    result && console.log("Result updated:", result);
  }, [result]);

  const webcamRef = useRef<Webcam>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    if (file.type.startsWith("image/")) {
      setUploadedFileUrl(URL.createObjectURL(file));
    } else {
      setUploadedFileUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setResult(null);
  };

  const handleTakePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "new-bill.jpg", {
            type: "image/jpeg",
          });
          handleFileUpload(file);
          setUseWebcam(false);
        });
    }
  };

  const handleProcessSplit = async () => {
    if (!uploadedFile) return;
    setProcessing(true);
    setResult(null);
    try {
      const res = await ReceiptService.postReceipt(uploadedFile);
      setResult(res);
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateBill = async () => {
    if (!result) return;
    try {
      await BillService.createBill(result);
    } finally {
      setProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="">
      <div className="text-center">
        {!result || (result && (!result.items || result.items.length === 0)) ? (
          <>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Upload Your Bill
            </h2>
            <p className="text-purple-200 text-lg mb-8">
              Upload a receipt and let our AI handle the rest
            </p>
          </>
        ) : null}
      </div>

      <div className="max-w-2xl mx-auto">
        {uploadedFile &&
          result &&
          Array.isArray(result.items) &&
          result.items.length === 0 && (
            <div className="flex flex-col items-center justify-center bg-red-100/10 border border-red-400/30 rounded-xl p-6 mb-6">
              <AlertTriangle className="w-10 h-10 text-red-400 mb-2" />
              <div className="text-lg font-semibold text-red-300 mb-1">
                No Items Detected
              </div>
              <div className="text-red-200">
                No items were found in your receipt.
              </div>
            </div>
          )}

        {!result || (result && (!result.items || result.items.length === 0)) ? (
          <>
            {useWebcam ? (
              <div className="relative rounded-2xl overflow-hidden">
                <div className="rounded-2xl overflow-hidden aspect-video">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={handleTakePhoto}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg font-semibold text-white transition-all duration-300 hover:brightness-110 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    Capture
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-fuchsia-400 bg-fuchsia-400/10"
                    : uploadedFile
                    ? "border-purple-500/50"
                    : "border-purple-500/50 hover:border-purple-400"
                } ${uploadedFile ? "border-green-400" : ""}`}
                onDragEnter={!uploadedFile ? handleDrag : undefined}
                onDragLeave={!uploadedFile ? handleDrag : undefined}
                onDragOver={!uploadedFile ? handleDrag : undefined}
                onDrop={!uploadedFile ? handleDrop : undefined}
              >
                <input
                  type="file"
                  onChange={!uploadedFile ? handleFileSelect : undefined}
                  accept="image/*,.pdf"
                  className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${
                    uploadedFile ? "pointer-events-none" : ""
                  }`}
                  disabled={!!uploadedFile}
                />

                <div className="space-y-6">
                  {processing ? (
                    <div className="relative w-8 h-8 mx-auto">
                      <div className="absolute inset-0 border-4 border-fuchsia-300 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : uploadedFile ? (
                    <>
                      {uploadedFile.type.startsWith("image/") &&
                      uploadedFileUrl ? (
                        <img
                          src={uploadedFileUrl}
                          alt="Preview"
                          className="mx-auto mb-4 max-h-64 rounded-lg shadow-lg border border-purple-200"
                        />
                      ) : null}
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-2" />
                    </>
                  ) : (
                    <UploadIcon className="w-16 h-16 text-purple-300 mx-auto" />
                  )}

                  <div>
                    {processing ? (
                      <>
                        <h3 className="text-xl font-semibold text-fuchsia-300 mb-2">
                          Processing Receipt...
                        </h3>
                        <p className="text-purple-200">
                          Our AI is reading your receipt
                        </p>
                      </>
                    ) : uploadedFile ? (
                      <>
                        <h3 className="text-xl font-semibold text-green-300 mb-2">
                          Your receipt is ready to be processed!
                        </h3>
                        <p className="text-purple-200">{uploadedFile.name}</p>
                        <div className="flex flex-row justify-center gap-4 mt-4">
                          <button
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg font-semibold text-white transition-all duration-300 hover:brightness-110 cursor-pointer text-xs sm:text-base"
                            onClick={handleProcessSplit}
                            disabled={processing}
                          >
                            {processing ? "Processing..." : "Process & Split"}
                          </button>
                          <button
                            onClick={handleRemoveFile}
                            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 cursor-pointer text-xs sm:text-base"
                            disabled={processing}
                          >
                            Change Photo
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold text-purple-100 mb-2 w-full">
                          Drop your receipt here
                        </h3>
                        <p className="text-purple-300 mb-4">
                          or click to browse files
                        </p>
                        <p className="text-sm text-purple-400">
                          Supports JPG, PNG, PDF files
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-1 gap-4">
              {!useWebcam && !uploadedFile ? (
                <button
                  onClick={() => setUseWebcam(true)}
                  className="flex items-center justify-center space-x-3 p-6 bg-purple-800/30 rounded-xl hover:bg-purple-700/30 transition-all duration-300 border border-purple-600/30 cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-purple-300" />
                  <span className="font-semibold">Take Photo</span>
                </button>
              ) : useWebcam ? (
                <button
                  onClick={() => setUseWebcam(false)}
                  className="flex items-center justify-center space-x-3 p-6 bg-purple-800/30 rounded-xl hover:bg-purple-700/30 transition-all duration-300 border border-purple-600/30 cursor-pointer"
                >
                  <FileText className="w-6 h-6 text-purple-300" />
                  <span className="font-semibold">Upload File</span>
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        {result && Array.isArray(result.items) && result.items.length > 0 && (
          <BillDetails
            receipt={result}
            onChange={setResult}
            createBill={handleCreateBill}
          />
        )}
      </div>
    </div>
  );
};

export default NewBill;
