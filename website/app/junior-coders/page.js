"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Gamepad2,
  Sparkles,
  Star,
} from "lucide-react";

import ProgramShop from "../../components/ProgramShop";

export default function JuniorCodersPage() {
  return (
    <main className="min-h-screen bg-white text-[#101936]">

      {/* =========================
          JUNIOR CODERS HERO
      ========================== */}

      <section className="relative overflow-hidden border-b border-purple-100">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/40 to-purple-100/60" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 lg:px-8 lg:py-20">

          {/* LEFT */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
              <Sparkles size={14} />
              Junior Coders
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              Little minds.
              <br />

              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Big ideas.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
              Fun coding books, activities, games and creative learning
              resources made especially for our youngest creators.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#junior-products"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20"
              >
                Explore Resources
                <ArrowRight size={16} />
              </a>

              <Link
                href="/book-class"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm"
              >
                Book a Free Trial
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative hidden min-h-[300px] items-center justify-center md:flex">

            <div className="absolute h-[280px] w-[280px] rounded-full bg-purple-300/20 blur-3xl" />

            <div className="relative flex h-[270px] w-[270px] items-center justify-center rounded-full border border-purple-100 bg-white shadow-2xl">

              <div className="flex h-40 w-40 items-center justify-center rounded-[35px] bg-gradient-to-br from-primary to-purple-700 text-white shadow-xl">
                <Code2 size={75} />
              </div>

              <div className="absolute -left-6 top-10 rounded-2xl bg-white p-4 shadow-xl">
                <BookOpen
                  className="text-secondary"
                  size={28}
                />
              </div>

              <div className="absolute -right-5 bottom-12 rounded-2xl bg-white p-4 shadow-xl">
                <Gamepad2
                  className="text-primary"
                  size={28}
                />
              </div>

              <div className="absolute right-3 top-0 rounded-2xl bg-white p-3 shadow-xl">
                <Star
                  className="fill-yellow-400 text-yellow-400"
                  size={24}
                />
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* =========================
          JUNIOR CODERS PRODUCTS
      ========================== */}

      <div id="junior-products">
        <ProgramShop
          program="junior-coders"
          title="Junior Coders Collection"
          subtitle="Learning made fun."
          searchPlaceholder="Search Junior Coders..."
        />
      </div>


      {/* =========================
          CTA
      ========================== */}

      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-purple-600 to-secondary px-7 py-9 text-white md:flex md:items-center md:justify-between md:px-10">

            <div>
              <p className="text-sm font-bold text-white/70">
                MORE THAN RESOURCES
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Ready for your child to start coding?
              </h2>

              <p className="mt-2 max-w-xl text-sm text-white/80">
                Join Junior Coders for fun, personalized coding lessons
                designed for young learners.
              </p>
            </div>

            <Link
              href="/book-class"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary shadow-lg md:mt-0"
            >
              Book a Free Trial
              <ArrowRight size={16} />
            </Link>

          </div>
        </div>
      </section>

    </main>
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
//   Gamepad2,
//   Loader2,
//   PackageSearch,
//   Search,
//   ShoppingCart,
//   Sparkles,
//   Star,
// } from "lucide-react";

// import { supabase } from "../../lib/supabase";

// export default function JuniorCodersPage() {
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
//       .eq("program", "junior-coders")
//       .order("display_order", { ascending: true })
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Failed to load Junior Coders products:", error);
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

//   function money(value, currency = "KES") {
//     return new Intl.NumberFormat("en-KE", {
//       style: "currency",
//       currency,
//       maximumFractionDigits: 0,
//     }).format(Number(value || 0));
//   }

//   return (
//     <main className="min-h-screen bg-white text-[#101936]">

//       {/* HERO */}
//       <section className="relative overflow-hidden border-b border-purple-100">
//         <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/40 to-purple-100/60" />

//         <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 lg:px-8 lg:py-20">

//           {/* LEFT */}
//           <div className="max-w-xl">
//             <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
//               <Sparkles size={14} />
//               Junior Coders
//             </span>

//             <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
//               Little minds.
//               <br />
//               <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                 Big ideas.
//               </span>
//             </h1>

//             <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
//               Fun coding books, activities, games and creative learning
//               resources made especially for our youngest creators.
//             </p>

//             <div className="mt-7 flex flex-wrap gap-3">
//               <a
//                 href="#junior-products"
//                 className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20"
//               >
//                 Explore Resources
//                 <ArrowRight size={16} />
//               </a>

//               <Link
//                 href="/book-class"
//                 className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm"
//               >
//                 Book a Free Trial
//               </Link>
//             </div>
//           </div>

//           {/* RIGHT */}
//           <div className="relative hidden min-h-[300px] items-center justify-center md:flex">
//             <div className="absolute h-[280px] w-[280px] rounded-full bg-purple-300/20 blur-3xl" />

//             <div className="relative flex h-[270px] w-[270px] items-center justify-center rounded-full border border-purple-100 bg-white shadow-2xl">
//               <div className="flex h-40 w-40 items-center justify-center rounded-[35px] bg-gradient-to-br from-primary to-purple-700 text-white shadow-xl">
//                 <Code2 size={75} />
//               </div>

//               <div className="absolute -left-6 top-10 rounded-2xl bg-white p-4 shadow-xl">
//                 <BookOpen className="text-secondary" size={28} />
//               </div>

//               <div className="absolute -right-5 bottom-12 rounded-2xl bg-white p-4 shadow-xl">
//                 <Gamepad2 className="text-primary" size={28} />
//               </div>

//               <div className="absolute right-3 top-0 rounded-2xl bg-white p-3 shadow-xl">
//                 <Star
//                   className="fill-yellow-400 text-yellow-400"
//                   size={24}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* SHOP */}
//       <section
//         id="junior-products"
//         className="mx-auto max-w-7xl px-6 py-14 lg:px-8"
//       >
//         <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

//           <div>
//             <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
//               Junior Coders Collection
//             </p>

//             <h2 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
//               Learning made fun.
//             </h2>

//             <p className="mt-2 text-sm text-slate-500">
//               Resources selected specifically for Junior Coders.
//             </p>
//           </div>

//           {/* Search */}
//           <div className="relative w-full lg:w-72">
//             <Search
//               size={16}
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search Junior Coders..."
//               className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary"
//             />
//           </div>
//         </div>

//         {/* CATEGORY FILTERS */}
//         {categories.length > 1 && (
//           <div className="mb-9 flex flex-wrap gap-2">
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => setActiveCategory(category)}
//                 className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
//                   activeCategory === category
//                     ? "bg-primary text-white shadow-md"
//                     : "border border-slate-200 bg-white text-slate-600 hover:border-purple-300 hover:bg-purple-50"
//                 }`}
//               >
//                 {category}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* LOADING */}
//         {loading && (
//           <div className="flex min-h-[300px] items-center justify-center">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           </div>
//         )}

//         {/* EMPTY */}
//         {!loading && filteredProducts.length === 0 && (
//           <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
//             <PackageSearch className="h-10 w-10 text-slate-300" />

//             <h3 className="mt-4 text-lg font-bold text-slate-800">
//               Junior Coders products coming soon
//             </h3>

//             <p className="mt-2 text-sm text-slate-500">
//               We&apos;re preparing fun resources for our young creators.
//             </p>
//           </div>
//         )}

//         {/* PRODUCTS */}
//         {!loading && filteredProducts.length > 0 && (
//           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {filteredProducts.map((product) => (
//               <Link
//                 key={product.id}
//                 href={`/shop/${product.slug}`}
//                 className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
//               >
//                 {/* IMAGE */}
//                 <div className="relative aspect-[4/3] overflow-hidden bg-purple-50">
//                   {product.badge && (
//                     <span className="absolute left-3 top-3 z-10 rounded-full bg-secondary px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
//                       {product.badge}
//                     </span>
//                   )}

//                   {product.image_url ? (
//                     <Image
//                       src={product.image_url}
//                       alt={product.name}
//                       fill
//                       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
//                       className="object-cover transition-transform duration-500 group-hover:scale-105"
//                     />
//                   ) : (
//                     <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
//                       <BookOpen
//                         size={48}
//                         className="text-primary/40"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* CONTENT */}
//                 <div className="p-5">
//                   <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
//                     {product.category}
//                   </p>

//                   <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-primary">
//                     {product.name}
//                   </h3>

//                   {product.short_description && (
//                     <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
//                       {product.short_description}
//                     </p>
//                   )}

//                   <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
//                     <div>
//                       <span className="text-lg font-black text-primary">
//                         {money(
//                           product.price,
//                           product.currency || "KES"
//                         )}
//                       </span>

//                       {product.compare_at_price && (
//                         <span className="ml-2 text-xs text-slate-400 line-through">
//                           {money(
//                             product.compare_at_price,
//                             product.currency || "KES"
//                           )}
//                         </span>
//                       )}
//                     </div>

//                     <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-primary transition group-hover:bg-primary group-hover:text-white">
//                       <ArrowRight size={15} />
//                     </span>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* CTA */}
//       <section className="pb-16">
//         <div className="mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-purple-600 to-secondary px-7 py-9 text-white md:flex md:items-center md:justify-between md:px-10">

//             <div>
//               <p className="text-sm font-bold text-white/70">
//                 MORE THAN RESOURCES
//               </p>

//               <h2 className="mt-2 text-2xl font-black">
//                 Ready for your child to start coding?
//               </h2>

//               <p className="mt-2 max-w-xl text-sm text-white/80">
//                 Join Junior Coders for fun, personalized coding lessons
//                 designed for young learners.
//               </p>
//             </div>

//             <Link
//               href="/book-class"
//               className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary shadow-lg md:mt-0"
//             >
//               Book a Free Trial
//               <ArrowRight size={16} />
//             </Link>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
// // // "use client";

// // // import { useState } from "react";
// // // import { ShoppingCart, Sparkles, Download, BookOpen, Gamepad2, Laptop, Award, Star } from "lucide-react";
// // // import Image from "next/image";

// // // const shopProducts = [
// // //   {
// // //     id: "junior-coders-vol-1",
// // //     title: "My First Coding Activity Book – Volume 1",
// // //     target: "Junior Coders (Preschool & Early Elementary)",
// // //     price: "KSh 1,300",
// // //     originalPrice: "KSh 1,500",
// // //     format: "Digital PDF + Print Ready",
// // //     description: "A 32-page activity workbook featuring Byte the Robot, filled with tracing, logic puzzles, and foundational coding concepts.",
// // //     badge: "Special Offer",
// // //     category: "book",
// // //     image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
// // //     icon: BookOpen,
// // //   },
// // //   {
// // //     id: "junior-coders-vol-2",
// // //     title: "Algorithm Adventures – Volume 2",
// // //     target: "Junior Coders (Ages 7-10)",
// // //     price: "KSh 1,450",
// // //     originalPrice: "KSh 1,700",
// // //     format: "Digital PDF + Print Ready",
// // //     description: "Take the next step with loop mazes, conditional coloring challenges, and fun offline debugging exercises.",
// // //     badge: "Bestseller",
// // //     category: "book",
// // //     image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
// // //     icon: Sparkles,
// // //   },
// // //   {
// // //     id: "pixel-pal-sticker-pack",
// // //     title: "Byte the Robot Holographic Sticker Pack",
// // //     target: "All Ages",
// // //     price: "KSh 500",
// // //     originalPrice: "KSh 700",
// // //     format: "Physical Swag (Set of 5)",
// // //     description: "Decorate your laptop, tablet, or water bottle with weather-proof, shiny holographic stickers of our mascot Byte!",
// // //     badge: "New",
// // //     category: "swag",
// // //     image: "https://images.unsplash.com/photo-1572375833955-442491a148a0?auto=format&fit=crop&w=600&q=80",
// // //     icon: Star,
// // //   },
// // //   {
// // //     id: "python-quest-game",
// // //     title: "Python Quest: The Lost Function (Mini-Game)",
// // //     target: "Tweens & Teens (Ages 10-14)",
// // //     price: "KSh 900",
// // //     originalPrice: "KSh 1,200",
// // //     format: "Interactive Browser Game",
// // //     description: "An interactive, story-driven puzzle game that teaches basic Python syntax, loops, and variables through magical quests.",
// // //     badge: "Popular",
// // //     category: "game",
// // //     image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
// // //     icon: Gamepad2,
// // //   },
// // //   {
// // //     id: "web-dev-starter-kit",
// // //     title: "My First Website: HTML & CSS Playground Kit",
// // //     target: "Beginner Creators (Ages 9-13)",
// // //     price: "KSh 1,800",
// // //     originalPrice: "KSh 2,200",
// // //     format: "Template Bundle + Guide",
// // //     description: "Get pre-built, fun code templates to launch your very own personal portfolio or fan page in minutes!",
// // //     badge: "Bundle",
// // //     category: "kit",
// // //     image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
// // //     icon: Laptop,
// // //   },
// // //   {
// // //     id: "coding-certificate-bundle",
// // //     title: "Tech Hero Achievement Badge & Certificate Template",
// // //     target: "Parents & Educators",
// // //     price: "KSh 400",
// // //     originalPrice: "KSh 600",
// // //     format: "Customizable Canva Template",
// // //     description: "Reward young learners with official-looking, customisable printable certificates when they finish their coding milestones.",
// // //     badge: "Printable",
// // //     category: "swag",
// // //     image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=600&q=80",
// // //     icon: Award,
// // //   },
// // // ];

// // // export default function ShopPage() {
// // //   const [activeFilter, setActiveFilter] = useState("all");

// // //   const filteredProducts = activeFilter === "all" 
// // //     ? shopProducts 
// // //     : shopProducts.filter(p => p.category === activeFilter);

// // //   return (
// // //     <main className="min-h-screen bg-background text-text py-24 px-6">
// // //       <div className="max-w-7xl mx-auto">
        
// // //         {/* Header */}
// // //         <div className="text-center max-w-3xl mx-auto mb-12">
// // //           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-4 border border-secondary/20 shadow-sm">
// // //             <Sparkles size={14} /> Tech Talk Hub Shop
// // //           </div>
// // //           <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
// // //             Learning Resources & Fun Gear for <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Junior Coders</span>
// // //           </h1>
// // //           <p className="text-text/70 mt-4 text-base sm:text-lg">
// // //             Equip young learners with fun, hands-on activity books, interactive games, and creative tech gear designed to make computer science logic intuitive and exciting.
// // //           </p>
// // //         </div>

// // //         {/* Filter Tabs */}
// // //         <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
// // //           {[
// // //             { id: "all", label: "All Treasures" },
// // //             { id: "book", label: "Activity Books" },
// // //             { id: "game", label: "Mini-Games" },
// // //             { id: "kit", label: "Dev Kits" },
// // //             { id: "swag", label: "Swag & Printables" },
// // //           ].map((tab) => (
// // //             <button
// // //               key={tab.id}
// // //               onClick={() => setActiveFilter(tab.id)}
// // //               className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 border ${
// // //                 activeFilter === tab.id
// // //                   ? "bg-secondary text-background border-secondary shadow-md shadow-secondary/20 scale-105"
// // //                   : "bg-background border-gray-200 dark:border-gray-800 text-text/70 hover:border-secondary/40 hover:text-text"
// // //               }`}
// // //             >
// // //               {tab.label}
// // //             </button>
// // //           ))}
// // //         </div>

// // //         {/* Product Grid */}
// // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
// // //           {filteredProducts.map((product) => {
// // //             const IconComponent = product.icon;
// // //             return (
// // //               <div 
// // //                 key={product.id}
// // //                 className="group bg-background border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col justify-between"
// // //               >
// // //                 <div>
// // //                   <div className="flex items-center justify-between mb-4">
// // //                     <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
// // //                       {product.badge}
// // //                     </span>
// // //                     <span className="text-xs font-medium text-text/60 flex items-center gap-1">
// // //                       <Download size={14} /> {product.format}
// // //                     </span>
// // //                   </div>

// // //                   {/* Product Image Preview */}
// // //                   <div className="relative h-48 w-full bg-secondary/5 rounded-2xl mb-6 overflow-hidden border border-secondary/10">
// // //                     <Image
// // //                       src={product.image}
// // //                       alt={product.title}
// // //                       fill
// // //                       className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
// // //                     />
// // //                     <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
// // //                     <div className="absolute bottom-3 left-3 bg-background/80 dark:bg-background/90 backdrop-blur-md p-2 rounded-xl border border-secondary/20 shadow-sm text-secondary">
// // //                       <IconComponent size={18} />
// // //                     </div>
// // //                   </div>

// // //                   <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{product.target}</span>
// // //                   <h3 className="text-xl font-bold text-text mt-1 mb-2 group-hover:text-secondary transition-colors">
// // //                     {product.title}
// // //                   </h3>
// // //                   <p className="text-text/70 text-sm leading-relaxed mb-6">
// // //                     {product.description}
// // //                   </p>
// // //                 </div>

// // //                 <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
// // //                   <div className="flex items-baseline gap-2">
// // //                     <span className="text-2xl font-black text-text">{product.price}</span>
// // //                     <span className="text-sm font-semibold text-text/40 line-through">{product.originalPrice}</span>
// // //                   </div>
// // //                   <button
// // //                     onClick={() => alert(`Redirecting to checkout for ${product.title}`)}
// // //                     className="bg-secondary text-background hover:opacity-95 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-secondary/20 transition-all active:scale-95 flex items-center gap-2"
// // //                   >
// // //                     <ShoppingCart size={16} /> Buy Now
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //             );
// // //           })}
// // //         </div>

// // //       </div>
// // //     </main>
// // //   );
// // // }
// // "use client";

// // import { useState } from "react";
// // import { ShoppingCart, Sparkles, CheckCircle2, Download, BookOpen, Gamepad2, Laptop, Award, Star } from "lucide-react";
// // import Image from "next/image";

// // const shopProducts = [
// //   {
// //     id: "junior-coders-vol-1",
// //     title: "My First Coding Activity Book – Volume 1",
// //     target: "Junior Coders (Preschool & Early Elementary)",
// //     price: "KSh 1,300",
// //     originalPrice: "KSh 1,500",
// //     format: "Digital PDF + Print Ready",
// //     description: "A 32-page activity workbook featuring Byte the Robot, filled with tracing, logic puzzles, and foundational coding concepts.",
// //     badge: "Special Offer",
// //     category: "book",
// //     icon: BookOpen,
// //   },
// //   {
// //     id: "junior-coders-vol-2",
// //     title: "Algorithm Adventures – Volume 2",
// //     target: "Junior Coders (Ages 7-10)",
// //     price: "KSh 1,450",
// //     originalPrice: "KSh 1,700",
// //     format: "Digital PDF + Print Ready",
// //     description: "Take the next step with loop mazes, conditional coloring challenges, and fun offline debugging exercises.",
// //     badge: "Bestseller",
// //     category: "book",
// //     icon: Sparkles,
// //   },
// //   {
// //     id: "pixel-pal-sticker-pack",
// //     title: "Byte the Robot Holographic Sticker Pack",
// //     target: "All Ages",
// //     price: "KSh 500",
// //     originalPrice: "KSh 700",
// //     format: "Physical Swag (Set of 5)",
// //     description: "Decorate your laptop, tablet, or water bottle with weather-proof, shiny holographic stickers of our mascot Byte!",
// //     badge: "New",
// //     category: "swag",
// //     icon: Star,
// //   },
// //   {
// //     id: "python-quest-game",
// //     title: "Python Quest: The Lost Function (Mini-Game)",
// //     target: "Tweens & Teens (Ages 10-14)",
// //     price: "KSh 900",
// //     originalPrice: "KSh 1,200",
// //     format: "Interactive Browser Game",
// //     description: "An interactive, story-driven puzzle game that teaches basic Python syntax, loops, and variables through magical quests.",
// //     badge: "Popular",
// //     category: "game",
// //     icon: Gamepad2,
// //   },
// //   {
// //     id: "web-dev-starter-kit",
// //     title: "My First Website: HTML & CSS Playground Kit",
// //     target: "Beginner Creators (Ages 9-13)",
// //     price: "KSh 1,800",
// //     originalPrice: "KSh 2,200",
// //     format: "Template Bundle + Guide",
// //     description: "Get pre-built, fun code templates to launch your very own personal portfolio or fan page in minutes!",
// //     badge: "Bundle",
// //     category: "kit",
// //     icon: Laptop,
// //   },
// //   {
// //     id: "coding-certificate-bundle",
// //     title: "Tech Hero Achievement Badge & Certificate Template",
// //     target: "Parents & Educators",
// //     price: "KSh 400",
// //     originalPrice: "KSh 600",
// //     format: "Customizable Canva Template",
// //     description: "Reward young learners with official-looking, customisable printable certificates when they finish their coding milestones.",
// //     badge: "Printable",
// //     category: "swag",
// //     icon: Award,
// //   },
// // ];

// // export default function ShopPage() {
// //   const [activeFilter, setActiveFilter] = useState("all");

// //   const filteredProducts = activeFilter === "all" 
// //     ? shopProducts 
// //     : shopProducts.filter(p => p.category === activeFilter);

// //   return (
// //     <main className="min-h-screen bg-background text-text py-24 px-6">
// //       <div className="max-w-7xl mx-auto">
        
// //         {/* Header */}
// //         <div className="text-center max-w-3xl mx-auto mb-12">
// //           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-4 border border-secondary/20 shadow-sm">
// //             <Sparkles size={14} /> Tech Talk Hub Shop
// //           </div>
// //           <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
// //             Learning Resources & Fun Gear for <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Junior Coders</span>
// //           </h1>
// //           <p className="text-text/70 mt-4 text-base sm:text-lg">
// //             Equip young learners with fun, hands-on activity books, interactive games, and creative tech gear designed to make computer science logic intuitive and exciting.
// //           </p>
// //         </div>

// //         {/* Filter Tabs */}
// //         <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
// //           {[
// //             { id: "all", label: "All Treasures" },
// //             { id: "book", label: "Activity Books" },
// //             { id: "game", label: "Mini-Games" },
// //             { id: "kit", label: "Dev Kits" },
// //             { id: "swag", label: "Swag & Printables" },
// //           ].map((tab) => (
// //             <button
// //               key={tab.id}
// //               onClick={() => setActiveFilter(tab.id)}
// //               className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 border ${
// //                 activeFilter === tab.id
// //                   ? "bg-secondary text-background border-secondary shadow-md shadow-secondary/20 scale-105"
// //                   : "bg-background border-gray-200 dark:border-gray-800 text-text/70 hover:border-secondary/40 hover:text-text"
// //               }`}
// //             >
// //               {tab.label}
// //             </button>
// //           ))}
// //         </div>

// //         {/* Product Grid */}
// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
// //           {filteredProducts.map((product) => {
// //             const IconComponent = product.icon;
// //             return (
// //               <div 
// //                 key={product.id}
// //                 className="group bg-background border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col justify-between"
// //               >
// //                 <div>
// //                   <div className="flex items-center justify-between mb-4">
// //                     <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
// //                       {product.badge}
// //                     </span>
// //                     <span className="text-xs font-medium text-text/60 flex items-center gap-1">
// //                       <Download size={14} /> {product.format}
// //                     </span>
// //                   </div>

// //                   <div className="h-44 bg-secondary/5 rounded-2xl mb-6 flex items-center justify-center border border-secondary/10 group-hover:bg-secondary/10 transition-colors">
// //                     <IconComponent size={56} className="text-secondary/60 group-hover:scale-110 transition-transform duration-300" />
// //                   </div>

// //                   <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{product.target}</span>
// //                   <h3 className="text-xl font-bold text-text mt-1 mb-2 group-hover:text-secondary transition-colors">
// //                     {product.title}
// //                   </h3>
// //                   <p className="text-text/70 text-sm leading-relaxed mb-6">
// //                     {product.description}
// //                   </p>
// //                 </div>

// //                 <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
// //                   <div className="flex items-baseline gap-2">
// //                     <span className="text-2xl font-black text-text">{product.price}</span>
// //                     <span className="text-sm font-semibold text-text/40 line-through">{product.originalPrice}</span>
// //                   </div>
// //                   <button
// //                     onClick={() => alert(`Redirecting to checkout for ${product.title}`)}
// //                     className="bg-secondary text-background hover:opacity-95 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-secondary/20 transition-all active:scale-95 flex items-center gap-2"
// //                   >
// //                     <ShoppingCart size={16} /> Buy Now
// //                   </button>
// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>

// //       </div>
// //     </main>
// //   );
// // }
// // // // "use client";

// // // // import { useState } from "react";
// // // // import { ShoppingCart, Sparkles, CheckCircle2, Download, BookOpen } from "lucide-react";
// // // // import Image from "next/image";

// // // // const shopProducts = [
// // // //   {
// // // //     id: "junior-coders-vol-1",
// // // //     title: "My First Coding Activity Book – Volume 1",
// // // //     target: "Junior Coders (Preschool & Early Elementary)",
// // // //     price: "KSh 1,300",
// // // //     originalPrice: "KSh 1,500",
// // // //     format: "Digital PDF + Print Ready",
// // // //     description: "A 32-page activity workbook featuring Byte the Robot, filled with tracing, logic puzzles, and foundational coding concepts.",
// // // //     badge: "Special Offer",
// // // //   },
// // // //   // Add more products here
// // // // ];

// // // // export default function ShopPage() {
// // // //   return (
// // // //     <main className="min-h-screen bg-background text-text py-24 px-6">
// // // //       <div className="max-w-7xl mx-auto">
        
// // // //         {/* Header */}
// // // //         <div className="text-center max-w-3xl mx-auto mb-16">
// // // //           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-4 border border-secondary/20 shadow-sm">
// // // //             <Sparkles size={14} /> Tech Talk Hub Shop
// // // //           </div>
// // // //           <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
// // // //             Learning Resources for <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Junior Coders</span>
// // // //           </h1>
// // // //           <p className="text-text/70 mt-4 text-base sm:text-lg">
// // // //             Equip young learners with fun, hands-on activity books designed to make computer science logic intuitive and exciting.
// // // //           </p>
// // // //         </div>

// // // //         {/* Product Grid */}
// // // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
// // // //           {shopProducts.map((product) => (
// // // //             <div 
// // // //               key={product.id}
// // // //               className="group bg-background border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col justify-between"
// // // //             >
// // // //               <div>
// // // //                 <div className="flex items-center justify-between mb-4">
// // // //                   <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
// // // //                     {product.badge}
// // // //                   </span>
// // // //                   <span className="text-xs font-medium text-text/60 flex items-center gap-1">
// // // //                     <Download size={14} /> {product.format}
// // // //                   </span>
// // // //                 </div>

// // // //                 <div className="h-44 bg-secondary/5 rounded-2xl mb-6 flex items-center justify-center border border-secondary/10">
// // // //                   <BookOpen size={48} className="text-secondary/50" />
// // // //                 </div>

// // // //                 <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{product.target}</span>
// // // //                 <h3 className="text-xl font-bold text-text mt-1 mb-2 group-hover:text-secondary transition-colors">
// // // //                   {product.title}
// // // //                 </h3>
// // // //                 <p className="text-text/70 text-sm leading-relaxed mb-6">
// // // //                   {product.description}
// // // //                 </p>
// // // //               </div>

// // // //               <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
// // // //                 <div className="flex items-baseline gap-2">
// // // //                   <span className="text-2xl font-black text-text">{product.price}</span>
// // // //                   <span className="text-sm font-semibold text-text/40 line-through">{product.originalPrice}</span>
// // // //                 </div>
// // // //                 <button
// // // //                   onClick={() => alert(`Redirecting to checkout for ${product.title}`)}
// // // //                   className="bg-secondary text-background hover:opacity-95 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-secondary/20 transition-all active:scale-95 flex items-center gap-2"
// // // //                 >
// // // //                   <ShoppingCart size={16} /> Buy Now
// // // //                 </button>
// // // //               </div>
// // // //             </div>
// // // //           ))}
// // // //         </div>

// // // //       </div>
// // // //     </main>
// // // //   );
// // // // }
// // // // // "use client";

// // // // // import { useState } from "react";
// // // // // import { ShoppingCart, Sparkles, CheckCircle2, Download, BookOpen } from "lucide-react";
// // // // // import Image from "next/image";

// // // // // const shopProducts = [
// // // // //   {
// // // // //     id: "junior-coders-vol-1",
// // // // //     title: "My First Coding Activity Book – Volume 1",
// // // // //     target: "Junior Coders (Preschool & Early Elementary)",
// // // // //     price: "KSh 1500",
// // // // //     format: "Digital PDF + Print Ready",
// // // // //     description: "A 32-page activity workbook featuring Byte the Robot, filled with tracing, logic puzzles, and foundational coding concepts.",
// // // // //     badge: "Bestseller",
// // // // //   },
// // // // //   // Add more products here
// // // // // ];

// // // // // export default function ShopPage() {
// // // // //   return (
// // // // //     <main className="min-h-screen bg-background text-text py-24 px-6">
// // // // //       <div className="max-w-7xl mx-auto">
        
// // // // //         {/* Header */}
// // // // //         <div className="text-center max-w-3xl mx-auto mb-16">
// // // // //           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-4 border border-secondary/20 shadow-sm">
// // // // //             <Sparkles size={14} /> Tech Talk Hub Shop
// // // // //           </div>
// // // // //           <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
// // // // //             Learning Resources for <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Junior Coders</span>
// // // // //           </h1>
// // // // //           <p className="text-text/70 mt-4 text-base sm:text-lg">
// // // // //             Equip young learners with fun, hands-on activity books designed to make computer science logic intuitive and exciting.
// // // // //           </p>
// // // // //         </div>

// // // // //         {/* Product Grid */}
// // // // //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
// // // // //           {shopProducts.map((product) => (
// // // // //             <div 
// // // // //               key={product.id}
// // // // //               className="group bg-background border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col justify-between"
// // // // //             >
// // // // //               <div>
// // // // //                 <div className="flex items-center justify-between mb-4">
// // // // //                   <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
// // // // //                     {product.badge}
// // // // //                   </span>
// // // // //                   <span className="text-xs font-medium text-text/60 flex items-center gap-1">
// // // // //                     <Download size={14} /> {product.format}
// // // // //                   </span>
// // // // //                 </div>

// // // // //                 <div className="h-44 bg-secondary/5 rounded-2xl mb-6 flex items-center justify-center border border-secondary/10">
// // // // //                   <BookOpen size={48} className="text-secondary/50" />
// // // // //                 </div>

// // // // //                 <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{product.target}</span>
// // // // //                 <h3 className="text-xl font-bold text-text mt-1 mb-2 group-hover:text-secondary transition-colors">
// // // // //                   {product.title}
// // // // //                 </h3>
// // // // //                 <p className="text-text/70 text-sm leading-relaxed mb-6">
// // // // //                   {product.description}
// // // // //                 </p>
// // // // //               </div>

// // // // //               <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
// // // // //                 <span className="text-2xl font-black text-text">{product.price}</span>
// // // // //                 <button
// // // // //                   onClick={() => alert(`Redirecting to checkout for ${product.title}`)}
// // // // //                   className="bg-secondary text-background hover:opacity-95 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-secondary/20 transition-all active:scale-95 flex items-center gap-2"
// // // // //                 >
// // // // //                   <ShoppingCart size={16} /> Buy Now
// // // // //                 </button>
// // // // //               </div>
// // // // //             </div>
// // // // //           ))}
// // // // //         </div>

// // // // //       </div>
// // // // //     </main>
// // // // //   );
// // // // // }