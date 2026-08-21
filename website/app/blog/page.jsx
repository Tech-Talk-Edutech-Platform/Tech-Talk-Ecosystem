import Image from "next/image";
import Link from "next/link";
import NavBar from "../../components/NavBar";

import {
  ArrowRight,
  BookOpen,
  Calendar,
  Code2,
  GraduationCap,
  Heart,
  Lightbulb,
  Sparkles,
  Users,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import AppFooter from "../../components/Footer";

export const metadata = {
  title: "Blog",

  description:
    "Practical coding guidance, learner stories and technology insights for families raising Africa’s next generation of innovators.",
};

export const revalidate = 60;

const categories = [
  {
    label: "All Stories",
    value: "all",
    icon: Sparkles,
  },
  {
    label: "Coding for Kids",
    value: "Coding for Kids",
    icon: Code2,
  },
  {
    label: "Parent Guides",
    value: "Parent Guides",
    icon: Users,
  },
  {
    label: "Student Stories",
    value: "Student Stories",
    icon: GraduationCap,
  },
  {
    label: "Education",
    value: "Education",
    icon: BookOpen,
  },
  {
    label: "Technology",
    value: "Technology",
    icon: Lightbulb,
  },
];

function formatDate(date) {
  if (!date) {
    return "Recently published";
  }

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function PostImage({
  post,
  fallbackSrc = null,
  sizes,
  priority = false,
  objectPosition = "object-center",
}) {
  const imageSource = post?.cover_image_url || fallbackSrc;

  if (!imageSource) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2947C7] via-[#7252D3] to-[#FF3F7F]">
        <div className="text-center text-white">
          <BookOpen
            size={38}
            className="mx-auto"
          />

          <p className="mt-3 text-xs font-black uppercase tracking-widest">
            Tech Talk Hub
          </p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={imageSource}
      alt={post?.title || "Tech Talk Hub story"}
      fill
      priority={priority}
      sizes={sizes}
      className={`object-cover ${objectPosition} transition-transform duration-500 group-hover:scale-105`}
    />
  );
}

export default async function BlogIndexPage({
  searchParams,
}) {
  const filters = await searchParams;

  const selectedCategory = filters?.category || "all";

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
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (selectedCategory !== "all") {
    query = query.eq("category", selectedCategory);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch blog posts:", error);
  }

  const posts = data || [];
  const featuredPost = posts[0];
  const latestPosts = posts.slice(1);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#172554]">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-purple-100 bg-gradient-to-br from-white via-[#FBF9FF] to-[#F0E8FF] pt-20">
        {/* Background glows */}
        <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-[#9B6CFF]/10 blur-[100px]" />

        <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#FF3F7F]/10 blur-[110px]" />

        {/* Subtle background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(#2947C7 1px, transparent 1px),
              linear-gradient(90deg, #2947C7 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative grid lg:min-h-[460px] lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            {/* Hero copy */}
            <div className="relative z-20 max-w-xl py-12 text-center sm:py-14 lg:py-12 lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#9B6CFF]/25 bg-white/85 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#2947C7] shadow-sm backdrop-blur-sm">
                <Sparkles
                  size={15}
                  className="text-[#FF3F7F]"
                />

                <span>Tech Talk Hub Stories</span>
              </div>

              <h1 className="text-4xl font-black leading-[1.07] tracking-tight text-[#2947C7] sm:text-5xl lg:text-[3.35rem] xl:text-[3.6rem]">
                Ideas that{" "}
                <span className="text-[#FF3F7F]">
                  inspire
                </span>{" "}
                young creators.
              </h1>

              <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg lg:mx-0">
                Practical guidance, learner stories and
                technology insights for families raising
                Africa’s next generation of innovators.
              </p>

              <Link
                href="#latest-stories"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#FF3F7F] px-7 py-3.5 font-bold text-white shadow-lg shadow-pink-500/20 transition-all hover:-translate-y-0.5 hover:bg-[#E93470]"
              >
                Explore Latest Stories

                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Desktop hero image */}
            <div className="relative hidden h-full min-h-[460px] lg:block">
              <div
                className="pointer-events-none absolute inset-y-0 -left-10 -right-16 xl:-right-24"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 12%, black 32%, black 88%, rgba(0,0,0,0.7) 100%)",

                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 12%, black 32%, black 88%, rgba(0,0,0,0.7) 100%)",
                }}
              >
                <Image
                  src="/blog-hero.png"
                  alt="African tutor encouraging a young learner during a coding lesson"
                  fill
                  priority
                  sizes="(min-width: 1280px) 700px, 55vw"
                  className="object-cover object-center"
                />

                {/* Left blend */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FBF9FF]/90 via-transparent to-transparent" />

                {/* Top and bottom blend */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#F0E8FF]/65 via-transparent to-[#FBF9FF]/20" />

                {/* Right blend */}
                <div className="absolute inset-0 bg-gradient-to-l from-[#F0E8FF]/35 via-transparent to-transparent" />

                {/* Subtle brand tint */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#FF3F7F]/10" />
              </div>

              {/* Floating note */}
              <div className="absolute bottom-8 right-0 z-10 max-w-[260px] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg shadow-purple-900/10 backdrop-blur-md xl:right-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[#FF3F7F]">
                    <Heart
                      size={18}
                      fill="currentColor"
                    />
                  </span>

                  <p className="text-sm font-bold leading-6 text-[#2947C7]">
                    Every child’s journey starts with one
                    idea.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile hero image */}
          <div className="relative mx-auto -mt-4 h-[260px] w-full max-w-xl overflow-hidden sm:h-[340px] lg:hidden">
            <div
              className="absolute inset-0"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 14%, black 80%, transparent 100%)",

                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 14%, black 80%, transparent 100%)",
              }}
            >
              <Image
                src="/blog-hero.png"
                alt="African tutor encouraging a young learner during a coding lesson"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#FBF9FF]/45 via-transparent to-[#F0E8FF]/35" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#F0E8FF]/65 via-transparent to-transparent" />
            </div>

            {/* Mobile floating note */}
            <div className="absolute bottom-5 right-3 z-10 max-w-[225px] rounded-2xl border border-white/80 bg-white/90 p-3 shadow-lg backdrop-blur-md sm:right-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[#FF3F7F]">
                  <Heart
                    size={16}
                    fill="currentColor"
                  />
                </span>

                <p className="text-xs font-bold leading-5 text-[#2947C7]">
                  Every child’s journey starts with one idea.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl overflow-x-auto px-6 py-5 lg:px-8">
          <div className="flex min-w-max justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon;

              const active =
                selectedCategory === category.value;

              const href =
                category.value === "all"
                  ? "/blog"
                  : `/blog?category=${encodeURIComponent(
                      category.value
                    )}`;

              return (
                <Link
                  key={category.value}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-all ${
                    active
                      ? "border-[#2947C7] bg-[#2947C7] text-white shadow-md shadow-blue-900/15"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#9B6CFF]/50 hover:bg-purple-50 hover:text-[#2947C7]"
                  }`}
                >
                  <Icon size={16} />

                  {category.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {posts.length > 0 ? (
        <>
          {/* Featured article */}
          {featuredPost && (
            <section
              id="latest-stories"
              className="mx-auto max-w-7xl scroll-mt-24 px-6 py-12 lg:px-8"
            >
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
                  Featured Story
                </p>

                <h2 className="mt-2 text-3xl font-black text-[#2947C7]">
                  Start here
                </h2>
              </div>

              <article className="group grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5 transition hover:shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
                {/* Featured image */}
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="relative min-h-[300px] overflow-hidden bg-slate-100 lg:min-h-[390px]"
                >
                  <PostImage
                    post={featuredPost}
                    fallbackSrc="/blog-boy-laptop.png"
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    objectPosition="object-center"
                  />
                </Link>

                {/* Featured article copy */}
                <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-10">
                  <span className="w-fit rounded-full bg-pink-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
                    {featuredPost.category ||
                      "Tech Talk Hub"}
                  </span>

                  <h2 className="mt-5 text-3xl font-black leading-tight text-[#2947C7] sm:text-4xl">
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="transition hover:text-[#FF3F7F]"
                    >
                      {featuredPost.title}
                    </Link>
                  </h2>

                  {featuredPost.excerpt && (
                    <p className="mt-4 text-base leading-7 text-slate-600">
                      {featuredPost.excerpt}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-5">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={15} />

                      {formatDate(
                        featuredPost.published_at ||
                          featuredPost.created_at
                      )}
                    </span>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-black text-[#FF3F7F]"
                    >
                      Read Story

                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            </section>
          )}

          {/* Latest stories */}
          {latestPosts.length > 0 && (
            <section className="bg-[#FBFAFF] py-14">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
                      Keep Learning
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-[#2947C7] sm:text-4xl">
                      Latest Stories
                    </h2>
                  </div>

                  {selectedCategory !== "all" && (
                    <Link
                      href="/blog"
                      className="hidden items-center gap-2 text-sm font-bold text-[#FF3F7F] sm:inline-flex"
                    >
                      View all stories

                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>

                <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                  {latestPosts.map((post) => (
                    <article
                      key={post.id}
                      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#9B6CFF]/40 hover:shadow-xl"
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="relative block aspect-[16/10] overflow-hidden"
                      >
                        <PostImage
                          post={post}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </Link>

                      <div className="flex flex-1 flex-col p-6">
                        <p className="text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
                          {post.category || "Tech Talk Hub"}
                        </p>

                        <h3 className="mt-3 text-xl font-black leading-snug text-[#2947C7]">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="transition hover:text-[#FF3F7F]"
                          >
                            {post.title}
                          </Link>
                        </h3>

                        {post.excerpt && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
                          <span className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar size={13} />

                            {formatDate(
                              post.published_at ||
                                post.created_at
                            )}
                          </span>

                          <Link
                            href={`/blog/${post.slug}`}
                            aria-label={`Read ${post.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-[#2947C7] transition hover:bg-[#FF3F7F] hover:text-white"
                          >
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section
          id="latest-stories"
          className="mx-auto max-w-5xl scroll-mt-24 px-6 py-12"
        >
          <div className="grid overflow-hidden rounded-[2rem] border border-purple-100 bg-white shadow-lg md:grid-cols-2">
            <div className="relative min-h-[280px]">
              <Image
                src="/blog-boy-laptop.png"
                alt="Young African coder working on a laptop"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>

            <div className="flex flex-col justify-center p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
                Stories Coming Soon
              </p>

              <h2 className="mt-3 text-3xl font-black text-[#2947C7]">
                New ideas are being created.
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                We are preparing practical coding guidance,
                student stories and technology insights for
                families raising young creators.
              </p>

              {selectedCategory !== "all" && (
                <Link
                  href="/blog"
                  className="mt-6 inline-flex items-center gap-2 font-bold text-[#FF3F7F]"
                >
                  View all categories

                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Founder note */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-purple-100 bg-gradient-to-r from-[#F7F2FF] to-white p-8 shadow-sm sm:p-10">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#9B6CFF]/10 blur-3xl" />

            <div className="relative grid items-center gap-8 md:grid-cols-[160px_1fr]">
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-3xl bg-purple-100 shadow-lg md:mx-0">
                <Image
                  src="/founder.jpg"
                  alt="Justin Akinyi, founder of Tech Talk Hub"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
                  A note from our founder
                </p>

                <h2 className="mt-3 text-2xl font-black text-[#2947C7] sm:text-3xl">
                  Every child deserves the opportunity to
                  create with technology.
                </h2>

                <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                  Technology should not only be something
                  children consume. It should become a tool
                  they use to express ideas, solve problems
                  and build confidently. Tech Talk Hub exists
                  to make that journey practical, personal
                  and inspiring.
                </p>

                <p className="mt-4 font-black text-[#2947C7]">
                  — Justin Akinyi, Founder
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-6 pb-16 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#2947C7] px-7 py-10 text-white shadow-2xl shadow-blue-950/15 sm:px-12">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#9B6CFF]/30 blur-3xl" />

          <div className="absolute -bottom-24 right-0 h-60 w-60 rounded-full bg-[#FF3F7F]/25 blur-3xl" />

          <div className="relative flex flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-200">
                Continue the journey
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Grow with your young creator.
              </h2>

              <p className="mt-3 max-w-xl text-blue-100">
                Explore a personalized coding program
                designed for your child’s age and interests.
              </p>
            </div>

            <Link
              href="/book-class"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#FF3F7F] px-7 py-4 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#E93470]"
            >
              Book a Free Trial

              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <AppFooter />
    </main>
  );
}
// import Image from "next/image";
// import Link from "next/link";
// import NavBar from "../../components/NavBar";

// import {
//   ArrowRight,
//   BookOpen,
//   Calendar,
//   Code2,
//   GraduationCap,
//   Heart,
//   Lightbulb,
//   Sparkles,
//   Users,
// } from "lucide-react";

// import { supabase } from "../../lib/supabase";

// export const metadata = {
//   title: "Blog | Tech Talk Hub",
//   description:
//     "Practical coding guidance, learner stories and technology insights for families raising Africa’s next generation of innovators.",
// };

// export const revalidate = 60;

// const categories = [
//   {
//     label: "All Stories",
//     value: "all",
//     icon: Sparkles,
//   },
//   {
//     label: "Coding for Kids",
//     value: "Coding for Kids",
//     icon: Code2,
//   },
//   {
//     label: "Parent Guides",
//     value: "Parent Guides",
//     icon: Users,
//   },
//   {
//     label: "Student Stories",
//     value: "Student Stories",
//     icon: GraduationCap,
//   },
//   {
//     label: "Education",
//     value: "Education",
//     icon: BookOpen,
//   },
//   {
//     label: "Technology",
//     value: "Technology",
//     icon: Lightbulb,
//   },
// ];

// function formatDate(date) {
//   if (!date) return "Recently published";

//   return new Intl.DateTimeFormat("en-KE", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   }).format(new Date(date));
// }

// function PostImage({
//   post,
//   fallbackSrc = null,
//   sizes,
//   priority = false,
//   objectPosition = "object-center",
// }) {
//   const imageSource =
//     post?.cover_image_url || fallbackSrc;

//   if (!imageSource) {
//     return (
//       <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2947C7] via-[#7252D3] to-[#FF3F7F]">
//         <div className="text-center text-white">
//           <BookOpen
//             size={38}
//             className="mx-auto"
//           />

//           <p className="mt-3 text-xs font-black uppercase tracking-widest">
//             Tech Talk Hub
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Image
//       src={imageSource}
//       alt={post?.title || "Tech Talk Hub story"}
//       fill
//       priority={priority}
//       sizes={sizes}
//       className={`object-cover ${objectPosition} transition-transform duration-500 group-hover:scale-105`}
//     />
//   );
// }

// export default async function BlogIndexPage({
//   searchParams,
// }) {
//   const filters = await searchParams;
//   const selectedCategory =
//     filters?.category || "all";

//   let query = supabase
//     .from("blog_posts")
//     .select(
//       `
//         id,
//         slug,
//         title,
//         excerpt,
//         category,
//         cover_image_url,
//         published_at,
//         created_at
//       `
//     )
//     .eq("status", "published")
//     .order("published_at", {
//       ascending: false,
//       nullsFirst: false,
//     });

//   if (selectedCategory !== "all") {
//     query = query.eq(
//       "category",
//       selectedCategory
//     );
//   }

//   const { data: posts = [], error } = await query;

//   if (error) {
//     console.error(
//       "Failed to fetch blog posts:",
//       error
//     );
//   }

//   const featuredPost = posts[0];
//   const latestPosts = posts.slice(1);

//   return (
//     <main className="min-h-screen overflow-hidden bg-white text-[#172554]">
//       <NavBar/>
//       {/* Compact hero */}
//       <section className="relative overflow-hidden border-b border-purple-100 bg-gradient-to-br from-white via-[#FBF9FF] to-[#F0E8FF] pt-20">
//         {/* Background glows */}
//         <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-[#9B6CFF]/10 blur-[100px]" />

//         <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#FF3F7F]/10 blur-[110px]" />

//         {/* Grid */}
//         <div
//           className="pointer-events-none absolute inset-0 opacity-[0.025]"
//           style={{
//             backgroundImage: `
//               linear-gradient(#2947C7 1px, transparent 1px),
//               linear-gradient(90deg, #2947C7 1px, transparent 1px)
//             `,
//             backgroundSize: "48px 48px",
//           }}
//         />

//         <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-12">
//           {/* Hero copy */}
//           <div className="max-w-xl">
//             <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#9B6CFF]/25 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#2947C7] shadow-sm backdrop-blur">
//               <Sparkles
//                 size={15}
//                 className="text-[#FF3F7F]"
//               />

//               Tech Talk Hub Stories
//             </div>

//             <h1 className="text-4xl font-black leading-[1.06] tracking-tight text-[#2947C7] sm:text-5xl lg:text-[3.5rem]">
//               Ideas that{" "}
//               <span className="text-[#FF3F7F]">
//                 inspire
//               </span>{" "}
//               young creators.
//             </h1>

//             <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
//               Practical guidance, learner stories and
//               technology insights for families raising
//               Africa’s next generation of innovators.
//             </p>

//             <Link
//               href="#latest-stories"
//               className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#FF3F7F] px-7 py-3.5 font-bold text-white shadow-xl shadow-pink-500/20 transition-all hover:-translate-y-0.5 hover:bg-[#E93470]"
//             >
//               Explore Latest Stories
//               <ArrowRight size={18} />
//             </Link>
//           </div>

//           {/* Hero image */}
//           <div className="relative pb-5">
//             <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] shadow-2xl shadow-purple-900/15">
//               <Image
//                 src="/blog-hero.png"
//                 alt="African tutor encouraging a young learner during a coding lesson"
//                 fill
//                 priority
//                 sizes="(max-width: 1024px) 100vw, 55vw"
//                 className="object-cover object-center"
//               />
//             </div>

//             <div className="absolute bottom-0 right-4 max-w-[270px] rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:right-6">
//               <div className="flex items-start gap-3">
//                 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[#FF3F7F]">
//                   <Heart
//                     size={18}
//                     fill="currentColor"
//                   />
//                 </span>

//                 <p className="text-sm font-bold leading-6 text-[#2947C7]">
//                   Every child’s journey starts with one idea.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Categories */}
//       <section className="border-b border-slate-100 bg-white p-6">
//         <div className="mx-auto max-w-7xl overflow-x-auto px-6 py-5 lg:px-8">
//           <div className="flex min-w-max justify-center gap-3">
//             {categories.map((category) => {
//               const Icon = category.icon;
//               const active =
//                 selectedCategory === category.value;

//               const href =
//                 category.value === "all"
//                   ? "/blog"
//                   : `/blog?category=${encodeURIComponent(
//                       category.value
//                     )}`;

//               return (
//                 <Link
//                   key={category.value}
//                   href={href}
//                   className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-all ${
//                     active
//                       ? "border-[#2947C7] bg-[#2947C7] text-white shadow-md shadow-blue-900/15"
//                       : "border-slate-200 bg-white text-slate-600 hover:border-[#9B6CFF]/50 hover:bg-purple-50 hover:text-[#2947C7]"
//                   }`}
//                 >
//                   <Icon size={16} />
//                   {category.label}
//                 </Link>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {posts.length > 0 ? (
//         <>
//           {/* Featured article */}
//           {featuredPost && (
//             <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
//               <div className="mb-6">
//                 <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
//                   Featured Story
//                 </p>

//                 <h2 className="mt-2 text-3xl font-black text-[#2947C7]">
//                   Start here
//                 </h2>
//               </div>

//               <article className="group grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5 transition hover:shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
//                 {/* Boy image */}
//                 <Link
//                   href={`/blog/${featuredPost.slug}`}
//                   className="relative min-h-[300px] overflow-hidden bg-slate-100 lg:min-h-[390px]"
//                 >
//                   <PostImage
//                     post={featuredPost}
//                     fallbackSrc="/blog-boy-laptop.png"
//                     priority
//                     sizes="(max-width: 1024px) 100vw, 55vw"
//                     objectPosition="object-center"
//                   />
//                 </Link>

//                 {/* Featured article copy */}
//                 <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-10">
//                   <span className="w-fit rounded-full bg-pink-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
//                     {featuredPost.category ||
//                       "Tech Talk Hub"}
//                   </span>

//                   <h2 className="mt-5 text-3xl font-black leading-tight text-[#2947C7] sm:text-4xl">
//                     <Link
//                       href={`/blog/${featuredPost.slug}`}
//                       className="transition hover:text-[#FF3F7F]"
//                     >
//                       {featuredPost.title}
//                     </Link>
//                   </h2>

//                   {featuredPost.excerpt && (
//                     <p className="mt-4 text-base leading-7 text-slate-600">
//                       {featuredPost.excerpt}
//                     </p>
//                   )}

//                   <div className="mt-6 flex flex-wrap items-center gap-5">
//                     <span className="flex items-center gap-2 text-sm text-slate-500">
//                       <Calendar size={15} />

//                       {formatDate(
//                         featuredPost.published_at ||
//                           featuredPost.created_at
//                       )}
//                     </span>

//                     <Link
//                       href={`/blog/${featuredPost.slug}`}
//                       className="inline-flex items-center gap-2 text-sm font-black text-[#FF3F7F]"
//                     >
//                       Read Story
//                       <ArrowRight size={16} />
//                     </Link>
//                   </div>
//                 </div>
//               </article>
//             </section>
//           )}

//           {/* Latest stories */}
//           {latestPosts.length > 0 && (
//             <section
//               id="latest-stories"
//               className="bg-[#FBFAFF] py-14"
//             >
//               <div className="mx-auto max-w-7xl px-6 lg:px-8">
//                 <div className="mb-8 flex items-end justify-between gap-5">
//                   <div>
//                     <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
//                       Keep Learning
//                     </p>

//                     <h2 className="mt-2 text-3xl font-black text-[#2947C7] sm:text-4xl">
//                       Latest Stories
//                     </h2>
//                   </div>

//                   {selectedCategory !== "all" && (
//                     <Link
//                       href="/blog"
//                       className="hidden items-center gap-2 text-sm font-bold text-[#FF3F7F] sm:inline-flex"
//                     >
//                       View all stories
//                       <ArrowRight size={16} />
//                     </Link>
//                   )}
//                 </div>

//                 <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
//                   {latestPosts.map((post) => (
//                     <article
//                       key={post.id}
//                       className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#9B6CFF]/40 hover:shadow-xl"
//                     >
//                       <Link
//                         href={`/blog/${post.slug}`}
//                         className="relative block aspect-[16/10] overflow-hidden"
//                       >
//                         <PostImage
//                           post={post}
//                           sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
//                         />
//                       </Link>

//                       <div className="flex flex-1 flex-col p-6">
//                         <p className="text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
//                           {post.category ||
//                             "Tech Talk Hub"}
//                         </p>

//                         <h3 className="mt-3 text-xl font-black leading-snug text-[#2947C7]">
//                           <Link
//                             href={`/blog/${post.slug}`}
//                             className="transition hover:text-[#FF3F7F]"
//                           >
//                             {post.title}
//                           </Link>
//                         </h3>

//                         {post.excerpt && (
//                           <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
//                             {post.excerpt}
//                           </p>
//                         )}

//                         <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
//                           <span className="flex items-center gap-2 text-xs text-slate-500">
//                             <Calendar size={13} />

//                             {formatDate(
//                               post.published_at ||
//                                 post.created_at
//                             )}
//                           </span>

//                           <Link
//                             href={`/blog/${post.slug}`}
//                             aria-label={`Read ${post.title}`}
//                             className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-[#2947C7] transition hover:bg-[#FF3F7F] hover:text-white"
//                           >
//                             <ArrowRight size={16} />
//                           </Link>
//                         </div>
//                       </div>
//                     </article>
//                   ))}
//                 </div>
//               </div>
//             </section>
//           )}
//         </>
//       ) : (
//         <section className="mx-auto max-w-5xl px-6 py-12">
//           <div className="grid overflow-hidden rounded-[2rem] border border-purple-100 bg-white shadow-lg md:grid-cols-2">
//             <div className="relative min-h-[280px]">
//               <Image
//                 src="/blog-boy-laptop.png"
//                 alt="Young African coder working on a laptop"
//                 fill
//                 sizes="(max-width: 768px) 100vw, 50vw"
//                 className="object-cover object-center"
//               />
//             </div>

//             <div className="flex flex-col justify-center p-8">
//               <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
//                 Stories Coming Soon
//               </p>

//               <h2 className="mt-3 text-3xl font-black text-[#2947C7]">
//                 New ideas are being created.
//               </h2>

//               <p className="mt-4 leading-7 text-slate-600">
//                 We are preparing practical coding guidance,
//                 student stories and technology insights for
//                 families raising young creators.
//               </p>

//               {selectedCategory !== "all" && (
//                 <Link
//                   href="/blog"
//                   className="mt-6 inline-flex items-center gap-2 font-bold text-[#FF3F7F]"
//                 >
//                   View all categories
//                   <ArrowRight size={16} />
//                 </Link>
//               )}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Founder note */}
//       <section className="bg-white py-14">
//         <div className="mx-auto max-w-6xl px-6 lg:px-8">
//           <div className="relative overflow-hidden rounded-[2rem] border border-purple-100 bg-gradient-to-r from-[#F7F2FF] to-white p-8 shadow-sm sm:p-10">
//             <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#9B6CFF]/10 blur-3xl" />

//             <div className="relative grid items-center gap-8 md:grid-cols-[160px_1fr]">
//               <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-3xl bg-purple-100 shadow-lg md:mx-0">
//                 <Image
//                   src="/founder.jpg"
//                   alt="Justin Akinyi, founder of Tech Talk Hub"
//                   fill
//                   sizes="160px"
//                   className="object-cover"
//                 />
//               </div>

//               <div>
//                 <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
//                   A note from our founder
//                 </p>

//                 <h2 className="mt-3 text-2xl font-black text-[#2947C7] sm:text-3xl">
//                   Every child deserves the opportunity to
//                   create with technology.
//                 </h2>

//                 <p className="mt-4 max-w-3xl leading-7 text-slate-600">
//                   Technology should not only be something
//                   children consume. It should become a tool
//                   they use to express ideas, solve problems
//                   and build confidently. Tech Talk Hub exists
//                   to make that journey practical, personal
//                   and inspiring.
//                 </p>

//                 <p className="mt-4 font-black text-[#2947C7]">
//                   — Justin Akinyi, Founder
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="px-6 pb-16 lg:px-8">
//         <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#2947C7] px-7 py-10 text-white shadow-2xl shadow-blue-950/15 sm:px-12">
//           <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#9B6CFF]/30 blur-3xl" />

//           <div className="absolute -bottom-24 right-0 h-60 w-60 rounded-full bg-[#FF3F7F]/25 blur-3xl" />

//           <div className="relative flex flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
//             <div>
//               <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-200">
//                 Continue the journey
//               </p>

//               <h2 className="mt-3 text-3xl font-black sm:text-4xl">
//                 Grow with your young creator.
//               </h2>

//               <p className="mt-3 max-w-xl text-blue-100">
//                 Explore a personalized coding program designed
//                 for your child’s age and interests.
//               </p>
//             </div>

//             <Link
//               href="/book-class"
//               className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#FF3F7F] px-7 py-4 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#E93470]"
//             >
//               Book a Free Trial
//               <ArrowRight size={18} />
//             </Link>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
// // import Image from "next/image";
// // import Link from "next/link";
// // import NavBar from "../../components/NavBar";

// // import {
// //   ArrowRight,
// //   BookOpen,
// //   Calendar,
// //   Code2,
// //   GraduationCap,
// //   Heart,
// //   Lightbulb,
// //   Sparkles,
// //   Users,
// // } from "lucide-react";

// //  import { supabase } from "../../lib/supabase";

// // export const metadata = {
// //   title: "Blog | Tech Talk Hub",
// //   description:
// //     "Practical coding guidance, learner stories and technology insights for families raising Africa’s next generation of innovators.",
// // };

// // export const revalidate = 60;

// // const categories = [
// //   {
// //     label: "All Stories",
// //     value: "all",
// //     icon: Sparkles,
// //   },
// //   {
// //     label: "Coding for Kids",
// //     value: "Coding for Kids",
// //     icon: Code2,
// //   },
// //   {
// //     label: "Parent Guides",
// //     value: "Parent Guides",
// //     icon: Users,
// //   },
// //   {
// //     label: "Student Stories",
// //     value: "Student Stories",
// //     icon: GraduationCap,
// //   },
// //   {
// //     label: "Education",
// //     value: "Education",
// //     icon: BookOpen,
// //   },
// //   {
// //     label: "Technology",
// //     value: "Technology",
// //     icon: Lightbulb,
// //   },
// // ];

// // function formatDate(date) {
// //   if (!date) return "Recently published";

// //   return new Intl.DateTimeFormat("en-KE", {
// //     day: "numeric",
// //     month: "long",
// //     year: "numeric",
// //   }).format(new Date(date));
// // }

// // function PostImage({
// //   post,
// //   sizes,
// //   priority = false,
// //   className = "",
// // }) {
// //   if (!post.cover_image_url) {
// //     return (
// //       <div
// //         className={`flex items-center justify-center bg-gradient-to-br from-[#2947C7] via-[#7252D3] to-[#FF3F7F] ${className}`}
// //       >
// //         <div className="text-center text-white">
// //           <BookOpen
// //             size={38}
// //             className="mx-auto"
// //           />

// //           <p className="mt-3 text-xs font-black uppercase tracking-widest">
// //             Tech Talk Hub
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <Image
// //       src={post.cover_image_url}
// //       alt={post.title}
// //       fill
// //       priority={priority}
// //       sizes={sizes}
// //       className={`object-cover transition-transform duration-500 group-hover:scale-105 ${className}`}
// //     />
// //   );
// // }

// // export default async function BlogIndexPage({
// //   searchParams,
// // }) {
// //   const filters = await searchParams;
// //   const selectedCategory =
// //     filters?.category || "all";



// //   let query = supabase
// //     .from("blog_posts")
// //     .select(
// //       `
// //         id,
// //         slug,
// //         title,
// //         excerpt,
// //         category,
// //         cover_image_url,
// //         published_at,
// //         created_at
// //       `
// //     )
// //     .eq("status", "published")
// //     .order("published_at", {
// //       ascending: false,
// //       nullsFirst: false,
// //     });

// //   if (selectedCategory !== "all") {
// //     query = query.eq(
// //       "category",
// //       selectedCategory
// //     );
// //   }

// //   const { data: posts = [], error } = await query;

// //   if (error) {
// //     console.error(
// //       "Failed to fetch blog posts:",
// //       error
// //     );
// //   }

// //   const featuredPost = posts[0];
// //   const latestPosts = posts.slice(1);

// //   return (
// //     <main className="min-h-screen overflow-hidden bg-white text-[#172554]">
// //       <NavBar />
// //       {/* Hero */}
// //       <section className="relative overflow-hidden border-b border-purple-100 bg-gradient-to-br from-white via-[#FBF9FF] to-[#F0E8FF] pt-28">
// //         {/* Decorative background */}
// //         <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#9B6CFF]/10 blur-[110px]" />

// //         <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#FF3F7F]/10 blur-[120px]" />

// //         <div
// //           className="pointer-events-none absolute inset-0 opacity-[0.025]"
// //           style={{
// //             backgroundImage: `
// //               linear-gradient(#2947C7 1px, transparent 1px),
// //               linear-gradient(90deg, #2947C7 1px, transparent 1px)
// //             `,
// //             backgroundSize: "48px 48px",
// //           }}
// //         />

// //         <div className="relative mx-auto grid min-h-[580px] max-w-7xl items-center gap-12 px-6 pb-16 lg:grid-cols-2 lg:px-8">
// //           {/* Hero copy */}
// //           <div className="max-w-xl">
// //             <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9B6CFF]/25 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#2947C7] shadow-sm backdrop-blur">
// //               <Sparkles
// //                 size={15}
// //                 className="text-[#FF3F7F]"
// //               />

// //               Tech Talk Hub Stories
// //             </div>

// //             <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-[#2947C7] sm:text-6xl">
// //               Ideas that{" "}
// //               <span className="text-[#FF3F7F]">
// //                 inspire
// //               </span>{" "}
// //               young creators.
// //             </h1>

// //             <p className="mt-6 max-w-lg text-base leading-8 text-slate-600 sm:text-lg">
// //               Practical guidance, learner stories and
// //               technology insights for families raising
// //               Africa’s next generation of innovators.
// //             </p>

// //             <Link
// //               href="#latest-stories"
// //               className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FF3F7F] px-7 py-4 font-bold text-white shadow-xl shadow-pink-500/20 transition-all hover:-translate-y-0.5 hover:bg-[#E93470]"
// //             >
// //               Explore Latest Stories
// //               <ArrowRight size={18} />
// //             </Link>
// //           </div>

// //           {/* Hero image */}
// //           <div className="relative">
// //             <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl shadow-purple-900/15">
// //               <Image
// //                 src="/blog-hero.png"
// //                 alt="African tutor encouraging a young learner during a coding lesson"
// //                 fill
// //                 priority
// //                 sizes="(max-width: 1024px) 100vw, 50vw"
// //                 className="object-cover"
// //               />
// //             </div>

// //             <div className="absolute -bottom-5 left-6 right-6 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur-md sm:left-auto sm:right-6 sm:w-72">
// //               <div className="flex items-start gap-3">
// //                 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[#FF3F7F]">
// //                   <Heart
// //                     size={18}
// //                     fill="currentColor"
// //                   />
// //                 </span>

// //                 <p className="text-sm font-bold leading-6 text-[#2947C7]">
// //                   Every child’s journey starts with one
// //                   idea.
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Category filters */}
// //       <section className="border-b border-slate-100 bg-white">
// //         <div className="mx-auto max-w-7xl overflow-x-auto px-6 py-7 lg:px-8">
// //           <div className="flex min-w-max justify-center gap-3">
// //             {categories.map((category) => {
// //               const Icon = category.icon;
// //               const active =
// //                 selectedCategory === category.value;

// //               return (
// //                 <Link
// //                   key={category.value}
// //                   href={
// //                     category.value === "all"
// //                       ? "/blog"
// //                       : `/blog?category=${encodeURIComponent(
// //                           category.value
// //                         )}`
// //                   }
// //                   className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition-all ${
// //                     active
// //                       ? "border-[#2947C7] bg-[#2947C7] text-white shadow-lg shadow-blue-900/15"
// //                       : "border-slate-200 bg-white text-slate-600 hover:border-[#9B6CFF]/50 hover:bg-purple-50 hover:text-[#2947C7]"
// //                   }`}
// //                 >
// //                   <Icon size={16} />
// //                   {category.label}
// //                 </Link>
// //               );
// //             })}
// //           </div>
// //         </div>
// //       </section>

// //       {posts.length > 0 ? (
// //         <>
// //           {/* Featured article */}
// //           {featuredPost && (
// //             <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
// //               <div className="mb-8 flex items-end justify-between">
// //                 <div>
// //                   <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
// //                     Featured Story
// //                   </p>

// //                   <h2 className="mt-2 text-3xl font-black text-[#2947C7]">
// //                     Start here
// //                   </h2>
// //                 </div>
// //               </div>

// //               <article className="group grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5 transition hover:shadow-xl lg:grid-cols-2">
// //                 <Link
// //                   href={`/blog/${featuredPost.slug}`}
// //                   className="relative min-h-[320px] overflow-hidden lg:min-h-[430px]"
// //                 >
// //                   <PostImage
// //                     post={featuredPost}
// //                     priority
// //                     sizes="(max-width: 1024px) 100vw, 50vw"
// //                   />
// //                 </Link>

// //                 <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
// //                   <span className="w-fit rounded-full bg-pink-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
// //                     {featuredPost.category ||
// //                       "Tech Talk Hub"}
// //                   </span>

// //                   <h2 className="mt-5 text-3xl font-black leading-tight text-[#2947C7] sm:text-4xl">
// //                     <Link
// //                       href={`/blog/${featuredPost.slug}`}
// //                       className="transition hover:text-[#FF3F7F]"
// //                     >
// //                       {featuredPost.title}
// //                     </Link>
// //                   </h2>

// //                   {featuredPost.excerpt && (
// //                     <p className="mt-5 text-base leading-8 text-slate-600">
// //                       {featuredPost.excerpt}
// //                     </p>
// //                   )}

// //                   <div className="mt-7 flex flex-wrap items-center gap-5">
// //                     <span className="flex items-center gap-2 text-sm text-slate-500">
// //                       <Calendar size={15} />

// //                       {formatDate(
// //                         featuredPost.published_at ||
// //                           featuredPost.created_at
// //                       )}
// //                     </span>

// //                     <Link
// //                       href={`/blog/${featuredPost.slug}`}
// //                       className="inline-flex items-center gap-2 text-sm font-black text-[#FF3F7F]"
// //                     >
// //                       Read Story
// //                       <ArrowRight size={16} />
// //                     </Link>
// //                   </div>
// //                 </div>
// //               </article>
// //             </section>
// //           )}

// //           {/* Latest stories */}
// //           {latestPosts.length > 0 && (
// //             <section
// //               id="latest-stories"
// //               className="bg-[#FBFAFF] py-20"
// //             >
// //               <div className="mx-auto max-w-7xl px-6 lg:px-8">
// //                 <div className="mb-10 flex items-end justify-between gap-5">
// //                   <div>
// //                     <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
// //                       Keep Learning
// //                     </p>

// //                     <h2 className="mt-2 text-3xl font-black text-[#2947C7] sm:text-4xl">
// //                       Latest Stories
// //                     </h2>
// //                   </div>

// //                   {selectedCategory !== "all" && (
// //                     <Link
// //                       href="/blog"
// //                       className="hidden items-center gap-2 text-sm font-bold text-[#FF3F7F] sm:inline-flex"
// //                     >
// //                       View all stories
// //                       <ArrowRight size={16} />
// //                     </Link>
// //                   )}
// //                 </div>

// //                 <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
// //                   {latestPosts.map((post) => (
// //                     <article
// //                       key={post.id}
// //                       className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#9B6CFF]/40 hover:shadow-xl"
// //                     >
// //                       <Link
// //                         href={`/blog/${post.slug}`}
// //                         className="relative block aspect-[16/10] overflow-hidden"
// //                       >
// //                         <PostImage
// //                           post={post}
// //                           sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
// //                         />
// //                       </Link>

// //                       <div className="flex flex-1 flex-col p-6">
// //                         <p className="text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
// //                           {post.category ||
// //                             "Tech Talk Hub"}
// //                         </p>

// //                         <h3 className="mt-3 text-xl font-black leading-snug text-[#2947C7]">
// //                           <Link
// //                             href={`/blog/${post.slug}`}
// //                             className="transition hover:text-[#FF3F7F]"
// //                           >
// //                             {post.title}
// //                           </Link>
// //                         </h3>

// //                         {post.excerpt && (
// //                           <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
// //                             {post.excerpt}
// //                           </p>
// //                         )}

// //                         <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
// //                           <span className="flex items-center gap-2 text-xs text-slate-500">
// //                             <Calendar size={13} />

// //                             {formatDate(
// //                               post.published_at ||
// //                                 post.created_at
// //                             )}
// //                           </span>

// //                           <Link
// //                             href={`/blog/${post.slug}`}
// //                             aria-label={`Read ${post.title}`}
// //                             className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-[#2947C7] transition hover:bg-[#FF3F7F] hover:text-white"
// //                           >
// //                             <ArrowRight size={16} />
// //                           </Link>
// //                         </div>
// //                       </div>
// //                     </article>
// //                   ))}
// //                 </div>
// //               </div>
// //             </section>
// //           )}
// //         </>
// //       ) : (
// //         <section className="mx-auto max-w-4xl px-6 py-24 text-center">
// //           <div className="rounded-[2rem] border border-dashed border-purple-200 bg-purple-50/50 px-6 py-16">
// //             <BookOpen
// //               size={44}
// //               className="mx-auto text-[#9B6CFF]"
// //             />

// //             <h2 className="mt-5 text-2xl font-black text-[#2947C7]">
// //               New stories are coming
// //             </h2>

// //             <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
// //               We are preparing practical coding guidance,
// //               student stories and technology insights for
// //               families.
// //             </p>

// //             {selectedCategory !== "all" && (
// //               <Link
// //                 href="/blog"
// //                 className="mt-6 inline-flex items-center gap-2 font-bold text-[#FF3F7F]"
// //               >
// //                 View all categories
// //                 <ArrowRight size={16} />
// //               </Link>
// //             )}
// //           </div>
// //         </section>
// //       )}

// //       {/* Founder note */}
// //       <section className="bg-white py-20">
// //         <div className="mx-auto max-w-6xl px-6 lg:px-8">
// //           <div className="relative overflow-hidden rounded-[2rem] border border-purple-100 bg-gradient-to-r from-[#F7F2FF] to-white p-8 shadow-sm sm:p-12">
// //             <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#9B6CFF]/10 blur-3xl" />

// //             <div className="relative grid items-center gap-8 md:grid-cols-[180px_1fr]">
// //               <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-3xl bg-purple-100 shadow-lg md:mx-0">
// //                {/* <Image
// //                   src="/founder.jpg"
// //                   alt="Justin Akinyi, founder of Tech Talk Hub"
// //                   fill
// //                   sizes="176px"
// //                   className="object-cover"
// //                 />*/}
// //               </div>

// //               <div>
// //                 <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF3F7F]">
// //                   A note from our founder
// //                 </p>

// //                 <h2 className="mt-3 text-3xl font-black text-[#2947C7]">
// //                   Every child deserves the opportunity to
// //                   create with technology.
// //                 </h2>

// //                 <p className="mt-5 max-w-3xl leading-8 text-slate-600">
// //                   Technology should not only be something
// //                   children consume. It should become a tool
// //                   they use to express ideas, solve problems
// //                   and build confidently. Tech Talk Hub exists
// //                   to make that journey practical, personal
// //                   and inspiring.
// //                 </p>

// //                 <p className="mt-5 font-black text-[#2947C7]">
// //                   — Justin Akinyi, Founder
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>




// //       {/* CTA */}
// //       <section className="px-6 pb-24 lg:px-8">
// //         <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#2947C7] px-7 py-12 text-white shadow-2xl shadow-blue-950/15 sm:px-12">
// //           <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#9B6CFF]/30 blur-3xl" />

// //           <div className="absolute -bottom-24 right-0 h-60 w-60 rounded-full bg-[#FF3F7F]/25 blur-3xl" />

// //           <div className="relative flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
// //             <div>
// //               <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-200">
// //                 Continue the journey
// //               </p>

// //               <h2 className="mt-3 text-3xl font-black sm:text-4xl">
// //                 Grow with your young creator.
// //               </h2>

// //               <p className="mt-3 max-w-xl text-blue-100">
// //                 Explore a personalized coding program designed
// //                 for your child’s age and interests.
// //               </p>
// //             </div>

// //             <Link
// //               href="/book-class"
// //               className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#FF3F7F] px-7 py-4 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#E93470]"
// //             >
// //               Book a Free Trial
// //               <ArrowRight size={18} />
// //             </Link>
// //           </div>
// //         </div>
// //       </section>
// //     </main>
// //   );
// // }
// // // import Image from "next/image";
// // // import Link from "next/link";
// // // import {
// // //   ArrowRight,
// // //   Calendar,
// // //   Sparkles,
// // // } from "lucide-react";
// // // import { supabase } from "../../lib/supabase";
// // // export const metadata = {
// // //   title: "Blog | Tech Talk Hub",
// // //   description:
// // //     "Coding education, technology insights and stories from Tech Talk Hub.",
// // // };

// // // export const revalidate = 60;

// // // function formatDate(date) {
// // //   if (!date) return "Recently published";

// // //   return new Intl.DateTimeFormat("en-KE", {
// // //     day: "numeric",
// // //     month: "long",
// // //     year: "numeric",
// // //   }).format(new Date(date));
// // // }

// // // export default async function BlogIndexPage() {


// // //   const { data: blogPosts = [], error } = await supabase
// // //     .from("blog_posts")
// // //     .select(
// // //       `
// // //         id,
// // //         slug,
// // //         title,
// // //         excerpt,
// // //         category,
// // //         cover_image_url,
// // //         published_at,
// // //         created_at
// // //       `
// // //     )
// // //     .eq("status", "published")
// // //     .order("published_at", {
// // //       ascending: false,
// // //       nullsFirst: false,
// // //     });

// // //   if (error) {
// // //     console.error("Failed to fetch blog posts:", error);
// // //   }

// // //   return (
// // //     <main className="min-h-screen bg-background pb-24 pt-28 text-text selection:bg-secondary/20">
// // //       <div className="mx-auto max-w-6xl px-6">
// // //         {/* Header */}
// // //         <header className="mx-auto mb-16 max-w-3xl text-center">
// // //           <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-secondary shadow-sm">
// // //             <Sparkles size={14} />
// // //             Tech Talk Hub Insights
// // //           </div>

// // //           <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
// // //             Our Latest{" "}
// // //             <span className="text-secondary">
// // //               Articles & Stories
// // //             </span>
// // //           </h1>

// // //           <p className="mt-5 text-base leading-7 text-text/70 sm:text-lg">
// // //             Coding education, teaching ideas, technology insights and
// // //             updates from the Tech Talk Hub team.
// // //           </p>
// // //         </header>

// // //         {/* Posts */}
// // //         {blogPosts.length > 0 ? (
// // //           <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
// // //             {blogPosts.map((post) => (
// // //               <article
// // //                 key={post.id}
// // //                 className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/30 hover:shadow-xl dark:border-gray-800"
// // //               >
// // //                 {/* Cover image */}
// // //                 {post.cover_image_url && (
// // //                   <Link
// // //                     href={`/blog/${post.slug}`}
// // //                     className="relative block aspect-[16/9] overflow-hidden bg-slate-100"
// // //                   >
// // //                     <Image
// // //                       src={post.cover_image_url}
// // //                       alt={post.title}
// // //                       fill
// // //                       sizes="(max-width: 768px) 100vw, 50vw"
// // //                       className="object-cover transition-transform duration-500 group-hover:scale-105"
// // //                     />
// // //                   </Link>
// // //                 )}

// // //                 <div className="flex flex-1 flex-col justify-between p-7 sm:p-8">
// // //                   <div className="space-y-4">
// // //                     <div className="flex flex-wrap items-center justify-between gap-3">
// // //                       <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
// // //                         {post.category || "Tech Talk Hub"}
// // //                       </span>

// // //                       <span className="flex items-center gap-1.5 text-xs font-medium text-text/60">
// // //                         <Calendar size={13} />

// // //                         {formatDate(
// // //                           post.published_at || post.created_at
// // //                         )}
// // //                       </span>
// // //                     </div>

// // //                     <h2 className="text-2xl font-bold leading-tight text-text transition-colors group-hover:text-secondary">
// // //                       <Link href={`/blog/${post.slug}`}>
// // //                         {post.title}
// // //                       </Link>
// // //                     </h2>

// // //                     {post.excerpt && (
// // //                       <p className="text-sm leading-7 text-text/70">
// // //                         {post.excerpt}
// // //                       </p>
// // //                     )}
// // //                   </div>

// // //                   <div className="mt-7 border-t border-gray-100 pt-6 dark:border-gray-800">
// // //                     <Link
// // //                       href={`/blog/${post.slug}`}
// // //                       className="inline-flex items-center gap-2 text-sm font-bold text-secondary transition-all group-hover:gap-3"
// // //                     >
// // //                       Read Article
// // //                       <ArrowRight size={16} />
// // //                     </Link>
// // //                   </div>
// // //                 </div>
// // //               </article>
// // //             ))}
// // //           </section>
// // //         ) : (
// // //           <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
// // //             <h2 className="text-xl font-bold text-text">
// // //               No articles published yet
// // //             </h2>

// // //             <p className="mt-2 text-sm text-text/60">
// // //               New Tech Talk Hub articles will appear here.
// // //             </p>
// // //           </div>
// // //         )}
// // //       </div>
// // //     </main>
// // //   );
// // // }
// // // import React, { useState } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import UserMenu from "./UserMenu";
// // // // Schedule View Import
// // // import GlobalScheduleView from "./views/GlobalScheduleView"; 
// // // // Recordings Manager Import
// // // import ClassRecordingsManager from "./views/ClassRecordingsManager";
// // // import AdminProgramsPage from "./views/admin/AdminProgramsPage";
// // // import {
// // //   BookOpen,
// // //   LayoutDashboard,
// // //   Users,
// // //   Calendar,
// // //   HelpCircle,
// // //   Settings,
// // //   ChevronLeft,
// // //   ChevronRight,
// // //   FileText,
// // //   Award,
// // //   BookMarked,
// // //   Layers,
// // //   Layers3,
// // //   Users2,
// // //   BarChart3,
// // //   Video,
// // //   ShoppingBag
// // // } from "lucide-react";

// // // // 1. Student View Imports
// // // import StudentCoursesView from "./views/student/StudentCoursesView";
// // // import ExamPage from "./views/student/StudentExam";
// // // import StudentGradesView from "./views/student/StudentGradesView";
// // // import SharedSupportView from "./views/student/SharedSupportView";
// // // import StudentSettingsView from "./views/student/StudentSettingsView";
// // // import StudentHomeView from "./views/student/StudentHomeView";

// // // // 2. Tutor View Imports
// // // import TutorHomeView from "./views/tutor/TutorHomeView";
// // // import TutorStudentsView from "./views/tutor/TutorStudentsView";
// // // import TutorScheduleView from "./views/tutor/TutorScheduleView";
// // // import TutorCourseAssignmentView from "./views/tutor/TutorCourseAssignmentView";

// // // // 3. Admin View Imports
// // // import AdminHomeView from "./views/admin/AdminHomeView";
// // // import AdminUsersView from "./views/admin/AdminUsersView";
// // // import AdminCoursesView from "./views/admin/AdminCoursesView";
// // // import AdminAnalyticsView from "./views/admin/AdminAnalyticsView";
// // // import AdminSettingsView from "./views/admin/AdminSettingsView";
// // // import AdminShopPage from "./views/admin/AdminShopPage"; // Adjust path as needed

// // // export default function DashboardLayout({ role, user, children }) {
// // //   const navigate = useNavigate();
// // //   const [activeView, setActiveView] = useState("dashboard");
// // //   const [isCollapsed, setIsCollapsed] = useState(false);

// // //   // Helper check for management/admin roles
// // //   const isAdmin = role === "operations_admin" || role === "owner" || role === "tech_admin";

// // //   // If the user logs out while this component is mounted, prevent rendering broken user IDs
// // //   if (!user) {
// // //     return (
// // //       <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white font-sans">
// // //         <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
// // //         <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Signing out...</p>
// // //       </div>
// // //     );
// // //   }

// // //   const renderMainContent = () => {
// // //     if (activeView === "support") {
// // //       return <SharedSupportView user={user} />;
// // //     }

// // //     if (activeView === "settings") {
// // //       if (isAdmin) {
// // //         return <AdminSettingsView userId={user?.id} role={role} />;
// // //       }
// // //       return <StudentSettingsView user={user} />;
// // //     }

// // //     // Shared / Role-specific view routing for recordings
// // //     if (activeView === "recordings") {
// // //       return <ClassRecordingsManager />;
// // //     }

// // //     // Student Role Views
// // //     if (role === "student") {
// // //       switch (activeView) {
// // //         case "courses":
// // //           return <StudentCoursesView userId={user?.id} courseId={user?.assigned_course_id} />;
// // //         case "exams":
// // //           return <ExamPage user={user} />;
// // //         case "grades":
// // //           return <StudentGradesView userId={user?.id} />;
// // //         case "dashboard":
// // //         default:
// // //           return <StudentHomeView userId={user.id} />;
// // //       }
// // //     }

// // //     // Tutor Role Views
// // //     if (role === "tutor") {
// // //       switch (activeView) {
// // //         case "students":
// // //           return <TutorStudentsView userId={user?.id} />;
// // //         case "schedule":
// // //           return <GlobalScheduleView />; 
// // //         case "course-assignment":
// // //           return <TutorCourseAssignmentView userId={user?.id} />;
// // //         case "dashboard":
// // //         default:
// // //           return <TutorHomeView userId={user?.id} courseId={user?.assigned_course_id} user={user} />;
// // //       }
// // //     }

// // //     // Admin / Management Role Views
// // //     if (isAdmin) {
// // //       switch (activeView) {
// // //         case "users":
// // //           return <AdminUsersView userId={user?.id} role={role} />;
        
// // //         case "programs":
// // //           return <AdminProgramsPage />;
// // //         case "courses-hub":
// // //           return <AdminCoursesView userId={user?.id} role={role} />;
// // //         case "analytics":
// // //           return <AdminAnalyticsView userId={user?.id} role={role} />;
// // //         case "global-schedule":
// // //           return <GlobalScheduleView />;
// // //         case "shop":
// // //           return <AdminShopPage />;
// // //         case "dashboard":
// // //         default:
// // //           return <AdminHomeView userId={user?.id} role={role} />;
// // //       }
// // //     }

// // //     return <div className="p-6">{children}</div>;
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1020] text-gray-900 dark:text-white flex transition-colors duration-300">
// // //       {/* Sidebar Navigation */}
// // //       <aside className={`bg-white dark:bg-white/5 border-r border-gray-100 dark:border-white/10 min-h-screen p-5 flex flex-col shrink-0 transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>

// // //         {/* Collapse Toggle Button */}
// // //         <button
// // //           onClick={() => setIsCollapsed((prev) => !prev)}
// // //           className="absolute -right-3 top-7 bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-full shadow-md z-10 transition-transform"
// // //           title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
// // //         >
// // //           {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
// // //         </button>

// // //         {/* Sidebar Header */}
// // //         {!isCollapsed && (
// // //           <div className="mb-6 px-2 overflow-hidden">
// // //             <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
// // //               Tech Talk Hub
// // //             </h1>
// // //             <div className="text-xs text-gray-400 font-medium mt-0.5 capitalize whitespace-nowrap">
// // //               <span>{role} Portal 🚀</span>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {/* Sidebar Menu Items */}
// // //         <nav className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden">

// // //           {/* Overview Group */}
// // //           <div>
// // //             {!isCollapsed && (
// // //               <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Overview</p>
// // //             )}
// // //             <div className="space-y-1">
// // //               <button
// // //                 onClick={() => setActiveView("dashboard")}
// // //                 title={isCollapsed ? "Dashboard" : ""}
// // //                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
// // //                   activeView === "dashboard"
// // //                     ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
// // //                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
// // //                 }`}
// // //               >
// // //                 <LayoutDashboard size={18} className="shrink-0" />
// // //                 {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
// // //               </button>
// // //             </div>
// // //           </div>

// // //           {/* Student Specific Navigation */}
// // //           {role === "student" && (
// // //             <div>
// // //               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Learning</p>}
// // //               <div className="space-y-1">
// // //                 <button
// // //                   onClick={() => setActiveView("courses")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BookOpen size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>My Courses</span>}
// // //                 </button>

// // //                 <button
// // //                   onClick={() => setActiveView("exams")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "exams" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BookMarked size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Exams</span>}
// // //                 </button>

// // //                 <button
// // //                   onClick={() => setActiveView("grades")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "grades" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Award size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Grades</span>}
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           )}

