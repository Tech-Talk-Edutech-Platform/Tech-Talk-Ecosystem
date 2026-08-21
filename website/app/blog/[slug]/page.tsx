import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock3,
  Heart,
  UserRound,
} from "lucide-react";
 import { supabase } from "../../lib/supabase";
export const revalidate = 60;

function formatDate(date) {
  if (!date) return "Recently published";

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function calculateReadingTime(content = "") {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

async function getPost(slug) {


  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch article:", error);
    return null;
  }

  return data;
}

async function getRelatedPosts(post) {
  const supabase = await createClient();

  let query = supabase
    .from("blog_posts")
    .select(
      `
        id,
        slug,
        title,
        excerpt,
        category,
        cover_image_url,
        published_at,
        created_at
      `
    )
    .eq("status", "published")
    .neq("id", post.id)
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(3);

  if (post.category) {
    query = query.eq("category", post.category);
  }

  const { data } = await query;

  return data || [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Article Not Found | Tech Talk Hub",
    };
  }

  return {
    title: `${post.title} | Tech Talk Hub`,
    description:
      post.excerpt ||
      "Read the latest insights from Tech Talk Hub.",

    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      type: "article",
      publishedTime: post.published_at,
      images: post.cover_image_url
        ? [
            {
              url: post.cover_image_url,
              alt: post.title,
            },
          ]
        : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);
  const readingTime = calculateReadingTime(
    post.content
  );

  return (
    <main className="min-h-screen bg-white text-[#172554]">
      {/* Article header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-white via-[#FBF9FF] to-[#F0E8FF] px-6 pb-16 pt-32 lg:px-8">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#9B6CFF]/10 blur-[100px]" />

        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#FF3F7F]/10 blur-[110px]" />

        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#FF3F7F]"
          >
            <ArrowLeft size={17} />
            Back to all stories
          </Link>

          <span className="block w-fit rounded-full bg-pink-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
            {post.category || "Tech Talk Hub"}
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#2947C7] sm:text-6xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
              {post.excerpt}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <UserRound size={16} />
              Tech Talk Hub Team
            </span>

            <span className="flex items-center gap-2">
              <Calendar size={16} />

              {formatDate(
                post.published_at || post.created_at
              )}
            </span>

            <span className="flex items-center gap-2">
              <Clock3 size={16} />
              {readingTime} min read
            </span>
          </div>
        </div>
      </header>

      {/* Cover image */}
      {post.cover_image_url && (
        <section className="relative z-10 mx-auto -mt-4 max-w-6xl px-6 lg:px-8">
          <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-purple-900/10">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
            />
          </div>
        </section>
      )}

      {/* Content */}
      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-[#2947C7] prose-a:font-bold prose-a:text-[#FF3F7F] prose-strong:text-[#172554]">
          {post.content
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((paragraph, index) => (
              <p
                key={index}
                className="whitespace-pre-line text-base leading-8 text-slate-700 sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
        </div>

        <div className="mt-14 rounded-3xl border border-purple-100 bg-[#F8F4FF] p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[#FF3F7F]">
              <Heart
                size={20}
                fill="currentColor"
              />
            </span>

            <div>
              <h2 className="font-black text-[#2947C7]">
                Help your child continue learning
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explore a personalized Tech Talk Hub coding
                program designed for their age and interests.
              </p>

              <Link
                href="/book-class"
                className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#FF3F7F]"
              >
                Book a free trial
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related stories */}
      {relatedPosts.length > 0 && (
        <section className="bg-[#FBFAFF] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-3xl font-black text-[#2947C7]">
              Continue reading
            </h2>

            <div className="mt-9 grid gap-7 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {relatedPost.cover_image_url && (
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="relative block aspect-[16/10] overflow-hidden"
                    >
                      <Image
                        src={relatedPost.cover_image_url}
                        alt={relatedPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </Link>
                  )}

                  <div className="p-6">
                    <p className="text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
                      {relatedPost.category ||
                        "Tech Talk Hub"}
                    </p>

                    <h3 className="mt-3 text-xl font-black text-[#2947C7]">
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>

                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#FF3F7F]"
                    >
                      Read Story
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
// import Image from "next/image";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import {
//   ArrowLeft,
//   Calendar,
//   UserRound,
// } from "lucide-react";

// import { supabase } from "../../../lib/supabase";

// export const revalidate = 60;

// function formatDate(date) {
//   if (!date) return "Recently published";

//   return new Intl.DateTimeFormat("en-KE", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   }).format(new Date(date));
// }

// async function getPost(slug) {

//   const { data: post, error } = await supabase
//     .from("blog_posts")
//     .select(
//       `
//         id,
//         slug,
//         title,
//         excerpt,
//         content,
//         category,
//         cover_image_url,
//         published_at,
//         created_at
//       `
//     )
//     .eq("slug", slug)
//     .eq("status", "published")
//     .maybeSingle();

//   if (error) {
//     console.error("Failed to fetch blog post:", error);
//     return null;
//   }

//   return post;
// }

// export async function generateMetadata({ params }) {
//   const { slug } = await params;
//   const post = await getPost(slug);

//   if (!post) {
//     return {
//       title: "Article Not Found | Tech Talk Hub",
//     };
//   }

//   return {
//     title: `${post.title} | Tech Talk Hub`,
//     description:
//       post.excerpt ||
//       "Read the latest insights from Tech Talk Hub.",

//     openGraph: {
//       title: post.title,
//       description: post.excerpt || "",
//       type: "article",
//       publishedTime: post.published_at,
//       images: post.cover_image_url
//         ? [{ url: post.cover_image_url }]
//         : [],
//     },
//   };
// }

// export default async function BlogPostPage({ params }) {
//   const { slug } = await params;
//   const post = await getPost(slug);

//   if (!post) {
//     notFound();
//   }

//   return (
//     <main className="min-h-screen bg-background pb-24 pt-28 text-text selection:bg-secondary/20">
//       <article className="mx-auto max-w-4xl px-6">
//         {/* Back link */}
//         <Link
//           href="/blog"
//           className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-text/60 transition-colors hover:text-secondary"
//         >
//           <ArrowLeft size={16} />
//           Back to all articles
//         </Link>

//         {/* Article header */}
//         <header className="mb-10">
//           <span className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
//             {post.category || "Tech Talk Hub"}
//           </span>

//           <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-text sm:text-5xl">
//             {post.title}
//           </h1>

//           {post.excerpt && (
//             <p className="mt-5 max-w-3xl text-lg leading-8 text-text/70 sm:text-xl">
//               {post.excerpt}
//             </p>
//           )}

//           <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-text/60">
//             <span className="flex items-center gap-2">
//               <Calendar size={15} />

//               {formatDate(
//                 post.published_at || post.created_at
//               )}
//             </span>

//             <span className="flex items-center gap-2">
//               <UserRound size={15} />
//               Tech Talk Hub Team
//             </span>
//           </div>
//         </header>

//         {/* Cover image */}
//         {post.cover_image_url && (
//           <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100 shadow-lg">
//             <Image
//               src={post.cover_image_url}
//               alt={post.title}
//               fill
//               priority
//               sizes="(max-width: 896px) 100vw, 896px"
//               className="object-cover"
//             />
//           </div>
//         )}

//         {/* Article body */}
//         <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-text prose-a:text-secondary prose-strong:text-text">
//           {post.content
//             .split(/\n{2,}/)
//             .filter(Boolean)
//             .map((paragraph, index) => (
//               <p
//                 key={index}
//                 className="whitespace-pre-line leading-8 text-text/80"
//               >
//                 {paragraph}
//               </p>
//             ))}
//         </div>

//         {/* Bottom navigation */}
//         <div className="mt-16 border-t border-gray-200 pt-8 dark:border-gray-800">
//           <Link
//             href="/blog"
//             className="inline-flex items-center gap-2 font-bold text-secondary"
//           >
//             <ArrowLeft size={17} />
//             View all articles
//           </Link>
//         </div>
//       </article>
//     </main>
//   );
// }
// // import Image from "next/image";
// // import Link from "next/link";
// // import { notFound } from "next/navigation";
// // import {
// //   ArrowLeft,
// //   Calendar,
// //   UserRound,
// // } from "lucide-react";

// // import { createClient } from "../../../lib/supabase/server";

// // export const revalidate = 60;

// // function formatDate(date) {
// //   if (!date) return "Recently published";

// //   return new Intl.DateTimeFormat("en-KE", {
// //     day: "numeric",
// //     month: "long",
// //     year: "numeric",
// //   }).format(new Date(date));
// // }

// // async function getPost(slug) {
// //   const supabase = await createClient();

// //   const { data: post, error } = await supabase
// //     .from("blog_posts")
// //     .select(
// //       `
// //         id,
// //         slug,
// //         title,
// //         excerpt,
// //         content,
// //         category,
// //         cover_image_url,
// //         published_at,
// //         created_at
// //       `
// //     )
// //     .eq("slug", slug)
// //     .eq("status", "published")
// //     .maybeSingle();

// //   if (error) {
// //     console.error("Failed to fetch blog post:", error);
// //     return null;
// //   }

// //   return post;
// // }

// // export async function generateMetadata({ params }) {
// //   const { slug } = await params;
// //   const post = await getPost(slug);

// //   if (!post) {
// //     return {
// //       title: "Article Not Found | Tech Talk Hub",
// //     };
// //   }

// //   return {
// //     title: `${post.title} | Tech Talk Hub`,
// //     description:
// //       post.excerpt ||
// //       "Read the latest insights from Tech Talk Hub.",

// //     openGraph: {
// //       title: post.title,
// //       description: post.excerpt || "",
// //       type: "article",
// //       publishedTime: post.published_at,
// //       images: post.cover_image_url
// //         ? [{ url: post.cover_image_url }]
// //         : [],
// //     },
// //   };
// // }

// // export default async function BlogPostPage({ params }) {
// //   const { slug } = await params;
// //   const post = await getPost(slug);

// //   if (!post) {
// //     notFound();
// //   }

// //   return (
// //     <main className="min-h-screen bg-background pb-24 pt-28 text-text selection:bg-secondary/20">
// //       <article className="mx-auto max-w-4xl px-6">
// //         {/* Back link */}
// //         <Link
// //           href="/blog"
// //           className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-text/60 transition-colors hover:text-secondary"
// //         >
// //           <ArrowLeft size={16} />
// //           Back to all articles
// //         </Link>

// //         {/* Article header */}
// //         <header className="mb-10">
// //           <span className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
// //             {post.category || "Tech Talk Hub"}
// //           </span>

// //           <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-text sm:text-5xl">
// //             {post.title}
// //           </h1>

// //           {post.excerpt && (
// //             <p className="mt-5 max-w-3xl text-lg leading-8 text-text/70 sm:text-xl">
// //               {post.excerpt}
// //             </p>
// //           )}

// //           <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-text/60">
// //             <span className="flex items-center gap-2">
// //               <Calendar size={15} />

// //               {formatDate(
// //                 post.published_at || post.created_at
// //               )}
// //             </span>

// //             <span className="flex items-center gap-2">
// //               <UserRound size={15} />
// //               Tech Talk Hub Team
// //             </span>
// //           </div>
// //         </header>

// //         {/* Cover image */}
// //         {post.cover_image_url && (
// //           <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100 shadow-lg">
// //             <Image
// //               src={post.cover_image_url}
// //               alt={post.title}
// //               fill
// //               priority
// //               sizes="(max-width: 896px) 100vw, 896px"
// //               className="object-cover"
// //             />
// //           </div>
// //         )}

// //         {/* Article body */}
// //         <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-text prose-a:text-secondary prose-strong:text-text">
// //           {post.content
// //             .split(/\n{2,}/)
// //             .filter(Boolean)
// //             .map((paragraph, index) => (
// //               <p
// //                 key={index}
// //                 className="whitespace-pre-line leading-8 text-text/80"
// //               >
// //                 {paragraph}
// //               </p>
// //             ))}
// //         </div>

// //         {/* Bottom navigation */}
// //         <div className="mt-16 border-t border-gray-200 pt-8 dark:border-gray-800">
// //           <Link
// //             href="/blog"
// //             className="inline-flex items-center gap-2 font-bold text-secondary"
// //           >
// //             <ArrowLeft size={17} />
// //             View all articles
// //           </Link>
// //         </div>
// //       </article>
// //     </main>
// //   );
// // }
// // // import { ArrowLeft, Calendar } from "lucide-react";
// // // import Link from "next/link";

// // // export default async function BlogPostPage({ params }) {
// // //   const { slug } = await params;

// // //   // In a real application, fetch post data using the `slug` from your DB/CMS/Supabase
// // //   return (
// // //     <main className="min-h-screen bg-background text-text selection:bg-secondary/20 pt-28 pb-24">
// // //       <article className="max-w-3xl mx-auto px-6">
// // //         <Link 
// // //           href="/blog" 
// // //           className="inline-flex items-center gap-2 text-sm font-medium text-text/60 hover:text-secondary mb-8 transition-colors"
// // //         >
// // //           <ArrowLeft size={16} /> Back to all articles
// // //         </Link>

// // //         <div className="space-y-4 mb-8">
// // //           <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
// // //             Engineering
// // //           </span>
// // //           <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-text">
// // //             Building Scalable Backend Systems with Python & FastAPI
// // //           </h1>
// // //           <div className="flex items-center gap-2 text-sm text-text/60">
// // //             <Calendar size={14} /> August 10, 2026 • Published by Tech Talk Hub Team
// // //           </div>
// // //         </div>

// // //         {/* Blog Body Content */}
// // //         <div className="prose dark:prose-invert max-w-none text-text/80 space-y-6 text-base sm:text-lg leading-relaxed">
// // //           <p>
// // //             Welcome to our technical breakdown. When scaling backend infrastructure, performance and data cleanliness are paramount...
// // //           </p>
// // //           <h2 className="text-2xl font-bold text-text pt-4">1. Architecture Overview</h2>
// // //           <p>
// // //             By leveraging asynchronous routing and clean repository patterns, our systems maintain swift response times even under heavy traffic...
// // //           </p>
// // //         </div>
// // //       </article>
// // //     </main>
// // //   );
// // // }