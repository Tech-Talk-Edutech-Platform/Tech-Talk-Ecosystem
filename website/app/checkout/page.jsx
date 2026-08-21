"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Loader2,
  LockKeyhole,
  ShoppingBag,
} from "lucide-react";

import NavBar from "../../components/NavBar";
import { useCart } from "../../components/CartProvider";
import { supabase } from "../../lib/supabase";

export default function CheckoutPage() {
  const { items, subtotal, hydrated } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    county: "",
    town: "",
    address: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function money(value, currency = "KES") {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const orderNumber = `TTH-${Date.now()}`;

      // =========================================
      // 1. CREATE ORDER
      // =========================================

      const { data: order, error: orderError } = await supabase
        .from("shop_orders")
        .insert({
          order_number: orderNumber,

          customer_name: form.fullName.trim(),
          customer_email: form.email.trim() || null,
          customer_phone: form.phone.trim(),

          county: form.county.trim(),
          town: form.town.trim(),
          delivery_address: form.address.trim(),
          notes: form.notes.trim() || null,

          currency: "KES",

          subtotal: Number(subtotal),
          delivery_fee: 0,
          total_amount: Number(subtotal),

          payment_status: "pending",
          order_status: "pending",
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // =========================================
      // 2. CREATE ORDER ITEMS
      // =========================================

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,

        quantity: Number(item.quantity),

        unit_price: Number(item.price),

        line_total:
          Number(item.price) * Number(item.quantity),
      }));

      const { error: itemsError } = await supabase
        .from("shop_order_items")
        .insert(orderItems);

      if (itemsError) {
        /*
         * Remove the incomplete order if its items
         * failed to save.
         *
         * This requires your RLS policy to permit
         * the delete. If it doesn't, the delete
         * simply won't happen.
         */
        await supabase
          .from("shop_orders")
          .delete()
          .eq("id", order.id);

        throw itemsError;
      }

      // =========================================
      // 3. ORDER SUCCESSFULLY CREATED
      // =========================================

      console.log("Order created:", order);

      /*
       * NEXT STEP:
       *
       * Initialize M-Pesa / Paystack here.
       *
       * We will send:
       * order.id
       * order.order_number
       * order.total_amount
       * customer phone/email
       *
       * Payment remains "pending" until the
       * payment provider confirms payment.
       */

      alert(
        `Order ${order.order_number} created successfully. Payment integration comes next.`
      );
    } catch (error) {
      console.error("Checkout error:", error);

      setErrorMessage(
        error?.message ||
          "We could not create your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return null;
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <NavBar />

        <div className="flex min-h-screen flex-col items-center justify-center px-5 pt-[76px] text-center">
          <ShoppingBag
            size={42}
            className="text-slate-300"
          />

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Your cart is empty
          </h1>

          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Add something from the Tech Talk Hub shop before
            continuing to checkout.
          </p>

          <Link
            href="/shop"
            className="mt-5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white"
          >
            Return to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <NavBar />

      <section className="pt-[105px]">
        <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
          >
            <ChevronLeft size={15} />
            Back to Cart
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* =========================================
                CHECKOUT FORM
            ========================================= */}

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
                  Checkout
                </p>

                <h1 className="mt-2 text-3xl font-black text-slate-900">
                  Delivery Details
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Enter the details we need to process and
                  deliver your order.
                </p>
              </div>

              {/* ERROR */}

              {errorMessage && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* CUSTOMER DETAILS */}

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Full Name">
                  <input
                    required
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fullName: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </Field>

                <Field label="Phone Number">
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="07XX XXX XXX"
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </Field>

                <Field label="County">
                  <input
                    required
                    value={form.county}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        county: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="e.g. Nairobi"
                  />
                </Field>

                <Field label="Town / Area">
                  <input
                    required
                    value={form.town}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        town: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="e.g. Westlands"
                  />
                </Field>

                <Field label="Delivery Address">
                  <input
                    required
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="Building, road or landmark"
                  />
                </Field>
              </div>

              {/* NOTES */}

              <div className="mt-5">
                <Field label="Order Notes">
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Optional delivery instructions..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-4 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={17} />
                    Continue to Payment
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-slate-400">
                Your order will be created securely before
                payment.
              </p>
            </form>

            {/* =========================================
                ORDER SUMMARY
            ========================================= */}

            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-[100px]">
              <h2 className="text-lg font-extrabold text-slate-900">
                Your Order
              </h2>

              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3"
                  >
                    {/* PRODUCT IMAGE */}

                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag
                            size={18}
                            className="text-slate-300"
                          />
                        </div>
                      )}
                    </div>

                    {/* PRODUCT INFO */}

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-slate-800">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Qty {item.quantity}
                      </p>
                    </div>

                    {/* PRODUCT TOTAL */}

                    <span className="whitespace-nowrap text-sm font-bold text-slate-700">
                      {money(
                        Number(item.price) *
                          Number(item.quantity),
                        item.currency || "KES"
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-6 border-t border-slate-100" />

              {/* SUBTOTAL */}

              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>

                <span>{money(subtotal)}</span>
              </div>

              {/* DELIVERY */}

              <div className="mt-3 flex justify-between gap-4 text-sm text-slate-500">
                <span>Delivery</span>

                <span className="text-right">
                  To be calculated
                </span>
              </div>

              <div className="my-5 border-t border-slate-100" />

              {/* TOTAL */}

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Total
                </span>

                <span className="text-xl font-black text-primary">
                  {money(subtotal)}
                </span>
              </div>

              {/* SECURITY */}

              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[11px] font-semibold text-slate-500">
                <LockKeyhole size={13} />
                Secure checkout
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   STYLES
========================================================= */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100";

/* =========================================================
   FIELD
========================================================= */

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import {
//   ChevronLeft,
//   LockKeyhole,
//   ShoppingBag,
// } from "lucide-react";

// import NavBar from "../../components/NavBar";
// import { useCart } from "../../components/CartProvider";

// export default function CheckoutPage() {
//   const {
//     items,
//     subtotal,
//     hydrated,
//   } = useCart();

//   const [form, setForm] =
//     useState({
//       fullName: "",
//       phone: "",
//       email: "",
//       county: "",
//       town: "",
//       address: "",
//       notes: "",
//     });

//   function money(
//     value,
//     currency = "KES"
//   ) {
//     return new Intl.NumberFormat(
//       "en-KE",
//       {
//         style: "currency",
//         currency,
//         maximumFractionDigits: 0,
//       }
//     ).format(Number(value || 0));
//   }

//   if (!hydrated) return null;

//   if (items.length === 0) {
//     return (
//       <main className="min-h-screen bg-slate-50">
//         <NavBar />

//         <div className="flex min-h-screen flex-col items-center justify-center px-5 pt-[76px] text-center">
//           <ShoppingBag
//             size={42}
//             className="text-slate-300"
//           />

//           <h1 className="mt-5 text-2xl font-black text-slate-900">
//             Your cart is empty
//           </h1>

//           <Link
//             href="/shop"
//             className="mt-5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white"
//           >
//             Return to Shop
//           </Link>
//         </div>
//       </main>
//     );
//   }

//   function handleSubmit(e) {
//     e.preventDefault();

//     console.log({
//       customer: form,
//       items,
//       subtotal,
//     });

//     alert(
//       "Customer information captured. Payment integration comes next."
//     );
//   }

//   return (
//     <main className="min-h-screen bg-slate-50">
//       <NavBar />

//       <section className="pt-[105px]">
//         <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-6">
//           <Link
//             href="/cart"
//             className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
//           >
//             <ChevronLeft size={15} />
//             Back to Cart
//           </Link>

//           <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
//             {/* Checkout form */}
//             <form
//               onSubmit={handleSubmit}
//               className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"
//             >
//               <div>
//                 <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
//                   Checkout
//                 </p>

//                 <h1 className="mt-2 text-3xl font-black text-slate-900">
//                   Delivery Details
//                 </h1>

//                 <p className="mt-2 text-sm text-slate-500">
//                   Enter the details we need to process and deliver your order.
//                 </p>
//               </div>

//               <div className="mt-8 grid gap-5 sm:grid-cols-2">
//                 <Field label="Full Name">
//                   <input
//                     required
//                     value={form.fullName}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         fullName:
//                           e.target.value,
//                       })
//                     }
//                     className={inputClass}
//                   />
//                 </Field>

//                 <Field label="Phone Number">
//                   <input
//                     required
//                     value={form.phone}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         phone:
//                           e.target.value,
//                       })
//                     }
//                     className={inputClass}
//                   />
//                 </Field>

//                 <Field label="Email">
//                   <input
//                     type="email"
//                     value={form.email}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         email:
//                           e.target.value,
//                       })
//                     }
//                     className={inputClass}
//                   />
//                 </Field>

//                 <Field label="County">
//                   <input
//                     required
//                     value={form.county}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         county:
//                           e.target.value,
//                       })
//                     }
//                     className={inputClass}
//                   />
//                 </Field>

//                 <Field label="Town / Area">
//                   <input
//                     required
//                     value={form.town}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         town:
//                           e.target.value,
//                       })
//                     }
//                     className={inputClass}
//                   />
//                 </Field>

//                 <Field label="Delivery Address">
//                   <input
//                     required
//                     value={form.address}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         address:
//                           e.target.value,
//                       })
//                     }
//                     className={inputClass}
//                   />
//                 </Field>
//               </div>

//               <div className="mt-5">
//                 <Field label="Order Notes">
//                   <textarea
//                     rows={4}
//                     value={form.notes}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         notes:
//                           e.target.value,
//                       })
//                     }
//                     placeholder="Optional instructions..."
//                     className={inputClass}
//                   />
//                 </Field>
//               </div>

//               <button
//                 type="submit"
//                 className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-4 text-sm font-bold text-white shadow-lg shadow-secondary/20"
//               >
//                 <LockKeyhole size={17} />
//                 Continue to Payment
//               </button>
//             </form>

//             {/* Summary */}
//             <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
//               <h2 className="text-lg font-extrabold text-slate-900">
//                 Your Order
//               </h2>

//               <div className="mt-5 space-y-4">
//                 {items.map((item) => (
//                   <div
//                     key={item.id}
//                     className="flex gap-3"
//                   >
//                     <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
//                       {item.image_url && (
//                         <img
//                           src={item.image_url}
//                           alt={item.name}
//                           className="h-full w-full object-cover"
//                         />
//                       )}
//                     </div>

//                     <div className="min-w-0 flex-1">
//                       <p className="line-clamp-2 text-sm font-bold text-slate-800">
//                         {item.name}
//                       </p>

//                       <p className="mt-1 text-xs text-slate-400">
//                         Qty {item.quantity}
//                       </p>
//                     </div>

//                     <span className="text-sm font-bold text-slate-700">
//                       {money(
//                         item.price *
//                           item.quantity,
//                         item.currency
//                       )}
//                     </span>
//                   </div>
//                 ))}
//               </div>

//               <div className="my-6 border-t border-slate-100" />

//               <div className="flex justify-between text-sm text-slate-500">
//                 <span>Subtotal</span>
//                 <span>
//                   {money(subtotal)}
//                 </span>
//               </div>

//               <div className="mt-3 flex justify-between text-sm text-slate-500">
//                 <span>Delivery</span>
//                 <span>To be calculated</span>
//               </div>

//               <div className="my-5 border-t border-slate-100" />

//               <div className="flex justify-between">
//                 <span className="font-bold">
//                   Total
//                 </span>

//                 <span className="text-xl font-black text-primary">
//                   {money(subtotal)}
//                 </span>
//               </div>
//             </aside>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }

// const inputClass =
//   "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100";

// function Field({
//   label,
//   children,
// }) {
//   return (
//     <div>
//       <label className="mb-2 block text-sm font-semibold text-slate-700">
//         {label}
//       </label>

//       {children}
//     </div>
//   );
// }