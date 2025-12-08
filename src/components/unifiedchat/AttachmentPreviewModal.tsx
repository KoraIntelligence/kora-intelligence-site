import React, { useEffect } from "react";
import type { Attachment } from "@/types/chat";

interface AttachmentPreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

export default function AttachmentPreviewModal({
  attachment,
  onClose,
}: AttachmentPreviewModalProps) {
  // Close modal on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!attachment) return null;

  const download = () => {
    if (
      attachment.kind === "pdf" ||
      attachment.kind === "docx" ||
      attachment.kind === "xlsx"
    ) {
      const a = document.createElement("a");
      a.href = attachment.dataUrl;
      a.download = attachment.filename;
      a.click();
    }
  };

  const headerLabel = (() => {
    switch (attachment.kind) {
      case "pdf":
      case "docx":
      case "xlsx":
        return attachment.filename || "Download";
      case "html":
      case "preview":
        return attachment.title || "Preview";
      default:
        return "Preview";
    }
  })();

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 backdrop-blur-sm p-4
        dark:bg-black/60
      "
      onClick={onClose}
    >
      <div
        className="
          relative w-full max-w-3xl max-h-[90vh]
          bg-white dark:bg-[#121212]
          text-gray-900 dark:text-gray-100
          rounded-xl shadow-2xl overflow-hidden
          animate-fadeIn
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="
            flex justify-between items-center px-4 py-3
            border-b border-gray-200 dark:border-gray-800
          "
        >
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            {headerLabel}
          </h2>

          <button
            onClick={onClose}
            className="
              text-gray-400 hover:text-gray-600
              dark:text-gray-500 dark:hover:text-gray-300
              text-xl leading-none
            "
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[70vh] dark:text-gray-200">
          {/* ===== PDF Preview ===== */}
          {attachment.kind === "pdf" && (
            <embed
              src={attachment.dataUrl}
              type="application/pdf"
              className="
                w-full h-[70vh] rounded-md border
                border-gray-200 dark:border-gray-700
                bg-white dark:bg-[#1a1a1a]
              "
            />
          )}

          {/* ===== DOCX Preview ===== */}
          {attachment.kind === "docx" && (
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">
              <p className="mb-4">DOCX preview is not supported.</p>
              <button
                onClick={download}
                className="
                  px-4 py-2 rounded-md
                  bg-amber-600 hover:bg-amber-700 text-white
                  dark:bg-amber-500 dark:hover:bg-amber-600
                "
              >
                Download DOCX
              </button>
            </div>
          )}

          {/* ===== XLSX Preview ===== */}
          {attachment.kind === "xlsx" && (
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">
              <p className="mb-4">Excel preview is not supported.</p>
              <button
                onClick={download}
                className="
                  px-4 py-2 rounded-md
                  bg-amber-600 hover:bg-amber-700 text-white
                  dark:bg-amber-500 dark:hover:bg-amber-600
                "
              >
                Download Excel File
              </button>
            </div>
          )}

          {/* ===== HTML Preview ===== */}
          {attachment.kind === "html" && (
            <iframe
              srcDoc={attachment.content}
              className="
                w-full h-[70vh] rounded-md border
                border-gray-200 dark:border-gray-700
                bg-white dark:bg-[#1a1a1a]
              "
              title="HTML Preview"
            />
          )}

          {/* ===== FMC Visual Preview ===== */}
          {attachment.kind === "preview" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-amber-700 dark:text-amber-300">
                {attachment.title}
              </h3>

              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                {attachment.body}
              </p>

              {attachment.canvaUrl && (
                <button
                  onClick={() => window.open(attachment.canvaUrl!, "_blank")}
                  className="
                    px-4 py-2 rounded-md
                    bg-purple-600 hover:bg-purple-700 text-white
                    dark:bg-purple-500 dark:hover:bg-purple-600
                  "
                >
                  Open in Canva
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div
          className="
            px-4 py-3 flex justify-end gap-2
            border-t border-gray-200 dark:border-gray-800
            bg-gray-50 dark:bg-[#101010]
          "
        >
          {(attachment.kind === "pdf" ||
            attachment.kind === "docx" ||
            attachment.kind === "xlsx") && (
            <button
              onClick={download}
              className="
                px-4 py-2 rounded-md
                bg-amber-600 hover:bg-amber-700 text-white
                dark:bg-amber-500 dark:hover:bg-amber-600
              "
            >
              Download
            </button>
          )}

          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-md
              bg-gray-200 hover:bg-gray-300 text-gray-800
              dark:bg-neutral-800 dark:text-gray-200
              dark:hover:bg-neutral-700
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}