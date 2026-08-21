export default function robots() {
  return {
    rules: {
      userAgent: "*",

      allow: "/",

      disallow: [
        "/admin/",
        "/dashboard/",
        "/login/",
        "/cart/",
        "/checkout/",
        "/favorites/",
      ],
    },

    sitemap:
      "https://techtalk-hub.com/sitemap.xml",
  };
}