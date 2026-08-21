"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  Heart,
  Menu,
  ShoppingCart,
  X,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";

import { usePathname } from "next/navigation";

import { useCart } from "./CartProvider";

export default function NavBar() {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  const [
    coursesDropdownOpen,
    setCoursesDropdownOpen,
  ] = useState(false);

  const [
    favoriteCount,
    setFavoriteCount,
  ] = useState(0);

  const pathname =
    usePathname();

  const {
    cartCount,
    hydrated,
  } = useCart();

  const isCommercePage =
    pathname?.startsWith(
      "/shop"
    ) ||
    pathname?.startsWith(
      "/cart"
    ) ||
    pathname?.startsWith(
      "/checkout"
    ) ||
    pathname?.startsWith(
      "/favorites"
    ) ||
    pathname?.startsWith(
      "/order-confirmation"
    );

  const dropdownRef =
    useRef(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(
        window.scrollY > 12
      );
    }

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  useEffect(() => {
    function loadFavorites() {
      try {
        const saved =
          JSON.parse(
            localStorage.getItem(
              "shop_favorites"
            ) || "[]"
          );

        setFavoriteCount(
          Array.isArray(saved)
            ? saved.length
            : 0
        );
      } catch {
        setFavoriteCount(0);
      }
    }

    loadFavorites();

    window.addEventListener(
      "storage",
      loadFavorites
    );

    /*
     * Recheck after navigation
     * because favorites are stored
     * locally.
     */
    const interval =
      setInterval(
        loadFavorites,
        700
      );

    return () => {
      window.removeEventListener(
        "storage",
        loadFavorites
      );

      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(
      event
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setCoursesDropdownOpen(
          false
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  function handleScrollTo(id) {
    if (pathname === "/") {
      const element =
        document.getElementById(
          id
        );

      element?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.location.href =
        `/#${id}`;
    }

    setIsOpen(false);
    setCoursesDropdownOpen(
      false
    );
  }

  const learningPaths = [
    {
      name: "Junior Coders",
      description: "Ages 5–8",
      href: "/courses/junior-coders",
    },
    {
      name: "Future Developers",
      description: "Ages 9–12",
      href: "/courses/future-developers",
    },
    {
      name: "Tech Professionals",
      description: "Ages 13–18",
      href: "/courses/tech-professionals",
    },
  ];

  return (
    <nav
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl"
          : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* LOGO */}

        <Link
          href="/"
          className="group flex items-center gap-3"
          onClick={() => {
            setIsOpen(false);
            setCoursesDropdownOpen(
              false
            );
          }}
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <Image
              src="/logo.png"
              alt="Tech Talk Hub Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>

          <div>
            <span className="block text-xl font-extrabold tracking-tight text-primary">
              Tech Talk Hub
            </span>

            <span className="hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block">
              Think. Code.
              Create.
            </span>
          </div>
        </Link>

        {/* DESKTOP LINKS */}

        <div className="hidden items-center gap-8 lg:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-700 hover:text-secondary"
          >
            Home
          </Link>

          <button
            type="button"
            onClick={() =>
              handleScrollTo(
                "pricing"
              )
            }
            className="text-sm font-semibold text-slate-700 hover:text-secondary"
          >
            Pricing
          </button>

          <div
            className="relative"
            ref={dropdownRef}
          >
            <button
              type="button"
              onClick={() =>
                setCoursesDropdownOpen(
                  (current) =>
                    !current
                )
              }
              className="flex items-center gap-1.5 py-6 text-sm font-semibold text-slate-700 hover:text-secondary"
            >
              Learning Paths

              <ChevronDown
                size={15}
                className={`transition ${
                  coursesDropdownOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {coursesDropdownOpen && (
              <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                <p className="px-3 pb-2 pt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Learning Paths
                </p>

                {learningPaths.map(
                  (path) => (
                    <Link
                      key={
                        path.href
                      }
                      href={
                        path.href
                      }
                      onClick={() =>
                        setCoursesDropdownOpen(
                          false
                        )
                      }
                      className="group flex items-center justify-between rounded-xl px-3 py-3 hover:bg-secondary/5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-secondary">
                          {
                            path.name
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {
                            path.description
                          }
                        </p>
                      </div>

                      <span>
                        →
                      </span>
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          <Link
            href="/blog"
            className="text-sm font-semibold text-slate-700 hover:text-secondary"
          >
            Blog
          </Link>

          <Link
            href="/shop"
            className={`text-sm font-semibold hover:text-secondary ${
              pathname?.startsWith(
                "/shop"
              )
                ? "text-secondary"
                : "text-slate-700"
            }`}
          >
            Shop
          </Link>
        </div>

        {/* DESKTOP ACTIONS */}

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="https://dashboard.techtalk-hub.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Login
          </a>

          {isCommercePage ? (
            <>
              <Link
                href="/favorites"
                aria-label="Favorites"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-pink-200 hover:text-[#ff4b7c]"
              >
                <Heart
                  size={19}
                />

                {favoriteCount >
                  0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff4b7c] px-1 text-[9px] font-black text-white">
                    {favoriteCount >
                    99
                      ? "99+"
                      : favoriteCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                aria-label="Shopping cart"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary"
              >
                <ShoppingCart
                  size={19}
                />

                {hydrated &&
                  cartCount >
                    0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-black text-white">
                      {cartCount >
                      99
                        ? "99+"
                        : cartCount}
                    </span>
                  )}
              </Link>
            </>
          ) : (
            <Link
              href="/donate"
              className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary"
            >
              📚 Empower a
              Learner
            </Link>
          )}

          <Link
            href="/book-class"
            className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20"
          >
            Book Trial
          </Link>
        </div>

        {/* MOBILE */}

        <div className="flex items-center gap-2 lg:hidden">
          {isCommercePage && (
            <>
              <Link
                href="/favorites"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
              >
                <Heart
                  size={18}
                />

                {favoriteCount >
                  0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff4b7c] px-1 text-[8px] font-black text-white">
                    {
                      favoriteCount
                    }
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
              >
                <ShoppingCart
                  size={18}
                />

                {cartCount >
                  0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[8px] font-black text-white">
                    {
                      cartCount
                    }
                  </span>
                )}
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() =>
              setIsOpen(
                (current) =>
                  !current
              )
            }
            className="rounded-xl p-2.5 text-slate-700"
          >
            {isOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}

      <div
        className={`overflow-hidden border-t bg-white transition-all duration-300 lg:hidden ${
          isOpen
            ? "max-h-[850px] opacity-100"
            : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-xl flex-col gap-2 px-5 py-5">
          <Link
            href="/"
            onClick={() =>
              setIsOpen(false)
            }
            className="rounded-xl px-4 py-3 text-sm font-semibold"
          >
            Home
          </Link>

          <button
            onClick={() =>
              handleScrollTo(
                "pricing"
              )
            }
            className="rounded-xl px-4 py-3 text-left text-sm font-semibold"
          >
            Pricing
          </button>

          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="mb-2 px-2 text-xs font-bold uppercase text-slate-400">
              Learning Paths
            </p>

            {learningPaths.map(
              (path) => (
                <Link
                  key={
                    path.href
                  }
                  href={
                    path.href
                  }
                  onClick={() =>
                    setIsOpen(
                      false
                    )
                  }
                  className="block rounded-xl px-3 py-2.5"
                >
                  <p className="text-sm font-semibold">
                    {
                      path.name
                    }
                  </p>

                  <p className="text-xs text-slate-500">
                    {
                      path.description
                    }
                  </p>
                </Link>
              )
            )}
          </div>

          <Link
            href="/blog"
            onClick={() =>
              setIsOpen(false)
            }
            className="rounded-xl px-4 py-3 text-sm font-semibold"
          >
            Blog
          </Link>

          <Link
            href="/shop"
            onClick={() =>
              setIsOpen(false)
            }
            className="rounded-xl px-4 py-3 text-sm font-semibold"
          >
            Shop
          </Link>

          {isCommercePage && (
            <>
              <Link
                href="/favorites"
                onClick={() =>
                  setIsOpen(
                    false
                  )
                }
                className="flex items-center justify-between rounded-xl bg-pink-50 px-4 py-3 text-sm font-bold text-[#e94073]"
              >
                <span className="flex items-center gap-2">
                  <Heart
                    size={17}
                  />
                  Favorites
                </span>

                <span>
                  {
                    favoriteCount
                  }
                </span>
              </Link>

              <Link
                href="/cart"
                onClick={() =>
                  setIsOpen(
                    false
                  )
                }
                className="flex items-center justify-between rounded-xl bg-purple-50 px-4 py-3 text-sm font-bold text-primary"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart
                    size={17}
                  />
                  My Cart
                </span>

                <span>
                  {cartCount}
                </span>
              </Link>
            </>
          )}

          <div className="my-2 border-t" />

          <a
            href="https://dashboard.techtalk-hub.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold"
          >
            Login
          </a>

          {!isCommercePage && (
            <Link
              href="/donate"
              onClick={() =>
                setIsOpen(false)
              }
              className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary"
            >
              📚 Empower a
              Learner
            </Link>
          )}

          <Link
            href="/book-class"
            onClick={() =>
              setIsOpen(false)
            }
            className="rounded-xl bg-secondary px-4 py-3.5 text-center text-sm font-bold text-white"
          >
            Book a Free Trial
          </Link>
        </div>
      </div>
    </nav>
  );
}
// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   Menu,
//   X,
//   ChevronDown,
//   ShoppingCart,
// } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";

// import { useCart } from "./CartProvider";

// export default function NavBar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [coursesDropdownOpen, setCoursesDropdownOpen] =
//     useState(false);

//   const pathname = usePathname();

//   const { items, hydrated } = useCart();

//   const isCommercePage =
//     pathname?.startsWith("/shop") ||
//     pathname?.startsWith("/cart") ||
//     pathname?.startsWith("/checkout");

//   const cartCount = hydrated
//     ? items.reduce(
//         (total, item) =>
//           total + Number(item.quantity || 0),
//         0
//       )
//     : 0;

//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 12);
//     };

//     window.addEventListener("scroll", handleScroll);

//     return () =>
//       window.removeEventListener(
//         "scroll",
//         handleScroll
//       );
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target)
//       ) {
//         setCoursesDropdownOpen(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//     };
//   }, []);

//   const handleScrollTo = (id) => {
//     /*
//      * Pricing lives on the homepage.
//      * If we're already there, scroll.
//      * Otherwise navigate to the homepage pricing section.
//      */
//     if (pathname === "/") {
//       const el = document.getElementById(id);

//       if (el) {
//         el.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//         });
//       }
//     } else {
//       window.location.href = `/#${id}`;
//     }

//     setIsOpen(false);
//     setCoursesDropdownOpen(false);
//   };

//   const learningPaths = [
//     {
//       name: "Junior Coders",
//       description: "Ages 5–8",
//       href: "/courses/junior-coders",
//     },
//     {
//       name: "Future Developers",
//       description: "Ages 9–12",
//       href: "/courses/future-developers",
//     },
//     {
//       name: "Tech Professionals",
//       description: "Ages 13–18",
//       href: "/courses/tech-professionals",
//     },
//   ];

//   return (
//     <nav
//       className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
//         scrolled
//           ? "border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl"
//           : "bg-white/80 backdrop-blur-md"
//       }`}
//     >
//       <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
//         {/* Logo */}

//         <Link
//           href="/"
//           className="group flex items-center gap-3"
//           onClick={() => {
//             setIsOpen(false);
//             setCoursesDropdownOpen(false);
//           }}
//         >
//           <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105">
//             <Image
//               src="/logo.png"
//               alt="Tech Talk Hub Logo"
//               fill
//               className="object-contain p-1"
//               priority
//             />
//           </div>

//           <div className="text-left">
//             <span className="block text-xl font-extrabold tracking-tight text-primary">
//               Tech Talk Hub
//             </span>

//             <span className="hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block">
//               Think. Code. Create.
//             </span>
//           </div>
//         </Link>

//         {/* Desktop Navigation */}

//         <div className="hidden items-center gap-8 lg:flex">
//           <Link
//             href="/"
//             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
//           >
//             Home
//           </Link>

//           <button
//             type="button"
//             onClick={() => handleScrollTo("pricing")}
//             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
//           >
//             Pricing
//           </button>

//           {/* Learning Paths */}

//           <div
//             className="relative"
//             ref={dropdownRef}
//           >
//             <button
//               type="button"
//               onClick={() =>
//                 setCoursesDropdownOpen(
//                   (prev) => !prev
//                 )
//               }
//               className="flex items-center gap-1.5 py-6 text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
//             >
//               Learning Paths

//               <ChevronDown
//                 size={15}
//                 strokeWidth={2.2}
//                 className={`transition-transform duration-200 ${
//                   coursesDropdownOpen
//                     ? "rotate-180"
//                     : ""
//                 }`}
//               />
//             </button>

//             {coursesDropdownOpen && (
//               <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">
//                 <div className="px-3 pb-2 pt-3">
//                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
//                     Learning Paths
//                   </p>
//                 </div>

//                 {learningPaths.map((path) => (
//                   <Link
//                     key={path.href}
//                     href={path.href}
//                     onClick={() =>
//                       setCoursesDropdownOpen(false)
//                     }
//                     className="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-secondary/5"
//                   >
//                     <div>
//                       <p className="text-sm font-semibold text-slate-800 group-hover:text-secondary">
//                         {path.name}
//                       </p>

//                       <p className="mt-0.5 text-xs text-slate-500">
//                         {path.description}
//                       </p>
//                     </div>

//                     <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-secondary">
//                       →
//                     </span>
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>

//           <Link
//             href="/blog"
//             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
//           >
//             Blog
//           </Link>

//           <Link
//             href="/shop"
//             className={`text-sm font-semibold transition-colors hover:text-secondary ${
//               pathname?.startsWith("/shop")
//                 ? "text-secondary"
//                 : "text-slate-700"
//             }`}
//           >
//             Shop
//           </Link>
//         </div>

//         {/* Desktop Actions */}

//         <div className="hidden items-center gap-3 lg:flex">
//           <a
//             href="https://dashboard.techtalk-hub.com"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-primary"
//           >
//             Login
//           </a>

//           {isCommercePage ? (
//             <Link
//               href="/cart"
//               aria-label={`Shopping cart with ${cartCount} items`}
//               className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
//             >
//               <ShoppingCart size={19} />

//               {cartCount > 0 && (
//                 <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[10px] font-black text-white shadow">
//                   {cartCount > 99
//                     ? "99+"
//                     : cartCount}
//                 </span>
//               )}
//             </Link>
//           ) : (
//             <Link
//               href="/donate"
//               className="inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary transition hover:-translate-y-0.5 hover:bg-primary/10"
//             >
//               <span>📚</span>
//               Empower a Learner
//             </Link>
//           )}

//           <Link
//             href="/book-class"
//             className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
//           >
//             Book Trial
//           </Link>
//         </div>

//         {/* Mobile actions */}

//         <div className="flex items-center gap-2 lg:hidden">
//           {isCommercePage && (
//             <Link
//               href="/cart"
//               onClick={() =>
//                 setIsOpen(false)
//               }
//               className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
//               aria-label="Shopping cart"
//             >
//               <ShoppingCart size={18} />

//               {cartCount > 0 && (
//                 <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-black text-white">
//                   {cartCount > 99
//                     ? "99+"
//                     : cartCount}
//                 </span>
//               )}
//             </Link>
//           )}

//           <button
//             type="button"
//             onClick={() =>
//               setIsOpen((prev) => !prev)
//             }
//             aria-label="Toggle navigation menu"
//             className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100"
//           >
//             {isOpen ? (
//               <X size={23} />
//             ) : (
//               <Menu size={23} />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}

//       <div
//         className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${
//           isOpen
//             ? "max-h-[800px] opacity-100"
//             : "max-h-0 border-transparent opacity-0"
//         }`}
//       >
//         <div className="mx-auto flex max-w-xl flex-col gap-2 px-5 py-5">
//           <Link
//             href="/"
//             onClick={() => setIsOpen(false)}
//             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700"
//           >
//             Home
//           </Link>

//           <button
//             type="button"
//             onClick={() =>
//               handleScrollTo("pricing")
//             }
//             className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700"
//           >
//             Pricing
//           </button>

//           <div className="rounded-2xl bg-slate-50 p-3">
//             <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
//               Learning Paths
//             </p>

//             {learningPaths.map((path) => (
//               <Link
//                 key={path.href}
//                 href={path.href}
//                 onClick={() =>
//                   setIsOpen(false)
//                 }
//                 className="block rounded-xl px-3 py-2.5 transition hover:bg-white"
//               >
//                 <p className="text-sm font-semibold text-slate-800">
//                   {path.name}
//                 </p>

//                 <p className="text-xs text-slate-500">
//                   {path.description}
//                 </p>
//               </Link>
//             ))}
//           </div>

//           <Link
//             href="/blog"
//             onClick={() => setIsOpen(false)}
//             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700"
//           >
//             Blog
//           </Link>

//           <Link
//             href="/shop"
//             onClick={() => setIsOpen(false)}
//             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700"
//           >
//             Shop
//           </Link>

//           {isCommercePage && (
//             <Link
//               href="/cart"
//               onClick={() => setIsOpen(false)}
//               className="flex items-center justify-between rounded-xl bg-purple-50 px-4 py-3 text-sm font-bold text-primary"
//             >
//               <span className="flex items-center gap-2">
//                 <ShoppingCart size={17} />
//                 My Cart
//               </span>

//               <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">
//                 {cartCount}
//               </span>
//             </Link>
//           )}

//           <div className="my-2 border-t border-slate-100" />

//           <a
//             href="https://dashboard.techtalk-hub.com"
//             target="_blank"
//             rel="noopener noreferrer"
//             onClick={() => setIsOpen(false)}
//             className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700"
//           >
//             Login
//           </a>

//           {!isCommercePage && (
//             <Link
//               href="/donate"
//               onClick={() =>
//                 setIsOpen(false)
//               }
//               className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary"
//             >
//               📚 Empower a Learner
//             </Link>
//           )}

//           <Link
//             href="/book-class"
//             onClick={() => setIsOpen(false)}
//             className="rounded-xl bg-secondary px-4 py-3.5 text-center text-sm font-bold text-white"
//           >
//             Book a Free Trial
//           </Link>

//           <Link
//             href="/careers"
//             onClick={() => setIsOpen(false)}
//             className="py-2 text-center text-xs text-slate-400"
//           >
//             Careers
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// }
// // "use client";

// // import { useEffect, useRef, useState } from "react";
// // import { Menu, X, ChevronDown } from "lucide-react";
// // import Link from "next/link";
// // import Image from "next/image";
// // import { usePathname } from "next/navigation";

// // export default function NavBar() {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [scrolled, setScrolled] = useState(false);
// //   const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);

// //   const pathname = usePathname();
// //   const isShopPage = pathname?.startsWith("/shop");

// //   const dropdownRef = useRef(null);

// //   useEffect(() => {
// //     const handleScroll = () => {
// //       setScrolled(window.scrollY > 12);
// //     };

// //     window.addEventListener("scroll", handleScroll);

// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (
// //         dropdownRef.current &&
// //         !dropdownRef.current.contains(event.target)
// //       ) {
// //         setCoursesDropdownOpen(false);
// //       }
// //     };

// //     document.addEventListener("mousedown", handleClickOutside);

// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, []);

// //   const handleScrollTo = (id) => {
// //     const el = document.getElementById(id);

// //     if (el) {
// //       el.scrollIntoView({
// //         behavior: "smooth",
// //         block: "start",
// //       });
// //     }

// //     setIsOpen(false);
// //     setCoursesDropdownOpen(false);
// //   };

// //   const learningPaths = [
// //     {
// //       name: "Junior Coders",
// //       description: "Ages 5–8",
// //       href: "/courses/junior-coders",
// //     },
// //     {
// //       name: "Future Developers",
// //       description: "Ages 9–12",
// //       href: "/courses/future-developers",
// //     },
// //     {
// //       name: "Tech Professionals",
// //       description: "Ages 13–18",
// //       href: "/courses/tech-professionals",
// //     },
// //   ];

// //   return (
// //     <nav
// //       className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
// //         scrolled
// //           ? "border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl"
// //           : "bg-white/80 backdrop-blur-md"
// //       }`}
// //     >
// //       <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

// //         {/* Logo */}
// //         <Link
// //           href="/"
// //           className="group flex items-center gap-3"
// //           onClick={() => {
// //             setIsOpen(false);
// //             setCoursesDropdownOpen(false);
// //           }}
// //         >
// //           <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105">
// //             <Image
// //               src="/logo.png"
// //               alt="Tech Talk Hub Logo"
// //               fill
// //               className="object-contain p-1"
// //               priority
// //             />
// //           </div>

// //           <div className="text-left">
// //             <span className="block text-xl font-extrabold tracking-tight text-primary">
// //               Tech Talk Hub
// //             </span>

// //             <span className="hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block">
// //               Think. Code. Create.
// //             </span>
// //           </div>
// //         </Link>

// //         {/* Desktop Navigation */}
// //         <div className="hidden items-center gap-8 lg:flex">
// //           <Link
// //             href="/"
// //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// //           >
// //             Home
// //           </Link>

// //           <button
// //             onClick={() => handleScrollTo("pricing")}
// //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// //           >
// //             Pricing
// //           </button>

// //           {/* Learning Paths Dropdown */}
// //           <div className="relative" ref={dropdownRef}>
// //             <button
// //               onClick={() =>
// //                 setCoursesDropdownOpen((prev) => !prev)
// //               }
// //               className="flex items-center gap-1.5 py-6 text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// //             >
// //               Learning Paths

// //               <ChevronDown
// //                 size={15}
// //                 strokeWidth={2.2}
// //                 className={`transition-transform duration-200 ${
// //                   coursesDropdownOpen ? "rotate-180" : ""
// //                 }`}
// //               />
// //             </button>

// //             {coursesDropdownOpen && (
// //               <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">
// //                 <div className="px-3 pb-2 pt-3">
// //                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
// //                     Learning Paths
// //                   </p>
// //                 </div>

// //                 {learningPaths.map((path) => (
// //                   <Link
// //                     key={path.href}
// //                     href={path.href}
// //                     onClick={() =>
// //                       setCoursesDropdownOpen(false)
// //                     }
// //                     className="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-secondary/5"
// //                   >
// //                     <div>
// //                       <p className="text-sm font-semibold text-slate-800 group-hover:text-secondary">
// //                         {path.name}
// //                       </p>

// //                       <p className="mt-0.5 text-xs text-slate-500">
// //                         {path.description}
// //                       </p>
// //                     </div>

// //                     <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-secondary">
// //                       →
// //                     </span>
// //                   </Link>
// //                 ))}
// //               </div>
// //             )}
// //           </div>

// //           <Link
// //             href="/blog"
// //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// //           >
// //             Blog
// //           </Link>

// //           <Link
// //             href="/shop"
// //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// //           >
// //             Shop
// //           </Link>
// //         </div>

// //         {/* Desktop Actions */}
// //         <div className="hidden items-center gap-3 lg:flex">
// //           <a
// //             href="https://dashboard.techtalk-hub.com"
// //             target="_blank"
// //             rel="noopener noreferrer"
// //             className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-primary"
// //           >
// //             Login
// //           </a>

// //           {!isShopPage && (
// //             <Link
// //               href="/donate"
// //               className="inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary transition hover:-translate-y-0.5 hover:bg-primary/10"
// //             >
// //               <span>📚</span>
// //               Empower a Learner
// //             </Link>
// //           )}

// //           <Link
// //             href="/book-class"
// //             className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
// //           >
// //             Book Trial
// //           </Link>
// //         </div>

// //         {/* Mobile Toggle */}
// //         <button
// //           onClick={() => setIsOpen((prev) => !prev)}
// //           aria-label="Toggle navigation menu"
// //           className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden"
// //         >
// //           {isOpen ? <X size={23} /> : <Menu size={23} />}
// //         </button>
// //       </div>

// //       {/* Mobile Menu */}
// //       <div
// //         className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${
// //           isOpen
// //             ? "max-h-[800px] opacity-100"
// //             : "max-h-0 border-transparent opacity-0"
// //         }`}
// //       >
// //         <div className="mx-auto flex max-w-xl flex-col gap-2 px-5 py-5">
// //           <Link
// //             href="/"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// //           >
// //             Home
// //           </Link>

// //           <button
// //             onClick={() => handleScrollTo("pricing")}
// //             className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// //           >
// //             Pricing
// //           </button>

// //           {/* Mobile Learning Paths */}
// //           <div className="rounded-2xl bg-slate-50 p-3">
// //             <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
// //               Learning Paths
// //             </p>

// //             {learningPaths.map((path) => (
// //               <Link
// //                 key={path.href}
// //                 href={path.href}
// //                 onClick={() => setIsOpen(false)}
// //                 className="block rounded-xl px-3 py-2.5 transition hover:bg-white"
// //               >
// //                 <p className="text-sm font-semibold text-slate-800">
// //                   {path.name}
// //                 </p>

// //                 <p className="text-xs text-slate-500">
// //                   {path.description}
// //                 </p>
// //               </Link>
// //             ))}
// //           </div>

// //           <Link
// //             href="/blog"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// //           >
// //             Blog
// //           </Link>

// //           <Link
// //             href="/shop"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// //           >
// //             Shop
// //           </Link>

// //           <div className="my-2 border-t border-slate-100" />

// //           <a
// //             href="https://dashboard.techtalk-hub.com"
// //             target="_blank"
// //             rel="noopener noreferrer"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700"
// //           >
// //             Login
// //           </a>

// //           {!isShopPage && (
// //             <Link
// //               href="/donate"
// //               onClick={() => setIsOpen(false)}
// //               className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary"
// //             >
// //               📚 Empower a Learner
// //             </Link>
// //           )}

// //           <Link
// //             href="/book-class"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl bg-secondary px-4 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-secondary/20"
// //           >
// //             Book a Free Trial
// //           </Link>

// //           <Link
// //             href="/careers"
// //             onClick={() => setIsOpen(false)}
// //             className="py-2 text-center text-xs text-slate-400 transition hover:text-secondary"
// //           >
// //             Careers
// //           </Link>
// //         </div>
// //       </div>
// //     </nav>
// //   );
// // }
// // "use client";

// // import { useEffect, useRef, useState } from "react";
// // import { Menu, X, ChevronDown } from "lucide-react";
// // import Link from "next/link";
// // import Image from "next/image";
// // import { usePathname } from "next/navigation";

// // export default function NavBar() {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [scrolled, setScrolled] = useState(false);
// //   const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
// //   const pathname = usePathname();
// //   const isShopPage = pathname?.startsWith("/shop");
// //   const dropdownRef = useRef(null);

// //   useEffect(() => {
// //     const handleScroll = () => {
// //       setScrolled(window.scrollY > 12);
// //     };

// //     window.addEventListener("scroll", handleScroll);

// //     return () => window.removeEventListener("scroll", handleScroll);
// //   }, []);

// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (
// //         dropdownRef.current &&
// //         !dropdownRef.current.contains(event.target)
// //       ) {
// //         setCoursesDropdownOpen(false);
// //       }
// //     };

// //     document.addEventListener("mousedown", handleClickOutside);

// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, []);

// //   const handleScrollTo = (id) => {
// //     const el = document.getElementById(id);

// //     if (el) {
// //       el.scrollIntoView({
// //         behavior: "smooth",
// //         block: "start",
// //       });
// //     }

// //     setIsOpen(false);
// //     setCoursesDropdownOpen(false);
// //   };

// //   const learningPaths = [
// //     {
// //       name: "Junior Coders",
// //       description: "Ages 5–8",
// //       href: "/courses/junior-coders",
// //     },
// //     {
// //       name: "Future Developers",
// //       description: "Ages 9–12",
// //       href: "/courses/future-developers",
// //     },
// //     {
// //       name: "Tech Professionals",
// //       description: "Ages 13–18",
// //       href: "/courses/tech-professionals",
// //     },
// //   ];

// //   return (
// //     <nav
// //       className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
// //         scrolled
// //           ? "border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl"
// //           : "bg-white/80 backdrop-blur-md"
// //       }`}
// //     >
// //       <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

// //         {/* Logo */}
// //         <Link
// //           href="/"
// //           className="group flex items-center gap-3"
// //           onClick={() => {
// //             setIsOpen(false);
// //             setCoursesDropdownOpen(false);
// //           }}
// //         >
// //           <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105">
// //             <Image
// //               src="/logo.png"
// //               alt="Tech Talk Hub Logo"
// //               fill
// //               className="object-contain p-1"
// //               priority
// //             />
// //           </div>

// //           <div className="text-left">
// //             <span className="block text-xl font-extrabold tracking-tight text-primary">
// //               Tech Talk Hub
// //             </span>

// //             <span className="hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block">
// //               Think. Code. Create.
// //             </span>
// //           </div>
// //         </Link>

// //         {/* Desktop Navigation */}
// //         <div className="hidden items-center gap-8 lg:flex">

// //           <Link
// //             href="/"
// //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// //           >
// //             Home
// //           </Link>

// //           <button
// //             onClick={() => handleScrollTo("pricing")}
// //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// //           >
// //             Pricing
// //           </button>

// //           {/* Learning Paths Dropdown */}
// //           <div className="relative" ref={dropdownRef}>
// //             <button
// //               onClick={() =>
// //                 setCoursesDropdownOpen((prev) => !prev)
// //               }
// //               className="flex items-center gap-1.5 py-6 text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// //             >
// //               Learning Paths

// //               <ChevronDown
// //                 size={15}
// //                 strokeWidth={2.2}
// //                 className={`transition-transform duration-200 ${
// //                   coursesDropdownOpen ? "rotate-180" : ""
// //                 }`}
// //               />
// //             </button>

// //             {coursesDropdownOpen && (
// //               <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">

// //                 <div className="px-3 pb-2 pt-3">
// //                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
// //                     Learning Paths
// //                   </p>
// //                 </div>

// //                 {learningPaths.map((path) => (
// //                   <Link
// //                     key={path.href}
// //                     href={path.href}
// //                     onClick={() =>
// //                       setCoursesDropdownOpen(false)
// //                     }
// //                     className="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-secondary/5"
// //                   >
// //                     <div>
// //                       <p className="text-sm font-semibold text-slate-800 group-hover:text-secondary">
// //                         {path.name}
// //                       </p>

// //                       <p className="mt-0.5 text-xs text-slate-500">
// //                         {path.description}
// //                       </p>
// //                     </div>

// //                     <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-secondary">
// //                       →
// //                     </span>
// //                   </Link>
// //                 ))}
// //               </div>
// //             )}
// //           </div>

// //           <Link
// //             href="/blog"
// //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// //           >
// //             Blog
// //           </Link>

// //           <Link
// //             href="/shop"
// //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// //           >
// //             Shop
// //           </Link>
// //         </div>

// //         {/* Desktop Actions */}
// //         <div className="hidden items-center gap-3 lg:flex">
// //           <a
// //             href="https://dashboard.techtalk-hub.com"
// //             target="_blank"
// //             rel="noopener noreferrer"
// //             className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-primary"
// //           >
// //             Login
// //           </a>

// //           <Link
// //             href="/donate"
// //             className="inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary transition hover:-translate-y-0.5 hover:bg-primary/10"
// //           >
// //             <span>📚</span>
// //             Empower a Learner
// //           </Link>

// //           <Link
// //             href="/book-class"
// //             className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
// //           >
// //             Book Trial
// //           </Link>
// //         </div>

// //         {/* Mobile Toggle */}
// //         <button
// //           onClick={() => setIsOpen((prev) => !prev)}
// //           aria-label="Toggle navigation menu"
// //           className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden"
// //         >
// //           {isOpen ? <X size={23} /> : <Menu size={23} />}
// //         </button>
// //       </div>

// //       {/* Mobile Menu */}
// //       <div
// //         className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${
// //           isOpen
// //             ? "max-h-[800px] opacity-100"
// //             : "max-h-0 border-transparent opacity-0"
// //         }`}
// //       >
// //         <div className="mx-auto flex max-w-xl flex-col gap-2 px-5 py-5">

// //           <Link
// //             href="/"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// //           >
// //             Home
// //           </Link>

// //           <button
// //             onClick={() => handleScrollTo("pricing")}
// //             className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// //           >
// //             Pricing
// //           </button>

// //           {/* Mobile Learning Paths */}
// //           <div className="rounded-2xl bg-slate-50 p-3">
// //             <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
// //               Learning Paths
// //             </p>

// //             {learningPaths.map((path) => (
// //               <Link
// //                 key={path.href}
// //                 href={path.href}
// //                 onClick={() => setIsOpen(false)}
// //                 className="block rounded-xl px-3 py-2.5 transition hover:bg-white"
// //               >
// //                 <p className="text-sm font-semibold text-slate-800">
// //                   {path.name}
// //                 </p>

// //                 <p className="text-xs text-slate-500">
// //                   {path.description}
// //                 </p>
// //               </Link>
// //             ))}
// //           </div>

// //           <Link
// //             href="/blog"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// //           >
// //             Blog
// //           </Link>

// //           <Link
// //             href="/shop"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// //           >
// //             Shop
// //           </Link>

// //           <div className="my-2 border-t border-slate-100" />

// //           <a
// //             href="https://dashboard.techtalk-hub.com"
// //             target="_blank"
// //             rel="noopener noreferrer"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700"
// //           >
// //             Login
// //           </a>

// //           <Link
// //             href="/donate"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary"
// //           >
// //             📚 Empower a Learner
// //           </Link>

// //           <Link
// //             href="/book-class"
// //             onClick={() => setIsOpen(false)}
// //             className="rounded-xl bg-secondary px-4 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-secondary/20"
// //           >
// //             Book a Free Trial
// //           </Link>

// //           <Link
// //             href="/careers"
// //             onClick={() => setIsOpen(false)}
// //             className="py-2 text-center text-xs text-slate-400 transition hover:text-secondary"
// //           >
// //             Careers
// //           </Link>
// //         </div>
// //       </div>
// //     </nav>
// //   );
// // }
// // // "use client";

// // // import { useEffect, useRef, useState } from "react";
// // // import { Menu, X, ChevronDown } from "lucide-react";
// // // import Link from "next/link";
// // // import Image from "next/image";

// // // export default function NavBar() {
// // //   const [isOpen, setIsOpen] = useState(false);
// // //   const [scrolled, setScrolled] = useState(false);
// // //   const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);

// // //   const dropdownRef = useRef(null);

// // //   useEffect(() => {
// // //     const handleScroll = () => {
// // //       setScrolled(window.scrollY > 12);
// // //     };

// // //     window.addEventListener("scroll", handleScroll);

// // //     return () => window.removeEventListener("scroll", handleScroll);
// // //   }, []);

// // //   useEffect(() => {
// // //     const handleClickOutside = (event) => {
// // //       if (
// // //         dropdownRef.current &&
// // //         !dropdownRef.current.contains(event.target)
// // //       ) {
// // //         setCoursesDropdownOpen(false);
// // //       }
// // //     };

// // //     document.addEventListener("mousedown", handleClickOutside);

// // //     return () => {
// // //       document.removeEventListener("mousedown", handleClickOutside);
// // //     };
// // //   }, []);

// // //   const handleScrollTo = (id) => {
// // //     const el = document.getElementById(id);

// // //     if (el) {
// // //       el.scrollIntoView({
// // //         behavior: "smooth",
// // //         block: "start",
// // //       });
// // //     }

// // //     setIsOpen(false);
// // //     setCoursesDropdownOpen(false);
// // //   };

// // //   const learningPaths = [
// // //     {
// // //       name: "Junior Coders",
// // //       description: "Ages 5–8",
// // //       href: "/courses/junior-coders",
// // //     },
// // //     {
// // //       name: "Future Developers",
// // //       description: "Ages 9–12",
// // //       href: "/courses/future-developers",
// // //     },
// // //     {
// // //       name: "Tech Professionals",
// // //       description: "Ages 13–18",
// // //       href: "/courses/tech-professionals",
// // //     },
// // //   ];

// // //   return (
// // //     <nav
// // //       className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
// // //         scrolled
// // //           ? "border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl"
// // //           : "bg-white/80 backdrop-blur-md"
// // //       }`}
// // //     >
// // //       <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

// // //         {/* Logo */}
// // //         <Link
// // //           href="/"
// // //           className="group flex items-center gap-3"
// // //           onClick={() => {
// // //             setIsOpen(false);
// // //             setCoursesDropdownOpen(false);
// // //           }}
// // //         >
// // //           <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105">
// // //             <Image
// // //               src="/logo.png"
// // //               alt="Tech Talk Hub Logo"
// // //               fill
// // //               className="object-contain p-1"
// // //               priority
// // //             />
// // //           </div>

// // //           <div className="text-left">
// // //             <span className="block text-xl font-extrabold tracking-tight text-primary">
// // //               Tech Talk Hub
// // //             </span>

// // //             <span className="hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block">
// // //               Think. Code. Create.
// // //             </span>
// // //           </div>
// // //         </Link>

// // //         {/* Desktop Navigation */}
// // //         <div className="hidden items-center gap-8 lg:flex">

// // //           <Link
// // //             href="/"
// // //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// // //           >
// // //             Home
// // //           </Link>

// // //           <button
// // //             onClick={() => handleScrollTo("pricing")}
// // //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// // //           >
// // //             Pricing
// // //           </button>

// // //           {/* Learning Paths Dropdown */}
// // //           <div className="relative" ref={dropdownRef}>
// // //             <button
// // //               onClick={() =>
// // //                 setCoursesDropdownOpen((prev) => !prev)
// // //               }
// // //               className="flex items-center gap-1.5 py-6 text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// // //             >
// // //               Learning Paths

// // //               <ChevronDown
// // //                 size={15}
// // //                 strokeWidth={2.2}
// // //                 className={`transition-transform duration-200 ${
// // //                   coursesDropdownOpen ? "rotate-180" : ""
// // //                 }`}
// // //               />
// // //             </button>

// // //             {coursesDropdownOpen && (
// // //               <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">

// // //                 <div className="px-3 pb-2 pt-3">
// // //                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
// // //                     Learning Paths
// // //                   </p>
// // //                 </div>

// // //                 {learningPaths.map((path) => (
// // //                   <Link
// // //                     key={path.href}
// // //                     href={path.href}
// // //                     onClick={() =>
// // //                       setCoursesDropdownOpen(false)
// // //                     }
// // //                     className="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-secondary/5"
// // //                   >
// // //                     <div>
// // //                       <p className="text-sm font-semibold text-slate-800 group-hover:text-secondary">
// // //                         {path.name}
// // //                       </p>

// // //                       <p className="mt-0.5 text-xs text-slate-500">
// // //                         {path.description}
// // //                       </p>
// // //                     </div>

// // //                     <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-secondary">
// // //                       →
// // //                     </span>
// // //                   </Link>
// // //                 ))}
// // //               </div>
// // //             )}
// // //           </div>

// // //           <Link
// // //             href="/blog"
// // //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// // //           >
// // //             Blog
// // //           </Link>

// // //           <Link
// // //             href="/shop"
// // //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// // //           >
// // //             Shop
// // //           </Link>
// // //         </div>

// // //         {/* Desktop Actions */}
// // //         <div className="hidden items-center gap-3 lg:flex">
// // //           <a
// // //             href="https://dashboard.techtalk-hub.com"
// // //             target="_blank"
// // //             rel="noopener noreferrer"
// // //             className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-primary"
// // //           >
// // //             Login
// // //           </a>

// // //           <Link
// // //             href="/donate"
// // //             className="inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary transition hover:-translate-y-0.5 hover:bg-primary/10"
// // //           >
// // //             <span>📚</span>
// // //             Empower a Learner
// // //           </Link>

// // //           <Link
// // //             href="/book-class"
// // //             className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
// // //           >
// // //             Book Trial
// // //           </Link>
// // //         </div>

// // //         {/* Mobile Toggle */}
// // //         <button
// // //           onClick={() => setIsOpen((prev) => !prev)}
// // //           aria-label="Toggle navigation menu"
// // //           className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden"
// // //         >
// // //           {isOpen ? <X size={23} /> : <Menu size={23} />}
// // //         </button>
// // //       </div>

// // //       {/* Mobile Menu */}
// // //       <div
// // //         className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${
// // //           isOpen
// // //             ? "max-h-[800px] opacity-100"
// // //             : "max-h-0 border-transparent opacity-0"
// // //         }`}
// // //       >
// // //         <div className="mx-auto flex max-w-xl flex-col gap-2 px-5 py-5">

// // //           <Link
// // //             href="/"
// // //             onClick={() => setIsOpen(false)}
// // //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// // //           >
// // //             Home
// // //           </Link>

// // //           <button
// // //             onClick={() => handleScrollTo("pricing")}
// // //             className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// // //           >
// // //             Pricing
// // //           </button>

// // //           {/* Mobile Learning Paths */}
// // //           <div className="rounded-2xl bg-slate-50 p-3">
// // //             <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
// // //               Learning Paths
// // //             </p>

// // //             {learningPaths.map((path) => (
// // //               <Link
// // //                 key={path.href}
// // //                 href={path.href}
// // //                 onClick={() => setIsOpen(false)}
// // //                 className="block rounded-xl px-3 py-2.5 transition hover:bg-white"
// // //               >
// // //                 <p className="text-sm font-semibold text-slate-800">
// // //                   {path.name}
// // //                 </p>

// // //                 <p className="text-xs text-slate-500">
// // //                   {path.description}
// // //                 </p>
// // //               </Link>
// // //             ))}
// // //           </div>

// // //           <Link
// // //             href="/blog"
// // //             onClick={() => setIsOpen(false)}
// // //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// // //           >
// // //             Blog
// // //           </Link>

// // //           <Link
// // //             href="/shop"
// // //             onClick={() => setIsOpen(false)}
// // //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// // //           >
// // //             Shop
// // //           </Link>

// // //           <div className="my-2 border-t border-slate-100" />

// // //           <a
// // //             href="https://dashboard.techtalk-hub.com"
// // //             target="_blank"
// // //             rel="noopener noreferrer"
// // //             onClick={() => setIsOpen(false)}
// // //             className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700"
// // //           >
// // //             Login
// // //           </a>

// // //           <Link
// // //             href="/donate"
// // //             onClick={() => setIsOpen(false)}
// // //             className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary"
// // //           >
// // //             📚 Empower a Learner
// // //           </Link>

// // //           <Link
// // //             href="/book-class"
// // //             onClick={() => setIsOpen(false)}
// // //             className="rounded-xl bg-secondary px-4 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-secondary/20"
// // //           >
// // //             Book a Free Trial
// // //           </Link>

// // //           <Link
// // //             href="/careers"
// // //             onClick={() => setIsOpen(false)}
// // //             className="py-2 text-center text-xs text-slate-400 transition hover:text-secondary"
// // //           >
// // //             Careers
// // //           </Link>
// // //         </div>
// // //       </div>
// // //     </nav>
// // //   );
// // // }
// // // // "use client";

// // // // import { useEffect, useRef, useState } from "react";
// // // // import { Menu, X, ChevronDown } from "lucide-react";
// // // // import Link from "next/link";
// // // // import Image from "next/image";

// // // // export default function NavBar() {
// // // //   const [isOpen, setIsOpen] = useState(false);
// // // //   const [scrolled, setScrolled] = useState(false);
// // // //   const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);


// // // //   const dropdownRef = useRef(null);

// // // //   useEffect(() => {
// // // //     const handleScroll = () => {
// // // //       setScrolled(window.scrollY > 12);
// // // //     };

// // // //     window.addEventListener("scroll", handleScroll);

// // // //     return () => window.removeEventListener("scroll", handleScroll);
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     const handleClickOutside = (event) => {
// // // //       if (
// // // //         dropdownRef.current &&
// // // //         !dropdownRef.current.contains(event.target)
// // // //       ) {
// // // //         setCoursesDropdownOpen(false);
// // // //       }
// // // //     };

// // // //     document.addEventListener("mousedown", handleClickOutside);

// // // //     return () => {
// // // //       document.removeEventListener("mousedown", handleClickOutside);
// // // //     };
// // // //   }, []);

// // // //   const handleScrollTo = (id) => {
// // // //     const el = document.getElementById(id);

// // // //     if (el) {
// // // //       el.scrollIntoView({
// // // //         behavior: "smooth",
// // // //         block: "start",
// // // //       });
// // // //     }

// // // //     setIsOpen(false);
// // // //     setCoursesDropdownOpen(false);
// // // //   };

// // // //   const courseCategories = [
// // // //     {
// // // //       name: "Junior Coders",
// // // //       description: "Ages 5–8",
// // // //       href: "/courses/junior-coders",
// // // //     },
// // // //     {
// // // //       name: "Future Developers",
// // // //       description: "Ages 9–12",
// // // //       href: "/courses/future-developers",
// // // //     },
// // // //     {
// // // //       name: "Tech Professionals",
// // // //       description: "Ages 13–18",
// // // //       href: "/courses/tech-professionals",
// // // //     },
// // // //   ];

// // // //   return (
// // // //     <nav
// // // //       className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
// // // //         scrolled
// // // //           ? "border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl"
// // // //           : "bg-white/80 backdrop-blur-md"
// // // //       }`}
// // // //     >
// // // //       <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

// // // //         {/* Logo */}
// // // //         <button
// // // //           onClick={() => handleScrollTo("hero")}
// // // //           className="group flex items-center gap-3"
// // // //         >
// // // //           <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105">
// // // //             <Image
// // // //               src="/logo.png"
// // // //               alt="Tech Talk Hub Logo"
// // // //               fill
// // // //               className="object-contain p-1"
// // // //               priority
// // // //             />
// // // //           </div>

// // // //           <div className="text-left">
// // // //             <span className="block text-xl font-extrabold tracking-tight text-primary">
// // // //               Tech Talk Hub
// // // //             </span>

// // // //             <span className="hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block">
// // // //               Think. Code. Create.
// // // //             </span>
// // // //           </div>
// // // //         </button>

// // // //         {/* Desktop navigation */}
// // // //         <div className="hidden items-center gap-8 lg:flex">

// // // //           <button
// // // //             onClick={() => handleScrollTo("pricing")}
// // // //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// // // //           >
// // // //             Pricing
// // // //           </button>

// // // //           {/* Courses dropdown */}
// // // //           <div className="relative" ref={dropdownRef}>
// // // //             <button
// // // //               onClick={() =>
// // // //                 setCoursesDropdownOpen((prev) => !prev)
// // // //               }
// // // //               className="flex items-center gap-1.5 py-6 text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// // // //             >
// // // //               Learning Paths

// // // //               <ChevronDown
// // // //                 size={15}
// // // //                 strokeWidth={2.2}
// // // //                 className={`transition-transform duration-200 ${
// // // //                   coursesDropdownOpen ? "rotate-180" : ""
// // // //                 }`}
// // // //               />
// // // //             </button>

// // // //             {coursesDropdownOpen && (
// // // //               <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">

// // // //                 <div className="px-3 pb-2 pt-3">
// // // //                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
// // // //                     Learning Paths
// // // //                   </p>
// // // //                 </div>

// // // //                 {courseCategories.map((course) => (
// // // //                   <Link
// // // //                     key={course.href}
// // // //                     href={course.href}
// // // //                     onClick={() =>
// // // //                       setCoursesDropdownOpen(false)
// // // //                     }
// // // //                     className="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-secondary/5"
// // // //                   >
// // // //                     <div>
// // // //                       <p className="text-sm font-semibold text-slate-800 group-hover:text-secondary">
// // // //                         {course.name}
// // // //                       </p>

// // // //                       <p className="mt-0.5 text-xs text-slate-500">
// // // //                         {course.description}
// // // //                       </p>
// // // //                     </div>

// // // //                     <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-secondary">
// // // //                       →
// // // //                     </span>
// // // //                   </Link>
// // // //                 ))}

              
// // // //             )}
// // // //           </div>

// // // //           <Link
// // // //             href="/blog"
// // // //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// // // //           >
// // // //             Blog
// // // //           </Link>

// // // //           <Link
// // // //             href="/shop"
// // // //             className="text-sm font-semibold text-slate-700 transition-colors hover:text-secondary"
// // // //           >
// // // //             Shop
// // // //           </Link>
// // // //         </div>

// // // //         {/* Desktop actions */}
// // // //         <div className="hidden items-center gap-3 lg:flex">

// // // //           <a
// // // //             href="https://dashboard.techtalk-hub.com"
// // // //             target="_blank"
// // // //             rel="noopener noreferrer"
// // // //             className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-primary"
// // // //           >
// // // //             Login
// // // //           </a>

// // // //           <Link
// // // //             href="/donate"
// // // //             className="inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary transition hover:-translate-y-0.5 hover:bg-primary/10"
// // // //           >
// // // //             <span>📚</span>
// // // //             Empower a Learner
// // // //           </Link>

// // // //           <Link
// // // //             href="/book-class"
// // // //             className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
// // // //           >
// // // //             Book Trial
// // // //           </Link>
// // // //         </div>

// // // //         {/* Mobile toggle */}
// // // //         <button
// // // //           onClick={() => setIsOpen((prev) => !prev)}
// // // //           aria-label="Toggle navigation menu"
// // // //           className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden"
// // // //         >
// // // //           {isOpen ? <X size={23} /> : <Menu size={23} />}
// // // //         </button>
// // // //       </div>

// // // //       {/* Mobile menu */}
// // // //       <div
// // // //         className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 lg:hidden ${
// // // //           isOpen
// // // //             ? "max-h-[750px] opacity-100"
// // // //             : "max-h-0 border-transparent opacity-0"
// // // //         }`}
// // // //       >
// // // //         <div className="mx-auto flex max-w-xl flex-col gap-2 px-5 py-5">

// // // //           <button
// // // //             onClick={() => handleScrollTo("pricing")}
// // // //             className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-secondary"
// // // //           >
// // // //             Pricing
// // // //           </button>

// // // //           {/* Mobile courses */}
// // // //           <div className="rounded-2xl bg-slate-50 p-3">

// // // //             <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
// // // //               Courses
// // // //             </p>

// // // //             {courseCategories.map((course) => (
// // // //               <Link
// // // //                 key={course.href}
// // // //                 href={course.href}
// // // //                 onClick={() => setIsOpen(false)}
// // // //                 className="block rounded-xl px-3 py-2.5 transition hover:bg-white"
// // // //               >
// // // //                 <p className="text-sm font-semibold text-slate-800">
// // // //                   {course.name}
// // // //                 </p>

// // // //                 <p className="text-xs text-slate-500">
// // // //                   {course.description}
// // // //                 </p>
// // // //               </Link>
// // // //             ))}
// // // //           </div>

// // // //           <Link
// // // //             href="/blog"
// // // //             onClick={() => setIsOpen(false)}
// // // //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-secondary"
// // // //           >
// // // //             Blog
// // // //           </Link>

// // // //           <Link
// // // //             href="/shop"
// // // //             onClick={() => setIsOpen(false)}
// // // //             className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-secondary"
// // // //           >
// // // //             Shop
// // // //           </Link>

// // // //           <div className="my-2 border-t border-slate-100" />

// // // //           <a
// // // //             href="https://tech-talk-dashboards.vercel.app"
// // // //             target="_blank"
// // // //             rel="noopener noreferrer"
// // // //             onClick={() => setIsOpen(false)}
// // // //             className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700"
// // // //           >
// // // //             Login
// // // //           </a>

// // // //           <Link
// // // //             href="/donate"
// // // //             onClick={() => setIsOpen(false)}
// // // //             className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary"
// // // //           >
// // // //             📚 Empower a Learner
// // // //           </Link>

// // // //           <Link
// // // //             href="/book-class"
// // // //             onClick={() => setIsOpen(false)}
// // // //             className="rounded-xl bg-secondary px-4 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-secondary/20"
// // // //           >
// // // //             Book a Free Trial
// // // //           </Link>

// // // //           {/* Footer style link */}
// // // //           <Link
// // // //             href="/careers"
// // // //             onClick={() => setIsOpen(false)}
// // // //             className="py-2 text-center text-xs text-slate-400 hover:text-secondary"
// // // //           >
// // // //             Careers
// // // //           </Link>
// // // //         </div>
// // // //       </div>
// // // //     </nav>
// // // //   );
// // // // }


// // // // // <div className="mt-2 border-t border-slate-100 pt-2">
// // // //               //     <Link
// // // //               //       href="/courses"
// // // //               //       onClick={() =>
// // // //               //         setCoursesDropdownOpen(false)
// // // //               //       }
// // // //               //       className="block rounded-xl px-3 py-2.5 text-center text-xs font-bold text-primary transition hover:bg-primary/5"
// // // //               //     >
// // // //               //       View all courses →
// // // //               //     </Link>
// // // //               //   </div>
// // // //               // </div>






// // // // // "use client";

// // // // // import { useState, useEffect, useRef } from "react";
// // // // // import { Menu, X, ChevronDown } from "lucide-react";
// // // // // import Link from "next/link";
// // // // // import Image from "next/image";

// // // // // export default function NavBar() {
// // // // //   const [isOpen, setIsOpen] = useState(false);
// // // // //   const [scrolled, setScrolled] = useState(false);
// // // // //   const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
// // // // //   const dropdownRef = useRef(null);

// // // // //   useEffect(() => {
// // // // //     const handleScroll = () => setScrolled(window.scrollY > 20);
// // // // //     window.addEventListener("scroll", handleScroll);
// // // // //     return () => window.removeEventListener("scroll", handleScroll);
// // // // //   }, []);

// // // // //   // Close dropdown when clicking outside
// // // // //   useEffect(() => {
// // // // //     const handleClickOutside = (event) => {
// // // // //       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
// // // // //         setCoursesDropdownOpen(false);
// // // // //       }
// // // // //     };
// // // // //     document.addEventListener("mousedown", handleClickOutside);
// // // // //     return () => document.removeEventListener("mousedown", handleClickOutside);
// // // // //   }, []);

// // // // //   const handleScrollTo = (id) => {
// // // // //     const el = document.getElementById(id);
// // // // //     if (el) {
// // // // //       el.scrollIntoView({ behavior: "smooth" });
// // // // //       setIsOpen(false);
// // // // //       setCoursesDropdownOpen(false);
// // // // //     }
// // // // //   };

// // // // //   const courseCategories = [
// // // // //     { name: "· Junior Coders", href: "/courses/junior-coders" },
// // // // //     { name: "· Future Developers", href: "/courses/future-developers" },
// // // // //     { name: "· Tech Professionals", href: "/courses/tech-professionals" },
// // // // //   ];

// // // // //   return (
// // // // //     <nav
// // // // //       className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
// // // // //         scrolled
// // // // //           ? "bg-background/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800"
// // // // //           : "bg-transparent"
// // // // //       }`}
// // // // //     >
// // // // //       <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
// // // // //         {/* Brand Identity / Logo */}
// // // // //         <div
// // // // //           className="flex items-center space-x-3 cursor-pointer group"
// // // // //           onClick={() => handleScrollTo("hero")}
// // // // //         >
// // // // //           <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-sm border border-secondary/20">
// // // // //             <Image 
// // // // //               src="/logo.png" 
// // // // //               alt="Tech Talk Hub Logo" 
// // // // //               fill 
// // // // //               className="object-contain transition-transform group-hover:scale-105" 
// // // // //               priority 
// // // // //             />
// // // // //           </div>
// // // // //           <span className="font-extrabold text-xl tracking-tight text-primary">
// // // // //             Tech Talk Hub
// // // // //           </span>
// // // // //         </div>

// // // // //         {/* Desktop Anchor Paths */}
// // // // //         <div className="hidden lg:flex items-center space-x-7 text-text/85 font-medium">
// // // // //           <button onClick={() => handleScrollTo("pricing")} className="transition-colors hover:text-secondary">
// // // // //             Pricing
// // // // //           </button>
          
// // // // //           {/* Courses Dropdown */}
// // // // //           <div className="relative" ref={dropdownRef}>
// // // // //             <button
// // // // //               onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
// // // // //               className="flex items-center gap-1 transition-colors hover:text-secondary focus:outline-none py-2"
// // // // //             >
// // // // //               Courses
// // // // //               <ChevronDown size={16} className={`transition-transform duration-200 ${coursesDropdownOpen ? "rotate-180" : ""}`} />
// // // // //             </button>

// // // // //             {coursesDropdownOpen && (
// // // // //               <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-3 px-2 flex flex-col space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
// // // // //                 {courseCategories.map((course, idx) => (
// // // // //                   <Link
// // // // //                     key={idx}
// // // // //                     href={course.href}
// // // // //                     onClick={() => setCoursesDropdownOpen(false)}
// // // // //                     className="px-4 py-2.5 rounded-xl text-sm font-medium text-text/80 hover:text-secondary hover:bg-secondary/10 transition-colors"
// // // // //                   >
// // // // //                     {course.name}
// // // // //                   </Link>
// // // // //                 ))}
// // // // //               </div>
// // // // //             )}
// // // // //           </div>

// // // // //           <Link href="/blog" className="transition-colors hover:text-secondary">
// // // // //             Blog
// // // // //           </Link>
// // // // //           <Link href="/careers" className="transition-colors hover:text-secondary">
// // // // //             Careers
// // // // //           </Link>
// // // // //           <Link href="/shop" className="transition-colors hover:text-secondary">
// // // // //             Shop
// // // // //           </Link>
// // // // //         </div>

// // // // //         {/* Desktop Entry Actions */}
// // // // //         <div className="hidden lg:flex items-center space-x-5">
// // // // //           <a
// // // // //             href="https://tech-talk-dashboards.vercel.app"
// // // // //             target="_blank"
// // // // //             rel="noopener noreferrer"
// // // // //             className="text-text/80 font-medium text-sm px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
// // // // //           >
// // // // //             Login
// // // // //           </a>

// // // // //           <Link
// // // // //             href="/donate"
// // // // //             className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-primary/20 shadow-sm"
// // // // //             title="Support Education Worldwide"
// // // // //           >
// // // // //             <span>📚</span> Empower a Learner
// // // // //           </Link>

// // // // //           <Link href="/book-class">
// // // // //             <button className="bg-secondary text-background px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-secondary/20 hover:opacity-95 active:scale-95 transition-all">
// // // // //               Book Trial
// // // // //             </button>
// // // // //           </Link>
// // // // //         </div>

// // // // //         {/* Mobile / Tablet Toggle Button */}
// // // // //         <div className="lg:hidden flex items-center">
// // // // //           <button
// // // // //             onClick={() => setIsOpen(!isOpen)}
// // // // //             aria-label="Toggle Menu"
// // // // //             className="p-2 text-text focus:outline-none rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
// // // // //           >
// // // // //             {isOpen ? <X size={24} /> : <Menu size={24} />}
// // // // //           </button>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Mobile Drawer */}
// // // // //       <div
// // // // //         className={`lg:hidden absolute top-full left-0 w-full bg-background border-b border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-300 overflow-hidden ${
// // // // //           isOpen ? "max-h-[650px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
// // // // //         }`}
// // // // //       >
// // // // //         <div className="flex flex-col items-center space-y-3 text-text font-medium px-6">
// // // // //           <button onClick={() => handleScrollTo("pricing")} className="w-full py-2.5 text-center hover:text-secondary rounded-xl hover:bg-secondary/5 transition-colors">
// // // // //             Pricing
// // // // //           </button>
          
// // // // //           {/* Mobile Courses Section */}
// // // // //           <div className="w-full flex flex-col items-center py-2 bg-secondary/5 rounded-2xl border border-secondary/10">
// // // // //             <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Courses</span>
// // // // //             {courseCategories.map((course, idx) => (
// // // // //               <Link
// // // // //                 key={idx}
// // // // //                 href={course.href}
// // // // //                 onClick={() => setIsOpen(false)}
// // // // //                 className="w-full py-2 text-center text-sm text-text/80 hover:text-secondary transition-colors"
// // // // //               >
// // // // //                 {course.name}
// // // // //               </Link>
// // // // //             ))}
// // // // //           </div>

// // // // //           <Link href="/blog" onClick={() => setIsOpen(false)} className="w-full py-2.5 text-center hover:text-secondary rounded-xl hover:bg-secondary/5 transition-colors">
// // // // //             Blogs
// // // // //           </Link>
// // // // //           <Link href="/careers" onClick={() => setIsOpen(false)} className="w-full py-2.5 text-center hover:text-secondary rounded-xl hover:bg-secondary/5 transition-colors">
// // // // //             Careers
// // // // //           </Link>
// // // // //           <Link href="/shop" onClick={() => setIsOpen(false)} className="w-full py-2.5 text-center hover:text-secondary rounded-xl hover:bg-secondary/5 transition-colors">
// // // // //             Shop
// // // // //           </Link>

// // // // //           <div className="w-full border-t border-gray-100 dark:border-gray-800 pt-4 mt-2 flex flex-col gap-3">
// // // // //             <a
// // // // //               href="https://tech-talk-dashboards.vercel.app"
// // // // //               target="_blank"
// // // // //               rel="noopener noreferrer"
// // // // //               onClick={() => setIsOpen(false)}
// // // // //               className="w-full py-2.5 text-center text-sm font-semibold text-text/80 bg-gray-100 dark:bg-gray-800 rounded-xl hover:text-secondary transition"
// // // // //             >
// // // // //               Login
// // // // //             </a>
            
// // // // //             <Link
// // // // //               href="/donate"
// // // // //               onClick={() => setIsOpen(false)}
// // // // //               className="w-full py-2.5 text-sm font-semibold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition text-center flex items-center justify-center gap-1.5 border border-primary/20 shadow-sm"
// // // // //             >
// // // // //               📚 Empower a Learner
// // // // //             </Link>

// // // // //             <Link href="/book-class" onClick={() => setIsOpen(false)} className="w-full">
// // // // //               <button className="w-full bg-secondary text-background py-3 rounded-xl font-bold shadow-md shadow-secondary/20 hover:opacity-95 transition">
// // // // //                 Book Trial
// // // // //               </button>
// // // // //             </Link>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     </nav>
// // // // //   );
// // // // // }
// // // // // // "use client";

// // // // // // import { useState, useEffect, useRef } from "react";
// // // // // // import { Menu, X, ChevronDown } from "lucide-react";
// // // // // // import Link from "next/link";
// // // // // // import Image from "next/image";

// // // // // // export default function NavBar() {
// // // // // //   const [isOpen, setIsOpen] = useState(false);
// // // // // //   const [scrolled, setScrolled] = useState(false);
// // // // // //   const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
// // // // // //   const dropdownRef = useRef(null);

// // // // // //   useEffect(() => {
// // // // // //     const handleScroll = () => setScrolled(window.scrollY > 20);
// // // // // //     window.addEventListener("scroll", handleScroll);
// // // // // //     return () => window.removeEventListener("scroll", handleScroll);
// // // // // //   }, []);

// // // // // //   // Close dropdown when clicking outside
// // // // // //   useEffect(() => {
// // // // // //     const handleClickOutside = (event) => {
// // // // // //       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
// // // // // //         setCoursesDropdownOpen(false);
// // // // // //       }
// // // // // //     };
// // // // // //     document.addEventListener("mousedown", handleClickOutside);
// // // // // //     return () => document.removeEventListener("mousedown", handleClickOutside);
// // // // // //   }, []);

// // // // // //   const handleScrollTo = (id) => {
// // // // // //     const el = document.getElementById(id);
// // // // // //     if (el) {
// // // // // //       el.scrollIntoView({ behavior: "smooth" });
// // // // // //       setIsOpen(false);
// // // // // //       setCoursesDropdownOpen(false);
// // // // // //     }
// // // // // //   };

// // // // // //   const courseCategories = [
// // // // // //     { name: "Scratch Programming", href: "/courses/scratch" },
// // // // // //     { name: "Python for Kids", href: "/courses/python" },
// // // // // //     { name: "Web Development for Kids", href: "/courses/web-development" },
// // // // // //   ];

// // // // // //   return (
// // // // // //     <nav
// // // // // //       className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
// // // // // //         scrolled
// // // // // //           ? "bg-background/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800"
// // // // // //           : "bg-transparent"
// // // // // //       }`}
// // // // // //     >
// // // // // //       <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
// // // // // //         {/* Brand Identity / Logo */}
// // // // // //         <div
// // // // // //           className="flex items-center space-x-3 cursor-pointer group"
// // // // // //           onClick={() => handleScrollTo("hero")}
// // // // // //         >
// // // // // //           <div className="relative w-10 h-10 overflow-hidden rounded-lg">
// // // // // //             <Image 
// // // // // //               src="/logo.png" 
// // // // // //               alt="Tech Talk Hub Logo" 
// // // // // //               fill 
// // // // // //               className="object-contain transition-transform group-hover:scale-105" 
// // // // // //               priority 
// // // // // //             />
// // // // // //           </div>
// // // // // //           <span className="font-bold text-xl tracking-tight text-primary">
// // // // // //             Tech Talk Hub
// // // // // //           </span>
// // // // // //         </div>

// // // // // //         {/* Desktop Anchor Paths */}
// // // // // //         <div className="hidden md:flex items-center space-x-8 text-text/85 font-medium">
// // // // // //           <button onClick={() => handleScrollTo("pricing")} className="transition-colors hover:text-secondary">
// // // // // //             Pricing
// // // // // //           </button>
          
// // // // // //           {/* Courses Dropdown */}
// // // // // //           <div className="relative" ref={dropdownRef}>
// // // // // //             <button
// // // // // //               onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
// // // // // //               className="flex items-center gap-1 transition-colors hover:text-secondary focus:outline-none py-2"
// // // // // //             >
// // // // // //               Courses
// // // // // //               <ChevronDown size={16} className={`transition-transform duration-200 ${coursesDropdownOpen ? "rotate-180" : ""}`} />
// // // // // //             </button>

// // // // // //             {coursesDropdownOpen && (
// // // // // //               <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl py-3 px-2 flex flex-col space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
// // // // // //                 {courseCategories.map((course, idx) => (
// // // // // //                   <Link
// // // // // //                     key={idx}
// // // // // //                     href={course.href}
// // // // // //                     onClick={() => setCoursesDropdownOpen(false)}
// // // // // //                     className="px-4 py-2.5 rounded-xl text-sm font-medium text-text/80 hover:text-secondary hover:bg-secondary/10 transition-colors"
// // // // // //                   >
// // // // // //                     {course.name}
// // // // // //                   </Link>
// // // // // //                 ))}
// // // // // //               </div>
// // // // // //             )}
// // // // // //           </div>

// // // // // //           <Link href="/blog" className="transition-colors hover:text-secondary">
// // // // // //             Blogs
// // // // // //           </Link>
// // // // // //           <Link href="/careers" className="transition-colors hover:text-secondary">
// // // // // //             Careers
// // // // // //           </Link>
// // // // // //           <Link href="/shop" className="transition-colors hover:text-secondary">
// // // // // //             Shop
// // // // // //           </Link>
// // // // // //         </div>

// // // // // //         {/* Desktop Entry Actions */}
// // // // // //         <div className="hidden md:flex items-center space-x-6">
// // // // // //           <a
// // // // // //             href="https://tech-talk-dashboards.vercel.app"
// // // // // //             target="_blank"
// // // // // //             rel="noopener noreferrer"
// // // // // //             className="text-text/80 font-medium transition-colors hover:text-secondary"
// // // // // //           >
// // // // // //             Login
// // // // // //           </a>

// // // // // //           <Link
// // // // // //             href="/donate"
// // // // // //             className="text-sm font-medium text-primary hover:text-secondary transition-colors animate-pulse flex items-center gap-1.5"
// // // // // //             title="Support Education Worldwide"
// // // // // //           >
// // // // // //             <span>📚</span> Empower a Learner
// // // // // //           </Link>

// // // // // //           <Link href="/book-class">
// // // // // //             <button className="bg-secondary text-background px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all">
// // // // // //               Book Trial
// // // // // //             </button>
// // // // // //           </Link>
// // // // // //         </div>

// // // // // //         {/* Mobile Toggle Button */}
// // // // // //         <div className="md:hidden flex items-center">
// // // // // //           <button
// // // // // //             onClick={() => setIsOpen(!isOpen)}
// // // // // //             aria-label="Toggle Menu"
// // // // // //             className="p-2 text-text focus:outline-none"
// // // // // //           >
// // // // // //             {isOpen ? <X size={24} /> : <Menu size={24} />}
// // // // // //           </button>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Mobile Drawer */}
// // // // // //       <div
// // // // // //         className={`md:hidden absolute top-full left-0 w-full bg-background border-b border-gray-100 dark:border-gray-800 shadow-lg transition-all duration-300 overflow-hidden ${
// // // // // //           isOpen ? "max-h-[550px] opacity-150 py-6" : "max-h-0 opacity-0 py-0"
// // // // // //         }`}
// // // // // //       >
// // // // // //         <div className="flex flex-col items-center space-y-3 text-text font-medium px-6">
// // // // // //           <button onClick={() => handleScrollTo("pricing")} className="w-full py-2 text-center hover:text-secondary">
// // // // // //             Pricing
// // // // // //           </button>
          
// // // // // //           {/* Mobile Courses Section */}
// // // // // //           <div className="w-full flex flex-col items-center py-1">
// // // // // //             <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Courses</span>
// // // // // //             {courseCategories.map((course, idx) => (
// // // // // //               <Link
// // // // // //                 key={idx}
// // // // // //                 href={course.href}
// // // // // //                 onClick={() => setIsOpen(false)}
// // // // // //                 className="w-full py-2 text-center text-sm text-text/80 hover:text-secondary"
// // // // // //               >
// // // // // //                 {course.name}
// // // // // //               </Link>
// // // // // //             ))}
// // // // // //           </div>

// // // // // //           <Link href="/blog" onClick={() => setIsOpen(false)} className="w-full py-2 text-center hover:text-secondary">
// // // // // //             Blogs
// // // // // //           </Link>
// // // // // //           <Link href="/careers" onClick={() => setIsOpen(false)} className="w-full py-2 text-center hover:text-secondary">
// // // // // //             Careers
// // // // // //           </Link>
// // // // // //           <Link href="/shop" onClick={() => setIsOpen(false)} className="w-full py-2 text-center hover:text-secondary">
// // // // // //             Shop
// // // // // //           </Link>
// // // // // //           <a
// // // // // //             href="https://tech-talk-dashboards.vercel.app"
// // // // // //             target="_blank"
// // // // // //             rel="noopener noreferrer"
// // // // // //             onClick={() => setIsOpen(false)}
// // // // // //             className="w-full py-2 text-center hover:text-secondary"
// // // // // //           >
// // // // // //             Login
// // // // // //           </a>

// // // // // //           <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
// // // // // //             <Link
// // // // // //               href="/donate"
// // // // // //               onClick={() => setIsOpen(false)}
// // // // // //               className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/25 transition text-center"
// // // // // //             >
// // // // // //               📚 Empower a Learner
// // // // // //             </Link>
// // // // // //             <Link href="/book-class" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
// // // // // //               <button className="w-full bg-secondary text-background px-6 py-2.5 rounded-xl font-bold shadow-sm hover:opacity-95 transition">
// // // // // //                 Book Trial
// // // // // //               </button>
// // // // // //             </Link>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </nav>
// // // // // //   );
// // // // // // }
// // // // // // // "use client";

// // // // // // // import { useState, useEffect } from "react";
// // // // // // // import { Menu, X } from "lucide-react";
// // // // // // // import Link from "next/link";
// // // // // // // import Image from "next/image";

// // // // // // // export default function NavBar() {
// // // // // // //   const [isOpen, setIsOpen] = useState(false);
// // // // // // //   const [scrolled, setScrolled] = useState(false);

// // // // // // //   useEffect(() => {
// // // // // // //     const handleScroll = () => setScrolled(window.scrollY > 20);
// // // // // // //     window.addEventListener("scroll", handleScroll);
// // // // // // //     return () => window.removeEventListener("scroll", handleScroll);
// // // // // // //   }, []);

// // // // // // //   const handleScrollTo = (id) => {
// // // // // // //     const el = document.getElementById(id);
// // // // // // //     if (el) {
// // // // // // //       el.scrollIntoView({ behavior: "smooth" });
// // // // // // //       setIsOpen(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <nav
// // // // // // //       className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
// // // // // // //         scrolled
// // // // // // //           ? "bg-background/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800"
// // // // // // //           : "bg-transparent"
// // // // // // //       }`}
// // // // // // //     >
// // // // // // //       <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
// // // // // // //         {/* Brand Identity / Logo */}
// // // // // // //         <div
// // // // // // //           className="flex items-center space-x-3 cursor-pointer group"
// // // // // // //           onClick={() => handleScrollTo("hero")}
// // // // // // //         >
// // // // // // //           <div className="relative w-10 h-10 overflow-hidden rounded-lg">
// // // // // // //             <Image 
// // // // // // //               src="/logo.png" 
// // // // // // //               alt="Tech Talk Hub Logo" 
// // // // // // //               fill 
// // // // // // //               className="object-contain transition-transform group-hover:scale-105" 
// // // // // // //               priority 
// // // // // // //             />
// // // // // // //           </div>
// // // // // // //           <span className="font-bold text-xl tracking-tight text-primary">
// // // // // // //             Tech Talk Hub
// // // // // // //           </span>
// // // // // // //         </div>

// // // // // // //         {/* Desktop Anchor Paths */}
// // // // // // //         <div className="hidden md:flex items-center space-x-8 text-text/80 font-medium">
// // // // // // //           <button onClick={() => handleScrollTo("pricing")} className="transition-colors hover:text-secondary">
// // // // // // //             Pricing
// // // // // // //           </button>
// // // // // // //           <button onClick={() => handleScrollTo("programs")} className="transition-colors hover:text-secondary">
// // // // // // //             Courses
// // // // // // //           </button>
// // // // // // //           <Link href="/blog" className="transition-colors hover:text-secondary">
// // // // // // //             Blogs
// // // // // // //           </Link>
// // // // // // //           <Link href="/careers" className="transition-colors hover:text-secondary">
// // // // // // //             Careers
// // // // // // //           </Link>
// // // // // // //           <Link href="/shop" className="transition-colors hover:text-secondary">
// // // // // // //             Shop
// // // // // // //           </Link>
// // // // // // //         </div>

// // // // // // //         {/* Desktop Entry Actions */}
// // // // // // //         <div className="hidden md:flex items-center space-x-6">
// // // // // // //           <a
// // // // // // //             href="https://tech-talk-dashboards.vercel.app"
// // // // // // //             target="_blank"
// // // // // // //             rel="noopener noreferrer"
// // // // // // //             className="text-text/80 font-medium transition-colors hover:text-secondary"
// // // // // // //           >
// // // // // // //             Login
// // // // // // //           </a>

// // // // // // //           <Link
// // // // // // //             href="/donate"
// // // // // // //             className="text-sm font-medium text-primary hover:text-secondary transition-colors animate-pulse flex items-center gap-1.5"
// // // // // // //             title="Support Education Worldwide"
// // // // // // //           >
// // // // // // //             <span>📚</span> Empower a Learner
// // // // // // //           </Link>

// // // // // // //           <Link href="/book-class">
// // // // // // //             <button className="bg-secondary text-background px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all">
// // // // // // //               Book Trial
// // // // // // //             </button>
// // // // // // //           </Link>
// // // // // // //         </div>

// // // // // // //         {/* Mobile Toggle Button */}
// // // // // // //         <div className="md:hidden flex items-center">
// // // // // // //           <button
// // // // // // //             onClick={() => setIsOpen(!isOpen)}
// // // // // // //             aria-label="Toggle Menu"
// // // // // // //             className="p-2 text-text focus:outline-none"
// // // // // // //           >
// // // // // // //             {isOpen ? <X size={24} /> : <Menu size={24} />}
// // // // // // //           </button>
// // // // // // //         </div>
// // // // // // //       </div>

// // // // // // //       {/* Mobile Drawer */}
// // // // // // //       <div
// // // // // // //         className={`md:hidden absolute top-full left-0 w-full bg-background border-b border-gray-100 dark:border-gray-800 shadow-lg transition-all duration-300 overflow-hidden ${
// // // // // // //           isOpen ? "max-h-[400px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
// // // // // // //         }`}
// // // // // // //       >
// // // // // // //         <div className="flex flex-col items-center space-y-4 text-text font-medium px-6">
// // // // // // //           <button onClick={() => handleScrollTo("pricing")} className="w-full py-2 text-center hover:text-secondary">
// // // // // // //             Pricing
// // // // // // //           </button>
// // // // // // //           <button onClick={() => handleScrollTo("programs")} className="w-full py-2 text-center hover:text-secondary">
// // // // // // //             Courses
// // // // // // //           </button>
// // // // // // //           <Link href="/blog" onClick={() => setIsOpen(false)} className="w-full py-2 text-center hover:text-secondary">
// // // // // // //             Blogs
// // // // // // //           </Link>
// // // // // // //           <Link href="/careers" onClick={() => setIsOpen(false)} className="w-full py-2 text-center hover:text-secondary">
// // // // // // //             Careers
// // // // // // //           </Link>
// // // // // // //           <Link href="/shop" onClick={() => setIsOpen(false)} className="w-full py-2 text-center hover:text-secondary">
// // // // // // //             Shop
// // // // // // //           </Link>
// // // // // // //           <a
// // // // // // //             href="https://tech-talk-dashboards.vercel.app"
// // // // // // //             target="_blank"
// // // // // // //             rel="noopener noreferrer"
// // // // // // //             onClick={() => setIsOpen(false)}
// // // // // // //             className="w-full py-2 text-center hover:text-secondary"
// // // // // // //           >
// // // // // // //             Login
// // // // // // //           </a>

// // // // // // //           <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
// // // // // // //             <Link
// // // // // // //               href="/donate"
// // // // // // //               onClick={() => setIsOpen(false)}
// // // // // // //               className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/25 transition text-center"
// // // // // // //             >
// // // // // // //               📚 Empower a Learner
// // // // // // //             </Link>
// // // // // // //             <Link href="/book-class" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
// // // // // // //               <button className="w-full bg-secondary text-background px-6 py-2.5 rounded-xl font-bold shadow-sm hover:opacity-95 transition">
// // // // // // //                 Book Trial
// // // // // // //               </button>
// // // // // // //             </Link>
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       </div>
// // // // // // //     </nav>
// // // // // // //   );
// // // // // // // }
// // // // // // // // "use client";
// // // // // // // // 
// // // // // // // // import { useState, useEffect } from "react";
// // // // // // // // import { Menu, X } from "lucide-react";
// // // // // // // // import Link from "next/link";
// // // // // // // // import Image from "next/image";

// // // // // // // // export default function NavBar() {
// // // // // // // //   const [isOpen, setIsOpen] = useState(false);
// // // // // // // //   const [scrolled, setScrolled] = useState(false);

// // // // // // // //   useEffect(() => {
// // // // // // // //     const handleScroll = () => setScrolled(window.scrollY > 20);
// // // // // // // //     window.addEventListener("scroll", handleScroll);
// // // // // // // //     return () => window.removeEventListener("scroll", handleScroll);
// // // // // // // //   }, []);

// // // // // // // //   const handleScrollTo = (id) => {
// // // // // // // //     const el = document.getElementById(id);
// // // // // // // //     if (el) {
// // // // // // // //       el.scrollIntoView({ behavior: "smooth" });
// // // // // // // //       setIsOpen(false);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   return (
// // // // // // // //     <nav
// // // // // // // //       className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
// // // // // // // //         scrolled
// // // // // // // //           ? "bg-background/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800"
// // // // // // // //           : "bg-transparent"
// // // // // // // //       }`}
// // // // // // // //     >
// // // // // // // //       <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
// // // // // // // //         {/* Brand Identity / Logo */}
// // // // // // // //         <div
// // // // // // // //           className="flex items-center space-x-3 cursor-pointer group"
// // // // // // // //           onClick={() => handleScrollTo("hero")}
// // // // // // // //         >
// // // // // // // //           <div className="relative w-10 h-10 overflow-hidden rounded-lg">
// // // // // // // //             <Image 
// // // // // // // //               src="/logo.png" 
// // // // // // // //               alt="Tech Talk Hub Logo" 
// // // // // // // //               fill 
// // // // // // // //               className="object-contain transition-transform group-hover:scale-105" 
// // // // // // // //               priority 
// // // // // // // //             />
// // // // // // // //           </div>
// // // // // // // //           <span className="font-bold text-xl tracking-tight text-primary">
// // // // // // // //             Tech Talk Hub
// // // // // // // //           </span>
// // // // // // // //         </div>

// // // // // // // //         {/* Desktop Anchor Paths */}
// // // // // // // //         <div className="hidden md:flex items-center space-x-8 text-text/80 font-medium">
// // // // // // // //           <button onClick={() => handleScrollTo("pricing")} className="transition-colors hover:text-secondary">
// // // // // // // //             Pricing
// // // // // // // //           </button>
// // // // // // // //           <button onClick={() => handleScrollTo("programs")} className="transition-colors hover:text-secondary">
// // // // // // // //             Courses
// // // // // // // //           </button>
// // // // // // // //           <button onClick={() => handleScrollTo("blogs")} className="transition-colors hover:text-secondary">
// // // // // // // //             Blogs
// // // // // // // //           </button>
// // // // // // // //           <Link href="/careers" className="transition-colors hover:text-secondary">
// // // // // // // //             Careers
// // // // // // // //           </Link>
// // // // // // // //           <Link href="/shop" className="transition-colors hover:text-secondary">
// // // // // // // //             Shop
// // // // // // // //           </Link>
// // // // // // // //         </div>

// // // // // // // //         {/* Desktop Entry Actions */}
// // // // // // // //         <div className="hidden md:flex items-center space-x-6">
// // // // // // // //           <a
// // // // // // // //             href="https://tech-talk-dashboards.vercel.app"
// // // // // // // //             target="_blank"
// // // // // // // //             rel="noopener noreferrer"
// // // // // // // //             className="text-text/80 font-medium transition-colors hover:text-secondary"
// // // // // // // //           >
// // // // // // // //             Login
// // // // // // // //           </a>

// // // // // // // //           <Link
// // // // // // // //             href="/donate"
// // // // // // // //             className="text-sm font-medium text-primary hover:text-secondary transition-colors animate-pulse flex items-center gap-1.5"
// // // // // // // //             title="Support Education Worldwide"
// // // // // // // //           >
// // // // // // // //             <span>📚</span> Empower a Learner
// // // // // // // //           </Link>

// // // // // // // //           <Link href="/book-class">
// // // // // // // //             <button className="bg-secondary text-background px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all">
// // // // // // // //               Book Trial
// // // // // // // //             </button>
// // // // // // // //           </Link>
// // // // // // // //         </div>

// // // // // // // //         {/* Mobile Toggle Button */}
// // // // // // // //         <div className="md:hidden flex items-center">
// // // // // // // //           <button
// // // // // // // //             onClick={() => setIsOpen(!isOpen)}
// // // // // // // //             aria-label="Toggle Menu"
// // // // // // // //             className="p-2 text-text focus:outline-none"
// // // // // // // //           >
// // // // // // // //             {isOpen ? <X size={24} /> : <Menu size={24} />}
// // // // // // // //           </button>
// // // // // // // //         </div>
// // // // // // // //       </div>

// // // // // // // //       {/* Mobile Drawer */}
// // // // // // // //       <div
// // // // // // // //         className={`md:hidden absolute top-full left-0 w-full bg-background border-b border-gray-100 dark:border-gray-800 shadow-lg transition-all duration-300 overflow-hidden ${
// // // // // // // //           isOpen ? "max-h-[400px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
// // // // // // // //         }`}
// // // // // // // //       >
// // // // // // // //         <div className="flex flex-col items-center space-y-4 text-text font-medium px-6">
// // // // // // // //           <button onClick={() => handleScrollTo("pricing")} className="w-full py-2 text-center hover:text-secondary">
// // // // // // // //             Pricing
// // // // // // // //           </button>
// // // // // // // //           <button onClick={() => handleScrollTo("programs")} className="w-full py-2 text-center hover:text-secondary">
// // // // // // // //             Courses
// // // // // // // //           </button>
// // // // // // // //           <button onClick={() => handleScrollTo("blogs")} className="w-full py-2 text-center hover:text-secondary">
// // // // // // // //             Blogs
// // // // // // // //           </button>
// // // // // // // //           <Link href="/careers" onClick={() => setIsOpen(false)} className="w-full py-2 text-center hover:text-secondary">
// // // // // // // //             Careers
// // // // // // // //           </Link>
// // // // // // // //           <Link href="/shop" onClick={() => setIsOpen(false)} className="w-full py-2 text-center hover:text-secondary">
// // // // // // // //             Shop
// // // // // // // //           </Link>
// // // // // // // //           <a
// // // // // // // //             href="https://tech-talk-dashboards.vercel.app"
// // // // // // // //             target="_blank"
// // // // // // // //             rel="noopener noreferrer"
// // // // // // // //             onClick={() => setIsOpen(false)}
// // // // // // // //             className="w-full py-2 text-center hover:text-secondary"
// // // // // // // //           >
// // // // // // // //             Login
// // // // // // // //           </a>

// // // // // // // //           <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
// // // // // // // //             <Link
// // // // // // // //               href="/donate"
// // // // // // // //               onClick={() => setIsOpen(false)}
// // // // // // // //               className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/25 transition text-center"
// // // // // // // //             >
// // // // // // // //               📚 Empower a Learner
// // // // // // // //             </Link>
// // // // // // // //             <Link href="/book-class" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
// // // // // // // //               <button className="w-full bg-secondary text-background px-6 py-2.5 rounded-xl font-bold shadow-sm hover:opacity-95 transition">
// // // // // // // //                 Book Trial
// // // // // // // //               </button>
// // // // // // // //             </Link>
// // // // // // // //           </div>
// // // // // // // //         </div>
// // // // // // // //       </div>
// // // // // // // //     </nav>
// // // // // // // //   );
// // // // // // // // }
// // // // // // // // // "use client";

// // // // // // // // import { useState, useEffect } from "react";
// // // // // // // // import { Menu, X } from "lucide-react";
// // // // // // // // import Link from "next/link";
// // // // // // // // import Image from "next/image";

// // // // // // // // export default function NavBar() {
// // // // // // // //   const [isOpen, setIsOpen] = useState(false);
// // // // // // // //   const [scrolled, setScrolled] = useState(false);

// // // // // // // //   useEffect(() => {
// // // // // // // //     const handleScroll = () => setScrolled(window.scrollY > 50);
// // // // // // // //     window.addEventListener("scroll", handleScroll);
// // // // // // // //     return () => window.removeEventListener("scroll", handleScroll);
// // // // // // // //   }, []);

// // // // // // // //   const handleScrollTo = (id) => {
// // // // // // // //     const el = document.getElementById(id);
// // // // // // // //     if (el) {
// // // // // // // //       el.scrollIntoView({ behavior: "smooth" });
// // // // // // // //       setIsOpen(false);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   return (
// // // // // // // //     <nav
// // // // // // // //       className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
// // // // // // // //         scrolled ? "bg-background shadow-md" : "bg-transparent"
// // // // // // // //       }`}
// // // // // // // //     >
// // // // // // // //       <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
// // // // // // // //         {/* Brand Identity / Logo */}
// // // // // // // //         <div
// // // // // // // //           className="flex items-center space-x-2 cursor-pointer"
// // // // // // // //           onClick={() => handleScrollTo("hero")}
// // // // // // // //         >
// // // // // // // //           <Image src="/logo.png" alt="Logo" width={60} height={40} priority />
// // // // // // // //           <span className="font-bold text-xl text-primary">Tech Talk Hub</span>
// // // // // // // //         </div>

// // // // // // // //         {/* Desktop Anchor Paths */}
// // // // // // // //         <div className="hidden md:flex space-x-8 text-text font-medium">
// // // // // // // //           <button onClick={() => handleScrollTo("pricing")} className="hover:text-secondary">Pricing</button>
        
// // // // // // // //           <button onClick={() => handleScrollTo("programs")} className="hover:text-secondary">Courses</button>
// // // // // // // //           <button onClick={() => handleScrollTo("blogs")} className="hover:text-secondary">Blogs</button>
// // // // // // // //           <Link href="/careers" className="hover:text-secondary flex items-center">Careers</Link>

// // // // // // // //           <button onClick={() => handleScrollTo("shop")} className="hover:text-secondary">Shop</button>
// // // // // // // //         </div>

// // // // // // // //         {/* Desktop Entry Actions */}
// // // // // // // //         <div className="hidden md:flex items-center space-x-4 relative">
// // // // // // // // <a 
// // // // // // // //   href="https://tech-talk-dashboards.vercel.app" 
// // // // // // // //   target="_blank" 
// // // // // // // //   rel="noopener noreferrer" 
// // // // // // // //   onClick={() => setIsOpen(false)} 
// // // // // // // //   className="hover:text-secondary"
// // // // // // // // >
// // // // // // // //   Login
// // // // // // // // </a>
// // // // // // // //           <div className="flex items-center space-x-3">
// // // // // // // //             <Link href="/book-class">
// // // // // // // //               <button className="bg-secondary text-background px-4 py-2 rounded-xl font-bold shadow-btn hover:bg-secondary-dark transition">
// // // // // // // //                 Book Trial
// // // // // // // //               </button>
// // // // // // // //             </Link>
// // // // // // // //             <Link
// // // // // // // //               href="/donate"
// // // // // // // //               className="text-sm text-primary font-medium hover:text-secondary animate-pulse"
// // // // // // // //               title="Support Education Worldwide"
// // // // // // // //             >
// // // // // // // //               📚 Empower a Learner
// // // // // // // //             </Link>
// // // // // // // //           </div>
// // // // // // // //         </div>

// // // // // // // //         {/* Mobile Toggle */}
// // // // // // // //         <div className="md:hidden flex items-center">
// // // // // // // //           <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
// // // // // // // //             {isOpen ? <X size={24} /> : <Menu size={24} />}
// // // // // // // //           </button>
// // // // // // // //         </div>
// // // // // // // //       </div>

// // // // // // // //       {/* Mobile Drawer */}
// // // // // // // //       {isOpen && (
// // // // // // // //         <div className="md:hidden bg-background shadow-md">
// // // // // // // //           <div className="flex flex-col items-center py-6 space-y-4 text-text font-medium">
// // // // // // // //             <button onClick={() => handleScrollTo("pricing")} className="hover:text-secondary">Pricing</button>
// // // // // // // //             <button onClick={() => handleScrollTo("contact")} className="hover:text-secondary">Contact</button>
// // // // // // // //             <button onClick={() => handleScrollTo("programs")} className="hover:text-secondary">Courses</button>
// // // // // // // //             <Link href="/careers" onClick={() => setIsOpen(false)} className="hover:text-secondary">Careers</Link>
// // // // // // // //             <Link href="/login" onClick={() => setIsOpen(false)} className="hover:text-secondary">Login</Link>

// // // // // // // //             <div className="flex items-center space-x-2">
// // // // // // // //               <Link href="/book-class" onClick={() => setIsOpen(false)}>
// // // // // // // //                 <button className="bg-secondary text-background px-4 py-2 rounded-xl font-bold shadow-btn hover:bg-secondary-dark">
// // // // // // // //                   Book Trial
// // // // // // // //                 </button>
// // // // // // // //               </Link>
// // // // // // // //               <Link
// // // // // // // //                 href="/donate"
// // // // // // // //                 onClick={() => setIsOpen(false)}
// // // // // // // //                 className="px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/20 animate-pulse transition"
// // // // // // // //               >
// // // // // // // //                 📚 Empower a Learner
// // // // // // // //               </Link>
// // // // // // // //             </div>
// // // // // // // //           </div>
// // // // // // // //         </div>
// // // // // // // //       )}
// // // // // // // //     </nav>
// // // // // // // //   );
// // // // // // // // }