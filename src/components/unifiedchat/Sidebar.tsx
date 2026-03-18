// src/components/unifiedchat/Sidebar.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  ChevronRight,
  Settings,
  Search,
  Plus,
  MessageSquare,
} from "lucide-react";
import { SalarMode } from "@/companions/orchestrators/salar";
import { LyraMode } from "@/companions/orchestrators/lyra";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import BrandSettingsSheet from "@/components/unifiedchat/BrandSettingsSheet";

interface SidebarProps {
  companion: "salar" | "lyra";
  setCompanion: (c: "salar" | "lyra") => void;
  salarMode: SalarMode;
  setSalarMode: (m: SalarMode) => void;
  lyraMode: LyraMode;
  setLyraMode: (m: LyraMode) => void;
  toneSelector?: React.ReactNode;
  onSwitchMode?: () => void;
}

const SALAR_MODE_LABELS: Record<SalarMode, string> = {
  commercial_chat: "Commercial Chat",
  proposal_builder: "Proposal Builder",
  contract_advisor: "Contract Advisor",
  pricing_estimation: "Pricing & Estimation",
  commercial_strategist: "Commercial Strategist",
};

const LYRA_MODE_LABELS: Record<LyraMode, string> = {
  creative_chat: "Creative Chat",
  messaging_advisor: "Messaging Advisor",
  campaign_builder: "Campaign Builder",
  lead_outreach: "Lead Outreach",
  customer_nurture: "Customer Nurture",
};

