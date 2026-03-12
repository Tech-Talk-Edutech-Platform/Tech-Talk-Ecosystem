// import React, { useEffect, useState } from "react";
// import { QRCodeSVG } from "qrcode.react";
// import { supabase } from "../supabase"; // adjust path

// export default function Receipt({ receiptId }) {
//   const [receipt, setReceipt] = useState(null);

//   // Fetch receipt data dynamically from Supabase
//   useEffect(() => {
//     if (!receiptId) return;

//     const fetchReceipt = async () => {
//       const { data, error } = await supabase
//         .from("receipts")
//         .select("*, items:invoice_items(*)")
//         .eq("id", receiptId)
//         .single();

//       if (error) {
//         console.error("Error fetching receipt:", error);
//         return;
//       }

//       setReceipt(data);
//     };

//     fetchReceipt();
//   }, [receiptId]);

//   if (!receipt) return <p>Loading receipt...</p>;

//   const subtotal = receipt.items.reduce((sum, i) => sum + i.amount * i.qty, 0);
//   const totalPaid = subtotal - (receipt.discount || 0);

//   const qrLink = `https://techtalkhub.com/verify/${receipt.receipt_number}`;

//   const printReceipt = () => window.print();

//   return (
//     <div
//       id="receipt"
//       className="w-full max-w-[380px] mx-auto bg-white shadow-xl rounded-sm p-8 font-mono border-t-4 border-black"
//     >
//       <div className="text-center border-b pb-2 mb-2">
//         <h1 className="font-bold text-lg">{receipt.business_name || "TECH TALK HUB"}</h1>
//         <p className="text-sm">{receipt.tagline || "We Teach Kids How To Code"}</p>
//       </div>

//       <p>Receipt No: {receipt.receipt_number}</p>
//       <p>Date: {new Date(receipt.created_at).toLocaleDateString()}</p>
//       <p>Time: {new Date(receipt.created_at).toLocaleTimeString()}</p>

//       <div className="border-b my-2"></div>

//       <p>Customer: {receipt.customer_name}</p>
//       <p>Phone: {receipt.phone}</p>

//       <div className="border-b my-2"></div>

//       <div className="grid grid-cols-3 font-bold border-b pb-1">
//         <span>DESCRIPTION</span>
//         <span className="text-center">QTY</span>
//         <span className="text-right">AMOUNT</span>
//       </div>

//       {receipt.items.map((item, i) => (
//         <div key={i} className="grid grid-cols-3 py-1 border-b">
//           <span>{item.description}</span>
//           <span className="text-center">{item.qty}</span>
//           <span className="text-right">{item.amount.toLocaleString()}</span>
//         </div>
//       ))}

//       <div className="border-b my-2"></div>

//       <div className="flex justify-between">
//         <span>Subtotal</span>
//         <span>{subtotal.toLocaleString()}</span>
//       </div>
//       <div className="flex justify-between text-red-500">
//         <span>Discount</span>
//         <span>- {receipt.discount?.toLocaleString() || 0}</span>
//       </div>
//       <div className="flex justify-between font-bold text-lg border-t pt-1">
//         <span>TOTAL PAID</span>
//         <span>{totalPaid.toLocaleString()}</span>
//       </div>

//       <div className="border-b my-2"></div>

//       <p>Payment Method: {receipt.payment_method}</p>
//       <p>Transaction Code: {receipt.transaction_code}</p>
//       <p>Status: {receipt.status}</p>
//       <p>Served By: {receipt.served_by}</p>

//       <div className="border-b my-2"></div>

//       {/* QR Code */}
//       <div className="flex flex-col items-center mt-6">
//         <QRCodeSVG value={qrLink} size={120} />
//         <p className="text-sm text-gray-500 mt-2">
//           Scan to verify receipt
//         </p>
//       </div>

//       <div className="border-b my-2"></div>

//       <p className="text-center text-sm">Thank you for choosing Tech Talk Hub</p>
//       <p className="text-center text-sm">{receipt.email || "admin@techtalk-hub.com"}</p>
//       <p className="text-center text-sm">{receipt.phone || "0118 755 558"}</p>

//       {/* Print Button */}
//       <button
//         onClick={printReceipt}
//         className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
//       >
//         Print / Save Receipt
//       </button>

    
//     </div>
//   );
// }
import React from "react";
import { QRCodeSVG } from "qrcode.react";

