import type { MetadataRoute } from "next";

import { supabase } from "../lib/supabase";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://techtalk-hub.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${baseUrl}/junior-coders`,
      changeFrequency: "monthly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/future-developers`,
      changeFrequency: "monthly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/tech-professionals`,
      changeFrequency: "monthly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/courses`,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/shop`,
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/book-class`,
      changeFrequency: "monthly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/careers`,
      changeFrequency: "monthly",
      priority: 0.6,
    },

    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },

    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },

    {
      url: `${baseUrl}/child-safety`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  try {
    const [
      productsResponse,
      blogResponse,
    ] = await Promise.all([
      supabase
        .from("shop_products")
        .select("slug, updated_at, created_at")
        .eq("is_active", true),

      supabase
        .from("blog_posts")
        .select(
          "slug, updated_at, published_at, created_at"
        )
        .eq("status", "published"),
    ]);

    if (productsResponse.error) {
      console.error(
        "Failed to fetch sitemap products:",
        productsResponse.error.message
      );
    }

    if (blogResponse.error) {
      console.error(
        "Failed to fetch sitemap blog posts:",
        blogResponse.error.message
      );
    }

    const productPages: MetadataRoute.Sitemap = (
      productsResponse.data || []
    )
      .filter((product) => product.slug)
      .map((product) => ({
        url: `${baseUrl}/shop/${encodeURIComponent(
          product.slug
        )}`,

        lastModified: new Date(
          product.updated_at ||
            product.created_at ||
            Date.now()
        ),

        changeFrequency: "weekly" as const,

        priority: 0.8,
      }));

    const blogPages: MetadataRoute.Sitemap = (
      blogResponse.data || []
    )
      .filter((post) => post.slug)
      .map((post) => ({
        url: `${baseUrl}/blog/${encodeURIComponent(
          post.slug
        )}`,

        lastModified: new Date(
          post.updated_at ||
            post.published_at ||
            post.created_at ||
            Date.now()
        ),

        changeFrequency: "monthly" as const,

        priority: 0.7,
      }));

    return [
      ...staticPages,
      ...productPages,
      ...blogPages,
    ];
  } catch (error) {
    console.error("Failed to generate sitemap:", error);

    return staticPages;
  }
}
// import type { MetadataRoute } from 'next'

// export default function sitemap(): MetadataRoute.Sitemap {
//   const baseUrl = 'https://techtalk-hub.com'

//   return [
//     {
//       url: baseUrl,
//       priority: 1,
//     },
//     {
//       url: `${baseUrl}/junior-coders`,
//       priority: 0.9,
//     },
//     {
//       url: `${baseUrl}/future-developers`,
//       priority: 0.9,
//     },
//     {
//       url: `${baseUrl}/courses`,
//       priority: 0.9,
//     },
//     {
//       url: `${baseUrl}/shop`,
//       priority: 0.8,
//     },
//     {
//       url: `${baseUrl}/about`,
//       priority: 0.7,
//     },
//     {
//       url: `${baseUrl}/book-trial`,
//       priority: 0.9,
//     },
//   ]
// }

// import { supabase } from "../lib/supabase";

// export default async function sitemap() {
//   const baseUrl = "https://techtalk-hub.com";

//   const staticPages = [
//     {
//       url: baseUrl,

//       lastModified: new Date(),

//       changeFrequency: "weekly",

//       priority: 1,
//     },

//     {
//       url: `${baseUrl}/about`,

//       lastModified: new Date(),

//       changeFrequency: "monthly",

//       priority: 0.8,
//     },

//     {
//       url: `${baseUrl}/shop`,

//       lastModified: new Date(),

//       changeFrequency: "daily",

//       priority: 0.9,
//     },

//     {
//       url: `${baseUrl}/blog`,

//       lastModified: new Date(),

//       changeFrequency: "weekly",

//       priority: 0.8,
//     },

//     {
//       url: `${baseUrl}/book-class`,

//       lastModified: new Date(),

//       changeFrequency: "monthly",

//       priority: 0.9,
//     },

//     {
//       url: `${baseUrl}/careers`,

//       lastModified: new Date(),

//       changeFrequency: "monthly",

//       priority: 0.6,
//     },

//     {
//       url: `${baseUrl}/privacy`,

//       lastModified: new Date(),

//       changeFrequency: "yearly",

//       priority: 0.3,
//     },

//     {
//       url: `${baseUrl}/terms`,

//       lastModified: new Date(),

//       changeFrequency: "yearly",

//       priority: 0.3,
//     },

//     {
//       url: `${baseUrl}/child-safety`,

//       lastModified: new Date(),

//       changeFrequency: "yearly",

//       priority: 0.4,
//     },
//   ];

//   const [
//     productsResponse,
//     blogResponse,
//   ] = await Promise.all([
//     supabase
//       .from("shop_products")
//       .select("slug, updated_at, created_at")
//       .eq("is_active", true),

//     supabase
//       .from("blog_posts")
//       .select(
//         "slug, updated_at, published_at, created_at"
//       )
//       .eq("status", "published"),
//   ]);

//   const productPages = (
//     productsResponse.data || []
//   ).map((product) => ({
//     url: `${baseUrl}/shop/${product.slug}`,

//     lastModified: new Date(
//       product.updated_at ||
//         product.created_at ||
//         Date.now()
//     ),

//     changeFrequency: "weekly",

//     priority: 0.8,
//   }));

//   const blogPages = (
//     blogResponse.data || []
//   ).map((post) => ({
//     url: `${baseUrl}/blog/${post.slug}`,

//     lastModified: new Date(
//       post.updated_at ||
//         post.published_at ||
//         post.created_at ||
//         Date.now()
//     ),

//     changeFrequency: "monthly",

//     priority: 0.7,
//   }));

//   return [
//     ...staticPages,
//     ...productPages,
//     ...blogPages,
//   ];
// }