"use client";

import { useState } from "react";
import { FaInstagram } from "react-icons/fa";
import {
  ArrowRight,
  CheckCircle2,
 
  Mail,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

const initialForm = {
  parentName: "",
  childAge: "",
  phone: "",
  email: "",
  interest: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const message = [
      "Hello Tech Talk Hub! 👋",
      "",
      `Parent name: ${form.parentName}`,
      `Child's age: ${form.childAge}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email || "Not provided"}`,
      `Interested in: ${form.interest || "Not specified"}`,
      "",
      `Message: ${form.message}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/254704494504?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-purple-100 bg-gradient-to-br from-[#F8F5FF] via-white to-[#FFF3F8] px-5 py-10 shadow-sm sm:px-8 sm:py-12 lg:px-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#9B6CFF]/15 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#FF3F7F]/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#2947C7] shadow-sm">
            <Sparkles className="h-4 w-4 text-[#FF3F7F]" />

            Talk to Our Team
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-[#172554] sm:text-4xl lg:text-5xl">
            Let’s start your child’s{" "}
            <span className="text-[#FF3F7F]">
              coding journey.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Have questions about our classes, programs or
            learning approach? We would love to hear from
            you.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-purple-900/5 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Contact information */}
          <div className="relative overflow-hidden bg-[#2947C7] p-7 text-white sm:p-9 lg:p-10">
            {/* Decorative glows */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#9B6CFF]/35 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[#FF3F7F]/25 blur-3xl" />

            <div className="relative">
              <h3 className="text-2xl font-black">
                We’re here to help.
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-7 text-blue-100">
                Speak with our team about finding the right
                coding program for your child.
              </p>

              {/* Phone */}
              <a
                href="tel:+254704494504"
                className="mt-8 flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 transition hover:bg-white/15"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Phone className="h-5 w-5" />
                </span>

                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-blue-200">
                    Call Us
                  </span>

                  <span className="mt-1 block font-bold">
                    +254 704 494 504
                  </span>
                </span>
              </a>

              {/* Email */}
              <a
                href="mailto:admin@techtalkhub.com"
                className="mt-4 flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 transition hover:bg-white/15"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Mail className="h-5 w-5" />
                </span>

                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-blue-200">
                    Email Us
                  </span>

                  <span className="mt-1 block break-all font-bold">
                    admin@techtalkhub.com
                  </span>
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/254704494504"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 transition hover:bg-white/15"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <MessageCircle className="h-5 w-5" />
                </span>

                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-blue-200">
                    WhatsApp
                  </span>

                  <span className="mt-1 block font-bold">
                    Chat with our team
                  </span>
                </span>
              </a>

              {/* Social */}
              <div className="mt-8 border-t border-white/15 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200">
                  Follow Our Journey
                </p>

                <a
                  href="https://www.instagram.com/techtalkhub_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
                >
                  <FaInstagram className="h-4 w-4" />

                  @techtalkhub_
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="p-7 sm:p-9 lg:p-10">
            <div className="mb-7">
              <h3 className="text-2xl font-black text-[#172554]">
                Send us a message
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tell us a little about your child and we will
                help you get started.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 sm:grid-cols-2"
            >
              {/* Parent name */}
              <div>
                <label
                  htmlFor="parentName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Parent’s Name
                </label>

                <input
                  id="parentName"
                  name="parentName"
                  type="text"
                  required
                  value={form.parentName}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#9B6CFF] focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {/* Child age */}
              <div>
                <label
                  htmlFor="childAge"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Child’s Age
                </label>

                <input
                  id="childAge"
                  name="childAge"
                  type="number"
                  min="4"
                  max="18"
                  required
                  value={form.childAge}
                  onChange={handleChange}
                  placeholder="e.g. 8"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#9B6CFF] focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="07XX XXX XXX"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#9B6CFF] focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#9B6CFF] focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {/* Program interest */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="interest"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Interested In
                </label>

                <select
                  id="interest"
                  name="interest"
                  value={form.interest}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-[#9B6CFF] focus:bg-white focus:ring-4 focus:ring-purple-100"
                >
                  <option value="">
                    Select a program
                  </option>

                  <option value="Junior Coders">
                    Junior Coders
                  </option>

                  <option value="Future Developers">
                    Future Developers
                  </option>

                  <option value="Tech Professionals">
                    Tech Professionals
                  </option>

                  <option value="Not sure yet">
                    Not sure yet
                  </option>
                </select>
              </div>

              {/* Message */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Your Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#9B6CFF] focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#FF3F7F] px-6 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-all hover:-translate-y-0.5 hover:bg-[#E93470] sm:col-span-2"
              >
                <Send className="h-4 w-4" />

                Send via WhatsApp

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="flex items-center justify-center gap-2 text-xs text-slate-500 sm:col-span-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                Your message opens directly in WhatsApp.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
// "use client";
// import React from "react";
// import { FaEnvelope, FaPhone, FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

// export default function ContactPage() {
//   return (
//     <div
//       className="relative bg-hero-gradient text-white py-16 px-6 md:px-20 overflow-hidden font-poppins"
//       style={{
//         backgroundImage: 'url("/hero.png")',
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//       }}
//     >
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

//       <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
//         {/* Left Form */}
//         <div className="w-full md:w-2/3">
//           <h2 className="text-4xl font-bold text-white mb-4">Get In Touch</h2>
//           <p className="mb-10 text-white/90 max-w-md">
//             Don’t be shy. Give us a call or drop us a line. Let’s make some magic together.
//           </p>
//           <form 
//             onSubmit={(e) => e.preventDefault()} 
//             className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/30 backdrop-blur-md p-6 rounded-xl shadow-card text-text"
//           >
//             <input
//               type="text"
//               placeholder="First Name"
//               className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white focus:outline-none focus:ring-2 focus:ring-accent"
//             />
//             <input
//               type="text"
//               placeholder="Last Name"
//               className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white focus:outline-none focus:ring-2 focus:ring-accent"
//             />
//             <input
//               type="tel"
//               placeholder="Phone"
//               className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white focus:outline-none focus:ring-2 focus:ring-accent"
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white focus:outline-none focus:ring-2 focus:ring-accent"
//             />
//             <input
//               type="text"
//               placeholder="Group or Company"
//               className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white md:col-span-2 focus:outline-none focus:ring-2 focus:ring-accent"
//             />
//             <textarea
//               placeholder="How can we help?"
//               rows="4"
//               className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white md:col-span-2 focus:outline-none focus:ring-2 focus:ring-accent"
//             ></textarea>
//             <button type="submit" className="bg-secondary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition md:col-span-2 animate-smoothPulse">
//               ✉ SUBMIT
//             </button>
//           </form>
//         </div>

//         {/* Right Info Panel */}
//         <div className="w-full md:w-1/3 bg-primary/80 p-6 rounded-xl backdrop-blur-md shadow-card">
//           <h3 className="text-2xl font-semibold text-white mb-6">Contact Info</h3>
//           <div className="mb-4 flex items-center space-x-3 text-white">
//             <FaPhone className="text-accent" />
//             <span>+254 704 494 504</span>
//           </div>
//           <div className="mb-4 flex items-center space-x-3 text-white">
//             <FaEnvelope className="text-accent" />
//             <span>admin@techtalkhub.com</span>
//           </div>
//           <div className="flex space-x-4 mt-6">
//             <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent">
//               <FaFacebookF />
//             </a>
//             <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent">
//               <FaTwitter />
//             </a>
//             <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent">
//               <FaYoutube />
//             </a>
//             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent">
//               <FaInstagram />
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }