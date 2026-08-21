import { cache } from "react";

import { notFound } from "next/navigation";

import { supabase } from "../../../lib/supabase";

import ProductDetailsClient from "./ProductDetailsClient";

export const revalidate = 60;

const getProduct = cache(async (slug) => {
  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to load product:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return null;
  }

  return data;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    product.short_description ||
    product.description ||
    `Shop ${product.name} at Tech Talk Hub.`;

  const productUrl = `https://techtalk-hub.com/shop/${product.slug}`;

  return {
    title: product.name,

    description,

    alternates: {
      canonical: productUrl,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: `${product.name} | Tech Talk Hub`,

      description,

      url: productUrl,

      siteName: "Tech Talk Hub",

      type: "website",

      ...(product.image_url
        ? {
            images: [
              {
                url: product.image_url,

                alt: product.name,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: product.image_url
        ? "summary_large_image"
        : "summary",

      title: product.name,

      description,

      ...(product.image_url
        ? {
            images: [product.image_url],
          }
        : {}),
    },
  };
}

export default async function ProductDetailsPage({
  params,
}) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const inStock =
    !product.track_inventory ||
    Number(product.stock_quantity || 0) > 0;

  const structuredData = {
    "@context": "https://schema.org",

    "@type": "Product",

    name: product.name,

    description:
      product.short_description ||
      product.description ||
      product.name,

    ...(product.image_url
      ? {
          image: [
            product.image_url,
            ...(product.gallery_urls || []),
          ],
        }
      : {}),

    brand: {
      "@type": "Brand",

      name: "Tech Talk Hub",
    },

    offers: {
      "@type": "Offer",

      url: `https://techtalk-hub.com/shop/${product.slug}`,

      priceCurrency: product.currency || "KES",

      price: Number(product.price || 0),

      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",

      itemCondition:
        "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ).replace(/</g, "\\u003c"),
        }}
      />

      <ProductDetailsClient product={product} />
    </>
  );
}
// "use client";

// import {
//   useEffect,
//   useState,
// } from "react";

// import Link from "next/link";

// import {
//   CheckCircle2,
//   ChevronLeft,
//   CreditCard,
//   Heart,
//   Loader2,
//   Minus,
//   PackageCheck,
//   Plus,
//   ShieldCheck,
//   ShoppingCart,
//   Truck,
// } from "lucide-react";

// import { useParams } from "next/navigation";

// import { supabase } from "../../../lib/supabase";
// import NavBar from "../../../components/NavBar";
// import { useCart } from "../../../components/CartProvider";

// export default function ProductDetailsPage() {
//   const params = useParams();
//   const slug = params?.slug;

//   const {
//     addToCart,
//     incrementItem,
//     decrementItem,
//     getItemQuantity,
//   } = useCart();

//   const [product, setProduct] =
//     useState(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [
//     selectedImage,
//     setSelectedImage,
//   ] = useState("");

//   const [
//     requestedQuantity,
//     setRequestedQuantity,
//   ] = useState(1);

//   const [
//     favorite,
//     setFavorite,
//   ] = useState(false);

//   useEffect(() => {
//     if (slug) {
//       fetchProduct();
//     }
//   }, [slug]);

//   useEffect(() => {
//     if (!product) return;

//     try {
//       const saved = JSON.parse(
//         localStorage.getItem(
//           "shop_favorites"
//         ) || "[]"
//       );

//       setFavorite(
//         Array.isArray(saved) &&
//           saved.includes(product.id)
//       );
//     } catch {
//       setFavorite(false);
//     }
//   }, [product]);

//   async function fetchProduct() {
//     setLoading(true);

//     const { data, error } =
//       await supabase
//         .from("shop_products")
//         .select("*")
//         .eq("slug", slug)
//         .eq("is_active", true)
//         .single();

//     if (error) {
//       console.error(
//         "Product error:",
//         error
//       );

//       setProduct(null);
//     } else {
//       setProduct(data);

//       setSelectedImage(
//         data.image_url ||
//           data.gallery_urls?.[0] ||
//           ""
//       );
//     }

//     setLoading(false);
//   }

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

//   function toggleFavorite() {
//     let saved = [];

//     try {
//       saved = JSON.parse(
//         localStorage.getItem(
//           "shop_favorites"
//         ) || "[]"
//       );

//       if (!Array.isArray(saved)) {
//         saved = [];
//       }
//     } catch {
//       saved = [];
//     }

//     const updated =
//       saved.includes(product.id)
//         ? saved.filter(
//             (id) =>
//               id !== product.id
//           )
//         : [
//             ...saved,
//             product.id,
//           ];

//     localStorage.setItem(
//       "shop_favorites",
//       JSON.stringify(updated)
//     );

//     setFavorite(
//       updated.includes(product.id)
//     );
//   }

//   if (loading) {
//     return (
//       <>
//         <NavBar />

//         <div className="flex min-h-screen items-center justify-center bg-[#fafafe] pt-[76px]">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         </div>
//       </>
//     );
//   }

//   if (!product) {
//     return (
//       <>
//         <NavBar />

//         <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-[76px] text-center">
//           <h1 className="text-3xl font-black">
//             Product not found
//           </h1>

//           <Link
//             href="/shop"
//             className="mt-5 font-bold text-primary"
//           >
//             Return to Shop →
//           </Link>
//         </div>
//       </>
//     );
//   }

//   const inStock =
//     !product.track_inventory ||
//     Number(
//       product.stock_quantity || 0
//     ) > 0;

//   const cartQuantity =
//     getItemQuantity(product.id);

//   const gallery = [
//     product.image_url,
//     ...(product.gallery_urls || []),
//   ].filter(
//     (image, index, array) =>
//       image &&
//       array.indexOf(image) ===
//         index
//   );

//   return (
//     <main className="min-h-screen bg-[#fafafe]">
//       <NavBar />

//       <section className="pt-[100px]">
//         <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
//           <div className="mb-6 flex items-center justify-between">
//             <Link
//               href="/shop"
//               className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"
//             >
//               <ChevronLeft
//                 size={16}
//               />
//               Back to Shop
//             </Link>

//             <button
//               type="button"
//               onClick={
//                 toggleFavorite
//               }
//               className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm"
//             >
//               <Heart
//                 size={16}
//                 className={
//                   favorite
//                     ? "fill-[#ff4b7c] text-[#ff4b7c]"
//                     : ""
//                 }
//               />

//               {favorite
//                 ? "Saved"
//                 : "Save"}
//             </button>
//           </div>

//           <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
//             <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
//               {/* GALLERY */}

//               <div className="border-b border-slate-100 p-5 sm:p-7 lg:border-b-0 lg:border-r">
//                 <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
//                   {product.badge && (
//                     <span className="absolute left-4 top-4 z-10 rounded-full bg-[#ff4b7c] px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-white">
//                       {
//                         product.badge
//                       }
//                     </span>
//                   )}

//                   {selectedImage ? (
//                     <img
//                       src={
//                         selectedImage
//                       }
//                       alt={
//                         product.name
//                       }
//                       className="h-full w-full object-contain p-3"
//                     />
//                   ) : (
//                     <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
//                       <ShoppingCart className="h-20 w-20 text-purple-300" />
//                     </div>
//                   )}
//                 </div>

//                 {gallery.length >
//                   1 && (
//                   <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
//                     {gallery.map(
//                       (image) => (
//                         <button
//                           key={
//                             image
//                           }
//                           type="button"
//                           onClick={() =>
//                             setSelectedImage(
//                               image
//                             )
//                           }
//                           className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 ${
//                             selectedImage ===
//                             image
//                               ? "border-primary"
//                               : "border-transparent"
//                           }`}
//                         >
//                           <img
//                             src={
//                               image
//                             }
//                             alt=""
//                             className="h-full w-full object-cover"
//                           />
//                         </button>
//                       )
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* INFORMATION */}

//               <div className="p-6 sm:p-8 lg:p-10">
//                 <div className="flex flex-wrap items-center gap-2">
//                   {product.category && (
//                     <span className="rounded-full bg-purple-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-primary">
//                       {
//                         product.category
//                       }
//                     </span>
//                   )}

//                   {product.program &&
//                     product.program !==
//                       "general" && (
//                       <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
//                         {product.program.replaceAll(
//                           "-",
//                           " "
//                         )}
//                       </span>
//                     )}
//                 </div>

//                 <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#101936] sm:text-4xl">
//                   {product.name}
//                 </h1>

//                 {product.short_description && (
//                   <p className="mt-4 text-sm leading-7 text-slate-500">
//                     {
//                       product.short_description
//                     }
//                   </p>
//                 )}

//                 <div className="mt-6 rounded-2xl bg-[#faf9ff] p-5">
//                   <div className="flex flex-wrap items-baseline gap-3">
//                     <span className="text-3xl font-black text-primary">
//                       {money(
//                         product.price,
//                         product.currency ||
//                           "KES"
//                       )}
//                     </span>

//                     {product.compare_at_price && (
//                       <span className="text-sm font-semibold text-slate-400 line-through">
//                         {money(
//                           product.compare_at_price,
//                           product.currency ||
//                             "KES"
//                         )}
//                       </span>
//                     )}
//                   </div>

//                   {inStock ? (
//                     <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-600">
//                       <CheckCircle2
//                         size={15}
//                       />
//                       Available to order
//                     </div>
//                   ) : (
//                     <p className="mt-3 text-xs font-bold text-red-500">
//                       Currently
//                       unavailable
//                     </p>
//                   )}
//                 </div>

//                 {/* PURCHASE */}

//                 <div className="mt-7">
//                   {cartQuantity >
//                   0 ? (
//                     <>
//                       <p className="mb-3 text-xs font-bold text-slate-500">
//                         Quantity in
//                         your cart
//                       </p>

//                       <div className="flex flex-col gap-3 sm:flex-row">
//                         <div className="flex h-14 items-center overflow-hidden rounded-xl border border-purple-200 bg-purple-50">
//                           <button
//                             onClick={() =>
//                               decrementItem(
//                                 product.id
//                               )
//                             }
//                             className="flex h-full w-14 items-center justify-center text-primary"
//                           >
//                             <Minus
//                               size={
//                                 17
//                               }
//                             />
//                           </button>

//                           <span className="min-w-[55px] text-center text-sm font-black text-primary">
//                             {
//                               cartQuantity
//                             }
//                           </span>

//                           <button
//                             onClick={() =>
//                               incrementItem(
//                                 product.id
//                               )
//                             }
//                             disabled={
//                               product.track_inventory &&
//                               cartQuantity >=
//                                 Number(
//                                   product.stock_quantity ||
//                                     0
//                                 )
//                             }
//                             className="flex h-full w-14 items-center justify-center text-primary disabled:opacity-30"
//                           >
//                             <Plus
//                               size={
//                                 17
//                               }
//                             />
//                           </button>
//                         </div>

//                         <Link
//                           href="/cart"
//                           className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-purple-200"
//                         >
//                           <ShoppingCart
//                             size={
//                               18
//                             }
//                           />
//                           View Cart
//                         </Link>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       <p className="mb-3 text-xs font-bold text-slate-500">
//                         Quantity
//                       </p>

//                       <div className="flex flex-col gap-3 sm:flex-row">
//                         <div className="flex h-14 items-center overflow-hidden rounded-xl border border-slate-200">
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setRequestedQuantity(
//                                 (
//                                   value
//                                 ) =>
//                                   Math.max(
//                                     1,
//                                     value -
//                                       1
//                                   )
//                               )
//                             }
//                             className="flex h-full w-14 items-center justify-center text-slate-500"
//                           >
//                             <Minus
//                               size={
//                                 17
//                               }
//                             />
//                           </button>

//                           <span className="min-w-[55px] text-center text-sm font-black">
//                             {
//                               requestedQuantity
//                             }
//                           </span>

//                           <button
//                             type="button"
//                             onClick={() => {
//                               if (
//                                 product.track_inventory &&
//                                 requestedQuantity >=
//                                   Number(
//                                     product.stock_quantity ||
//                                       0
//                                   )
//                               ) {
//                                 return;
//                               }

//                               setRequestedQuantity(
//                                 (
//                                   value
//                                 ) =>
//                                   value +
//                                   1
//                               );
//                             }}
//                             className="flex h-full w-14 items-center justify-center text-slate-500"
//                           >
//                             <Plus
//                               size={
//                                 17
//                               }
//                             />
//                           </button>
//                         </div>

//                         <button
//                           type="button"
//                           disabled={
//                             !inStock
//                           }
//                           onClick={() =>
//                             addToCart(
//                               product,
//                               requestedQuantity
//                             )
//                           }
//                           className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 disabled:bg-slate-200"
//                         >
//                           <ShoppingCart
//                             size={
//                               18
//                             }
//                           />
//                           Add to Cart
//                         </button>
//                       </div>
//                     </>
//                   )}
//                 </div>

//                 {/* TRUST */}

//                 <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
//                   <TrustItem
//                     icon={Truck}
//                     title="Delivery"
//                     text="Delivery details confirmed at checkout."
//                   />

//                   <TrustItem
//                     icon={
//                       ShieldCheck
//                     }
//                     title="Secure Checkout"
//                     text="Your order is processed securely."
//                   />

//                   <TrustItem
//                     icon={
//                       PackageCheck
//                     }
//                     title="Quality"
//                     text="Carefully selected learning products."
//                   />

//                   <TrustItem
//                     icon={
//                       CreditCard
//                     }
//                     title="Local Payment"
//                     text="Pay conveniently in Kenya."
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* PRODUCT DETAILS */}

//           <div className="mt-7 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
//             <h2 className="text-xl font-black text-[#101936]">
//               Product Details
//             </h2>

//             {product.description ? (
//               <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-slate-600">
//                 {
//                   product.description
//                 }
//               </p>
//             ) : (
//               <p className="mt-3 text-sm text-slate-400">
//                 More product
//                 information coming
//                 soon.
//               </p>
//             )}
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }

// function TrustItem({
//   icon: Icon,
//   title,
//   text,
// }) {
//   return (
//     <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
//       <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

//       <div>
//         <p className="text-xs font-black text-slate-800">
//           {title}
//         </p>

//         <p className="mt-1 text-[10px] leading-4 text-slate-500">
//           {text}
//         </p>
//       </div>
//     </div>
//   );
// }
// // "use client";

// // import {
// //   useEffect,
// //   useState,
// // } from "react";

// // import {
// //   Check,
// //   CheckCircle2,
// //   ChevronLeft,
// //   Heart,
// //   Loader2,
// //   Minus,
// //   Package,
// //   Plus,
// //   ShieldCheck,
// //   ShoppingCart,
// //   Sparkles,
// //   Truck,
// // } from "lucide-react";

// // import Link from "next/link";
// // import { useParams } from "next/navigation";

// // import { supabase } from "../../../lib/supabase";
// // import NavBar from "../../../components/NavBar";
// // import { useCart } from "../../../components/CartProvider";

// // export default function ProductDetailsPage() {
// //   const params = useParams();
// //   const slug = params?.slug;

// //   const { addToCart } = useCart();

// //   const [product, setProduct] =
// //     useState(null);

// //   const [loading, setLoading] =
// //     useState(true);

// //   const [quantity, setQuantity] =
// //     useState(1);

// //   const [added, setAdded] =
// //     useState(false);

// //   const [favorite, setFavorite] =
// //     useState(false);

// //   const [selectedImage, setSelectedImage] =
// //     useState("");

// //   useEffect(() => {
// //     if (slug) {
// //       fetchProduct();
// //     }
// //   }, [slug]);

// //   async function fetchProduct() {
// //     setLoading(true);

// //     const { data, error } =
// //       await supabase
// //         .from("shop_products")
// //         .select("*")
// //         .eq("slug", slug)
// //         .eq("is_active", true)
// //         .single();

// //     if (error) {
// //       console.error(
// //         "Product error:",
// //         error
// //       );

// //       setProduct(null);
// //     } else {
// //       setProduct(data);

// //       setSelectedImage(
// //         data.image_url || ""
// //       );

// //       try {
// //         const saved =
// //           JSON.parse(
// //             localStorage.getItem(
// //               "shop_favorites"
// //             ) || "[]"
// //           );

// //         setFavorite(
// //           Array.isArray(saved) &&
// //             saved.includes(data.id)
// //         );
// //       } catch {
// //         setFavorite(false);
// //       }
// //     }

// //     setLoading(false);
// //   }

// //   function money(
// //     value,
// //     currency = "KES"
// //   ) {
// //     return new Intl.NumberFormat(
// //       "en-KE",
// //       {
// //         style: "currency",
// //         currency,
// //         maximumFractionDigits: 0,
// //       }
// //     ).format(Number(value || 0));
// //   }

// //   function handleAddToCart() {
// //     if (!product) return;

// //     addToCart(product, quantity);

// //     setAdded(true);

// //     setTimeout(() => {
// //       setAdded(false);
// //     }, 1600);
// //   }

// //   function toggleFavorite() {
// //     if (!product) return;

// //     try {
// //       const saved = JSON.parse(
// //         localStorage.getItem(
// //           "shop_favorites"
// //         ) || "[]"
// //       );

// //       const current =
// //         Array.isArray(saved)
// //           ? saved
// //           : [];

// //       const updated =
// //         current.includes(product.id)
// //           ? current.filter(
// //               (id) =>
// //                 id !== product.id
// //             )
// //           : [
// //               ...current,
// //               product.id,
// //             ];

// //       localStorage.setItem(
// //         "shop_favorites",
// //         JSON.stringify(updated)
// //       );

// //       setFavorite(
// //         updated.includes(product.id)
// //       );
// //     } catch {
// //       // Ignore localStorage error
// //     }
// //   }

// //   if (loading) {
// //     return (
// //       <>
// //         <NavBar />

// //         <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-[76px]">
// //           <Loader2 className="h-8 w-8 animate-spin text-primary" />
// //         </div>
// //       </>
// //     );
// //   }

// //   if (!product) {
// //     return (
// //       <>
// //         <NavBar />

// //         <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 pt-[76px] text-center">
// //           <Package
// //             size={46}
// //             className="text-slate-300"
// //           />

// //           <h1 className="mt-5 text-3xl font-black text-slate-900">
// //             Product not found
// //           </h1>

// //           <Link
// //             href="/shop"
// //             className="mt-5 font-semibold text-primary"
// //           >
// //             Return to Shop →
// //           </Link>
// //         </div>
// //       </>
// //     );
// //   }

// //   const inStock =
// //     !product.track_inventory ||
// //     Number(
// //       product.stock_quantity || 0
// //     ) > 0;

// //   const galleryImages = [
// //     product.image_url,
// //     ...(Array.isArray(
// //       product.gallery_urls
// //     )
// //       ? product.gallery_urls
// //       : []),
// //   ].filter(
// //     (image, index, array) =>
// //       image &&
// //       array.indexOf(image) === index
// //   );

// //   const hasDiscount =
// //     product.compare_at_price &&
// //     Number(product.compare_at_price) >
// //       Number(product.price);

// //   const discountPercentage =
// //     hasDiscount
// //       ? Math.round(
// //           ((Number(
// //             product.compare_at_price
// //           ) -
// //             Number(product.price)) /
// //             Number(
// //               product.compare_at_price
// //             )) *
// //             100
// //         )
// //       : 0;

// //   return (
// //     <main className="min-h-screen bg-[#f7f8fb]">
// //       <NavBar />

// //       <section className="pt-[100px]">
// //         <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">

// //           {/* Breadcrumb */}

// //           <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
// //             <Link
// //               href="/shop"
// //               className="inline-flex items-center gap-1 font-semibold transition hover:text-primary"
// //             >
// //               <ChevronLeft
// //                 size={14}
// //               />
// //               Shop
// //             </Link>

// //             <span>/</span>

// //             {product.category && (
// //               <>
// //                 <span>
// //                   {product.category}
// //                 </span>

// //                 <span>/</span>
// //               </>
// //             )}

// //             <span className="max-w-[250px] truncate font-semibold text-slate-600">
// //               {product.name}
// //             </span>
// //           </div>

// //           {/* PRODUCT CARD */}

// //           <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
// //             <div className="grid lg:grid-cols-[1fr_1.05fr]">

// //               {/* ====================
// //                   IMAGES
// //               ===================== */}

// //               <div className="border-b border-slate-100 p-5 sm:p-7 lg:border-b-0 lg:border-r">
// //                 <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
// //                   {product.badge && (
// //                     <span className="absolute left-4 top-4 z-10 rounded-full bg-secondary px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow">
// //                       {product.badge}
// //                     </span>
// //                   )}

// //                   {hasDiscount && (
// //                     <span className="absolute bottom-4 left-4 z-10 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-black text-white shadow">
// //                       Save{" "}
// //                       {
// //                         discountPercentage
// //                       }
// //                       %
// //                     </span>
// //                   )}

// //                   <button
// //                     type="button"
// //                     onClick={
// //                       toggleFavorite
// //                     }
// //                     className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg transition hover:scale-105 hover:text-[#ff4b7c]"
// //                     aria-label="Favorite product"
// //                   >
// //                     <Heart
// //                       size={20}
// //                       className={
// //                         favorite
// //                           ? "fill-[#ff4b7c] text-[#ff4b7c]"
// //                           : ""
// //                       }
// //                     />
// //                   </button>

// //                   {selectedImage ? (
// //                     <img
// //                       src={selectedImage}
// //                       alt={product.name}
// //                       className="h-full w-full object-contain p-4"
// //                     />
// //                   ) : (
// //                     <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
// //                       <ShoppingCart className="h-20 w-20 text-purple-300" />
// //                     </div>
// //                   )}
// //                 </div>

// //                 {/* THUMBNAILS */}

// //                 {galleryImages.length >
// //                   1 && (
// //                   <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
// //                     {galleryImages.map(
// //                       (
// //                         image,
// //                         index
// //                       ) => (
// //                         <button
// //                           type="button"
// //                           key={`${image}-${index}`}
// //                           onClick={() =>
// //                             setSelectedImage(
// //                               image
// //                             )
// //                           }
// //                           className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition ${
// //                             selectedImage ===
// //                             image
// //                               ? "border-primary"
// //                               : "border-transparent hover:border-purple-200"
// //                           }`}
// //                         >
// //                           <img
// //                             src={image}
// //                             alt={`${product.name} ${index + 1}`}
// //                             className="h-full w-full object-cover"
// //                           />
// //                         </button>
// //                       )
// //                     )}
// //                   </div>
// //                 )}
// //               </div>

// //               {/* ====================
// //                   DETAILS
// //               ===================== */}

// //               <div className="p-6 sm:p-8 lg:p-10">

// //                 {/* Category */}

// //                 <div className="flex flex-wrap items-center gap-2">
// //                   {product.category && (
// //                     <span className="rounded-full bg-purple-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-primary">
// //                       {
// //                         product.category
// //                       }
// //                     </span>
// //                   )}

// //                   {product.program &&
// //                     product.program !==
// //                       "general" && (
// //                       <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold capitalize text-slate-600">
// //                         {product.program.replace(
// //                           /-/g,
// //                           " "
// //                         )}
// //                       </span>
// //                     )}
// //                 </div>

// //                 {/* Name */}

// //                 <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.025em] text-slate-900 sm:text-4xl">
// //                   {product.name}
// //                 </h1>

// //                 {/* Short description */}

// //                 {product.short_description && (
// //                   <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600">
// //                     {
// //                       product.short_description
// //                     }
// //                   </p>
// //                 )}

// //                 {/* Price Box */}

// //                 <div className="mt-7 rounded-2xl bg-[#f8f6ff] p-5">
// //                   <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
// //                     <span className="text-3xl font-black text-primary">
// //                       {money(
// //                         product.price,
// //                         product.currency ||
// //                           "KES"
// //                       )}
// //                     </span>

// //                     {product.compare_at_price && (
// //                       <span className="pb-1 text-sm font-semibold text-slate-400 line-through">
// //                         {money(
// //                           product.compare_at_price,
// //                           product.currency ||
// //                             "KES"
// //                         )}
// //                       </span>
// //                     )}

// //                     {hasDiscount && (
// //                       <span className="mb-1 rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">
// //                         -
// //                         {
// //                           discountPercentage
// //                         }
// //                         %
// //                       </span>
// //                     )}
// //                   </div>
// //                 </div>

// //                 {/* Stock */}

// //                 <div className="mt-5 flex flex-wrap items-center gap-3">
// //                   {inStock ? (
// //                     <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
// //                       <CheckCircle2
// //                         size={14}
// //                       />
// //                       In Stock
// //                     </span>
// //                   ) : (
// //                     <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
// //                       Out of Stock
// //                     </span>
// //                   )}

// //                   {product.track_inventory &&
// //                     inStock && (
// //                       <span className="text-xs font-medium text-slate-400">
// //                         {
// //                           product.stock_quantity
// //                         }{" "}
// //                         available
// //                       </span>
// //                     )}
// //                 </div>

// //                 {/* Quantity */}

// //                 {inStock && (
// //                   <div className="mt-7">
// //                     <p className="mb-3 text-sm font-bold text-slate-700">
// //                       Quantity
// //                     </p>

// //                     <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
// //                       <button
// //                         type="button"
// //                         onClick={() =>
// //                           setQuantity(
// //                             (current) =>
// //                               Math.max(
// //                                 1,
// //                                 current -
// //                                   1
// //                               )
// //                           )
// //                         }
// //                         disabled={
// //                           quantity <= 1
// //                         }
// //                         className="flex h-12 w-12 items-center justify-center text-slate-500 transition hover:bg-purple-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
// //                       >
// //                         <Minus
// //                           size={16}
// //                         />
// //                       </button>

// //                       <span className="flex h-12 min-w-[60px] items-center justify-center border-x border-slate-200 text-sm font-black text-slate-800">
// //                         {quantity}
// //                       </span>

// //                       <button
// //                         type="button"
// //                         onClick={() => {
// //                           if (
// //                             product.track_inventory &&
// //                             quantity >=
// //                               Number(
// //                                 product.stock_quantity ||
// //                                   0
// //                               )
// //                           ) {
// //                             return;
// //                           }

// //                           setQuantity(
// //                             (current) =>
// //                               current +
// //                               1
// //                           );
// //                         }}
// //                         disabled={
// //                           product.track_inventory &&
// //                           quantity >=
// //                             Number(
// //                               product.stock_quantity ||
// //                                 0
// //                             )
// //                         }
// //                         className="flex h-12 w-12 items-center justify-center text-slate-500 transition hover:bg-purple-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
// //                       >
// //                         <Plus
// //                           size={16}
// //                         />
// //                       </button>
// //                     </div>
// //                   </div>
// //                 )}

// //                 {/* CTA */}

// //                 <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
// //                   <button
// //                     type="button"
// //                     disabled={!inStock}
// //                     onClick={
// //                       handleAddToCart
// //                     }
// //                     className={`inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
// //                       added
// //                         ? "bg-emerald-600"
// //                         : "bg-primary shadow-primary/20"
// //                     }`}
// //                   >
// //                     {added ? (
// //                       <>
// //                         <Check
// //                           size={18}
// //                         />
// //                         {quantity} Added
// //                         to Cart
// //                       </>
// //                     ) : (
// //                       <>
// //                         <ShoppingCart
// //                           size={18}
// //                         />
// //                         Add{" "}
// //                         {quantity} to
// //                         Cart
// //                       </>
// //                     )}
// //                   </button>

// //                   <Link
// //                     href="/cart"
// //                     className="inline-flex min-h-[54px] items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-primary"
// //                   >
// //                     View Cart
// //                   </Link>
// //                 </div>

// //                 {/* Trust */}

// //                 <div className="mt-8 grid gap-3 sm:grid-cols-3">
// //                   <TrustItem
// //                     icon={Truck}
// //                     title="Delivery"
// //                     text="Confirmed at checkout"
// //                   />

// //                   <TrustItem
// //                     icon={ShieldCheck}
// //                     title="Secure"
// //                     text="Safe checkout"
// //                   />

// //                   <TrustItem
// //                     icon={Sparkles}
// //                     title="Quality"
// //                     text="Learning focused"
// //                   />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* ========================
// //               PRODUCT INFORMATION
// //           ========================= */}

// //           <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">

// //             {/* Description */}

// //             <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
// //               <h2 className="text-xl font-black text-slate-900">
// //                 Product Details
// //               </h2>

// //               <div className="mt-3 h-1 w-12 rounded-full bg-primary" />

// //               {product.description ? (
// //                 <p className="mt-6 whitespace-pre-line text-sm leading-8 text-slate-600">
// //                   {
// //                     product.description
// //                   }
// //                 </p>
// //               ) : (
// //                 <p className="mt-6 text-sm text-slate-500">
// //                   More information about
// //                   this product will be
// //                   available soon.
// //                 </p>
// //               )}
// //             </div>

// //             {/* Purchase information */}

// //             <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
// //               <h2 className="font-black text-slate-900">
// //                 Purchase Information
// //               </h2>

// //               <div className="mt-5 space-y-5">
// //                 <InfoRow
// //                   icon={Package}
// //                   title="Availability"
// //                   text={
// //                     inStock
// //                       ? "Available to order"
// //                       : "Currently unavailable"
// //                   }
// //                 />

// //                 <InfoRow
// //                   icon={Truck}
// //                   title="Delivery"
// //                   text="Delivery details confirmed during checkout."
// //                 />

// //                 <InfoRow
// //                   icon={ShieldCheck}
// //                   title="Secure Checkout"
// //                   text="Your order information is securely processed."
// //                 />
// //               </div>
// //             </aside>
// //           </div>
// //         </div>
// //       </section>
// //     </main>
// //   );
// // }

// // function TrustItem({
// //   icon: Icon,
// //   title,
// //   text,
// // }) {
// //   return (
// //     <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
// //       <Icon className="h-4 w-4 text-primary" />

// //       <p className="mt-2 text-[11px] font-black text-slate-800">
// //         {title}
// //       </p>

// //       <p className="mt-1 text-[9px] leading-4 text-slate-500">
// //         {text}
// //       </p>
// //     </div>
// //   );
// // }

// // function InfoRow({
// //   icon: Icon,
// //   title,
// //   text,
// // }) {
// //   return (
// //     <div className="flex gap-3">
// //       <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-primary">
// //         <Icon size={16} />
// //       </div>

// //       <div>
// //         <p className="text-xs font-bold text-slate-800">
// //           {title}
// //         </p>

// //         <p className="mt-1 text-[11px] leading-5 text-slate-500">
// //           {text}
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }
// // // "use client";

// // // import {
// // //   useEffect,
// // //   useState,
// // // } from "react";

// // // import {
// // //   Check,
// // //   CheckCircle2,
// // //   ChevronLeft,
// // //   Heart,
// // //   Loader2,
// // //   Minus,
// // //   PackageCheck,
// // //   Plus,
// // //   ShieldCheck,
// // //   ShoppingCart,
// // //   Star,
// // //   Truck,
// // //   Zap,
// // // } from "lucide-react";

// // // import Link from "next/link";

// // // import {
// // //   useParams,
// // //   useRouter,
// // // } from "next/navigation";

// // // import { supabase } from "../../../lib/supabase";
// // // import NavBar from "../../../components/NavBar";
// // // import { useCart } from "../../../components/CartProvider";

// // // export default function ProductDetailsPage() {
// // //   const params = useParams();
// // //   const router = useRouter();

// // //   const slug = params?.slug;

// // //   const { addToCart } = useCart();

// // //   const [product, setProduct] =
// // //     useState(null);

// // //   const [loading, setLoading] =
// // //     useState(true);

// // //   const [quantity, setQuantity] =
// // //     useState(1);

// // //   const [added, setAdded] =
// // //     useState(false);

// // //   const [favorite, setFavorite] =
// // //     useState(false);

// // //   const [selectedImage, setSelectedImage] =
// // //     useState("");

// // //   useEffect(() => {
// // //     if (slug) {
// // //       fetchProduct();
// // //     }
// // //   }, [slug]);

// // //   useEffect(() => {
// // //     if (!product?.id) return;

// // //     try {
// // //       const favorites = JSON.parse(
// // //         localStorage.getItem(
// // //           "tth-favorites"
// // //         ) || "[]"
// // //       );

// // //       setFavorite(
// // //         Array.isArray(favorites) &&
// // //           favorites.includes(product.id)
// // //       );
// // //     } catch {
// // //       setFavorite(false);
// // //     }
// // //   }, [product?.id]);

// // //   async function fetchProduct() {
// // //     setLoading(true);

// // //     const {
// // //       data,
// // //       error,
// // //     } = await supabase
// // //       .from("shop_products")
// // //       .select("*")
// // //       .eq("slug", slug)
// // //       .eq("is_active", true)
// // //       .single();

// // //     if (error) {
// // //       console.error(
// // //         "Product error:",
// // //         error
// // //       );

// // //       setProduct(null);
// // //     } else {
// // //       setProduct(data);

// // //       setSelectedImage(
// // //         data?.image_url || ""
// // //       );
// // //     }

// // //     setLoading(false);
// // //   }

// // //   function money(
// // //     value,
// // //     currency = "KES"
// // //   ) {
// // //     return new Intl.NumberFormat(
// // //       "en-KE",
// // //       {
// // //         style: "currency",
// // //         currency,
// // //         maximumFractionDigits: 0,
// // //       }
// // //     ).format(Number(value || 0));
// // //   }

// // //   function handleAddToCart() {
// // //     if (!product) return;

// // //     addToCart(
// // //       product,
// // //       quantity
// // //     );

// // //     setAdded(true);

// // //     setTimeout(() => {
// // //       setAdded(false);
// // //     }, 1800);
// // //   }

// // //   function handleBuyNow() {
// // //     if (!product) return;

// // //     addToCart(
// // //       product,
// // //       quantity
// // //     );

// // //     router.push("/checkout");
// // //   }

// // //   function toggleFavorite() {
// // //     if (!product) return;

// // //     let favorites = [];

// // //     try {
// // //       favorites = JSON.parse(
// // //         localStorage.getItem(
// // //           "tth-favorites"
// // //         ) || "[]"
// // //       );

// // //       if (!Array.isArray(favorites)) {
// // //         favorites = [];
// // //       }
// // //     } catch {
// // //       favorites = [];
// // //     }

// // //     const next = favorites.includes(
// // //       product.id
// // //     )
// // //       ? favorites.filter(
// // //           (id) => id !== product.id
// // //         )
// // //       : [
// // //           ...favorites,
// // //           product.id,
// // //         ];

// // //     localStorage.setItem(
// // //       "tth-favorites",
// // //       JSON.stringify(next)
// // //     );

// // //     setFavorite(
// // //       next.includes(product.id)
// // //     );
// // //   }

// // //   if (loading) {
// // //     return (
// // //       <>
// // //         <NavBar />

// // //         <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-[76px]">
// // //           <Loader2 className="h-8 w-8 animate-spin text-primary" />
// // //         </div>
// // //       </>
// // //     );
// // //   }

// // //   if (!product) {
// // //     return (
// // //       <>
// // //         <NavBar />

// // //         <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 pt-[76px] text-center">
// // //           <h1 className="text-3xl font-black text-slate-900">
// // //             Product not found
// // //           </h1>

// // //           <p className="mt-2 text-sm text-slate-500">
// // //             This product may no longer be available.
// // //           </p>

// // //           <Link
// // //             href="/shop"
// // //             className="mt-5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white"
// // //           >
// // //             Return to Shop
// // //           </Link>
// // //         </div>
// // //       </>
// // //     );
// // //   }

// // //   const inStock =
// // //     !product.track_inventory ||
// // //     Number(product.stock_quantity) > 0;

// // //   const gallery = [
// // //     product.image_url,
// // //     ...(Array.isArray(
// // //       product.gallery_urls
// // //     )
// // //       ? product.gallery_urls
// // //       : []),
// // //   ].filter(
// // //     (image, index, array) =>
// // //       image &&
// // //       array.indexOf(image) === index
// // //   );

// // //   return (
// // //     <main className="min-h-screen bg-[#fafbfe]">
// // //       <NavBar />

// // //       <section className="pt-[100px]">
// // //         <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
// // //           {/* BREADCRUMB */}

// // //           <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
// // //             <Link
// // //               href="/shop"
// // //               className="font-semibold transition hover:text-primary"
// // //             >
// // //               Shop
// // //             </Link>

// // //             <span>/</span>

// // //             {product.category && (
// // //               <>
// // //                 <span>
// // //                   {product.category}
// // //                 </span>

// // //                 <span>/</span>
// // //               </>
// // //             )}

// // //             <span className="max-w-[240px] truncate font-semibold text-slate-600">
// // //               {product.name}
// // //             </span>
// // //           </div>

// // //           <Link
// // //             href="/shop"
// // //             className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
// // //           >
// // //             <ChevronLeft size={16} />
// // //             Back to Shop
// // //           </Link>

// // //           {/* =================================================
// // //               MAIN PRODUCT
// // //           ================================================= */}

// // //           <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
// // //             {/* ===============================================
// // //                 PRODUCT MEDIA
// // //             =============================================== */}

// // //             <div>
// // //               <div className="relative aspect-square overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
// // //                 {product.badge && (
// // //                   <span className="absolute left-5 top-5 z-10 rounded-full bg-secondary px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow">
// // //                     {product.badge}
// // //                   </span>
// // //                 )}

// // //                 {/* FAVORITE */}

// // //                 <button
// // //                   type="button"
// // //                   onClick={toggleFavorite}
// // //                   aria-label={
// // //                     favorite
// // //                       ? "Remove from favorites"
// // //                       : "Add to favorites"
// // //                   }
// // //                   className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg ring-1 ring-slate-100 transition hover:scale-105 hover:text-[#ff4c83]"
// // //                 >
// // //                   <Heart
// // //                     size={20}
// // //                     className={
// // //                       favorite
// // //                         ? "fill-[#ff4c83] text-[#ff4c83]"
// // //                         : ""
// // //                     }
// // //                   />
// // //                 </button>

// // //                 {selectedImage ? (
// // //                   <img
// // //                     src={selectedImage}
// // //                     alt={product.name}
// // //                     className="h-full w-full object-contain p-4 sm:p-6"
// // //                   />
// // //                 ) : (
// // //                   <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
// // //                     <ShoppingCart className="h-20 w-20 text-purple-300" />
// // //                   </div>
// // //                 )}
// // //               </div>

// // //               {/* GALLERY */}

// // //               {gallery.length > 1 && (
// // //                 <div className="mt-4 grid grid-cols-5 gap-3">
// // //                   {gallery
// // //                     .slice(0, 5)
// // //                     .map((image) => {
// // //                       const selected =
// // //                         selectedImage ===
// // //                         image;

// // //                       return (
// // //                         <button
// // //                           type="button"
// // //                           key={image}
// // //                           onClick={() =>
// // //                             setSelectedImage(
// // //                               image
// // //                             )
// // //                           }
// // //                           className={`aspect-square overflow-hidden rounded-xl border bg-white p-1 transition ${
// // //                             selected
// // //                               ? "border-primary ring-2 ring-purple-100"
// // //                               : "border-slate-200 hover:border-purple-300"
// // //                           }`}
// // //                         >
// // //                           <img
// // //                             src={image}
// // //                             alt={product.name}
// // //                             className="h-full w-full rounded-lg object-cover"
// // //                           />
// // //                         </button>
// // //                       );
// // //                     })}
// // //                 </div>
// // //               )}
// // //             </div>

// // //             {/* ===============================================
// // //                 PRODUCT INFORMATION
// // //             =============================================== */}

// // //             <div>
// // //               <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
// // //                 {product.category && (
// // //                   <p className="text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
// // //                     {product.category}
// // //                   </p>
// // //                 )}

// // //                 <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
// // //                   {product.name}
// // //                 </h1>

// // //                 {/* RATING */}

// // //                 <div className="mt-4 flex flex-wrap items-center gap-2">
// // //                   <div className="flex items-center gap-0.5">
// // //                     {[
// // //                       1,
// // //                       2,
// // //                       3,
// // //                       4,
// // //                       5,
// // //                     ].map((star) => (
// // //                       <Star
// // //                         key={star}
// // //                         size={15}
// // //                         className="fill-amber-400 text-amber-400"
// // //                       />
// // //                     ))}
// // //                   </div>

// // //                   <span className="text-sm font-bold text-slate-700">
// // //                     4.9
// // //                   </span>

// // //                   <span className="text-xs text-slate-400">
// // //                     New product
// // //                   </span>
// // //                 </div>

// // //                 {/* SHORT DESCRIPTION */}

// // //                 {product.short_description && (
// // //                   <p className="mt-5 text-[15px] leading-7 text-slate-600">
// // //                     {
// // //                       product.short_description
// // //                     }
// // //                   </p>
// // //                 )}

// // //                 {/* PRICE */}

// // //                 <div className="mt-6 rounded-2xl bg-gradient-to-r from-purple-50 to-fuchsia-50/50 p-5">
// // //                   <div className="flex flex-wrap items-baseline gap-3">
// // //                     <span className="text-3xl font-black text-primary">
// // //                       {money(
// // //                         product.price,
// // //                         product.currency ||
// // //                           "KES"
// // //                       )}
// // //                     </span>

// // //                     {product.compare_at_price && (
// // //                       <span className="font-semibold text-slate-400 line-through">
// // //                         {money(
// // //                           product.compare_at_price,
// // //                           product.currency ||
// // //                             "KES"
// // //                         )}
// // //                       </span>
// // //                     )}
// // //                   </div>
// // //                 </div>

// // //                 {/* STOCK */}

// // //                 <div className="mt-5 flex flex-wrap items-center gap-3">
// // //                   {inStock ? (
// // //                     <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
// // //                       <CheckCircle2
// // //                         size={14}
// // //                       />
// // //                       In Stock
// // //                     </span>
// // //                   ) : (
// // //                     <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
// // //                       Out of Stock
// // //                     </span>
// // //                   )}

// // //                   {product.track_inventory &&
// // //                     inStock &&
// // //                     Number(
// // //                       product.stock_quantity
// // //                     ) <= 5 && (
// // //                       <span className="text-xs font-semibold text-amber-600">
// // //                         Only{" "}
// // //                         {
// // //                           product.stock_quantity
// // //                         }{" "}
// // //                         left
// // //                       </span>
// // //                     )}
// // //                 </div>

// // //                 {/* QUANTITY */}

// // //                 <div className="mt-7 flex items-center justify-between gap-4 border-y border-slate-100 py-5">
// // //                   <div>
// // //                     <p className="text-sm font-bold text-slate-800">
// // //                       Quantity
// // //                     </p>

// // //                     <p className="mt-1 text-xs text-slate-400">
// // //                       Select how many you
// // //                       need
// // //                     </p>
// // //                   </div>

// // //                   <div className="inline-flex shrink-0 items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
// // //                     <button
// // //                       type="button"
// // //                       aria-label="Decrease quantity"
// // //                       onClick={() =>
// // //                         setQuantity(
// // //                           (q) =>
// // //                             Math.max(
// // //                               1,
// // //                               q - 1
// // //                             )
// // //                         )
// // //                       }
// // //                       className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:bg-slate-50"
// // //                     >
// // //                       <Minus
// // //                         size={16}
// // //                       />
// // //                     </button>

// // //                     <span className="min-w-[48px] text-center text-sm font-black text-slate-900">
// // //                       {quantity}
// // //                     </span>

// // //                     <button
// // //                       type="button"
// // //                       aria-label="Increase quantity"
// // //                       onClick={() => {
// // //                         if (
// // //                           product.track_inventory &&
// // //                           quantity >=
// // //                             Number(
// // //                               product.stock_quantity
// // //                             )
// // //                         ) {
// // //                           return;
// // //                         }

// // //                         setQuantity(
// // //                           (q) => q + 1
// // //                         );
// // //                       }}
// // //                       className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:bg-slate-50"
// // //                     >
// // //                       <Plus
// // //                         size={16}
// // //                       />
// // //                     </button>
// // //                   </div>
// // //                 </div>

// // //                 {/* ACTIONS */}

// // //                 <div className="mt-6 grid gap-3 sm:grid-cols-2">
// // //                   <button
// // //                     type="button"
// // //                     disabled={!inStock}
// // //                     onClick={
// // //                       handleAddToCart
// // //                     }
// // //                     className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
// // //                       added
// // //                         ? "border-emerald-500 bg-emerald-500 text-white"
// // //                         : "border-primary bg-white text-primary hover:bg-purple-50"
// // //                     }`}
// // //                   >
// // //                     {added ? (
// // //                       <>
// // //                         <Check
// // //                           size={18}
// // //                         />
// // //                         Added to Cart
// // //                       </>
// // //                     ) : (
// // //                       <>
// // //                         <ShoppingCart
// // //                           size={18}
// // //                         />
// // //                         Add to Cart
// // //                       </>
// // //                     )}
// // //                   </button>

// // //                   <button
// // //                     type="button"
// // //                     disabled={!inStock}
// // //                     onClick={
// // //                       handleBuyNow
// // //                     }
// // //                     className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-4 text-sm font-black text-white shadow-lg shadow-secondary/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
// // //                   >
// // //                     <Zap size={18} />
// // //                     Buy Now
// // //                   </button>
// // //                 </div>

// // //                 {/* FAVORITE BUTTON */}

// // //                 <button
// // //                   type="button"
// // //                   onClick={
// // //                     toggleFavorite
// // //                   }
// // //                   className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
// // //                     favorite
// // //                       ? "bg-rose-50 text-[#ff4c83]"
// // //                       : "bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-[#ff4c83]"
// // //                   }`}
// // //                 >
// // //                   <Heart
// // //                     size={17}
// // //                     className={
// // //                       favorite
// // //                         ? "fill-[#ff4c83] text-[#ff4c83]"
// // //                         : ""
// // //                     }
// // //                   />

// // //                   {favorite
// // //                     ? "Saved to Favorites"
// // //                     : "Save to Favorites"}
// // //                 </button>

// // //                 {/* VIEW CART */}

// // //                 {added && (
// // //                   <Link
// // //                     href="/cart"
// // //                     className="mt-3 block text-center text-xs font-bold text-primary transition hover:text-secondary"
// // //                   >
// // //                     View Cart →
// // //                   </Link>
// // //                 )}
// // //               </div>

// // //               {/* ===============================================
// // //                   DELIVERY / TRUST
// // //               =============================================== */}

// // //               <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
// // //                 <div className="flex gap-4 border-b border-slate-100 p-5">
// // //                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
// // //                     <Truck className="h-5 w-5 text-primary" />
// // //                   </div>

// // //                   <div>
// // //                     <p className="text-sm font-bold text-slate-800">
// // //                       Delivery
// // //                     </p>

// // //                     <p className="mt-1 text-xs leading-5 text-slate-500">
// // //                       Enter your delivery
// // //                       location during
// // //                       checkout. Delivery
// // //                       details and fees are
// // //                       confirmed before your
// // //                       order is completed.
// // //                     </p>
// // //                   </div>
// // //                 </div>

// // //                 <div className="flex gap-4 border-b border-slate-100 p-5">
// // //                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
// // //                     <ShieldCheck className="h-5 w-5 text-primary" />
// // //                   </div>

// // //                   <div>
// // //                     <p className="text-sm font-bold text-slate-800">
// // //                       Secure Checkout
// // //                     </p>

// // //                     <p className="mt-1 text-xs leading-5 text-slate-500">
// // //                       Your order and payment
// // //                       details are securely
// // //                       processed.
// // //                     </p>
// // //                   </div>
// // //                 </div>

// // //                 <div className="flex gap-4 p-5">
// // //                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
// // //                     <PackageCheck className="h-5 w-5 text-primary" />
// // //                   </div>

// // //                   <div>
// // //                     <p className="text-sm font-bold text-slate-800">
// // //                       Tech Talk Hub Quality
// // //                     </p>

// // //                     <p className="mt-1 text-xs leading-5 text-slate-500">
// // //                       Carefully selected
// // //                       learning products
// // //                       designed to support
// // //                       young creators.
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* =================================================
// // //               FULL PRODUCT DESCRIPTION
// // //           ================================================= */}

// // //           {product.description && (
// // //             <section className="mt-12 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
// // //               <p className="text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
// // //                 About this product
// // //               </p>

// // //               <h2 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
// // //                 Product Details
// // //               </h2>

// // //               <div className="mt-4 h-1 w-12 rounded-full bg-secondary" />

// // //               <p className="mt-6 max-w-4xl whitespace-pre-line text-sm leading-8 text-slate-600">
// // //                 {product.description}
// // //               </p>
// // //             </section>
// // //           )}

// // //           {/* =================================================
// // //               SHOP AGAIN
// // //           ================================================= */}

// // //           <div className="mt-8 flex justify-center">
// // //             <Link
// // //               href="/shop"
// // //               className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-primary"
// // //             >
// // //               <ChevronLeft size={16} />
// // //               Continue Shopping
// // //             </Link>
// // //           </div>
// // //         </div>
// // //       </section>
// // //     </main>
// // //   );
// // // }
// // // // "use client";

// // // // import {
// // // //   useEffect,
// // // //   useState,
// // // // } from "react";

// // // // import {
// // // //   CheckCircle2,
// // // //   ChevronLeft,
// // // //   Loader2,
// // // //   Minus,
// // // //   Plus,
// // // //   ShoppingCart,
// // // //   Truck,
// // // //   ShieldCheck,
// // // // } from "lucide-react";

// // // // import Link from "next/link";
// // // // import { useParams } from "next/navigation";

// // // // import { supabase } from "../../../lib/supabase";
// // // // import NavBar from "../../../components/NavBar";
// // // // import { useCart } from "../../../components/CartProvider";

// // // // export default function ProductDetailsPage() {
// // // //   const params = useParams();
// // // //   const slug = params?.slug;

// // // //   const {
// // // //     addToCart,
// // // //   } = useCart();

// // // //   const [product, setProduct] =
// // // //     useState(null);

// // // //   const [loading, setLoading] =
// // // //     useState(true);

// // // //   const [quantity, setQuantity] =
// // // //     useState(1);

// // // //   const [added, setAdded] =
// // // //     useState(false);

// // // //   useEffect(() => {
// // // //     if (slug) {
// // // //       fetchProduct();
// // // //     }
// // // //   }, [slug]);

// // // //   async function fetchProduct() {
// // // //     setLoading(true);

// // // //     const {
// // // //       data,
// // // //       error,
// // // //     } = await supabase
// // // //       .from("shop_products")
// // // //       .select("*")
// // // //       .eq("slug", slug)
// // // //       .eq("is_active", true)
// // // //       .single();

// // // //     if (error) {
// // // //       console.error(
// // // //         "Product error:",
// // // //         error
// // // //       );

// // // //       setProduct(null);
// // // //     } else {
// // // //       setProduct(data);
// // // //     }

// // // //     setLoading(false);
// // // //   }

// // // //   function money(
// // // //     value,
// // // //     currency = "KES"
// // // //   ) {
// // // //     return new Intl.NumberFormat(
// // // //       "en-KE",
// // // //       {
// // // //         style: "currency",
// // // //         currency,
// // // //         maximumFractionDigits: 0,
// // // //       }
// // // //     ).format(Number(value || 0));
// // // //   }

// // // //   function handleAddToCart() {
// // // //     addToCart(
// // // //       product,
// // // //       quantity
// // // //     );

// // // //     setAdded(true);

// // // //     setTimeout(
// // // //       () => setAdded(false),
// // // //       1800
// // // //     );
// // // //   }

// // // //   if (loading) {
// // // //     return (
// // // //       <>
// // // //         <NavBar />

// // // //         <div className="flex min-h-screen items-center justify-center pt-[76px]">
// // // //           <Loader2 className="h-8 w-8 animate-spin text-primary" />
// // // //         </div>
// // // //       </>
// // // //     );
// // // //   }

// // // //   if (!product) {
// // // //     return (
// // // //       <>
// // // //         <NavBar />

// // // //         <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-[76px] text-center">
// // // //           <h1 className="text-3xl font-black text-slate-900">
// // // //             Product not found
// // // //           </h1>

// // // //           <Link
// // // //             href="/shop"
// // // //             className="mt-5 font-semibold text-primary"
// // // //           >
// // // //             Return to Shop →
// // // //           </Link>
// // // //         </div>
// // // //       </>
// // // //     );
// // // //   }

// // // //   const inStock =
// // // //     !product.track_inventory ||
// // // //     product.stock_quantity > 0;

// // // //   return (
// // // //     <main className="min-h-screen bg-white">
// // // //       <NavBar />

// // // //       <section className="pt-[100px]">
// // // //         <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
// // // //           <Link
// // // //             href="/shop"
// // // //             className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
// // // //           >
// // // //             <ChevronLeft size={16} />
// // // //             Back to Shop
// // // //           </Link>

// // // //           <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
// // // //             {/* Image */}
// // // //             <div>
// // // //               <div className="relative aspect-square overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50">
// // // //                 {product.badge && (
// // // //                   <span className="absolute left-5 top-5 z-10 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold uppercase text-white shadow">
// // // //                     {product.badge}
// // // //                   </span>
// // // //                 )}

// // // //                 {product.image_url ? (
// // // //                   <img
// // // //                     src={product.image_url}
// // // //                     alt={product.name}
// // // //                     className="h-full w-full object-cover"
// // // //                   />
// // // //                 ) : (
// // // //                   <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
// // // //                     <ShoppingCart className="h-20 w-20 text-purple-300" />
// // // //                   </div>
// // // //                 )}
// // // //               </div>

// // // //               {product.gallery_urls?.length > 0 && (
// // // //                 <div className="mt-4 grid grid-cols-4 gap-3">
// // // //                   {product.gallery_urls
// // // //                     .slice(0, 4)
// // // //                     .map((image) => (
// // // //                       <div
// // // //                         key={image}
// // // //                         className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
// // // //                       >
// // // //                         <img
// // // //                           src={image}
// // // //                           alt={product.name}
// // // //                           className="h-full w-full object-cover"
// // // //                         />
// // // //                       </div>
// // // //                     ))}
// // // //                 </div>
// // // //               )}
// // // //             </div>

// // // //             {/* Details */}
// // // //             <div className="flex flex-col justify-center">
// // // //               <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
// // // //                 {product.category}
// // // //               </p>

// // // //               <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
// // // //                 {product.name}
// // // //               </h1>

// // // //               {product.short_description && (
// // // //                 <p className="mt-4 text-base leading-7 text-slate-600">
// // // //                   {product.short_description}
// // // //                 </p>
// // // //               )}

// // // //               <div className="mt-6 flex items-baseline gap-3">
// // // //                 <span className="text-3xl font-black text-primary">
// // // //                   {money(
// // // //                     product.price,
// // // //                     product.currency ||
// // // //                       "KES"
// // // //                   )}
// // // //                 </span>

// // // //                 {product.compare_at_price && (
// // // //                   <span className="text-base font-semibold text-slate-400 line-through">
// // // //                     {money(
// // // //                       product.compare_at_price,
// // // //                       product.currency ||
// // // //                         "KES"
// // // //                     )}
// // // //                   </span>
// // // //                 )}
// // // //               </div>

// // // //               <div className="mt-5">
// // // //                 {inStock ? (
// // // //                   <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
// // // //                     <CheckCircle2 size={14} />
// // // //                     In Stock
// // // //                   </span>
// // // //                 ) : (
// // // //                   <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
// // // //                     Out of Stock
// // // //                   </span>
// // // //                 )}
// // // //               </div>

// // // //               {product.description && (
// // // //                 <div className="mt-7 border-t border-slate-100 pt-7">
// // // //                   <h2 className="font-extrabold text-slate-900">
// // // //                     Product Details
// // // //                   </h2>

// // // //                   <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
// // // //                     {product.description}
// // // //                   </p>
// // // //                 </div>
// // // //               )}

// // // //               {/* Quantity */}
// // // //               <div className="mt-8">
// // // //                 <p className="mb-3 text-sm font-bold text-slate-700">
// // // //                   Quantity
// // // //                 </p>

// // // //                 <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
// // // //                   <button
// // // //                     type="button"
// // // //                     onClick={() =>
// // // //                       setQuantity((q) =>
// // // //                         Math.max(
// // // //                           1,
// // // //                           q - 1
// // // //                         )
// // // //                       )
// // // //                     }
// // // //                     className="flex h-11 w-11 items-center justify-center text-slate-500 transition hover:bg-slate-50"
// // // //                   >
// // // //                     <Minus size={16} />
// // // //                   </button>

// // // //                   <span className="min-w-[50px] text-center text-sm font-bold">
// // // //                     {quantity}
// // // //                   </span>

// // // //                   <button
// // // //                     type="button"
// // // //                     onClick={() => {
// // // //                       if (
// // // //                         product.track_inventory &&
// // // //                         quantity >=
// // // //                           product.stock_quantity
// // // //                       ) {
// // // //                         return;
// // // //                       }

// // // //                       setQuantity(
// // // //                         (q) => q + 1
// // // //                       );
// // // //                     }}
// // // //                     className="flex h-11 w-11 items-center justify-center text-slate-500 transition hover:bg-slate-50"
// // // //                   >
// // // //                     <Plus size={16} />
// // // //                   </button>
// // // //                 </div>
// // // //               </div>

// // // //               {/* CTA */}
// // // //               <div className="mt-8 grid gap-3 sm:grid-cols-2">
// // // //                 <button
// // // //                   type="button"
// // // //                   disabled={!inStock}
// // // //                   onClick={handleAddToCart}
// // // //                   className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
// // // //                 >
// // // //                   <ShoppingCart size={18} />

// // // //                   {added
// // // //                     ? "Added!"
// // // //                     : "Add to Cart"}
// // // //                 </button>

// // // //                 <Link
// // // //                   href="/cart"
// // // //                   className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-800 transition hover:bg-purple-50"
// // // //                 >
// // // //                   View Cart
// // // //                 </Link>
// // // //               </div>

// // // //               {/* Trust */}
// // // //               <div className="mt-8 grid gap-3 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
// // // //                 <div className="flex items-start gap-3">
// // // //                   <Truck className="mt-0.5 h-5 w-5 text-primary" />

// // // //                   <div>
// // // //                     <p className="text-sm font-bold text-slate-800">
// // // //                       Delivery
// // // //                     </p>

// // // //                     <p className="mt-1 text-xs leading-5 text-slate-500">
// // // //                       Delivery details confirmed during checkout.
// // // //                     </p>
// // // //                   </div>
// // // //                 </div>

// // // //                 <div className="flex items-start gap-3">
// // // //                   <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />

// // // //                   <div>
// // // //                     <p className="text-sm font-bold text-slate-800">
// // // //                       Secure Checkout
// // // //                     </p>

// // // //                     <p className="mt-1 text-xs leading-5 text-slate-500">
// // // //                       Your order details are securely processed.
// // // //                     </p>
// // // //                   </div>
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </section>
// // // //     </main>
// // // //   );
// // // // }