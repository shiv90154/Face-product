// components/ChatBotWrapper.js
"use client";

import dynamic from "next/dynamic";

// ✅ Lazy‑load ChatBot – only loads after the initial page load
const ChatBot = dynamic(() => import("./ChatBot"), {
  ssr: false,
});

export default function ChatBotWrapper() {
  return <ChatBot />;
}

