"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const validAmounts = {
  KES: [6000, 17100, 64800, 10000, 28500, 108000, 13000, 37050, 140400, 15500, 44175, 167400],
  USD: [45, 128, 486, 75, 214, 810, 97, 277, 1053, 116, 330, 1256],
};

function PaymentPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [planName, setPlanName] = useState("");
  const [planClasses, setPlanClasses] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  // Load Paystack script dynamically
  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Sync state with incoming query strings from Next.js URL parameters
  useEffect(() => {
    const amt = searchParams.get("amount");
    const curr = searchParams.get("currency");
    const plan = searchParams.get("planName");
    const classes = searchParams.get("planClasses");

    if (amt) setAmount(amt);
    if (curr) setCurrency(curr.toUpperCase());
    if (plan) setPlanName(plan);
    if (classes) setPlanClasses(classes);
  }, [searchParams]);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const validateInputs = () => {
    if (!studentName || !email || !amount) {
      setMessage({
        type: "error",
        text: "Please fill in all fields: student name, email, and amount.",
      });
      return false;
    }

    if (!validateEmail(email)) {
      setMessage({ type: "error", text: "Enter a valid email address." });
      return false;
    }

    const amtNumber = Number(amount);
    if (!validAmounts[currency]?.includes(amtNumber)) {
      setMessage({
        type: "error",
        text: `Invalid amount for ${currency}. Please select a valid plan.`,
      });
      return false;
    }

    return true;
  };

  const verifyPayment = async (reference, retries = 3) => {
    const url = "https://us-central1-tech-talk-hub.cloudfunctions.net/verifyPayment";
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference, studentName }),
        });
        const data = await res.json();

        if (data.status === "success") {
          setMessage({
            type: "success",
            text: `Payment successful! Reference: ${reference}`,
          });
          setEmail("");
          setAmount("");
          setStudentName("");
          return true;
        } else if (i === retries - 1) {
          setMessage({ type: "error", text: "Payment verification failed." });
          return false;
        }
      } catch (err) {
        if (i === retries - 1)
          setMessage({
            type: "error",
            text: "Server error. Try again later.",
          });
      }
    }
  };

  const handlePay = () => {
    if (!validateInputs()) return;

    if (typeof window.PaystackPop !== "object") {
      setMessage({
        type: "error",
        text: "Payment SDK not loaded yet. Please wait a few seconds and try again.",
      });
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PUBLIC_KEY,
      email: String(email),
      amount: Number(amount) * 100,
      currency: String(currency).toUpperCase(),
      metadata: { studentName: String(studentName) },
      callback: function (response) {
        if (!response?.reference) {
          setMessage({ type: "error", text: "No payment reference returned." });
          return;
        }
        setLoading(true);
        setMessage({ type: "info", text: "Verifying payment..." });
        verifyPayment(response.reference).then((success) => {
          setLoading(false);
          router.push(success ? "/paysuccess" : "/payerror");
        });
      },
      onClose: function () {
        setMessage({
          type: "error",
          text: "Payment popup closed without completing transaction.",
        });
        router.push("/");
      },
    });

    handler.openIframe();
  };

  const isPayDisabled = !studentName || !email || !amount || loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 font-poppins">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-md p-8 animate-fadeIn text-gray-900">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-r from-primary to-secondary w-16 h-16 flex items-center justify-center rounded-full shadow-md text-white text-2xl font-bold">
            TT
          </div>
          <h2 className="text-2xl font-bold text-primary mt-3">Tech Talk Hub</h2>
          <p className="text-gray-500 text-sm">Secure Payment Portal</p>
        </div>

        {/* Plan Summary */}
        {amount && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6 text-center border border-primary/20">
            <p className="font-semibold text-gray-800">
              Selected Plan:{" "}
              <span className="text-primary">{planName || "Custom Plan"}</span>
            </p>
            {planClasses && <p className="text-gray-600 text-sm mt-0.5">{planClasses}</p>}
            <p className="text-gray-700 mt-1">
              Amount:{" "}
              <span className="text-secondary font-semibold">
                {currency === "KES" ? `KES ${amount}` : `$${amount}`}
              </span>
            </p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter student's full name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:outline-none"
          />

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:outline-none"
          />

          <input
            type="number"
            placeholder={`Enter amount (${currency})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-secondary focus:outline-none"
          />

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={isPayDisabled}
            className={`w-full py-3 rounded-xl font-semibold transition shadow-btn text-white ${
              isPayDisabled
                ? "bg-gray-300 cursor-not-allowed text-gray-500 shadow-none"
                : "bg-gradient-to-r from-primary to-secondary hover:opacity-90 active:scale-[0.99]"
            }`}
          >
            {loading ? "Processing..." : `Pay Now (${currency})`}
          </button>
        </div>

        {/* Status Alert Notification boxes */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-xl border text-sm text-center ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : message.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Secure Footer Accent */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Payments are processed securely via Paystack 🔒
        </p>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary font-semibold">Loading Gateways...</div>}>
      <PaymentPortalContent />
    </Suspense>
  );
}