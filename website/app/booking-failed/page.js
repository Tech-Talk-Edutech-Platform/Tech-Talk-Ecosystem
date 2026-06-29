"use client"; // <--- THIS IS REQUIRED
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <--- Use Next.js router

export default function ErrorPage() {
  const router = useRouter(); // Initialize router
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    const timer = setTimeout(() => {
      router.push("/"); // Use router.push()
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center font-poppins bg-background px-4">
      <div className="bg-white p-8 rounded-2xl shadow-card text-center max-w-md border border-gray-100 text-gray-900">
        <h1 className="text-2xl font-bold text-secondary mb-1">Booking Failed</h1>
        <h2 className="text-3xl font-bold mb-4 text-primary">
          Oops! Something went wrong.
        </h2>
        <p className="text-gray-600 text-sm">
          We couldn't process your slot booking at this time. Please try again later.
        </p>
        
        <button
          onClick={() => router.push("/book-class")}
          className="mt-6 inline-block w-full bg-primary text-white font-semibold px-6 py-3 rounded-xl shadow-btn hover:opacity-90 transition text-center"
        >
          Try Again
        </button>
        
        <p className="mt-4 text-xs text-gray-400">
          Redirecting you to homepage in <span className="font-semibold text-secondary">{countdown}s</span>
        </p>
      </div>
    </div>
  );
}
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function ErrorPage() {
//   const navigate = useNavigate();
//   const [countdown, setCountdown] = useState(10);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCountdown((c) => c - 1);
//     }, 1000);

//     const timer = setTimeout(() => {
//       navigate("/");
//     }, 8000);

//     return () => {
//       clearInterval(interval);
//       clearTimeout(timer);
//     };
//   }, [navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center font-poppins bg-background">
//       <div className="bg-white p-8 rounded-xl shadow-card text-center">
//         <h1 className="text-2xl font-bold text-secondary">Booking Failed</h1>
//         <h1 className="text-4xl font-bold mb-4 text-text">
//           Oops! Something went wrong.
//         </h1>
//         <p className="text-text">Please try again later.</p>
//         <button
//           onClick={() => (window.location.href = "/book-class")}
//           className="mt-6 bg-primary text-white px-6 py-3 rounded-xl shadow-btn hover:opacity-90 transition"
//         >
//           Try Again
//         </button>
//         <p className="mt-2 text-gray-600">
//           Redirecting you to homepage in {countdown}s
//         </p>
//       </div>
//     </div>
//   );
// }
