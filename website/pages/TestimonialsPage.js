import React from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah M.",
    feedback: "My son absolutely loves Tech Talk Hub! He now builds his own mini-games.",
    avatar: "/avatars/sarah.jpeg",
    stars: 5,
  },
  {
    name: "James O.",
    feedback: "The lessons are simple but powerful. My daughter feels confident coding.",
    avatar: "/avatars/james.jpeg",
    stars: 4,
  },
  {
    name: "Emily T.",
    feedback: "We love the personalized mentorship. It’s fun, engaging, and effective!",
    avatar: "/avatars/emily.jpeg",
    stars: 5,
  },
];

export default function TestimonialsPage() {
  return (
    <div className="bg-background py-20 px-6 md:px-10 font-poppins">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-10">
        
        {/* Left title/description section */}
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            What Our Customers Say
          </h2>
          <p className="text-text text-sm md:text-base">
            Trusted by hundreds of families. Here’s what parents are saying about our live, personalized coding classes.
          </p>
          <button className="bg-secondary text-white font-bold px-5 py-2 rounded-xl shadow-btn hover:opacity-90 transition animate-smoothPulse">
            View More
          </button>
        </div>

        {/* Testimonial cards */}
        <div className="flex-1 space-y-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className={`bg-white shadow-card rounded-xl p-6 flex items-start gap-4 relative ${
                idx === 1 ? "border-l-4 border-secondary bg-background" : ""
              }`}
            >
              <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  fill
                  sizes="(max-width: 768px) 48px, 56px"
                  className="rounded-full object-cover border-2 border-accent"
                />
              </div>
              <div className="flex-1">
                <p className="text-text italic mb-2">“{t.feedback}”</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-primary">{t.name}</p>
                  <div className="flex gap-1">
                    {[...Array(t.stars)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-funPop"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.3a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.033a1 1 0 00-.364 1.118l1.07 3.3c.3.921-.755 1.688-1.54 1.118l-2.8-2.033a1 1 0 00-1.176 0l-2.8 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.3a1 1 0 00-.364-1.118L2.38 8.727c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.3z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
// import React from "react";

// const testimonials = [
//   {
//     name: "Sarah M.",
//     feedback: "My son absolutely loves Tech Talk Hub! He now builds his own mini-games.",
//     avatar: "/avatars/sarah.jpeg",
//     stars: 5,
//   },
//   {
//     name: "James O.",
//     feedback: "The lessons are simple but powerful. My daughter feels confident coding.",
//     avatar: "/avatars/james.jpeg",
//     stars: 4,
//   },
//   {
//     name: "Emily T.",
//     feedback: "We love the personalized mentorship. It’s fun, engaging, and effective!",
//     avatar: "/avatars/emily.jpeg",
//     stars: 5,
//   },
// ];

// export default function TestimonialsPage() {
//   return (
//     <div className="bg-background py-20 px-6 md:px-10 font-poppins">
//       <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-12">
        
//         {/* Left title/description section */}
//         <div className="flex-1 lg:max-w-md space-y-5 lg:sticky lg:top-8">
//           <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
//             What Our Customers Say
//           </h2>
//           <p className="text-gray-600 text-sm md:text-base leading-relaxed">
//             Trusted by hundreds of families. Here’s what parents are saying about our live, personalized coding classes.
//           </p>
//           <button className="bg-secondary text-white font-bold px-6 py-2.5 rounded-xl shadow-btn hover:bg-pink-600 transition duration-200">
//             View More Reviews
//           </button>
//         </div>

//         {/* Testimonial cards */}
//         <div className="flex-1 w-full space-y-6">
//           {testimonials.map((t, idx) => (
//             <div
//               key={idx}
//               className={`bg-white shadow-card rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4 border border-gray-50 transition hover:shadow-md ${
//                 idx === 1 ? "border-l-4 border-l-secondary bg-pink-50/20" : ""
//               }`}
//             >
//               <img
//                 src={t.avatar}
//                 alt={t.name}
//                 className="w-14 h-14 rounded-full object-cover border-2 border-accent flex-shrink-0"
//               />
//               <div className="flex-1 w-full">
//                 <p className="text-gray-700 italic mb-3 text-sm md:text-base">“{t.feedback}”</p>
//                 <div className="flex items-center justify-between flex-wrap gap-2">
//                   <p className="font-bold text-primary text-sm md:text-base">{t.name}</p>
//                   <div className="flex gap-0.5 text-funPop">
//                     {[...Array(t.stars)].map((_, i) => (
//                       <svg
//                         key={i}
//                         className="w-4 h-4 fill-current"
//                         viewBox="0 0 20 20"
//                       >
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.3a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.033a1 1 0 00-.364 1.118l1.07 3.3c.3.921-.755 1.688-1.54 1.118l-2.8-2.033a1 1 0 00-1.176 0l-2.8 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.3a1 1 0 00-.364-1.118L2.38 8.727c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.3z" />
//                       </svg>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// }