// // //           {/* Tutor Specific Navigation */}
// // //           {role === "tutor" && (
// // //             <div>
// // //               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Teaching</p>}
// // //               <div className="space-y-1">
// // //                 <button
// // //                   onClick={() => setActiveView("students")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "students" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Users size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>My Students</span>}
// // //                 </button>
// // //                 <button
// // //                   onClick={() => setActiveView("schedule")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Calendar size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Master Schedule</span>}
// // //                 </button>
// // //                 <button
// // //                   onClick={() => setActiveView("course-assignment")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "course-assignment" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Layers size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Course Assignment</span>}
// // //                 </button>
// // //                 <button
// // //                   onClick={() => setActiveView("recordings")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "recordings" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Video size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Class Recordings</span>}
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           )}
// // // {isAdmin && (
// // //   <div>
// // //     {!isCollapsed && (
// // //       <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
// // //         E-Commerce
// // //       </p>
// // //     )}
// // //     <div className="space-y-1">
// // //       <button
// // //         onClick={() => setActiveView("shop")}
// // //         title={isCollapsed ? "Shop Management" : ""}
// // //         className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
// // //           activeView === "shop"
// // //             ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
// // //             : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
// // //         }`}
// // //       >
// // //         <ShoppingBag size={18} className="shrink-0" />
// // //         {!isCollapsed && <span className="whitespace-nowrap">Shop Management</span>}
// // //       </button>
// // //     </div>
// // //   </div>
// // // )}
// // //           {/* Admin / Management Specific Navigation */}
// // //           {isAdmin && (
// // //             <div>
// // //               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Management</p>}
// // //               <div className="space-y-1">
// // //                 <button
// // //                   onClick={() => setActiveView("users")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "users" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Users2 size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Users & Staff</span>}
// // //                 </button>
// // // <button
// // //   onClick={() => setActiveView("programs")}
// // //   title={isCollapsed ? "Programs" : ""}
// // //   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
// // //     activeView === "programs"
// // //       ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
// // //       : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
// // //   }`}
// // // >
// // //   <Layers3 size={18} className="shrink-0" />
// // //   {!isCollapsed && (
// // //     <span className="whitespace-nowrap">Programs</span>
// // //   )}
// // // </button>
// // //                 <button
// // //                   onClick={() => setActiveView("courses-hub")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses-hub" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BookOpen size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Courses Hub</span>}
// // //                 </button>

