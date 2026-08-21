import { supabase } from "../../lib/supabase";
import ShopClient from "./ShopClient";

export const metadata = {
  title: "Shop",

  description:
    "Shop coding books, activity books, learning kits and creative technology resources for kids and teens at Tech Talk Hub.",

  alternates: {
    canonical: "https://techtalk-hub.com/shop",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Shop Coding Books & Learning Resources | Tech Talk Hub",

    description:
      "Discover coding books, learning resources, activity books and creative tools for young creators.",

    url: "https://techtalk-hub.com/shop",

    siteName: "Tech Talk Hub",

    images: [
      {
        url: "https://techtalk-hub.com/shop/premium-shop-hero.png",

        width: 1200,

        height: 630,

        alt: "Tech Talk Hub coding books and learning resources",
      },
    ],

    type: "website",
  },
};

export const revalidate = 60;

export default async function ShopPage() {
  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .eq("is_active", true)
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to load shop products:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  return <ShopClient initialProducts={data || []} />;
}
// import { supabase } from "../../lib/supabase";

// import ShopClient from "./ShopClient";

// export const metadata = {
//   title: "Shop",

//   description:
//     "Shop coding books, activity books, learning kits and creative technology resources for kids and teens at Tech Talk Hub.",

//   alternates: {
//     canonical: "https://techtalk-hub.com/shop",
//   },

//   robots: {
//     index: true,
//     follow: true,
//   },

//   openGraph: {
//     title:
//       "Shop Coding Books & Learning Resources | Tech Talk Hub",

//     description:
//       "Discover coding books, learning resources, activity books and creative tools for young creators.",

//     url: "https://techtalk-hub.com/shop",

//     siteName: "Tech Talk Hub",

//     images: [
//       {
//         url: "https://techtalk-hub.com/shop/premium-shop-hero.png",

//         width: 1200,

//         height: 630,

//         alt: "Tech Talk Hub coding books and learning resources",
//       },
//     ],

//     type: "website",
//   },
// };

// export const revalidate = 60;

// export default async function ShopPage() {
//   const { data, error } = await supabase
//     .from("shop_products")
//     .select("*")
//     .eq("is_active", true)
//     .order("display_order", {
//       ascending: true,
//     })
//     .order("created_at", {
//       ascending: false,
//     });

//   if (error) {
//     console.error("Failed to load shop products:", {
//       message: error.message,
//       code: error.code,
//       details: error.details,
//       hint: error.hint,
//     });
//   }

//   return (
//     <ShopClient
//       initialProducts={data || []}
//     />
//   );
// }"use client";

// import {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import Link from "next/link";

// import {
//   ArrowRight,
//   BookOpen,
//   Check,
//   Code2,
//   CreditCard,
//   Download,
//   Headphones,
//   Heart,
//   LayoutGrid,
//   Loader2,
//   Minus,
//   PackageSearch,
//   Plus,
//   Search,
//   ShoppingCart,
//   Sparkles,
//   Wrench,
// } from "lucide-react";

// import { supabase } from "../../lib/supabase";
// import NavBar from "../../components/NavBar";
// import { useCart } from "../../components/CartProvider";

// // export default function ShopPage() {
// export default function ShopClient({
//   initialProducts = [],
// }) {
//   const {
//     addToCart,
//     incrementItem,
//     decrementItem,
//     getItemQuantity,
//   } = useCart();

// const [products, setProducts] =
//   useState(initialProducts);

//   const [loading, setLoading] =
//   useState(false);

//   const [search, setSearch] =
//     useState("");

//   const [
//     activeCategory,
//     setActiveCategory,
//   ] = useState("All");

//   const [favorites, setFavorites] =
//     useState([]);

//   // useEffect(() => {
//   //   fetchProducts();

//   //   try {
//   //     const saved = JSON.parse(
//   //       localStorage.getItem(
//   //         "shop_favorites"
//   //       ) || "[]"
//   //     );

//   //     setFavorites(
//   //       Array.isArray(saved)
//   //         ? saved
//   //         : []
//   //     );
//   //   } catch {
//   //     setFavorites([]);
//   //   }
//   // }, []);
//     useEffect(() => {
//   try {
//     const saved = JSON.parse(
//       localStorage.getItem("shop_favorites") || "[]"
//     );

//     setFavorites(
//       Array.isArray(saved) ? saved : []
//     );
//   } catch {
//     setFavorites([]);
//   }
// }, []);

//   async function fetchProducts() {
//     setLoading(true);

//     const { data, error } =
//       await supabase
//         .from("shop_products")
//         .select("*")
//         .eq("is_active", true)
//         .order("display_order", {
//           ascending: true,
//         })
//         .order("created_at", {
//           ascending: false,
//         });

//     if (error) {
//       console.error(
//         "Failed to load shop products:",
//         error
//       );

//       setProducts([]);
//     } else {
//       setProducts(data || []);
//     }

//     setLoading(false);
//   }

//   const categories = useMemo(
//     () => [
//       "All",
//       ...new Set(
//         products
//           .map(
//             (product) =>
//               product.category
//           )
//           .filter(Boolean)
//       ),
//     ],
//     [products]
//   );

//   const filteredProducts =
//     products.filter((product) => {
//       const categoryMatch =
//         activeCategory === "All" ||
//         product.category ===
//           activeCategory;

//       const query = search
//         .trim()
//         .toLowerCase();

//       const searchMatch =
//         !query ||
//         product.name
//           ?.toLowerCase()
//           .includes(query) ||
//         product.short_description
//           ?.toLowerCase()
//           .includes(query) ||
//         product.category
//           ?.toLowerCase()
//           .includes(query) ||
//         product.program
//           ?.toLowerCase()
//           .includes(query);

//       return (
//         categoryMatch &&
//         searchMatch
//       );
//     });

//   const featuredProducts =
//     filteredProducts.filter(
//       (product) =>
//         product.is_featured
//     );

//   const displayedProducts =
//     activeCategory === "All" &&
//     !search &&
//     featuredProducts.length > 0
//       ? featuredProducts
//       : filteredProducts;

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
//     ).format(
//       Number(value || 0)
//     );
//   }

//   function showAllProducts() {
//     setSearch("");
//     setActiveCategory("All");

//     setTimeout(() => {
//       document
//         .getElementById("products")
//         ?.scrollIntoView({
//           behavior: "smooth",
//         });
//     }, 50);
//   }

//   function toggleFavorite(
//     productId
//   ) {
//     setFavorites((current) => {
//       const updated =
//         current.includes(productId)
//           ? current.filter(
//               (id) =>
//                 id !== productId
//             )
//           : [
//               ...current,
//               productId,
//             ];

//       localStorage.setItem(
//         "shop_favorites",
//         JSON.stringify(updated)
//       );

//       return updated;
//     });
//   }

//   return (
//     <main className="min-h-screen bg-[#fafafe] text-[#101936]">
//       <NavBar />

//       {/* HERO */}

//       <section className="relative overflow-hidden border-b border-[#f0eef8] bg-white pt-[76px]">
//         <div
//           className="absolute inset-0"
//           style={{
//             background:
//               "linear-gradient(110deg,#ffffff 0%,#fcfaff 48%,#f4edff 100%)",
//           }}
//         />

//         <svg
//           viewBox="0 0 1440 420"
//           preserveAspectRatio="none"
//           className="pointer-events-none absolute inset-0 h-full w-full"
//         >
//           <path
//             d="M0 350 C220 240 350 290 560 260 C800 220 920 110 1120 135 C1270 150 1350 215 1440 235 L1440 420 L0 420Z"
//             fill="#9272ee"
//             opacity="0.035"
//           />

//           <path
//             d="M580 420 C760 270 880 235 1040 240 C1190 245 1310 165 1440 120 L1440 420Z"
//             fill="#b59cf8"
//             opacity="0.08"
//           />
//         </svg>

//         <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-10 sm:px-6 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-14">
//           <div className="max-w-[610px]">
//             <span className="inline-flex rounded-full bg-[#eee8ff] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#5b3ae2]">
//               Premium Shop
//             </span>

//             <h1 className="mt-4 text-[38px] font-black leading-[1.07] tracking-[-0.03em] text-[#101936] sm:text-[46px] lg:text-[50px] xl:text-[54px]">
//               Premium Learning
//               Products
//               <br className="hidden sm:block" />{" "}
//               for{" "}
//               <span className="bg-gradient-to-r from-[#9176f5] via-[#b75ee8] to-[#ff4c83] bg-clip-text text-transparent">
//                 Young Creators.
//               </span>
//             </h1>

//             <p className="mt-5 max-w-[540px] text-[14px] leading-7 text-[#586581] sm:text-[15px]">
//               Coding books, learning
//               resources, kits and
//               creative tools designed
//               for young creators.
//             </p>

//             <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12px] font-semibold text-[#34415e]">
//               <div className="flex items-center gap-2">
//                 <Check
//                   size={14}
//                   className="text-[#5634e4]"
//                 />
//                 Premium Quality
//               </div>

//               <div className="flex items-center gap-2">
//                 <Download
//                   size={14}
//                   className="text-[#5634e4]"
//                 />
//                 Fast Delivery
//               </div>

//               <div className="flex items-center gap-2">
//                 <CreditCard
//                   size={14}
//                   className="text-[#5634e4]"
//                 />
//                 Secure Payments
//               </div>
//             </div>

//             <div className="mt-7 flex flex-wrap gap-3">
//               <button
//                 type="button"
//                 onClick={
//                   showAllProducts
//                 }
//                 className="inline-flex h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-[#6033e7] to-[#5931e0] px-7 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(91,52,223,0.22)] transition hover:-translate-y-0.5"
//               >
//                 Shop Products
//                 <ArrowRight
//                   size={16}
//                 />
//               </button>

//               <Link
//                 href="/favorites"
//                 className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e4e4ee] bg-white px-7 text-[13px] font-bold text-[#313b58] shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
//               >
//                 <Heart size={16} />
//                 My Favorites
//               </Link>
//             </div>
//           </div>

//           <div className="relative flex items-center justify-center">
//             <div className="absolute h-[75%] w-[75%] rounded-full bg-purple-300/10 blur-[80px]" />

//             <img
//               src="/shop/premium-shop-hero.png"
//               alt="Tech Talk Hub premium shop"
//               width={620}
//               height={370}
//               className="relative h-auto w-full max-w-[620px] object-contain"
//             />
//           </div>
//         </div>
//       </section>

//       {/* BENEFITS */}

//       <section className="relative z-10 -mt-4">
//         <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
//           <div className="grid overflow-hidden rounded-2xl border border-[#ededf3] bg-white shadow-[0_8px_25px_rgba(23,32,70,0.06)] sm:grid-cols-2 lg:grid-cols-5">
//             <Benefit
//               icon={Sparkles}
//               title="Premium Quality"
//               subtitle="Carefully selected"
//             />

//             <Benefit
//               icon={Download}
//               title="Fast Delivery"
//               subtitle="Convenient fulfilment"
//             />

//             <Benefit
//               icon={Wrench}
//               title="Learning Focused"
//               subtitle="Made for young creators"
//             />

//             <Benefit
//               icon={CreditCard}
//               title="Secure Payments"
//               subtitle="Safe local checkout"
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

//       {/* SEARCH */}

//       <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-xl">
//           <div className="relative">
//             <Search
//               size={18}
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//             />

//             <input
//               type="text"
//               value={search}
//               onChange={(event) =>
//                 setSearch(
//                   event.target.value
//                 )
//               }
//               placeholder="Search books, kits, resources..."
//               className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100/60"
//             />
//           </div>
//         </div>
//       </section>

//       {/* CATEGORIES */}

//       <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-6 lg:px-8">
//         <div className="mb-5 flex items-center justify-between">
//           <h2 className="text-lg font-extrabold">
//             Shop by Category
//           </h2>

//           <button
//             type="button"
//             onClick={
//               showAllProducts
//             }
//             className="text-[12px] font-bold text-[#5c36df]"
//           >
//             View All
//           </button>
//         </div>

//         {categories.length > 1 && (
//           <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
//             {categories
//               .slice(1, 7)
//               .map(
//                 (
//                   category,
//                   index
//                 ) => {
//                   const Icon = [
//                     LayoutGrid,
//                     Code2,
//                     BookOpen,
//                     Wrench,
//                     Sparkles,
//                     ShoppingCart,
//                   ][index % 6];

//                   const count =
//                     products.filter(
//                       (product) =>
//                         product.category ===
//                         category
//                     ).length;

//                   return (
//                     <button
//                       type="button"
//                       key={
//                         category
//                       }
//                       onClick={() =>
//                         setActiveCategory(
//                           category
//                         )
//                       }
//                       className={`flex min-h-[76px] items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 ${
//                         activeCategory ===
//                         category
//                           ? "border-[#8061eb] ring-2 ring-purple-100"
//                           : "border-[#e7e8ef]"
//                       }`}
//                     >
//                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1ecff] text-[#6944e6]">
//                         <Icon
//                           size={
//                             18
//                           }
//                         />
//                       </div>

//                       <div className="min-w-0">
//                         <p className="truncate text-[12px] font-bold">
//                           {
//                             category
//                           }
//                         </p>

//                         <p className="mt-1 text-[10px] text-[#8690a7]">
//                           {count}{" "}
//                           {count ===
//                           1
//                             ? "Product"
//                             : "Products"}
//                         </p>
//                       </div>
//                     </button>
//                   );
//                 }
//               )}
//           </div>
//         )}
//       </section>

//       {/* PRODUCTS */}

//       <section
//         id="products"
//         className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16 pt-10 sm:px-6 lg:px-8"
//       >
//         <div className="mb-6 flex items-end justify-between">
//           <div>
//             <h2 className="text-xl font-black">
//               {activeCategory ===
//               "All"
//                 ? search
//                   ? "Search Results"
//                   : "Featured Products"
//                 : activeCategory}
//             </h2>

//             <p className="mt-1 text-xs text-slate-400">
//               {
//                 displayedProducts.length
//               }{" "}
//               products
//             </p>
//           </div>

