import React from "react";
import { MessageCircle } from "lucide-react";

export default function ChatButton() {
  const handleClick = () => {
    window.location.href = "https://wa.me/+254704494504"; // WhatsApp link, or open your chat system
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
