// src/components/unifiedchat/ChatLayout.tsx

import React from "react";
import { useUIState } from "@/context/UIStateContext";

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  topBar?: React.ReactNode;
  chatWindow: React.ReactNode;
  identityOverlay?: React.ReactNode;
}

export default function ChatLayout({
  sidebar,
  topBar,
  chatWindow,
  identityOverlay,
}: ChatLayoutProps) {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIState();

  return (
    <div
      className="
        w-full h-screen flex 
        bg-white dark:bg-[#0d0d0d] 
        text-gray-900 dark:text-gray-100 
        overflow-hidden relative
      "
    >
      {/* -------------------------------------------------- */}
      {/* DESKTOP SIDEBAR */}
      {/* -------------------------------------------------- */}
      <aside
        className="
          hidden md:block 
          w-64 
          border-r border-gray-200 dark:border-neutral-800
          bg-gray-50 dark:bg-neutral-900 
          overflow-y-auto
        "
      >
        {sidebar}
      </aside>

      {/* -------------------------------------------------- */}
      {/* MOBILE SIDEBAR DRAWER */}
      {/* -------------------------------------------------- */}
      <div
        className={`
          fixed inset-y-0 left-0 w-64 
          bg-gray-50 dark:bg-neutral-900
          border-r border-gray-200 dark:border-neutral-800
          z-40
          transform transition-transform duration-300 md:hidden
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebar}

        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300"
          onClick={() => setMobileSidebarOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Mobile overlay behind drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* -------------------------------------------------- */}
      {/* MAIN CHAT AREA */}
      {/* -------------------------------------------------- */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-[#0d0d0d]">

  {/* MOBILE MENU OPEN BUTTON */}
  <button
    onClick={() => setMobileSidebarOpen(true)}
    className="md:hidden absolute top-3 left-3 z-20 
               p-2 rounded-lg bg-neutral-800 text-gray-200 
               dark:bg-neutral-700 dark:text-gray-100 
               shadow-md border border-neutral-700"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
        {/* ---- Top Bar (WorkflowTopBar) ---- */}
        {topBar && (
          <div
            className="
              shrink-0 
              border-b border-gray-200 dark:border-neutral-800
              bg-white dark:bg-[#111111]
              z-10
            "
          >
            {topBar}
          </div>
        )}

        {/* ---- Chat Window ---- */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-[#0d0d0d]">
          {chatWindow}
        </div>
      </main>

      {/* -------------------------------------------------- */}
      {/* IDENTITY OVERLAY */}
      {/* -------------------------------------------------- */}
      {identityOverlay && (
        <div
          className="
            absolute inset-0 z-50 
            bg-black/50 
            flex items-center justify-center
          "
        >
          {identityOverlay}
        </div>
      )}
    </div>
  );
}