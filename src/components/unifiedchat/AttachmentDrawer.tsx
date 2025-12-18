// src/components/unifiedchat/AttachmentDrawer.tsx

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
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
};

export default function AttachmentDrawer({
  isOpen,
  attachments,
  companion,
  onClose,
  onAdd,
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
            Attach files for {companion === "lyra" ? "Lyra" : "Salar"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add File */}
        <label
          className={`w-full cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed ${palette} rounded-xl py-5 hover:bg-gray-50`}
        >
          <UploadCloud className={palette} />
          <span className="text-sm">
            Add files (PDF, DOCX, XLSX, CSV)
          </span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.xlsx,.csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onAdd(file);   // ✅ stage only
                e.target.value = "";
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
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {att.file.name}
                  </p>
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

        {/* Guidance */}
        <p className="text-[11px] text-gray-400 mt-3">
          Files will be sent when you press <strong>Send</strong> in the chat.  
          CSV files support Lyra’s outreach workflows.
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