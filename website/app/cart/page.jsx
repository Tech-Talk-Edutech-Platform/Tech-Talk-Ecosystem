"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import NavBar from "../../components/NavBar";
import { useCart } from "../../components/CartProvider";

export default function CartPage() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeFromCart,
    hydrated,
  } = useCart();

  function money(
    value,
    currency = "KES"
  ) {
    return new Intl.NumberFormat(
      "en-KE",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(Number(value || 0));
  }

  if (!hydrated) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <NavBar />

      <section className="pt-[110px]">
        <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-6">
          <h1 className="text-3xl font-black text-slate-900">
            Your Cart
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review your products before checkout.
          </p>

          {items.length === 0 ? (
            <div className="mt-10 flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center">
              <ShoppingBag
                size={42}
                className="text-slate-300"
              />

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                Your cart is empty
              </h2>

              <Link
                href="/shop"
                className="mt-5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/shop/${item.slug}`}
                        className="font-bold text-slate-900 hover:text-primary"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-2 text-base font-black text-primary">
                        {money(
                          item.price,
                          item.currency
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center rounded-xl border border-slate-200">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1
                            )
                          }
                          className="p-2"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="min-w-[38px] text-center text-sm font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1
                            )
                          }
                          className="p-2"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(
                            item.id
                          )
                        }
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Order Summary
                </h2>

                <div className="mt-6 flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>

                  <span className="font-bold text-slate-900">
                    {money(subtotal)}
                  </span>
                </div>

                <div className="mt-4 flex justify-between text-sm text-slate-500">
                  <span>Delivery</span>
                  <span>Calculated next</span>
                </div>

                <div className="my-5 border-t border-slate-100" />

                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">
                    Total
                  </span>

                  <span className="text-xl font-black text-primary">
                    {money(subtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 block rounded-xl bg-secondary px-5 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-secondary/20"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="mt-3 block text-center text-sm font-semibold text-slate-500"
                >
                  Continue Shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}