// src/components/unifiedchat/ChatLayout.tsx

import React from "react";

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  topBar?: React.ReactNode;
  chatWindow: React.ReactNode;
  identityOverlay?: React.ReactNode;
  attachmentDrawer?: React.ReactNode;
}

export default function ChatLayout({
  sidebar,
  topBar,
  chatWindow,
  identityOverlay,
  attachmentDrawer,
}: ChatLayoutProps) {
  return (
    <div className="w-full h-screen bg-white text-gray-900 flex overflow-hidden">

      {/* --------------------------------------------------- */}
      {/* SIDEBAR (DESKTOP)                                   */}
      {/* --------------------------------------------------- */}
      <aside
        className="
          hidden 
          lg:flex 
          flex-col 
          w-64 
          border-r 
          border-gray-200 
          bg-gray-50 
          p-4 
          overflow-y-auto
        "
      >
        {sidebar}
      </aside>

      {/* --------------------------------------------------- */}
      {/* MOBILE TOP BAR (SIDEBAR COLLAPSED)                  */}
      {/* --------------------------------------------------- */}
      <div
        className="
          lg:hidden
          fixed
          top-0 left-0 right-0
          z-30
          bg-white
          shadow-sm
          border-b border-gray-200
          p-3
        "
      >
        {sidebar}
      </div>

      {/* --------------------------------------------------- */}
      {/* MAIN AREA                                           */}
      {/* --------------------------------------------------- */}
      <main className="flex-1 flex flex-col relative">

        {/* TOP BAR AREA (Workflow, mode info, etc.) */}
        {topBar && (
          <div
            className="
              h-16
              border-b 
              border-gray-200 
              bg-white 
              flex 
              items-center 
              px-4 
              z-10 
              relative
            "
          >
            {topBar}
          </div>
        )}

        {/* CHAT WINDOW (full remaining height) */}
        <div className="flex-1 relative overflow-hidden">
          {chatWindow}
        </div>
      </main>

      {/* --------------------------------------------------- */}
      {/* IDENTITY OVERLAY                                    */}
      {/* --------------------------------------------------- */}
      {identityOverlay && (
        <div className="absolute inset-0 z-40 bg-black/40 flex items-center justify-center">
          {identityOverlay}
        </div>
      )}

      {/* --------------------------------------------------- */}
      {/* ATTACHMENT DRAWER                                   */}
      {/* --------------------------------------------------- */}
      {attachmentDrawer && (
        <div
          className="
            absolute 
            inset-x-0 
            bottom-0 
            z-40 
            bg-white 
            border-t 
            border-gray-300 
            shadow-xl
          "
        >
          {attachmentDrawer}
        </div>
      )}
    </div>
  );
}