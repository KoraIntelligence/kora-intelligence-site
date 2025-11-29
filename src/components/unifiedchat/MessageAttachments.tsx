import React from "react";

export type Attachment = {
  kind: "pdf" | "docx" | "xlsx" | "preview" | "html";
  filename?: string;
  dataUrl?: string; // PDF/DOCX/XLSX or preview PNG
  title?: string;

  // HTML block
  content?: string;

  // Preview (FMC)
  body?: string;
  canvaUrl?: string;
};

type MessageAttachmentsProps = {
  items: Attachment[];
  onOpenAttachment?: (att: Attachment) => void;
};

export default function MessageAttachments({
  items,
  onOpenAttachment,
}: MessageAttachmentsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      {items.map((att, i) => {
        const handleClick = () => {
          if (onOpenAttachment) onOpenAttachment(att);
        };

        // -------------------------------------------------------------------
        // 1. CANVA / VISUAL PREVIEW (FMC RENDER)
        // -------------------------------------------------------------------
        if (att.kind === "preview") {
          return (
            <div
              key={i}
              className="border rounded-xl bg-white shadow p-4 cursor-pointer"
              onClick={handleClick}
            >
              <h3 className="font-semibold text-amber-700 mb-2">
                {att.title || "Preview"}
              </h3>

              <p className="text-gray-700 whitespace-pre-line">{att.body}</p>

              <div className="flex gap-2 mt-3">
                {att.dataUrl && (
                  <a
                    href={att.dataUrl}
                    download={`${att.title || "preview"}.png`}
                    className="px-3 py-1 text-sm rounded-md bg-amber-600 text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Download PNG
                  </a>
                )}

                {att.canvaUrl && (
                  <a
                    href={att.canvaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm rounded-md bg-purple-600 text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open in Canva
                  </a>
                )}
              </div>
            </div>
          );
        }

        // -------------------------------------------------------------------
        // 2. EMBEDDED HTML (Builder)
        // -------------------------------------------------------------------
        if (att.kind === "html") {
          return (
            <div key={i} className="border rounded-xl overflow-hidden">
              <iframe
                srcDoc={att.content}
                className="w-full h-64 border-0"
                title={att.title || "HTML Preview"}
              />
              <div className="flex justify-between p-2 bg-gray-50">
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(att.content || "")
                  }
                  className="text-sm text-gray-600 underline"
                >
                  Copy Code
                </button>
              </div>
            </div>
          );
        }

        // -------------------------------------------------------------------
        // 3. STANDARD FILES (PDF, DOCX, XLSX)
        // -------------------------------------------------------------------
        return (
          <a
            key={i}
            href={att.dataUrl}
            download={att.filename}
            className="px-3 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700 inline-block"
          >
            Download {att.kind.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}