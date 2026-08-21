/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//       },
//       {
//         protocol: 'https',
//         hostname: 'cdn.sanity.io',
//       },
//     ],
//   },
// };

// export default nextConfig;
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "*.supabase.co",
//         pathname: "/storage/v1/object/public/**",
//       },
//     ],
//   },
// };

// export default nextConfig;
// // /** @type {import('next').NextConfig} */
// // const nextConfig = {
// //   images: {
// //     remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
// //   },
// // };
// // export default nextConfig;

// // /** @type {import('next').NextConfig} */
// // const nextConfig = {
// //   images: {
// //     remotePatterns: [
// //       {
// //         protocol: 'https',
// //         hostname: 'cdn.sanity.io',
// //       },
// //     ],
// //   },
// // };

// // module.exports = nextConfig;