//           <button
//             onClick={
//               showAllProducts
//             }
//             className="text-xs font-bold text-primary"
//           >
//             View All Products
//           </button>
//         </div>

//         {loading ? (
//           <div className="flex min-h-[320px] items-center justify-center">
//             <Loader2 className="h-7 w-7 animate-spin text-primary" />
//           </div>
//         ) : displayedProducts.length ===
//           0 ? (
//           <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white">
//             <PackageSearch
//               size={30}
//               className="text-purple-300"
//             />

//             <p className="mt-4 font-bold">
//               No products found
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
//             {displayedProducts.map(
//               (product) => (
//                 <ProductCard
//                   key={
//                     product.id
//                   }
//                   product={
//                     product
//                   }
//                   favorites={
//                     favorites
//                   }
//                   toggleFavorite={
//                     toggleFavorite
//                   }
//                   addToCart={
//                     addToCart
//                   }
//                   incrementItem={
//                     incrementItem
//                   }
//                   decrementItem={
//                     decrementItem
//                   }
//                   quantity={getItemQuantity(
//                     product.id
//                   )}
//                   money={
//                     money
//                   }
//                 />
//               )
//             )}
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }

// function ProductCard({
//   product,
//   favorites,
//   toggleFavorite,
//   addToCart,
//   incrementItem,
//   decrementItem,
//   quantity,
//   money,
// }) {
//   const inStock =
//     !product.track_inventory ||
//     Number(
//       product.stock_quantity || 0
//     ) > 0;

//   const favorite =
//     favorites.includes(product.id);

//   return (
//     <article className="group flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl">
//       <div className="flex w-full flex-col">
//         <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
//           {product.badge && (
//             <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#ff4b7c] px-2 py-1 text-[8px] font-black uppercase text-white">
//               {product.badge}
//             </span>
//           )}

//           <button
//             type="button"
//             onClick={() =>
//               toggleFavorite(
//                 product.id
//               )
//             }
//             className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow"
//           >
//             <Heart
//               size={16}
//               className={
//                 favorite
//                   ? "fill-[#ff4b7c] text-[#ff4b7c]"
//                   : ""
//               }
//             />
//           </button>

//           <Link
//             href={`/shop/${product.slug}`}
//             className="block h-full"
//           >
//             {product.image_url ? (
//               <img
//                 src={
//                   product.image_url
//                 }
//                 alt={product.name}
//                 className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
//               />
//             ) : (
//               <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
//                 <Code2 className="text-purple-300" />
//               </div>
//             )}
//           </Link>
//         </div>

//         <div className="flex flex-1 flex-col p-3.5 sm:p-4">
//           {product.category && (
//             <p className="text-[8px] font-black uppercase tracking-wider text-purple-500">
//               {product.category}
//             </p>
//           )}

//           <Link
//             href={`/shop/${product.slug}`}
//           >
//             <h3 className="mt-1.5 line-clamp-2 min-h-[38px] text-[12px] font-bold leading-[1.5] text-[#1e2844] transition hover:text-primary sm:text-[13px]">
//               {product.name}
//             </h3>
//           </Link>

//           <div className="mt-3 flex flex-wrap items-baseline gap-2">
//             <span className="text-[14px] font-black text-primary sm:text-[15px]">
//               {money(
//                 product.price,
//                 product.currency ||
//                   "KES"
//               )}
//             </span>

//             {product.compare_at_price && (
//               <span className="text-[9px] font-semibold text-slate-400 line-through">
//                 {money(
//                   product.compare_at_price,
//                   product.currency ||
//                     "KES"
//                 )}
//               </span>
//             )}
//           </div>

//           {!inStock && (
//             <p className="mt-2 text-[9px] font-bold text-red-500">
//               Out of Stock
//             </p>
//           )}

//           <div className="mt-auto pt-4">
//             {quantity > 0 ? (
//               <div className="flex h-10 items-center justify-between overflow-hidden rounded-xl border border-purple-200 bg-purple-50">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     decrementItem(
//                       product.id
//                     )
//                   }
//                   className="flex h-full w-10 items-center justify-center text-primary transition hover:bg-purple-100"
//                 >
//                   <Minus
//                     size={14}
//                   />
//                 </button>

//                 <div className="text-center">
//                   <span className="block text-xs font-black text-primary">
//                     {quantity}
//                   </span>

//                   <span className="hidden text-[8px] font-bold uppercase text-purple-400 sm:block">
//                     In Cart
//                   </span>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     incrementItem(
//                       product.id
//                     )
//                   }
//                   disabled={
//                     product.track_inventory &&
//                     quantity >=
//                       Number(
//                         product.stock_quantity ||
//                           0
//                       )
//                   }
//                   className="flex h-full w-10 items-center justify-center text-primary transition hover:bg-purple-100 disabled:opacity-30"
//                 >
//                   <Plus
//                     size={14}
//                   />
//                 </button>
//               </div>
//             ) : (
//               <button
//                 type="button"
//                 disabled={!inStock}
//                 onClick={() =>
//                   addToCart(
//                     product,
//                     1
//                   )
//                 }
//                 className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[10px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4e2ec8] disabled:bg-slate-200 disabled:text-slate-400"
//               >
//                 <ShoppingCart
//                   size={14}
//                 />
//                 {inStock
//                   ? "Add to Cart"
//                   : "Unavailable"}
//               </button>
//             )}

//             <Link
//               href={`/shop/${product.slug}`}
//               className="mt-2.5 block text-center text-[10px] font-bold text-slate-500 transition hover:text-primary"
//             >
//               View Details →
//             </Link>
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// }

// function Benefit({
//   icon: Icon,
//   title,
//   subtitle,
//   last,
// }) {
//   return (
//     <div
//       className={`flex min-h-[88px] items-center gap-3 px-5 py-4 ${
//         !last
//           ? "border-b border-[#eeeeF4] sm:border-r lg:border-b-0"
//           : ""
//       }`}
//     >
//       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f0ff] text-[#6442e4]">
//         <Icon size={18} />
//       </div>

//       <div>
//         <div className="text-[11px] font-extrabold">
//           {title}
//         </div>

//         <div className="mt-1 text-[10px] text-[#758099]">
//           {subtitle}
//         </div>
//       </div>
//     </div>
//   );
// }
// // "use client";

// // import { useEffect, useMemo, useState } from "react";
// // import Link from "next/link";
// // import {
// //   ArrowRight,
// //   BookOpen,
// //   Code2,
// //   CreditCard,
// //   Download,
// //   Headphones,
// //   Heart,
// //   LayoutGrid,
// //   Loader2,
// //   Minus,
// //   PackageSearch,
// //   Plus,
// //   Search,
// //   ShoppingCart,
// //   Sparkles,
// //   Wrench,
// // } from "lucide-react";

// // import { supabase } from "../../lib/supabase";
// // import NavBar from "../../components/NavBar";
// // import { useCart } from "../../components/CartProvider";

// // export default function ShopPage() {
// //   const { addToCart } = useCart();

// //   const [products, setProducts] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [search, setSearch] = useState("");
// //   const [activeCategory, setActiveCategory] = useState("All");

// //   const [favorites, setFavorites] = useState([]);
// //   const [quantities, setQuantities] = useState({});
// //   const [addedProductId, setAddedProductId] = useState(null);

// //   useEffect(() => {
// //     fetchProducts();

// //     try {
// //       const savedFavorites = JSON.parse(
// //         localStorage.getItem("shop_favorites") || "[]"
// //       );

// //       setFavorites(
// //         Array.isArray(savedFavorites)
// //           ? savedFavorites
// //           : []
// //       );
// //     } catch {
// //       setFavorites([]);
// //     }
// //   }, []);

// //   async function fetchProducts() {
// //     setLoading(true);

// //     const { data, error } = await supabase
// //       .from("shop_products")
// //       .select("*")
// //       .eq("is_active", true)
// //       .order("display_order", {
// //         ascending: true,
// //       })
// //       .order("created_at", {
// //         ascending: false,
// //       });

// //     if (error) {
// //       console.error(
// //         "Failed to load shop products:",
// //         error
// //       );

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

// //   const filteredProducts = products.filter(
// //     (product) => {
// //       const categoryMatch =
// //         activeCategory === "All" ||
// //         product.category === activeCategory;

// //       const query =
// //         search.trim().toLowerCase();

// //       const searchMatch =
// //         !query ||
// //         product.name
// //           ?.toLowerCase()
// //           .includes(query) ||
// //         product.short_description
// //           ?.toLowerCase()
// //           .includes(query) ||
// //         product.category
// //           ?.toLowerCase()
// //           .includes(query) ||
// //         product.program
// //           ?.toLowerCase()
// //           .includes(query);

// //       return categoryMatch && searchMatch;
// //     }
// //   );

// //   const featuredProducts =
// //     filteredProducts.filter(
// //       (product) => product.is_featured
// //     );

// //   const displayedProducts =
// //     featuredProducts.length > 0 &&
// //     activeCategory === "All" &&
// //     !search
// //       ? featuredProducts.slice(0, 5)
// //       : filteredProducts;

// //   function money(
// //     value,
// //     currency = "KES"
// //   ) {
// //     return new Intl.NumberFormat("en-KE", {
// //       style: "currency",
// //       currency,
// //       maximumFractionDigits: 0,
// //     }).format(Number(value || 0));
// //   }

// //   function showAllProducts() {
// //     setActiveCategory("All");

// //     setTimeout(() => {
// //       document
// //         .getElementById("products")
// //         ?.scrollIntoView({
// //           behavior: "smooth",
// //         });
// //     }, 50);
// //   }

// //   function getQuantity(productId) {
// //     return quantities[productId] || 1;
// //   }

// //   function decreaseQuantity(productId) {
// //     setQuantities((current) => ({
// //       ...current,

// //       [productId]: Math.max(
// //         1,
// //         (current[productId] || 1) - 1
// //       ),
// //     }));
// //   }

// //   function increaseQuantity(product) {
// //     const currentQuantity =
// //       quantities[product.id] || 1;

// //     if (
// //       product.track_inventory &&
// //       currentQuantity >=
// //         Number(product.stock_quantity || 0)
// //     ) {
// //       return;
// //     }

// //     setQuantities((current) => ({
// //       ...current,
// //       [product.id]:
// //         currentQuantity + 1,
// //     }));
// //   }

// //   function handleAddToCart(product) {
// //     const inStock =
// //       !product.track_inventory ||
// //       Number(product.stock_quantity || 0) >
// //         0;

// //     if (!inStock) return;

// //     const quantity =
// //       getQuantity(product.id);

// //     addToCart(product, quantity);

// //     setAddedProductId(product.id);

// //     setTimeout(() => {
// //       setAddedProductId(null);
// //     }, 1400);
// //   }

// //   function toggleFavorite(productId) {
// //     setFavorites((current) => {
// //       const updated = current.includes(
// //         productId
// //       )
// //         ? current.filter(
// //             (id) => id !== productId
// //           )
// //         : [...current, productId];

// //       localStorage.setItem(
// //         "shop_favorites",
// //         JSON.stringify(updated)
// //       );

// //       return updated;
// //     });
// //   }

// //   return (
// //     <main className="min-h-screen bg-white text-[#101936]">
// //       <NavBar />

// //       {/* =====================================================
// //           HERO
// //       ====================================================== */}

// //       <section className="relative overflow-hidden border-b border-[#f0eef8] pt-[76px]">
// //         <div
// //           className="absolute inset-0"
// //           style={{
// //             background:
// //               "linear-gradient(110deg,#ffffff 0%,#fcfaff 48%,#f4edff 100%)",
// //           }}
// //         />

// //         <svg
// //           viewBox="0 0 1440 420"
// //           preserveAspectRatio="none"
// //           className="pointer-events-none absolute inset-0 h-full w-full"
// //         >
// //           <path
// //             d="M0 350 C220 240 350 290 560 260 C800 220 920 110 1120 135 C1270 150 1350 215 1440 235 L1440 420 L0 420Z"
// //             fill="#9272ee"
// //             opacity="0.035"
// //           />

// //           <path
// //             d="M580 420 C760 270 880 235 1040 240 C1190 245 1310 165 1440 120 L1440 420Z"
// //             fill="#b59cf8"
// //             opacity="0.08"
// //           />
// //         </svg>

// //         <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-10 sm:px-6 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-14">
// //           <div className="max-w-[610px]">
// //             <span className="inline-flex rounded-full bg-[#eee8ff] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#5b3ae2]">
// //               Premium Shop
// //             </span>

// //             <h1 className="mt-4 text-[38px] font-black leading-[1.07] tracking-[-0.03em] text-[#101936] sm:text-[46px] lg:text-[50px] xl:text-[54px]">
// //               Premium Learning Products
// //               <br className="hidden sm:block" />{" "}
// //               for{" "}
// //               <span className="bg-gradient-to-r from-[#9176f5] via-[#b75ee8] to-[#ff4c83] bg-clip-text text-transparent">
// //                 Young Creators.
// //               </span>
// //             </h1>

// //             <p className="mt-5 max-w-[540px] text-[14px] leading-7 text-[#586581] sm:text-[15px]">
// //               Handpicked coding books,
// //               educational resources, kits,
// //               tools and creative products
// //               designed to make every learning
// //               journey practical, fun and
// //               inspiring.
// //             </p>

// //             <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12px] font-semibold text-[#34415e]">
// //               <div className="flex items-center gap-2">
// //                 <span className="text-[#5634e4]">
// //                   ✓
// //                 </span>
// //                 Premium Quality
// //               </div>

// //               <div className="flex items-center gap-2">
// //                 <Download
// //                   size={14}
// //                   className="text-[#5634e4]"
// //                 />
// //                 Fast Delivery
// //               </div>

// //               <div className="flex items-center gap-2">
// //                 <CreditCard
// //                   size={14}
// //                   className="text-[#5634e4]"
// //                 />
// //                 Secure Payments
// //               </div>
// //             </div>