// // //                 <button
// // //                   onClick={() => setActiveView("analytics")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "analytics" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BarChart3 size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Analytics</span>}
// // //                 </button>

// // //                 <button
// // //                   onClick={() => setActiveView("global-schedule")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "global-schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Calendar size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Global Schedule</span>}
// // //                 </button>

// // //                 <button
// // //                   onClick={() => setActiveView("recordings")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "recordings" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Video size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Recordings Manager</span>}
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           )}

// // //           {/* System Group */}
// // //           <div>
// // //             {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">System</p>}
// // //             <div className="space-y-1">
// // //               <button
// // //                 onClick={() => setActiveView("support")}
// // //                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "support" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //               >
// // //                 <HelpCircle size={18} className="shrink-0" />
// // //                 {!isCollapsed && <span>Help & Support</span>}
// // //               </button>
// // //               <button
// // //                 onClick={() => setActiveView("settings")}
// // //                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "settings" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //               >
// // //                 <Settings size={18} className="shrink-0" />
// // //                 {!isCollapsed && <span>Settings</span>}
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </nav>

// // //       </aside>

// // //       {/* Dynamic Content Display */}
// // //       <main className="flex-1 overflow-y-auto">
// // //         {renderMainContent()}
// // //       </main>
// // //     </div>
// // //   );
// // // }
// // // //
// // // // import Link from "next/link";
// // // // import { Sparkles, Calendar, ArrowRight } from "lucide-react";

// // // // // Mock data or fetch from your backend/CMS/Supabase
// // // // const blogPosts = [
// // // //   {
// // // //     slug: "building-scalable-backends-python",
// // // //     title: "Building Scalable Backend Systems with Python & FastAPI",
// // // //     excerpt: "Learn how we architect high-performance API endpoints and manage data flow for student dashboards.",
// // // //     date: "August 10, 2026",
// // // //     category: "Engineering",
// // // //   },
// // // //   {
// // // //     slug: "teaching-kids-to-code-scratch-blockly",
// // // //     title: "Why Visual Programming is the Best Gateway for Young Coders",
// // // //     excerpt: "Exploring how Scratch and Blockly spark early problem-solving skills in preschool and junior learners.",
// // // //     date: "July 28, 2026",
// // // //     category: "Education",
// // // //   },
// // // // ];

// // // // export default function BlogIndexPage() {
// // // //   return (
// // // //     <main className="min-h-screen bg-background text-text selection:bg-secondary/20 pt-28 pb-24">
// // // //       <div className="max-w-5xl mx-auto px-6">
// // // //         {/* Header */}
// // // //         <div className="text-center max-w-2xl mx-auto mb-16">
// // // //           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-4 border border-secondary/20 shadow-sm">
// // // //             <Sparkles size={14} /> Tech Talk Hub Insights
// // // //           </div>
// // // //           <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
// // // //             Our Latest <span className="text-secondary">Articles & Stories</span>
// // // //           </h1>
// // // //           <p className="text-text/70 mt-4 text-base sm:text-lg">
// // // //             Engineering breakdowns, teaching methodologies, and updates from our team in Nairobi.
// // // //           </p>
// // // //         </div>

