"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center font-poppins bg-green-50 px-4">
      <div className="bg-accent p-10 rounded-2xl text-white text-center max-w-md shadow-card border border-white/10">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-3 tracking-wide">Booking Successful!</h1>
        <p className="text-white/90 text-sm font-medium">
          Your child's interactive slot has been secured. You will receive a confirmation email with access details soon.
        </p>
        
        <Link
          href="/"
          className="mt-6 inline-block w-full bg-primary text-white font-semibold px-6 py-3 rounded-xl shadow-btn hover:scale-[1.02] transition-transform duration-150 text-center"
        >
          Back to Home
        </Link>
        
        <p className="mt-4 text-xs text-white/70">
          Redirecting you to homepage in <span className="font-bold text-white">{countdown}s</span>
        </p>
      </div>
    </div>
  );
}