/* ── Integration icon with HoverCard tooltip ────────────── */
function IntegrationIcon({
  label,
  letter,
  description,
}: {
  label: string;
  letter: string;
  description: string;
}) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          disabled
          aria-label={label}
          className="
            w-6 h-6 rounded-md flex items-center justify-center
            text-[9px] font-bold uppercase
            bg-gray-100 dark:bg-neutral-800
            border border-gray-200 dark:border-neutral-700
            text-gray-400 dark:text-gray-400
            cursor-not-allowed opacity-60
            transition-opacity duration-150 hover:opacity-80
          "
        >
          {letter}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="center"
        className="
          w-44 p-2.5
          bg-white dark:bg-[#222222]
          border border-gray-100 dark:border-neutral-800
          shadow-lg rounded-lg text-left
        "
      >
        <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
          {label}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5 leading-relaxed">
          {description}
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function Sidebar({
  companion,
  setCompanion,
  salarMode,
  setSalarMode,
  lyraMode,
  setLyraMode,
  toneSelector,
  onSwitchMode,
}: SidebarProps) {
  const supabase = useSupabaseClient();
  const user = useUser();

  const isLyra = companion === "lyra";
  const modeLabels = isLyra ? LYRA_MODE_LABELS : SALAR_MODE_LABELS;
  const activeMode = isLyra ? lyraMode : salarMode;

  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [brandSettingsOpen, setBrandSettingsOpen] = useState(false);
  const [tone, setTone] = useState("calm");
  const [brandName, setBrandName] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("kora_streaming");
    setStreamingEnabled(stored === "true");

    const storedBrand = localStorage.getItem("kora_brand_name");
    setBrandName(storedBrand || null);
  }, []);

  const handleBrandSheetClose = () => {
    setBrandSettingsOpen(false);
    const updated = localStorage.getItem("kora_brand_name");
    setBrandName(updated || null);
  };

  const toggleStreaming = () => {
    const next = !streamingEnabled;
    setStreamingEnabled(next);
    localStorage.setItem("kora_streaming", String(next));
  };

  const handleLogout = async () => {
    const isGuest = localStorage.getItem("guest_mode") === "true";
    if (isGuest) {
      localStorage.removeItem("guest_mode");
    } else {
      await supabase.auth.signOut({ scope: "global" });
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/auth";
  };

  /* ── Accent tokens ─────────────────────────────────────── */
  const accentText = isLyra
    ? "text-teal-500 dark:text-teal-400"
    : "text-yellow-500 dark:text-yellow-400";

  const accentBorderColor = isLyra
    ? "border-teal-500 dark:border-teal-400"
    : "border-yellow-500 dark:border-yellow-400";

  const accentBg = isLyra
    ? "bg-teal-600 dark:bg-teal-500"
    : "bg-yellow-600 dark:bg-yellow-500";

  const accentAvatarBg = isLyra
    ? "bg-teal-500/20 dark:bg-teal-500/20"
    : "bg-yellow-500/20 dark:bg-yellow-500/20";

  const checkboxAccent = isLyra ? "accent-teal-500" : "accent-yellow-500";

  const toggleActiveBg = isLyra
    ? "data-[state=on]:bg-teal-600 data-[state=on]:text-white"
    : "data-[state=on]:bg-yellow-600 data-[state=on]:text-white";

  const brandBadgeClass = brandName
    ? isLyra
      ? "border-teal-500/40 text-teal-600 dark:text-teal-400 dark:border-teal-400/30 hover:border-teal-500/70"
      : "border-yellow-500/40 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400/30 hover:border-yellow-500/70"
    : "border-gray-200 dark:border-neutral-700 text-gray-400 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600";

  const displayName = user?.user_metadata?.full_name || user?.email || "Guest";
  const displayEmail = user?.email || "guest session";
  const avatarLetter = companion === "lyra" ? "L" : "S";

  return (
    <>
      <div
        className="
          w-56 flex flex-col h-full
          bg-[#171717]
          border-r border-neutral-800/60
          p-4
          gap-5
        "
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex-shrink-0">
              Kora
            </span>

            {/* 10.3: Workspace Memory Indicator */}
            <button
              onClick={() => setBrandSettingsOpen(true)}
              title={brandName ? `Brand: ${brandName} — click to edit` : "Set up brand memory"}
              className="min-w-0 flex-1"
            >
              <Badge
                variant="outline"
                className={`
                  text-[8px] tracking-widest uppercase font-medium px-1.5 py-0.5
                  rounded-full cursor-pointer block truncate max-w-[72px]
                  transition-colors duration-150
                  ${brandBadgeClass}
                `}
              >
                {brandName ?? "No brand"}
              </Badge>
            </button>
          </div>

          <button
            title="New session"
            className="
              p-1.5 rounded-md flex-shrink-0
              text-gray-400 hover:text-gray-700
              dark:text-gray-400 dark:hover:text-gray-300
              transition-colors duration-150
            "
            onClick={() => {
              /* new session logic — wired in v2 */
            }}
          >
            <RotateCcw size={13} strokeWidth={2} />
          </button>
        </div>

        {/* ── Companion Toggle ─────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium">
            Companion
          </span>

          <div className="relative flex rounded-lg bg-gray-100 dark:bg-[#222222] p-0.5">
            {(["salar", "lyra"] as const).map((c) => {
              const isActive = companion === c;
              return (
                <button
                  key={c}
                  onClick={() => setCompanion(c)}
                  className="relative flex-1 py-1.5 text-xs font-medium rounded-md z-10 transition-colors duration-150"
                  style={{ color: isActive ? "white" : undefined }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="companion-pill"
                      className={`absolute inset-0 rounded-md ${accentBg}`}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      isActive
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                    }`}
                  >
                    {c === "salar" ? "Salar" : "Lyra"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Mode List ───────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={onSwitchMode}
            className="flex items-center w-fit text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-150"
          >
            Switch Mode
          </button>

          <div className="flex flex-col relative">
            <AnimatePresence>
              {Object.entries(modeLabels).map(([key, label]) => {
                const isActive = key === activeMode;
                return (
                  <button
                    key={key}
                    onClick={() =>
                      isLyra
                        ? setLyraMode(key as LyraMode)
                        : setSalarMode(key as SalarMode)
                    }
                    className={`
                      relative w-full text-left text-xs py-1.5 transition-all duration-150
                      ${
                        isActive
                          ? `pl-3 border-l-[3px] ${accentBorderColor} ${accentText} font-medium`
                          : "pl-[15px] text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 border-l-[3px] border-transparent"
                      }
                    `}
                  >
                    {label}
                  </button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Sessions (v2 scaffold) ───────────────────────────── */}
        <Collapsible open={sessionsOpen} onOpenChange={setSessionsOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 w-full group">
              <span className="text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium">
                Sessions
              </span>
              <span
                className="
                  text-[9px] px-1.5 py-0.5 rounded-full
                  bg-gray-200 dark:bg-neutral-800
                  text-gray-500 dark:text-gray-400
                  font-medium leading-none
                "
              >
                0
              </span>
              <motion.span
                animate={{ rotate: sessionsOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="ml-auto text-gray-400 dark:text-gray-400"
              >
                <ChevronRight size={11} />
              </motion.span>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-2 space-y-2">
              {/* Search — v2 will wire this to session history */}
              <div className="relative">
                <Search
                  size={10}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search sessions…"
                  disabled
                  className="
                    w-full pl-7 pr-2 py-1.5 text-[11px] rounded-md
                    bg-gray-100 dark:bg-neutral-800/60
                    border border-gray-200 dark:border-neutral-700/60
                    text-gray-500 dark:text-gray-500
                    placeholder:text-gray-400 dark:placeholder:text-gray-400
                    cursor-not-allowed opacity-70
                    focus:outline-none
                  "
                />
              </div>

              {/* Empty state */}
              <div className="flex flex-col items-center py-3 gap-1.5">
                <MessageSquare
                  size={14}
                  className="text-gray-300 dark:text-gray-300"
                  strokeWidth={1.5}
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-400 text-center leading-relaxed">
                  Sessions will appear here as you chat.
                </p>
                <p className="text-[9px] text-gray-300 dark:text-gray-300 italic">
                  Full history in v2
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* ── Integrations (v2/v3 scaffold) ────────────────────── */}
        <Collapsible open={integrationsOpen} onOpenChange={setIntegrationsOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 w-full group">
              <span className="text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium">
                Integrations
              </span>
              <motion.span
                animate={{ rotate: integrationsOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="ml-auto text-gray-400 dark:text-gray-400"
              >
                <ChevronRight size={11} />
              </motion.span>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-2 flex items-center gap-1.5">
              <IntegrationIcon
                label="Google Drive"
                letter="G"
                description="Connect Drive to bring documents directly into Kora. Coming in v2."
              />
              <IntegrationIcon
                label="Canva"
                letter="C"
                description="Export campaign assets and deliverables directly to Canva. Coming in v3."
              />

              {/* Connect tools */}
              <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <button
                    disabled
                    aria-label="Connect tools"
                    className="
                      w-6 h-6 rounded-md flex items-center justify-center
                      bg-gray-100 dark:bg-neutral-800
                      border border-dashed border-gray-200 dark:border-neutral-700
                      text-gray-400 dark:text-gray-400
                      cursor-not-allowed opacity-60
                      transition-opacity duration-150 hover:opacity-80
                    "
                  >
                    <Plus size={10} strokeWidth={2} />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent
                  side="right"
                  align="center"
                  className="
                    w-44 p-2.5
                    bg-white dark:bg-[#222222]
                    border border-gray-100 dark:border-neutral-800
                    shadow-lg rounded-lg text-left
                  "
                >
                  <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                    Connect tools
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5 leading-relaxed">
                    Drive, Canva, HubSpot and more are coming in v2–v3.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* ── Tone ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-400 font-medium">
            Tone
          </span>

          <ToggleGroup
            type="single"
            value={tone}
            onValueChange={(v) => { if (v) setTone(v); }}
            className="flex gap-1"
          >
            {["Calm", "Bold", "Warm"].map((t) => (
              <ToggleGroupItem
                key={t}
                value={t.toLowerCase()}
                className={`
                  flex-1 text-[10px] h-7 rounded-md font-medium
                  border border-gray-200 dark:border-neutral-800
                  text-gray-500 dark:text-gray-500
                  data-[state=on]:border-transparent
                  data-[state=on]:text-white
                  ${toggleActiveBg}
                  transition-all duration-150
                `}
              >
                {t}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {toneSelector && (
            <div className="mt-1">{toneSelector}</div>
          )}
        </div>

        {/* ── Spacer ───────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Bottom: User + Popover ───────────────────────────── */}
        <div className="pt-3 border-t border-gray-100 dark:border-neutral-800/60">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2.5 w-full group">
                <div
                  className={`
                    flex-shrink-0 w-7 h-7 rounded-full
                    flex items-center justify-center
                    text-[11px] font-semibold uppercase
                    ${accentAvatarBg} ${accentText}
                  `}
                >
                  {avatarLetter}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs text-gray-700 dark:text-gray-300 truncate leading-tight font-medium">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-400 truncate leading-tight">
                    {displayEmail}
                  </p>
                </div>

                <Settings
                  size={12}
                  className="
                    flex-shrink-0
                    text-gray-400 dark:text-gray-400
                    group-hover:text-gray-600 dark:group-hover:text-gray-400
                    transition-colors duration-150
                  "
                />
              </button>
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align="start"
              className="
                w-52 p-2
                bg-white dark:bg-[#222222]
                border border-gray-100 dark:border-neutral-800
                shadow-lg rounded-xl
              "
            >
              {/* Brand Settings */}
              <button
                onClick={() => setBrandSettingsOpen(true)}
                className="
                  w-full flex items-center justify-between px-2 py-1.5 rounded-md
                  hover:bg-gray-50 dark:hover:bg-white/5
                  transition-colors duration-150
                "
              >
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  Brand Settings
                </span>
                {brandName ? (
                  <span className={`text-[9px] font-medium truncate max-w-[72px] ${accentText}`}>
                    {brandName}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    Not set
                  </span>
                )}
              </button>

              <div className="h-px bg-gray-100 dark:bg-neutral-800 my-1" />

              {/* Streaming toggle */}
              <label className="flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  Streaming{" "}
                  <sup className="text-[9px] text-gray-400 dark:text-gray-500">
                    Beta
                  </sup>
                </span>
                <input
                  type="checkbox"
                  checked={streamingEnabled}
                  onChange={toggleStreaming}
                  className={`${checkboxAccent} w-3.5 h-3.5`}
                />
              </label>

              <div className="h-px bg-gray-100 dark:bg-neutral-800 my-1" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="
                  w-full text-left px-2 py-1.5 rounded-md
                  text-xs text-red-500 hover:text-red-600
                  hover:bg-red-50 dark:hover:bg-red-500/10
                  transition-colors duration-150
                "
              >
                Logout
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <BrandSettingsSheet
        isOpen={brandSettingsOpen}
        companion={companion}
        onClose={handleBrandSheetClose}
      />
    </>
  );
}
