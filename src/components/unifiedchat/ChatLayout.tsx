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
    <div className="w-full h-screen flex bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100 overflow-hidden relative">
      {/* -------------------------------------------------- */}
      {/* DESKTOP SIDEBAR */}
      {/* -------------------------------------------------- */}
      <aside className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111111] overflow-y-auto">
        {sidebar}
      </aside>

      {/* -------------------------------------------------- */}
      {/* MOBILE SIDEBAR DRAWER */}
      {/* -------------------------------------------------- */}
      <div
        className={`
          fixed inset-y-0 left-0 w-64 
          bg-gray-50 dark:bg-[#111111]
          border-r border-gray-200 dark:border-gray-800 
          z-40
          transform transition-transform duration-300 md:hidden
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebar}

        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-300"
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
        {/* -------- Top Bar (WorkflowTopBar) -------- */}
        {topBar && (
          <div className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d0d0d] z-10">
            {topBar}
          </div>
        )}

        {/* -------- Chat Window -------- */}
        <div className="flex-1 overflow-hidden">
          {chatWindow}
        </div>
      </main>

      {/* -------------------------------------------------- */}
      {/* IDENTITY OVERLAY */}
      {/* -------------------------------------------------- */}
      {identityOverlay && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
          {identityOverlay}
        </div>
      )}
    </div>
  );
}