// //             <div className="mt-7 flex flex-wrap gap-3">
// //               <button
// //                 type="button"
// //                 onClick={showAllProducts}
// //                 className="inline-flex h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-[#6033e7] to-[#5931e0] px-7 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(91,52,223,0.22)] transition hover:-translate-y-0.5 hover:shadow-xl"
// //               >
// //                 Explore All Products
// //                 <ArrowRight size={16} />
// //               </button>

// //               <button
// //                 type="button"
// //                 onClick={() => {
// //                   setActiveCategory("All");

// //                   setTimeout(() => {
// //                     document
// //                       .getElementById(
// //                         "products"
// //                       )
// //                       ?.scrollIntoView({
// //                         behavior: "smooth",
// //                       });
// //                   }, 50);
// //                 }}
// //                 className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e4e4ee] bg-white px-7 text-[13px] font-bold text-[#313b58] shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
// //               >
// //                 <Sparkles
// //                   size={16}
// //                   className="text-[#623bdc]"
// //                 />
// //                 Featured
// //               </button>
// //             </div>
// //           </div>

// //           <div className="relative flex items-center justify-center">
// //             <div className="absolute h-[75%] w-[75%] rounded-full bg-purple-300/10 blur-[80px]" />

// //             <img
// //               src="/shop/premium-shop-hero.png"
// //               alt="Tech Talk Hub premium shop"
// //               width={620}
// //               height={370}
// //               className="relative h-auto w-full max-w-[620px] object-contain"
// //             />
// //           </div>
// //         </div>
// //       </section>

// //       {/* =====================================================
// //           BENEFITS
// //       ====================================================== */}

// //       <section className="relative z-10 -mt-4">
// //         <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
// //           <div className="grid overflow-hidden rounded-2xl border border-[#ededf3] bg-white shadow-[0_8px_25px_rgba(23,32,70,0.06)] sm:grid-cols-2 lg:grid-cols-5">
// //             <Benefit
// //               icon={Sparkles}
// //               title="Premium Quality"
// //               subtitle="Carefully crafted products"
// //             />

// //             <Benefit
// //               icon={Download}
// //               title="Fast Delivery"
// //               subtitle="Quick access after purchase"
// //             />

// //             <Benefit
// //               icon={Wrench}
// //               title="Useful Resources"
// //               subtitle="Designed for real learning"
// //             />

// //             <Benefit
// //               icon={CreditCard}
// //               title="Secure Payments"
// //               subtitle="Safe local payments"
// //             />

// //             <Benefit
// //               icon={Headphones}
// //               title="Support"
// //               subtitle="We're here to help"
// //               last
// //             />
// //           </div>
// //         </div>
// //       </section>

// //       {/* =====================================================
// //           SEARCH
// //       ====================================================== */}

// //       <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
// //         <div className="mx-auto max-w-xl">
// //           <div className="relative">
// //             <Search
// //               size={18}
// //               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
// //             />

// //             <input
// //               type="text"
// //               value={search}
// //               onChange={(event) =>
// //                 setSearch(event.target.value)
// //               }
// //               placeholder="Search books, kits, resources..."
// //               className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:ring-4 focus:ring-purple-100/60"
// //             />
// //           </div>
// //         </div>
// //       </section>

// //       {/* =====================================================
// //           CATEGORIES
// //       ====================================================== */}

// //       <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-6 lg:px-8">
// //         <div className="mb-5 flex items-center justify-between">
// //           <h2 className="text-lg font-extrabold text-[#151d38]">
// //             Shop by Category
// //           </h2>

// //           <button
// //             type="button"
// //             onClick={() =>
// //               setActiveCategory("All")
// //             }
// //             className="text-[12px] font-bold text-[#5c36df] transition hover:text-purple-800"
// //           >
// //             View All Categories
// //           </button>
// //         </div>

// //         {categories.length > 1 ? (
// //           <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
// //             {categories
// //               .slice(1, 7)
// //               .map(
// //                 (
// //                   category,
// //                   index
// //                 ) => {
// //                   const Icon = [
// //                     LayoutGrid,
// //                     Code2,
// //                     BookOpen,
// //                     Wrench,
// //                     Sparkles,
// //                     ShoppingCart,
// //                   ][index % 6];

// //                   const count =
// //                     products.filter(
// //                       (product) =>
// //                         product.category ===
// //                         category
// //                     ).length;

// //                   return (
// //                     <button
// //                       type="button"
// //                       key={category}
// //                       onClick={() =>
// //                         setActiveCategory(
// //                           category
// //                         )
// //                       }
// //                       className={`flex min-h-[76px] items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-[0_2px_8px_rgba(20,28,56,0.035)] transition hover:-translate-y-0.5 hover:shadow-md ${
// //                         activeCategory ===
// //                         category
// //                           ? "border-[#8061eb] ring-2 ring-purple-100"
// //                           : "border-[#e7e8ef]"
// //                       }`}
// //                     >
// //                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1ecff] text-[#6944e6]">
// //                         <Icon
// //                           size={18}
// //                         />
// //                       </div>

// //                       <div className="min-w-0">
// //                         <p className="truncate text-[12px] font-bold text-[#27314d]">
// //                           {category}
// //                         </p>

// //                         <p className="mt-1 text-[10px] text-[#8690a7]">
// //                           {count}{" "}
// //                           {count === 1
// //                             ? "Product"
// //                             : "Products"}
// //                         </p>
// //                       </div>
// //                     </button>
// //                   );
// //                 }
// //               )}
// //           </div>
// //         ) : (
// //           <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
// //             Categories will appear when
// //             products are added.
// //           </div>
// //         )}
// //       </section>

// //       {/* =====================================================
// //           PRODUCTS
// //       ====================================================== */}

// //       <section
// //         id="products"
// //         className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-4 pt-10 sm:px-6 lg:px-8"
// //       >
// //         <div className="mb-5 flex items-center justify-between">
// //           <div>
// //             <h2 className="text-lg font-extrabold text-[#151d38]">
// //               {activeCategory === "All"
// //                 ? search
// //                   ? "Search Results"
// //                   : "Featured Products"
// //                 : activeCategory}
// //             </h2>

// //             {search && (
// //               <p className="mt-1 text-xs text-slate-400">
// //                 Results for &quot;
// //                 {search}&quot;
// //               </p>
// //             )}
// //           </div>

// //           <button
// //             type="button"
// //             onClick={showAllProducts}
// //             className="text-[12px] font-bold text-[#5c36df] transition hover:text-purple-800"
// //           >
// //             View All Products
// //           </button>
// //         </div>

// //         {loading ? (
// //           <div className="flex min-h-[320px] items-center justify-center">
// //             <Loader2 className="h-7 w-7 animate-spin text-[#5834df]" />
// //           </div>
// //         ) : displayedProducts.length ===
// //           0 ? (
// //           <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-center">
// //             <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
// //               <PackageSearch
// //                 size={26}
// //                 className="text-purple-300"
// //               />
// //             </div>

// //             <p className="mt-4 font-bold text-slate-700">
// //               No products found
// //             </p>

// //             <p className="mt-1 text-sm text-slate-400">
// //               Try another category or
// //               search.
// //             </p>
// //           </div>
// //         ) : (
// //           <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
// //             {displayedProducts.map(
// //               (product) => {
// //                 const inStock =
// //                   !product.track_inventory ||
// //                   Number(
// //                     product.stock_quantity ||
// //                       0
// //                   ) > 0;

// //                 const isFavorite =
// //                   favorites.includes(
// //                     product.id
// //                   );

// //                 const wasAdded =
// //                   addedProductId ===
// //                   product.id;

// //                 const quantity =
// //                   getQuantity(
// //                     product.id
// //                   );

// //                 return (
// //                   <article
// //                     key={product.id}
// //                     className="group flex flex-col overflow-hidden rounded-2xl border border-[#e3e5ec] bg-white shadow-[0_3px_12px_rgba(19,29,58,0.05)] transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
// //                   >
// //                     {/* IMAGE */}

// //                     <div className="relative aspect-[4/3] overflow-hidden bg-[#101425]">
// //                       {product.badge && (
// //                         <span className="absolute left-3 top-3 z-10 rounded-full bg-[#ff4b7c] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wide text-white shadow">
// //                           {
// //                             product.badge
// //                           }
// //                         </span>
// //                       )}

// //                       <button
// //                         type="button"
// //                         onClick={() =>
// //                           toggleFavorite(
// //                             product.id
// //                           )
// //                         }
// //                         aria-label={
// //                           isFavorite
// //                             ? "Remove from favorites"
// //                             : "Add to favorites"
// //                         }
// //                         className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-md transition hover:scale-105 hover:text-[#ff4b7c]"
// //                       >
// //                         <Heart
// //                           size={17}
// //                           className={
// //                             isFavorite
// //                               ? "fill-[#ff4b7c] text-[#ff4b7c]"
// //                               : ""
// //                           }
// //                         />
// //                       </button>

// //                       <Link
// //                         href={`/shop/${product.slug}`}
// //                         className="block h-full w-full"
// //                       >
// //                         {product.image_url ? (
// //                           <img
// //                             src={
// //                               product.image_url
// //                             }
// //                             alt={
// //                               product.name
// //                             }
// //                             className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
// //                           />
// //                         ) : (
// //                           <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#151a37] via-[#25205d] to-[#16162d]">
// //                             <Code2
// //                               size={42}
// //                               className="text-purple-300"
// //                             />
// //                           </div>
// //                         )}
// //                       </Link>
// //                     </div>

// //                     {/* BODY */}

// //                     <div className="flex flex-1 flex-col p-4">
// //                       {product.category && (
// //                         <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-purple-500">
// //                           {
// //                             product.category
// //                           }
// //                         </p>
// //                       )}

// //                       <Link
// //                         href={`/shop/${product.slug}`}
// //                       >
// //                         <h3 className="line-clamp-2 min-h-[42px] text-[13px] font-bold leading-[1.5] text-[#1e2844] transition hover:text-[#5837de]">
// //                           {product.name}
// //                         </h3>
// //                       </Link>

// //                       {product.short_description && (
// //                         <p className="mt-1.5 line-clamp-2 min-h-[32px] text-[10px] leading-4 text-slate-400">
// //                           {
// //                             product.short_description
// //                           }
// //                         </p>
// //                       )}

// //                       <div className="mt-3 flex flex-wrap items-baseline gap-2">
// //                         <span className="text-[15px] font-black text-[#5837de]">
// //                           {money(
// //                             product.price,
// //                             product.currency ||
// //                               "KES"
// //                           )}
// //                         </span>

// //                         {product.compare_at_price && (
// //                           <span className="text-[10px] font-semibold text-[#9fa5b5] line-through">
// //                             {money(
// //                               product.compare_at_price,
// //                               product.currency ||
// //                                 "KES"
// //                             )}
// //                           </span>
// //                         )}
// //                       </div>

// //                       {/* STOCK */}

// //                       <div className="mt-2 flex items-center justify-between">
// //                         {inStock ? (
// //                           <span className="text-[9px] font-bold text-emerald-600">
// //                             In Stock
// //                           </span>
// //                         ) : (
// //                           <span className="text-[9px] font-bold text-red-500">
// //                             Out of Stock
// //                           </span>
// //                         )}

// //                         {product.track_inventory &&
// //                           inStock && (
// //                             <span className="text-[9px] text-slate-400">
// //                               {
// //                                 product.stock_quantity
// //                               }{" "}
// //                               available
// //                             </span>
// //                           )}
// //                       </div>

// //                       <div className="mt-auto pt-4">
// //                         {/* QUANTITY */}

// //                         {inStock && (
// //                           <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-1">
// //                             <button
// //                               type="button"
// //                               onClick={() =>
// //                                 decreaseQuantity(
// //                                   product.id
// //                                 )
// //                               }
// //                               disabled={
// //                                 quantity <= 1
// //                               }
// //                               className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:bg-purple-50 hover:text-[#5837de] disabled:cursor-not-allowed disabled:opacity-30"
// //                             >
// //                               <Minus
// //                                 size={13}
// //                               />
// //                             </button>

// //                             <div className="text-center">
// //                               <span className="block text-[13px] font-black text-[#202944]">
// //                                 {quantity}
// //                               </span>

// //                               <span className="block text-[8px] font-semibold uppercase tracking-wide text-slate-400">
// //                                 Qty
// //                               </span>
// //                             </div>

// //                             <button
// //                               type="button"
// //                               onClick={() =>
// //                                 increaseQuantity(
// //                                   product
// //                                 )
// //                               }
// //                               disabled={
// //                                 product.track_inventory &&
// //                                 quantity >=
// //                                   Number(
// //                                     product.stock_quantity ||
// //                                       0
// //                                   )
// //                               }
// //                               className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition hover:bg-purple-50 hover:text-[#5837de] disabled:cursor-not-allowed disabled:opacity-30"
// //                             >
// //                               <Plus
// //                                 size={13}
// //                               />
// //                             </button>
// //                           </div>
// //                         )}

// //                         {/* ADD CART */}

// //                         <button
// //                           type="button"
// //                           disabled={!inStock}
// //                           onClick={() =>
// //                             handleAddToCart(
// //                               product
// //                             )
// //                           }
// //                           className={`mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[11px] font-bold transition ${
// //                             wasAdded
// //                               ? "bg-emerald-600 text-white"
// //                               : "bg-[#5d38df] text-white hover:bg-[#4e2ec8]"
// //                           } disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400`}
// //                         >
// //                           {wasAdded ? (
// //                             <>
// //                               <span>
// //                                 ✓
// //                               </span>
// //                               {quantity}{" "}
// //                               Added
// //                             </>
// //                           ) : (
// //                             <>
// //                               <ShoppingCart
// //                                 size={
// //                                   14
// //                                 }
// //                               />

// //                               {inStock
// //                                 ? `Add ${quantity} to Cart`
// //                                 : "Out of Stock"}
// //                             </>
// //                           )}
// //                         </button>

// //                         {/* VIEW DETAILS */}

// //                         <Link
// //                           href={`/shop/${product.slug}`}
// //                           className="mt-2 flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-[#5837de]"
// //                         >
// //                           View Details
// //                         </Link>
// //                       </div>
// //                     </div>
// //                   </article>
// //                 );
// //               }
// //             )}
// //           </div>
// //         )}
// //       </section>

// //       {/* =====================================================
// //           BOTTOM
// //       ====================================================== */}

// //       <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-6 lg:px-8">
// //         <div className="grid overflow-hidden rounded-2xl bg-gradient-to-r from-[#8066e5] via-[#876ae8] to-[#967ee3] text-white shadow-lg md:grid-cols-[2fr_repeat(4,1fr)]">
// //           <div className="flex min-h-[100px] items-center gap-4 px-7 py-6 lg:px-10">
// //             <span className="text-[44px] font-black leading-none text-white/60">
// //               “
// //             </span>

// //             <p className="max-w-[350px] text-[12px] font-semibold leading-5">
// //               Every purchase supports
// //               creative learning and
// //               technology education for
// //               young people.
// //             </p>
// //           </div>

// //           <BottomStat
// //             title={`${products.length}+`}
// //             subtitle="Shop Products"
// //           />

// //           <BottomStat
// //             title="KES"
// //             subtitle="Local Pricing"
// //           />

// //           <BottomStat
// //             title="Secure"
// //             subtitle="Payments"
// //           />

// //           <BottomStat
// //             title="100%"
// //             subtitle="Learning Focus"
// //           />
// //         </div>
// //       </section>
// //     </main>
// //   );
// // }

// // function Benefit({
// //   icon: Icon,
// //   title,
// //   subtitle,
// //   last,
// // }) {
// //   return (
// //     <div
// //       className={`flex min-h-[88px] items-center gap-3 px-5 py-4 ${
// //         !last
// //           ? "border-b border-[#eeeeF4] sm:border-r lg:border-b-0"
// //           : ""
// //       }`}
// //     >
// //       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f0ff] text-[#6442e4]">
// //         <Icon size={18} />
// //       </div>

// //       <div className="min-w-0">
// //         <div className="text-[11px] font-extrabold text-[#202944]">
// //           {title}
// //         </div>

// //         <div className="mt-1 text-[10px] leading-[1.45] text-[#758099]">
// //           {subtitle}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // function BottomStat({
// //   title,
// //   subtitle,
// // }) {
// //   return (
// //     <div className="flex min-h-[88px] flex-col items-center justify-center border-t border-white/10 px-4 py-5 md:border-l md:border-t-0">
// //       <div className="text-[20px] font-black">
// //         {title}
// //       </div>

// //       <div className="mt-1 text-[10px] text-white/75">
// //         {subtitle}
// //       </div>
// //     </div>
// //   );
// // }
// // // "use client";

// // // import { useEffect, useMemo, useState } from "react";
// // // import Link from "next/link";
// // // import {
// // //   ArrowRight,
// // //   BookOpen,
// // //   Code2,
// // //   CreditCard,
// // //   Download,
// // //   Headphones,
// // //   Heart,
// // //   LayoutGrid,
// // //   Loader2,
// // //   PackageSearch,
// // //   Search,
// // //   ShoppingCart,
// // //   Sparkles,
// // //   Wrench,
// // // } from "lucide-react";

// // // import { supabase } from "../../lib/supabase";
// // // import NavBar from "../../components/NavBar";
// // // import { useCart } from "../../components/CartProvider";

// // // export default function ShopPage() {
// // //   const { addToCart } = useCart();

// // //   const [products, setProducts] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [search, setSearch] = useState("");
// // //   const [activeCategory, setActiveCategory] = useState("All");

// // //   const [favorites, setFavorites] = useState([]);
// // //   const [addedProductId, setAddedProductId] = useState(null);

// // //   useEffect(() => {
// // //     fetchProducts();

// // //     try {
// // //       const savedFavorites = JSON.parse(
// // //         localStorage.getItem("shop_favorites") || "[]"
// // //       );

// // //       setFavorites(Array.isArray(savedFavorites) ? savedFavorites : []);
// // //     } catch {
// // //       setFavorites([]);
// // //     }
// // //   }, []);

// // //   async function fetchProducts() {
// // //     setLoading(true);

// // //     const { data, error } = await supabase
// // //       .from("shop_products")
// // //       .select("*")
// // //       .eq("is_active", true)
// // //       .order("display_order", { ascending: true })
// // //       .order("created_at", { ascending: false });

// // //     if (error) {
// // //       console.error("Failed to load shop products:", error);
// // //       setProducts([]);
// // //     } else {
// // //       setProducts(data || []);
// // //     }

// // //     setLoading(false);
// // //   }

// // //   const categories = useMemo(() => {
// // //     return [
// // //       "All",
// // //       ...new Set(
// // //         products
// // //           .map((product) => product.category)
// // //           .filter(Boolean)
// // //       ),
// // //     ];
// // //   }, [products]);

// // //   const filteredProducts = products.filter((product) => {
// // //     const categoryMatch =
// // //       activeCategory === "All" ||
// // //       product.category === activeCategory;

// // //     const query = search.trim().toLowerCase();

// // //     const searchMatch =
// // //       !query ||
// // //       product.name?.toLowerCase().includes(query) ||
// // //       product.short_description?.toLowerCase().includes(query) ||
// // //       product.category?.toLowerCase().includes(query);

// // //     return categoryMatch && searchMatch;
// // //   });

// // //   const featuredProducts = filteredProducts.filter(
// // //     (product) => product.is_featured
// // //   );

// // //   const displayedProducts =
// // //     featuredProducts.length > 0 && activeCategory === "All" && !search
// // //       ? featuredProducts.slice(0, 5)
// // //       : filteredProducts;

// // //   function money(value, currency = "KES") {
// // //     return new Intl.NumberFormat("en-KE", {
// // //       style: "currency",
// // //       currency,
// // //       maximumFractionDigits: 0,
// // //     }).format(Number(value || 0));
// // //   }

// // //   function showAllProducts() {
// // //     setActiveCategory("All");

// // //     setTimeout(() => {
// // //       document.getElementById("products")?.scrollIntoView({
// // //         behavior: "smooth",
// // //       });
// // //     }, 50);
// // //   }

// // //   function handleAddToCart(product) {
// // //     const inStock =
// // //       !product.track_inventory ||
// // //       Number(product.stock_quantity || 0) > 0;

// // //     if (!inStock) return;

// // //     addToCart(product, 1);

// // //     setAddedProductId(product.id);

// // //     setTimeout(() => {
// // //       setAddedProductId(null);
// // //     }, 1400);
// // //   }

// // //   function toggleFavorite(productId) {
// // //     setFavorites((current) => {
// // //       const updated = current.includes(productId)
// // //         ? current.filter((id) => id !== productId)
// // //         : [...current, productId];

// // //       localStorage.setItem(
// // //         "shop_favorites",
// // //         JSON.stringify(updated)
// // //       );

// // //       return updated;
// // //     });
// // //   }

// // //   return (
// // //     <main className="min-h-screen bg-white text-[#101936]">
// // //       <NavBar />

// // //       {/* =====================================================
// // //           HERO
// // //       ====================================================== */}
// // //       <section className="relative overflow-hidden border-b border-[#f0eef8] pt-[76px]">
// // //         <div
// // //           className="absolute inset-0"
// // //           style={{
// // //             background:
// // //               "linear-gradient(110deg,#ffffff 0%,#fcfaff 48%,#f4edff 100%)",
// // //           }}
// // //         />

// // //         <svg
// // //           viewBox="0 0 1440 420"
// // //           preserveAspectRatio="none"
// // //           className="pointer-events-none absolute inset-0 h-full w-full"
// // //         >
// // //           <path
// // //             d="M0 350 C220 240 350 290 560 260 C800 220 920 110 1120 135 C1270 150 1350 215 1440 235 L1440 420 L0 420Z"
// // //             fill="#9272ee"
// // //             opacity="0.035"
// // //           />

// // //           <path
// // //             d="M580 420 C760 270 880 235 1040 240 C1190 245 1310 165 1440 120 L1440 420Z"
// // //             fill="#b59cf8"
// // //             opacity="0.08"
// // //           />
// // //         </svg>

// // //         <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-10 sm:px-6 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-14">
// // //           {/* Left */}
// // //           <div className="max-w-[610px]">
// // //             <span className="inline-flex rounded-full bg-[#eee8ff] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#5b3ae2]">
// // //               Premium Shop
// // //             </span>

// // //             <h1 className="mt-4 text-[38px] font-black leading-[1.07] tracking-[-0.03em] text-[#101936] sm:text-[46px] lg:text-[50px] xl:text-[54px]">
// // //               Premium Learning Products
// // //               <br className="hidden sm:block" /> for{" "}
// // //               <span className="bg-gradient-to-r from-[#9176f5] via-[#b75ee8] to-[#ff4c83] bg-clip-text text-transparent">
// // //                 Young Creators.
// // //               </span>
// // //             </h1>

// // //             <p className="mt-5 max-w-[540px] text-[14px] leading-7 text-[#586581] sm:text-[15px]">
// // //               Handpicked coding books, educational resources, kits,
// // //               tools and creative products designed to make every
// // //               learning journey practical, fun and inspiring.
// // //             </p>

// // //             <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12px] font-semibold text-[#34415e]">
// // //               <div className="flex items-center gap-2">
// // //                 <span className="text-[#5634e4]">✓</span>
// // //                 Premium Quality
// // //               </div>

// // //               <div className="flex items-center gap-2">
// // //                 <Download size={14} className="text-[#5634e4]" />
// // //                 Fast Delivery
// // //               </div>

// // //               <div className="flex items-center gap-2">
// // //                 <CreditCard size={14} className="text-[#5634e4]" />
// // //                 Secure Payments
// // //               </div>
// // //             </div>

// // //             <div className="mt-7 flex flex-wrap gap-3">
// // //               <button
// // //                 type="button"
// // //                 onClick={showAllProducts}
// // //                 className="inline-flex h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-[#6033e7] to-[#5931e0] px-7 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(91,52,223,0.22)] transition hover:-translate-y-0.5 hover:shadow-xl"
// // //               >
// // //                 Explore All Products
// // //                 <ArrowRight size={16} />
// // //               </button>

// // //               <button
// // //                 type="button"
// // //                 onClick={() => {
// // //                   setActiveCategory("All");

// // //                   setTimeout(() => {
// // //                     document.getElementById("products")?.scrollIntoView({
// // //                       behavior: "smooth",
// // //                     });
// // //                   }, 50);
// // //                 }}
// // //                 className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e4e4ee] bg-white px-7 text-[13px] font-bold text-[#313b58] shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
// // //               >
// // //                 <Sparkles size={16} className="text-[#623bdc]" />
// // //                 Featured
// // //               </button>
// // //             </div>
// // //           </div>

// // //           {/* Hero Visual */}
// // //           <div className="relative flex items-center justify-center">
// // //             <div className="absolute h-[75%] w-[75%] rounded-full bg-purple-300/10 blur-[80px]" />

// // //             <img
// // //               src="/shop/premium-shop-hero.png"
// // //               alt="Tech Talk Hub premium shop"
// // //               width={620}
// // //               height={370}
// // //               className="relative h-auto w-full max-w-[620px] object-contain"
// // //             />
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* =====================================================
// // //           BENEFITS
// // //       ====================================================== */}
// // //       <section className="relative z-10 -mt-4">
// // //         <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
// // //           <div className="grid overflow-hidden rounded-2xl border border-[#ededf3] bg-white shadow-[0_8px_25px_rgba(23,32,70,0.06)] sm:grid-cols-2 lg:grid-cols-5">
// // //             <Benefit
// // //               icon={Sparkles}
// // //               title="Premium Quality"
// // //               subtitle="Carefully crafted products"
// // //             />

// // //             <Benefit
// // //               icon={Download}
// // //               title="Fast Delivery"
// // //               subtitle="Quick access after purchase"
// // //             />

// // //             <Benefit
// // //               icon={Wrench}
// // //               title="Useful Resources"
// // //               subtitle="Designed for real learning"
// // //             />

// // //             <Benefit
// // //               icon={CreditCard}
// // //               title="Secure Payments"
// // //               subtitle="Safe local payments"
// // //             />

// // //             <Benefit
// // //               icon={Headphones}
// // //               title="Support"
// // //               subtitle="We're here to help"
// // //               last
// // //             />
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* =====================================================
// // //           SEARCH
// // //       ====================================================== */}
// // //       <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
// // //         <div className="mx-auto max-w-xl">
// // //           <div className="relative">
// // //             <Search
// // //               size={18}
// // //               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
// // //             />

// // //             <input
// // //               type="text"
// // //               value={search}
// // //               onChange={(event) => setSearch(event.target.value)}
// // //               placeholder="Search books, kits, resources..."
// // //               className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:ring-4 focus:ring-purple-100/60"
// // //             />
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* =====================================================
// // //           CATEGORIES
// // //       ====================================================== */}
// // //       <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-6 lg:px-8">
// // //         <div className="mb-5 flex items-center justify-between">
// // //           <h2 className="text-lg font-extrabold text-[#151d38]">
// // //             Shop by Category
// // //           </h2>

// // //           <button
// // //             type="button"
// // //             onClick={() => setActiveCategory("All")}
// // //             className="text-[12px] font-bold text-[#5c36df] transition hover:text-purple-800"
// // //           >
// // //             View All Categories
// // //           </button>
// // //         </div>

// // //         {categories.length > 1 ? (
// // //           <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
// // //             {categories.slice(1, 7).map((category, index) => {
// // //               const Icon = [
// // //                 LayoutGrid,
// // //                 Code2,
// // //                 BookOpen,
// // //                 Wrench,
// // //                 Sparkles,
// // //                 ShoppingCart,
// // //               ][index % 6];

// // //               const count = products.filter(
// // //                 (product) => product.category === category
// // //               ).length;

// // //               return (
// // //                 <button
// // //                   type="button"
// // //                   key={category}
// // //                   onClick={() => setActiveCategory(category)}
// // //                   className={`flex min-h-[76px] items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-[0_2px_8px_rgba(20,28,56,0.035)] transition hover:-translate-y-0.5 hover:shadow-md ${
// // //                     activeCategory === category
// // //                       ? "border-[#8061eb] ring-2 ring-purple-100"
// // //                       : "border-[#e7e8ef]"
// // //                   }`}
// // //                 >
// // //                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1ecff] text-[#6944e6]">
// // //                     <Icon size={18} />
// // //                   </div>

// // //                   <div className="min-w-0">
// // //                     <p className="truncate text-[12px] font-bold text-[#27314d]">
// // //                       {category}
// // //                     </p>

// // //                     <p className="mt-1 text-[10px] text-[#8690a7]">
// // //                       {count} {count === 1 ? "Product" : "Products"}
// // //                     </p>
// // //                   </div>
// // //                 </button>
// // //               );
// // //             })}
// // //           </div>
// // //         ) : (
// // //           <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
// // //             Categories will appear when products are added.
// // //           </div>
// // //         )}
// // //       </section>

// // //       {/* =====================================================
// // //           PRODUCTS
// // //       ====================================================== */}
// // //       <section
// // //         id="products"
// // //         className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-4 pt-10 sm:px-6 lg:px-8"
// // //       >
// // //         <div className="mb-5 flex items-center justify-between">
// // //           <div>
// // //             <h2 className="text-lg font-extrabold text-[#151d38]">
// // //               {activeCategory === "All"
// // //                 ? search
// // //                   ? "Search Results"
// // //                   : "Featured Products"
// // //                 : activeCategory}
// // //             </h2>

// // //             {search && (
// // //               <p className="mt-1 text-xs text-slate-400">
// // //                 Results for &quot;{search}&quot;
// // //               </p>
// // //             )}
// // //           </div>

// // //           <button
// // //             type="button"
// // //             onClick={showAllProducts}
// // //             className="text-[12px] font-bold text-[#5c36df] transition hover:text-purple-800"
// // //           >
// // //             View All Products
// // //           </button>
// // //         </div>

// // //         {loading ? (
// // //           <div className="flex min-h-[320px] items-center justify-center">
// // //             <Loader2 className="h-7 w-7 animate-spin text-[#5834df]" />
// // //           </div>
// // //         ) : displayedProducts.length === 0 ? (
// // //           <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-center">
// // //             <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
// // //               <PackageSearch
// // //                 size={26}
// // //                 className="text-purple-300"
// // //               />
// // //             </div>

// // //             <p className="mt-4 font-bold text-slate-700">
// // //               No products found
// // //             </p>

// // //             <p className="mt-1 text-sm text-slate-400">
// // //               Try another category or search.
// // //             </p>
// // //           </div>
// // //         ) : (
// // //           <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
// // //             {displayedProducts.map((product) => {
// // //               const inStock =
// // //                 !product.track_inventory ||
// // //                 Number(product.stock_quantity || 0) > 0;

// // //               const isFavorite = favorites.includes(product.id);
// // //               const wasAdded = addedProductId === product.id;

// // //               return (
// // //                 <article
// // //                   key={product.id}
// // //                   className="group overflow-hidden rounded-2xl border border-[#e3e5ec] bg-white shadow-[0_3px_12px_rgba(19,29,58,0.05)] transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
// // //                 >
// // //                   {/* Product Image */}
// // //                   <div className="relative aspect-[4/3] overflow-hidden bg-[#101425]">
// // //                     {product.badge && (
// // //                       <span className="absolute left-3 top-3 z-10 rounded-full bg-[#ff4b7c] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wide text-white shadow">
// // //                         {product.badge}
// // //                       </span>
// // //                     )}

// // //                     {/* Favourite */}
// // //                     <button
// // //                       type="button"
// // //                       onClick={() => toggleFavorite(product.id)}
// // //                       aria-label={
// // //                         isFavorite
// // //                           ? "Remove from favorites"
// // //                           : "Add to favorites"
// // //                       }
// // //                       className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-md transition hover:scale-105 hover:text-[#ff4b7c]"
// // //                     >
// // //                       <Heart
// // //                         size={17}
// // //                         className={
// // //                           isFavorite
// // //                             ? "fill-[#ff4b7c] text-[#ff4b7c]"
// // //                             : ""
// // //                         }
// // //                       />
// // //                     </button>

// // //                     <Link
// // //                       href={`/shop/${product.slug}`}
// // //                       className="block h-full w-full"
// // //                     >
// // //                       {product.image_url ? (
// // //                         <img
// // //                           src={product.image_url}
// // //                           alt={product.name}
// // //                           className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
// // //                         />
// // //                       ) : (
// // //                         <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#151a37] via-[#25205d] to-[#16162d]">
// // //                           <Code2
// // //                             size={42}
// // //                             className="text-purple-300"
// // //                           />
// // //                         </div>
// // //                       )}
// // //                     </Link>
// // //                   </div>

// // //                   {/* Product Body */}
// // //                   <div className="p-4">
// // //                     {product.category && (
// // //                       <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-purple-500">
// // //                         {product.category}
// // //                       </p>
// // //                     )}

// // //                     <Link href={`/shop/${product.slug}`}>
// // //                       <h3 className="line-clamp-2 min-h-[42px] text-[13px] font-bold leading-[1.5] text-[#1e2844] transition hover:text-[#5837de]">
// // //                         {product.name}
// // //                       </h3>
// // //                     </Link>

// // //                     {product.short_description && (
// // //                       <p className="mt-1.5 line-clamp-2 min-h-[32px] text-[10px] leading-4 text-slate-400">
// // //                         {product.short_description}
// // //                       </p>
// // //                     )}

// // //                     {/* Price */}
// // //                     <div className="mt-3 flex flex-wrap items-baseline gap-2">
// // //                       <span className="text-[15px] font-black text-[#5837de]">
// // //                         {money(
// // //                           product.price,
// // //                           product.currency || "KES"
// // //                         )}
// // //                       </span>

// // //                       {product.compare_at_price && (
// // //                         <span className="text-[10px] font-semibold text-[#9fa5b5] line-through">
// // //                           {money(
// // //                             product.compare_at_price,
// // //                             product.currency || "KES"
// // //                           )}
// // //                         </span>
// // //                       )}
// // //                     </div>

// // //                     {/* Stock */}
// // //                     <div className="mt-2">
// // //                       {inStock ? (
// // //                         <span className="text-[9px] font-bold text-emerald-600">
// // //                           In Stock
// // //                         </span>
// // //                       ) : (
// // //                         <span className="text-[9px] font-bold text-red-500">
// // //                           Out of Stock
// // //                         </span>
// // //                       )}
// // //                     </div>

// // //                     {/* Add to Cart */}
// // //                     <button
// // //                       type="button"
// // //                       disabled={!inStock}
// // //                       onClick={() => handleAddToCart(product)}
// // //                       className={`mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[11px] font-bold transition ${
// // //                         wasAdded
// // //                           ? "bg-emerald-600 text-white"
// // //                           : "bg-[#5d38df] text-white hover:bg-[#4e2ec8]"
// // //                       } disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400`}
// // //                     >
// // //                       {wasAdded ? (
// // //                         <>
// // //                           <span>✓</span>
// // //                           Added!
// // //                         </>
// // //                       ) : (
// // //                         <>
// // //                           <ShoppingCart size={14} />
// // //                           {inStock ? "Add to Cart" : "Out of Stock"}
// // //                         </>
// // //                       )}
// // //                     </button>
// // //                   </div>
// // //                 </article>
// // //               );
// // //             })}
// // //           </div>
// // //         )}
// // //       </section>

// // //       {/* =====================================================
// // //           BOTTOM STRIP
// // //       ====================================================== */}
// // //       <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-6 lg:px-8">
// // //         <div className="grid overflow-hidden rounded-2xl bg-gradient-to-r from-[#8066e5] via-[#876ae8] to-[#967ee3] text-white shadow-lg md:grid-cols-[2fr_repeat(4,1fr)]">
// // //           <div className="flex min-h-[100px] items-center gap-4 px-7 py-6 lg:px-10">
// // //             <span className="text-[44px] font-black leading-none text-white/60">
// // //               “
// // //             </span>

// // //             <p className="max-w-[350px] text-[12px] font-semibold leading-5">
// // //               Every purchase supports creative learning and technology
// // //               education for young people.
// // //             </p>
// // //           </div>

// // //           <BottomStat
// // //             title={`${products.length}+`}
// // //             subtitle="Shop Products"
// // //           />

// // //           <BottomStat
// // //             title="KES"
// // //             subtitle="Local Pricing"
// // //           />

// // //           <BottomStat
// // //             title="Secure"
// // //             subtitle="Payments"
// // //           />

// // //           <BottomStat
// // //             title="100%"
// // //             subtitle="Learning Focus"
// // //           />
// // //         </div>
// // //       </section>
// // //     </main>
// // //   );
// // // }

// // // function Benefit({
// // //   icon: Icon,
// // //   title,
// // //   subtitle,
// // //   last,
// // // }) {
// // //   return (
// // //     <div
// // //       className={`flex min-h-[88px] items-center gap-3 px-5 py-4 ${
// // //         !last
// // //           ? "border-b border-[#eeeeF4] sm:border-r lg:border-b-0"
// // //           : ""
// // //       }`}
// // //     >
// // //       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f0ff] text-[#6442e4]">
// // //         <Icon size={18} />
// // //       </div>

// // //       <div className="min-w-0">
// // //         <div className="text-[11px] font-extrabold text-[#202944]">
// // //           {title}
// // //         </div>

// // //         <div className="mt-1 text-[10px] leading-[1.45] text-[#758099]">
// // //           {subtitle}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // function BottomStat({
// // //   title,
// // //   subtitle,
// // // }) {
// // //   return (
// // //     <div className="flex min-h-[88px] flex-col items-center justify-center border-t border-white/10 px-4 py-5 md:border-l md:border-t-0">
// // //       <div className="text-[20px] font-black">
// // //         {title}
// // //       </div>

// // //       <div className="mt-1 text-[10px] text-white/75">
// // //         {subtitle}
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // // // "use client";

// // // // import { useEffect, useMemo, useState } from "react";
// // // // import Link from "next/link";
// // // // import {
// // // //   ArrowRight,
// // // //   BookOpen,
// // // //   Check,
// // // //   Code2,
// // // //   CreditCard,
// // // //   Download,
// // // //   Heart,
// // // //   Headphones,
// // // //   LayoutGrid,
// // // //   Loader2,
// // // //   PackageSearch,
// // // //   Search,
// // // //   ShoppingCart,
// // // //   Sparkles,
// // // //   Star,
// // // //   Wrench,
// // // // } from "lucide-react";

// // // // import { supabase } from "../../lib/supabase";
// // // // import NavBar from "../../components/NavBar";
// // // // import { useCart } from "../../components/CartProvider";

// // // // export default function ShopPage() {
// // // //   const { addToCart } = useCart();

// // // //   const [products, setProducts] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [search, setSearch] = useState("");
// // // //   const [activeCategory, setActiveCategory] = useState("All");

// // // //   const [favorites, setFavorites] = useState([]);
// // // //   const [addedProductId, setAddedProductId] = useState(null);

// // // //   useEffect(() => {
// // // //     fetchProducts();
// // // //     loadFavorites();
// // // //   }, []);

// // // //   async function fetchProducts() {
// // // //     setLoading(true);

// // // //     const { data, error } = await supabase
// // // //       .from("shop_products")
// // // //       .select("*")
// // // //       .eq("is_active", true)
// // // //       .order("display_order", { ascending: true })
// // // //       .order("created_at", { ascending: false });

// // // //     if (error) {
// // // //       console.error("Failed to load shop products:", error);
// // // //       setProducts([]);
// // // //     } else {
// // // //       setProducts(data || []);
// // // //     }

// // // //     setLoading(false);
// // // //   }

// // // //   function loadFavorites() {
// // // //     try {
// // // //       const saved = JSON.parse(
// // // //         localStorage.getItem("tth-favorites") || "[]"
// // // //       );

// // // //       setFavorites(Array.isArray(saved) ? saved : []);
// // // //     } catch {
// // // //       setFavorites([]);
// // // //     }
// // // //   }

// // // //   function toggleFavorite(productId) {
// // // //     setFavorites((current) => {
// // // //       const next = current.includes(productId)
// // // //         ? current.filter((id) => id !== productId)
// // // //         : [...current, productId];

// // // //       localStorage.setItem(
// // // //         "tth-favorites",
// // // //         JSON.stringify(next)
// // // //       );

// // // //       return next;
// // // //     });
// // // //   }

// // // //   function handleQuickAdd(product) {
// // // //     const inStock =
// // // //       !product.track_inventory ||
// // // //       Number(product.stock_quantity) > 0;

// // // //     if (!inStock) return;

// // // //     addToCart(product, 1);

// // // //     setAddedProductId(product.id);

// // // //     setTimeout(() => {
// // // //       setAddedProductId((current) =>
// // // //         current === product.id ? null : current
// // // //       );
// // // //     }, 1600);
// // // //   }

// // // //   const categories = useMemo(() => {
// // // //     return [
// // // //       "All",
// // // //       ...new Set(
// // // //         products
// // // //           .map((product) => product.category)
// // // //           .filter(Boolean)
// // // //       ),
// // // //     ];
// // // //   }, [products]);

// // // //   const filteredProducts = products.filter((product) => {
// // // //     const categoryMatch =
// // // //       activeCategory === "All" ||
// // // //       product.category === activeCategory;

// // // //     const query = search.trim().toLowerCase();

// // // //     const searchMatch =
// // // //       !query ||
// // // //       product.name?.toLowerCase().includes(query) ||
// // // //       product.short_description
// // // //         ?.toLowerCase()
// // // //         .includes(query) ||
// // // //       product.category?.toLowerCase().includes(query);

// // // //     return categoryMatch && searchMatch;
// // // //   });

// // // //   const featuredProducts = filteredProducts.filter(
// // // //     (product) => product.is_featured
// // // //   );

// // // //   /*
// // // //    * If the customer is searching or filtering,
// // // //    * show all matching products.
// // // //    *
// // // //    * On the default shop view, show featured products first.
// // // //    */
// // // //   const displayedProducts =
// // // //     search || activeCategory !== "All"
// // // //       ? filteredProducts
// // // //       : featuredProducts.length > 0
// // // //         ? featuredProducts
// // // //         : filteredProducts;

// // // //   function money(value, currency = "KES") {
// // // //     return new Intl.NumberFormat("en-KE", {
// // // //       style: "currency",
// // // //       currency,
// // // //       maximumFractionDigits: 0,
// // // //     }).format(Number(value || 0));
// // // //   }

// // // //   function scrollToProducts() {
// // // //     setTimeout(() => {
// // // //       document
// // // //         .getElementById("products")
// // // //         ?.scrollIntoView({
// // // //           behavior: "smooth",
// // // //         });
// // // //     }, 50);
// // // //   }

// // // //   function showAllProducts() {
// // // //     setActiveCategory("All");
// // // //     setSearch("");
// // // //     scrollToProducts();
// // // //   }

// // // //   function showBestsellers() {
// // // //     setActiveCategory("All");
// // // //     setSearch("");
// // // //     scrollToProducts();
// // // //   }

// // // //   return (
// // // //     <main className="min-h-screen bg-white text-[#101936]">
// // // //       <NavBar />

// // // //       {/* =====================================================
// // // //           HERO
// // // //       ====================================================== */}

// // // //       <section className="relative overflow-hidden border-b border-[#f0eef8] pt-[76px]">
// // // //         <div
// // // //           className="absolute inset-0"
// // // //           style={{
// // // //             background:
// // // //               "linear-gradient(110deg,#ffffff 0%,#fcfaff 48%,#f4edff 100%)",
// // // //           }}
// // // //         />

// // // //         <svg
// // // //           viewBox="0 0 1440 420"
// // // //           preserveAspectRatio="none"
// // // //           className="pointer-events-none absolute inset-0 h-full w-full"
// // // //         >
// // // //           <path
// // // //             d="M0 350 C220 240 350 290 560 260 C800 220 920 110 1120 135 C1270 150 1350 215 1440 235 L1440 420 L0 420Z"
// // // //             fill="#9272ee"
// // // //             opacity="0.035"
// // // //           />

// // // //           <path
// // // //             d="M580 420 C760 270 880 235 1040 240 C1190 245 1310 165 1440 120 L1440 420Z"
// // // //             fill="#b59cf8"
// // // //             opacity="0.08"
// // // //           />
// // // //         </svg>

// // // //         <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-10 sm:px-6 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-14">
// // // //           {/* LEFT */}

// // // //           <div className="max-w-[610px]">
// // // //             <span className="inline-flex rounded-full bg-[#eee8ff] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#5b3ae2]">
// // // //               Premium Shop
// // // //             </span>

// // // //             <h1 className="mt-4 text-[38px] font-black leading-[1.07] tracking-[-0.03em] text-[#101936] sm:text-[46px] lg:text-[50px] xl:text-[54px]">
// // // //               Premium Learning Products
// // // //               <br className="hidden sm:block" /> for{" "}
// // // //               <span className="bg-gradient-to-r from-[#9176f5] via-[#b75ee8] to-[#ff4c83] bg-clip-text text-transparent">
// // // //                 Young Creators.
// // // //               </span>
// // // //             </h1>

// // // //             <p className="mt-5 max-w-[540px] text-[14px] leading-7 text-[#586581] sm:text-[15px]">
// // // //               Handpicked coding books, educational resources,
// // // //               kits, tools and creative products designed to make
// // // //               every learning journey practical, fun and inspiring.
// // // //             </p>

// // // //             {/* MINI BENEFITS */}

// // // //             <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12px] font-semibold text-[#34415e]">
// // // //               <div className="flex items-center gap-2">
// // // //                 <span className="text-[#5634e4]">✓</span>
// // // //                 Premium Quality
// // // //               </div>

// // // //               <div className="flex items-center gap-2">
// // // //                 <Download
// // // //                   size={14}
// // // //                   className="text-[#5634e4]"
// // // //                 />
// // // //                 Fast Delivery
// // // //               </div>

// // // //               <div className="flex items-center gap-2">
// // // //                 <CreditCard
// // // //                   size={14}
// // // //                   className="text-[#5634e4]"
// // // //                 />
// // // //                 Secure Payments
// // // //               </div>
// // // //             </div>

// // // //             {/* BUTTONS */}

// // // //             <div className="mt-7 flex flex-wrap gap-3">
// // // //               <button
// // // //                 type="button"
// // // //                 onClick={showAllProducts}
// // // //                 className="inline-flex h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-[#6033e7] to-[#5931e0] px-7 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(91,52,223,0.22)] transition hover:-translate-y-0.5 hover:shadow-xl"
// // // //               >
// // // //                 Explore All Products
// // // //                 <ArrowRight size={16} />
// // // //               </button>

// // // //               <button
// // // //                 type="button"
// // // //                 onClick={showBestsellers}
// // // //                 className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e4e4ee] bg-white px-7 text-[13px] font-bold text-[#313b58] shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
// // // //               >
// // // //                 <Star
// // // //                   size={16}
// // // //                   className="text-[#623bdc]"
// // // //                 />
// // // //                 Bestsellers
// // // //               </button>
// // // //             </div>
// // // //           </div>

// // // //           {/* HERO VISUAL */}

// // // //           <div className="relative flex items-center justify-center">
// // // //             <div className="absolute h-[75%] w-[75%] rounded-full bg-purple-300/10 blur-[80px]" />

// // // //             <img
// // // //               src="/shop/premium-shop-hero.png"
// // // //               alt="Tech Talk Hub premium shop"
// // // //               width={620}
// // // //               height={370}
// // // //               className="relative h-auto w-full max-w-[620px] object-contain"
// // // //             />
// // // //           </div>
// // // //         </div>
// // // //       </section>

// // // //       {/* =====================================================
// // // //           BENEFITS
// // // //       ====================================================== */}

// // // //       <section className="relative z-10 -mt-4">
// // // //         <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
// // // //           <div className="grid overflow-hidden rounded-2xl border border-[#ededf3] bg-white shadow-[0_8px_25px_rgba(23,32,70,0.06)] sm:grid-cols-2 lg:grid-cols-5">
// // // //             <Benefit
// // // //               icon={Star}
// // // //               title="Premium Quality"
// // // //               subtitle="Carefully crafted products"
// // // //             />

// // // //             <Benefit
// // // //               icon={Download}
// // // //               title="Fast Delivery"
// // // //               subtitle="Quick access after purchase"
// // // //             />

// // // //             <Benefit
// // // //               icon={Wrench}
// // // //               title="Useful Resources"
// // // //               subtitle="Designed for real learning"
// // // //             />

// // // //             <Benefit
// // // //               icon={CreditCard}
// // // //               title="Secure Payments"
// // // //               subtitle="Safe local payments"
// // // //             />

// // // //             <Benefit
// // // //               icon={Headphones}
// // // //               title="Support"
// // // //               subtitle="We're here to help"
// // // //               last
// // // //             />
// // // //           </div>
// // // //         </div>
// // // //       </section>

// // // //       {/* =====================================================
// // // //           SEARCH
// // // //       ====================================================== */}

// // // //       <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
// // // //         <div className="mx-auto max-w-xl">
// // // //           <div className="relative">
// // // //             <Search
// // // //               size={18}
// // // //               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
// // // //             />

// // // //             <input
// // // //               type="text"
// // // //               value={search}
// // // //               onChange={(event) =>
// // // //                 setSearch(event.target.value)
// // // //               }
// // // //               placeholder="Search books, kits, resources..."
// // // //               className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:ring-4 focus:ring-purple-100/60"
// // // //             />
// // // //           </div>
// // // //         </div>
// // // //       </section>

// // // //       {/* =====================================================
// // // //           CATEGORIES
// // // //       ====================================================== */}

// // // //       <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-6 lg:px-8">
// // // //         <div className="mb-5 flex items-center justify-between">
// // // //           <h2 className="text-lg font-extrabold text-[#151d38]">
// // // //             Shop by Category
// // // //           </h2>

// // // //           <button
// // // //             type="button"
// // // //             onClick={showAllProducts}
// // // //             className="text-[12px] font-bold text-[#5c36df] transition hover:text-purple-800"
// // // //           >
// // // //             View All Categories
// // // //           </button>
// // // //         </div>

// // // //         {categories.length > 1 ? (
// // // //           <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
// // // //             {categories
// // // //               .slice(1, 7)
// // // //               .map((category, index) => {
// // // //                 const Icon = [
// // // //                   LayoutGrid,
// // // //                   Code2,
// // // //                   BookOpen,
// // // //                   Wrench,
// // // //                   Sparkles,
// // // //                   ShoppingCart,
// // // //                 ][index % 6];

// // // //                 const count = products.filter(
// // // //                   (product) =>
// // // //                     product.category === category
// // // //                 ).length;

// // // //                 return (
// // // //                   <button
// // // //                     type="button"
// // // //                     key={category}
// // // //                     onClick={() => {
// // // //                       setActiveCategory(category);
// // // //                       scrollToProducts();
// // // //                     }}
// // // //                     className={`flex min-h-[76px] items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-[0_2px_8px_rgba(20,28,56,0.035)] transition hover:-translate-y-0.5 hover:shadow-md ${
// // // //                       activeCategory === category
// // // //                         ? "border-[#8061eb] ring-2 ring-purple-100"
// // // //                         : "border-[#e7e8ef]"
// // // //                     }`}
// // // //                   >
// // // //                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1ecff] text-[#6944e6]">
// // // //                       <Icon size={18} />
// // // //                     </div>

// // // //                     <div className="min-w-0">
// // // //                       <p className="truncate text-[12px] font-bold text-[#27314d]">
// // // //                         {category}
// // // //                       </p>

// // // //                       <p className="mt-1 text-[10px] text-[#8690a7]">
// // // //                         {count}{" "}
// // // //                         {count === 1
// // // //                           ? "Product"
// // // //                           : "Products"}
// // // //                       </p>
// // // //                     </div>
// // // //                   </button>
// // // //                 );
// // // //               })}
// // // //           </div>
// // // //         ) : (
// // // //           <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
// // // //             Categories will appear when products are added.
// // // //           </div>
// // // //         )}
// // // //       </section>

// // // //       {/* =====================================================
// // // //           PRODUCTS
// // // //       ====================================================== */}

// // // //       <section
// // // //         id="products"
// // // //         className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-4 pt-10 sm:px-6 lg:px-8"
// // // //       >
// // // //         <div className="mb-5 flex items-end justify-between gap-4">
// // // //           <div>
// // // //             <h2 className="text-lg font-extrabold text-[#151d38]">
// // // //               {activeCategory === "All"
// // // //                 ? search
// // // //                   ? "Search Results"
// // // //                   : "Featured Products"
// // // //                 : activeCategory}
// // // //             </h2>

// // // //             {search && (
// // // //               <p className="mt-1 text-xs text-slate-400">
// // // //                 Results for &quot;{search}&quot;
// // // //               </p>
// // // //             )}
// // // //           </div>

// // // //           <button
// // // //             type="button"
// // // //             onClick={showAllProducts}
// // // //             className="shrink-0 text-[12px] font-bold text-[#5c36df] transition hover:text-purple-800"
// // // //           >
// // // //             View All Products
// // // //           </button>
// // // //         </div>

// // // //         {loading ? (
// // // //           <div className="flex min-h-[320px] items-center justify-center">
// // // //             <Loader2 className="h-7 w-7 animate-spin text-[#5834df]" />
// // // //           </div>
// // // //         ) : displayedProducts.length === 0 ? (
// // // //           <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-center">
// // // //             <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
// // // //               <PackageSearch
// // // //                 size={26}
// // // //                 className="text-purple-300"
// // // //               />
// // // //             </div>

// // // //             <p className="mt-4 font-bold text-slate-700">
// // // //               No products found
// // // //             </p>

// // // //             <p className="mt-1 text-sm text-slate-400">
// // // //               Try another category or search.
// // // //             </p>
// // // //           </div>
// // // //         ) : (
// // // //           <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
// // // //             {displayedProducts.map((product) => {
// // // //               const isFavorite =
// // // //                 favorites.includes(product.id);

// // // //               const wasAdded =
// // // //                 addedProductId === product.id;

// // // //               const inStock =
// // // //                 !product.track_inventory ||
// // // //                 Number(product.stock_quantity) > 0;

// // // //               return (
// // // //                 <article
// // // //                   key={product.id}
// // // //                   className="group overflow-hidden rounded-2xl border border-[#e3e5ec] bg-white shadow-[0_3px_12px_rgba(19,29,58,0.05)] transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
// // // //                 >
// // // //                   {/* PRODUCT IMAGE */}

// // // //                   <div className="relative aspect-[4/3] overflow-hidden bg-[#101425]">
// // // //                     {product.badge && (
// // // //                       <span className="absolute left-3 top-3 z-10 rounded-full bg-[#ff4b7c] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wide text-white shadow">
// // // //                         {product.badge}
// // // //                       </span>
// // // //                     )}

// // // //                     {/* FAVORITE */}

// // // //                     <button
// // // //                       type="button"
// // // //                       onClick={() =>
// // // //                         toggleFavorite(product.id)
// // // //                       }
// // // //                       aria-label={
// // // //                         isFavorite
// // // //                           ? "Remove from favorites"
// // // //                           : "Add to favorites"
// // // //                       }
// // // //                       className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md backdrop-blur transition hover:scale-105 hover:text-[#ff4c83]"
// // // //                     >
// // // //                       <Heart
// // // //                         size={17}
// // // //                         className={
// // // //                           isFavorite
// // // //                             ? "fill-[#ff4c83] text-[#ff4c83]"
// // // //                             : ""
// // // //                         }
// // // //                       />
// // // //                     </button>

