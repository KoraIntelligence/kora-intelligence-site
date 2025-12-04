// src/components/unifiedchat/ChatLayout.tsx
import React from "react";

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  chatWindow: React.ReactNode;
  identityOverlay?: React.ReactNode;
}

export default function ChatLayout({
  sidebar,
  chatWindow,
  identityOverlay,
}: ChatLayoutProps) {
  return (
    <div className="w-full h-screen flex bg-white text-gray-900 overflow-hidden">
      {/* Sidebar (desktop only) */}
      <aside className="hidden md:block w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        {sidebar}
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {chatWindow}
      </main>

      {/* Identity overlay */}
      {identityOverlay && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
          {identityOverlay}
        </div>
      )}
    </div>
  );
}