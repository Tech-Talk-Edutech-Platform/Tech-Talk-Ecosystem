"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/next/link";

export default function PaymentFailed() {
  const [count, setCount] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          router.push("/pricing");
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-poppins px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center border border-gray-100">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-secondary mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-700 mb-4">
          Oops! Something went wrong with your transaction. Please try again or
          use another payment method.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Redirecting to Pricing in <span className="font-semibold text-secondary">{count}s</span>...
        </p>
        <Link
          href="/pricing"
          className="inline-block px-6 py-3 bg-secondary text-white font-medium rounded-xl shadow-btn hover:bg-primary transition-all duration-200"
        >
          Back to Pricing
        </Link>
      </div>
    </div>
  );
}