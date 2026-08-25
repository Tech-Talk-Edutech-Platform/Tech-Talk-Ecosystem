import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Blocks,
  BookOpen,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Clock3,
  Code2,
  Gamepad2,
  GraduationCap,
  Heart,
  Laptop,
  Lightbulb,
  List,
  Puzzle,
  Quote,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

export const revalidate = 60;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://techtalk-hub.com";

function formatDate(value) {
  if (!value) {
    return "Recently published";
  }

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",

    month: "long",

    year: "numeric",
  }).format(new Date(value));
}

function calculateReadingTime(content = "") {
  const cleanContent = String(content)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, "")
    .trim();

  const words = cleanContent
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(
    1,
    Math.ceil(words / 220)
  );
}

function createHeadingId(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getNodeText(value) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(getNodeText).join("");
  }

  if (value?.props?.children) {
    return getNodeText(
      value.props.children
    );
  }

  return "";
}

function extractHeadings(content = "") {
  return String(content)
    .split("\n")
    .map((line) => {
      const match = line.match(
        /^##\s+(.+)$/
      );

      if (!match) {
        return null;
      }

      const title = match[1]
        .replace(/\*\*/g, "")
        .trim();

      return {
        id: createHeadingId(title),

        title,
      };
    })
    .filter(Boolean);
}

function extractMarkdownImages(content = "") {
  const imagePattern =
    /!\[([^\]]*)\]\((\S+?)(?:\s+["'][^"']*["'])?\)/g;

  return Array.from(
    String(content).matchAll(imagePattern)
  ).map((match) => ({
    alt: match[1],

    src: match[2],
  }));
}

function getCategoryStyle(category = "") {
  const value = category.toLowerCase();

  if (value.includes("parent")) {
    return {
      background: "bg-[#FFF3F7]",

      text: "text-[#FF3F7F]",

      border: "border-[#FFD9E5]",
    };
  }

  if (value.includes("student")) {
    return {
      background: "bg-[#ECFDF5]",

      text: "text-[#059669]",

      border: "border-[#A7F3D0]",
    };
  }

  if (value.includes("coding")) {
    return {
      background: "bg-[#F1EEFF]",

      text: "text-[#7356F4]",

      border: "border-[#DDD5FF]",
    };
  }

  return {
    background: "bg-[#EEF5FF]",

    text: "text-[#315DF5]",

    border: "border-[#D9E6FF]",
  };
}

function shouldShowAgeCards(
  heading = "",
  content = ""
) {
  const headingText =
    heading.toLowerCase();

  if (
    !headingText.includes("age") &&
    !headingText.includes("start coding")
  ) {
    return false;
  }

  return (
    /ages?\s*5\s*[–-]\s*8/i.test(
      content
    ) ||
    /ages?\s*9\s*[–-]\s*12/i.test(
      content
    ) ||
    /ages?\s*13\s*[–-]\s*18/i.test(
      content
    )
  );
}

function shouldShowBenefitsCards(
  heading = ""
) {
  const headingText =
    heading.toLowerCase();

  return (
    headingText.includes("benefit") ||
    headingText.includes("why coding matters")
  );
}

function shouldShowChecklist(
  heading = ""
) {
  const headingText =
    heading.toLowerCase();

  return (
    headingText.includes(
      "good coding class"
    ) ||
    headingText.includes(
      "choose the right coding"
    )
  );
}

async function getPost(slug) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to fetch article:",
      error
    );

    return null;
  }

  return data;
}

async function getRelatedPosts(post) {
  const baseColumns = `
    id,
    slug,
    title,
    excerpt,
    category,
    cover_image_url,
    published_at,
    created_at
  `;

  if (post.category) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(baseColumns)
      .eq("status", "published")
      .eq("category", post.category)
      .neq("id", post.id)
      .order("published_at", {
        ascending: false,

        nullsFirst: false,
      })
      .limit(3);

    if (error) {
      console.error(
        "Failed to fetch related articles:",
        error
      );
    }

    if (data?.length) {
      return data;
    }
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select(baseColumns)
    .eq("status", "published")
    .neq("id", post.id)
    .order("published_at", {
      ascending: false,

      nullsFirst: false,
    })
    .limit(3);

  if (error) {
    console.error(
      "Failed to fetch recent articles:",
      error
    );

    return [];
  }

  return data || [];
}

