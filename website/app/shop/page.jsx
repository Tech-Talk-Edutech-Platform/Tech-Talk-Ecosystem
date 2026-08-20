"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  CreditCard,
  Download,
  Headphones,
  LayoutGrid,
  Loader2,
  PackageSearch,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load shop products:", error);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

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

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      activeCategory === "All" ||
      product.category === activeCategory;

    const query = search.trim().toLowerCase();

    const searchMatch =
      !query ||
      product.name?.toLowerCase().includes(query) ||
      product.short_description?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query);

    return categoryMatch && searchMatch;
  });

  const featuredProducts = filteredProducts.filter(
    (product) => product.is_featured
  );

  const displayedProducts =
    featuredProducts.length > 0
      ? featuredProducts.slice(0, 5)
      : filteredProducts.slice(0, 5);

  function money(value, currency = "KES") {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function showAllProducts() {
    setActiveCategory("All");

    setTimeout(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  return (
    <main className="min-h-screen bg-white text-[#101936]">

      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-[#ececf4] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5030d9] text-white shadow-sm">
              <Code2 size={20} />
            </div>

            <div className="leading-none">
              <div className="text-[17px] font-extrabold text-[#151d3b]">
                Tech Talk Hub
              </div>

              <div className="mt-1 text-[9px] font-medium text-[#5f6882]">
                Think. Code. Create.
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 text-[13px] font-semibold text-[#34405f] lg:flex">
            <Link
              href="/"
              className="transition hover:text-[#5532df]"
            >
              Home
            </Link>

            <Link
              href="/courses"
              className="flex items-center gap-1 transition hover:text-[#5532df]"
            >
              Courses
              <span className="text-[11px]">⌄</span>
            </Link>

            <Link
              href="/shop"
              className="relative text-[#5532df]"
            >
              Shop

              <span className="absolute -bottom-[27px] left-0 right-0 h-[2px] rounded-full bg-[#5634e4]" />
            </Link>

            <Link
              href="/blog"
              className="transition hover:text-[#5532df]"
            >
              Blog
            </Link>

            <Link
              href="/community"
              className="transition hover:text-[#5532df]"
            >
              Community
            </Link>
          </nav>

          {/* Right */}
          <div className="hidden items-center gap-3 lg:flex">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#53617f]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products..."
                className="h-10 w-[210px] rounded-xl border border-[#e1e3ed] bg-white pl-10 pr-4 text-[12px] outline-none transition placeholder:text-[#8b93a9] focus:border-[#7657eb] focus:ring-4 focus:ring-purple-100/60"
              />
            </div>

            <button
              type="button"
              className="relative flex h-10 w-11 items-center justify-center rounded-xl border border-[#e3e5ee] bg-white transition hover:bg-slate-50"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={17} />

              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5635e4] px-1 text-[8px] font-bold text-white">
                0
              </span>
            </button>

            <Link
              href="/login"
              className="flex h-10 items-center justify-center rounded-xl border border-[#e3e5ee] px-[18px] text-[12px] font-semibold transition hover:bg-slate-50"
            >
              Login
            </Link>

            <Link
              href="/book-class"
              className="flex h-10 items-center justify-center rounded-xl bg-[#ff4778] px-5 text-[12px] font-bold text-white shadow-[0_5px_15px_rgba(255,71,120,0.22)] transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Book Trial
            </Link>
          </div>

          {/* Mobile cart */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={18} />

            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5635e4] px-1 text-[8px] font-bold text-white">
              0
            </span>
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-[#f0eef8]">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(110deg,#ffffff 0%,#fcfaff 48%,#f4edff 100%)",
          }}
        />

        {/* Decorative Waves */}
        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
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

          {/* Left */}
          <div className="max-w-[610px]">
            <span className="inline-flex rounded-full bg-[#eee8ff] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#5b3ae2]">
              Premium Shop
            </span>

            <h1 className="mt-4 text-[38px] font-black leading-[1.07] tracking-[-0.03em] text-[#101936] sm:text-[46px] lg:text-[50px] xl:text-[54px]">
              Premium Learning Products
              <br className="hidden sm:block" /> for{" "}
              <span className="bg-gradient-to-r from-[#9176f5] via-[#b75ee8] to-[#ff4c83] bg-clip-text text-transparent">
                Young Creators.
              </span>
            </h1>

            <p className="mt-5 max-w-[540px] text-[14px] leading-7 text-[#586581] sm:text-[15px]">
              Handpicked coding books, educational resources,
              kits, tools and creative products designed to make
              every learning journey practical, fun and inspiring.
            </p>

            {/* Mini Benefits */}
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12px] font-semibold text-[#34415e]">
              <div className="flex items-center gap-2">
                <span className="text-[#5634e4]">✓</span>
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

            {/* Buttons */}
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={showAllProducts}
                className="inline-flex h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-[#6033e7] to-[#5931e0] px-7 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(91,52,223,0.22)] transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Explore All Products
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");

                  setTimeout(() => {
                    document
                      .getElementById("products")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }, 50);
                }}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e4e4ee] bg-white px-7 text-[13px] font-bold text-[#313b58] shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
              >
                <Star
                  size={16}
                  className="text-[#623bdc]"
                />
                Bestsellers
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-[75%] w-[75%] rounded-full bg-purple-300/10 blur-[80px]" />

            <Image
              src="/shop/premium-shop-hero.png"
              alt="Tech Talk Hub premium shop"
              width={620}
              height={400}
              priority
              className="relative mx-auto h-auto w-full max-w-[500px] object-contain lg:max-w-[560px] xl:max-w-[620px]"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          BENEFITS
      ====================================================== */}
      <section className="relative z-10 -mt-4">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-2xl border border-[#ededf3] bg-white shadow-[0_8px_25px_rgba(23,32,70,0.06)] sm:grid-cols-2 lg:grid-cols-5">
            <Benefit
              icon={Star}
              title="Premium Quality"
              subtitle="Carefully crafted products"
            />

            <Benefit
              icon={Download}
              title="Fast Delivery"
              subtitle="Quick access after purchase"
            />

            <Benefit
              icon={Wrench}
              title="Useful Resources"
              subtitle="Designed for real learning"
            />

            <Benefit
              icon={CreditCard}
              title="Secure Payments"
              subtitle="Safe local payments"
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

      {/* =====================================================
          CATEGORIES
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#151d38]">
            Shop by Category
          </h2>

          <button
            type="button"
            onClick={() => setActiveCategory("All")}
            className="text-[12px] font-bold text-[#5c36df] transition hover:text-purple-800"
          >
            View All Categories
          </button>
        </div>

        {categories.length > 1 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(1, 7).map(
              (category, index) => {
                const Icon = [
                  LayoutGrid,
                  Code2,
                  BookOpen,
                  Wrench,
                  Sparkles,
                  ShoppingCart,
                ][index % 6];

                const count = products.filter(
                  (product) =>
                    product.category === category
                ).length;

                return (
                  <button
                    type="button"
                    key={category}
                    onClick={() =>
                      setActiveCategory(category)
                    }
                    className={`flex min-h-[76px] items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-[0_2px_8px_rgba(20,28,56,0.035)] transition hover:-translate-y-0.5 hover:shadow-md ${
                      activeCategory === category
                        ? "border-[#8061eb] ring-2 ring-purple-100"
                        : "border-[#e7e8ef]"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1ecff] text-[#6944e6]">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold text-[#27314d]">
                        {category}
                      </p>

                      <p className="mt-1 text-[10px] text-[#8690a7]">
                        {count}{" "}
                        {count === 1
                          ? "Product"
                          : "Products"}
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            Categories will appear when products are added.
          </div>
        )}
      </section>

      {/* =====================================================
          PRODUCTS
      ====================================================== */}
      <section
        id="products"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-4 pt-10 sm:px-6 lg:px-8"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#151d38]">
              {activeCategory === "All"
                ? "Featured Products"
                : activeCategory}
            </h2>

            {search && (
              <p className="mt-1 text-xs text-slate-400">
                Results for &quot;{search}&quot;
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={showAllProducts}
            className="text-[12px] font-bold text-[#5c36df] transition hover:text-purple-800"
          >
            View All Products
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#5834df]" />
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
              <PackageSearch
                size={26}
                className="text-purple-300"
              />
            </div>

            <p className="mt-4 font-bold text-slate-700">
              No products found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try another category or search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {displayedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="group overflow-hidden rounded-2xl border border-[#e3e5ec] bg-white shadow-[0_3px_12px_rgba(19,29,58,0.05)] transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#101425]">
                  {product.badge && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-[#ff4b7c] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wide text-white shadow">
                      {product.badge}
                    </span>
                  )}

                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#151a37] via-[#25205d] to-[#16162d]">
                      <Code2
                        size={42}
                        className="text-purple-300"
                      />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  {product.category && (
                    <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-purple-500">
                      {product.category}
                    </p>
                  )}

                  <h3 className="line-clamp-2 min-h-[42px] text-[13px] font-bold leading-[1.5] text-[#1e2844] transition group-hover:text-[#5837de]">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="mt-2.5 flex items-center gap-1">
                    <Star
                      size={11}
                      className="fill-[#ffad17] text-[#ffad17]"
                    />

                    <span className="text-[10px] font-bold text-[#3d4864]">
                      4.9
                    </span>

                    <span className="text-[9px] text-[#9ca3b6]">
                      (New)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <span className="text-[15px] font-black text-[#5837de]">
                      {money(
                        product.price,
                        product.currency || "KES"
                      )}
                    </span>

                    {product.compare_at_price && (
                      <span className="text-[10px] font-semibold text-[#9fa5b5] line-through">
                        {money(
                          product.compare_at_price,
                          product.currency || "KES"
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          BOTTOM STRIP
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-gradient-to-r from-[#8066e5] via-[#876ae8] to-[#967ee3] text-white shadow-lg md:grid-cols-[2fr_repeat(4,1fr)]">
          <div className="flex min-h-[100px] items-center gap-4 px-7 py-6 lg:px-10">
            <span className="text-[44px] font-black leading-none text-white/60">
              “
            </span>

            <p className="max-w-[350px] text-[12px] font-semibold leading-5">
              Every purchase supports creative learning and
              technology education for young people.
            </p>
          </div>

          <BottomStat
            title={`${products.length}+`}
            subtitle="Shop Products"
          />

          <BottomStat
            title="KES"
            subtitle="Local Pricing"
          />

          <BottomStat
            title="Secure"
            subtitle="Payments"
          />

          <BottomStat
            title="100%"
            subtitle="Learning Focus"
          />
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

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

      <div className="min-w-0">
        <div className="text-[11px] font-extrabold text-[#202944]">
          {title}
        </div>

        <div className="mt-1 text-[10px] leading-[1.45] text-[#758099]">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOTTOM STAT
========================================================= */

function BottomStat({ title, subtitle }) {
  return (
    <div className="flex min-h-[88px] flex-col items-center justify-center border-t border-white/10 px-4 py-5 md:border-l md:border-t-0">
      <div className="text-[20px] font-black">
        {title}
      </div>

      <div className="mt-1 text-[10px] text-white/75">
        {subtitle}
      </div>
    </div>
  );
}
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   ArrowRight,
//   BookOpen,
//   Code2,
//   CreditCard,
//   Download,
//   Headphones,
//   LayoutGrid,
//   Loader2,
//   PackageSearch,
//   Search,
//   ShoppingCart,
//   Star,
//   Wrench,
// } from "lucide-react";

// import { supabase } from "../../lib/supabase";

// export default function ShopPage() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [activeCategory, setActiveCategory] = useState("All");

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   async function fetchProducts() {
//     setLoading(true);

//     const { data, error } = await supabase
//       .from("shop_products")
//       .select("*")
//       .eq("is_active", true)
//       .order("display_order", { ascending: true })
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error(error);
//       setProducts([]);
//     } else {
//       setProducts(data || []);
//     }

//     setLoading(false);
//   }

//   const categories = useMemo(() => {
//     return [
//       "All",
//       ...new Set(
//         products
//           .map((product) => product.category)
//           .filter(Boolean)
//       ),
//     ];
//   }, [products]);

//   const filteredProducts = products.filter((product) => {
//     const categoryMatch =
//       activeCategory === "All" ||
//       product.category === activeCategory;

//     const query = search.trim().toLowerCase();

//     const searchMatch =
//       !query ||
//       product.name?.toLowerCase().includes(query) ||
//       product.short_description?.toLowerCase().includes(query) ||
//       product.category?.toLowerCase().includes(query);

//     return categoryMatch && searchMatch;
//   });

//   const featured = filteredProducts.filter(
//     (product) => product.is_featured
//   );

//   const displayedProducts =
//     featured.length > 0
//       ? featured.slice(0, 5)
//       : filteredProducts.slice(0, 5);

//   function money(value, currency = "KES") {
//     return new Intl.NumberFormat("en-KE", {
//       style: "currency",
//       currency,
//       maximumFractionDigits: 0,
//     }).format(Number(value || 0));
//   }

//   return (
//     <main className="min-h-screen bg-white text-[#101936]">

//       {/* =====================================================
//           NAVIGATION
//       ====================================================== */}
//       <header className="h-[69px] border-b border-[#ececf4] bg-white">
//         <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-7">

//           {/* Brand */}
//           <Link href="/" className="flex items-center gap-3">
//             <div className="flex h-[37px] w-[37px] items-center justify-center rounded-[9px] bg-[#5030d9] text-white shadow-sm">
//               <Code2 size={20} />
//             </div>

//             <div className="leading-none">
//               <div className="text-[17px] font-extrabold text-[#151d3b]">
//                 Tech Talk Hub
//               </div>

//               <div className="mt-1 text-[9px] font-medium text-[#5f6882]">
//                 Think. Code. Create.
//               </div>
//             </div>
//           </Link>

//           {/* Nav */}
//           <nav className="hidden items-center gap-[32px] text-[12px] font-semibold text-[#34405f] lg:flex">
//             <Link href="/">Home</Link>

//             <Link href="/courses" className="flex items-center gap-1">
//               Courses
//               <span className="text-[11px]">⌄</span>
//             </Link>

//             <Link
//               href="/shop"
//               className="relative text-[#5532df]"
//             >
//               Shop

//               <span className="absolute -bottom-[24px] left-0 right-0 h-[2px] rounded-full bg-[#5634e4]" />
//             </Link>

//             <Link href="/blog">Blog</Link>

//             <Link href="/community">
//               Community
//             </Link>
//           </nav>

//           {/* Right */}
//           <div className="hidden items-center gap-3 lg:flex">

//             <div className="relative">
//               <Search
//                 size={15}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#53617f]"
//               />

//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search products..."
//                 className="h-[36px] w-[200px] rounded-[8px] border border-[#e1e3ed] bg-white pl-10 pr-4 text-[11px] outline-none placeholder:text-[#8b93a9] focus:border-[#7657eb]"
//               />
//             </div>

//             <button className="relative flex h-[36px] w-[42px] items-center justify-center rounded-[8px] border border-[#e3e5ee] bg-white">
//               <ShoppingCart size={17} />

//               <span className="absolute -right-[3px] -top-[5px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#5635e4] px-1 text-[8px] font-bold text-white">
//                 0
//               </span>
//             </button>

//             <Link
//               href="/login"
//               className="flex h-[36px] items-center justify-center rounded-[8px] border border-[#e3e5ee] px-[17px] text-[11px] font-semibold"
//             >
//               Login
//             </Link>

//             <Link
//               href="/book-class"
//               className="flex h-[36px] items-center justify-center rounded-[8px] bg-[#ff4778] px-[19px] text-[11px] font-bold text-white shadow-[0_5px_15px_rgba(255,71,120,0.22)]"
//             >
//               Book Trial
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* =====================================================
//           HERO
//       ====================================================== */}
//       <section className="relative h-[355px] overflow-hidden border-b border-[#f0eef8]">

//         {/* Background */}
//         <div
//           className="absolute inset-0"
//           style={{
//             background:
//               "linear-gradient(110deg,#ffffff 0%,#fcfaff 48%,#f4edff 100%)",
//           }}
//         />

//         {/* Subtle decorative waves */}
//         <svg
//           viewBox="0 0 1440 355"
//           preserveAspectRatio="none"
//           className="pointer-events-none absolute inset-0 h-full w-full"
//         >
//           <path
//             d="M0 300 C220 215 350 265 560 240 C800 210 920 105 1120 125 C1270 140 1350 200 1440 220 L1440 355 L0 355Z"
//             fill="#9272ee"
//             opacity="0.035"
//           />

//           <path
//             d="M580 355 C760 235 880 215 1040 220 C1190 225 1310 155 1440 120 L1440 355Z"
//             fill="#b59cf8"
//             opacity="0.08"
//           />
//         </svg>

//         <div className="relative mx-auto grid h-full max-w-[1280px] grid-cols-2 items-center px-7">

//           {/* LEFT */}
//           <div className="max-w-[570px]">

//             <span className="inline-flex rounded-full bg-[#eee8ff] px-[10px] py-[5px] text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#5b3ae2]">
//               Premium Shop
//             </span>

//             <h1 className="mt-[12px] text-[40px] font-black leading-[1.08] tracking-[-0.025em] text-[#101936]">
//               Premium Learning Products
//               <br />
//               for{" "}
//               <span className="bg-gradient-to-r from-[#9176f5] via-[#b75ee8] to-[#ff4c83] bg-clip-text text-transparent">
//                 Young Creators.
//               </span>
//             </h1>

//             <p className="mt-[14px] max-w-[490px] text-[14px] leading-[1.55] text-[#586581]">
//               Handpicked coding books, educational resources, kits,
//               tools and creative products to make every learning
//               journey more exciting.
//             </p>

//             {/* Hero mini benefits */}
//             <div className="mt-[21px] flex items-center gap-[30px] text-[11px] font-semibold text-[#34415e]">

//               <div className="flex items-center gap-2">
//                 <span className="text-[#5634e4]">✓</span>
//                 Premium Quality
//               </div>

//               <div className="flex items-center gap-2">
//                 <Download size={13} className="text-[#5634e4]" />
//                 Fast Delivery
//               </div>

//               <div className="flex items-center gap-2">
//                 <CreditCard size={13} className="text-[#5634e4]" />
//                 Secure Payments
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="mt-[23px] flex gap-[13px]">

//               <a
//                 href="#products"
//                 className="inline-flex h-[46px] items-center gap-3 rounded-[7px] bg-gradient-to-r from-[#6033e7] to-[#5931e0] px-[27px] text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(91,52,223,0.22)]"
//               >
//                 Explore All Products
//                 <ArrowRight size={15} />
//               </a>

//               <button
//                 onClick={() => setActiveCategory("All")}
//                 className="inline-flex h-[46px] items-center gap-2 rounded-[7px] border border-[#e4e4ee] bg-white px-[26px] text-[12px] font-bold text-[#313b58] shadow-sm"
//               >
//                 <Star size={16} className="text-[#623bdc]" />
//                 Bestsellers
//               </button>
//             </div>
//           </div>

//           {/* RIGHT — EXACT ASSET AREA */}
//           <div className="relative flex h-full items-center justify-center">

//             <Image
//               src="/shop/premium-shop-hero.png"
//               alt="Tech Talk Hub premium shop"
//               width={570}
//               height={340}
//               priority
//               className="h-auto w-[570px] object-contain"
//             />

//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           BENEFIT STRIP
//       ====================================================== */}
//       <section className="-mt-[5px]">
//         <div className="mx-auto max-w-[1200px] px-5">

//           <div className="grid h-[79px] grid-cols-5 overflow-hidden rounded-[13px] border border-[#ededf3] bg-white shadow-[0_5px_18px_rgba(23,32,70,0.05)]">

//             <Benefit
//               icon={Star}
//               title="Premium Quality"
//               subtitle="Carefully crafted products"
//             />

//             <Benefit
//               icon={Download}
//               title="Fast Delivery"
//               subtitle="Quick access after purchase"
//             />

//             <Benefit
//               icon={Wrench}
//               title="Regular Updates"
//               subtitle="Resources improved regularly"
//             />

//             <Benefit
//               icon={CreditCard}
//               title="Secure Payments"
//               subtitle="Safe local payments"
//             />

//             <Benefit
//               icon={Headphones}
//               title="Support"
//               subtitle="We're here to help"
//               last
//             />

//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           CATEGORIES
//       ====================================================== */}
//       <section className="mx-auto max-w-[1200px] px-5 pt-[27px]">

//         <div className="mb-[13px] flex items-center justify-between">

//           <h2 className="text-[15px] font-extrabold text-[#151d38]">
//             Shop by Category
//           </h2>

//           <button
//             onClick={() => setActiveCategory("All")}
//             className="text-[10px] font-bold text-[#5c36df]"
//           >
//             View All Categories
//           </button>
//         </div>

//         <div className="grid grid-cols-6 gap-[14px]">

//           {categories.slice(1, 7).map((category, index) => {
//             const Icon = [
//               LayoutGrid,
//               Code2,
//               BookOpen,
//               Wrench,
//               Sparkles,
//               ShoppingCart,
//             ][index % 6];

//             const count = products.filter(
//               (product) => product.category === category
//             ).length;

//             return (
//               <button
//                 key={category}
//                 onClick={() => setActiveCategory(category)}
//                 className={`flex h-[61px] items-center gap-3 rounded-[8px] border bg-white px-[14px] text-left shadow-[0_2px_8px_rgba(20,28,56,0.035)] transition ${
//                   activeCategory === category
//                     ? "border-[#8061eb]"
//                     : "border-[#e7e8ef]"
//                 }`}
//               >
//                 <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[8px] bg-[#f1ecff] text-[#6944e6]">
//                   <Icon size={17} />
//                 </div>

//                 <div>
//                   <p className="text-[11px] font-bold leading-tight text-[#27314d]">
//                     {category}
//                   </p>

//                   <p className="mt-1 text-[9px] text-[#8690a7]">
//                     {count} Products
//                   </p>
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       </section>

//       {/* =====================================================
//           PRODUCTS
//       ====================================================== */}
//       <section
//         id="products"
//         className="mx-auto max-w-[1200px] px-5 pt-[25px]"
//       >
//         <div className="mb-[13px] flex items-center justify-between">

//           <h2 className="text-[15px] font-extrabold text-[#151d38]">
//             Featured Products
//           </h2>

//           <button
//             onClick={() => setActiveCategory("All")}
//             className="text-[10px] font-bold text-[#5c36df]"
//           >
//             View All Products
//           </button>
//         </div>

//         {loading ? (
//           <div className="flex h-[230px] items-center justify-center">
//             <Loader2 className="animate-spin text-[#5834df]" />
//           </div>
//         ) : displayedProducts.length === 0 ? (
//           <div className="flex h-[230px] flex-col items-center justify-center">
//             <PackageSearch
//               size={32}
//               className="text-slate-300"
//             />

//             <p className="mt-3 text-sm text-slate-500">
//               Products coming soon
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-5 gap-[18px]">

//             {displayedProducts.map((product) => (
//               <Link
//                 key={product.id}
//                 href={`/shop/${product.slug}`}
//                 className="group overflow-hidden rounded-[8px] border border-[#e3e5ec] bg-white shadow-[0_2px_10px_rgba(19,29,58,0.05)] transition hover:-translate-y-1 hover:shadow-lg"
//               >

//                 {/* Image */}
//                 <div className="relative h-[121px] overflow-hidden bg-[#101425]">

//                   {product.badge && (
//                     <span className="absolute left-[9px] top-[9px] z-10 rounded-full bg-[#ff4b7c] px-[8px] py-[3px] text-[7px] font-extrabold uppercase text-white">
//                       {product.badge}
//                     </span>
//                   )}

//                   {product.image_url ? (
//                     <Image
//                       src={product.image_url}
//                       alt={product.name}
//                       fill
//                       sizes="240px"
//                       className="object-cover"
//                     />
//                   ) : (
//                     <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#151a37] via-[#25205d] to-[#16162d]">
//                       <Code2
//                         size={40}
//                         className="text-purple-300"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* Body */}
//                 <div className="p-[12px]">

//                   <h3 className="line-clamp-2 min-h-[34px] text-[11px] font-bold leading-[1.45] text-[#1e2844]">
//                     {product.name}
//                   </h3>

//                   {/* Rating */}
//                   <div className="mt-[8px] flex items-center gap-1">

//                     <Star
//                       size={10}
//                       className="fill-[#ffad17] text-[#ffad17]"
//                     />

//                     <span className="text-[9px] font-bold text-[#3d4864]">
//                       4.9
//                     </span>

//                     <span className="text-[8px] text-[#9ca3b6]">
//                       (New)
//                     </span>
//                   </div>

//                   {/* Price */}
//                   <div className="mt-[7px] flex items-baseline gap-[7px]">

//                     <span className="text-[13px] font-black text-[#5837de]">
//                       {money(
//                         product.price,
//                         product.currency || "KES"
//                       )}
//                     </span>

//                     {product.compare_at_price && (
//                       <span className="text-[9px] font-semibold text-[#9fa5b5] line-through">
//                         {money(
//                           product.compare_at_price,
//                           product.currency || "KES"
//                         )}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </Link>
//             ))}

//           </div>
//         )}
//       </section>

//       {/* =====================================================
//           PURPLE FOOT STRIP
//       ====================================================== */}
//       <section className="mx-auto max-w-[1200px] px-5 pb-[22px] pt-[18px]">

//         <div className="grid h-[78px] grid-cols-[2fr_repeat(4,1fr)] overflow-hidden rounded-[9px] bg-gradient-to-r from-[#8066e5] via-[#876ae8] to-[#967ee3] text-white">

//           <div className="flex items-center gap-4 px-[42px]">

//             <span className="text-[42px] font-black leading-none text-white/65">
//               “
//             </span>

//             <p className="max-w-[310px] text-[10px] font-semibold leading-[1.65]">
//               Every purchase supports creative learning and
//               technology education for young people.
//             </p>
//           </div>

//           <BottomStat
//             title={`${products.length}+`}
//             subtitle="Shop Products"
//           />

//           <BottomStat
//             title="KES"
//             subtitle="Local Pricing"
//           />

//           <BottomStat
//             title="Secure"
//             subtitle="Payments"
//           />

//           <BottomStat
//             title="100%"
//             subtitle="Learning Focus"
//           />

//         </div>
//       </section>
//     </main>
//   );
// }

// function Benefit({ icon: Icon, title, subtitle, last }) {
//   return (
//     <div
//       className={`flex items-center gap-3 px-[18px] ${
//         !last ? "border-r border-[#eeeeF4]" : ""
//       }`}
//     >
//       <div className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[9px] bg-[#f4f0ff] text-[#6442e4]">
//         <Icon size={17} />
//       </div>

//       <div>
//         <div className="text-[10px] font-extrabold text-[#202944]">
//           {title}
//         </div>

//         <div className="mt-[3px] max-w-[120px] text-[9px] leading-[1.35] text-[#758099]">
//           {subtitle}
//         </div>
//       </div>
//     </div>
//   );
// }

// function BottomStat({ title, subtitle }) {
//   return (
//     <div className="flex flex-col items-center justify-center border-l border-white/10">

//       <div className="text-[18px] font-black">
//         {title}
//       </div>

//       <div className="mt-[2px] text-[9px] text-white/75">
//         {subtitle}
//       </div>

//     </div>
//   );
// }
// // "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   ArrowRight,
//   BookOpen,
//   Code2,
//   CreditCard,
//   Download,
//   Headphones,
//   LayoutTemplate,
//   Loader2,
//   Laptop,
//   PackageSearch,
//   Search,
//   ShieldCheck,
//   ShoppingBag,
//   ShoppingCart,
//   Sparkles,
//   Star,
//   Wrench,
// } from "lucide-react";

// import { supabase } from "../../lib/supabase";

// export default function ShopPage() {
//   const [products, setProducts] = useState([]);
//   const [activeCategory, setActiveCategory] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   async function fetchProducts() {
//     setLoading(true);

//     const { data, error } = await supabase
//       .from("shop_products")
//       .select("*")
//       .eq("is_active", true)
//       .order("display_order", { ascending: true })
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Failed to load products:", error);
//       setProducts([]);
//     } else {
//       setProducts(data || []);
//     }

//     setLoading(false);
//   }

//   const categories = useMemo(() => {
//     return [
//       "All",
//       ...new Set(
//         products.map((product) => product.category).filter(Boolean)
//       ),
//     ];
//   }, [products]);

//   const filteredProducts = products.filter((product) => {
//     const matchesCategory =
//       activeCategory === "All" || product.category === activeCategory;

//     const matchesSearch =
//       !search ||
//       product.name?.toLowerCase().includes(search.toLowerCase()) ||
//       product.short_description
//         ?.toLowerCase()
//         .includes(search.toLowerCase());

//     return matchesCategory && matchesSearch;
//   });

//   const featuredProducts = filteredProducts.filter(
//     (product) => product.is_featured
//   );

//   const visibleProducts =
//     featuredProducts.length > 0
//       ? featuredProducts
//       : filteredProducts.slice(0, 5);

//   function formatPrice(product) {
//     return new Intl.NumberFormat("en-KE", {
//       style: "currency",
//       currency: product.currency || "KES",
//       maximumFractionDigits: 0,
//     }).format(Number(product.price));
//   }

//   function formatOldPrice(product) {
//     if (!product.compare_at_price) return null;

//     return new Intl.NumberFormat("en-KE", {
//       style: "currency",
//       currency: product.currency || "KES",
//       maximumFractionDigits: 0,
//     }).format(Number(product.compare_at_price));
//   }

//   return (
//     <main className="min-h-screen bg-[#fcfbff] text-slate-900">

//       {/* =========================
//           TOP NAV
//       ========================== */}
//       <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
//         <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

//           <Link href="/" className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
//               <Code2 size={20} />
//             </div>

//             <div>
//               <p className="text-lg font-extrabold text-slate-900">
//                 Tech Talk Hub
//               </p>

//               <p className="text-[10px] text-slate-500">
//                 Think. Code. Create.
//               </p>
//             </div>
//           </Link>

//           <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 lg:flex">
//             <Link href="/">Home</Link>
//             <Link href="/courses">Courses</Link>
//             <Link href="/shop" className="text-primary">
//               Shop
//             </Link>
//             <Link href="/blog">Blog</Link>
//           </nav>

//           <div className="hidden items-center gap-3 lg:flex">
//             <div className="relative">
//               <Search
//                 size={17}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//               />

//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search products..."
//                 className="w-56 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
//               />
//             </div>

//             <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50">
//               <ShoppingCart size={18} />

//               <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
//                 0
//               </span>
//             </button>

//             <Link
//               href="/login"
//               className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
//             >
//               Login
//             </Link>

//             <Link
//               href="/book-class"
//               className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20"
//             >
//               Book Trial
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* =========================
//           HERO
//       ========================== */}
//       <section className="relative overflow-hidden border-b border-purple-100/70">
//         <div className="absolute inset-0 bg-gradient-to-br from-white via-[#faf7ff] to-[#f2eaff]" />

//         <div className="pointer-events-none absolute -right-20 top-10 h-[420px] w-[420px] rounded-full bg-purple-300/20 blur-[100px]" />

//         <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr]">

//           {/* Left */}
//           <div>
//             <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
//               Premium Shop
//             </span>

//             <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.7rem]">
//               Premium Learning Products for{" "}
//               <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
//                 Young Creators.
//               </span>
//             </h1>

//             <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
//               Handpicked coding books, educational resources, kits and
//               creative tools designed to make learning technology practical,
//               fun and inspiring.
//             </p>

//             <div className="mt-7 flex flex-wrap gap-6 text-sm font-semibold text-slate-600">
//               <div className="flex items-center gap-2">
//                 <ShieldCheck size={17} className="text-primary" />
//                 Premium Quality
//               </div>

//               <div className="flex items-center gap-2">
//                 <Download size={17} className="text-primary" />
//                 Fast Delivery
//               </div>

//               <div className="flex items-center gap-2">
//                 <CreditCard size={17} className="text-primary" />
//                 Secure Payments
//               </div>
//             </div>

//             <div className="mt-8 flex flex-wrap gap-3">
//               <a
//                 href="#featured-products"
//                 className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20"
//               >
//                 Explore All Products
//                 <ArrowRight size={16} />
//               </a>

//               <button
//                 onClick={() => setActiveCategory("All")}
//                 className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm"
//               >
//                 <Star size={16} className="text-primary" />
//                 Bestsellers
//               </button>
//             </div>
//           </div>

//           {/* Right Hero Visual */}
//           <div className="relative mx-auto flex min-h-[340px] w-full max-w-xl items-center justify-center">
//             <div className="absolute h-[280px] w-[280px] rounded-full bg-purple-300/20 blur-3xl" />

//             <div className="relative flex h-[290px] w-[290px] items-center justify-center rounded-[50%] bg-gradient-to-b from-white to-purple-100 shadow-2xl ring-1 ring-purple-100">
//               <div className="absolute bottom-[-16px] h-12 w-[320px] rounded-[50%] bg-purple-300/40 blur-md" />

//               <div className="relative flex h-48 w-40 items-center justify-center rounded-[28px] bg-gradient-to-b from-indigo-950 to-violet-900 shadow-2xl">
//                 <ShoppingBag className="h-20 w-20 text-purple-300" />
//               </div>
//             </div>

//             <div className="absolute left-[7%] top-[20%] rotate-[-10deg] rounded-2xl bg-white p-4 shadow-xl">
//               <LayoutTemplate className="text-primary" />
//             </div>

//             <div className="absolute right-[8%] top-[18%] rotate-[8deg] rounded-2xl bg-white p-4 shadow-xl">
//               <Code2 className="text-sky-500" />
//             </div>

//             <div className="absolute bottom-[16%] right-[3%] rotate-[7deg] rounded-2xl bg-slate-900 p-4 shadow-xl">
//               <Laptop className="text-white" />
//             </div>

//             <div className="absolute bottom-[20%] left-[8%] rotate-[-6deg] rounded-2xl bg-white p-4 shadow-xl">
//               <BookOpen className="text-secondary" />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =========================
//           BENEFITS ROW
//       ========================== */}
//       <section className="relative z-10 -mt-5">
//         <div className="mx-auto max-w-7xl px-6">
//           <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/30 sm:grid-cols-2 lg:grid-cols-5">

//             <Benefit
//               icon={Sparkles}
//               title="Premium Quality"
//               text="Carefully selected resources"
//             />

//             <Benefit
//               icon={Download}
//               title="Fast Delivery"
//               text="Quick access after purchase"
//             />

//             <Benefit
//               icon={Wrench}
//               title="Useful Resources"
//               text="Built for real learning"
//             />

//             <Benefit
//               icon={CreditCard}
//               title="Secure Payments"
//               text="KES payments supported"
//             />

//             <Benefit
//               icon={Headphones}
//               title="Support"
//               text="We’re here to help"
//             />
//           </div>
//         </div>
//       </section>

//       {/* =========================
//           CATEGORY SECTION
//       ========================== */}
//       <section className="mx-auto max-w-7xl px-6 py-10">

//         <div className="mb-5 flex items-center justify-between">
//           <h2 className="text-xl font-extrabold text-slate-900">
//             Shop by Category
//           </h2>

//           <button
//             onClick={() => setActiveCategory("All")}
//             className="text-sm font-semibold text-primary"
//           >
//             View All Categories
//           </button>
//         </div>

//         <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
//           {categories.slice(1, 7).map((category, index) => {
//             const icons = [
//               LayoutTemplate,
//               Code2,
//               BookOpen,
//               Wrench,
//               Sparkles,
//               ShoppingBag,
//             ];

//             const Icon = icons[index % icons.length];

//             const count = products.filter(
//               (product) => product.category === category
//             ).length;

//             return (
//               <button
//                 key={category}
//                 onClick={() => setActiveCategory(category)}
//                 className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
//                   activeCategory === category
//                     ? "border-primary/40 ring-2 ring-primary/5"
//                     : "border-slate-200"
//                 }`}
//               >
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-primary">
//                   <Icon size={18} />
//                 </div>

//                 <div>
//                   <p className="text-sm font-bold text-slate-800">
//                     {category}
//                   </p>

//                   <p className="text-[11px] text-slate-400">
//                     {count} Product{count === 1 ? "" : "s"}
//                   </p>
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       </section>

//       {/* =========================
//           FEATURED PRODUCTS
//       ========================== */}
//       <section
//         id="featured-products"
//         className="mx-auto max-w-7xl px-6 pb-12"
//       >
//         <div className="mb-5 flex items-center justify-between">
//           <h2 className="text-xl font-extrabold text-slate-900">
//             Featured Products
//           </h2>

//           <button
//             onClick={() => setActiveCategory("All")}
//             className="text-sm font-semibold text-primary"
//           >
//             View All Products
//           </button>
//         </div>

//         {loading ? (
//           <div className="flex min-h-[320px] items-center justify-center">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           </div>
//         ) : visibleProducts.length === 0 ? (
//           <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
//             <PackageSearch className="h-10 w-10 text-slate-300" />

//             <h3 className="mt-4 text-lg font-bold text-slate-800">
//               Products coming soon
//             </h3>
//           </div>
//         ) : (
//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
//             {visibleProducts.map((product) => (
//               <Link
//                 href={`/shop/${product.slug}`}
//                 key={product.id}
//                 className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
//               >
//                 <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
//                   {product.badge && (
//                     <span className="absolute left-3 top-3 z-10 rounded-full bg-secondary px-2.5 py-1 text-[9px] font-bold uppercase text-white">
//                       {product.badge}
//                     </span>
//                   )}

//                   {product.image_url ? (
//                     <Image
//                       src={product.image_url}
//                       alt={product.name}
//                       fill
//                       sizes="20vw"
//                       className="object-cover transition duration-500 group-hover:scale-105"
//                     />
//                   ) : (
//                     <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
//                       <ShoppingBag className="h-12 w-12 text-purple-300" />
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-4">
//                   <h3 className="line-clamp-2 min-h-[44px] text-sm font-bold text-slate-900">
//                     {product.name}
//                   </h3>

//                   <div className="mt-3 flex items-center gap-1">
//                     <Star
//                       size={13}
//                       className="fill-yellow-400 text-yellow-400"
//                     />

//                     <span className="text-xs font-semibold text-slate-700">
//                       4.9
//                     </span>

//                     <span className="text-[11px] text-slate-400">
//                       (New)
//                     </span>
//                   </div>

//                   <div className="mt-3 flex items-baseline gap-2">
//                     <span className="text-base font-extrabold text-primary">
//                       {formatPrice(product)}
//                     </span>

//                     {product.compare_at_price && (
//                       <span className="text-xs text-slate-400 line-through">
//                         {formatOldPrice(product)}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* =========================
//           BOTTOM STRIP
//       ========================== */}
//       <section className="pb-14">
//         <div className="mx-auto max-w-7xl px-6">
//           <div className="grid overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white shadow-xl md:grid-cols-[1.4fr_repeat(4,1fr)]">

//             <div className="flex items-center gap-4 p-6">
//               <div className="text-4xl font-black opacity-60">“</div>

//               <p className="text-sm font-medium leading-relaxed">
//                 Every purchase supports better access to creative technology
//                 learning for young people.
//               </p>
//             </div>

//             <Stat title={`${products.length}+`} text="Shop Products" />
//             <Stat title="KES" text="Local Pricing" />
//             <Stat title="Secure" text="Payments" />
//             <Stat title="100%" text="Learning Focus" />
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }

// function Benefit({ icon: Icon, title, text }) {
//   return (
//     <div className="flex items-start gap-3 border-b border-slate-100 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
//       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-primary">
//         <Icon size={18} />
//       </div>

//       <div>
//         <p className="text-sm font-bold text-slate-800">
//           {title}
//         </p>

//         <p className="mt-1 text-xs leading-relaxed text-slate-500">
//           {text}
//         </p>
//       </div>
//     </div>
//   );
// }

// function Stat({ title, text }) {
//   return (
//     <div className="border-t border-white/10 p-6 text-center md:border-l md:border-t-0">
//       <p className="text-2xl font-black">{title}</p>
//       <p className="mt-1 text-xs text-white/80">{text}</p>
//     </div>
//   );
// }
// // "use client";

// // import { useEffect, useMemo, useState } from "react";
// // import Image from "next/image";
// // import Link from "next/link";
// // import {
// //   ShoppingBag,
// //   Loader2,
// //   PackageSearch,
// //   ArrowRight,
// // } from "lucide-react";

// // import { supabase } from "../../lib/supabase";

// // export default function Shop() {
// //   const [products, setProducts] = useState([]);
// //   const [activeCategory, setActiveCategory] = useState("All");
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     fetchProducts();
// //   }, []);

// //   async function fetchProducts() {
// //     setLoading(true);

// //     const { data, error } = await supabase
// //       .from("shop_products")
// //       .select("*")
// //       .eq("is_active", true)
// //       .order("display_order", { ascending: true })
// //       .order("created_at", { ascending: false });

// //     if (error) {
// //       console.error("Failed to load products:", error);
// //       setProducts([]);
// //     } else {
// //       setProducts(data || []);
// //     }

// //     setLoading(false);
// //   }

// //   const categories = useMemo(() => {
// //     return [
// //       "All",
// //       ...new Set(
// //         products
// //           .map((product) => product.category)
// //           .filter(Boolean)
// //       ),
// //     ];
// //   }, [products]);

// //   const filteredProducts =
// //     activeCategory === "All"
// //       ? products
// //       : products.filter(
// //           (product) => product.category === activeCategory
// //         );

// //   const formatPrice = (product) => {
// //     return new Intl.NumberFormat("en-KE", {
// //       style: "currency",
// //       currency: product.currency || "KES",
// //       maximumFractionDigits: 0,
// //     }).format(Number(product.price));
// //   };

// //   return (
// //     <section
// //       id="shop"
// //       className="relative overflow-hidden bg-white py-20 md:py-24"
// //     >
// //       {/* Background */}
// //       <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-purple-200/20 blur-[130px]" />

// //       <div className="relative z-10 mx-auto max-w-7xl px-6">

// //         {/* Header */}
// //         <div className="mx-auto mb-12 max-w-2xl text-center">
// //           <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-primary">
// //             <ShoppingBag size={14} />
// //             Tech Talk Hub Shop
// //           </span>

// //           <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
// //             Learning that goes{" "}
// //             <span className="text-secondary">
// //               beyond the screen.
// //             </span>
// //           </h2>

// //           <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
// //             Discover coding books, learning resources, tech gear and
// //             creative tools designed to inspire young creators.
// //           </p>
// //         </div>

// //         {/* Categories */}
// //         {!loading && products.length > 0 && (
// //           <div className="mb-10 flex flex-wrap justify-center gap-2">
// //             {categories.map((category) => (
// //               <button
// //                 key={category}
// //                 onClick={() => setActiveCategory(category)}
// //                 className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
// //                   activeCategory === category
// //                     ? "bg-primary text-white shadow-lg shadow-primary/20"
// //                     : "border border-slate-200 bg-white text-slate-600 hover:border-primary/20 hover:bg-purple-50 hover:text-primary"
// //                 }`}
// //               >
// //                 {category}
// //               </button>
// //             ))}
// //           </div>
// //         )}

// //         {/* Loading */}
// //         {loading && (
// //           <div className="flex min-h-[350px] items-center justify-center">
// //             <Loader2 className="h-8 w-8 animate-spin text-primary" />
// //           </div>
// //         )}

// //         {/* Empty State */}
// //         {!loading && filteredProducts.length === 0 && (
// //           <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
// //             <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
// //               <PackageSearch className="h-7 w-7 text-primary" />
// //             </div>

// //             <h3 className="mt-5 text-xl font-bold text-slate-900">
// //               Products coming soon
// //             </h3>

// //             <p className="mt-2 max-w-sm text-sm text-slate-500">
// //               We&apos;re preparing something special for our young
// //               creators.
// //             </p>
// //           </div>
// //         )}

// //         {/* Product Grid */}
// //         {!loading && filteredProducts.length > 0 && (
// //           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
// //             {filteredProducts.map((product) => (
// //               <Link
// //                 key={product.id}
// //                 href={`/shop/${product.slug}`}
// //                 className="group overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60"
// //               >
// //                 {/* Product Image */}
// //                 <div className="relative aspect-square overflow-hidden bg-slate-50">

// //                   {product.badge && (
// //                     <span className="absolute left-4 top-4 z-20 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
// //                       {product.badge}
// //                     </span>
// //                   )}

// //                   {product.image_url ? (
// //                     <Image
// //                       src={product.image_url}
// //                       alt={product.name}
// //                       fill
// //                       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
// //                       className="object-cover transition-transform duration-500 group-hover:scale-105"
// //                     />
// //                   ) : (
// //                     <div className="flex h-full items-center justify-center">
// //                       <ShoppingBag className="h-12 w-12 text-slate-300" />
// //                     </div>
// //                   )}
// //                 </div>

// //                 {/* Information */}
// //                 <div className="p-5">
// //                   <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-secondary">
// //                     {product.category}
// //                   </span>

// //                   <h3 className="mt-2 line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
// //                     {product.name}
// //                   </h3>

// //                   {product.short_description && (
// //                     <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
// //                       {product.short_description}
// //                     </p>
// //                   )}

// //                   <div className="mt-5 flex items-end justify-between">
// //                     <div>
// //                       <span className="text-xl font-extrabold text-slate-900">
// //                         {formatPrice(product)}
// //                       </span>

// //                       {product.compare_at_price && (
// //                         <span className="ml-2 text-sm text-slate-400 line-through">
// //                           {new Intl.NumberFormat("en-KE", {
// //                             style: "currency",
// //                             currency: product.currency || "KES",
// //                             maximumFractionDigits: 0,
// //                           }).format(
// //                             Number(product.compare_at_price)
// //                           )}
// //                         </span>
// //                       )}
// //                     </div>

// //                     <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-primary transition group-hover:bg-primary group-hover:text-white">
// //                       <ArrowRight size={16} />
// //                     </span>
// //                   </div>
// //                 </div>
// //               </Link>
// //             ))}
// //           </div>
// //         )}

// //         {/* Mission */}
// //         <div className="mt-14 rounded-2xl border border-purple-100 bg-purple-50/60 px-6 py-5 text-center text-sm text-slate-600">
// //           Every purchase helps us expand access to technology education
// //           through{" "}
// //           <Link
// //             href="/donate"
// //             className="font-semibold text-primary hover:text-secondary"
// //           >
// //             Empower a Learner →
// //           </Link>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }
// // // "use client";

// // // import { useState } from "react";
// // // import Image from "next/image";
// // // import Link from "next/link";

// // // const products = [
// // //   {
// // //     id: 1,
// // //     name: "Tech Talk Pro Hoodie",
// // //     category: "Apparel",
// // //     price: "$65.00",
// // //     image: "/shop/hoodie.png", // Replace with your image path or placeholder
// // //     badge: "Best Seller",
// // //     description: "Ultra-soft heavyweight cotton designed for late-night coding sessions.",
// // //   },
// // //   {
// // //     id: 2,
// // //     name: "Developer Mechanical Keyboard",
// // //     category: "Hardware",
// // //     price: "$149.00",
// // //     image: "/shop/keyboard.png",
// // //     badge: "New",
// // //     description: "Custom hot-swappable switches with RGB backlighting and aluminum frame.",
// // //   },
// // //   {
// // //     id: 3,
// // //     name: "Full-Stack Mastery Notebook",
// // //     category: "Stationery",
// // //     price: "$24.00",
// // //     image: "/shop/notebook.png",
// // //     badge: "Popular",
// // //     description: "Dot-grid pages with system architecture design templates built-in.",
// // //   },
// // //   {
// // //     id: 4,
// // //     name: "Ergonomic Desk Mat",
// // //     category: "Accessories",
// // //     price: "$35.00",
// // //     image: "/shop/deskmat.png",
// // //     badge: "",
// // //     description: "Water-resistant micro-weave surface for pixel-perfect mouse tracking.",
// // //   },
// // // ];

// // // export default function Shop() {
// // //   const [activeCategory, setActiveCategory] = useState("All");

// // //   const categories = ["All", "Apparel", "Hardware", "Stationery", "Accessories"];

// // //   const filteredProducts = activeCategory === "All" 
// // //     ? products 
// // //     : products.filter(p => p.category === activeCategory);

// // //   return (
// // //     <section id="shop" className="py-24 bg-background relative overflow-hidden">
// // //       {/* Background ambient glow effect */}
// // //       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

// // //       <div className="max-w-7xl mx-auto px-6 relative z-10">
        
// // //         {/* Section Header */}
// // //         <div className="text-center max-w-2xl mx-auto mb-16">
// // //           <span className="text-secondary font-semibold text-sm uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full">
// // //             Exclusive Gear
// // //           </span>
// // //           <h2 className="text-4xl font-extrabold text-text mt-4 tracking-tight">
// // //             The Tech Talk Collection
// // //           </h2>
// // //           <p className="text-text/70 mt-3 text-lg">
// // //             Upgrade your developer lifestyle with premium apparel, gear, and tools built for creators.
// // //           </p>

// // //           {/* Category Filters */}
// // //           <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
// // //             {categories.map((cat) => (
// // //               <button
// // //                 key={cat}
// // //                 onClick={() => setActiveCategory(cat)}
// // //                 className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
// // //                   activeCategory === cat
// // //                     ? "bg-secondary text-background shadow-sm"
// // //                     : "bg-text/5 text-text/80 hover:bg-text/10"
// // //                 }`}
// // //               >
// // //                 {cat}
// // //               </button>
// // //             ))}
// // //           </div>
// // //         </div>

// // //         {/* Product Grid */}
// // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
// // //           {filteredProducts.map((product) => (
// // //             <div
// // //               key={product.id}
// // //               className="group bg-background border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
// // //             >
// // //               {/* Image Container */}
// // //               <div className="relative w-full h-64 bg-gray-50 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
// // //                 {product.badge && (
// // //                   <span className="absolute top-4 left-4 z-10 bg-primary text-background text-xs font-bold px-3 py-1 rounded-full shadow-sm">
// // //                     {product.badge}
// // //                   </span>
// // //                 )}
                
// // //                 {/* Fallback image wrapper / Next Image */}
// // //                 <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
// // //                   <Image
// // //                     src={product.image}
// // //                     alt={product.name}
// // //                     fill
// // //                     className="object-cover"
// // //                   />
// // //                 </div>
// // //               </div>

// // //               {/* Product Info */}
// // //               <div className="p-6 flex flex-col flex-grow justify-between">
// // //                 <div>
// // //                   <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
// // //                     {product.category}
// // //                   </div>
// // //                   <h3 className="font-bold text-lg text-text group-hover:text-secondary transition-colors">
// // //                     {product.name}
// // //                   </h3>
// // //                   <p className="text-text/60 text-sm mt-2 line-clamp-2">
// // //                     {product.description}
// // //                   </p>
// // //                 </div>

// // //                 <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
// // //                   <span className="text-xl font-extrabold text-text">
// // //                     {product.price}
// // //                   </span>
// // //                   <button 
// // //                     onClick={() => alert(`Added ${product.name} to cart!`)}
// // //                     className="bg-secondary/10 hover:bg-secondary text-secondary hover:text-background px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95"
// // //                   >
// // //                     Quick Add
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           ))}
// // //         </div>

// // //         {/* Bottom Banner Note */}
// // //         <div className="mt-16 text-center text-text/60 text-sm">
// // //           All proceeds from the shop directly fund free coding education worldwide through our <Link href="/donate" className="text-secondary underline hover:opacity-80">Empower a Learner</Link> initiative.
// // //         </div>

// // //       </div>
// // //     </section>
// // //   );
// // // }