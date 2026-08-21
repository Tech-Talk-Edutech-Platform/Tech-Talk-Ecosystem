"use client";

import Link from "next/link";

import {
  ArrowRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

const companyLinks = [
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Our Programs",
    href: "/#programs",
  },
  {
    label: "Pricing",
    href: "/#pricing",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Careers",
    href: "/careers",
  },
  {
    label: "Contact Us",
    href: "/#contact",
  },
];

const programLinks = [
  {
    label: "Junior Coders",
    description: "Ages 5–8",
    href: "/junior-coders",
  },
  {
    label: "Future Developers",
    description: "Ages 9–12",
    href: "/future-developers",
  },
  {
    label: "Tech Professionals",
    description: "Ages 13–18",
    href: "/tech-professionals",
  },
];

const resourceLinks = [
  {
    label: "Parent Guides",
    href: "/blog?category=Parent%20Guides",
  },
  {
    label: "Student Projects",
    href: "/#projects",
  },
  {
    label: "Parent Testimonials",
    href: "/#testimonials",
  },
  {
    label: "Learning Resources",
    href: "/shop",
  },
  {
    label: "Book a Free Trial",
    href: "/book-class",
  },
];

const legalLinks = [
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
  {
    label: "Terms & Conditions",
    href: "/terms",
  },
  {
    label: "Child Safety",
    href: "/child-safety",
  },
];

export default function AppFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#172554] text-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#2947C7]/30 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-[#9B6CFF]/15 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#FF3F7F]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pb-7 pt-14 lg:px-8 lg:pt-16">
        {/* Call to action */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-r from-[#2947C7] to-[#7252D3] px-6 py-8 shadow-xl shadow-blue-950/20 sm:px-9 lg:px-10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#FF3F7F]/25 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-pink-200">
                <Sparkles className="h-4 w-4" />

                Start Their Coding Journey
              </div>

              <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                Help your child create with technology.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Book a free trial and discover the right
                learning path for your young creator.
              </p>
            </div>

            <Link
              href="/book-class"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF3F7F] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-950/20 transition-all hover:-translate-y-0.5 hover:bg-[#E93470]"
            >
              Book a Free Trial

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Footer navigation */}
        <div className="grid gap-10 border-b border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr_1.1fr]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-block text-xl font-black tracking-tight text-white"
            >
              Tech Talk{" "}
              <span className="text-[#FF8BB2]">
                Hub
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-7 text-blue-100/75">
              Live, personalized coding classes helping
              African children build skills, confidence and
              creativity.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-blue-100">
              <ShieldCheck className="h-4 w-4 text-[#FF8BB2]" />

              Safe, supportive online learning
            </div>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.instagram.com/techtalkhub_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Tech Talk Hub on Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-[#FF3F7F]/40 hover:bg-[#FF3F7F]/15 hover:text-[#FF8BB2]"
              >
                <FaInstagram className="h-4 w-4" />
              </a>

              <a
                href="https://wa.me/254704494504"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Tech Talk Hub on WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-emerald-400/40 hover:bg-emerald-500/15 hover:text-emerald-300"
              >
                <FaWhatsapp className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Company */}
          <FooterColumn
            title="Company"
            links={companyLinks}
          />

          {/* Programs */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-white">
              Learning Paths
            </h3>

            <ul className="mt-5 space-y-4">
              {programLinks.map((program) => (
                <li key={program.label}>
                  <Link
                    href={program.href}
                    className="group inline-block"
                  >
                    <span className="block text-sm text-blue-100/80 transition group-hover:text-[#FF8BB2]">
                      {program.label}
                    </span>

                    <span className="mt-1 block text-xs text-blue-200/55">
                      {program.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <FooterColumn
            title="Resources"
            links={resourceLinks}
          />

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-white">
              Contact Us
            </h3>

            <div className="mt-5 space-y-4">
              <a
                href="tel:+254704494504"
                className="flex items-start gap-3 text-sm text-blue-100/80 transition hover:text-white"
              >
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#FF8BB2]" />

                <span>+254 704 494 504</span>
              </a>

              <a
                href="mailto:admin@techtalkhub.com"
                className="flex items-start gap-3 text-sm text-blue-100/80 transition hover:text-white"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#FF8BB2]" />

                <span className="break-all">
                  admin@techtalkhub.com
                </span>
              </a>

              <div className="flex items-start gap-3 text-sm leading-6 text-blue-100/80">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#FF8BB2]" />

                <span>
                  Nairobi, Kenya
                  <br />
                  Online across Africa
                </span>
              </div>
            </div>

            <a
              href="https://wa.me/254704494504"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#FF8BB2] transition hover:text-white"
            >
              Chat on WhatsApp

              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Copyright and legal links */}
        <div className="flex flex-col items-center justify-between gap-5 pt-6 text-center md:flex-row md:text-left">
          <p className="text-xs text-blue-100/60">
            © {new Date().getFullYear()} Tech Talk Hub. All
            rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-blue-100/60 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="inline-flex items-center gap-1.5 text-xs text-blue-100/60">
            Made with{" "}
            <Heart className="h-3.5 w-3.5 fill-[#FF3F7F] text-[#FF3F7F]" />{" "}
            for young creators
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-white">
        {title}
      </h3>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-blue-100/80 transition hover:text-[#FF8BB2]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
// "use client";
// import React from "react";
// import Link from "next/link";
// import {
//   FaFacebook,
//   FaTwitter,
//   FaYoutube,
//   FaLinkedin,
//   FaInstagram,
//   FaDiscord,
// } from "react-icons/fa";

// export default function AppFooter() {
//   const socialLinks = [
//     { icon: FaFacebook, label: "Facebook", href: "#" },
//     { icon: FaTwitter, label: "Twitter", href: "#" },
//     { icon: FaYoutube, label: "YouTube", href: "#" },
//     { icon: FaLinkedin, label: "LinkedIn", href: "#" },
//     { icon: FaInstagram, label: "Instagram", href: "#" },
//     { icon: FaDiscord, label: "Discord", href: "#" },
//   ];

//   return (
//     <footer className="w-full bg-gradient-to-br from-[#ec4899] via-[#8b5cf6] to-[#06b6d4] text-white py-16 px-6 relative overflow-hidden">
//       <div className="max-w-7xl mx-auto space-y-16">
        
//         {/* Contact CTA Section */}
//         <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-center space-y-5 shadow-xl border border-white/20">
//           <h2 className="text-3xl font-bold text-[#FFC107]">Got Questions?</h2>
//           <p className="text-white/90 text-md">
//             Send us a message and we'll get back to you soon.
//           </p>
//           <form
//             onSubmit={(e) => e.preventDefault()}
//             className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-lg mx-auto"
//           >
//             <input
//               type="email"
//               required
//               placeholder="Enter your email"
//               className="px-4 py-2.5 rounded-lg w-full md:w-72 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4081]"
//             />
//             <button
//               type="submit"
//               className="bg-[#FF4081] text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-[#FFC107] hover:text-gray-900 transition-all duration-200"
//             >
//               Submit
//             </button>
//           </form>
//         </div>

//         {/* Footer Links Matrix */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm">
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-[#FFC107]">Follow Us</h3>
//             <div className="flex flex-wrap gap-4">
//               {socialLinks.map(({ icon: Icon, label, href }) => (
//                 <a
//                   key={label}
//                   href={href}
//                   aria-label={label}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-white/80 hover:text-[#FFC107] transition text-xl"
//                 >
//                   <Icon />
//                 </a>
//               ))}
//             </div>
//           </div>

//           <FooterColumn
//             title="Company"
//             items={[
//               <Link key="about" href="/about" className="hover:underline">About Us</Link>,
//               <Link key="programs" href="#programs" className="hover:underline">Programs</Link>,
//               <Link key="blog" href="/blog" className="hover:underline">Blog</Link>,
//               <Link key="careers" href="/careers" className="hover:underline">Careers</Link>,
//               <Link key="contact" href="#contact" className="hover:underline">Contact</Link>,
//               <Link key="terms" href="/terms" className="hover:underline">
//                 Terms & Conditions
//               </Link>,
//             ]}
//           />

//           <FooterColumn
//             title="Popular Courses"
//             items={[
//               "Scratch Programming",
//               "Python for Kids",
//               "Web Development",
//               "AI & ML",
//               "App Development",
//             ]}
//           />

//           <FooterColumn
//             title="Premium Tracks"
//             items={["AI Champion", "AI Prodigy", "AI Grandmaster"]}
//           />
//         </div>

//         {/* Copyright */}
//         <div className="text-center text-white/70 text-xs border-t border-white/10 pt-6">
//           © {new Date().getFullYear()} Tech Talk Hub. All rights reserved.
//         </div>
//       </div>
//     </footer>
//   );
// }

// function FooterColumn({ title, items }) {
//   return (
//     <div className="space-y-3">
//       <h3 className="text-lg font-semibold text-[#FFC107]">{title}</h3>
//       <ul className="space-y-2">
//         {items.map((item, idx) => (
//           <li key={idx} className="text-white/80 hover:text-white transition duration-150">
//             {item}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
// // "use client";
// // import Link from "next/link";
// // import {
// //   FaFacebook,
// //   FaTwitter,
// //   FaYoutube,
// //   FaLinkedin,
// //   FaInstagram,
// //   FaDiscord,
// // } from "react-icons/fa";

// // export default function AppFooter() {
// //   const socialLinks = [
// //     { icon: FaFacebook, label: "Facebook", href: "#" },
// //     { icon: FaTwitter, label: "Twitter", href: "#" },
// //     { icon: FaYoutube, label: "YouTube", href: "#" },
// //     { icon: FaLinkedin, label: "LinkedIn", href: "#" },
// //     { icon: FaInstagram, label: "Instagram", href: "#" },
// //     { icon: FaDiscord, label: "Discord", href: "#" },
// //   ];

// //   return (
// //     <footer className="w-full bg-hero-gradient text-white py-16 px-6">
// //       <div className="max-w-7xl mx-auto space-y-16">
// //         {/* Contact CTA Section */}
// //         <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl text-center space-y-5 shadow-card">
// //           <h2 className="text-3xl font-bold text-funPop">Got Questions?</h2>
// //           <p className="text-white/80 text-md">
// //             Send us a message and we'll get back to you soon.
// //           </p>
// //           <form
// //             onSubmit={(e) => e.preventDefault()}
// //             className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-lg mx-auto"
// //           >
// //             <input
// //               type="email"
// //               required
// //               placeholder="Enter your email"
// //               className="px-4 py-2 rounded-lg w-full md:w-72 text-text focus:outline-none focus:ring-2 focus:ring-secondary"
// //             />
// //             <button
// //               type="submit"
// //               className="bg-secondary text-background font-semibold px-5 py-2 rounded-lg shadow-btn hover:bg-funPop hover:text-text transition"
// //             >
// //               Submit
// //             </button>
// //           </form>
// //         </div>

// //         {/* Footer Links Matrix */}
// //         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm">
// //           <div className="space-y-4">
// //             <h3 className="text-lg font-semibold text-funPop">Follow Us</h3>
// //             <div className="flex flex-wrap gap-4">
// //               {socialLinks.map(({ icon: Icon, label, href }) => (
// //                 <a
// //                   key={label}
// //                   href={href}
// //                   aria-label={label}
// //                   target="_blank"
// //                   rel="noopener noreferrer"
// //                   className="text-white/80 hover:text-funPop transition text-2xl"
// //                 >
// //                   <Icon />
// //                 </a>
// //               ))}
// //             </div>
// //           </div>

// //           <FooterColumn
// //             title="Company"
// //             items={[
// //               <Link key="about" href="/about">About Us</Link>,
// //               <Link key="programs" href="#programs">Programs</Link>,
// //               <Link key="blog" href="/blog">Blog</Link>,
// //               <Link key="careers" href="/careers">Careers</Link>,
// //               <Link key="contact" href="#contact">Contact</Link>,
// //               <Link key="terms" href="/terms" className="hover:underline text-white/80">
// //                 Terms & Conditions
// //               </Link>,
// //             ]}
// //           />

// //           <FooterColumn
// //             title="Popular Courses"
// //             items={[
// //               "Scratch Programming",
// //               "Python for Kids",
// //               "Web Development",
// //               "AI & ML",
// //               "App Development",
// //             ]}
// //           />

// //           <FooterColumn
// //             title="Premium Tracks"
// //             items={["AI Champion", "AI Prodigy", "AI Grandmaster"]}
// //           />
// //         </div>

// //         {/* Copyright */}
// //         <div className="text-center text-white/60 text-xs border-t border-white/20 pt-6">
// //           © {new Date().getFullYear()} Tech Talk Hub. All rights reserved.
// //         </div>
// //       </div>
// //     </footer>
// //   );
// // }

// // function FooterColumn({ title, items }) {
// //   return (
// //     <div className="space-y-3">
// //       <h3 className="text-lg font-semibold text-funPop">{title}</h3>
// //       <ul className="space-y-1">
// //         {items.map((item, idx) => (
// //           <li key={idx} className="text-white/80 hover:text-white transition cursor-pointer">
// //             {item}
// //           </li>
// //         ))}
// //       </ul>
// //     </div>
// //   );
// // }