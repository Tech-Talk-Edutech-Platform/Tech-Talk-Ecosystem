"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const billingOptions = [
  {
    value: "monthly",
    label: "Monthly",
    period: "month",
    months: 1,
  },

  {
    value: "quarterly",
    label: "Quarterly",
    period: "quarter",
    months: 3,
  },

  {
    value: "yearly",
    label: "Yearly",
    period: "year",
    months: 12,
  },
];

function formatPrice(amount, currency) {
  const numericAmount = Number(amount || 0);

  const formattedAmount = new Intl.NumberFormat(
    "en-KE",
    {
      maximumFractionDigits: 2,
    }
  ).format(numericAmount);

  return currency === "kes"
    ? `KES ${formattedAmount}`
    : `$${formattedAmount}`;
}

function getPlanPrice(plan, billing, currency) {
  const columnName = `${billing}_${currency}`;

  return Number(plan[columnName] || 0);
}

function getPlanDiscount(plan, billing) {
  if (billing === "quarterly") {
    return Number(plan.quarterly_discount || 0);
  }

  if (billing === "yearly") {
    return Number(plan.yearly_discount || 0);
  }

  return 0;
}

function getClassesLabel(classesPerWeek) {
  const amount = Number(classesPerWeek || 0);

  return `${amount} ${
    amount === 1 ? "class" : "classes"
  } per week`;
}

export default function Pricing() {
  const [currency, setCurrency] = useState("kes");

  const [billing, setBilling] = useState("monthly");

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const router = useRouter();

  const selectedBilling =
    billingOptions.find(
      (option) => option.value === billing
    ) || billingOptions[0];

  useEffect(() => {
    let cancelled = false;

    async function loadPricingPlans() {
      setLoading(true);
      setError("");

      try {
        const {
          data,
          error: fetchError,
        } = await supabase
          .from("pricing_plans")
          .select(
            `
              id,
              name,
              slug,
              description,
              classes_per_week,
              session_duration_minutes,
              monthly_kes,
              monthly_usd,
              quarterly_kes,
              quarterly_usd,
              quarterly_discount,
              yearly_kes,
              yearly_usd,
              yearly_discount,
              features,
              is_popular,
              is_active,
              display_order
            `
          )
          .eq("is_active", true)
          .order("display_order", {
            ascending: true,
          });

        if (fetchError) {
          throw fetchError;
        }

        if (!cancelled) {
          setPlans(data || []);
        }
      } catch (fetchError) {
        // console.error(
        //   "Failed to load pricing plans:",
        //   fetchError
        // );

        // if (!cancelled) {
        //   setError(
        //     "Pricing plans are temporarily unavailable. Please contact us for assistance."
        //   );
        // }
        console.error("Pricing plans error:", {
  message: fetchError?.message,
  code: fetchError?.code,
  details: fetchError?.details,
  hint: fetchError?.hint,
});

if (!cancelled) {
  setError(
    fetchError?.message ||
      "Pricing plans are temporarily unavailable."
  );
}
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPricingPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleEnroll(plan) {
    const selectedPrice = getPlanPrice(
      plan,
      selectedBilling.value,
      currency
    );

    const params = new URLSearchParams({
      planId: plan.id,
      planSlug: plan.slug,
      planName: plan.name,
      planClasses: getClassesLabel(
        plan.classes_per_week
      ),
      billing: selectedBilling.value,
      currency: currency.toUpperCase(),
      amount: String(selectedPrice),
    });

    router.push(`/pay?${params.toString()}`);
  }

  const availableDiscounts = plans
    .map((plan) =>
      getPlanDiscount(
        plan,
        selectedBilling.value
      )
    )
    .filter((discount) => discount > 0);

  const highestDiscount =
    availableDiscounts.length > 0
      ? Math.max(...availableDiscounts)
      : 0;

  const allDiscountsMatch =
    availableDiscounts.length > 0 &&
    availableDiscounts.every(
      (discount) => discount === highestDiscount
    );

  return (
    <section className="relative scroll-mt-24 bg-background px-4 pb-14 pt-12 font-poppins sm:px-6 sm:pb-16 sm:pt-16">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2947C7] shadow-sm">
            <Sparkles className="h-4 w-4 text-[#FF3F7F]" />

            Flexible Learning Plans
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-[#172554] sm:text-4xl lg:text-5xl">
            Choose how your child{" "}
            <span className="text-[#FF3F7F]">
              learns best.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Live, personalized coding classes with flexible
            schedules and practical learning at every stage.
          </p>
        </div>

        {/* Pricing controls */}
        <div className="mb-10 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Currency */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {["kes", "usd"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCurrency(option)}
                aria-pressed={currency === option}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  currency === option
                    ? "bg-[#2947C7] text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Billing cycle */}
          <div className="inline-flex max-w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {billingOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setBilling(option.value)
                }
                aria-pressed={
                  billing === option.value
                }
                className={`rounded-lg px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                  billing === option.value
                    ? "bg-[#FF3F7F] text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic discount notice */}
        {!loading &&
          !error &&
          highestDiscount > 0 && (
            <p className="mb-8 text-center text-sm font-semibold text-[#2947C7]">
              {allDiscountsMatch
                ? `Save ${highestDiscount}%`
                : `Save up to ${highestDiscount}%`}{" "}
              with{" "}
              {selectedBilling.label.toLowerCase()}{" "}
              billing.
            </p>
          )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-purple-100 bg-white">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#2947C7]" />

              <p className="mt-4 text-sm text-slate-500">
                Loading learning plans...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-white p-10 text-center">
            <p className="text-base font-semibold text-slate-800">
              {error}
            </p>

            <a
              href="https://wa.me/254704494504"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FF3F7F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#E93470]"
            >
              Contact Us on WhatsApp

              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* No active plans */}
        {!loading &&
          !error &&
          plans.length === 0 && (
            <div className="rounded-3xl border border-dashed border-purple-200 bg-white p-10 text-center">
              <p className="text-lg font-bold text-[#172554]">
                Pricing plans are being updated.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Please contact us for current program
                availability.
              </p>

              <Link
                href="/#contact"
                className="mt-5 inline-flex items-center gap-2 font-bold text-[#FF3F7F]"
              >
                Contact Our Team

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

        {/* Plans */}
        {!loading &&
          !error &&
          plans.length > 0 && (
            <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => {
                const currentPrice =
                  getPlanPrice(
                    plan,
                    selectedBilling.value,
                    currency
                  );

                const monthlyPrice =
                  getPlanPrice(
                    plan,
                    "monthly",
                    currency
                  );

                const undiscountedPrice =
                  monthlyPrice *
                  selectedBilling.months;

                const discount =
                  getPlanDiscount(
                    plan,
                    selectedBilling.value
                  );

                const monthlyEquivalent =
                  Math.round(
                    currentPrice /
                      selectedBilling.months
                  );

                const features = Array.isArray(
                  plan.features
                )
                  ? plan.features
                  : [];

                return (
                  <article
                    key={plan.id}
                    className={`relative flex h-full flex-col rounded-[1.75rem] border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      plan.is_popular
                        ? "border-[#2947C7] shadow-lg shadow-blue-900/10"
                        : "border-slate-200 hover:border-purple-200"
                    }`}
                  >
                    {/* Recommended badge */}
                    {plan.is_popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF3F7F] px-4 py-1 text-xs font-bold text-white shadow-md">
                        Most Popular
                      </span>
                    )}

                    {/* Plan details */}
                    <div className="border-b border-slate-100 pb-5 text-center">
                      <h3 className="text-xl font-black text-[#172554]">
                        {plan.name}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-[#FF3F7F]">
                        {getClassesLabel(
                          plan.classes_per_week
                        )}
                      </p>

                      {plan.description && (
                        <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500">
                          {plan.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mt-5">
                        <p className="text-2xl font-black tracking-tight text-[#2947C7] sm:text-[1.7rem]">
                          {formatPrice(
                            currentPrice,
                            currency
                          )}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          per{" "}
                          {selectedBilling.period}
                        </p>

                        {discount > 0 && (
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-xs text-slate-400 line-through">
                                {formatPrice(
                                  undiscountedPrice,
                                  currency
                                )}
                              </span>

                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                                Save {discount}%
                              </span>
                            </div>

                            <p className="text-xs text-slate-500">
                              About{" "}
                              {formatPrice(
                                monthlyEquivalent,
                                currency
                              )}{" "}
                              per month
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Enrollment */}
                      <button
                        type="button"
                        onClick={() =>
                          handleEnroll(plan)
                        }
                        className={`group mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
                          plan.is_popular
                            ? "bg-[#FF3F7F] text-white shadow-lg shadow-pink-500/20 hover:bg-[#E93470]"
                            : "border border-purple-200 bg-purple-50 text-[#2947C7] hover:border-[#2947C7] hover:bg-[#2947C7] hover:text-white"
                        }`}
                      >
                        Enroll Now

                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>

                    {/* Features */}
                    <div className="flex flex-1 flex-col pt-5">
                      <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        What’s included
                      </p>

                      <ul className="space-y-3">
                        {features.map(
                          (feature, index) => (
                            <li
                              key={`${plan.id}-${index}`}
                              className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"
                            >
                              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />

                              <span>{feature}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        {/* Free trial */}
        {!loading &&
          !error &&
          plans.length > 0 && (
            <div className="mt-10 rounded-2xl border border-purple-100 bg-white px-6 py-6 text-center shadow-sm">
              <p className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#2947C7]" />

                Not ready to enroll? Let your child try
                a class first.
              </p>

              <Link
                href="/book-class"
                className="group mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#FF3F7F] transition hover:text-[#E93470]"
              >
                Book a Free Trial

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
      </div>
    </section>
  );
}
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// import {
//   ArrowRight,
//   CheckCircle2,
//   ShieldCheck,
//   Sparkles,
// } from "lucide-react";

// const plans = [
//   {
//     name: "Starter",

//     classes: "1 class per week",

//     monthly: {
//       kes: 6000,
//       usd: 45,
//     },

//     quarterly: {
//       kes: 17100,
//       usd: 128,
//     },

//     yearly: {
//       kes: 64800,
//       usd: 486,
//     },

//     description:
//       "A gentle introduction to coding and creative technology.",

//     features: [
//       "1 personalized live class each week",
//       "45-minute learning sessions",
//       "Flexible scheduling",
//       "Personal attention in every class",
//       "Access to learning resources",
//     ],
//   },

//   {
//     name: "Pro",

//     classes: "2 classes per week",

//     monthly: {
//       kes: 10000,
//       usd: 75,
//     },

//     quarterly: {
//       kes: 28500,
//       usd: 214,
//     },

//     yearly: {
//       kes: 108000,
//       usd: 810,
//     },

//     popular: true,

//     description:
//       "A balanced learning schedule for steady progress.",

//     features: [
//       "2 personalized live classes each week",
//       "45-minute learning sessions",
//       "8 or more classes each month",
//       "Guided projects and assignments",
//       "Progress tracking and feedback",
//     ],
//   },

//   {
//     name: "Elite",

//     classes: "3 classes per week",

//     monthly: {
//       kes: 13000,
//       usd: 97,
//     },

//     quarterly: {
//       kes: 37050,
//       usd: 277,
//     },

//     yearly: {
//       kes: 140400,
//       usd: 1053,
//     },

//     description:
//       "More focused learning for ambitious young creators.",

//     features: [
//       "3 personalized live classes each week",
//       "60-minute learning sessions",
//       "12 or more classes each month",
//       "Additional hands-on projects",
//       "Priority scheduling support",
//     ],
//   },

//   {
//     name: "Ultimate",

//     classes: "4 classes per week",

//     monthly: {
//       kes: 15500,
//       usd: 116,
//     },

//     quarterly: {
//       kes: 44175,
//       usd: 330,
//     },

//     yearly: {
//       kes: 167400,
//       usd: 1256,
//     },

//     description:
//       "An intensive pathway for faster, consistent growth.",

//     features: [
//       "4 personalized live classes each week",
//       "60-minute learning sessions",
//       "16 or more classes each month",
//       "Advanced project practice",
//       "Dedicated progress support",
//     ],
//   },
// ];

// const billingOptions = [
//   {
//     value: "monthly",
//     label: "Monthly",
//     period: "month",
//     months: 1,
//     discount: 0,
//   },

//   {
//     value: "quarterly",
//     label: "Quarterly",
//     period: "quarter",
//     months: 3,
//     discount: 5,
//   },

//   {
//     value: "yearly",
//     label: "Yearly",
//     period: "year",
//     months: 12,
//     discount: 10,
//   },
// ];

// function formatPrice(amount, currency) {
//   const formattedAmount = new Intl.NumberFormat(
//     "en-KE"
//   ).format(amount);

//   return currency === "kes"
//     ? `KES ${formattedAmount}`
//     : `$${formattedAmount}`;
// }

// export default function Pricing() {
//   const [currency, setCurrency] = useState("kes");

//   const [billing, setBilling] = useState("monthly");

//   const router = useRouter();

//   const selectedBilling =
//     billingOptions.find(
//       (option) => option.value === billing
//     ) || billingOptions[0];

//   function handleEnroll(plan) {
//     const selectedPrice =
//       plan[selectedBilling.value][currency];

//     const params = new URLSearchParams({
//       amount: String(selectedPrice),
//       currency: currency.toUpperCase(),
//       planName: plan.name,
//       planClasses: plan.classes,
//       billing: selectedBilling.value,
//     });

//     router.push(`/pay?${params.toString()}`);
//   }

//   return (
//     <section className="relative scroll-mt-24 bg-background px-4 pb-14 pt-12 font-poppins sm:px-6 sm:pb-16 sm:pt-16">
//       <div className="mx-auto max-w-7xl">
//         {/* Heading */}
//         <div className="mx-auto max-w-3xl text-center">
//           <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2947C7] shadow-sm">
//             <Sparkles className="h-4 w-4 text-[#FF3F7F]" />

//             Flexible Learning Plans
//           </div>

//           <h2 className="mt-5 text-3xl font-black tracking-tight text-[#172554] sm:text-4xl lg:text-5xl">
//             Choose how your child{" "}
//             <span className="text-[#FF3F7F]">
//               learns best.
//             </span>
//           </h2>

//           <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
//             Live, personalized coding classes with flexible
//             schedules and practical learning at every stage.
//           </p>
//         </div>

//         {/* Pricing controls */}
//         <div className="mb-10 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
//           {/* Currency */}
//           <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
//             {["kes", "usd"].map((option) => (
//               <button
//                 key={option}
//                 type="button"
//                 onClick={() => setCurrency(option)}
//                 aria-pressed={currency === option}
//                 className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
//                   currency === option
//                     ? "bg-[#2947C7] text-white"
//                     : "text-slate-600 hover:bg-slate-50"
//                 }`}
//               >
//                 {option.toUpperCase()}
//               </button>
//             ))}
//           </div>

//           {/* Billing cycle */}
//           <div className="inline-flex max-w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
//             {billingOptions.map((option) => (
//               <button
//                 key={option.value}
//                 type="button"
//                 onClick={() => setBilling(option.value)}
//                 aria-pressed={billing === option.value}
//                 className={`rounded-lg px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
//                   billing === option.value
//                     ? "bg-[#FF3F7F] text-white"
//                     : "text-slate-600 hover:bg-slate-50"
//                 }`}
//               >
//                 {option.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Discount notice */}
//         {selectedBilling.discount > 0 && (
//           <p className="mb-8 text-center text-sm font-semibold text-[#2947C7]">
//             Save {selectedBilling.discount}% with{" "}
//             {selectedBilling.label.toLowerCase()} billing.
//           </p>
//         )}

//         {/* Plans */}
//         <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
//           {plans.map((plan) => {
//             const currentPrice =
//               plan[selectedBilling.value][currency];

//             const undiscountedPrice =
//               plan.monthly[currency] *
//               selectedBilling.months;

//             const monthlyEquivalent = Math.round(
//               currentPrice / selectedBilling.months
//             );

//             return (
//               <article
//                 key={plan.name}
//                 className={`relative flex h-full flex-col rounded-[1.75rem] border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
//                   plan.popular
//                     ? "border-[#2947C7] shadow-lg shadow-blue-900/10"
//                     : "border-slate-200 hover:border-purple-200"
//                 }`}
//               >
//                 {/* Recommended badge */}
//                 {plan.popular && (
//                   <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF3F7F] px-4 py-1 text-xs font-bold text-white shadow-md">
//                     Most Popular
//                   </span>
//                 )}

//                 {/* Plan details */}
//                 <div className="border-b border-slate-100 pb-5 text-center">
//                   <h3 className="text-xl font-black text-[#172554]">
//                     {plan.name}
//                   </h3>

//                   <p className="mt-1 text-sm font-semibold text-[#FF3F7F]">
//                     {plan.classes}
//                   </p>

//                   <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500">
//                     {plan.description}
//                   </p>

//                   {/* Price */}
//                   <div className="mt-5">
//                     <p className="text-2xl font-black tracking-tight text-[#2947C7] sm:text-[1.7rem]">
//                       {formatPrice(currentPrice, currency)}
//                     </p>

//                     <p className="mt-1 text-sm text-slate-500">
//                       per {selectedBilling.period}
//                     </p>

//                     {selectedBilling.discount > 0 && (
//                       <div className="mt-3 space-y-1">
//                         <div className="flex items-center justify-center gap-2">
//                           <span className="text-xs text-slate-400 line-through">
//                             {formatPrice(
//                               undiscountedPrice,
//                               currency
//                             )}
//                           </span>

//                           <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
//                             Save{" "}
//                             {selectedBilling.discount}%
//                           </span>
//                         </div>

//                         <p className="text-xs text-slate-500">
//                           About{" "}
//                           {formatPrice(
//                             monthlyEquivalent,
//                             currency
//                           )}{" "}
//                           per month
//                         </p>
//                       </div>
//                     )}
//                   </div>

//                   {/* Enrollment */}
//                   <button
//                     type="button"
//                     onClick={() => handleEnroll(plan)}
//                     className={`group mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
//                       plan.popular
//                         ? "bg-[#FF3F7F] text-white shadow-lg shadow-pink-500/20 hover:bg-[#E93470]"
//                         : "border border-purple-200 bg-purple-50 text-[#2947C7] hover:border-[#2947C7] hover:bg-[#2947C7] hover:text-white"
//                     }`}
//                   >
//                     Enroll Now

//                     <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                   </button>
//                 </div>

//                 {/* Features */}
//                 <div className="flex flex-1 flex-col pt-5">
//                   <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
//                     What’s included
//                   </p>

//                   <ul className="space-y-3">
//                     {plan.features.map((feature) => (
//                       <li
//                         key={feature}
//                         className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"
//                       >
//                         <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />

//                         <span>{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </article>
//             );
//           })}
//         </div>

//         {/* Free trial for new families */}
//         <div className="mt-10 rounded-2xl border border-purple-100 bg-white px-6 py-6 text-center shadow-sm">
//           <p className="flex items-center justify-center gap-2 text-sm text-slate-600">
//             <ShieldCheck className="h-4 w-4 shrink-0 text-[#2947C7]" />

//             Not ready to enroll? Let your child try a class
//             first.
//           </p>

//           <Link
//             href="/book-class"
//             className="group mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#FF3F7F] transition hover:text-[#E93470]"
//           >
//             Book a Free Trial

//             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }
// // "use client";

// // import { useState } from "react";
// // import { useRouter } from "next/navigation";

// // import {
// //   ArrowRight,
// //   CheckCircle2,
// //   ShieldCheck,
// //   Sparkles,
// // } from "lucide-react";

// // const plans = [
// //   {
// //     name: "Starter",

// //     classes: "1 class per week",

// //     monthly: {
// //       kes: 6000,
// //       usd: 45,
// //     },

// //     quarterly: {
// //       kes: 17100,
// //       usd: 128,
// //     },

// //     yearly: {
// //       kes: 64800,
// //       usd: 486,
// //     },

// //     description:
// //       "A gentle introduction to coding and creative technology.",

// //     features: [
// //       "1 personalized live class each week",
// //       "45-minute learning sessions",
// //       "Flexible scheduling",
// //       "Personal attention in every class",
// //       "Access to learning resources",
// //     ],
// //   },

// //   {
// //     name: "Pro",

// //     classes: "2 classes per week",

// //     monthly: {
// //       kes: 10000,
// //       usd: 75,
// //     },

// //     quarterly: {
// //       kes: 28500,
// //       usd: 214,
// //     },

// //     yearly: {
// //       kes: 108000,
// //       usd: 810,
// //     },

// //     popular: true,

// //     description:
// //       "A balanced learning schedule for steady progress.",

// //     features: [
// //       "2 personalized live classes each week",
// //       "45-minute learning sessions",
// //       "8 or more classes each month",
// //       "Guided projects and assignments",
// //       "Progress tracking and feedback",
// //     ],
// //   },

// //   {
// //     name: "Elite",

// //     classes: "3 classes per week",

// //     monthly: {
// //       kes: 13000,
// //       usd: 97,
// //     },

// //     quarterly: {
// //       kes: 37050,
// //       usd: 277,
// //     },

// //     yearly: {
// //       kes: 140400,
// //       usd: 1053,
// //     },

// //     description:
// //       "More focused learning for ambitious young creators.",

// //     features: [
// //       "3 personalized live classes each week",
// //       "60-minute learning sessions",
// //       "12 or more classes each month",
// //       "Additional hands-on projects",
// //       "Priority scheduling support",
// //     ],
// //   },

// //   {
// //     name: "Ultimate",

// //     classes: "4 classes per week",

// //     monthly: {
// //       kes: 15500,
// //       usd: 116,
// //     },

// //     quarterly: {
// //       kes: 44175,
// //       usd: 330,
// //     },

// //     yearly: {
// //       kes: 167400,
// //       usd: 1256,
// //     },

// //     description:
// //       "An intensive pathway for faster, consistent growth.",

// //     features: [
// //       "4 personalized live classes each week",
// //       "60-minute learning sessions",
// //       "16 or more classes each month",
// //       "Advanced project practice",
// //       "Dedicated progress support",
// //     ],
// //   },
// // ];

// // const billingOptions = [
// //   {
// //     value: "monthly",
// //     label: "Monthly",
// //     period: "month",
// //     months: 1,
// //     discount: 0,
// //   },

// //   {
// //     value: "quarterly",
// //     label: "Quarterly",
// //     period: "quarter",
// //     months: 3,
// //     discount: 5,
// //   },

// //   {
// //     value: "yearly",
// //     label: "Yearly",
// //     period: "year",
// //     months: 12,
// //     discount: 10,
// //   },
// // ];

// // function formatPrice(amount, currency) {
// //   const formattedAmount = new Intl.NumberFormat(
// //     "en-KE"
// //   ).format(amount);

// //   return currency === "kes"
// //     ? `KES ${formattedAmount}`
// //     : `$${formattedAmount}`;
// // }

// // export default function Pricing() {
// //   const [currency, setCurrency] = useState("kes");

// //   const [billing, setBilling] = useState("monthly");

// //   const router = useRouter();

// //   const selectedBilling =
// //     billingOptions.find(
// //       (option) => option.value === billing
// //     ) || billingOptions[0];

// //   function handleBookTrial(plan) {
// //     const params = new URLSearchParams({
// //       plan: plan.name.toLowerCase(),
// //       billing,
// //       currency: currency.toUpperCase(),
// //     });

// //     router.push(`/book-class?${params.toString()}`);
// //   }

// //   return (
// //     <section className="relative scroll-mt-24 bg-background px-4 pb-14 pt-12 font-poppins sm:px-6 sm:pb-16 sm:pt-16">
// //       <div className="mx-auto max-w-7xl">
// //         {/* Heading */}
// //         <div className="mx-auto max-w-3xl text-center">
// //           <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2947C7] shadow-sm">
// //             <Sparkles className="h-4 w-4 text-[#FF3F7F]" />

// //             Flexible Learning Plans
// //           </div>

// //           <h2 className="mt-5 text-3xl font-black tracking-tight text-[#172554] sm:text-4xl lg:text-5xl">
// //             Choose how your child{" "}
// //             <span className="text-[#FF3F7F]">
// //               learns best.
// //             </span>
// //           </h2>

// //           <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
// //             Live, personalized coding classes with flexible
// //             schedules and practical learning at every stage.
// //           </p>
// //         </div>

// //         {/* Pricing controls */}
// //         <div className="mb-10 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
// //           {/* Currency */}
// //           <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
// //             {["kes", "usd"].map((option) => (
// //               <button
// //                 key={option}
// //                 type="button"
// //                 onClick={() => setCurrency(option)}
// //                 aria-pressed={currency === option}
// //                 className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
// //                   currency === option
// //                     ? "bg-[#2947C7] text-white"
// //                     : "text-slate-600 hover:bg-slate-50"
// //                 }`}
// //               >
// //                 {option.toUpperCase()}
// //               </button>
// //             ))}
// //           </div>

// //           {/* Billing cycle */}
// //           <div className="inline-flex max-w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
// //             {billingOptions.map((option) => (
// //               <button
// //                 key={option.value}
// //                 type="button"
// //                 onClick={() => setBilling(option.value)}
// //                 aria-pressed={billing === option.value}
// //                 className={`rounded-lg px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
// //                   billing === option.value
// //                     ? "bg-[#FF3F7F] text-white"
// //                     : "text-slate-600 hover:bg-slate-50"
// //                 }`}
// //               >
// //                 {option.label}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Discount notice */}
// //         {selectedBilling.discount > 0 && (
// //           <p className="mb-8 text-center text-sm font-semibold text-[#2947C7]">
// //             Save {selectedBilling.discount}% with{" "}
// //             {selectedBilling.label.toLowerCase()} billing.
// //           </p>
// //         )}

// //         {/* Plans */}
// //         <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
// //           {plans.map((plan) => {
// //             const currentPrice =
// //               plan[selectedBilling.value][currency];

// //             const undiscountedPrice =
// //               plan.monthly[currency] *
// //               selectedBilling.months;

// //             const monthlyEquivalent = Math.round(
// //               currentPrice / selectedBilling.months
// //             );

// //             return (
// //               <article
// //                 key={plan.name}
// //                 className={`relative flex h-full flex-col rounded-[1.75rem] border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
// //                   plan.popular
// //                     ? "border-[#2947C7] shadow-lg shadow-blue-900/10"
// //                     : "border-slate-200 hover:border-purple-200"
// //                 }`}
// //               >
// //                 {/* Recommended badge */}
// //                 {plan.popular && (
// //                   <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF3F7F] px-4 py-1 text-xs font-bold text-white shadow-md">
// //                     Most Popular
// //                   </span>
// //                 )}

// //                 {/* Plan introduction */}
// //                 <div className="border-b border-slate-100 pb-5 text-center">
// //                   <h3 className="text-xl font-black text-[#172554]">
// //                     {plan.name}
// //                   </h3>

// //                   <p className="mt-1 text-sm font-semibold text-[#FF3F7F]">
// //                     {plan.classes}
// //                   </p>

// //                   <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500">
// //                     {plan.description}
// //                   </p>

// //                   {/* Price */}
// //                   <div className="mt-5">
// //                     <p className="text-2xl font-black tracking-tight text-[#2947C7] sm:text-[1.7rem]">
// //                       {formatPrice(currentPrice, currency)}
// //                     </p>

// //                     <p className="mt-1 text-sm text-slate-500">
// //                       per {selectedBilling.period}
// //                     </p>

// //                     {selectedBilling.discount > 0 && (
// //                       <div className="mt-3 space-y-1">
// //                         <div className="flex items-center justify-center gap-2">
// //                           <span className="text-xs text-slate-400 line-through">
// //                             {formatPrice(
// //                               undiscountedPrice,
// //                               currency
// //                             )}
// //                           </span>

// //                           <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
// //                             Save{" "}
// //                             {selectedBilling.discount}%
// //                           </span>
// //                         </div>

// //                         <p className="text-xs text-slate-500">
// //                           About{" "}
// //                           {formatPrice(
// //                             monthlyEquivalent,
// //                             currency
// //                           )}{" "}
// //                           per month
// //                         </p>
// //                       </div>
// //                     )}
// //                   </div>

// //                   {/* Action */}
// //                   <button
// //                     type="button"
// //                     onClick={() => handleBookTrial(plan)}
// //                     className={`group mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
// //                       plan.popular
// //                         ? "bg-[#FF3F7F] text-white shadow-lg shadow-pink-500/20 hover:bg-[#E93470]"
// //                         : "border border-purple-200 bg-purple-50 text-[#2947C7] hover:border-[#2947C7] hover:bg-[#2947C7] hover:text-white"
// //                     }`}
// //                   >
// //                     Book a Free Trial

// //                     <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
// //                   </button>
// //                 </div>

// //                 {/* Features */}
// //                 <div className="flex flex-1 flex-col pt-5">
// //                   <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
// //                     What’s included
// //                   </p>

// //                   <ul className="space-y-3">
// //                     {plan.features.map((feature) => (
// //                       <li
// //                         key={feature}
// //                         className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"
// //                       >
// //                         <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />

// //                         <span>{feature}</span>
// //                       </li>
// //                     ))}
// //                   </ul>
// //                 </div>
// //               </article>
// //             );
// //           })}
// //         </div>

// //         {/* Reassurance */}
// //         <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
// //           <ShieldCheck className="h-4 w-4 shrink-0 text-[#2947C7]" />

// //           No commitment required. Start with a free trial.
// //         </p>
// //       </div>
// //     </section>
// //   );
// // }
// // // "use client";

// // // import React, { useState } from "react";
// // // import { useRouter } from "next/navigation";

// // // const plans = [
// // //   {
// // //     name: "Starter",
// // //     classes: "1 class/week",
// // //     monthly: { kes: 6000, usd: 45 },
// // //     quarterly: { kes: 17100, usd: 128 },
// // //     yearly: { kes: 64800, usd: 486 },
// // //     features: [
// // //       "1 personalized live class/week (45 mins each)",
// // //       "Flexible scheduling tailored for your child",
// // //       "Personalized attention in every class",
// // //       "Unlimited rescheduling at student’s convenience",
// // //     ],
// // //   },
// // //   {
// // //     name: "Pro",
// // //     classes: "2 classes/week",
// // //     monthly: { kes: 10000, usd: 75 },
// // //     quarterly: { kes: 28500, usd: 214 },
// // //     yearly: { kes: 108000, usd: 810 },
// // //     features: [
// // //       "2 personalized live classes/week (45 mins each)",
// // //       "8+ fun & engaging classes per month",
// // //       "More focused attention",
// // //       "Unlimited rescheduling at student’s convenience",
// // //     ],
// // //   },
// // //   {
// // //     name: "Elite",
// // //     classes: "3 classes/week",
// // //     monthly: { kes: 13000, usd: 97 },
// // //     quarterly: { kes: 37050, usd: 277 },
// // //     yearly: { kes: 140400, usd: 1053 },
// // //     popular: true,
// // //     features: [
// // //       "3 engaging live classes/week (60 mins each)",
// // //       "12+ fun & engaging classes per month",
// // //       "Balanced attention and group interaction",
// // //       "Priority rescheduling available",
// // //     ],
// // //   },
// // //   {
// // //     name: "Ultimate",
// // //     classes: "4 classes/week",
// // //     monthly: { kes: 15500, usd: 116 },
// // //     quarterly: { kes: 44175, usd: 330 },
// // //     yearly: { kes: 167400, usd: 1256 },
// // //     features: [
// // //       "4 intensive live classes/week (60 mins each)",
// // //       "16+ fun & engaging classes per month",
// // //       "Maximum attention and progress",
// // //       "Limited rescheduling options",
// // //     ],
// // //   },
// // // ];

// // // export default function Pricing() {
// // //   const [currency, setCurrency] = useState("kes");
// // //   const [billing, setBilling] = useState("monthly");
// // //   const router = useRouter();

// // //   const getDiscount = (billing) => {
// // //     if (billing === "quarterly") return 5;
// // //     if (billing === "yearly") return 10;
// // //     return 0;
// // //   };

// // //   const handleEnroll = (plan) => {
// // //     const finalAmount = currency === "kes" ? plan[billing].kes : plan[billing].usd;
// // //     const finalCurrency = currency === "kes" ? "KES" : "USD";
    
// // //     // Pass values securely via Next.js routing parameters
// // //     router.push(
// // //       `/pay?amount=${finalAmount}&currency=${finalCurrency}&planName=${encodeURIComponent(plan.name)}&planClasses=${encodeURIComponent(plan.classes)}`
// // //     );
// // //   };

// // //   return (
// // //     <div className="bg-background min-h-screen py-12 px-4 font-poppins">
// // //       <div className="max-w-7xl mx-auto text-center">
// // //         <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
// // //           Subscription Plans (1:1 + Full Playground)
// // //         </h1>

// // //         {/* Toggles */}
// // //         <div className="flex flex-col md:flex-row justify-center gap-4 mb-12 items-center">
// // //           {/* Currency Toggle */}
// // //           <div className="flex border rounded-xl overflow-hidden">
// // //             <button
// // //               onClick={() => setCurrency("kes")}
// // //               className={`px-4 py-2 ${
// // //                 currency === "kes"
// // //                   ? "bg-primary text-white"
// // //                   : "bg-white text-text"
// // //               }`}
// // //             >
// // //               KES
// // //             </button>
// // //             <button
// // //               onClick={() => setCurrency("usd")}
// // //               className={`px-4 py-2 ${
// // //                 currency === "usd"
// // //                   ? "bg-primary text-white"
// // //                   : "bg-white text-text"
// // //               }`}
// // //             >
// // //               USD
// // //             </button>
// // //           </div>

// // //           {/* Billing Toggle */}
// // //           <div className="flex border rounded-xl overflow-hidden">
// // //             {["monthly", "quarterly", "yearly"].map((b) => (
// // //               <button
// // //                 key={b}
// // //                 onClick={() => setBilling(b)}
// // //                 className={`px-4 py-2 capitalize ${
// // //                   billing === b ? "bg-secondary text-white" : "bg-white text-text"
// // //                 }`}
// // //               >
// // //                 {b}
// // //               </button>
// // //             ))}
// // //           </div>
// // //         </div>

// // //         {/* Plans Grid */}
// // //         <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// // //           {plans.map((plan) => {
// // //             const discount = getDiscount(billing);
// // //             const price =
// // //               currency === "kes"
// // //                 ? plan[billing].kes.toLocaleString()
// // //                 : plan[billing].usd;

// // //             let oldPrice = null;
// // //             if (discount > 0) {
// // //               const base = currency === "kes" ? plan.monthly.kes : plan.monthly.usd;
// // //               const factor = billing === "quarterly" ? 3 : 12;
// // //               oldPrice = base * factor;
// // //             }

// // //             return (
// // //               <div
// // //                 key={plan.name}
// // //                 className={`relative bg-white shadow-card rounded-2xl p-6 flex flex-col hover:shadow-xl transition-transform duration-300 ${
// // //                   plan.popular ? "border-2 border-primary scale-105 z-10" : ""
// // //                 }`}
// // //               >
// // //                 {plan.popular && (
// // //                   <div className="absolute -top-3 left-1/2 -translate-x-1/2">
// // //                     <span className="bg-secondary text-white text-xs font-semibold px-3 py-1 rounded-full shadow animate-pulse">
// // //                       ⭐ Most Popular
// // //                     </span>
// // //                   </div>
// // //                 )}

// // //                 <h2 className="text-xl font-bold text-secondary mb-1">{plan.name}</h2>
// // //                 <p className="text-sm text-gray-600 mb-4">{plan.classes}</p>

// // //                 {/* Price */}
// // //                 <div className="mb-4">
// // //                   <p className="text-2xl font-bold text-primary">
// // //                     {currency === "kes" ? `KES ${price}` : `$${price}`}
// // //                   </p>

// // //                   {oldPrice && (
// // //                     <div className="flex items-center justify-center gap-2 mt-1">
// // //                       <span className="line-through text-gray-400 text-sm">
// // //                         {currency === "kes"
// // //                           ? `KES ${oldPrice.toLocaleString()}`
// // //                           : `$${oldPrice}`}
// // //                       </span>
// // //                       <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
// // //                         {discount}% off
// // //                       </span>
// // //                     </div>
// // //                   )}

// // //                   <p className="text-sm text-gray-500 capitalize mt-1">
// // //                     per {billing}
// // //                   </p>
// // //                 </div>

// // //                 {/* CTA */}
// // //                 <button
// // //                   onClick={() => handleEnroll(plan)}
// // //                   className={`mb-6 w-full py-2 rounded-xl font-medium transition ${
// // //                     plan.popular
// // //                       ? "bg-secondary text-white animate-pulse"
// // //                       : "bg-gradient-to-r from-primary to-secondary text-white"
// // //                   }`}
// // //                 >
// // //                   Enroll
// // //                 </button>

// // //                 {/* Features */}
// // //                 <ul className="text-left text-sm space-y-2 mt-auto pt-4">
// // //                   {plan.features.map((f, i) => (
// // //                     <li key={i} className="flex items-start gap-2">
// // //                       <span className="text-accent font-bold">✔</span>
// // //                       <span>{f}</span>
// // //                     </li>
// // //                   ))}
// // //                 </ul>
// // //               </div>
// // //             );
// // //           })}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // // // import React, { useState } from "react";
// // // // import { useNavigate } from "react-router-dom";

// // // // const plans = [
// // // //   {
// // // //     name: "Starter",
// // // //     classes: "1 class/week",
// // // //     monthly: { kes: 6000, usd: 45 },
// // // //     quarterly: { kes: 17100, usd: 128 },
// // // //     yearly: { kes: 64800, usd: 486 },
// // // //     features: [
// // // //       "1 personalized live class/week (45 mins each)",
// // // //       "Flexible scheduling tailored for your child",
// // // //       "Personalized attention in every class",
// // // //       "Unlimited rescheduling at student’s convenience",
// // // //     ],
// // // //   },
// // // //   {
// // // //     name: "Pro",
// // // //     classes: "2 classes/week",
// // // //     monthly: { kes: 10000, usd: 75 },
// // // //     quarterly: { kes: 28500, usd: 214 },
// // // //     yearly: { kes: 108000, usd: 810 },
// // // //     features: [
// // // //       "2 personalized live classes/week (45 mins each)",
// // // //       "8+ fun & engaging classes per month",
// // // //       "More focused attention",
// // // //       "Unlimited rescheduling at student’s convenience",
// // // //     ],
// // // //   },
// // // //   {
// // // //     name: "Elite",
// // // //     classes: "3 classes/week",
// // // //     monthly: { kes: 13000, usd: 97 },
// // // //     quarterly: { kes: 37050, usd: 277 },
// // // //     yearly: { kes: 140400, usd: 1053 },
// // // //     popular: true,
// // // //     features: [
// // // //       "3 engaging live classes/week (60 mins each)",
// // // //       "12+ fun & engaging classes per month",
// // // //       "Balanced attention and group interaction",
// // // //       "Priority rescheduling available",
// // // //     ],
// // // //   },
// // // //   {
// // // //     name: "Ultimate",
// // // //     classes: "4 classes/week",
// // // //     monthly: { kes: 15500, usd: 116 },
// // // //     quarterly: { kes: 44175, usd: 330 },
// // // //     yearly: { kes: 167400, usd: 1256 },
// // // //     features: [
// // // //       "4 intensive live classes/week (60 mins each)",
// // // //       "16+ fun & engaging classes per month",
// // // //       "Maximum attention and progress",
// // // //       "Limited rescheduling options",
// // // //     ],
// // // //   },
// // // // ];

// // // // export default function Pricing() {
// // // //   const [currency, setCurrency] = useState("kes");
// // // //   const [billing, setBilling] = useState("monthly");
// // // //   const navigate = useNavigate();

// // // //   const getDiscount = (billingType) => {
// // // //     if (billingType === "quarterly") return 5;
// // // //     if (billingType === "yearly") return 10;
// // // //     return 0;
// // // //   };

// // // //   return (
// // // //     <div className="bg-background min-h-screen py-12 px-4 font-poppins">
// // // //       <div className="max-w-7xl mx-auto text-center">
// // // //         <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
// // // //           Subscription Plans (1:1 + Full Playground)
// // // //         </h1>

// // // //         {/* Toggles */}
// // // //         <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12">
// // // //           {/* Currency Toggle */}
// // // //           <div className="flex border rounded-xl overflow-hidden shadow-sm">
// // // //             <button
// // // //               onClick={() => setCurrency("kes")}
// // // //               className={`px-4 py-2 text-sm font-medium transition ${
// // // //                 currency === "kes"
// // // //                   ? "bg-primary text-white"
// // // //                   : "bg-white text-gray-700 hover:bg-gray-50"
// // // //               }`}
// // // //             >
// // // //               KES
// // // //             </button>
// // // //             <button
// // // //               onClick={() => setCurrency("usd")}
// // // //               className={`px-4 py-2 text-sm font-medium transition ${
// // // //                 currency === "usd"
// // // //                   ? "bg-primary text-white"
// // // //                   : "bg-white text-gray-700 hover:bg-gray-50"
// // // //               }`}
// // // //             >
// // // //               USD
// // // //             </button>
// // // //           </div>

// // // //           {/* Billing Toggle */}
// // // //           <div className="flex border rounded-xl overflow-hidden shadow-sm">
// // // //             {["monthly", "quarterly", "yearly"].map((b) => (
// // // //               <button
// // // //                 key={b}
// // // //                 onClick={() => setBilling(b)}
// // // //                 className={`px-4 py-2 text-sm font-medium capitalize transition ${
// // // //                   billing === b 
// // // //                     ? "bg-secondary text-white" 
// // // //                     : "bg-white text-gray-700 hover:bg-gray-50"
// // // //                 }`}
// // // //               >
// // // //                 {b}
// // // //               </button>
// // // //             ))}
// // // //           </div>
// // // //         </div>

// // // //         {/* Plans Grid */}
// // // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
// // // //           {plans.map((plan) => {
// // // //             const discount = getDiscount(billing);
// // // //             const price =
// // // //               currency === "kes"
// // // //                 ? plan[billing].kes.toLocaleString()
// // // //                 : plan[billing].usd;

// // // //             let oldPrice = null;
// // // //             if (discount > 0) {
// // // //               const base = currency === "kes" ? plan.monthly.kes : plan.monthly.usd;
// // // //               const factor = billing === "quarterly" ? 3 : 12;
// // // //               oldPrice = base * factor;
// // // //             }

// // // //             return (
// // // //               <div
// // // //                 key={plan.name}
// // // //                 className={`relative bg-white shadow-card rounded-2xl p-6 flex flex-col hover:shadow-xl transition-all duration-300 ${
// // // //                   plan.popular ? "border-2 border-primary scale-105 z-10" : "border border-gray-100"
// // // //                 }`}
// // // //               >
// // // //                 {plan.popular && (
// // // //                   <div className="absolute -top-3 left-1/2 -translate-x-1/2">
// // // //                     <span className="bg-secondary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
// // // //                       ⭐ Most Popular
// // // //                     </span>
// // // //                   </div>
// // // //                 )}

// // // //                 <div className="mb-4">
// // // //                   <h2 className="text-xl font-bold text-secondary mb-1">{plan.name}</h2>
// // // //                   <p className="text-sm text-gray-600">{plan.classes}</p>
// // // //                 </div>

// // // //                 {/* Price Display */}
// // // //                 <div className="mb-6 min-h-[80px] flex flex-col justify-center">
// // // //                   <p className="text-2xl font-bold text-primary">
// // // //                     {currency === "kes" ? `KES ${price}` : `$${price}`}
// // // //                   </p>

// // // //                   {oldPrice && (
// // // //                     <div className="flex items-center justify-center gap-2 mt-1">
// // // //                       <span className="line-through text-gray-400 text-sm">
// // // //                         {currency === "kes"
// // // //                           ? `KES ${oldPrice.toLocaleString()}`
// // // //                           : `$${oldPrice}`}
// // // //                       </span>
// // // //                       <span className="bg-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
// // // //                         {discount}% off
// // // //                       </span>
// // // //                     </div>
// // // //                   )}

// // // //                   <p className="text-sm text-gray-500 capitalize mt-1">
// // // //                     per {billing}
// // // //                   </p>
// // // //                 </div>

// // // //                 {/* CTA Action */}
// // // //                 <button
// // // //                   onClick={() =>
// // // //                     navigate("/pay", {
// // // //                       state: {
// // // //                         amount: plan[billing][currency],
// // // //                         currency: currency.toUpperCase(),
// // // //                         planName: plan.name,
// // // //                         planClasses: plan.classes,
// // // //                       },
// // // //                     })
// // // //                   }
// // // //                   className={`mb-6 w-full py-2.5 rounded-xl font-semibold transition tracking-wide shadow-sm ${
// // // //                     plan.popular
// // // //                       ? "bg-secondary text-white hover:bg-pink-600"
// // // //                       : "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95"
// // // //                   }`}
// // // //                 >
// // // //                   Enroll Now
// // // //                 </button>

// // // //                 {/* Features List */}
// // // //                 <ul className="text-left text-sm space-y-2.5 mt-auto border-t border-gray-50 pt-4">
// // // //                   {plan.features.map((f, i) => (
// // // //                     <li key={i} className="flex items-start gap-2 text-gray-700">
// // // //                       <span className="text-accent font-bold flex-shrink-0">✔</span>
// // // //                       <span>{f}</span>
// // // //                     </li>
// // // //                   ))}
// // // //                 </ul>
// // // //               </div>
// // // //             );
// // // //           })}
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }