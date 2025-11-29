import React from "react";
import { X, UploadCloud } from "lucide-react";

export type AttachmentItem = {
  id: string;
  file: File;
};

type Props = {
  isOpen: boolean;
  attachments: AttachmentItem[];
  companion: "salar" | "lyra";
  onClose: () => void;
  onUpload: (file: File) => void;
  onRemove: (id: string) => void;
};

export default function AttachmentDrawer({
  isOpen,
  attachments,
  companion,
  onClose,
  onUpload,
  onRemove,
}: Props) {
  const palette =
    companion === "lyra"
      ? "text-teal-700 border-teal-200"
      : "text-amber-700 border-amber-200";

  const accent =
    companion === "lyra"
      ? "bg-teal-600 hover:bg-teal-700"
      : "bg-amber-600 hover:bg-amber-700";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/20">
      <div className="w-full max-w-lg bg-white rounded-t-2xl shadow-xl p-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold ${palette}`}>
            Upload Files for {companion === "lyra" ? "Lyra" : "Salar"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Upload Button */}
        <label
          className={`w-full cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed ${palette} rounded-xl py-5 hover:bg-gray-50`}
        >
          <UploadCloud className={palette} />
          <span className="text-sm">Click to upload (PDF, DOCX, XLSX, CSV)</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.xlsx,.csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUpload(e.target.files[0]);
              }
            }}
          />
        </label>

        {/* File List */}
        {attachments.length > 0 && (
          <div className="mt-4 space-y-3">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between border p-2 rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium">{att.file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(att.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  onClick={() => onRemove(att.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Note */}
        <p className="text-[11px] text-gray-400 mt-3">
          Large files (20–50MB) may take a moment to upload.  
          CSV files are used for Lyra’s outreach segmentation.  
        </p>

        {/* Close */}
        <button
          onClick={onClose}
          className={`mt-4 w-full ${accent} text-white py-2 rounded-xl`}
        >
          Done
        </button>
      </div>
    </div>
  );
}