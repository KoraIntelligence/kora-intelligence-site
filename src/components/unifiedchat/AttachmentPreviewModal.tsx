// src/components/unifiedchat/AttachmentPreviewModal.tsx
import React from "react";
import type { Attachment } from "@/types/chat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Download, Lock } from "lucide-react";

interface AttachmentPreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

function getKindLabel(kind: Attachment["kind"]): string {
  switch (kind) {
    case "pdf":     return "PDF";
    case "docx":    return "DOCX";
    case "xlsx":    return "XLSX";
    case "html":    return "HTML";
    case "preview": return "Preview";
  }
}

function getDisplayTitle(attachment: Attachment): string {
  switch (attachment.kind) {
    case "pdf":
    case "docx":
    case "xlsx":
      return attachment.filename;
    case "html":
      return attachment.title ?? "HTML Preview";
    case "preview":
      return attachment.title;
  }
}

type DownloadableAttachment = Extract<Attachment, { kind: "pdf" | "docx" | "xlsx" }>;

function isDownloadable(a: Attachment): a is DownloadableAttachment {
  return a.kind === "pdf" || a.kind === "docx" || a.kind === "xlsx";
}

function triggerDownload(a: DownloadableAttachment) {
  const el = document.createElement("a");
  el.href = a.dataUrl;
  el.download = a.filename;
  el.click();
}

export default function AttachmentPreviewModal({
  attachment,
  onClose,
}: AttachmentPreviewModalProps) {
  const isDoc = attachment && isDownloadable(attachment);

  // Document types (pdf/docx/xlsx) = amber badge, structural = muted
  const isDocType =
    attachment?.kind === "pdf" ||
    attachment?.kind === "docx" ||
    attachment?.kind === "xlsx";

  const badgeClass = isDocType
    ? "border-yellow-500/40 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400/30"
    : "border-gray-300/50 text-gray-400 dark:border-neutral-700 dark:text-gray-400";

  return (
    <Dialog open={!!attachment} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="
          max-w-3xl w-full h-[82vh] flex flex-col p-0 gap-0
          bg-white dark:bg-[#171717]
          border border-gray-100 dark:border-neutral-800
          rounded-xl overflow-hidden
          [&>button[data-radix-dialog-close]]:hidden
        "
      >
        {/* ── Header ─────────────────────────────────────── */}
        <DialogHeader className="flex-shrink-0 px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            {attachment && (
              <Badge
                variant="outline"
                className={`
                  text-[9px] tracking-widest uppercase
                  px-2 py-0.5 rounded-full font-medium flex-shrink-0
                  ${badgeClass}
                `}
              >
                {getKindLabel(attachment.kind)}
              </Badge>
            )}
            <DialogTitle className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate flex-1 text-left leading-normal">
              {attachment ? getDisplayTitle(attachment) : ""}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* ── Content ────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">

          {/* PDF embed */}
          {attachment?.kind === "pdf" && (
            <embed
              src={attachment.dataUrl}
              type="application/pdf"
              className="w-full h-full"
            />
          )}

          {/* DOCX fallback */}
          {attachment?.kind === "docx" && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-5 bg-gray-50 dark:bg-[#222222]">
              <div className="text-center space-y-1.5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  DOCX preview unavailable
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-400">
                  Download the file to view it in Word or a compatible application.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-400 text-white gap-1.5"
                onClick={() => triggerDownload(attachment)}
              >
                <Download size={13} />
                Download DOCX
              </Button>
            </div>
          )}

          {/* XLSX fallback */}
          {attachment?.kind === "xlsx" && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-5 bg-gray-50 dark:bg-[#222222]">
              <div className="text-center space-y-1.5">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Excel preview unavailable
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-400">
                  Download the file to view it in Excel or Google Sheets.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-400 text-white gap-1.5"
                onClick={() => triggerDownload(attachment)}
              >
                <Download size={13} />
                Download Excel
              </Button>
            </div>
          )}

          {/* HTML iframe */}
          {attachment?.kind === "html" && (
            <iframe
              srcDoc={attachment.content}
              className="w-full h-full border-0"
              title="HTML Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          )}

          {/* Preview / rich content */}
          {attachment?.kind === "preview" && (
            <div className="w-full h-full overflow-y-auto px-8 py-7">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 leading-snug">
                {attachment.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                {attachment.body}
              </p>
              {attachment.canvaUrl && (
                <Button
                  size="sm"
                  className="mt-6 bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                  onClick={() => window.open(attachment.canvaUrl!, "_blank")}
                >
                  Open in Canva
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="
          flex-shrink-0 px-5 py-3
          border-t border-gray-100 dark:border-neutral-800
          flex items-center justify-between
          bg-gray-50/50 dark:bg-[#0f0f0f]
        ">
          {/* v2 scaffold */}
          <HoverCard openDelay={250}>
            <HoverCardTrigger asChild>
              {/* Wrap in span so HoverCard works on a disabled button */}
              <span tabIndex={0} className="inline-flex">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="gap-1.5 text-xs opacity-35 cursor-not-allowed pointer-events-none"
                >
                  <Lock size={11} />
                  Save to workspace
                </Button>
              </span>
            </HoverCardTrigger>
            <HoverCardContent
              side="top"
              align="start"
              className="
                text-[11px] w-60 leading-relaxed
                bg-white dark:bg-[#222222]
                border border-gray-100 dark:border-neutral-800
                text-gray-500 dark:text-gray-400
                shadow-lg rounded-lg
              "
            >
              Coming in v2 — files will persist across sessions once workspace storage is enabled.
            </HoverCardContent>
          </HoverCard>

          {/* Right: download + close */}
          <div className="flex items-center gap-2">
            {isDoc && attachment && (
              <Button
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-400 text-white gap-1.5 text-xs h-8"
                onClick={() => triggerDownload(attachment as DownloadableAttachment)}
              >
                <Download size={12} />
                Download
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-gray-500 dark:text-gray-400 h-8"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
