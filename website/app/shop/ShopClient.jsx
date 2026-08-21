"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  CreditCard,
  Download,
  Headphones,
  Heart,
  LayoutGrid,
  Minus,
  PackageSearch,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Wrench,
} from "lucide-react";

import NavBar from "../../components/NavBar";
import { useCart } from "../../components/CartProvider";

export default function ShopClient({ initialProducts = [] }) {
  const {
    addToCart,
    incrementItem,
    decrementItem,
    getItemQuantity,
  } = useCart();

  const [search, setSearch] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");

  const [favorites, setFavorites] = useState([]);

  const [showFeaturedOnly, setShowFeaturedOnly] = useState(true);

  const products = initialProducts;

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("shop_favorites") || "[]"
      );

      setFavorites(Array.isArray(saved) ? saved : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  const categories = useMemo(() => {
    return [
      "All",

      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch =
        activeCategory === "All" ||
        product.category === activeCategory;

      const searchMatch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.short_description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.program?.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [products, search, activeCategory]);

  const featuredProducts = useMemo(() => {
    return filteredProducts.filter(
      (product) => product.is_featured
    );
  }, [filteredProducts]);

  const displayingFeatured =
    showFeaturedOnly &&
    activeCategory === "All" &&
    !search.trim() &&
    featuredProducts.length > 0;

  const displayedProducts = displayingFeatured
    ? featuredProducts
    : filteredProducts;

  function money(value, currency = "KES") {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function showAllProducts() {
    setSearch("");
    setActiveCategory("All");
    setShowFeaturedOnly(false);

    setTimeout(() => {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  }

  function selectCategory(category) {
    setActiveCategory(category);
    setShowFeaturedOnly(false);
  }

  function toggleFavorite(productId) {
    setFavorites((current) => {
      const updated = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];

      try {
        localStorage.setItem(
          "shop_favorites",
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }

      return updated;
    });
  }

  return (
    <main className="min-h-screen bg-[#fafafe] text-[#101936]">
      <NavBar />

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-[#f0eef8] bg-white pt-[76px]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(110deg,#ffffff 0%,#fcfaff 48%,#f4edff 100%)",
          }}
        />

        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M0 350 C220 240 350 290 560 260 C800 220 920 110 1120 135 C1270 150 1350 215 1440 235 L1440 420 L0 420Z"
            fill="#9272ee"
            opacity="0.035"
          />

          <path
            d="M580 420 C760 270 880 235 1040 240 C1190 245 1310 165 1440 120 L1440 420Z"
            fill="#b59cf8"
            opacity="0.08"
          />
        </svg>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-10 sm:px-6 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-14">
          <div className="max-w-[610px]">
            <span className="inline-flex rounded-full bg-[#eee8ff] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#5b3ae2]">
              Premium Shop
            </span>

            <h1 className="mt-4 text-[38px] font-black leading-[1.07] tracking-[-0.03em] text-[#101936] sm:text-[46px] lg:text-[50px] xl:text-[54px]">
              Premium Learning Products

              <br className="hidden sm:block" />{" "}

              for{" "}

              <span className="bg-gradient-to-r from-[#9176f5] via-[#b75ee8] to-[#ff4c83] bg-clip-text text-transparent">
                Young Creators.
              </span>
            </h1>

            <p className="mt-5 max-w-[540px] text-[14px] leading-7 text-[#586581] sm:text-[15px]">
              Coding books, learning resources, kits and creative
              tools designed for young creators.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12px] font-semibold text-[#34415e]">
              <div className="flex items-center gap-2">
                <Check
                  size={14}
                  className="text-[#5634e4]"
                />

                Premium Quality
              </div>

              <div className="flex items-center gap-2">
                <Download
                  size={14}
                  className="text-[#5634e4]"
                />

                Fast Delivery
              </div>

              <div className="flex items-center gap-2">
                <CreditCard
                  size={14}
                  className="text-[#5634e4]"
                />

                Secure Payments
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={showAllProducts}
                className="inline-flex h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-[#6033e7] to-[#5931e0] px-7 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(91,52,223,0.22)] transition hover:-translate-y-0.5"
              >
                Shop Products

                <ArrowRight size={16} />
              </button>

              <Link
                href="/favorites"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e4e4ee] bg-white px-7 text-[13px] font-bold text-[#313b58] shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
              >
                <Heart size={16} />

                My Favorites
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute h-[75%] w-[75%] rounded-full bg-purple-300/10 blur-[80px]" />

            <img
              src="/shop/premium-shop-hero.png"
              alt="Tech Talk Hub premium shop"
              width={620}
              height={370}
              className="relative h-auto w-full max-w-[620px] object-contain"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}

      <section className="relative z-10 -mt-4">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-2xl border border-[#ededf3] bg-white shadow-[0_8px_25px_rgba(23,32,70,0.06)] sm:grid-cols-2 lg:grid-cols-5">
            <Benefit
              icon={Sparkles}
              title="Premium Quality"
              subtitle="Carefully selected"
            />

            <Benefit
              icon={Download}
              title="Fast Delivery"
              subtitle="Convenient fulfilment"
            />

            <Benefit
              icon={Wrench}
              title="Learning Focused"
              subtitle="Made for young creators"
            />

            <Benefit
              icon={CreditCard}
              title="Secure Payments"
              subtitle="Safe local checkout"
            />

            <Benefit
              icon={Headphones}
              title="Support"
              subtitle="We're here to help"
              last
            />
          </div>
        </div>
      </section>

      {/* SEARCH */}

      <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Search books, kits, resources..."
              aria-label="Search products"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100/60"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}

      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">
            Shop by Category
          </h2>

          <button
            type="button"
            onClick={showAllProducts}
            className="text-[12px] font-bold text-[#5c36df]"
          >
            View All
          </button>
        </div>

        {categories.length > 1 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(1, 7).map((category, index) => {
              const icons = [
                LayoutGrid,
                Code2,
                BookOpen,
                Wrench,
                Sparkles,
                ShoppingCart,
              ];

              const Icon = icons[index % icons.length];

              const count = products.filter(
                (product) => product.category === category
              ).length;

              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => selectCategory(category)}
                  className={`flex min-h-[76px] items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 ${
                    activeCategory === category
                      ? "border-[#8061eb] ring-2 ring-purple-100"
                      : "border-[#e7e8ef]"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1ecff] text-[#6944e6]">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold">
                      {category}
                    </p>

                    <p className="mt-1 text-[10px] text-[#8690a7]">
                      {count}{" "}
                      {count === 1 ? "Product" : "Products"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* PRODUCTS */}

      <section
        id="products"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16 pt-10 sm:px-6 lg:px-8"
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-black">
              {activeCategory !== "All"
                ? activeCategory
                : search.trim()
                  ? "Search Results"
                  : displayingFeatured
                    ? "Featured Products"
                    : "All Products"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {displayedProducts.length}{" "}
              {displayedProducts.length === 1
                ? "product"
                : "products"}
            </p>
          </div>

          <button
            type="button"
            onClick={showAllProducts}
            className="text-xs font-bold text-primary"
          >
            View All Products
          </button>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white">
            <PackageSearch
              size={30}
              className="text-purple-300"
            />

            <p className="mt-4 font-bold">
              No products found
            </p>

            {(search || activeCategory !== "All") && (
              <button
                type="button"
                onClick={showAllProducts}
                className="mt-3 text-xs font-bold text-primary"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                addToCart={addToCart}
                incrementItem={incrementItem}
                decrementItem={decrementItem}
                quantity={getItemQuantity(product.id)}
                money={money}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ProductCard({
  product,
  favorites,
  toggleFavorite,
  addToCart,
  incrementItem,
  decrementItem,
  quantity,
  money,
}) {
  const stockQuantity = Number(
    product.stock_quantity || 0
  );

  const inStock =
    !product.track_inventory || stockQuantity > 0;

  const favorite = favorites.includes(product.id);

  const maximumReached =
    product.track_inventory && quantity >= stockQuantity;

  return (
    <article className="group flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl">
      <div className="flex w-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {product.badge && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#ff4b7c] px-2 py-1 text-[8px] font-black uppercase text-white">
              {product.badge}
            </span>
          )}

          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            aria-label={
              favorite
                ? `Remove ${product.name} from favorites`
                : `Add ${product.name} to favorites`
            }
            aria-pressed={favorite}
            className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow"
          >
            <Heart
              size={16}
              className={
                favorite
                  ? "fill-[#ff4b7c] text-[#ff4b7c]"
                  : ""
              }
            />
          </button>

          <Link
            href={`/shop/${product.slug}`}
            className="block h-full"
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
                <Code2 className="text-purple-300" />
              </div>
            )}
          </Link>
        </div>

        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          {product.category && (
            <p className="text-[8px] font-black uppercase tracking-wider text-purple-500">
              {product.category}
            </p>
          )}

          <Link href={`/shop/${product.slug}`}>
            <h3 className="mt-1.5 line-clamp-2 min-h-[38px] text-[12px] font-bold leading-[1.5] text-[#1e2844] transition hover:text-primary sm:text-[13px]">
              {product.name}
            </h3>
          </Link>

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className="text-[14px] font-black text-primary sm:text-[15px]">
              {money(
                product.price,
                product.currency || "KES"
              )}
            </span>

            {product.compare_at_price && (
              <span className="text-[9px] font-semibold text-slate-400 line-through">
                {money(
                  product.compare_at_price,
                  product.currency || "KES"
                )}
              </span>
            )}
          </div>

          {!inStock && (
            <p className="mt-2 text-[9px] font-bold text-red-500">
              Out of Stock
            </p>
          )}

          <div className="mt-auto pt-4">
            {quantity > 0 ? (
              <div className="flex h-10 items-center justify-between overflow-hidden rounded-xl border border-purple-200 bg-purple-50">
                <button
                  type="button"
                  onClick={() => decrementItem(product.id)}
                  aria-label={`Reduce quantity of ${product.name}`}
                  className="flex h-full w-10 items-center justify-center text-primary transition hover:bg-purple-100"
                >
                  <Minus size={14} />
                </button>

                <div className="text-center">
                  <span className="block text-xs font-black text-primary">
                    {quantity}
                  </span>

                  <span className="hidden text-[8px] font-bold uppercase text-purple-400 sm:block">
                    In Cart
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => incrementItem(product.id)}
                  disabled={maximumReached}
                  aria-label={`Increase quantity of ${product.name}`}
                  className="flex h-full w-10 items-center justify-center text-primary transition hover:bg-purple-100 disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!inStock}
                onClick={() => addToCart(product, 1)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[10px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4e2ec8] disabled:bg-slate-200 disabled:text-slate-400"
              >
                <ShoppingCart size={14} />

                {inStock
                  ? "Add to Cart"
                  : "Unavailable"}
              </button>
            )}

            <Link
              href={`/shop/${product.slug}`}
              className="mt-2.5 block text-center text-[10px] font-bold text-slate-500 transition hover:text-primary"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function Benefit({
  icon: Icon,
  title,
  subtitle,
  last,
}) {
  return (
    <div
      className={`flex min-h-[88px] items-center gap-3 px-5 py-4 ${
        !last
          ? "border-b border-[#eeeeF4] sm:border-r lg:border-b-0"
          : ""
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f0ff] text-[#6442e4]">
        <Icon size={18} />
      </div>

      <div>
        <div className="text-[11px] font-extrabold">
          {title}
        </div>

        <div className="mt-1 text-[10px] text-[#758099]">
          {subtitle}
        </div>
      </div>
    </div>
  );
}