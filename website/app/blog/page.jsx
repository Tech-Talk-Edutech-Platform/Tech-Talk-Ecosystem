import Link from "next/link";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";

// Mock data or fetch from your backend/CMS/Supabase
const blogPosts = [
  {
    slug: "building-scalable-backends-python",
    title: "Building Scalable Backend Systems with Python & FastAPI",
    excerpt: "Learn how we architect high-performance API endpoints and manage data flow for student dashboards.",
    date: "August 10, 2026",
    category: "Engineering",
  },
  {
    slug: "teaching-kids-to-code-scratch-blockly",
    title: "Why Visual Programming is the Best Gateway for Young Coders",
    excerpt: "Exploring how Scratch and Blockly spark early problem-solving skills in preschool and junior learners.",
    date: "July 28, 2026",
    category: "Education",
  },
];

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-background text-text selection:bg-secondary/20 pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-4 border border-secondary/20 shadow-sm">
            <Sparkles size={14} /> Tech Talk Hub Insights
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Our Latest <span className="text-secondary">Articles & Stories</span>
          </h1>
          <p className="text-text/70 mt-4 text-base sm:text-lg">
            Engineering breakdowns, teaching methodologies, and updates from our team in Nairobi.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <article 
              key={post.slug}
              className="group bg-background border border-gray-100 dark:border-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs font-medium text-text/60 flex items-center gap-1">
                    <Calendar size={12} /> {post.date}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-text group-hover:text-secondary transition-colors">
                  {post.title}
                </h2>

                <p className="text-text/70 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-secondary group-hover:gap-3 transition-all"
                >
                  Read Article <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Sparkles, Globe, BookOpen, HeartHandshake, ArrowRight, CheckCircle2, MapPin, Clock } from "lucide-react";

// const openRoles = [
//   {
//     id: 1,
//     title: "Technical Content Writer & Blogger",
//     department: "Content",
//     location: "Nairobi, Kenya (Hybrid / Remote)",
//     type: "Full-Time / Contract",
//     description: "Write deep-dive technical articles, programming tutorials, and industry insights centered around software development and tech education.",
//   },
//   {
//     id: 2,
//     title: "Full-Stack Engineer (Blogging Platform)",
//     department: "Engineering",
//     location: "Nairobi, Kenya (Hybrid / Remote)",
//     type: "Full-Time",
//     description: "Build and maintain our high-performance blogging engine, optimize SEO architecture, and improve our interactive reading experience.",
//   },
//   {
//     id: 3,
//     title: "Community & Editorial Lead",
//     department: "Marketing & Community",
//     location: "Nairobi, Kenya",
//     type: "Full-Time",
//     description: "Curate guest blog submissions, manage our publication calendar, and grow our tech reader community across East Africa.",
//   },
// ];

// const perks = [
//   {
//     icon: Globe,
//     title: "Flexible Local Work",
//     description: "Collaborate from our Nairobi base or remote on your own schedule. Total ownership over your hours.",
//   },
//   {
//     icon: Sparkles,
//     title: "Established Growth",
//     description: "Build upon 4 years of operational history in the Kenyan tech ecosystem with a proven publishing vision.",
//   },
//   {
//     icon: HeartHandshake,
//     title: "Editorial Impact",
//     description: "Your articles and technical stories will shape the perspectives and learning journeys of thousands of developers.",
//   },
//   {
//     icon: BookOpen,
//     title: "Continuous Learning",
//     description: "Immerse yourself daily in emerging technologies, software engineering best practices, and deep tech research.",
//   },
// ];

// export default function CareersPage() {
//   const [selectedDepartment, setSelectedDepartment] = useState("All");

//   const departments = ["All", "Content", "Engineering", "Marketing & Community"];

//   const filteredRoles = selectedDepartment === "All"
//     ? openRoles
//     : openRoles.filter((role) => role.department === selectedDepartment);

//   return (
//     <main className="min-h-screen bg-background text-text selection:bg-secondary/20">

//       {/* Hero Section */}
//       <section className="relative pt-20 pb-24 overflow-hidden border-b border-gray-100 dark:border-gray-800/60">
//         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

//         <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-6 border border-secondary/20 shadow-sm">
//             <Sparkles size={14} /> Karibu Team • 4 Years Strong
//           </div>
//           <h1 className="text-4xl sm:text-6xl font-black text-text tracking-tight leading-[1.1]">
//             Scale Tech Talk Hub&apos;s <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Editorial & Content Vision</span>
//           </h1>
//           <p className="text-text/70 mt-6 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
//             For 4 years we have built and shared tech insights in Nairobi. If you love writing deep technical stories, building publishing tools, and expanding our reader community, let&apos;s talk.
//           </p>

//           <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-text/60">
//             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> 4 Years in Operations</span>
//             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Editorial & Tech Expansion</span>
//             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Nairobi & Remote</span>
//           </div>
//         </div>
//       </section>

//       {/* Perks Section */}
//       <section className="py-20 bg-text/[0.01]">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center max-w-2xl mx-auto mb-16">
//             <h2 className="text-3xl font-extrabold tracking-tight">What to Expect Joining Us</h2>
//             <p className="text-text/60 mt-3 text-base">No corporate fluff. Just real writing, building, and publishing.</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {perks.map((perk, idx) => {
//               const IconComponent = perk.icon;
//               return (
//                 <div 
//                   key={idx} 
//                   className="group bg-background p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col items-start relative overflow-hidden"
//                 >
//                   <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
//                   <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 shadow-sm">
//                     <IconComponent size={24} />
//                   </div>
//                   <h3 className="font-bold text-lg text-text mb-2">{perk.title}</h3>
//                   <p className="text-text/60 text-sm leading-relaxed">{perk.description}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Open Positions Section */}
//       <section className="py-24 max-w-7xl mx-auto px-6">
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
//           <div>
//             <span className="text-secondary font-semibold text-xs uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-md">Open Roles</span>
//             <h2 className="text-3xl md:text-4xl font-extrabold text-text mt-3 tracking-tight">
//               Open Positions
//             </h2>
//           </div>

//           {/* Department Filter Pills */}
//           <div className="flex flex-wrap gap-2">
//             {departments.map((dept) => (
//               <button
//                 key={dept}
//                 onClick={() => setSelectedDepartment(dept)}
//                 className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
//                   selectedDepartment === dept
//                     ? "bg-secondary text-background shadow-md shadow-secondary/20"
//                     : "bg-text/5 text-text/80 hover:bg-text/10"
//                 }`}
//               >
//                 {dept}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Roles List */}
//         <div className="space-y-4">
//           {filteredRoles.map((role) => (
//             <div
//               key={role.id}
//               className="group bg-background border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
//             >
//               <div className="space-y-3 max-w-3xl">
//                 <div className="flex flex-wrap items-center gap-2.5">
//                   <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
//                     {role.department}
//                   </span>
//                   <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
//                     <MapPin size={12} /> {role.location}
//                   </span>
//                   <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
//                     <Clock size={12} /> {role.type}
//                   </span>
//                 </div>
                
//                 <h3 className="text-2xl font-bold text-text group-hover:text-secondary transition-colors">
//                   {role.title}
//                 </h3>
                
//                 <p className="text-text/70 text-sm leading-relaxed max-w-2xl">
//                   {role.description}
//                 </p>
//               </div>

//               <button
//                 onClick={() => alert(`Thanks for your interest! Reach out to us directly at founders@techtalkhub.com`)}
//                 className="bg-secondary text-background hover:opacity-95 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 transition-all duration-300 whitespace-nowrap active:scale-95 flex items-center gap-2 group-hover:gap-3"
//               >
//                 Apply Now <ArrowRight size={16} />
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* General Application Note */}
//         <div className="mt-20 bg-gradient-to-br from-secondary/10 via-background to-secondary/5 border border-secondary/20 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
//           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          
//           <h3 className="text-2xl md:text-3xl font-extrabold text-text">Got a story to share or want to write for us?</h3>
//           <p className="text-text/70 text-base mt-3 max-w-xl mx-auto">
//             We are always looking for passionate tech writers and bloggers. Drop us an email with a sample of your writing!
//           </p>
//           <a
//             href="mailto:founders@techtalkhub.com"
//             className="inline-flex items-center gap-2 mt-8 bg-secondary text-background px-8 py-4 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 hover:opacity-95 transition-all active:scale-95"
//           >
//             Reach Out <ArrowRight size={16} />
//           </a>
//         </div>
//       </section>
//     </main>
//   );
// }