// // // //         {/* Posts Grid */}
// // // //         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
// // // //           {blogPosts.map((post) => (
// // // //             <article 
// // // //               key={post.slug}
// // // //               className="group bg-background border border-gray-100 dark:border-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col justify-between"
// // // //             >
// // // //               <div className="space-y-4">
// // // //                 <div className="flex items-center justify-between">
// // // //                   <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
// // // //                     {post.category}
// // // //                   </span>
// // // //                   <span className="text-xs font-medium text-text/60 flex items-center gap-1">
// // // //                     <Calendar size={12} /> {post.date}
// // // //                   </span>
// // // //                 </div>

// // // //                 <h2 className="text-2xl font-bold text-text group-hover:text-secondary transition-colors">
// // // //                   {post.title}
// // // //                 </h2>

// // // //                 <p className="text-text/70 text-sm leading-relaxed">
// // // //                   {post.excerpt}
// // // //                 </p>
// // // //               </div>

// // // //               <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
// // // //                 <Link 
// // // //                   href={`/blog/${post.slug}`}
// // // //                   className="inline-flex items-center gap-2 text-sm font-bold text-secondary group-hover:gap-3 transition-all"
// // // //                 >
// // // //                   Read Article <ArrowRight size={16} />
// // // //                 </Link>
// // // //               </div>
// // // //             </article>
// // // //           ))}
// // // //         </div>
// // // //       </div>
// // // //     </main>
// // // //   );
// // // // }
// // // // // "use client";