// // // //                     <Link
// // // //                       href={`/shop/${product.slug}`}
// // // //                       className="block h-full w-full"
// // // //                     >
// // // //                       {product.image_url ? (
// // // //                         <img
// // // //                           src={product.image_url}
// // // //                           alt={product.name}
// // // //                           className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
// // // //                         />
// // // //                       ) : (
// // // //                         <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#151a37] via-[#25205d] to-[#16162d]">
// // // //                           <Code2
// // // //                             size={42}
// // // //                             className="text-purple-300"
// // // //                           />
// // // //                         </div>
// // // //                       )}
// // // //                     </Link>
// // // //                   </div>

// // // //                   {/* PRODUCT BODY */}

// // // //                   <div className="p-4">
// // // //                     {product.category && (
// // // //                       <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-purple-500">
// // // //                         {product.category}
// // // //                       </p>
// // // //                     )}

// // // //                     <Link
// // // //                       href={`/shop/${product.slug}`}
// // // //                     >
// // // //                       <h3 className="line-clamp-2 min-h-[42px] text-[13px] font-bold leading-[1.5] text-[#1e2844] transition hover:text-[#5837de]">
// // // //                         {product.name}
// // // //                       </h3>
// // // //                     </Link>

// // // //                     {/* RATING */}

// // // //                     <div className="mt-2.5 flex items-center gap-1">
// // // //                       <Star
// // // //                         size={11}
// // // //                         className="fill-[#ffad17] text-[#ffad17]"
// // // //                       />

// // // //                       <span className="text-[10px] font-bold text-[#3d4864]">
// // // //                         4.9
// // // //                       </span>

// // // //                       <span className="text-[9px] text-[#9ca3b6]">
// // // //                         (New)
// // // //                       </span>
// // // //                     </div>

// // // //                     {/* PRICE */}

// // // //                     <div className="mt-3 flex flex-wrap items-baseline gap-2">
// // // //                       <span className="text-[15px] font-black text-[#5837de]">
// // // //                         {money(
// // // //                           product.price,
// // // //                           product.currency || "KES"
// // // //                         )}
// // // //                       </span>

// // // //                       {product.compare_at_price && (
// // // //                         <span className="text-[10px] font-semibold text-[#9fa5b5] line-through">
// // // //                           {money(
// // // //                             product.compare_at_price,
// // // //                             product.currency ||
// // // //                               "KES"
// // // //                           )}
// // // //                         </span>
// // // //                       )}
// // // //                     </div>

// // // //                     {/* STOCK */}

// // // //                     {product.track_inventory && (
// // // //                       <p
// // // //                         className={`mt-2 text-[9px] font-bold ${
// // // //                           inStock
// // // //                             ? "text-emerald-600"
// // // //                             : "text-red-500"
// // // //                         }`}
// // // //                       >
// // // //                         {inStock
// // // //                           ? "In Stock"
// // // //                           : "Out of Stock"}
// // // //                       </p>
// // // //                     )}

// // // //                     {/* QUICK ADD */}

// // // //                     <button
// // // //                       type="button"
// // // //                       disabled={!inStock}
// // // //                       onClick={() =>
// // // //                         handleQuickAdd(product)
// // // //                       }
// // // //                       className={`mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[11px] font-extrabold transition ${
// // // //                         wasAdded
// // // //                           ? "bg-emerald-500 text-white"
// // // //                           : "bg-[#5837de] text-white hover:-translate-y-0.5 hover:bg-[#4928cc] hover:shadow-md"
// // // //                       } disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400`}
// // // //                     >
// // // //                       {!inStock ? (
// // // //                         "Out of Stock"
// // // //                       ) : wasAdded ? (
// // // //                         <>
// // // //                           <Check size={15} />
// // // //                           Added to Cart
// // // //                         </>
// // // //                       ) : (
// // // //                         <>
// // // //                           <ShoppingCart size={15} />
// // // //                           Add to Cart
// // // //                         </>
// // // //                       )}
// // // //                     </button>

// // // //                     <Link
// // // //                       href={`/shop/${product.slug}`}
// // // //                       className="mt-2 block text-center text-[10px] font-bold text-slate-400 transition hover:text-primary"
// // // //                     >
// // // //                       View Details
// // // //                     </Link>
// // // //                   </div>
// // // //                 </article>
// // // //               );
// // // //             })}
// // // //           </div>
// // // //         )}
// // // //       </section>

// // // //       {/* =====================================================
// // // //           BOTTOM STRIP
// // // //       ====================================================== */}

// // // //       <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-6 lg:px-8">
// // // //         <div className="grid overflow-hidden rounded-2xl bg-gradient-to-r from-[#8066e5] via-[#876ae8] to-[#967ee3] text-white shadow-lg md:grid-cols-[2fr_repeat(4,1fr)]">
// // // //           <div className="flex min-h-[100px] items-center gap-4 px-7 py-6 lg:px-10">
// // // //             <span className="text-[44px] font-black leading-none text-white/60">
// // // //               “
// // // //             </span>

// // // //             <p className="max-w-[350px] text-[12px] font-semibold leading-5">
// // // //               Every purchase supports creative learning and
// // // //               technology education for young people.
// // // //             </p>
// // // //           </div>

// // // //           <BottomStat
// // // //             title={`${products.length}+`}
// // // //             subtitle="Shop Products"
// // // //           />

// // // //           <BottomStat
// // // //             title="KES"
// // // //             subtitle="Local Pricing"
// // // //           />

// // // //           <BottomStat
// // // //             title="Secure"
// // // //             subtitle="Payments"
// // // //           />

// // // //           <BottomStat
// // // //             title="100%"
// // // //             subtitle="Learning Focus"
// // // //           />
// // // //         </div>
// // // //       </section>
// // // //     </main>
// // // //   );
// // // // }

// // // // function Benefit({
// // // //   icon: Icon,
// // // //   title,
// // // //   subtitle,
// // // //   last,
// // // // }) {
// // // //   return (
// // // //     <div
// // // //       className={`flex min-h-[88px] items-center gap-3 px-5 py-4 ${
// // // //         !last
// // // //           ? "border-b border-[#eeeeF4] sm:border-r lg:border-b-0"
// // // //           : ""
// // // //       }`}
// // // //     >
// // // //       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f0ff] text-[#6442e4]">
// // // //         <Icon size={18} />
// // // //       </div>

// // // //       <div className="min-w-0">
// // // //         <div className="text-[11px] font-extrabold text-[#202944]">
// // // //           {title}
// // // //         </div>

// // // //         <div className="mt-1 text-[10px] leading-[1.45] text-[#758099]">
// // // //           {subtitle}
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // function BottomStat({ title, subtitle }) {
// // // //   return (
// // // //     <div className="flex min-h-[88px] flex-col items-center justify-center border-t border-white/10 px-4 py-5 md:border-l md:border-t-0">
// // // //       <div className="text-[20px] font-black">
// // // //         {title}
// // // //       </div>

// // // //       <div className="mt-1 text-[10px] text-white/75">
// // // //         {subtitle}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // // // "use client";

// // // // // import { useEffect, useMemo, useState } from "react";
// // // // // import Link from "next/link";
// // // // // import {
// // // // //   ArrowRight,
// // // // //   BookOpen,
// // // // //   Code2,
// // // // //   CreditCard,
// // // // //   Download,
// // // // //   Headphones,
// // // // //   LayoutGrid,
// // // // //   Loader2,
// // // // //   PackageSearch,
// // // // //   Search,
// // // // //   ShoppingCart,
// // // // //   Sparkles,
// // // // //   Star,
// // // // //   Wrench,
// // // // // } from "lucide-react";

// // // // // import { supabase } from "../../lib/supabase";
// // // // // import NavBar from "../../components/NavBar";

// // // // // export default function ShopPage() {
// // // // //   const [products, setProducts] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [search, setSearch] = useState("");
// // // // //   const [activeCategory, setActiveCategory] = useState("All");

// // // // //   useEffect(() => {
// // // // //     fetchProducts();
// // // // //   }, []);

// // // // //   async function fetchProducts() {
// // // // //     setLoading(true);

// // // // //     const { data, error } = await supabase
// // // // //       .from("shop_products")
// // // // //       .select("*")
// // // // //       .eq("is_active", true)
// // // // //       .order("display_order", { ascending: true })
// // // // //       .order("created_at", { ascending: false });

// // // // //     if (error) {
// // // // //       console.error("Failed to load shop products:", error);
// // // // //       setProducts([]);
// // // // //     } else {
// // // // //       setProducts(data || []);
// // // // //     }

// // // // //     setLoading(false);
// // // // //   }

// // // // //   const categories = useMemo(() => {
// // // // //     return [
// // // // //       "All",
// // // // //       ...new Set(
// // // // //         products
// // // // //           .map((product) => product.category)
// // // // //           .filter(Boolean)
// // // // //       ),
// // // // //     ];
// // // // //   }, [products]);

// // // // //   const filteredProducts = products.filter((product) => {
// // // // //     const categoryMatch =
// // // // //       activeCategory === "All" ||
// // // // //       product.category === activeCategory;

// // // // //     const query = search.trim().toLowerCase();

// // // // //     const searchMatch =
// // // // //       !query ||
// // // // //       product.name?.toLowerCase().includes(query) ||
// // // // //       product.short_description
// // // // //         ?.toLowerCase()
// // // // //         .includes(query) ||
// // // // //       product.category?.toLowerCase().includes(query);

// // // // //     return categoryMatch && searchMatch;
// // // // //   });

// // // // //   const featuredProducts = filteredProducts.filter(
// // // // //     (product) => product.is_featured
// // // // //   );

// // // // //   const displayedProducts =
// // // // //     featuredProducts.length > 0
// // // // //       ? featuredProducts.slice(0, 5)
// // // // //       : filteredProducts.slice(0, 5);

// // // // //   function money(value, currency = "KES") {
// // // // //     return new Intl.NumberFormat("en-KE", {
// // // // //       style: "currency",
// // // // //       currency,
// // // // //       maximumFractionDigits: 0,
// // // // //     }).format(Number(value || 0));
// // // // //   }

// // // // //   function showAllProducts() {
// // // // //     setActiveCategory("All");

// // // // //     setTimeout(() => {
// // // // //       document
// // // // //         .getElementById("products")
// // // // //         ?.scrollIntoView({
// // // // //           behavior: "smooth",
// // // // //         });
// // // // //     }, 50);
// // // // //   }

// // // // //   return (
// // // // //     <main className="min-h-screen bg-white text-[#101936]">
// // // // //       <NavBar />

// // // // //       {/* =====================================================
// // // // //           HERO
// // // // //       ====================================================== */}
// // // // //       <section className="relative overflow-hidden border-b border-[#f0eef8] pt-[76px]">
// // // // //         <div
// // // // //           className="absolute inset-0"
// // // // //           style={{
// // // // //             background:
// // // // //               "linear-gradient(110deg,#ffffff 0%,#fcfaff 48%,#f4edff 100%)",
// // // // //           }}
// // // // //         />

// // // // //         <svg
// // // // //           viewBox="0 0 1440 420"
// // // // //           preserveAspectRatio="none"
// // // // //           className="pointer-events-none absolute inset-0 h-full w-full"
// // // // //         >
// // // // //           <path
// // // // //             d="M0 350 C220 240 350 290 560 260 C800 220 920 110 1120 135 C1270 150 1350 215 1440 235 L1440 420 L0 420Z"
// // // // //             fill="#9272ee"
// // // // //             opacity="0.035"
// // // // //           />

// // // // //           <path
// // // // //             d="M580 420 C760 270 880 235 1040 240 C1190 245 1310 165 1440 120 L1440 420Z"
// // // // //             fill="#b59cf8"
// // // // //             opacity="0.08"
// // // // //           />
// // // // //         </svg>

// // // // //         <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-10 sm:px-6 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-14">
// // // // //           {/* Left */}
// // // // //           <div className="max-w-[610px]">
// // // // //             <span className="inline-flex rounded-full bg-[#eee8ff] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#5b3ae2]">
// // // // //               Premium Shop
// // // // //             </span>

// // // // //             <h1 className="mt-4 text-[38px] font-black leading-[1.07] tracking-[-0.03em] text-[#101936] sm:text-[46px] lg:text-[50px] xl:text-[54px]">
// // // // //               Premium Learning Products
// // // // //               <br className="hidden sm:block" /> for{" "}
// // // // //               <span className="bg-gradient-to-r from-[#9176f5] via-[#b75ee8] to-[#ff4c83] bg-clip-text text-transparent">
// // // // //                 Young Creators.
// // // // //               </span>
// // // // //             </h1>

// // // // //             <p className="mt-5 max-w-[540px] text-[14px] leading-7 text-[#586581] sm:text-[15px]">
// // // // //               Handpicked coding books, educational resources,
// // // // //               kits, tools and creative products designed to make
// // // // //               every learning journey practical, fun and inspiring.
// // // // //             </p>

// // // // //             {/* Mini Benefits */}
// // // // //             <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12px] font-semibold text-[#34415e]">
// // // // //               <div className="flex items-center gap-2">
// // // // //                 <span className="text-[#5634e4]">✓</span>
// // // // //                 Premium Quality
// // // // //               </div>

// // // // //               <div className="flex items-center gap-2">
// // // // //                 <Download
// // // // //                   size={14}
// // // // //                   className="text-[#5634e4]"
// // // // //                 />
// // // // //                 Fast Delivery
// // // // //               </div>

// // // // //               <div className="flex items-center gap-2">
// // // // //                 <CreditCard
// // // // //                   size={14}
// // // // //                   className="text-[#5634e4]"
// // // // //                 />
// // // // //                 Secure Payments
// // // // //               </div>
// // // // //             </div>

// // // // //             {/* Buttons */}
// // // // //             <div className="mt-7 flex flex-wrap gap-3">
// // // // //               <button
// // // // //                 type="button"
// // // // //                 onClick={showAllProducts}
// // // // //                 className="inline-flex h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-[#6033e7] to-[#5931e0] px-7 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(91,52,223,0.22)] transition hover:-translate-y-0.5 hover:shadow-xl"
// // // // //               >
// // // // //                 Explore All Products
// // // // //                 <ArrowRight size={16} />
// // // // //               </button>

