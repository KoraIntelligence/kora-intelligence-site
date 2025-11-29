import React from "react";

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  chatWindow: React.ReactNode;
  chatInput: React.ReactNode;
  identityOverlay?: React.ReactNode;
  attachmentDrawer?: React.ReactNode;
}

export default function ChatLayout({
  sidebar,
  chatWindow,
  chatInput,
  identityOverlay,
  attachmentDrawer,
}: ChatLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 to-white flex justify-center px-4 py-6">
      <div
        className="
          relative 
          w-full 
          max-w-7xl 
          rounded-3xl 
          shadow-lg 
          border 
          border-amber-100 
          bg-white/50 
          backdrop-blur-md 
          overflow-hidden 
          grid 
          grid-cols-1 
          md:grid-cols-[260px_1fr]
        "
      >
        {/* ================================================= */}
        {/* SIDEBAR (DESKTOP) */}
        {/* ================================================= */}
        <aside
          className="
            hidden 
            md:block 
            border-r 
            border-amber-100 
            bg-amber-50/40 
            p-4 
            overflow-y-auto
          "
        >
          {sidebar}
        </aside>

        {/* ================================================= */}
        {/* MAIN CHAT AREA */}
        {/* ================================================= */}
        <section className="flex flex-col max-h-screen relative">
          {/* CHAT WINDOW */}
          <div
            id="chat-scroll-container"
            className="
              flex-1 
              overflow-y-auto 
              p-6 
              bg-white/80 
              scroll-smooth
            "
          >
            {chatWindow}
          </div>

          {/* CHAT INPUT BAR */}
          <div
            className="
              border-t 
              border-amber-100 
              bg-white 
              p-4 
              sticky 
              bottom-0 
              z-20
            "
          >
            {chatInput}
          </div>
        </section>

        {/* ================================================= */}
        {/* MOBILE SIDEBAR */}
        {/* ================================================= */}
        <div
          className="
            md:hidden 
            fixed 
            top-0 
            left-0 
            right-0 
            bg-amber-50/95 
            border-b 
            border-amber-200 
            z-40 
            shadow-sm 
            p-3 
            backdrop-blur-md
          "
        >
          {sidebar}
        </div>

        {/* ================================================= */}
        {/* IDENTITY OVERLAY */}
        {/* ================================================= */}
        {identityOverlay && (
          <div
            className="
              absolute 
              inset-0 
              z-50 
              flex 
              items-center 
              justify-center 
              bg-black/40
            "
          >
            {identityOverlay}
          </div>
        )}

        {/* ================================================= */}
        {/* ATTACHMENT DRAWER */}
        {/* ================================================= */}
        {attachmentDrawer && (
          <div
            className="
              absolute 
              inset-x-0 
              bottom-0 
              z-30 
              bg-white 
              border-t 
              border-gray-200 
              shadow-xl
            "
          >
            {attachmentDrawer}
          </div>
        )}
      </div>
    </div>
  );
}