// // // // // import { useState } from "react";
// // // // // import Link from "next/link";
// // // // // import { Sparkles, Globe, BookOpen, HeartHandshake, ArrowRight, CheckCircle2, MapPin, Clock } from "lucide-react";

// // // // // const openRoles = [
// // // // //   {
// // // // //     id: 1,
// // // // //     title: "Technical Content Writer & Blogger",
// // // // //     department: "Content",
// // // // //     location: "Nairobi, Kenya (Hybrid / Remote)",
// // // // //     type: "Full-Time / Contract",
// // // // //     description: "Write deep-dive technical articles, programming tutorials, and industry insights centered around software development and tech education.",
// // // // //   },
// // // // //   {
// // // // //     id: 2,
// // // // //     title: "Full-Stack Engineer (Blogging Platform)",
// // // // //     department: "Engineering",
// // // // //     location: "Nairobi, Kenya (Hybrid / Remote)",
// // // // //     type: "Full-Time",
// // // // //     description: "Build and maintain our high-performance blogging engine, optimize SEO architecture, and improve our interactive reading experience.",
// // // // //   },
// // // // //   {
// // // // //     id: 3,
// // // // //     title: "Community & Editorial Lead",
// // // // //     department: "Marketing & Community",
// // // // //     location: "Nairobi, Kenya",
// // // // //     type: "Full-Time",
// // // // //     description: "Curate guest blog submissions, manage our publication calendar, and grow our tech reader community across East Africa.",
// // // // //   },
// // // // // ];

// // // // // const perks = [
// // // // //   {
// // // // //     icon: Globe,
// // // // //     title: "Flexible Local Work",
// // // // //     description: "Collaborate from our Nairobi base or remote on your own schedule. Total ownership over your hours.",
// // // // //   },
// // // // //   {
// // // // //     icon: Sparkles,
// // // // //     title: "Established Growth",
// // // // //     description: "Build upon 4 years of operational history in the Kenyan tech ecosystem with a proven publishing vision.",
// // // // //   },
// // // // //   {
// // // // //     icon: HeartHandshake,
// // // // //     title: "Editorial Impact",
// // // // //     description: "Your articles and technical stories will shape the perspectives and learning journeys of thousands of developers.",
// // // // //   },
// // // // //   {
// // // // //     icon: BookOpen,
// // // // //     title: "Continuous Learning",
// // // // //     description: "Immerse yourself daily in emerging technologies, software engineering best practices, and deep tech research.",
// // // // //   },
// // // // // ];

// // // // // export default function CareersPage() {
// // // // //   const [selectedDepartment, setSelectedDepartment] = useState("All");

// // // // //   const departments = ["All", "Content", "Engineering", "Marketing & Community"];

// // // // //   const filteredRoles = selectedDepartment === "All"
// // // // //     ? openRoles
// // // // //     : openRoles.filter((role) => role.department === selectedDepartment);

// // // // //   return (
// // // // //     <main className="min-h-screen bg-background text-text selection:bg-secondary/20">

// // // // //       {/* Hero Section */}
// // // // //       <section className="relative pt-20 pb-24 overflow-hidden border-b border-gray-100 dark:border-gray-800/60">
// // // // //         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

// // // // //         <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
// // // // //           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-6 border border-secondary/20 shadow-sm">
// // // // //             <Sparkles size={14} /> Karibu Team • 4 Years Strong
// // // // //           </div>
// // // // //           <h1 className="text-4xl sm:text-6xl font-black text-text tracking-tight leading-[1.1]">
// // // // //             Scale Tech Talk Hub&apos;s <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Editorial & Content Vision</span>
// // // // //           </h1>
// // // // //           <p className="text-text/70 mt-6 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
// // // // //             For 4 years we have built and shared tech insights in Nairobi. If you love writing deep technical stories, building publishing tools, and expanding our reader community, let&apos;s talk.
// // // // //           </p>

// // // // //           <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-text/60">
// // // // //             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> 4 Years in Operations</span>
// // // // //             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Editorial & Tech Expansion</span>
// // // // //             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Nairobi & Remote</span>
// // // // //           </div>
// // // // //         </div>
// // // // //       </section>

// // // // //       {/* Perks Section */}
// // // // //       <section className="py-20 bg-text/[0.01]">
// // // // //         <div className="max-w-7xl mx-auto px-6">
// // // // //           <div className="text-center max-w-2xl mx-auto mb-16">
// // // // //             <h2 className="text-3xl font-extrabold tracking-tight">What to Expect Joining Us</h2>
// // // // //             <p className="text-text/60 mt-3 text-base">No corporate fluff. Just real writing, building, and publishing.</p>
// // // // //           </div>

// // // // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// // // // //             {perks.map((perk, idx) => {
// // // // //               const IconComponent = perk.icon;
// // // // //               return (
// // // // //                 <div 
// // // // //                   key={idx} 
// // // // //                   className="group bg-background p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col items-start relative overflow-hidden"
// // // // //                 >
// // // // //                   <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
// // // // //                   <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 shadow-sm">
// // // // //                     <IconComponent size={24} />
// // // // //                   </div>
// // // // //                   <h3 className="font-bold text-lg text-text mb-2">{perk.title}</h3>
// // // // //                   <p className="text-text/60 text-sm leading-relaxed">{perk.description}</p>
// // // // //                 </div>
// // // // //               );
// // // // //             })}
// // // // //           </div>
// // // // //         </div>
// // // // //       </section>

// // // // //       {/* Open Positions Section */}
// // // // //       <section className="py-24 max-w-7xl mx-auto px-6">
// // // // //         <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
// // // // //           <div>
// // // // //             <span className="text-secondary font-semibold text-xs uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-md">Open Roles</span>
// // // // //             <h2 className="text-3xl md:text-4xl font-extrabold text-text mt-3 tracking-tight">
// // // // //               Open Positions
// // // // //             </h2>
// // // // //           </div>

// // // // //           {/* Department Filter Pills */}
// // // // //           <div className="flex flex-wrap gap-2">
// // // // //             {departments.map((dept) => (
// // // // //               <button
// // // // //                 key={dept}
// // // // //                 onClick={() => setSelectedDepartment(dept)}
// // // // //                 className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
// // // // //                   selectedDepartment === dept
// // // // //                     ? "bg-secondary text-background shadow-md shadow-secondary/20"
// // // // //                     : "bg-text/5 text-text/80 hover:bg-text/10"
// // // // //                 }`}
// // // // //               >
// // // // //                 {dept}
// // // // //               </button>
// // // // //             ))}
// // // // //           </div>
// // // // //         </div>

// // // // //         {/* Roles List */}
// // // // //         <div className="space-y-4">
// // // // //           {filteredRoles.map((role) => (
// // // // //             <div
// // // // //               key={role.id}
// // // // //               className="group bg-background border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
// // // // //             >
// // // // //               <div className="space-y-3 max-w-3xl">
// // // // //                 <div className="flex flex-wrap items-center gap-2.5">
// // // // //                   <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
// // // // //                     {role.department}
// // // // //                   </span>
// // // // //                   <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
// // // // //                     <MapPin size={12} /> {role.location}
// // // // //                   </span>
// // // // //                   <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
// // // // //                     <Clock size={12} /> {role.type}
// // // // //                   </span>
// // // // //                 </div>
                
// // // // //                 <h3 className="text-2xl font-bold text-text group-hover:text-secondary transition-colors">
// // // // //                   {role.title}
// // // // //                 </h3>
                
// // // // //                 <p className="text-text/70 text-sm leading-relaxed max-w-2xl">
// // // // //                   {role.description}
// // // // //                 </p>
// // // // //               </div>

// // // // //               <button
// // // // //                 onClick={() => alert(`Thanks for your interest! Reach out to us directly at founders@techtalkhub.com`)}
// // // // //                 className="bg-secondary text-background hover:opacity-95 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 transition-all duration-300 whitespace-nowrap active:scale-95 flex items-center gap-2 group-hover:gap-3"
// // // // //               >
// // // // //                 Apply Now <ArrowRight size={16} />
// // // // //               </button>
// // // // //             </div>
// // // // //           ))}
// // // // //         </div>

// // // // //         {/* General Application Note */}
// // // // //         <div className="mt-20 bg-gradient-to-br from-secondary/10 via-background to-secondary/5 border border-secondary/20 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
// // // // //           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          
// // // // //           <h3 className="text-2xl md:text-3xl font-extrabold text-text">Got a story to share or want to write for us?</h3>
// // // // //           <p className="text-text/70 text-base mt-3 max-w-xl mx-auto">
// // // // //             We are always looking for passionate tech writers and bloggers. Drop us an email with a sample of your writing!
// // // // //           </p>
// // // // //           <a
// // // // //             href="mailto:founders@techtalkhub.com"
// // // // //             className="inline-flex items-center gap-2 mt-8 bg-secondary text-background px-8 py-4 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 hover:opacity-95 transition-all active:scale-95"
// // // // //           >
// // // // //             Reach Out <ArrowRight size={16} />
// // // // //           </a>
// // // // //         </div>
// // // // //       </section>
// // // // //     </main>
// // // // //   );
// // // // // }