// // // // //               <button
// // // // //                 type="button"
// // // // //                 onClick={() => {
// // // // //                   setActiveCategory("All");

// // // // //                   setTimeout(() => {
// // // // //                     document
// // // // //                       .getElementById("products")
// // // // //                       ?.scrollIntoView({
// // // // //                         behavior: "smooth",
// // // // //                       });
// // // // //                   }, 50);
// // // // //                 }}
// // // // //                 className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#e4e4ee] bg-white px-7 text-[13px] font-bold text-[#313b58] shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
// // // // //               >
// // // // //                 <Star
// // // // //                   size={16}
// // // // //                   className="text-[#623bdc]"
// // // // //                 />
// // // // //                 Bestsellers
// // // // //               </button>
// // // // //             </div>
// // // // //           </div>

// // // // //           {/* Hero Visual */}
// // // // //           <div className="relative flex items-center justify-center">
// // // // //             <div className="absolute h-[75%] w-[75%] rounded-full bg-purple-300/10 blur-[80px]" />

// // // // //             <img
// // // // //               src="/shop/premium-shop-hero.png"
// // // // //               alt="Tech Talk Hub premium shop"
// // // // //               width={620}
// // // // //               height={370}
// // // // //               className="relative h-auto w-full max-w-[620px] object-contain"
// // // // //             />
// // // // //           </div>
// // // // //         </div>
// // // // //       </section>

// // // // //       {/* =====================================================
// // // // //           BENEFITS
// // // // //       ====================================================== */}
// // // // //       <section className="relative z-10 -mt-4">
// // // // //         <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
// // // // //           <div className="grid overflow-hidden rounded-2xl border border-[#ededf3] bg-white shadow-[0_8px_25px_rgba(23,32,70,0.06)] sm:grid-cols-2 lg:grid-cols-5">
// // // // //             <Benefit
// // // // //               icon={Star}
// // // // //               title="Premium Quality"
// // // // //               subtitle="Carefully crafted products"
// // // // //             />

// // // // //             <Benefit
// // // // //               icon={Download}
// // // // //               title="Fast Delivery"
// // // // //               subtitle="Quick access after purchase"
// // // // //             />

// // // // //             <Benefit
// // // // //               icon={Wrench}
// // // // //               title="Useful Resources"
// // // // //               subtitle="Designed for real learning"
// // // // //             />

// // // // //             <Benefit
// // // // //               icon={CreditCard}
// // // // //               title="Secure Payments"
// // // // //               subtitle="Safe local payments"
// // // // //             />

// // // // //             <Benefit
// // // // //               icon={Headphones}
// // // // //               title="Support"
// // // // //               subtitle="We're here to help"
// // // // //               last
// // // // //             />
// // // // //           </div>
// // // // //         </div>
// // // // //       </section>

// // // // //       {/* =====================================================
// // // // //           SEARCH
// // // // //       ====================================================== */}
// // // // //       <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
// // // // //         <div className="mx-auto max-w-xl">
// // // // //           <div className="relative">
// // // // //             <Search
// // // // //               size={18}
// // // // //               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
// // // // //             />

// // // // //             <input
// // // // //               type="text"
// // // // //               value={search}
// // // // //               onChange={(event) =>
// // // // //                 setSearch(event.target.value)
// // // // //               }
// // // // //               placeholder="Search books, kits, resources..."
// // // // //               className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-purple-300 focus:ring-4 focus:ring-purple-100/60"
// // // // //             />
// // // // //           </div>
// // // // //         </div>
// // // // //       </section>

// // // // //       {/* =====================================================
// // // // //           CATEGORIES
// // // // //       ====================================================== */}
// // // // //       <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-6 lg:px-8">
// // // // //         <div className="mb-5 flex items-center justify-between">
// // // // //           <h2 className="text-lg font-extrabold text-[#151d38]">
// // // // //             Shop by Category
// // // // //           </h2>

// // // // //           <button
// // // // //             type="button"
// // // // //             onClick={() => setActiveCategory("All")}
// // // // //             className="text-[12px] font-bold text-[#5c36df] transition hover:text-purple-800"
// // // // //           >
// // // // //             View All Categories
// // // // //           </button>
// // // // //         </div>

// // // // //         {categories.length > 1 ? (
// // // // //           <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
// // // // //             {categories.slice(1, 7).map(
// // // // //               (category, index) => {
// // // // //                 const Icon = [
// // // // //                   LayoutGrid,
// // // // //                   Code2,
// // // // //                   BookOpen,
// // // // //                   Wrench,
// // // // //                   Sparkles,
// // // // //                   ShoppingCart,
// // // // //                 ][index % 6];

// // // // //                 const count = products.filter(
// // // // //                   (product) =>
// // // // //                     product.category === category
// // // // //                 ).length;

// // // // //                 return (
// // // // //                   <button
// // // // //                     type="button"
// // // // //                     key={category}
// // // // //                     onClick={() =>
// // // // //                       setActiveCategory(category)
// // // // //                     }
// // // // //                     className={`flex min-h-[76px] items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-[0_2px_8px_rgba(20,28,56,0.035)] transition hover:-translate-y-0.5 hover:shadow-md ${
// // // // //                       activeCategory === category
// // // // //                         ? "border-[#8061eb] ring-2 ring-purple-100"
// // // // //                         : "border-[#e7e8ef]"
// // // // //                     }`}
// // // // //                   >
// // // // //                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1ecff] text-[#6944e6]">
// // // // //                       <Icon size={18} />
// // // // //                     </div>

// // // // //                     <div className="min-w-0">
// // // // //                       <p className="truncate text-[12px] font-bold text-[#27314d]">
// // // // //                         {category}
// // // // //                       </p>

// // // // //                       <p className="mt-1 text-[10px] text-[#8690a7]">
// // // // //                         {count}{" "}
// // // // //                         {count === 1
// // // // //                           ? "Product"
// // // // //                           : "Products"}
// // // // //                       </p>
// // // // //                     </div>
// // // // //                   </button>
// // // // //                 );
// // // // //               }
// // // // //             )}
// // // // //           </div>
// // // // //         ) : (
// // // // //           <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
// // // // //             Categories will appear when products are added.
// // // // //           </div>
// // // // //         )}
// // // // //       </section>

// // // // //       {/* =====================================================
// // // // //           PRODUCTS
// // // // //       ====================================================== */}
// // // // //       <section
// // // // //         id="products"
// // // // //         className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-4 pt-10 sm:px-6 lg:px-8"
// // // // //       >
// // // // //         <div className="mb-5 flex items-center justify-between">
// // // // //           <div>
// // // // //             <h2 className="text-lg font-extrabold text-[#151d38]">
// // // // //               {activeCategory === "All"
// // // // //                 ? "Featured Products"
// // // // //                 : activeCategory}
// // // // //             </h2>

// // // // //             {search && (
// // // // //               <p className="mt-1 text-xs text-slate-400">
// // // // //                 Results for &quot;{search}&quot;
// // // // //               </p>
// // // // //             )}
// // // // //           </div>

// // // // //           <button
// // // // //             type="button"
// // // // //             onClick={showAllProducts}
// // // // //             className="text-[12px] font-bold text-[#5c36df] transition hover:text-purple-800"
// // // // //           >
// // // // //             View All Products
// // // // //           </button>
// // // // //         </div>

// // // // //         {loading ? (
// // // // //           <div className="flex min-h-[320px] items-center justify-center">
// // // // //             <Loader2 className="h-7 w-7 animate-spin text-[#5834df]" />
// // // // //           </div>
// // // // //         ) : displayedProducts.length === 0 ? (
// // // // //           <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-center">
// // // // //             <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
// // // // //               <PackageSearch
// // // // //                 size={26}
// // // // //                 className="text-purple-300"
// // // // //               />
// // // // //             </div>

// // // // //             <p className="mt-4 font-bold text-slate-700">
// // // // //               No products found
// // // // //             </p>

// // // // //             <p className="mt-1 text-sm text-slate-400">
// // // // //               Try another category or search.
// // // // //             </p>
// // // // //           </div>
// // // // //         ) : (
// // // // //           <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
// // // // //             {displayedProducts.map((product) => (
// // // // //               <Link
// // // // //                 key={product.id}
// // // // //                 href={`/shop/${product.slug}`}
// // // // //                 className="group overflow-hidden rounded-2xl border border-[#e3e5ec] bg-white shadow-[0_3px_12px_rgba(19,29,58,0.05)] transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
// // // // //               >
// // // // //                 {/* Image */}
// // // // //                 <div className="relative aspect-[4/3] overflow-hidden bg-[#101425]">
// // // // //                   {product.badge && (
// // // // //                     <span className="absolute left-3 top-3 z-10 rounded-full bg-[#ff4b7c] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wide text-white shadow">
// // // // //                       {product.badge}
// // // // //                     </span>
// // // // //                   )}

// // // // //                   {product.image_url ? (
// // // // //                     <img
// // // // //                       src={product.image_url}
// // // // //                       alt={product.name}
// // // // //                       className="h-full w-full object-cover"
// // // // //                     />
// // // // //                   ) : (
// // // // //                     <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#151a37] via-[#25205d] to-[#16162d]">
// // // // //                       <Code2
// // // // //                         size={42}
// // // // //                         className="text-purple-300"
// // // // //                       />
// // // // //                     </div>
// // // // //                   )}
// // // // //                 </div>

// // // // //                 {/* Body */}
// // // // //                 <div className="p-4">
// // // // //                   {product.category && (
// // // // //                     <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-purple-500">
// // // // //                       {product.category}
// // // // //                     </p>
// // // // //                   )}

// // // // //                   <h3 className="line-clamp-2 min-h-[42px] text-[13px] font-bold leading-[1.5] text-[#1e2844] transition group-hover:text-[#5837de]">
// // // // //                     {product.name}
// // // // //                   </h3>

// // // // //                   <div className="mt-2.5 flex items-center gap-1">
// // // // //                     <Star
// // // // //                       size={11}
// // // // //                       className="fill-[#ffad17] text-[#ffad17]"
// // // // //                     />

// // // // //                     <span className="text-[10px] font-bold text-[#3d4864]">
// // // // //                       4.9
// // // // //                     </span>

// // // // //                     <span className="text-[9px] text-[#9ca3b6]">
// // // // //                       (New)
// // // // //                     </span>
// // // // //                   </div>

// // // // //                   <div className="mt-3 flex flex-wrap items-baseline gap-2">
// // // // //                     <span className="text-[15px] font-black text-[#5837de]">
// // // // //                       {money(
// // // // //                         product.price,
// // // // //                         product.currency || "KES"
// // // // //                       )}
// // // // //                     </span>

// // // // //                     {product.compare_at_price && (
// // // // //                       <span className="text-[10px] font-semibold text-[#9fa5b5] line-through">
// // // // //                         {money(
// // // // //                           product.compare_at_price,
// // // // //                           product.currency || "KES"
// // // // //                         )}
// // // // //                       </span>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </Link>
// // // // //             ))}
// // // // //           </div>
// // // // //         )}
// // // // //       </section>

// // // // //       {/* =====================================================
// // // // //           BOTTOM STRIP
// // // // //       ====================================================== */}
// // // // //       <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-6 lg:px-8">
// // // // //         <div className="grid overflow-hidden rounded-2xl bg-gradient-to-r from-[#8066e5] via-[#876ae8] to-[#967ee3] text-white shadow-lg md:grid-cols-[2fr_repeat(4,1fr)]">
// // // // //           <div className="flex min-h-[100px] items-center gap-4 px-7 py-6 lg:px-10">
// // // // //             <span className="text-[44px] font-black leading-none text-white/60">
// // // // //               “
// // // // //             </span>

// // // // //             <p className="max-w-[350px] text-[12px] font-semibold leading-5">
// // // // //               Every purchase supports creative learning and
// // // // //               technology education for young people.
// // // // //             </p>
// // // // //           </div>

// // // // //           <BottomStat
// // // // //             title={`${products.length}+`}
// // // // //             subtitle="Shop Products"
// // // // //           />

// // // // //           <BottomStat
// // // // //             title="KES"
// // // // //             subtitle="Local Pricing"
// // // // //           />

// // // // //           <BottomStat
// // // // //             title="Secure"
// // // // //             subtitle="Payments"
// // // // //           />

// // // // //           <BottomStat
// // // // //             title="100%"
// // // // //             subtitle="Learning Focus"
// // // // //           />
// // // // //         </div>
// // // // //       </section>
// // // // //     </main>
// // // // //   );
// // // // // }

// // // // // function Benefit({
// // // // //   icon: Icon,
// // // // //   title,
// // // // //   subtitle,
// // // // //   last,
// // // // // }) {
// // // // //   return (
// // // // //     <div
// // // // //       className={`flex min-h-[88px] items-center gap-3 px-5 py-4 ${
// // // // //         !last
// // // // //           ? "border-b border-[#eeeeF4] sm:border-r lg:border-b-0"
// // // // //           : ""
// // // // //       }`}
// // // // //     >
// // // // //       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4f0ff] text-[#6442e4]">
// // // // //         <Icon size={18} />
// // // // //       </div>

// // // // //       <div className="min-w-0">
// // // // //         <div className="text-[11px] font-extrabold text-[#202944]">
// // // // //           {title}
// // // // //         </div>

// // // // //         <div className="mt-1 text-[10px] leading-[1.45] text-[#758099]">
// // // // //           {subtitle}
// // // // //         </div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // function BottomStat({ title, subtitle }) {
// // // // //   return (
// // // // //     <div className="flex min-h-[88px] flex-col items-center justify-center border-t border-white/10 px-4 py-5 md:border-l md:border-t-0">
// // // // //       <div className="text-[20px] font-black">
// // // // //         {title}
// // // // //       </div>

// // // // //       <div className="mt-1 text-[10px] text-white/75">
// // // // //         {subtitle}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }