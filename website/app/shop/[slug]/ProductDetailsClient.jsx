"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";

import NavBar from "../../../components/NavBar";

import { useCart } from "../../../components/CartProvider";

export default function ProductDetailsClient({
  product,
}) {
  const {
    addToCart,
    incrementItem,
    decrementItem,
    getItemQuantity,
  } = useCart();

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(
    product.image_url ||
      product.gallery_urls?.[0] ||
      ""
  );

  const [
    requestedQuantity,
    setRequestedQuantity,
  ] = useState(1);

  const [
    favorite,
    setFavorite,
  ] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          "shop_favorites"
        ) || "[]"
      );

      setFavorite(
        Array.isArray(saved) &&
          saved.includes(product.id)
      );
    } catch {
      setFavorite(false);
    }
  }, [product.id]);

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

  function toggleFavorite() {
    let saved = [];

    try {
      saved = JSON.parse(
        localStorage.getItem(
          "shop_favorites"
        ) || "[]"
      );

      if (!Array.isArray(saved)) {
        saved = [];
      }
    } catch {
      saved = [];
    }

    const updated = saved.includes(
      product.id
    )
      ? saved.filter(
          (id) => id !== product.id
        )
      : [...saved, product.id];

    localStorage.setItem(
      "shop_favorites",
      JSON.stringify(updated)
    );

    setFavorite(
      updated.includes(product.id)
    );
  }

  const inStock =
    !product.track_inventory ||
    Number(
      product.stock_quantity || 0
    ) > 0;

  const cartQuantity =
    getItemQuantity(product.id);

  const gallery = [
    product.image_url,
    ...(product.gallery_urls || []),
  ].filter(
    (image, index, array) =>
      image &&
      array.indexOf(image) === index
  );

  return (
    <main className="min-h-screen bg-[#fafafe]">
      <NavBar />

      <section className="pt-[100px]">
        <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"
            >
              <ChevronLeft size={16} />

              Back to Shop
            </Link>

            <button
              type="button"
              onClick={toggleFavorite}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm"
            >
              <Heart
                size={16}
                className={
                  favorite
                    ? "fill-[#ff4b7c] text-[#ff4b7c]"
                    : ""
                }
              />

              {favorite
                ? "Saved"
                : "Save"}
            </button>
          </div>

          {/* Product card */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              {/* Gallery */}
              <div className="border-b border-slate-100 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
                  {product.badge && (
                    <span className="absolute left-4 top-4 z-10 rounded-full bg-[#ff4b7c] px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-white">
                      {product.badge}
                    </span>
                  )}

                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
                      <ShoppingCart className="h-20 w-20 text-purple-300" />
                    </div>
                  )}
                </div>

                {gallery.length > 1 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {gallery.map(
                      (image, index) => (
                        <button
                          key={image}
                          type="button"
                          onClick={() =>
                            setSelectedImage(
                              image
                            )
                          }
                          aria-label={`View product image ${
                            index + 1
                          }`}
                          className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 ${
                            selectedImage ===
                            image
                              ? "border-primary"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} image ${
                              index + 1
                            }`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Product information */}
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  {product.category && (
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-primary">
                      {product.category}
                    </span>
                  )}

                  {product.program &&
                    product.program !==
                      "general" && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        {product.program.replaceAll(
                          "-",
                          " "
                        )}
                      </span>
                    )}
                </div>

                <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#101936] sm:text-4xl">
                  {product.name}
                </h1>

                {product.short_description && (
                  <p className="mt-4 text-sm leading-7 text-slate-500">
                    {
                      product.short_description
                    }
                  </p>
                )}

                {/* Price */}
                <div className="mt-6 rounded-2xl bg-[#faf9ff] p-5">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl font-black text-primary">
                      {money(
                        product.price,
                        product.currency ||
                          "KES"
                      )}
                    </span>

                    {product.compare_at_price && (
                      <span className="text-sm font-semibold text-slate-400 line-through">
                        {money(
                          product.compare_at_price,
                          product.currency ||
                            "KES"
                        )}
                      </span>
                    )}
                  </div>

                  {inStock ? (
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-600">
                      <CheckCircle2
                        size={15}
                      />

                      Available to order
                    </div>
                  ) : (
                    <p className="mt-3 text-xs font-bold text-red-500">
                      Currently unavailable
                    </p>
                  )}
                </div>

                {/* Purchase */}
                <div className="mt-7">
                  {cartQuantity > 0 ? (
                    <>
                      <p className="mb-3 text-xs font-bold text-slate-500">
                        Quantity in your cart
                      </p>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex h-14 items-center overflow-hidden rounded-xl border border-purple-200 bg-purple-50">
                          <button
                            type="button"
                            onClick={() =>
                              decrementItem(
                                product.id
                              )
                            }
                            aria-label="Decrease quantity"
                            className="flex h-full w-14 items-center justify-center text-primary"
                          >
                            <Minus size={17} />
                          </button>

                          <span className="min-w-[55px] text-center text-sm font-black text-primary">
                            {cartQuantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              incrementItem(
                                product.id
                              )
                            }
                            disabled={
                              product.track_inventory &&
                              cartQuantity >=
                                Number(
                                  product.stock_quantity ||
                                    0
                                )
                            }
                            aria-label="Increase quantity"
                            className="flex h-full w-14 items-center justify-center text-primary disabled:opacity-30"
                          >
                            <Plus size={17} />
                          </button>
                        </div>

                        <Link
                          href="/cart"
                          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-purple-200"
                        >
                          <ShoppingCart
                            size={18}
                          />

                          View Cart
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mb-3 text-xs font-bold text-slate-500">
                        Quantity
                      </p>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex h-14 items-center overflow-hidden rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              setRequestedQuantity(
                                (value) =>
                                  Math.max(
                                    1,
                                    value - 1
                                  )
                              )
                            }
                            aria-label="Decrease quantity"
                            className="flex h-full w-14 items-center justify-center text-slate-500"
                          >
                            <Minus size={17} />
                          </button>

                          <span className="min-w-[55px] text-center text-sm font-black">
                            {requestedQuantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                product.track_inventory &&
                                requestedQuantity >=
                                  Number(
                                    product.stock_quantity ||
                                      0
                                  )
                              ) {
                                return;
                              }

                              setRequestedQuantity(
                                (value) =>
                                  value + 1
                              );
                            }}
                            disabled={
                              !inStock ||
                              (product.track_inventory &&
                                requestedQuantity >=
                                  Number(
                                    product.stock_quantity ||
                                      0
                                  ))
                            }
                            aria-label="Increase quantity"
                            className="flex h-full w-14 items-center justify-center text-slate-500 disabled:opacity-30"
                          >
                            <Plus size={17} />
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={!inStock}
                          onClick={() =>
                            addToCart(
                              product,
                              requestedQuantity
                            )
                          }
                          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 disabled:bg-slate-200"
                        >
                          <ShoppingCart
                            size={18}
                          />

                          {inStock
                            ? "Add to Cart"
                            : "Unavailable"}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Trust information */}
                <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
                  <TrustItem
                    icon={Truck}
                    title="Delivery"
                    text="Delivery details confirmed at checkout."
                  />

                  <TrustItem
                    icon={ShieldCheck}
                    title="Secure Checkout"
                    text="Your order is processed securely."
                  />

                  <TrustItem
                    icon={PackageCheck}
                    title="Quality"
                    text="Carefully selected learning products."
                  />

                  <TrustItem
                    icon={CreditCard}
                    title="Local Payment"
                    text="Pay conveniently in Kenya."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Full description */}
          <div className="mt-7 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-[#101936]">
              Product Details
            </h2>

            {product.description ? (
              <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-slate-600">
                {product.description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                More product information coming
                soon.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function TrustItem({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

      <div>
        <p className="text-xs font-black text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}