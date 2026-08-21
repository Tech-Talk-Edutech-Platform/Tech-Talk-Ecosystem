import Image from "next/image";
import Link from "next/link";

import NavBar from "../../components/NavBar";

import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Heart,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import { client } from "../../lib/sanity";

export const metadata = {
  title:
    "About Tech Talk Hub | Coding Education for Kids in Africa",

  description:
    "Discover how Tech Talk Hub helps African children develop coding, creativity, and problem-solving skills through engaging online classes.",
};

const cardIcons = [Lightbulb, Heart, CheckCircle2];

function InfoCard({ item, index }) {
  const Icon = cardIcons[index % cardIcons.length];

  const showButton =
    item.title?.trim().toLowerCase() === "what we offer";

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-purple-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#9B6CFF]/40 hover:shadow-xl sm:p-9">
      {/* Decorative glow */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#9B6CFF]/10 blur-2xl transition-colors group-hover:bg-[#FF3F7F]/10" />

      <div className="relative">
        {/* Icon */}
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2947C7] to-[#9B6CFF] text-white shadow-lg shadow-[#2947C7]/20">
          <Icon size={23} />
        </div>

        {item.title && (
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF3F7F]">
            {item.title}
          </p>
        )}

        {item.headline && (
          <h2 className="mb-4 text-2xl font-black leading-tight text-[#172554] sm:text-3xl">
            {item.headline}
          </h2>
        )}

        {item.text && (
          <p className="whitespace-pre-line text-base leading-8 text-slate-600">
            {item.text}
          </p>
        )}

        {showButton && (
          <Link
            href="/curriculum"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2947C7] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#FF3F7F]"
          >
            View Our Curriculum

            <ArrowRight size={17} />
          </Link>
        )}
      </div>
    </article>
  );
}

export default async function AboutPage() {
  const content =
    (await client.fetch(
      `*[_type == "about"] | order(orderRank asc) {
        _id,
        title,
        headline,
        text,
        orderRank
      }`
    )) || [];

  const countries = [
    { flag: "🇰🇪", name: "Kenya" },
    { flag: "🇺🇬", name: "Uganda" },
    { flag: "🇹🇿", name: "Tanzania" },
    { flag: "🇿🇦", name: "South Africa" },
    { flag: "🇳🇬", name: "Nigeria" },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FBFAFF] text-[#172554]">
      <NavBar />

      {/* Hero */}
      <section className="relative min-h-[650px] overflow-hidden sm:min-h-[720px]">
        <Image
          src="/classroom.png"
          alt="African children learning coding and robotics at Tech Talk Hub"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Lighter overlays */}
        <div className="absolute inset-0 bg-[#172554]/15" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#172554]/80 via-[#172554]/45 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#172554]/45 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-6 pb-20 pt-32 sm:min-h-[720px] lg:px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur-md">
              <Sparkles
                size={15}
                className="text-[#FF3F7F]"
              />

              <span>Building Africa’s future creators</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Young minds can build{" "}
              <span className="text-[#FF8BB2]">
                extraordinary things.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 sm:text-xl">
              Tech Talk Hub gives children practical coding
              skills, confidence, and creativity through
              engaging, personalized online learning.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/book-class"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF3F7F] px-7 py-4 font-bold text-white shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#E93470]"
              >
                Book a Class

                <ArrowRight size={18} />
              </Link>

              <Link
                href="/curriculum"
                className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#2947C7]"
              >
                Explore Our Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-6 lg:px-8">
        <div className="grid gap-7 rounded-3xl border border-purple-100 bg-white p-7 shadow-xl shadow-purple-900/5 sm:p-10 md:grid-cols-[0.8fr_2fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF3F7F]">
              Who we are
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight text-[#2947C7]">
              More than coding classes
            </h2>
          </div>

          <p className="text-base leading-8 text-slate-600 sm:text-lg">
            We are an African edtech organization helping
            children move from simply using technology to
            understanding, creating, and building with it.
            Our programs make digital skills practical,
            exciting, and suitable for every learner’s age.
          </p>
        </div>
      </section>

      {/* Dynamic Sanity content */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF3F7F]">
            The Tech Talk Hub difference
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#2947C7] sm:text-5xl">
            Learning designed to inspire
          </h2>

          <p className="mt-5 leading-7 text-slate-600">
            We combine personalized teaching, practical
            projects, and age-appropriate technology
            education.
          </p>
        </div>

        {content.length > 0 ? (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {content.map((item, index) => (
              <InfoCard
                key={item._id}
                item={item}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-purple-200 bg-white p-12 text-center text-slate-500">
            About-page content is being updated.
          </div>
        )}
      </section>

      {/* Countries */}
      <section className="border-y border-purple-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 text-center lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9B6CFF]/10 text-[#2947C7]">
            <Globe2 size={27} />
          </div>

          <h2 className="mt-6 text-3xl font-black text-[#2947C7] sm:text-4xl">
            Serving students across Africa
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Our online classes connect young learners with
            practical technology education wherever they
            are.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {countries.map((country) => (
              <div
                key={country.name}
                className="rounded-full border border-purple-100 bg-[#FBFAFF] px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#9B6CFF]/50 hover:bg-[#9B6CFF]/5"
              >
                <span
                  className="mr-2"
                  aria-hidden="true"
                >
                  {country.flag}
                </span>

                {country.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#2947C7] px-7 py-16 text-center text-white shadow-2xl shadow-blue-950/15 sm:px-12 sm:py-20">
          {/* Decorative glows */}
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#9B6CFF]/30 blur-3xl" />

          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#FF3F7F]/25 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-pink-200">
              Start their technology journey
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              Give your child the skills to create the future.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-blue-100">
              Choose an age-appropriate program and let your
              child learn coding through guided, hands-on
              projects.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/book-class"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF3F7F] px-8 py-4 font-bold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#E93470]"
              >
                Join Our Next Class

                <ArrowRight size={18} />
              </Link>

              <Link
                href="/curriculum"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white hover:text-[#2947C7]"
              >
                View Curriculum
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
// import Image from "next/image";
// import Link from "next/link";
// import NavBar from "../../components/NavBar";

// import {
//   ArrowRight,
//   CheckCircle2,
//   Globe2,
//   Heart,
//   Lightbulb,
//   Sparkles,
// } from "lucide-react";

// import { client } from "../../lib/sanity";

// export const metadata = {
//   title:
//     "About Tech Talk Hub | Coding Education for Kids in Africa",

//   description:
//     "Discover how Tech Talk Hub helps African children develop coding, creativity, and problem-solving skills through engaging online classes.",
// };

// const cardIcons = [Lightbulb, Heart, CheckCircle2];

// function InfoCard({ item, index }) {
//   const Icon = cardIcons[index % cardIcons.length];

//   const showButton =
//     item.title?.trim().toLowerCase() === "what we offer";

//   return (
//     <article className="group relative overflow-hidden rounded-3xl border border-purple-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#9B6CFF]/40 hover:shadow-xl sm:p-9">
//       {/* Decorative glow */}
//      <NavBar />
//       <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#9B6CFF]/10 blur-2xl transition-colors group-hover:bg-[#FF3F7F]/10" />

//       <div className="relative">
//         {/* Icon */}
//         <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2947C7] to-[#9B6CFF] text-white shadow-lg shadow-[#2947C7]/20">
//           <Icon size={23} />
//         </div>

//         {item.title && (
//           <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF3F7F]">
//             {item.title}
//           </p>
//         )}

//         {item.headline && (
//           <h2 className="mb-4 text-2xl font-black leading-tight text-[#172554] sm:text-3xl">
//             {item.headline}
//           </h2>
//         )}

//         {item.text && (
//           <p className="whitespace-pre-line text-base leading-8 text-slate-600">
//             {item.text}
//           </p>
//         )}

//         {showButton && (
//           <Link
//             href="/curriculum"
//             className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2947C7] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#FF3F7F]"
//           >
//             View Our Curriculum

//             <ArrowRight size={17} />
//           </Link>
//         )}
//       </div>
//     </article>
//   );
// }

// export default async function AboutPage() {
//   const content =
//     (await client.fetch(
//       `*[_type == "about"] | order(orderRank asc) {
//         _id,
//         title,
//         headline,
//         text,
//         orderRank
//       }`
//     )) || [];

//   const countries = [
//     { flag: "🇰🇪", name: "Kenya" },
//     { flag: "🇺🇬", name: "Uganda" },
//     { flag: "🇹🇿", name: "Tanzania" },
//     { flag: "🇿🇦", name: "South Africa" },
//     { flag: "🇳🇬", name: "Nigeria" },
//   ];

//   return (
//     <main className="min-h-screen overflow-hidden bg-[#FBFAFF] text-[#172554]">
//       {/* Hero */}
//       <section className="relative min-h-[650px] overflow-hidden sm:min-h-[720px]">
//         <Image
//           src="/classroom.png"
//           alt="African children learning coding and robotics at Tech Talk Hub"
//           fill
//           priority
//           sizes="100vw"
//           className="object-cover object-center"
//         />

//         {/* Hero overlays */}
//         <div className="absolute inset-0 bg-[#172554]/40" />

//         <div className="absolute inset-0 bg-gradient-to-r from-[#172554]/95 via-[#2947C7]/60 to-[#172554]/10" />

//         <div className="absolute inset-0 bg-gradient-to-t from-[#172554]/80 via-transparent to-[#172554]/20" />

//         <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-6 pb-20 pt-32 sm:min-h-[720px] lg:px-8">
//           <div className="max-w-3xl">
//             {/* Badge */}
//             <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur-md">
//               <Sparkles
//                 size={15}
//                 className="text-[#FF3F7F]"
//               />

//               <span>Building Africa’s future creators</span>
//             </div>

//             <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
//               Young minds can build{" "}
//               <span className="text-[#FF8BB2]">
//                 extraordinary things.
//               </span>
//             </h1>

//             <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 sm:text-xl">
//               Tech Talk Hub gives children practical coding
//               skills, confidence, and creativity through
//               engaging, personalized online learning.
//             </p>

//             <div className="mt-9 flex flex-col gap-4 sm:flex-row">
//               <Link
//                 href="/book-class"
//                 className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF3F7F] px-7 py-4 font-bold text-white shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#E93470]"
//               >
//                 Book a Class

//                 <ArrowRight size={18} />
//               </Link>

//               <Link
//                 href="/curriculum"
//                 className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#2947C7]"
//               >
//                 Explore Our Programs
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Introduction */}
//       <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-6 lg:px-8">
//         <div className="grid gap-7 rounded-3xl border border-purple-100 bg-white p-7 shadow-xl shadow-purple-900/5 sm:p-10 md:grid-cols-[0.8fr_2fr]">
//           <div>
//             <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF3F7F]">
//               Who we are
//             </p>

//             <h2 className="mt-3 text-3xl font-black leading-tight text-[#2947C7]">
//               More than coding classes
//             </h2>
//           </div>

//           <p className="text-base leading-8 text-slate-600 sm:text-lg">
//             We are an African edtech organization helping
//             children move from simply using technology to
//             understanding, creating, and building with it.
//             Our programs make digital skills practical,
//             exciting, and suitable for every learner’s age.
//           </p>
//         </div>
//       </section>

//       {/* Dynamic Sanity content */}
//       <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
//         <div className="mx-auto mb-12 max-w-2xl text-center">
//           <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF3F7F]">
//             The Tech Talk Hub difference
//           </p>

//           <h2 className="mt-3 text-3xl font-black tracking-tight text-[#2947C7] sm:text-5xl">
//             Learning designed to inspire
//           </h2>

//           <p className="mt-5 leading-7 text-slate-600">
//             We combine personalized teaching, practical
//             projects, and age-appropriate technology
//             education.
//           </p>
//         </div>

//         {content.length > 0 ? (
//           <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
//             {content.map((item, index) => (
//               <InfoCard
//                 key={item._id}
//                 item={item}
//                 index={index}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="rounded-3xl border border-dashed border-purple-200 bg-white p-12 text-center text-slate-500">
//             About-page content is being updated.
//           </div>
//         )}
//       </section>

//       {/* Countries */}
//       <section className="border-y border-purple-100 bg-white py-20">
//         <div className="mx-auto max-w-6xl px-6 text-center lg:px-8">
//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9B6CFF]/10 text-[#2947C7]">
//             <Globe2 size={27} />
//           </div>

//           <h2 className="mt-6 text-3xl font-black text-[#2947C7] sm:text-4xl">
//             Serving students across Africa
//           </h2>

//           <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
//             Our online classes connect young learners with
//             practical technology education wherever they
//             are.
//           </p>

//           <div className="mt-9 flex flex-wrap justify-center gap-3">
//             {countries.map((country) => (
//               <div
//                 key={country.name}
//                 className="rounded-full border border-purple-100 bg-[#FBFAFF] px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#9B6CFF]/50 hover:bg-[#9B6CFF]/5"
//               >
//                 <span
//                   className="mr-2"
//                   aria-hidden="true"
//                 >
//                   {country.flag}
//                 </span>

//                 {country.name}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Final CTA */}
//       <section className="px-6 py-24 lg:px-8">
//         <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#2947C7] px-7 py-16 text-center text-white shadow-2xl shadow-blue-950/15 sm:px-12 sm:py-20">
//           {/* Decorative glows */}
//           <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#9B6CFF]/30 blur-3xl" />

//           <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#FF3F7F]/25 blur-3xl" />

//           <div className="relative">
//             <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-pink-200">
//               Start their technology journey
//             </p>

//             <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
//               Give your child the skills to create the future.
//             </h2>

//             <p className="mx-auto mt-5 max-w-2xl leading-7 text-blue-100">
//               Choose an age-appropriate program and let your
//               child learn coding through guided, hands-on
//               projects.
//             </p>

//             <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
//               <Link
//                 href="/book-class"
//                 className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF3F7F] px-8 py-4 font-bold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#E93470]"
//               >
//                 Join Our Next Class

//                 <ArrowRight size={18} />
//               </Link>

//               <Link
//                 href="/curriculum"
//                 className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white hover:text-[#2947C7]"
//               >
//                 View Curriculum
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
// // import Image from "next/image";
// // import Link from "next/link";
// // import {
// //   ArrowRight,
// //   CheckCircle2,
// //   Globe2,
// //   Heart,
// //   Lightbulb,
// //   Sparkles,
// // } from "lucide-react";

// // import { client } from "../../lib/sanity";

// // export const metadata = {
// //   title:
// //     "About Tech Talk Hub | Coding Education for Kids in Africa",
// //   description:
// //     "Discover how Tech Talk Hub helps African children develop coding, creativity, and problem-solving skills through engaging online classes.",
// // };

// // const cardIcons = [Lightbulb, Heart, CheckCircle2];

// // function InfoCard({ item, index }) {
// //   const Icon = cardIcons[index % cardIcons.length];

// //   const showButton =
// //     item.title?.trim().toLowerCase() === "what we offer";

// //   return (
// //     <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#20BFE3]/40 hover:shadow-xl sm:p-9">
// //       {/* Decorative glow */}
// //       <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#20BFE3]/10 blur-2xl transition-colors group-hover:bg-[#FF6B00]/10" />

// //       <div className="relative">
// //         {/* Icon */}
// //         <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#20BFE3] to-[#168DB8] text-white shadow-lg shadow-[#20BFE3]/20">
// //           <Icon size={23} />
// //         </div>

// //         {item.title && (
// //           <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF6B00]">
// //             {item.title}
// //           </p>
// //         )}

// //         {item.headline && (
// //           <h2 className="mb-4 text-2xl font-black leading-tight text-[#0F172A] sm:text-3xl">
// //             {item.headline}
// //           </h2>
// //         )}

// //         {item.text && (
// //           <p className="whitespace-pre-line text-base leading-8 text-slate-600">
// //             {item.text}
// //           </p>
// //         )}

// //         {showButton && (
// //           <Link
// //             href="/curriculum"
// //             className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#20BFE3]"
// //           >
// //             View Our Curriculum
// //             <ArrowRight size={17} />
// //           </Link>
// //         )}
// //       </div>
// //     </article>
// //   );
// // }

// // export default async function AboutPage() {
// //   const content =
// //     (await client.fetch(
// //       `*[_type == "about"] | order(orderRank asc) {
// //         _id,
// //         title,
// //         headline,
// //         text,
// //         orderRank
// //       }`
// //     )) || [];

// //   const countries = [
// //     { flag: "🇰🇪", name: "Kenya" },
// //     { flag: "🇺🇬", name: "Uganda" },
// //     { flag: "🇹🇿", name: "Tanzania" },
// //     { flag: "🇿🇦", name: "South Africa" },
// //     { flag: "🇳🇬", name: "Nigeria" },
// //   ];

// //   return (
// //     <main className="min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
// //       {/* Hero */}
// //       <section className="relative min-h-[650px] overflow-hidden sm:min-h-[720px]">
// //         <Image
// //           src="/classroom.png"
// //           alt="African children learning coding and robotics at Tech Talk Hub"
// //           fill
// //           priority
// //           sizes="100vw"
// //           className="object-cover object-center"
// //         />

// //         {/* Hero overlays */}
// //         <div className="absolute inset-0 bg-[#0F172A]/40" />

// //         <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/95 via-[#0F172A]/60 to-[#0F172A]/10" />

// //         <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-[#0F172A]/20" />

// //         <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-6 pb-20 pt-32 sm:min-h-[720px] lg:px-8">
// //           <div className="max-w-3xl">
// //             {/* Badge */}
// //             <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur-md">
// //               <Sparkles
// //                 size={15}
// //                 className="text-[#FF6B00]"
// //               />

// //               <span>Building Africa’s future creators</span>
// //             </div>

// //             <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
// //               Young minds can build{" "}
// //               <span className="text-[#52D5F0]">
// //                 extraordinary things.
// //               </span>
// //             </h1>

// //             <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 sm:text-xl">
// //               Tech Talk Hub gives children practical coding skills,
// //               confidence, and creativity through engaging,
// //               personalized online learning.
// //             </p>

// //             <div className="mt-9 flex flex-col gap-4 sm:flex-row">
// //               <Link
// //                 href="/book-class"
// //                 className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6B00] px-7 py-4 font-bold text-white shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#E85F00]"
// //               >
// //                 Book a Class
// //                 <ArrowRight size={18} />
// //               </Link>

// //               <Link
// //                 href="/curriculum"
// //                 className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#0F172A]"
// //               >
// //                 Explore Our Programs
// //               </Link>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Introduction */}
// //       <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-6 lg:px-8">
// //         <div className="grid gap-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10 md:grid-cols-[0.8fr_2fr]">
// //           <div>
// //             <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF6B00]">
// //               Who we are
// //             </p>

// //             <h2 className="mt-3 text-3xl font-black leading-tight text-[#0F172A]">
// //               More than coding classes
// //             </h2>
// //           </div>

// //           <p className="text-base leading-8 text-slate-600 sm:text-lg">
// //             We are an African edtech organization helping children
// //             move from simply using technology to understanding,
// //             creating, and building with it. Our programs make digital
// //             skills practical, exciting, and suitable for every
// //             learner’s age.
// //           </p>
// //         </div>
// //       </section>

// //       {/* Dynamic Sanity content */}
// //       <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
// //         <div className="mx-auto mb-12 max-w-2xl text-center">
// //           <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#20BFE3]">
// //             The Tech Talk Hub difference
// //           </p>

// //           <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-5xl">
// //             Learning designed to inspire
// //           </h2>

// //           <p className="mt-5 leading-7 text-slate-600">
// //             We combine personalized teaching, practical projects,
// //             and age-appropriate technology education.
// //           </p>
// //         </div>

// //         {content.length > 0 ? (
// //           <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
// //             {content.map((item, index) => (
// //               <InfoCard
// //                 key={item._id}
// //                 item={item}
// //                 index={index}
// //               />
// //             ))}
// //           </div>
// //         ) : (
// //           <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
// //             About-page content is being updated.
// //           </div>
// //         )}
// //       </section>

// //       {/* Countries */}
// //       <section className="border-y border-slate-200 bg-white py-20">
// //         <div className="mx-auto max-w-6xl px-6 text-center lg:px-8">
// //           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#20BFE3]/10 text-[#168DB8]">
// //             <Globe2 size={27} />
// //           </div>

// //           <h2 className="mt-6 text-3xl font-black text-[#0F172A] sm:text-4xl">
// //             Serving students across Africa
// //           </h2>

// //           <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
// //             Our online classes connect young learners with practical
// //             technology education wherever they are.
// //           </p>

// //           <div className="mt-9 flex flex-wrap justify-center gap-3">
// //             {countries.map((country) => (
// //               <div
// //                 key={country.name}
// //                 className="rounded-full border border-slate-200 bg-[#F8FAFC] px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#20BFE3]/50 hover:bg-[#20BFE3]/5"
// //               >
// //                 <span
// //                   className="mr-2"
// //                   aria-hidden="true"
// //                 >
// //                   {country.flag}
// //                 </span>

// //                 {country.name}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* Final CTA */}
// //       <section className="px-6 py-24 lg:px-8">
// //         <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#0F172A] px-7 py-16 text-center text-white shadow-2xl sm:px-12 sm:py-20">
// //           {/* Decorative glows */}
// //           <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#20BFE3]/20 blur-3xl" />

// //           <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#FF6B00]/20 blur-3xl" />

// //           <div className="relative">
// //             <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#52D5F0]">
// //               Start their technology journey
// //             </p>

// //             <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
// //               Give your child the skills to create the future.
// //             </h2>

// //             <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
// //               Choose an age-appropriate program and let your child
// //               learn coding through guided, hands-on projects.
// //             </p>

// //             <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
// //               <Link
// //                 href="/book-class"
// //                 className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6B00] px-8 py-4 font-bold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#E85F00]"
// //               >
// //                 Join Our Next Class
// //                 <ArrowRight size={18} />
// //               </Link>

// //               <Link
// //                 href="/curriculum"
// //                 className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white hover:text-[#0F172A]"
// //               >
// //                 View Curriculum
// //               </Link>
// //             </div>
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
// // //   CheckCircle2,
// // //   Globe2,
// // //   Heart,
// // //   Lightbulb,
// // //   Sparkles,
// // // } from "lucide-react";

// // // import { client } from "../../lib/sanity";

// // // export const metadata = {
// // //   title: "About Tech Talk Hub | Coding Education for Kids in Africa",
// // //   description:
// // //     "Discover how Tech Talk Hub helps African children build coding, creativity, and problem-solving skills through engaging online classes.",
// // // };

// // // const icons = [Lightbulb, Heart, CheckCircle2];

// // // function InfoCard({ item, index }) {
// // //   const Icon = icons[index % icons.length];
// // //   const showButton =
// // //     item.title?.trim().toLowerCase() === "what we offer";

// // //   return (
// // //     <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl sm:p-9">
// // //       <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-100/60 blur-2xl transition group-hover:bg-orange-100/70" />

// // //       <div className="relative">
// // //         <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
// // //           <Icon size={23} />
// // //         </div>

// // //         {item.title && (
// // //           <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">
// // //             {item.title}
// // //           </p>
// // //         )}

// // //         {item.headline && (
// // //           <h2 className="mb-4 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
// // //             {item.headline}
// // //           </h2>
// // //         )}

// // //         {item.text && (
// // //           <p className="whitespace-pre-line text-base leading-8 text-slate-600">
// // //             {item.text}
// // //           </p>
// // //         )}

// // //         {showButton && (
// // //           <Link
// // //             href="/curriculum"
// // //             className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-600"
// // //           >
// // //             View Our Curriculum
// // //             <ArrowRight size={17} />
// // //           </Link>
// // //         )}
// // //       </div>
// // //     </article>
// // //   );
// // // }

// // // export default async function AboutPage() {
// // //   const content =
// // //     (await client.fetch(
// // //       `*[_type == "about"] | order(orderRank asc) {
// // //         _id,
// // //         title,
// // //         headline,
// // //         text,
// // //         orderRank
// // //       }`
// // //     )) || [];

// // //   return (
// // //     <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
// // //       {/* Hero */}
// // //       <section className="relative min-h-[650px] overflow-hidden sm:min-h-[720px]">
// // //         <Image
// // //           src="/classroom.png"
// // //           alt="African children learning coding and robotics at Tech Talk Hub"
// // //           fill
// // //           priority
// // //           sizes="100vw"
// // //           className="object-cover object-center"
// // //         />

// // //         {/* Image overlays */}
// // //         <div className="absolute inset-0 bg-slate-950/45" />
// // //         <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-transparent" />
// // //         <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

// // //         <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-6 pb-20 pt-32 sm:min-h-[720px] lg:px-8">
// // //           <div className="max-w-3xl">
// // //             <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
// // //               <Sparkles size={15} className="text-orange-400" />
// // //               Building Africa’s future creators
// // //             </div>

// // //             <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
// // //               Young minds can build{" "}
// // //               <span className="text-cyan-300">
// // //                 extraordinary things.
// // //               </span>
// // //             </h1>

// // //             <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 sm:text-xl">
// // //               Tech Talk Hub gives children practical coding skills,
// // //               confidence, and creativity through engaging, personalized
// // //               online learning.
// // //             </p>

// // //             <div className="mt-9 flex flex-col gap-4 sm:flex-row">
// // //               <Link
// // //                 href="/book-class"
// // //                 className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-7 py-4 font-bold text-white shadow-xl shadow-orange-950/20 transition hover:-translate-y-0.5 hover:bg-orange-600"
// // //               >
// // //                 Book a Class
// // //                 <ArrowRight size={18} />
// // //               </Link>

// // //               <Link
// // //                 href="/curriculum"
// // //                 className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-slate-900"
// // //               >
// // //                 Explore Our Programs
// // //               </Link>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Introduction */}
// // //       <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-6 lg:px-8">
// // //         <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10 md:grid-cols-[0.8fr_2fr]">
// // //           <div>
// // //             <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">
// // //               Who we are
// // //             </p>

// // //             <h2 className="mt-3 text-3xl font-black text-slate-900">
// // //               More than coding classes
// // //             </h2>
// // //           </div>

// // //           <p className="text-base leading-8 text-slate-600 sm:text-lg">
// // //             We are an African edtech organization helping children move
// // //             from simply using technology to understanding, creating,
// // //             and building with it. Our programs make digital skills
// // //             practical, exciting, and suitable for every learner’s age.
// // //           </p>
// // //         </div>
// // //       </section>

// // //       {/* Dynamic Sanity content */}
// // //       <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
// // //         <div className="mx-auto mb-12 max-w-2xl text-center">
// // //           <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-600">
// // //             The Tech Talk Hub difference
// // //           </p>

// // //           <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
// // //             Learning designed to inspire
// // //           </h2>
// // //         </div>

// // //         {content.length > 0 ? (
// // //           <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
// // //             {content.map((item, index) => (
// // //               <InfoCard
// // //                 key={item._id}
// // //                 item={item}
// // //                 index={index}
// // //               />
// // //             ))}
// // //           </div>
// // //         ) : (
// // //           <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
// // //             About-page content is being updated.
// // //           </div>
// // //         )}
// // //       </section>

// // //       {/* Countries */}
// // //       <section className="border-y border-slate-200 bg-white py-20">
// // //         <div className="mx-auto max-w-6xl px-6 text-center lg:px-8">
// // //           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
// // //             <Globe2 size={27} />
// // //           </div>

// // //           <h2 className="mt-6 text-3xl font-black text-slate-900">
// // //             Serving students across Africa
// // //           </h2>

// // //           <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
// // //             Our online classes connect young learners with practical
// // //             technology education wherever they are.
// // //           </p>

// // //           <div className="mt-9 flex flex-wrap justify-center gap-3">
// // //             {[
// // //               ["🇰🇪", "Kenya"],
// // //               ["🇺🇬", "Uganda"],
// // //               ["🇹🇿", "Tanzania"],
// // //               ["🇿🇦", "South Africa"],
// // //               ["🇳🇬", "Nigeria"],
// // //             ].map(([flag, country]) => (
// // //               <div
// // //                 key={country}
// // //                 className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700"
// // //               >
// // //                 <span className="mr-2">{flag}</span>
// // //                 {country}
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Final CTA */}
// // //       <section className="px-6 py-24 lg:px-8">
// // //         <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-slate-950 px-7 py-16 text-center text-white shadow-2xl sm:px-12">
// // //           <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
// // //           <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

// // //           <div className="relative">
// // //             <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">
// // //               Start their technology journey
// // //             </p>

// // //             <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black sm:text-5xl">
// // //               Give your child the skills to create the future.
// // //             </h2>

// // //             <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
// // //               Choose an age-appropriate program and let your child learn
// // //               coding through guided, hands-on projects.
// // //             </p>

// // //             <Link
// // //               href="/book-class"
// // //               className="mt-9 inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-orange-600"
// // //             >
// // //               Join Our Next Class
// // //               <ArrowRight size={18} />
// // //             </Link>
// // //           </div>
// // //         </div>
// // //       </section>
// // //     </main>
// // //   );
// // // }
// // // // import { client } from '../../lib/sanity';
// // // // import Image from 'next/image';

// // // // // SEO Metadata
// // // // export const metadata = {
// // // //   title: 'About Tech Talk Hub | Coding Education for Kids in Africa',
// // // //   description: 'Empowering Africa’s next generation with online coding classes. From Scratch to AI, we teach digital skills to K-12 students across the continent.',
// // // // };

// // // // function InfoCard({ title, headline, text, showButton }) {
// // // //   if (!title && !headline && !text) return null;

// // // //   return (
// // // //     <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 my-8 mx-4 md:mx-auto max-w-4xl transition-all hover:shadow-xl">
// // // //       <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</h2>
// // // //       <h3 className="text-2xl md:text-3xl font-bold text-pink-600 mb-4">{headline}</h3>
// // // //       <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line mb-6">{text}</p>
      
// // // //       {/* Contextual CTA only for 'What We Offer' */}
// // // //       {showButton && (
// // // //         <a href="/curriculum" className="inline-block bg-slate-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-900 transition shadow-md">
// // // //           View Our Curriculum
// // // //         </a>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }

// // // // export default async function About() {
// // // //   const content = await client.fetch(`*[_type == "about"] | order(orderRank asc)`);

// // // //   return (
// // // //     <div className="bg-slate-50 min-h-screen text-slate-800 font-poppins">
// // // //       {/* Hero Section */}
// // // //       <section className="bg-hero-gradient text-white py-20 text-center">
// // // //         <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-smoothPulse">
// // // //           About Tech Talk Hub
// // // //         </h1>
// // // //         <p className="max-w-2xl mx-auto text-xl opacity-90 px-6">
// // // //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// // // //         </p>
// // // //       </section>

// // // //       {/* Hero Image */}
// // // //       <section className="relative w-full h-72 md:h-96 overflow-hidden">
// // // //         <Image
// // // //           src="/classroom.png"
// // // //           alt="Kids coding online"
// // // //           fill
// // // //           className="object-cover"
// // // //           sizes="100vw"
// // // //           priority
// // // //         />
// // // //       </section>

// // // //       {/* Content Section */}
// // // //       <main className="py-12 px-4">
// // // //         {content.length > 0 ? (
// // // //           content.map((item) => (
// // // //             <InfoCard 
// // // //               key={item._id} 
// // // //               title={item.title} 
// // // //               headline={item.headline} 
// // // //               text={item.text}
// // // //               showButton={item.title === "What We Offer"}
// // // //             />
// // // //           ))
// // // //         ) : (
// // // //           <p className="text-center text-gray-500 py-10">No content found.</p>
// // // //         )}
// // // //       </main>

// // // //       {/* Trust & Social Proof Section */}
// // // //       <section className="py-16 bg-white text-center border-t border-slate-100">
// // // //         <h3 className="text-xl font-bold text-slate-800 mb-6">Serving Students Across Africa</h3>
       
// // // //         <p className="text-lg font-medium text-pink-600">
// // // //   🇰🇪 Kenya • 🇺🇬 Uganda • 🇹🇿 Tanzania • 🇿🇦 South Africa • 🇳🇬 Nigeria
// // // // </p>
// // // //       </section>

// // // //       {/* Final Global CTA */}
// // // //       <div className="text-center py-20 bg-slate-50">
// // // //         <h2 className="text-3xl font-bold mb-6 text-slate-800">Ready to start your journey?</h2>
        
// // // //         {/* Social Proof Counter */}
// // // //         <p className="text-slate-500 mb-8 font-medium">
// // // //           Join <span className="text-pink-600 font-bold">500+ students</span> currently building their future with us.
// // // //         </p>

// // // //         <a href="/book-class" className="bg-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-700 transition shadow-lg">
// // // //           Join Our Next Class
// // // //         </a>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // // // import { client } from '../../lib/sanity';
// // // // // import Image from 'next/image';

// // // // // // SEO Metadata
// // // // // export const metadata = {
// // // // //   title: 'About Tech Talk Hub | Coding Education for Kids in Africa',
// // // // //   description: 'Empowering Africa’s next generation with online coding classes. From Scratch to AI, we teach digital skills to K-12 students across the continent.',
// // // // // };

// // // // // function InfoCard({ title, headline, text, showButton }) {
// // // // //   if (!title && !headline && !text) return null;

// // // // //   return (
// // // // //     <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 my-8 mx-4 md:mx-auto max-w-4xl transition-all hover:shadow-xl">
// // // // //       <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</h2>
// // // // //       <h3 className="text-2xl md:text-3xl font-bold text-pink-600 mb-4">{headline}</h3>
// // // // //       <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line mb-6">{text}</p>
      
// // // // //       {/* CTA only appears on the 'What We Offer' section */}
// // // // //       {showButton && (
// // // // //         <a href="/contact" className="inline-block bg-blue-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-pink-600 transition shadow-md">
// // // // //           View Our Curriculum
// // // // //         </a>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // export default async function About() {
// // // // //   const content = await client.fetch(`*[_type == "about"]`);

// // // // //   return (
// // // // //     <div className="bg-slate-50 min-h-screen text-slate-800 font-poppins">
// // // // //       {/* Hero Section */}
// // // // //       <section className="bg-hero-gradient text-white py-20 text-center">
// // // // //         <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-smoothPulse">
// // // // //           About Tech Talk Hub
// // // // //         </h1>
// // // // //         <p className="max-w-2xl mx-auto text-xl opacity-90 px-6">
// // // // //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// // // // //         </p>
// // // // //       </section>

// // // // //       {/* Hero Image */}
// // // // //       <section className="relative w-full h-72 md:h-96 overflow-hidden">
// // // // //         <Image
// // // // //           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
// // // // //           alt="Kids coding online"
// // // // //           fill
// // // // //           className="object-cover"
// // // // //           sizes="100vw"
// // // // //           priority
// // // // //         />
// // // // //       </section>

// // // // //       {/* Content Section */}
// // // // //       <main className="py-12 px-4">
// // // // //         {content.length > 0 ? (
// // // // //           content.map((item) => (
// // // // //             <InfoCard 
// // // // //               key={item._id} 
// // // // //               title={item.title} 
// // // // //               headline={item.headline} 
// // // // //               text={item.text}
// // // // //               // Only shows the button for your services section
// // // // //               showButton={item.title === "What We Offer"}
// // // // //             />
// // // // //           ))
// // // // //         ) : (
// // // // //           <p className="text-center text-gray-500 py-10">No content found.</p>
// // // // //         )}
// // // // //       </main>

// // // // //       {/* Trust & Social Proof Section */}
// // // // //       <section className="py-16 bg-white text-center border-t border-slate-100">
// // // // //         <h3 className="text-xl font-bold text-slate-800 mb-6">Serving Students Across Africa</h3>
// // // // //         <p className="text-lg font-medium text-pink-600">
// // // // //           Kenya • Uganda • Tanzania • South Africa • Nigeria
// // // // //         </p>
// // // // //       </section>

// // // // //       {/* Final Global CTA */}
// // // // //       <div className="text-center py-20 bg-slate-50">
// // // // //         <h2 className="text-3xl font-bold mb-6 text-slate-800">Ready to start your journey?</h2>
// // // // //         <a href="/contact" className="bg-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-700 transition shadow-lg">
// // // // //           Join Our Next Class
// // // // //         </a>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // // // import { client } from '../../lib/sanity';
// // // // // import Image from 'next/image';

// // // // // // function InfoCard({ title, headline, text }) {
// // // // // //   // Only render the card if there is actual content
// // // // // //   if (!title && !headline && !text) return null;

// // // // // //   return (
// // // // // //     <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 my-8 mx-4 md:mx-auto max-w-4xl transition-all hover:shadow-xl">
// // // // // //       {/* Title with subtle uppercase styling for hierarchy */}
// // // // // //       <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
// // // // // //         {title}
// // // // // //       </h2>
      
// // // // // //       {/* Pink Headline */}
// // // // // //       <h3 className="text-2xl md:text-3xl font-bold text-pink-600 mb-4">
// // // // // //         {headline}
// // // // // //       </h3>
      
// // // // // //       {/* Readable Body Text */}
// // // // // //       <p className="text-gray-600 text-lg leading-relaxed">
// // // // // //         {text}
// // // // // //       </p>
// // // // // //     </div>
// // // // // //   );
// // // // // // }
// // // // // function InfoCard({ title, headline, text }) {
// // // // //   if (!title && !headline && !text) return null;

// // // // //   return (
// // // // //     <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 my-8 mx-4 md:mx-auto max-w-4xl transition-all hover:shadow-xl">
// // // // //       <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
// // // // //         {title}
// // // // //       </h2>
// // // // //       <h3 className="text-2xl md:text-3xl font-bold text-pink-600 mb-4">
// // // // //         {headline}
// // // // //       </h3>
// // // // //       {/* whitespace-pre-line preserves the line breaks from your text field */}
// // // // //       <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
// // // // //         {text}
// // // // //       </p>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // // export default async function About() {
// // // // //   const content = await client.fetch(`*[_type == "about"]`);

// // // // //   return (
// // // // //     <div className="bg-slate-50 min-h-screen text-slate-800 font-poppins">
// // // // //       {/* Hero Section */}
// // // // //       <section className="bg-hero-gradient text-white py-20 text-center">
// // // // //         <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-smoothPulse">
// // // // //           About Tech Talk Hub
// // // // //         </h1>
// // // // //         <p className="max-w-2xl mx-auto text-xl opacity-90 px-6">
// // // // //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// // // // //         </p>
// // // // //       </section>

// // // // //       {/* Hero Image Section */}
// // // // //       <section className="relative w-full h-72 md:h-96 overflow-hidden">
// // // // //         <Image
// // // // //           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
// // // // //           alt="Kids coding online"
// // // // //           fill
// // // // //           className="object-cover"
// // // // //           sizes="100vw"
// // // // //           priority
// // // // //         />
// // // // //       </section>

// // // // //       {/* Content Section */}
// // // // //       <main className="py-12 px-4">
// // // // //         {content.length > 0 ? (
// // // // //           content.map((item) => (
// // // // //             <InfoCard 
// // // // //               key={item._id} 
// // // // //               title={item.title} 
// // // // //               headline={item.headline} 
// // // // //               text={item.text} 
// // // // //             />
// // // // //           ))
// // // // //         ) : (
// // // // //           <p className="text-center text-gray-500 py-10">No content found.</p>
// // // // //         )}
// // // // //       </main>
// // // // //       <div className="text-center py-10">
// // // // //   <a 
// // // // //     href="/contact" 
// // // // //     className="bg-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-700 transition"
// // // // //   >
// // // // //     Start Your Coding Journey
// // // // //   </a>
// // // // // </div>
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // // // import { client } from '../../lib/sanity';
// // // // // // import Image from 'next/image';

// // // // // // function InfoCard({ title, headline, text }) {
// // // // // //   return (
// // // // // //     <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100 my-6 mx-4 md:mx-auto max-w-4xl">
// // // // // //       <h2 className="text-2xl font-semibold text-primary mb-4">{title}</h2>
// // // // // //       <h3 className="text-xl font-semibold text-pink-600 text-primary mb-2">{headline}</h3>
// // // // // //       <p className="text-gray-700 leading-relaxed">{text}</p>
// // // // // //     </div>
// // // // // //   );
// // // // // // }

// // // // // // export default async function About() {
// // // // // //   const content = await client.fetch(`*[_type == "about"]`);

// // // // // //   return (
// // // // // //     <div className="bg-background min-h-screen text-text font-poppins">
// // // // // //       {/* Hero Section */}
// // // // // //       <section className="bg-hero-gradient text-white py-16 text-center">
// // // // // //         <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-smoothPulse">
// // // // // //           About Tech Talk Hub
// // // // // //         </h1>
// // // // // //         <p className="max-w-3xl mx-auto text-lg opacity-90 px-6">
// // // // // //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// // // // // //         </p>
// // // // // //       </section>

// // // // // //       {/* Hero Image Section */}
// // // // // //       <section className="relative w-full h-64 md:h-96 overflow-hidden flex items-center justify-center">
// // // // // //         <Image
// // // // // //           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
// // // // // //           alt="Kids coding online"
// // // // // //           fill
// // // // // //           className="object-cover"
// // // // // //           sizes="100vw"
// // // // // //           priority
// // // // // //         />
// // // // // //       </section>

// // // // // //       {/* Content Section */}
// // // // // //       <main className="py-12 px-4">
// // // // // //         {content.length > 0 ? (
// // // // // //           content.map((item) => (
// // // // // //             <InfoCard key={item._id} title={item.title} headline={item.headline} text={item.text} />
// // // // // //           ))
// // // // // //         ) : (
// // // // // //           <p className="text-center text-gray-500 py-10">No content found.</p>
// // // // // //         )}
// // // // // //       </main>
// // // // // //     </div>
// // // // // //   );
// // // // // // }
// // // // // // // import { createClient } from 'next-sanity';
// // // // // // // import Image from 'next/image';
// // // // // // // const client = createClient({
// // // // // // //   projectId: '6r4esya0',
// // // // // // //   dataset: 'production',
// // // // // // //   useCdn: true,
// // // // // // //   apiVersion: '2026-06-16',
// // // // // // // });

// // // // // // // // export default async function About() {
// // // // // // // //   // Fetch from the Admin Dashboard
// // // // // // // //   const content = await client.fetch(`*[_type == "about"]`);

// // // // // // // //   return (
// // // // // // // //     <div className="bg-background min-h-screen">
// // // // // // // //       {content.map((item) => (
// // // // // // // //         <InfoCard key={item._id} title={item.title} text={item.text} />
// // // // // // // //       ))}
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // }

// // // // // // // // 1. Define the component inside the same file
// // // // // // // function InfoCard({ title, text }) {
// // // // // // //   return (
// // // // // // //     <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
// // // // // // //       <h2 className="text-2xl font-semibold text-primary mb-4">{title}</h2>
// // // // // // //       <p className="text-gray-700">{text}</p>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }

// // // // // // // // // 2. Export your main page
// // // // // // // export default async function About() {
// // // // // // //   const content = await client.fetch(`*[_type == "about"]`);

// // // // // // //   return (
// // // // // // //     <div className="bg-background min-h-screen text-text font-poppins">
// // // // // // //       {/* Hero */}
// // // // // // //       <section className="bg-hero-gradient text-white py-16 text-center">
// // // // // // //         <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-smoothPulse">
// // // // // // //           About Tech Talk Hub
// // // // // // //         </h1>
// // // // // // //         <p className="max-w-3xl mx-auto text-lg opacity-90 px-6">
// // // // // // //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// // // // // // //         </p>
// // // // // // //       </section>

// // // // // // //       {/* Hero Image with Tagline */}
// // // // // // //       <section className="relative w-full h-64 md:h-96 overflow-hidden flex items-center justify-center">
// // // // // // //         <Image
// // // // // // //           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
// // // // // // //           alt="Kids coding online"
// // // // // // //           fill
// // // // // // //           className="object-cover"
// // // // // // //           sizes="100vw"
// // // // // // //           priority
// // // // // // //         />
// // // // // // //       </section> {/* <--- YOU WERE MISSING THIS CLOSING TAG */}

// // // // // // //       <div className="bg-background min-h-screen">
// // // // // // //         {content.map((item) => (
// // // // // // //           <InfoCard key={item._id} title={item.title} text={item.text} />
// // // // // // //         ))}
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }
// // // // // // // // export default async function About() {
// // // // // // // //   const content = await client.fetch(`*[_type == "about"]`);

// // // // // // // //   return (
// // // // // // // //   	<div className="bg-background min-h-screen text-text font-poppins">
// // // // // // // //       {/* Hero */}
// // // // // // // //       <section className="bg-hero-gradient text-white py-16 text-center">
// // // // // // // //         <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-smoothPulse">
// // // // // // // //           About Tech Talk Hub
// // // // // // // //         </h1>
// // // // // // // //         <p className="max-w-3xl mx-auto text-lg opacity-90 px-6">
// // // // // // // //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// // // // // // // //         </p>
// // // // // // // //       </section>

// // // // // // // //       {/* Hero Image with Tagline */}
// // // // // // // //       <section className="relative w-full h-64 md:h-96 overflow-hidden flex items-center justify-center">
// // // // // // // //         <Image
// // // // // // // //           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
// // // // // // // //           alt="Kids coding online"
// // // // // // // //           fill
// // // // // // // //           className="object-cover"
// // // // // // // //           sizes="100vw"
// // // // // // // //           priority
// // // // // // // //         />

// // // // // // // //     <div className="bg-background min-h-screen">
// // // // // // // //       {content.map((item) => (
// // // // // // // //         <InfoCard key={item._id} title={item.title} text={item.text} />
// // // // // // // //       ))}
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // }
// // // // // // // // import React from "react";
// // // // // // // // import Image from "next/image";

// // // // // // // // export default function About() {
// // // // // // // //   return (
// // // // // // // //     <div className="bg-background min-h-screen text-text font-poppins">
// // // // // // // //       {/* Hero */}
// // // // // // // //       <section className="bg-hero-gradient text-white py-16 text-center">
// // // // // // // //         <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-smoothPulse">
// // // // // // // //           About Tech Talk Hub
// // // // // // // //         </h1>
// // // // // // // //         <p className="max-w-3xl mx-auto text-lg opacity-90 px-6">
// // // // // // // //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// // // // // // // //         </p>
// // // // // // // //       </section>

// // // // // // // //       {/* Hero Image with Tagline */}
// // // // // // // //       <section className="relative w-full h-64 md:h-96 overflow-hidden flex items-center justify-center">
// // // // // // // //         <Image
// // // // // // // //           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
// // // // // // // //           alt="Kids coding online"
// // // // // // // //           fill
// // // // // // // //           className="object-cover"
// // // // // // // //           sizes="100vw"
// // // // // // // //           priority
// // // // // // // //         />
// // // // // // // //         <div className="absolute inset-0 bg-black/40" />
// // // // // // // //         <h2 className="relative z-10 text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
// // // // // // // //           Learn. <span className="text-secondary">Create.</span> <span className="text-accent">Innovate.</span>
// // // // // // // //         </h2>
// // // // // // // //       </section>

// // // // // // // //       {/* Content */}
// // // // // // // //       <section className="py-16 px-6 md:px-20 space-y-12">
// // // // // // // //         <InfoCard title="Who We Are" text="We are an online education and technology company specializing in digital skills training for children and teens." />
// // // // // // // //         <InfoCard title="Our Mission & Vision" text="Our Mission: To make coding and digital literacy accessible to every child in Africa. Our Vision: A future where African youth lead innovation in technology." />
// // // // // // // //         <InfoCard title="What We Offer" text="Curriculum for K1–Grade 12 including Scratch, Python, Web Development, Robotics, and AI." />
// // // // // // // //         <InfoCard title="How We Teach" text="100% online, live, interactive sessions led by trained instructors with personalized feedback." />
// // // // // // // //         <InfoCard title="Who We Serve" text="Students aged 5–18, parents, and schools aiming to integrate coding into their curriculum." />
// // // // // // // //         <InfoCard title="Our Reach" text="Currently serving students in Kenya, Uganda, Tanzania, South Africa, and Nigeria." />
// // // // // // // //       </section>

// // // // // // // //       {/* Footer */}
// // // // // // // //       <footer className="text-center py-10 text-sm text-gray-500 border-t">
// // // // // // // //         © {new Date().getFullYear()} Tech Talk Hub. All rights reserved.
// // // // // // // //       </footer>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // }

// // // // // // // // function InfoCard({ title, text }) {
// // // // // // // //   return (
// // // // // // // //     <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
// // // // // // // //       <h2 className="text-2xl font-semibold text-primary mb-4">{title}</h2>
// // // // // // // //       <p className="text-gray-700">{text}</p>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // }
