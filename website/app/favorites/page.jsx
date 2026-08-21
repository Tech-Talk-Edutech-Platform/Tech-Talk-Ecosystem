"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ChevronLeft,
  Code2,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import NavBar from "../../components/NavBar";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../components/CartProvider";

export default function FavoritesPage() {
  const {
    addToCart,
    incrementItem,
    decrementItem,
    getItemQuantity,
  } = useCart();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    let ids = [];

    try {
      const saved = JSON.parse(
        localStorage.getItem(
          "shop_favorites"
        ) || "[]"
      );

      ids = Array.isArray(saved)
        ? saved
        : [];
    } catch {
      ids = [];
    }

    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const { data, error } =
      await supabase
        .from("shop_products")
        .select("*")
        .in("id", ids)
        .eq("is_active", true);

    if (error) {
      console.error(error);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  function removeFavorite(
    productId
  ) {
    const updated = products.filter(
      (product) =>
        product.id !== productId
    );

    setProducts(updated);

    localStorage.setItem(
      "shop_favorites",
      JSON.stringify(
        updated.map(
          (product) =>
            product.id
        )
      )
    );
  }

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
    ).format(
      Number(value || 0)
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafe]">
      <NavBar />

      <section className="pt-[105px]">
        <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"
          >
            <ChevronLeft
              size={16}
            />
            Continue Shopping
          </Link>

          <div className="mt-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-[#ff4b7c]">
                <Heart
                  size={20}
                  className="fill-[#ff4b7c]"
                />
              </div>

              <div>
                <h1 className="text-3xl font-black text-[#101936]">
                  My Favorites
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Products you've
                  saved for later.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length ===
            0 ? (
            <div className="mt-10 flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 text-center">
              <Heart className="h-12 w-12 text-slate-200" />

              <h2 className="mt-5 text-xl font-black">
                No favorites yet
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Tap the heart on a
                product to save it
                here.
              </p>

              <Link
                href="/shop"
                className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white"
              >
                Explore Shop
              </Link>
            </div>
          ) : (
            <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map(
                (product) => {
                  const quantity =
                    getItemQuantity(
                      product.id
                    );

                  const inStock =
                    !product.track_inventory ||
                    Number(
                      product.stock_quantity ||
                        0
                    ) > 0;

                  return (
                    <article
                      key={
                        product.id
                      }
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <button
                          type="button"
                          onClick={() =>
                            removeFavorite(
                              product.id
                            )
                          }
                          className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow"
                        >
                          <Heart
                            size={
                              16
                            }
                            className="fill-[#ff4b7c] text-[#ff4b7c]"
                          />
                        </button>

                        <Link
                          href={`/shop/${product.slug}`}
                        >
                          {product.image_url ? (
                            <img
                              src={
                                product.image_url
                              }
                              alt={
                                product.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-slate-900">
                              <Code2 className="text-purple-300" />
                            </div>
                          )}
                        </Link>
                      </div>

                      <div className="p-4">
                        <p className="text-[8px] font-black uppercase tracking-wider text-purple-500">
                          {
                            product.category
                          }
                        </p>

                        <Link
                          href={`/shop/${product.slug}`}
                        >
                          <h2 className="mt-1.5 line-clamp-2 min-h-[38px] text-xs font-bold leading-5 text-slate-800">
                            {
                              product.name
                            }
                          </h2>
                        </Link>

                        <p className="mt-3 text-sm font-black text-primary">
                          {money(
                            product.price,
                            product.currency ||
                              "KES"
                          )}
                        </p>

                        <div className="mt-4">
                          {quantity >
                          0 ? (
                            <div className="flex h-10 items-center justify-between rounded-xl border border-purple-200 bg-purple-50">
                              <button
                                onClick={() =>
                                  decrementItem(
                                    product.id
                                  )
                                }
                                className="flex h-full w-10 items-center justify-center text-primary"
                              >
                                <Minus
                                  size={
                                    14
                                  }
                                />
                              </button>

                              <span className="text-xs font-black text-primary">
                                {
                                  quantity
                                }
                              </span>

                              <button
                                onClick={() =>
                                  incrementItem(
                                    product.id
                                  )
                                }
                                className="flex h-full w-10 items-center justify-center text-primary"
                              >
                                <Plus
                                  size={
                                    14
                                  }
                                />
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={
                                !inStock
                              }
                              onClick={() =>
                                addToCart(
                                  product,
                                  1
                                )
                              }
                              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[10px] font-bold text-white disabled:bg-slate-200"
                            >
                              <ShoppingCart
                                size={
                                  14
                                }
                              />

                              {inStock
                                ? "Add to Cart"
                                : "Unavailable"}
                            </button>
                          )}
                        </div>

                        <Link
                          href={`/shop/${product.slug}`}
                          className="mt-3 block text-center text-[10px] font-bold text-slate-500 hover:text-primary"
                        >
                          View Details
                          →
                        </Link>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}