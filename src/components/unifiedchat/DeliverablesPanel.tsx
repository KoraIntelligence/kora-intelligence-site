// src/components/unifiedchat/DeliverablesPanel.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Export = {
  id: string;
  fileName: string;
  fileType: "pdf" | "docx" | "xlsx";
  downloadUrl?: string;
  createdAt: string;
};

type DeliverablesPanelProps = {
  open: boolean;
  onClose: () => void;
  companion: "salar" | "lyra";
  mode: string;
  exports: Export[];
  onGenerateExport?: (format: "pdf" | "docx" | "xlsx") => void;
  isGenerating?: boolean;
};

const FORMAT_LABELS: Record<"pdf" | "docx" | "xlsx", string> = {
  pdf: "PDF",
  docx: "DOCX",
  xlsx: "XLSX",
};

export default function DeliverablesPanel({
  open,
  onClose,
  companion,
  mode,
  exports,
  onGenerateExport,
  isGenerating = false,
}: DeliverablesPanelProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "docx" | "xlsx">("pdf");

  const isLyra = companion === "lyra";

  /* ── Accent tokens ─────────────────────────────────────── */
  const accentText = isLyra
    ? "text-teal-500 dark:text-teal-400"
    : "text-yellow-500 dark:text-yellow-400";

  const accentBg = isLyra
    ? "bg-teal-600 dark:bg-teal-500"
    : "bg-yellow-600 dark:bg-yellow-500";

  const accentBgLight = isLyra
    ? "bg-teal-500/10 dark:bg-teal-500/10"
    : "bg-yellow-500/10 dark:bg-yellow-500/10";

  const accentBadge = isLyra
    ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/20"
    : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/20";

  const accentHoverBg = isLyra
    ? "hover:bg-teal-500/10"
    : "hover:bg-yellow-500/10";

  const avatarLetter = companion === "lyra" ? "L" : "S";
  const companionLabel = companion === "lyra" ? "Lyra" : "Salar";
  const modeLabel = mode.replace(/_/g, " ");

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="
          w-80 flex flex-col p-0
          bg-white dark:bg-[#171717]
          border-l border-gray-100 dark:border-neutral-800
        "
      >
        {/* ── Header ───────────────────────────────────────── */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`
                flex-shrink-0 w-7 h-7 rounded-full
                flex items-center justify-center
                text-[11px] font-semibold uppercase
                ${accentBgLight} ${accentText}
              `}
            >
              {avatarLetter}
            </div>

            {/* Title + subtitle */}
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                Deliverables
              </SheetTitle>
              <p className="text-[10px] text-gray-400 dark:text-gray-400 tracking-wide uppercase mt-0.5 truncate">
                {companionLabel} · {modeLabel}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* ── Body ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

          {/* Export format selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-400 font-medium">
              Export as
            </span>
            <Select
              value={exportFormat}
              onValueChange={(v) => setExportFormat(v as "pdf" | "docx" | "xlsx")}
            >
              <SelectTrigger
                className="
                  h-8 text-xs
                  bg-white dark:bg-[#222222]
                  border-gray-200 dark:border-neutral-800
                  text-gray-700 dark:text-gray-300
                  rounded-lg
                "
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#222222] border-gray-100 dark:border-neutral-800">
                <SelectItem value="pdf" className="text-xs">PDF Document</SelectItem>
                <SelectItem value="docx" className="text-xs">Word Document (.docx)</SelectItem>
                <SelectItem value="xlsx" className="text-xs">Spreadsheet (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exports list */}
          <div className="flex flex-col gap-2 flex-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-400 font-medium">
              Generated
            </span>

            {exports.length === 0 ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
                <div
                  className={`
                    w-12 h-12 rounded-full
                    flex items-center justify-center
                    text-xl font-semibold uppercase
                    ${accentBgLight} ${accentText}
                  `}
                >
                  {avatarLetter}
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-400 text-center leading-relaxed max-w-[160px]">
                  Your deliverables will appear here
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {exports.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                  >
                    <Card
                      className="
                        flex items-center gap-3 px-3 py-2.5
                        bg-white dark:bg-[#222222]
                        border border-gray-100 dark:border-neutral-800
                        rounded-lg
                      "
                    >
                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium leading-tight">
                          {exp.fileName}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5">
                          {new Date(exp.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Type badge */}
                      <Badge
                        className={`
                          text-[9px] font-medium px-1.5 py-0.5
                          border rounded-md uppercase tracking-wide
                          ${accentBadge}
                        `}
                      >
                        {FORMAT_LABELS[exp.fileType]}
                      </Badge>

                      {/* Download button */}
                      {exp.downloadUrl && (
                        <a
                          href={exp.downloadUrl}
                          download={exp.fileName}
                          className={`
                            flex-shrink-0 p-1.5 rounded-md
                            ${accentText} ${accentHoverBg}
                            transition-colors duration-150
                          `}
                        >
                          <Download size={14} strokeWidth={1.8} />
                        </a>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer: Generate button ───────────────────────── */}
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
          <button
            onClick={() => onGenerateExport?.(exportFormat)}
            disabled={isGenerating}
            className={`
              w-full py-2.5 rounded-lg
              text-xs font-medium text-white
              ${accentBg}
              transition-all duration-150
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {isGenerating ? (
              <span className="flex items-center gap-[4px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-[4px] h-[4px] rounded-full bg-white"
                    style={{
                      animation: `kora-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </span>
            ) : (
              `Generate ${FORMAT_LABELS[exportFormat]}`
            )}
          </button>
        </div>

        <style jsx>{`
          @keyframes kora-pulse {
            0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </SheetContent>
    </Sheet>
  );
}
