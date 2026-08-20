"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Loader2,
  PackageSearch,
  Search,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function ProgramShop({
  program,
  title,
  subtitle,
  searchPlaceholder,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .eq("is_active", true)
        .eq("program", program)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`Failed to load ${program} products:`, error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    }

    fetchProducts();
  }, [program]);

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

  function money(value, currency = "KES") {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
            {subtitle}
          </h2>
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary"
          />
        </div>
      </div>

      {/* Categories */}
      {categories.length > 1 && (
        <div className="mb-9 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeCategory === category
                  ? "bg-primary text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-purple-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty */}
      {!loading && filteredProducts.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
          <PackageSearch className="h-10 w-10 text-slate-300" />

          <h3 className="mt-4 text-lg font-bold text-slate-800">
            Products coming soon
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            We&apos;re preparing more learning resources.
          </p>
        </div>
      )}

      {/* Products */}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-purple-50">
                {product.badge && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-secondary px-3 py-1 text-[9px] font-bold uppercase text-white">
                    {product.badge}
                  </span>
                )}

                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
                    <BookOpen
                      size={48}
                      className="text-primary/40"
                    />
                  </div>
                )}
              </div>

              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {product.category}
                </p>

                <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-primary">
                  {product.name}
                </h3>

                {product.short_description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {product.short_description}
                  </p>
                )}

                <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-lg font-black text-primary">
                      {money(product.price, product.currency)}
                    </span>

                    {product.compare_at_price && (
                      <span className="ml-2 text-xs text-slate-400 line-through">
                        {money(
                          product.compare_at_price,
                          product.currency
                        )}
                      </span>
                    )}
                  </div>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}