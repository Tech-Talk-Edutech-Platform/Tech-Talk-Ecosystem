"use client";
import React from "react";
import Link from "next/link";
import {
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaInstagram,
  FaDiscord,
} from "react-icons/fa";

export default function AppFooter() {
  const socialLinks = [
    { icon: FaFacebook, label: "Facebook", href: "#" },
    { icon: FaTwitter, label: "Twitter", href: "#" },
    { icon: FaYoutube, label: "YouTube", href: "#" },
    { icon: FaLinkedin, label: "LinkedIn", href: "#" },
    { icon: FaInstagram, label: "Instagram", href: "#" },
    { icon: FaDiscord, label: "Discord", href: "#" },
  ];

  return (
    <footer className="w-full bg-gradient-to-br from-[#ec4899] via-[#8b5cf6] to-[#06b6d4] text-white py-16 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Contact CTA Section */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl text-center space-y-5 shadow-xl border border-white/20">
          <h2 className="text-3xl font-bold text-[#FFC107]">Got Questions?</h2>
          <p className="text-white/90 text-md">
            Send us a message and we'll get back to you soon.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-lg mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="px-4 py-2.5 rounded-lg w-full md:w-72 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4081]"
            />
            <button
              type="submit"
              className="bg-[#FF4081] text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-[#FFC107] hover:text-gray-900 transition-all duration-200"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Footer Links Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#FFC107]">Follow Us</h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-[#FFC107] transition text-xl"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn
            title="Company"
            items={[
              <Link key="about" href="/about" className="hover:underline">About Us</Link>,
              <Link key="programs" href="#programs" className="hover:underline">Programs</Link>,
              <Link key="blog" href="/blog" className="hover:underline">Blog</Link>,
              <Link key="careers" href="/careers" className="hover:underline">Careers</Link>,
              <Link key="contact" href="#contact" className="hover:underline">Contact</Link>,
              <Link key="terms" href="/terms" className="hover:underline">
                Terms & Conditions
              </Link>,
            ]}
          />

          <FooterColumn
            title="Popular Courses"
            items={[
              "Scratch Programming",
              "Python for Kids",
              "Web Development",
              "AI & ML",
              "App Development",
            ]}
          />

          <FooterColumn
            title="Premium Tracks"
            items={["AI Champion", "AI Prodigy", "AI Grandmaster"]}
          />
        </div>

        {/* Copyright */}
        <div className="text-center text-white/70 text-xs border-t border-white/10 pt-6">
          © {new Date().getFullYear()} Tech Talk Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-[#FFC107]">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-white/80 hover:text-white transition duration-150">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
// "use client";
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
//     <footer className="w-full bg-hero-gradient text-white py-16 px-6">
//       <div className="max-w-7xl mx-auto space-y-16">
//         {/* Contact CTA Section */}
//         <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl text-center space-y-5 shadow-card">
//           <h2 className="text-3xl font-bold text-funPop">Got Questions?</h2>
//           <p className="text-white/80 text-md">
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
//               className="px-4 py-2 rounded-lg w-full md:w-72 text-text focus:outline-none focus:ring-2 focus:ring-secondary"
//             />
//             <button
//               type="submit"
//               className="bg-secondary text-background font-semibold px-5 py-2 rounded-lg shadow-btn hover:bg-funPop hover:text-text transition"
//             >
//               Submit
//             </button>
//           </form>
//         </div>

//         {/* Footer Links Matrix */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm">
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-funPop">Follow Us</h3>
//             <div className="flex flex-wrap gap-4">
//               {socialLinks.map(({ icon: Icon, label, href }) => (
//                 <a
//                   key={label}
//                   href={href}
//                   aria-label={label}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-white/80 hover:text-funPop transition text-2xl"
//                 >
//                   <Icon />
//                 </a>
//               ))}
//             </div>
//           </div>

//           <FooterColumn
//             title="Company"
//             items={[
//               <Link key="about" href="/about">About Us</Link>,
//               <Link key="programs" href="#programs">Programs</Link>,
//               <Link key="blog" href="/blog">Blog</Link>,
//               <Link key="careers" href="/careers">Careers</Link>,
//               <Link key="contact" href="#contact">Contact</Link>,
//               <Link key="terms" href="/terms" className="hover:underline text-white/80">
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
//         <div className="text-center text-white/60 text-xs border-t border-white/20 pt-6">
//           © {new Date().getFullYear()} Tech Talk Hub. All rights reserved.
//         </div>
//       </div>
//     </footer>
//   );
// }

// function FooterColumn({ title, items }) {
//   return (
//     <div className="space-y-3">
//       <h3 className="text-lg font-semibold text-funPop">{title}</h3>
//       <ul className="space-y-1">
//         {items.map((item, idx) => (
//           <li key={idx} className="text-white/80 hover:text-white transition cursor-pointer">
//             {item}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }