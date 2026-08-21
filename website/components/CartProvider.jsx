
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("tech-talk-cart") || "[]"
      );

      setItems(Array.isArray(saved) ? saved : []);
    } catch {
      setItems([]);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      "tech-talk-cart",
      JSON.stringify(items)
    );
  }, [items, hydrated]);

  function getMaximumQuantity(item) {
    if (!item.track_inventory) {
      return Infinity;
    }

    return Math.max(
      0,
      Number(item.stock_quantity || 0)
    );
  }

  function addToCart(product, quantity = 1) {
    const amount = Math.max(
      1,
      Number(quantity || 1)
    );

    setItems((current) => {
      const existing = current.find(
        (item) => item.id === product.id
      );

      const maximum = product.track_inventory
        ? Math.max(
            0,
            Number(product.stock_quantity || 0)
          )
        : Infinity;

      if (maximum === 0) {
        return current;
      }

      if (existing) {
        const newQuantity = Math.min(
          Number(existing.quantity || 0) + amount,
          maximum
        );

        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                slug: product.slug,
                name: product.name,
                price: Number(product.price),
                currency: product.currency || "KES",
                image_url: product.image_url,
                stock_quantity:
                  product.stock_quantity ?? null,
                track_inventory: Boolean(
                  product.track_inventory
                ),
                quantity: newQuantity,
              }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: Number(product.price),
          currency: product.currency || "KES",
          image_url: product.image_url,
          stock_quantity:
            product.stock_quantity ?? null,
          track_inventory: Boolean(
            product.track_inventory
          ),
          quantity: Math.min(amount, maximum),
        },
      ];
    });
  }

  function removeFromCart(productId) {
    setItems((current) =>
      current.filter(
        (item) => item.id !== productId
      )
    );
  }

  function updateQuantity(productId, quantity) {
    const requestedQuantity = Number(quantity);

    if (requestedQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((current) =>
      current.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const maximum = getMaximumQuantity(item);

        return {
          ...item,
          quantity: Math.min(
            requestedQuantity,
            maximum
          ),
        };
      })
    );
  }

  function incrementItem(productId) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const maximum = getMaximumQuantity(item);

        return {
          ...item,
          quantity: Math.min(
            Number(item.quantity || 0) + 1,
            maximum
          ),
        };
      })
    );
  }

  function decrementItem(productId) {
    setItems((current) =>
      current
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          const nextQuantity =
            Number(item.quantity || 0) - 1;

          if (nextQuantity <= 0) {
            return null;
          }

          return {
            ...item,
            quantity: nextQuantity,
          };
        })
        .filter(Boolean)
    );
  }

  function getItemQuantity(productId) {
    const item = items.find(
      (item) => item.id === productId
    );

    return Number(item?.quantity || 0);
  }

  function isInCart(productId) {
    return items.some(
      (item) => item.id === productId
    );
  }

  function clearCart() {
    setItems([]);
  }

  // Counts PRODUCT TYPES, not total quantity.
  // 5 books = 1 cart item.
  // 5 books + 3 kits = 2 cart items.
  const cartCount = useMemo(
    () => items.length,
    [items]
  );

  // Actual number of physical units.
  const totalUnits = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0
      ),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        hydrated,

        cartCount,
        totalUnits,
        subtotal,

        addToCart,
        removeFromCart,
        updateQuantity,
        incrementItem,
        decrementItem,
        getItemQuantity,
        isInCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}

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
// "use client";

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// const CartContext = createContext(null);

// export function CartProvider({ children }) {
//   const [items, setItems] = useState([]);
//   const [hydrated, setHydrated] = useState(false);

//   useEffect(() => {
//     const saved = localStorage.getItem("tech-talk-cart");

//     if (saved) {
//       try {
//         setItems(JSON.parse(saved));
//       } catch {
//         setItems([]);
//       }
//     }

//     setHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!hydrated) return;

//     localStorage.setItem(
//       "tech-talk-cart",
//       JSON.stringify(items)
//     );
//   }, [items, hydrated]);

//   function addToCart(product, quantity = 1) {
//     setItems((current) => {
//       const existing = current.find(
//         (item) => item.id === product.id
//       );

//       if (existing) {
//         return current.map((item) =>
//           item.id === product.id
//             ? {
//                 ...item,
//                 quantity:
//                   item.quantity + quantity,
//               }
//             : item
//         );
//       }

//       return [
//         ...current,
//         {
//           id: product.id,
//           slug: product.slug,
//           name: product.name,
//           price: Number(product.price),
//           currency: product.currency || "KES",
//           image_url: product.image_url,
//           stock_quantity:
//             product.stock_quantity ?? null,
//           quantity,
//         },
//       ];
//     });
//   }

//   function removeFromCart(productId) {
//     setItems((current) =>
//       current.filter(
//         (item) => item.id !== productId
//       )
//     );
//   }

//   function updateQuantity(productId, quantity) {
//     if (quantity <= 0) {
//       removeFromCart(productId);
//       return;
//     }

//     setItems((current) =>
//       current.map((item) =>
//         item.id === productId
//           ? {
//               ...item,
//               quantity,
//             }
//           : item
//       )
//     );
//   }

//   function clearCart() {
//     setItems([]);
//   }

//   const cartCount = useMemo(
//     () =>
//       items.reduce(
//         (total, item) =>
//           total + item.quantity,
//         0
//       ),
//     [items]
//   );

//   const subtotal = useMemo(
//     () =>
//       items.reduce(
//         (total, item) =>
//           total +
//           Number(item.price) *
//             item.quantity,
//         0
//       ),
//     [items]
//   );

//   return (
//     <CartContext.Provider
//       value={{
//         items,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         clearCart,
//         cartCount,
//         subtotal,
//         hydrated,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);

//   if (!context) {
//     throw new Error(
//       "useCart must be used inside CartProvider"
//     );
//   }

//   return context;
// }