function AgeGroupCards() {
  const groups = [
    {
      title: "Ages 5–8",

      subtitle: "Junior Coders",

      description:
        "Learn through play, visual blocks, storytelling and simple logic.",

      icon: Puzzle,

      background:
        "from-[#F7F3FF] to-[#F0EAFF]",

      iconBackground:
        "bg-[#E8DEFF]",

      iconColor:
        "text-[#7951EF]",

      border:
        "border-[#E8DDFF]",
    },

    {
      title: "Ages 9–12",

      subtitle:
        "Future Developers",

      description:
        "Build games, explore Python and create beginner websites.",

      icon: Code2,

      background:
        "from-[#F1F7FF] to-[#E9F2FF]",

      iconBackground:
        "bg-[#DCEBFF]",

      iconColor:
        "text-[#3266E8]",

      border:
        "border-[#DDEAFF]",
    },

    {
      title: "Ages 13–18",

      subtitle:
        "Tech Professionals",

      description:
        "Explore apps, AI, data science and real-world technology projects.",

      icon: Rocket,

      background:
        "from-[#FFF5F2] to-[#FFF0EB]",

      iconBackground:
        "bg-[#FFE1D8]",

      iconColor:
        "text-[#F56746]",

      border:
        "border-[#FFE0D6]",
    },
  ];

  return (
    <div className="my-8 grid gap-4 sm:grid-cols-3">
      {groups.map((group) => {
        const Icon = group.icon;

        return (
          <div
            key={group.title}
            className={`rounded-[1.5rem] border bg-gradient-to-br p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${group.background} ${group.border}`}
          >
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${group.iconBackground} ${group.iconColor}`}
            >
              <Icon size={21} />
            </span>

            <h3 className="mt-4 text-lg font-black text-[#172554]">
              {group.title}
            </h3>

            <p
              className={`mt-1 text-xs font-bold ${group.iconColor}`}
            >
              {group.subtitle}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {group.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function BenefitsCards() {
  const benefits = [
    {
      title:
        "Problem-solving",

      description:
        "Break challenges into clear, manageable steps.",

      icon:
        BrainCircuit,

      background:
        "bg-[#F4F0FF]",

      iconBackground:
        "bg-[#E8DDFF]",

      iconColor:
        "text-[#7853EE]",
    },

    {
      title:
        "Creativity",

      description:
        "Turn original ideas into games, stories and apps.",

      icon:
        Lightbulb,

      background:
        "bg-[#EDF5FF]",

      iconBackground:
        "bg-[#DCEBFF]",

      iconColor:
        "text-[#3571E8]",
    },

    {
      title:
        "Confidence",

      description:
        "Build independence through practical achievements.",

      icon:
        Target,

      background:
        "bg-[#FFF2EE]",

      iconBackground:
        "bg-[#FFE0D8]",

      iconColor:
        "text-[#F36649]",
    },

    {
      title:
        "Future skills",

      description:
        "Develop useful skills for a technology-driven world.",

      icon:
        GraduationCap,

      background:
        "bg-[#EEFAF7]",

      iconBackground:
        "bg-[#D8F4EC]",

      iconColor:
        "text-[#11A487]",
    },
  ];

  return (
    <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {benefits.map((benefit) => {
        const Icon = benefit.icon;

        return (
          <div
            key={benefit.title}
            className={`rounded-[1.4rem] p-5 transition hover:-translate-y-0.5 hover:shadow-md ${benefit.background}`}
          >
            <div className="flex items-start gap-4">
              <span
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${benefit.iconBackground} ${benefit.iconColor}`}
              >
                <Icon size={21} />
              </span>

              <div>
                <h3 className="text-base font-black text-[#172554]">
                  {benefit.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {benefit.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LearningChecklist() {
  const items = [
    {
      label:
        "Age-appropriate lessons",

      icon:
        Blocks,
    },

    {
      label:
        "Live tutor guidance",

      icon:
        UserRound,
    },

    {
      label:
        "Practical projects",

      icon:
        Laptop,
    },

    {
      label:
        "A clear learning pathway",

      icon:
        Rocket,
    },

    {
      label:
        "Regular progress updates",

      icon:
        Target,
    },

    {
      label:
        "Safe, responsible technology use",

      icon:
        ShieldCheck,
    },
  ];

  return (
    <div className="my-8 grid gap-3 rounded-[1.75rem] border border-purple-100 bg-[#FCFAFF] p-5 sm:grid-cols-2 sm:p-6">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#7651EF]">
              <Icon size={17} />
            </span>

            <span className="text-sm font-semibold leading-5 text-slate-700">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ArticleImage({
  src,

  alt,
}) {
  if (!src) {
    return null;
  }

  return (
    <figure className="my-10 sm:my-14">
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-[#F8F6FF] shadow-xl shadow-purple-950/5">
        <img
          src={src}
          alt={
            alt ||
            "Tech Talk Hub article illustration"
          }
          loading="lazy"
          decoding="async"
          className="block h-auto w-full object-contain"
        />
      </div>

      {alt && (
        <figcaption className="mt-3 text-center text-xs font-medium italic tracking-wide text-slate-400 sm:text-sm">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

function FeaturedQuote({
  children,
}) {
  return (
    <blockquote className="relative my-10 overflow-hidden rounded-[1.75rem] border border-purple-100 bg-gradient-to-r from-[#F5F1FF] via-[#F8F5FF] to-[#FFF4F7] px-6 py-7 sm:px-9">
      <Quote className="absolute right-5 top-5 h-12 w-12 text-purple-200/70" />

      <div className="relative flex items-start gap-4">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-[#7853EE]">
          <Quote size={19} />
        </span>

        <div className="text-base font-bold italic leading-8 text-[#5845C9] sm:text-lg [&_p]:my-0 [&_p]:text-[#5845C9]">
          {children}
        </div>
      </div>

      <p className="ml-14 mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-purple-400">
        Tech Talk Hub
      </p>
    </blockquote>
  );
}

function ArticleContent({
  content,
}) {
  return (
    <div className="article-content">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
        ]}
        components={{
          h1({
            children,
          }) {
            const title =
              getNodeText(
                children
              );

            return (
              <h2
                id={createHeadingId(
                  title
                )}
                className="mb-5 mt-14 scroll-mt-28 text-3xl font-black leading-tight tracking-tight text-[#2947C7] sm:text-4xl"
              >
                {children}
              </h2>
            );
          },

          h2({
            children,
          }) {
            const title =
              getNodeText(
                children
              );

            const displayAgeCards =
              shouldShowAgeCards(
                title,

                content
              );

            const displayBenefitsCards =
              shouldShowBenefitsCards(
                title
              );

            const displayChecklist =
              shouldShowChecklist(
                title
              );

            return (
              <>
                <h2
                  id={createHeadingId(
                    title
                  )}
                  className="mb-5 mt-14 scroll-mt-28 text-[1.75rem] font-black leading-tight tracking-tight text-[#2947C7] sm:mt-16 sm:text-[2rem]"
                >
                  {children}
                </h2>

                {displayAgeCards && (
                  <AgeGroupCards />
                )}

                {displayBenefitsCards && (
                  <BenefitsCards />
                )}

                {displayChecklist && (
                  <LearningChecklist />
                )}
              </>
            );
          },

          h3({
            children,
          }) {
            const title =
              getNodeText(
                children
              );

            const isNumberedBenefit =
              /^\d+\.\s/.test(
                title
              );

            return (
              <h3
                id={createHeadingId(
                  title
                )}
                className={`mb-4 mt-10 scroll-mt-28 font-extrabold leading-snug text-[#172554] ${
                  isNumberedBenefit
                    ? "text-lg sm:text-xl"
                    : "text-xl sm:text-2xl"
                }`}
              >
                {children}
              </h3>
            );
          },

          h4({
            children,
          }) {
            const title =
              getNodeText(
                children
              );

            return (
              <h4
                id={createHeadingId(
                  title
                )}
                className="mb-3 mt-8 scroll-mt-28 text-lg font-bold text-[#172554]"
              >
                {children}
              </h4>
            );
          },

          p({
            children,

            node,
          }) {
            const containsImage =
              node?.children?.some(
                (child) =>
                  child.tagName ===
                  "img"
              );

            if (
              containsImage
            ) {
              return (
                <>
                  {children}
                </>
              );
            }

            return (
              <p className="my-5 text-[16px] leading-[1.95] text-slate-600 sm:text-[17px]">
                {children}
              </p>
            );
          },

          strong({
            children,
          }) {
            return (
              <strong className="font-extrabold text-[#172554]">
                {children}
              </strong>
            );
          },

          em({
            children,
          }) {
            return (
              <em className="text-slate-700">
                {children}
              </em>
            );
          },

          ul({
            children,
          }) {
            return (
              <ul className="my-7 list-disc space-y-3 pl-6 marker:text-[#FF3F7F]">
                {children}
              </ul>
            );
          },

          ol({
            children,
          }) {
            return (
              <ol className="my-7 list-decimal space-y-3 pl-6 marker:font-bold marker:text-[#FF3F7F]">
                {children}
              </ol>
            );
          },

          li({
            children,
          }) {
            return (
              <li className="pl-2 text-[16px] leading-8 text-slate-600 sm:text-[17px] [&_p]:my-0">
                {children}
              </li>
            );
          },

          blockquote({
            children,
          }) {
            return (
              <FeaturedQuote>
                {children}
              </FeaturedQuote>
            );
          },

          a({
            href,

            children,
          }) {
            const isExternal =
              href?.startsWith(
                "http"
              );

            return (
              <a
                href={
                  href
                }
                target={
                  isExternal
                    ? "_blank"
                    : undefined
                }
                rel={
                  isExternal
                    ? "noreferrer noopener"
                    : undefined
                }
                className="font-bold text-[#FF3F7F] underline decoration-pink-200 underline-offset-4 transition hover:text-[#E92C70]"
              >
                {children}
              </a>
            );
          },

          img({
            src,

            alt,
          }) {
            return (
              <ArticleImage
                src={
                  src
                }
                alt={
                  alt
                }
              />
            );
          },

          hr() {
            return (
              <hr className="my-12 border-slate-200" />
            );
          },

          table({
            children,
          }) {
            return (
              <div className="my-8 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full border-collapse text-left text-sm">
                  {children}
                </table>
              </div>
            );
          },

          thead({
            children,
          }) {
            return (
              <thead className="bg-[#F8F5FF] text-[#2947C7]">
                {children}
              </thead>
            );
          },

          th({
            children,
          }) {
            return (
              <th className="px-5 py-4 font-black">
                {children}
              </th>
            );
          },

          td({
            children,
          }) {
            return (
              <td className="border-t border-slate-100 px-5 py-4 text-slate-600">
                {children}
              </td>
            );
          },

          pre({
            children,
          }) {
            return (
              <pre className="my-8 overflow-x-auto rounded-2xl bg-[#172554] p-5 text-sm leading-7 text-white">
                {children}
              </pre>
            );
          },

          code({
            children,

            className,

            ...props
          }) {
            if (
              className
            ) {
              return (
                <code
                  className={
                    className
                  }
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code
                className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[0.9em] font-semibold text-[#7C3AED]"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content ||
          ""}
      </ReactMarkdown>
    </div>
  );
}

function ArticleSidebar({
  headings,

  readingTime,
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 space-y-6">
        {headings.length >
          0 && (
          <div className="rounded-[1.75rem] border border-purple-100 bg-[#FCFAFF] p-5 shadow-sm shadow-purple-950/[0.02]">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#2947C7]">
              <List size={16} />

              In this article
            </p>

            <nav className="relative mt-5 space-y-1 border-l border-purple-100">
              {headings.map(
                (
                  heading,

                  index
                ) => (
                  <a
                    key={`${heading.id}-${index}`}
                    href={`#${heading.id}`}
                    className="relative -ml-px block border-l-2 border-transparent py-2 pl-4 text-sm leading-6 text-slate-500 transition hover:border-[#7651EF] hover:text-[#2947C7]"
                  >
                    {
                      heading.title
                    }
                  </a>
                )
              )}
            </nav>

            <div className="mt-5 border-t border-purple-100 pt-4">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <Clock3
                  size={14}
                />

                {readingTime} min
                read
              </span>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-[1.75rem] border border-purple-100 bg-gradient-to-br from-[#F7F3FF] to-[#F0E9FF] p-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#7651EF] shadow-sm">
            <BookOpen
              size={19}
            />
          </span>

          <h3 className="mt-4 text-base font-black leading-snug text-[#2947C7]">
            Discover the right
            coding program.
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Explore learning paths
            designed for your
            child’s age.
          </p>

          <Link
            href="/programs"
            className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#7651EF]"
          >
            View programs

            <ArrowRight
              size={15}
            />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#2947C7] via-[#594BE1] to-[#7951EF] p-5 text-white shadow-xl shadow-purple-500/15">
          <div className="pointer-events-none absolute -right-7 -top-7 h-24 w-24 rounded-full bg-white/10" />

          <div className="pointer-events-none absolute -bottom-10 left-5 h-24 w-24 rounded-full bg-white/10" />

          <p className="relative text-xs font-black uppercase tracking-[0.15em] text-white/70">
            Tech Talk Hub
          </p>

          <h3 className="relative mt-3 text-lg font-black leading-snug">
            Help your child
            start coding.
          </h3>

          <p className="relative mt-3 text-sm leading-6 text-white/75">
            Live, personalized
            classes for young
            creators.
          </p>

          <Link
            href="/book-class"
            className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#2947C7]"
          >
            Book a trial

            <ArrowRight
              size={14}
            />
          </Link>
        </div>
      </div>
    </aside>
  );
}

function MobileTableOfContents({
  headings,
}) {
  if (
    headings.length === 0
  ) {
    return null;
  }

  return (
    <details className="mb-9 rounded-2xl border border-purple-100 bg-[#FCFAFF] p-5 lg:hidden">
      <summary className="cursor-pointer list-none text-sm font-black text-[#2947C7]">
        <span className="inline-flex items-center gap-2">
          <List size={17} />

          In this article
        </span>
      </summary>

      <nav className="mt-4 space-y-3 border-l border-purple-100 pl-4">
        {headings.map(
          (
            heading,

            index
          ) => (
            <a
              key={`${heading.id}-${index}`}
              href={`#${heading.id}`}
              className="block text-sm leading-6 text-slate-600 transition hover:text-[#FF3F7F]"
            >
              {
                heading.title
              }
            </a>
          )
        )}
      </nav>
    </details>
  );
}

function ArticleCallToAction({
  image,
}) {
  return (
    <section className="relative mt-16 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#7758F2] via-[#7053EE] to-[#A584F8] shadow-2xl shadow-purple-500/20">
      <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-white/10" />

      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-52 w-52 rounded-full bg-white/10" />

      <div className="grid items-center gap-7 p-7 sm:p-9 md:grid-cols-[1fr_190px]">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white">
            <Sparkles
              size={13}
            />

            Start their journey
          </p>

          <h2 className="mt-5 max-w-lg text-2xl font-black leading-tight text-white sm:text-3xl">
            Ready to help your
            child start coding?
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
            Discover personalized
            classes that help
            young learners build,
            create and grow with
            technology.
          </p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2
                size={15}
              />

              Live classes
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2
                size={15}
              />

              Practical projects
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2
                size={15}
              />

              Ages 5–18
            </span>
          </div>

          <Link
            href="/book-class"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF6B63] px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#FF5951]"
          >
            Book a trial class

            <ArrowRight
              size={16}
            />
          </Link>
        </div>

        <div className="relative hidden h-44 items-center justify-center md:flex">
          <div className="absolute inset-0 rounded-full bg-white/10" />

          {image?.src ? (
            <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-white/30 bg-white shadow-lg">
              <img
                src={
                  image.src
                }
                alt={
                  image.alt ||
                  "Tech Talk Hub learner"
                }
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white">
              <Rocket
                size={55}
              />
            </div>
          )}

          <span className="absolute left-1 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
            <Code2
              size={19}
            />
          </span>

          <span className="absolute bottom-3 right-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
            <Gamepad2
              size={19}
            />
          </span>
        </div>
      </div>
    </section>
  );
}

function RelatedArticles({
  posts,
}) {
  if (
    posts.length === 0
  ) {
    return null;
  }

  return (
    <section className="border-t border-purple-50 bg-[#FBFAFF] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF3F7F]">
              More for parents
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#2947C7]">
              Continue reading
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-black text-[#7651EF]"
          >
            View all articles

            <ArrowRight
              size={16}
            />
          </Link>
        </div>

        <div className="mt-9 grid gap-7 md:grid-cols-3">
          {posts.map(
            (post) => {
              const categoryStyle =
                getCategoryStyle(
                  post.category
                );

              return (
                <article
                  key={
                    post.id
                  }
                  className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {post.cover_image_url ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="relative block aspect-[16/9] overflow-hidden bg-[#F8F5FF]"
                    >
                      <Image
                        src={
                          post.cover_image_url
                        }
                        alt={
                          post.title
                        }
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain transition duration-500 group-hover:scale-[1.04]"
                      />
                    </Link>
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#F5F0FF] to-[#EEF4FF] text-[#7651EF]">
                      <BookOpen
                        size={
                          38
                        }
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${categoryStyle.background} ${categoryStyle.text} ${categoryStyle.border}`}
                    >
                      {post.category ||
                        "Tech Talk Hub"}
                    </span>

                    <h3 className="mt-4 text-xl font-black leading-snug text-[#2947C7]">
                      <Link
                        href={`/blog/${post.slug}`}
                      >
                        {
                          post.title
                        }
                      </Link>
                    </h3>

                    {post.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                        {
                          post.excerpt
                        }
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-black text-[#FF3F7F]"
                      >
                        Read story

                        <ArrowRight
                          size={
                            15
                          }
                        />
                      </Link>

                      <span className="text-xs text-slate-400">
                        {formatDate(
                          post.published_at ||
                            post.created_at
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}) {
  const {
    slug,
  } = await params;

  const post =
    await getPost(
      slug
    );

  if (!post) {
    return {
      title:
        "Article Not Found | Tech Talk Hub",
    };
  }

  const articleUrl =
    `${SITE_URL}/blog/${post.slug}`;

  return {
    title:
      `${post.title} | Tech Talk Hub`,

    description:
      post.excerpt ||
      "Discover helpful insights about coding, creativity and technology education for young learners.",

    alternates: {
      canonical:
        articleUrl,
    },

    openGraph: {
      title:
        post.title,

      description:
        post.excerpt ||
        "Read the latest insights from Tech Talk Hub.",

      url:
        articleUrl,

      siteName:
        "Tech Talk Hub",

      type:
        "article",

      publishedTime:
        post.published_at ||
        undefined,

      images:
        post.cover_image_url
          ? [
              {
                url:
                  post.cover_image_url,

                width:
                  1200,

                height:
                  630,

                alt:
                  post.title,
              },
            ]
          : [],
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        post.title,

      description:
        post.excerpt ||
        "Read the latest insights from Tech Talk Hub.",

      images:
        post.cover_image_url
          ? [
              post.cover_image_url,
            ]
          : [],
    },

    robots: {
      index:
        true,

      follow:
        true,
    },
  };
}

export default async function BlogPostPage({
  params,
}) {
  const {
    slug,
  } = await params;

  const post =
    await getPost(
      slug
    );

  if (!post) {
    notFound();
  }

  const [
    relatedPosts,
  ] = await Promise.all([
    getRelatedPosts(
      post
    ),
  ]);

  const readingTime =
    calculateReadingTime(
      post.content
    );

  const headings =
    extractHeadings(
      post.content
    );

  const articleImages =
    extractMarkdownImages(
      post.content
    );

  const featuredArticleImage =
    articleImages[
      articleImages.length -
        1
    ];

  const categoryStyle =
    getCategoryStyle(
      post.category
    );

  const articleSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "BlogPosting",

    headline:
      post.title,

    description:
      post.excerpt ||
      undefined,

    image:
      post.cover_image_url ||
      undefined,

    datePublished:
      post.published_at ||
      post.created_at,

    dateModified:
      post.updated_at ||
      post.published_at ||
      post.created_at,

    author: {
      "@type":
        "Organization",

      name:
        "Tech Talk Hub",

      url:
        SITE_URL,
    },

    publisher: {
      "@type":
        "Organization",

      name:
        "Tech Talk Hub",

      url:
        SITE_URL,
    },

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        `${SITE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <main className="min-h-screen bg-white text-[#172554]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleSchema
            ).replace(
              /</g,

              "\\u003c"
            ),
        }}
      />

      <header className="relative overflow-hidden bg-gradient-to-br from-white via-[#FCFAFF] to-[#F4EEFF] px-5 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
        <div className="pointer-events-none absolute -left-36 top-14 h-80 w-80 rounded-full bg-[#9B6CFF]/10 blur-[110px]" />

        <div className="pointer-events-none absolute -right-28 top-0 h-96 w-96 rounded-full bg-[#FF3F7F]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/blog"
            className="mb-9 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#FF3F7F]"
          >
            <ArrowLeft
              size={17}
            />

            Back to all stories
          </Link>

          <div className="max-w-4xl">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${categoryStyle.background} ${categoryStyle.text} ${categoryStyle.border}`}
            >
              <Sparkles
                size={14}
              />

              {post.category ||
                "Tech Talk Hub"}
            </span>

            <h1 className="mt-6 text-[2.4rem] font-black leading-[1.08] tracking-tight text-[#2947C7] sm:text-5xl lg:text-[4rem]">
              {
                post.title
              }
            </h1>

            {post.excerpt && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
                {
                  post.excerpt
                }
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-[#7651EF]">
                  <UserRound
                    size={15}
                  />
                </span>

                Tech Talk Hub Team
              </span>

              <span className="flex items-center gap-2">
                <Calendar
                  size={16}
                />

                {formatDate(
                  post.published_at ||
                    post.created_at
                )}
              </span>

              <span className="flex items-center gap-2">
                <Clock3
                  size={16}
                />

                {readingTime} min
                read
              </span>
            </div>
          </div>
        </div>
      </header>

      {post.cover_image_url && (
        <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:-mt-14 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/80 bg-white shadow-2xl shadow-purple-900/10 sm:rounded-[2rem]">
            <div className="relative aspect-[16/9]">
              <Image
                src={
                  post.cover_image_url
                }
                alt={
                  post.title
                }
                fill
                priority
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-contain"
              />
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[230px_minmax(0,760px)] lg:justify-center lg:gap-16">
          <ArticleSidebar
            headings={
              headings
            }
            readingTime={
              readingTime
            }
          />

          <article className="min-w-0">
            <MobileTableOfContents
              headings={
                headings
              }
            />

            <div className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">
              <BadgeCheck
                size={15}
                className="text-[#7651EF]"
              />

              Parent-friendly guide
            </div>

            <ArticleContent
              content={
                post.content
              }
            />

            <ArticleCallToAction
              image={
                featuredArticleImage
              }
            />

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#7651EF]"
              >
                <ArrowLeft
                  size={16}
                />

                Back to all
                articles
              </Link>

              <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                <Heart
                  size={15}
                  className="text-[#FF3F7F]"
                />

                Created for
                curious young
                minds
              </span>
            </div>
          </article>
        </div>
      </section>

      <RelatedArticles
        posts={
          relatedPosts
        }
      />
    </main>
  );
}
// import Image from "next/image";
// import Link from "next/link";
// import { notFound } from "next/navigation";

// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// import {
//   ArrowLeft,
//   ArrowRight,
//   Calendar,
//   CheckCircle2,
//   Clock3,
//   Heart,
//   List,
//   Sparkles,
//   UserRound,
// } from "lucide-react";

// import { supabase } from "../../../lib/supabase";

// export const revalidate = 60;

// function formatDate(date) {
//   if (!date) {
//     return "Recently published";
//   }

//   return new Intl.DateTimeFormat("en-KE", {
//     day: "numeric",

//     month: "long",

//     year: "numeric",
//   }).format(new Date(date));
// }

// function calculateReadingTime(content = "") {
//   const cleanContent = content
//     .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
//     .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
//     .replace(/[#>*_`~-]/g, "");

//   const words = cleanContent
//     .trim()
//     .split(/\s+/)
//     .filter(Boolean).length;

//   return Math.max(1, Math.ceil(words / 220));
// }

// function createHeadingId(value = "") {
//   return String(value)
//     .toLowerCase()
//     .trim()
//     .replace(/['’]/g, "")
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
// }

// function getNodeText(value) {
//   if (typeof value === "string") {
//     return value;
//   }

//   if (typeof value === "number") {
//     return String(value);
//   }

//   if (Array.isArray(value)) {
//     return value.map(getNodeText).join("");
//   }

//   if (value?.props?.children) {
//     return getNodeText(value.props.children);
//   }

//   return "";
// }

// function extractHeadings(content = "") {
//   return content
//     .split("\n")
//     .map((line) => {
//       const match = line.match(/^##\s+(.+)$/);

//       if (!match) {
//         return null;
//       }

//       const title = match[1].trim();

//       return {
//         id: createHeadingId(title),

//         title,
//       };
//     })
//     .filter(Boolean);
// }

// async function getPost(slug) {
//   const { data, error } = await supabase
//     .from("blog_posts")
//     .select("*")
//     .eq("slug", slug)
//     .eq("status", "published")
//     .maybeSingle();

//   if (error) {
//     console.error(
//       "Failed to fetch article:",
//       error
//     );

//     return null;
//   }

//   return data;
// }

// async function getRelatedPosts(post) {
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
//     .neq("id", post.id)
//     .order("published_at", {
//       ascending: false,

//       nullsFirst: false,
//     })
//     .limit(3);

//   if (post.category) {
//     query = query.eq(
//       "category",
//       post.category
//     );
//   }

//   const { data, error } = await query;

//   if (error) {
//     console.error(
//       "Failed to fetch related articles:",
//       error
//     );

//     return [];
//   }

//   return data || [];
// }

// function ArticleImage({ src, alt }) {
//   if (!src) {
//     return null;
//   }

//   return (
//     <figure className="my-10 sm:my-14">
//       <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-[#F8F6FF] shadow-lg shadow-purple-950/5">
//         <img
//           src={src}
//           alt={alt || "Article illustration"}
//           loading="lazy"
//           className="mx-auto block max-h-[650px] w-full object-contain"
//         />
//       </div>

//       {alt && (
//         <figcaption className="mt-3 text-center text-sm italic text-slate-400">
//           {alt}
//         </figcaption>
//       )}
//     </figure>
//   );
// }

// function ArticleContent({ content }) {
//   return (
//     <div className="article-content">
//       <ReactMarkdown
//         remarkPlugins={[remarkGfm]}
//         components={{
//           h1({ children }) {
//             const title = getNodeText(children);

//             return (
//               <h2
//                 id={createHeadingId(title)}
//                 className="mb-5 mt-14 scroll-mt-28 text-3xl font-black leading-tight tracking-tight text-[#2947C7] sm:text-4xl"
//               >
//                 {children}
//               </h2>
//             );
//           },

//           h2({ children }) {
//             const title = getNodeText(children);

//             return (
//               <h2
//                 id={createHeadingId(title)}
//                 className="mb-5 mt-14 scroll-mt-28 text-2xl font-black leading-tight tracking-tight text-[#2947C7] sm:mt-16 sm:text-3xl"
//               >
//                 {children}
//               </h2>
//             );
//           },

//           h3({ children }) {
//             const title = getNodeText(children);

//             return (
//               <h3
//                 id={createHeadingId(title)}
//                 className="mb-4 mt-10 scroll-mt-28 text-xl font-extrabold leading-snug text-[#172554] sm:text-2xl"
//               >
//                 {children}
//               </h3>
//             );
//           },

//           h4({ children }) {
//             const title = getNodeText(children);

//             return (
//               <h4
//                 id={createHeadingId(title)}
//                 className="mb-3 mt-8 scroll-mt-28 text-lg font-bold text-[#172554]"
//               >
//                 {children}
//               </h4>
//             );
//           },

//           p({ children, node }) {
//             const containsImage =
//               node?.children?.some(
//                 (child) => child.tagName === "img"
//               );

//             if (containsImage) {
//               return <>{children}</>;
//             }

//             return (
//               <p className="my-5 text-[16px] leading-[1.95] text-slate-600 sm:text-[17px]">
//                 {children}
//               </p>
//             );
//           },

//           strong({ children }) {
//             return (
//               <strong className="font-extrabold text-[#172554]">
//                 {children}
//               </strong>
//             );
//           },

//           em({ children }) {
//             return (
//               <em className="text-slate-700">
//                 {children}
//               </em>
//             );
//           },

//           ul({ children }) {
//             return (
//               <ul className="my-7 space-y-3 pl-1">
//                 {children}
//               </ul>
//             );
//           },

//           ol({ children }) {
//             return (
//               <ol className="my-7 list-decimal space-y-3 pl-6 marker:font-bold marker:text-[#FF3F7F]">
//                 {children}
//               </ol>
//             );
//           },

//           li({ children, node }) {
//             const ordered =
//               node?.position &&
//               false;

//             return (
//               <li className="relative pl-2 text-[16px] leading-8 text-slate-600 marker:text-[#FF3F7F] sm:text-[17px] [&_p]:my-0">
//                 {children}
//               </li>
//             );
//           },

//           blockquote({ children }) {
//             return (
//               <blockquote className="my-10 rounded-r-[1.75rem] border-l-[5px] border-[#FF3F7F] bg-gradient-to-r from-[#FFF5F8] to-[#FBF8FF] px-6 py-5 sm:px-8">
//                 <div className="text-lg font-semibold italic leading-8 text-[#2947C7] [&_p]:my-1 [&_p]:text-[#2947C7]">
//                   {children}
//                 </div>
//               </blockquote>
//             );
//           },

//           a({ href, children }) {
//             const isExternal =
//               href?.startsWith("http");

//             return (
//               <a
//                 href={href}
//                 target={
//                   isExternal
//                     ? "_blank"
//                     : undefined
//                 }
//                 rel={
//                   isExternal
//                     ? "noreferrer noopener"
//                     : undefined
//                 }
//                 className="font-bold text-[#FF3F7F] underline decoration-pink-200 underline-offset-4 transition hover:text-[#E92C70]"
//               >
//                 {children}
//               </a>
//             );
//           },

//           img({ src, alt }) {
//             return (
//               <ArticleImage
//                 src={src}
//                 alt={alt}
//               />
//             );
//           },

//           hr() {
//             return (
//               <hr className="my-12 border-slate-200" />
//             );
//           },

//           table({ children }) {
//             return (
//               <div className="my-8 overflow-x-auto rounded-2xl border border-slate-200">
//                 <table className="min-w-full border-collapse text-left text-sm">
//                   {children}
//                 </table>
//               </div>
//             );
//           },

//           thead({ children }) {
//             return (
//               <thead className="bg-[#F8F5FF] text-[#2947C7]">
//                 {children}
//               </thead>
//             );
//           },

//           th({ children }) {
//             return (
//               <th className="px-5 py-4 font-black">
//                 {children}
//               </th>
//             );
//           },

//           td({ children }) {
//             return (
//               <td className="border-t border-slate-100 px-5 py-4 text-slate-600">
//                 {children}
//               </td>
//             );
//           },

//           pre({ children }) {
//             return (
//               <pre className="my-8 overflow-x-auto rounded-2xl bg-[#172554] p-5 text-sm leading-7 text-white">
//                 {children}
//               </pre>
//             );
//           },

//           code({
//             children,
//             className,
//             ...props
//           }) {
//             const isCodeBlock =
//               Boolean(className);

//             if (isCodeBlock) {
//               return (
//                 <code
//                   className={className}
//                   {...props}
//                 >
//                   {children}
//                 </code>
//               );
//             }

//             return (
//               <code
//                 className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[0.9em] font-semibold text-[#7C3AED]"
//                 {...props}
//               >
//                 {children}
//               </code>
//             );
//           },
//         }}
//       >
//         {content || ""}
//       </ReactMarkdown>
//     </div>
//   );
// }

// export async function generateMetadata({
//   params,
// }) {
//   const { slug } = await params;

//   const post = await getPost(slug);

//   if (!post) {
//     return {
//       title:
//         "Article Not Found | Tech Talk Hub",
//     };
//   }

//   const siteUrl =
//     process.env.NEXT_PUBLIC_SITE_URL ||
//     "https://techtalk-hub.com";

//   const articleUrl =
//     `${siteUrl}/blog/${post.slug}`;

//   return {
//     title:
//       `${post.title} | Tech Talk Hub`,

//     description:
//       post.excerpt ||
//       "Read the latest insights from Tech Talk Hub.",

//     alternates: {
//       canonical: articleUrl,
//     },

//     openGraph: {
//       title: post.title,

//       description:
//         post.excerpt ||
//         "Read the latest insights from Tech Talk Hub.",

//       url: articleUrl,

//       siteName: "Tech Talk Hub",

//       type: "article",

//       publishedTime:
//         post.published_at || undefined,

//       images: post.cover_image_url
//         ? [
//             {
//               url: post.cover_image_url,

//               width: 1200,

//               height: 630,

//               alt: post.title,
//             },
//           ]
//         : [],
//     },

//     twitter: {
//       card: "summary_large_image",

//       title: post.title,

//       description:
//         post.excerpt ||
//         "Read the latest insights from Tech Talk Hub.",

//       images: post.cover_image_url
//         ? [post.cover_image_url]
//         : [],
//     },
//   };
// }

// export default async function BlogPostPage({
//   params,
// }) {
//   const { slug } = await params;

//   const post = await getPost(slug);

//   if (!post) {
//     notFound();
//   }

//   const [
//     relatedPosts,
//     readingTime,
//     headings,
//   ] = await Promise.all([
//     getRelatedPosts(post),

//     Promise.resolve(
//       calculateReadingTime(
//         post.content
//       )
//     ),

//     Promise.resolve(
//       extractHeadings(
//         post.content
//       )
//     ),
//   ]);

//   const siteUrl =
//     process.env.NEXT_PUBLIC_SITE_URL ||
//     "https://techtalk-hub.com";

//   const articleSchema = {
//     "@context":
//       "https://schema.org",

//     "@type": "BlogPosting",

//     headline: post.title,

//     description:
//       post.excerpt || undefined,

//     image:
//       post.cover_image_url || undefined,

//     datePublished:
//       post.published_at ||
//       post.created_at,

//     dateModified:
//       post.updated_at ||
//       post.published_at ||
//       post.created_at,

//     author: {
//       "@type": "Organization",

//       name: "Tech Talk Hub",

//       url: siteUrl,
//     },

//     publisher: {
//       "@type": "Organization",

//       name: "Tech Talk Hub",

//       url: siteUrl,
//     },

//     mainEntityOfPage: {
//       "@type": "WebPage",

//       "@id":
//         `${siteUrl}/blog/${post.slug}`,
//     },
//   };

//   return (
//     <main className="min-h-screen bg-white text-[#172554]">
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{
//           __html: JSON.stringify(
//             articleSchema
//           ).replace(
//             /</g,
//             "\\u003c"
//           ),
//         }}
//       />

//       <header className="relative overflow-hidden bg-gradient-to-br from-white via-[#FBF9FF] to-[#F0E8FF] px-6 pb-20 pt-32 lg:px-8 lg:pb-24">
//         <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#9B6CFF]/10 blur-[100px]" />

//         <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#FF3F7F]/10 blur-[110px]" />

//         <div className="relative mx-auto max-w-5xl">
//           <Link
//             href="/blog"
//             className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#FF3F7F]"
//           >
//             <ArrowLeft size={17} />

//             Back to all stories
//           </Link>

//           <div className="max-w-4xl">
//             <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FF3F7F]">
//               <Sparkles size={14} />

//               {post.category ||
//                 "Tech Talk Hub"}
//             </span>

//             <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-[#2947C7] sm:text-5xl lg:text-6xl">
//               {post.title}
//             </h1>

//             {post.excerpt && (
//               <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
//                 {post.excerpt}
//               </p>
//             )}

//             <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
//               <span className="flex items-center gap-2">
//                 <UserRound size={16} />

//                 Tech Talk Hub Team
//               </span>

//               <span className="flex items-center gap-2">
//                 <Calendar size={16} />

//                 {formatDate(
//                   post.published_at ||
//                     post.created_at
//                 )}
//               </span>

//               <span className="flex items-center gap-2">
//                 <Clock3 size={16} />

//                 {readingTime} min read
//               </span>
//             </div>
//           </div>
//         </div>
//       </header>

//       {post.cover_image_url && (
//         <section className="relative z-10 mx-auto -mt-9 max-w-6xl px-5 sm:-mt-12 sm:px-6 lg:px-8">
//           <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-white/70 bg-white shadow-2xl shadow-purple-900/10 sm:rounded-[2rem]">
//             <Image
//               src={post.cover_image_url}
//               alt={post.title}
//               fill
//               priority
//               sizes="(max-width: 1152px) 100vw, 1152px"
//               className="object-contain"
//             />
//           </div>
//         </section>
//       )}

//       <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
//         <div className="grid gap-12 lg:grid-cols-[230px_minmax(0,760px)] lg:justify-center lg:gap-16">
//           <aside className="hidden lg:block">
//             <div className="sticky top-28 space-y-8">
//               {headings.length > 0 && (
//                 <div className="rounded-[1.75rem] border border-purple-100 bg-[#FCFAFF] p-5">
//                   <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#2947C7]">
//                     <List size={16} />

//                     In this article
//                   </p>

//                   <nav className="mt-5 space-y-3">
//                     {headings.map(
//                       (
//                         heading,
//                         index
//                       ) => (
//                         <a
//                           key={`${heading.id}-${index}`}
//                           href={`#${heading.id}`}
//                           className="block border-l-2 border-transparent pl-3 text-sm leading-6 text-slate-500 transition hover:border-[#FF3F7F] hover:text-[#2947C7]"
//                         >
//                           {
//                             heading.title
//                           }
//                         </a>
//                       )
//                     )}
//                   </nav>
//                 </div>
//               )}

//               <div className="rounded-[1.75rem] bg-gradient-to-br from-[#2947C7] to-[#7C3AED] p-5 text-white">
//                 <p className="text-xs font-black uppercase tracking-[0.15em] text-white/70">
//                   Tech Talk Hub
//                 </p>

//                 <h3 className="mt-3 text-lg font-black leading-snug">
//                   Help your child start
//                   coding.
//                 </h3>

//                 <p className="mt-3 text-sm leading-6 text-white/75">
//                   Live, personalized
//                   classes for young
//                   creators.
//                 </p>

//                 <Link
//                   href="/book-class"
//                   className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#2947C7]"
//                 >
//                   Book a trial

//                   <ArrowRight
//                     size={14}
//                   />
//                 </Link>
//               </div>
//             </div>
//           </aside>

//           <article className="min-w-0">
//             {headings.length > 0 && (
//               <details className="mb-9 rounded-2xl border border-purple-100 bg-[#FCFAFF] p-5 lg:hidden">
//                 <summary className="cursor-pointer list-none text-sm font-black text-[#2947C7]">
//                   <span className="inline-flex items-center gap-2">
//                     <List size={17} />

//                     In this article
//                   </span>
//                 </summary>

//                 <nav className="mt-4 space-y-3">
//                   {headings.map(
//                     (
//                       heading,
//                       index
//                     ) => (
//                       <a
//                         key={`${heading.id}-${index}`}
//                         href={`#${heading.id}`}
//                         className="block text-sm leading-6 text-slate-600 hover:text-[#FF3F7F]"
//                       >
//                         {heading.title}
//                       </a>
//                     )
//                   )}
//                 </nav>
//               </details>
//             )}

//             <ArticleContent
//               content={post.content}
//             />

//             <div className="mt-16 overflow-hidden rounded-[2rem] border border-purple-100 bg-gradient-to-br from-[#FBF8FF] via-white to-[#FFF5F8] p-7 shadow-sm sm:p-9">
//               <div className="flex items-start gap-4">
//                 <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-[#FF3F7F]">
//                   <Heart
//                     size={21}

//                     fill="currentColor"
//                   />
//                 </span>

//                 <div>
//                   <p className="text-xs font-black uppercase tracking-[0.14em] text-[#FF3F7F]">
//                     Start their journey
//                   </p>

//                   <h2 className="mt-2 text-2xl font-black leading-tight text-[#2947C7]">
//                     Help your child become
//                     a creator of
//                     technology.
//                   </h2>

//                   <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
//                     Explore personalized
//                     coding classes
//                     designed around your
//                     child’s age,
//                     interests and learning
//                     pace.
//                   </p>

//                   <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
//                     <span className="inline-flex items-center gap-1.5">
//                       <CheckCircle2
//                         size={15}

//                         className="text-green-500"
//                       />

//                       Live classes
//                     </span>

//                     <span className="inline-flex items-center gap-1.5">
//                       <CheckCircle2
//                         size={15}

//                         className="text-green-500"
//                       />

//                       Practical projects
//                     </span>

//                     <span className="inline-flex items-center gap-1.5">
//                       <CheckCircle2
//                         size={15}

//                         className="text-green-500"
//                       />

//                       Ages 5–18
//                     </span>
//                   </div>

//                   <Link
//                     href="/book-class"
//                     className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF3F7F] px-5 py-3 text-sm font-black text-white shadow-lg shadow-pink-500/20 transition hover:-translate-y-0.5 hover:bg-[#E92C70]"
//                   >
//                     Book a trial class

//                     <ArrowRight
//                       size={16}
//                     />
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </article>
//         </div>
//       </section>

//       {relatedPosts.length > 0 && (
//         <section className="bg-[#FBFAFF] py-20">
//           <div className="mx-auto max-w-7xl px-6 lg:px-8">
//             <div>
//               <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF3F7F]">
//                 More for parents
//               </p>

//               <h2 className="mt-3 text-3xl font-black text-[#2947C7]">
//                 Continue reading
//               </h2>
//             </div>

//             <div className="mt-9 grid gap-7 md:grid-cols-3">
//               {relatedPosts.map(
//                 (relatedPost) => (
//                   <article
//                     key={relatedPost.id}
//                     className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
//                   >
//                     {relatedPost.cover_image_url && (
//                       <Link
//                         href={`/blog/${relatedPost.slug}`}
//                         className="relative block aspect-[16/9] overflow-hidden bg-[#F8F5FF]"
//                       >
//                         <Image
//                           src={
//                             relatedPost.cover_image_url
//                           }

//                           alt={
//                             relatedPost.title
//                           }

//                           fill

//                           sizes="(max-width: 768px) 100vw, 33vw"

//                           className="object-contain transition duration-500 group-hover:scale-[1.03]"
//                         />
//                       </Link>
//                     )}

//                     <div className="p-6">
//                       <p className="text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
//                         {relatedPost.category ||
//                           "Tech Talk Hub"}
//                       </p>

//                       <h3 className="mt-3 text-xl font-black leading-snug text-[#2947C7]">
//                         <Link
//                           href={`/blog/${relatedPost.slug}`}
//                         >
//                           {
//                             relatedPost.title
//                           }
//                         </Link>
//                       </h3>

//                       {relatedPost.excerpt && (
//                         <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
//                           {
//                             relatedPost.excerpt
//                           }
//                         </p>
//                       )}

//                       <Link
//                         href={`/blog/${relatedPost.slug}`}
//                         className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#FF3F7F]"
//                       >
//                         Read story

//                         <ArrowRight
//                           size={15}
//                         />
//                       </Link>
//                     </div>
//                   </article>
//                 )
//               )}
//             </div>
//           </div>
//         </section>
//       )}
//     </main>
//   );
// }
// import Image from "next/image";
// import Link from "next/link";
// import { notFound } from "next/navigation";

// import {
//   ArrowLeft,
//   ArrowRight,
//   Calendar,
//   Clock3,
//   Heart,
//   UserRound,
// } from "lucide-react";
//  import { supabase } from "../../../lib/supabase";
// export const revalidate = 60;

// function formatDate(date) {
//   if (!date) return "Recently published";

//   return new Intl.DateTimeFormat("en-KE", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   }).format(new Date(date));
// }

// function calculateReadingTime(content = "") {
//   const words = content.trim().split(/\s+/).length;
//   return Math.max(1, Math.ceil(words / 220));
// }

// async function getPost(slug) {


//   const { data, error } = await supabase
//     .from("blog_posts")
//     .select("*")
//     .eq("slug", slug)
//     .eq("status", "published")
//     .maybeSingle();

//   if (error) {
//     console.error("Failed to fetch article:", error);
//     return null;
//   }

//   return data;
// }

// async function getRelatedPosts(post) {


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
//     .neq("id", post.id)
//     .order("published_at", {
//       ascending: false,
//       nullsFirst: false,
//     })
//     .limit(3);

//   if (post.category) {
//     query = query.eq("category", post.category);
//   }

//   const { data } = await query;

//   return data || [];
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
//         ? [
//             {
//               url: post.cover_image_url,
//               alt: post.title,
//             },
//           ]
//         : [],
//     },
//   };
// }

// export default async function BlogPostPage({
//   params,
// }) {
//   const { slug } = await params;
//   const post = await getPost(slug);

//   if (!post) {
//     notFound();
//   }

//   const relatedPosts = await getRelatedPosts(post);
//   const readingTime = calculateReadingTime(
//     post.content
//   );

//   return (
//     <main className="min-h-screen bg-white text-[#172554]">
//       {/* Article header */}
//       <header className="relative overflow-hidden bg-gradient-to-br from-white via-[#FBF9FF] to-[#F0E8FF] px-6 pb-16 pt-32 lg:px-8">
//         <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#9B6CFF]/10 blur-[100px]" />

//         <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#FF3F7F]/10 blur-[110px]" />

//         <div className="relative mx-auto max-w-4xl">
//           <Link
//             href="/blog"
//             className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#FF3F7F]"
//           >
//             <ArrowLeft size={17} />
//             Back to all stories
//           </Link>

//           <span className="block w-fit rounded-full bg-pink-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
//             {post.category || "Tech Talk Hub"}
//           </span>

//           <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#2947C7] sm:text-6xl">
//             {post.title}
//           </h1>

//           {post.excerpt && (
//             <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
//               {post.excerpt}
//             </p>
//           )}

//           <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
//             <span className="flex items-center gap-2">
//               <UserRound size={16} />
//               Tech Talk Hub Team
//             </span>

//             <span className="flex items-center gap-2">
//               <Calendar size={16} />

//               {formatDate(
//                 post.published_at || post.created_at
//               )}
//             </span>

//             <span className="flex items-center gap-2">
//               <Clock3 size={16} />
//               {readingTime} min read
//             </span>
//           </div>
//         </div>
//       </header>

//       {/* Cover image */}
//       {post.cover_image_url && (
//         <section className="relative z-10 mx-auto -mt-4 max-w-6xl px-6 lg:px-8">
//           <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-purple-900/10">
//             <Image
//               src={post.cover_image_url}
//               alt={post.title}
//               fill
//               priority
//               sizes="(max-width: 1152px) 100vw, 1152px"
//               className="object-cover"
//             />
//           </div>
//         </section>
//       )}

//       {/* Content */}
//       <article className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
//         <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-[#2947C7] prose-a:font-bold prose-a:text-[#FF3F7F] prose-strong:text-[#172554]">
//           {post.content
//             .split(/\n{2,}/)
//             .filter(Boolean)
//             .map((paragraph, index) => (
//               <p
//                 key={index}
//                 className="whitespace-pre-line text-base leading-8 text-slate-700 sm:text-lg"
//               >
//                 {paragraph}
//               </p>
//             ))}
//         </div>

//         <div className="mt-14 rounded-3xl border border-purple-100 bg-[#F8F4FF] p-7">
//           <div className="flex items-start gap-4">
//             <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[#FF3F7F]">
//               <Heart
//                 size={20}
//                 fill="currentColor"
//               />
//             </span>

//             <div>
//               <h2 className="font-black text-[#2947C7]">
//                 Help your child continue learning
//               </h2>

//               <p className="mt-2 text-sm leading-6 text-slate-600">
//                 Explore a personalized Tech Talk Hub coding
//                 program designed for their age and interests.
//               </p>

//               <Link
//                 href="/book-class"
//                 className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#FF3F7F]"
//               >
//                 Book a free trial
//                 <ArrowRight size={16} />
//               </Link>
//             </div>
//           </div>
//         </div>
//       </article>

//       {/* Related stories */}
//       {relatedPosts.length > 0 && (
//         <section className="bg-[#FBFAFF] py-20">
//           <div className="mx-auto max-w-7xl px-6 lg:px-8">
//             <h2 className="text-3xl font-black text-[#2947C7]">
//               Continue reading
//             </h2>

//             <div className="mt-9 grid gap-7 md:grid-cols-3">
//               {relatedPosts.map((relatedPost) => (
//                 <article
//                   key={relatedPost.id}
//                   className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
//                 >
//                   {relatedPost.cover_image_url && (
//                     <Link
//                       href={`/blog/${relatedPost.slug}`}
//                       className="relative block aspect-[16/10] overflow-hidden"
//                     >
//                       <Image
//                         src={relatedPost.cover_image_url}
//                         alt={relatedPost.title}
//                         fill
//                         sizes="(max-width: 768px) 100vw, 33vw"
//                         className="object-cover transition duration-500 group-hover:scale-105"
//                       />
//                     </Link>
//                   )}

//                   <div className="p-6">
//                     <p className="text-xs font-black uppercase tracking-wider text-[#FF3F7F]">
//                       {relatedPost.category ||
//                         "Tech Talk Hub"}
//                     </p>

//                     <h3 className="mt-3 text-xl font-black text-[#2947C7]">
//                       <Link
//                         href={`/blog/${relatedPost.slug}`}
//                       >
//                         {relatedPost.title}
//                       </Link>
//                     </h3>

//                     <Link
//                       href={`/blog/${relatedPost.slug}`}
//                       className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#FF3F7F]"
//                     >
//                       Read Story
//                       <ArrowRight size={15} />
//                     </Link>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}
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

// // import { supabase } from "../../../lib/supabase";

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
// // // import Image from "next/image";
// // // import Link from "next/link";
// // // import { notFound } from "next/navigation";
// // // import {
// // //   ArrowLeft,
// // //   Calendar,
// // //   UserRound,
// // // } from "lucide-react";

// // // import { createClient } from "../../../lib/supabase/server";

// // // export const revalidate = 60;

// // // function formatDate(date) {
// // //   if (!date) return "Recently published";

// // //   return new Intl.DateTimeFormat("en-KE", {
// // //     day: "numeric",
// // //     month: "long",
// // //     year: "numeric",
// // //   }).format(new Date(date));
// // // }

// // // async function getPost(slug) {
// // //   const supabase = await createClient();

// // //   const { data: post, error } = await supabase
// // //     .from("blog_posts")
// // //     .select(
// // //       `
// // //         id,
// // //         slug,
// // //         title,
// // //         excerpt,
// // //         content,
// // //         category,
// // //         cover_image_url,
// // //         published_at,
// // //         created_at
// // //       `
// // //     )
// // //     .eq("slug", slug)
// // //     .eq("status", "published")
// // //     .maybeSingle();

// // //   if (error) {
// // //     console.error("Failed to fetch blog post:", error);
// // //     return null;
// // //   }

// // //   return post;
// // // }

// // // export async function generateMetadata({ params }) {
// // //   const { slug } = await params;
// // //   const post = await getPost(slug);

// // //   if (!post) {
// // //     return {
// // //       title: "Article Not Found | Tech Talk Hub",
// // //     };
// // //   }

// // //   return {
// // //     title: `${post.title} | Tech Talk Hub`,
// // //     description:
// // //       post.excerpt ||
// // //       "Read the latest insights from Tech Talk Hub.",

// // //     openGraph: {
// // //       title: post.title,
// // //       description: post.excerpt || "",
// // //       type: "article",
// // //       publishedTime: post.published_at,
// // //       images: post.cover_image_url
// // //         ? [{ url: post.cover_image_url }]
// // //         : [],
// // //     },
// // //   };
// // // }

// // // export default async function BlogPostPage({ params }) {
// // //   const { slug } = await params;
// // //   const post = await getPost(slug);

// // //   if (!post) {
// // //     notFound();
// // //   }

// // //   return (
// // //     <main className="min-h-screen bg-background pb-24 pt-28 text-text selection:bg-secondary/20">
// // //       <article className="mx-auto max-w-4xl px-6">
// // //         {/* Back link */}
// // //         <Link
// // //           href="/blog"
// // //           className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-text/60 transition-colors hover:text-secondary"
// // //         >
// // //           <ArrowLeft size={16} />
// // //           Back to all articles
// // //         </Link>

// // //         {/* Article header */}
// // //         <header className="mb-10">
// // //           <span className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
// // //             {post.category || "Tech Talk Hub"}
// // //           </span>

// // //           <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-text sm:text-5xl">
// // //             {post.title}
// // //           </h1>

// // //           {post.excerpt && (
// // //             <p className="mt-5 max-w-3xl text-lg leading-8 text-text/70 sm:text-xl">
// // //               {post.excerpt}
// // //             </p>
// // //           )}

// // //           <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-text/60">
// // //             <span className="flex items-center gap-2">
// // //               <Calendar size={15} />

// // //               {formatDate(
// // //                 post.published_at || post.created_at
// // //               )}
// // //             </span>

// // //             <span className="flex items-center gap-2">
// // //               <UserRound size={15} />
// // //               Tech Talk Hub Team
// // //             </span>
// // //           </div>
// // //         </header>

// // //         {/* Cover image */}
// // //         {post.cover_image_url && (
// // //           <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100 shadow-lg">
// // //             <Image
// // //               src={post.cover_image_url}
// // //               alt={post.title}
// // //               fill
// // //               priority
// // //               sizes="(max-width: 896px) 100vw, 896px"
// // //               className="object-cover"
// // //             />
// // //           </div>
// // //         )}

// // //         {/* Article body */}
// // //         <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-text prose-a:text-secondary prose-strong:text-text">
// // //           {post.content
// // //             .split(/\n{2,}/)
// // //             .filter(Boolean)
// // //             .map((paragraph, index) => (
// // //               <p
// // //                 key={index}
// // //                 className="whitespace-pre-line leading-8 text-text/80"
// // //               >
// // //                 {paragraph}
// // //               </p>
// // //             ))}
// // //         </div>

// // //         {/* Bottom navigation */}
// // //         <div className="mt-16 border-t border-gray-200 pt-8 dark:border-gray-800">
// // //           <Link
// // //             href="/blog"
// // //             className="inline-flex items-center gap-2 font-bold text-secondary"
// // //           >
// // //             <ArrowLeft size={17} />
// // //             View all articles
// // //           </Link>
// // //         </div>
// // //       </article>
// // //     </main>
// // //   );
// // // }
// // // // import { ArrowLeft, Calendar } from "lucide-react";
// // // // import Link from "next/link";

// // // // export default async function BlogPostPage({ params }) {
// // // //   const { slug } = await params;

// // // //   // In a real application, fetch post data using the `slug` from your DB/CMS/Supabase
// // // //   return (
// // // //     <main className="min-h-screen bg-background text-text selection:bg-secondary/20 pt-28 pb-24">
// // // //       <article className="max-w-3xl mx-auto px-6">
// // // //         <Link 
// // // //           href="/blog" 
// // // //           className="inline-flex items-center gap-2 text-sm font-medium text-text/60 hover:text-secondary mb-8 transition-colors"
// // // //         >
// // // //           <ArrowLeft size={16} /> Back to all articles
// // // //         </Link>

// // // //         <div className="space-y-4 mb-8">
// // // //           <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
// // // //             Engineering
// // // //           </span>
// // // //           <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-text">
// // // //             Building Scalable Backend Systems with Python & FastAPI
// // // //           </h1>
// // // //           <div className="flex items-center gap-2 text-sm text-text/60">
// // // //             <Calendar size={14} /> August 10, 2026 • Published by Tech Talk Hub Team
// // // //           </div>
// // // //         </div>

// // // //         {/* Blog Body Content */}
// // // //         <div className="prose dark:prose-invert max-w-none text-text/80 space-y-6 text-base sm:text-lg leading-relaxed">
// // // //           <p>
// // // //             Welcome to our technical breakdown. When scaling backend infrastructure, performance and data cleanliness are paramount...
// // // //           </p>
// // // //           <h2 className="text-2xl font-bold text-text pt-4">1. Architecture Overview</h2>
// // // //           <p>
// // // //             By leveraging asynchronous routing and clean repository patterns, our systems maintain swift response times even under heavy traffic...
// // // //           </p>
// // // //         </div>
// // // //       </article>
// // // //     </main>
// // // //   );
// // // // }