export default function Receipt() {
  const receipt = {
    receipt_number: "TTH-1042",
    created_at: new Date(),
    customer_name: "John Doe",
    phone: "0700 000000",
    items: [
      { description: "Tuition Fee", qty: 1, amount: 3000 },
      { description: "Curriculum", qty: 1, amount: 2000 },
      { description: "LMS Access", qty: 1, amount: 5000 },
    ],
    discount: 2000,
    total_paid: 8000,
    payment_method: "M-Pesa",
    transaction_code: "QGH72KLM",
    status: "PAID",
    served_by: "Justin",
    email: "admin@techtalk-hub.com",
  };

  const subtotal = receipt.items.reduce((sum, i) => sum + i.amount * i.qty, 0);
  const qrLink = `https://techtalkhub.com/verify/${receipt.receipt_number}`;

  const printReceipt = () => window.print();

  return (
    <div
      id="receipt"
      className="w-full max-w-[380px] mx-auto bg-white shadow-xl rounded-sm p-8 font-mono border-t-4 border-black"
    >
      <div className="text-center border-b pb-2 mb-2">
        <h1 className="font-bold text-lg">TECH TALK HUB</h1>
        <p className="text-sm">We Teach Kids How To Code</p>
      </div>

      <p>Receipt No: {receipt.receipt_number}</p>
      <p>Date: {receipt.created_at.toLocaleDateString()}</p>
      <p>Time: {receipt.created_at.toLocaleTimeString()}</p>

      <div className="border-b my-2"></div>

      <p>Customer: {receipt.customer_name}</p>
      <p>Phone: {receipt.phone}</p>

      <div className="border-b my-2"></div>

      <div className="grid grid-cols-3 font-bold border-b pb-1">
        <span>DESCRIPTION</span>
        <span className="text-center">QTY</span>
        <span className="text-right">AMOUNT</span>
      </div>

      {receipt.items.map((item, i) => (
        <div key={i} className="grid grid-cols-3 py-1 border-b">
          <span>{item.description}</span>
          <span className="text-center">{item.qty}</span>
          <span className="text-right">{item.amount.toLocaleString()}</span>
        </div>
      ))}

      <div className="border-b my-2"></div>

      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-red-500">
        <span>Discount</span>
        <span>- {receipt.discount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between font-bold text-lg border-t pt-1">
        <span>TOTAL PAID</span>
        <span>{receipt.total_paid.toLocaleString()}</span>
      </div>

      <div className="border-b my-2"></div>

      <p>Payment Method: {receipt.payment_method}</p>
      <p>Transaction Code: {receipt.transaction_code}</p>
      <p>Status: {receipt.status}</p>
      <p>Served By: {receipt.served_by}</p>

      <div className="border-b my-2"></div>

      <div className="flex flex-col items-center mt-6">
        <QRCodeSVG value={qrLink} size={120} />
        <p className="text-sm text-gray-500 mt-2">Scan to verify receipt</p>
      </div>

      <div className="border-b my-2"></div>

      <p className="text-center text-sm">Thank you for choosing Tech Talk Hub</p>
      <p className="text-center text-sm">{receipt.email}</p>
      <p className="text-center text-sm">{receipt.phone}</p>

      <button
        onClick={printReceipt}
        className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
      >
        Print / Save Receipt
      </button>
{/* 
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style> */}
    </div>
  );
}

// import React from "react";
// import { QRCodeSVG } from "qrcode.react";

// export default function Receipt() {
//   const receipt = {
//     business: "TECH TALK HUB",
//     tagline: "We Teach Kids How To Code",
//     receiptNo: "TTH-1042",
//     date: "11 Mar 2026",
//     time: "14:32 PM",
//     customer: { name: "John Doe", phone: "0700 000000" },
//     items: [
//       { description: "Tuition Fee", qty: 1, amount: 3000 },
//       { description: "Curriculum", qty: 1, amount: 2000 },
//       { description: "LMS Access", qty: 1, amount: 5000 },
//     ],
//     subtotal: 10000,
//     discount: 2000,
//     totalPaid: 8000,
//     paymentMethod: "M-Pesa",
//     transactionCode: "QGH72KLM",
//     status: "PAID",
//     servedBy: "Justin",
//     email: "admin@techtalk-hub.com",
//     phone: "0118 755 558",
//   };
// const qrData = `
// Tech Talk Hub Receipt
// // Receipt No: ${receiptNumber}
// Receipt No: {receipt.receiptNo}
// Customer: ${customer.name}
// Amount Paid: KES ${total}
// Date: ${new Date().toLocaleDateString()}
// `;
//   return (
//     <div className="w-full max-w-[380px] mx-auto bg-white shadow-xl rounded-sm p-8 font-mono border-t-4 border-black">
//       <div className="text-center border-b pb-2 mb-2">
//         <h1 className="font-bold text-lg">{receipt.business}</h1>
//         <p className="text-sm">{receipt.tagline}</p>
//       </div>

//       <p>Receipt No: {receipt.receiptNo}</p>
//       <p>Date: {receipt.date}</p>
//       <p>Time: {receipt.time}</p>

//       <div className="border-b my-2"></div>

//       <p>Customer: {receipt.customer.name}</p>
//       <p>Phone: {receipt.customer.phone}</p>

//       <div className="border-b my-2"></div>

//       <div className="grid grid-cols-3 font-bold border-b pb-1">
//         <span>DESCRIPTION</span>
//         <span className="text-center">QTY</span>
//         <span className="text-right">AMOUNT</span>
//       </div>
//       {receipt.items.map((item, i) => (
//         <div key={i} className="grid grid-cols-3 py-1 border-b">
//           <span>{item.description}</span>
//           <span className="text-center">{item.qty}</span>
//           <span className="text-right">{item.amount.toLocaleString()}</span>
//         </div>
//       ))}

//       <div className="border-b my-2"></div>

//       <div className="flex justify-between">
//         <span>Subtotal</span>
//         <span>{receipt.subtotal.toLocaleString()}</span>
//       </div>
//       <div className="flex justify-between text-red-500">
//         <span>Discount</span>
//         <span>- {receipt.discount.toLocaleString()}</span>
//       </div>
//       <div className="flex justify-between font-bold text-lg border-t pt-1">
//         <span>TOTAL PAID</span>
//         <span>{receipt.totalPaid.toLocaleString()}</span>
//       </div>

//       <div className="border-b my-2"></div>

//       <p>Payment Method: {receipt.paymentMethod}</p>
//       <p>Transaction Code: {receipt.transactionCode}</p>
//       <p>Status: {receipt.status}</p>
//       <p>Served By: {receipt.servedBy}</p>

//       <div className="border-b my-2"></div>
//       <div className="flex flex-col items-center mt-6">
//   <QRCodeSVG
//     value={qrData}
//     size={120}
//   />
//   <p className="text-sm text-gray-500 mt-2">
//     Scan to verify receipt
//   </p>
// </div>
// <div className="border-b my-2"></div>
//       <p className="text-center text-sm">
//         Thank you for choosing Tech Talk Hub
//       </p>
//       <p className="text-center text-sm">{receipt.email}</p>
//       <p className="text-center text-sm">{receipt.phone}</p>

//       <button
//         onClick={() => window.print()}
//         className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
//       >
//         Print / Save Receipt
//       </button>
//     </div>
//   );
// }
// // import React, { useState } from "react";

// // export default function Sales() {

// //   const [items, setItems] = useState([
// //     { name: "Tuition Fee", price: 3000, qty: 1 },
// //     { name: "Curriculum", price: 2000, qty: 1 },
// //     { name: "LMS Access", price: 5000, qty: 1 }
// //   ]);

// //   const discount = 2000;

// //   const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
// //   const total = subtotal - discount;

// //   const changeQty = (index, value) => {
// //     const updated = [...items];
// //     updated[index].qty = value;
// //     setItems(updated);
// //   };

// //   const removeItem = (index) => {
// //     setItems(items.filter((_, i) => i !== index));
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-100 p-6 grid grid-cols-2 gap-6">

// //       {/* LEFT PANEL */}
// //       <div className="bg-white rounded-lg shadow p-6">
// //         <h2 className="text-xl font-bold mb-4">Items</h2>

// //         {items.map((item, index) => (
// //           <div
// //             key={index}
// //             className="flex justify-between items-center border-b py-3"
// //           >
// //             <div>
// //               <p className="font-semibold">{item.name}</p>
// //               <p className="text-gray-500">KES {item.price}</p>
// //             </div>

// //             <div className="flex items-center gap-2">
// //               <input
// //                 type="number"
// //                 value={item.qty}
// //                 min="1"
// //                 className="w-16 border rounded p-1 text-center"
// //                 onChange={(e) =>
// //                   changeQty(index, Number(e.target.value))
// //                 }
// //               />

// //               <button
// //                 onClick={() => removeItem(index)}
// //                 className="text-red-500 font-bold"
// //               >
// //                 X
// //               </button>
// //             </div>
// //           </div>
// //         ))}
// //       </div>

// //       {/* RIGHT PANEL */}
// //       <div className="bg-white rounded-lg shadow p-6">
// //         <h2 className="text-xl font-bold mb-4">Receipt</h2>

// //         <div className="space-y-2">

// //           {items.map((item, i) => (
// //             <div key={i} className="flex justify-between">
// //               <span>{item.name} x {item.qty}</span>
// //               <span>KES {item.price * item.qty}</span>
// //             </div>
// //           ))}

// //           <hr className="my-2"/>

// //           <div className="flex justify-between">
// //             <span>Subtotal</span>
// //             <span>KES {subtotal}</span>
// //           </div>

// //           <div className="flex justify-between text-red-500">
// //             <span>Discount</span>
// //             <span>- KES {discount}</span>
// //           </div>

// //           <div className="flex justify-between text-lg font-bold">
// //             <span>Total</span>
// //             <span>KES {total}</span>
// //           </div>

// //         </div>

// //         <button
// //           className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
// //         >
// //           Complete Payment
// //         </button>

// //       </div>

// //     </div>
// //   );
// // }