"use client";

import { MessageCircle } from "lucide-react";

export default function ChatButton() {
  const handleClick = () => {
    window.open("https://wa.me/+254704494504", "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-3 left-5 md:left-auto md:right-5 bg-accent text-white p-4 rounded-full shadow-lg hover:bg-accent-dark z-50 flex items-center justify-center"
      aria-label="Chat with us"
    >
      <MessageCircle size={28} />
    </button>
  );
}