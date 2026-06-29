"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/next/link";

export default function PaymentSuccess() {
  const [count, setCount] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          router.push("/");
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-poppins px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center border border-gray-100">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-primary mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-700 mb-4">
          Thank you for enrolling. We’ve received your payment and sent a
          confirmation to your email.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Redirecting to Dashboard in <span className="font-semibold text-primary">{count}s</span>...
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-xl shadow-btn hover:bg-secondary transition-all duration-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}