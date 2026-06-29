import { client } from '../../lib/sanity';
import Image from 'next/image';

// SEO Metadata
export const metadata = {
  title: 'About Tech Talk Hub | Coding Education for Kids in Africa',
  description: 'Empowering Africa’s next generation with online coding classes. From Scratch to AI, we teach digital skills to K-12 students across the continent.',
};

function InfoCard({ title, headline, text, showButton }) {
  if (!title && !headline && !text) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 my-8 mx-4 md:mx-auto max-w-4xl transition-all hover:shadow-xl">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</h2>
      <h3 className="text-2xl md:text-3xl font-bold text-pink-600 mb-4">{headline}</h3>
      <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line mb-6">{text}</p>
      
      {/* Contextual CTA only for 'What We Offer' */}
      {showButton && (
        <a href="/curriculum" className="inline-block bg-slate-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-900 transition shadow-md">
          View Our Curriculum
        </a>
      )}
    </div>
  );
}

export default async function About() {
  const content = await client.fetch(`*[_type == "about"] | order(orderRank asc)`);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-poppins">
      {/* Hero Section */}
      <section className="bg-hero-gradient text-white py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-smoothPulse">
          About Tech Talk Hub
        </h1>
        <p className="max-w-2xl mx-auto text-xl opacity-90 px-6">
          Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
        </p>
      </section>

      {/* Hero Image */}
      <section className="relative w-full h-72 md:h-96 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
          alt="Kids coding online"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </section>

      {/* Content Section */}
      <main className="py-12 px-4">
        {content.length > 0 ? (
          content.map((item) => (
            <InfoCard 
              key={item._id} 
              title={item.title} 
              headline={item.headline} 
              text={item.text}
              showButton={item.title === "What We Offer"}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">No content found.</p>
        )}
      </main>

      {/* Trust & Social Proof Section */}
      <section className="py-16 bg-white text-center border-t border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Serving Students Across Africa</h3>
       
        <p className="text-lg font-medium text-pink-600">
  🇰🇪 Kenya • 🇺🇬 Uganda • 🇹🇿 Tanzania • 🇿🇦 South Africa • 🇳🇬 Nigeria
</p>
      </section>

      {/* Final Global CTA */}
      <div className="text-center py-20 bg-slate-50">
        <h2 className="text-3xl font-bold mb-6 text-slate-800">Ready to start your journey?</h2>
        
        {/* Social Proof Counter */}
        <p className="text-slate-500 mb-8 font-medium">
          Join <span className="text-pink-600 font-bold">500+ students</span> currently building their future with us.
        </p>

        <a href="/book-class" className="bg-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-700 transition shadow-lg">
          Join Our Next Class
        </a>
      </div>
    </div>
  );
}
// import { client } from '../../lib/sanity';
// import Image from 'next/image';

// // SEO Metadata
// export const metadata = {
//   title: 'About Tech Talk Hub | Coding Education for Kids in Africa',
//   description: 'Empowering Africa’s next generation with online coding classes. From Scratch to AI, we teach digital skills to K-12 students across the continent.',
// };

// function InfoCard({ title, headline, text, showButton }) {
//   if (!title && !headline && !text) return null;

//   return (
//     <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 my-8 mx-4 md:mx-auto max-w-4xl transition-all hover:shadow-xl">
//       <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</h2>
//       <h3 className="text-2xl md:text-3xl font-bold text-pink-600 mb-4">{headline}</h3>
//       <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line mb-6">{text}</p>
      
//       {/* CTA only appears on the 'What We Offer' section */}
//       {showButton && (
//         <a href="/contact" className="inline-block bg-blue-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-pink-600 transition shadow-md">
//           View Our Curriculum
//         </a>
//       )}
//     </div>
//   );
// }

// export default async function About() {
//   const content = await client.fetch(`*[_type == "about"]`);

//   return (
//     <div className="bg-slate-50 min-h-screen text-slate-800 font-poppins">
//       {/* Hero Section */}
//       <section className="bg-hero-gradient text-white py-20 text-center">
//         <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-smoothPulse">
//           About Tech Talk Hub
//         </h1>
//         <p className="max-w-2xl mx-auto text-xl opacity-90 px-6">
//           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
//         </p>
//       </section>

//       {/* Hero Image */}
//       <section className="relative w-full h-72 md:h-96 overflow-hidden">
//         <Image
//           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
//           alt="Kids coding online"
//           fill
//           className="object-cover"
//           sizes="100vw"
//           priority
//         />
//       </section>

//       {/* Content Section */}
//       <main className="py-12 px-4">
//         {content.length > 0 ? (
//           content.map((item) => (
//             <InfoCard 
//               key={item._id} 
//               title={item.title} 
//               headline={item.headline} 
//               text={item.text}
//               // Only shows the button for your services section
//               showButton={item.title === "What We Offer"}
//             />
//           ))
//         ) : (
//           <p className="text-center text-gray-500 py-10">No content found.</p>
//         )}
//       </main>

//       {/* Trust & Social Proof Section */}
//       <section className="py-16 bg-white text-center border-t border-slate-100">
//         <h3 className="text-xl font-bold text-slate-800 mb-6">Serving Students Across Africa</h3>
//         <p className="text-lg font-medium text-pink-600">
//           Kenya • Uganda • Tanzania • South Africa • Nigeria
//         </p>
//       </section>

//       {/* Final Global CTA */}
//       <div className="text-center py-20 bg-slate-50">
//         <h2 className="text-3xl font-bold mb-6 text-slate-800">Ready to start your journey?</h2>
//         <a href="/contact" className="bg-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-700 transition shadow-lg">
//           Join Our Next Class
//         </a>
//       </div>
//     </div>
//   );
// }
// // import { client } from '../../lib/sanity';
// import Image from 'next/image';

// // function InfoCard({ title, headline, text }) {
// //   // Only render the card if there is actual content
// //   if (!title && !headline && !text) return null;

// //   return (
// //     <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 my-8 mx-4 md:mx-auto max-w-4xl transition-all hover:shadow-xl">
// //       {/* Title with subtle uppercase styling for hierarchy */}
// //       <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
// //         {title}
// //       </h2>
      
// //       {/* Pink Headline */}
// //       <h3 className="text-2xl md:text-3xl font-bold text-pink-600 mb-4">
// //         {headline}
// //       </h3>
      
// //       {/* Readable Body Text */}
// //       <p className="text-gray-600 text-lg leading-relaxed">
// //         {text}
// //       </p>
// //     </div>
// //   );
// // }
// function InfoCard({ title, headline, text }) {
//   if (!title && !headline && !text) return null;

//   return (
//     <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 my-8 mx-4 md:mx-auto max-w-4xl transition-all hover:shadow-xl">
//       <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
//         {title}
//       </h2>
//       <h3 className="text-2xl md:text-3xl font-bold text-pink-600 mb-4">
//         {headline}
//       </h3>
//       {/* whitespace-pre-line preserves the line breaks from your text field */}
//       <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
//         {text}
//       </p>
//     </div>
//   );
// }

// export default async function About() {
//   const content = await client.fetch(`*[_type == "about"]`);

//   return (
//     <div className="bg-slate-50 min-h-screen text-slate-800 font-poppins">
//       {/* Hero Section */}
//       <section className="bg-hero-gradient text-white py-20 text-center">
//         <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-smoothPulse">
//           About Tech Talk Hub
//         </h1>
//         <p className="max-w-2xl mx-auto text-xl opacity-90 px-6">
//           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
//         </p>
//       </section>

//       {/* Hero Image Section */}
//       <section className="relative w-full h-72 md:h-96 overflow-hidden">
//         <Image
//           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
//           alt="Kids coding online"
//           fill
//           className="object-cover"
//           sizes="100vw"
//           priority
//         />
//       </section>

//       {/* Content Section */}
//       <main className="py-12 px-4">
//         {content.length > 0 ? (
//           content.map((item) => (
//             <InfoCard 
//               key={item._id} 
//               title={item.title} 
//               headline={item.headline} 
//               text={item.text} 
//             />
//           ))
//         ) : (
//           <p className="text-center text-gray-500 py-10">No content found.</p>
//         )}
//       </main>
//       <div className="text-center py-10">
//   <a 
//     href="/contact" 
//     className="bg-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-700 transition"
//   >
//     Start Your Coding Journey
//   </a>
// </div>
//     </div>
//   );
// }
// // import { client } from '../../lib/sanity';
// // import Image from 'next/image';

// // function InfoCard({ title, headline, text }) {
// //   return (
// //     <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100 my-6 mx-4 md:mx-auto max-w-4xl">
// //       <h2 className="text-2xl font-semibold text-primary mb-4">{title}</h2>
// //       <h3 className="text-xl font-semibold text-pink-600 text-primary mb-2">{headline}</h3>
// //       <p className="text-gray-700 leading-relaxed">{text}</p>
// //     </div>
// //   );
// // }

// // export default async function About() {
// //   const content = await client.fetch(`*[_type == "about"]`);

// //   return (
// //     <div className="bg-background min-h-screen text-text font-poppins">
// //       {/* Hero Section */}
// //       <section className="bg-hero-gradient text-white py-16 text-center">
// //         <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-smoothPulse">
// //           About Tech Talk Hub
// //         </h1>
// //         <p className="max-w-3xl mx-auto text-lg opacity-90 px-6">
// //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// //         </p>
// //       </section>

// //       {/* Hero Image Section */}
// //       <section className="relative w-full h-64 md:h-96 overflow-hidden flex items-center justify-center">
// //         <Image
// //           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
// //           alt="Kids coding online"
// //           fill
// //           className="object-cover"
// //           sizes="100vw"
// //           priority
// //         />
// //       </section>

// //       {/* Content Section */}
// //       <main className="py-12 px-4">
// //         {content.length > 0 ? (
// //           content.map((item) => (
// //             <InfoCard key={item._id} title={item.title} headline={item.headline} text={item.text} />
// //           ))
// //         ) : (
// //           <p className="text-center text-gray-500 py-10">No content found.</p>
// //         )}
// //       </main>
// //     </div>
// //   );
// // }
// // // import { createClient } from 'next-sanity';
// // // import Image from 'next/image';
// // // const client = createClient({
// // //   projectId: '6r4esya0',
// // //   dataset: 'production',
// // //   useCdn: true,
// // //   apiVersion: '2026-06-16',
// // // });

// // // // export default async function About() {
// // // //   // Fetch from the Admin Dashboard
// // // //   const content = await client.fetch(`*[_type == "about"]`);

// // // //   return (
// // // //     <div className="bg-background min-h-screen">
// // // //       {content.map((item) => (
// // // //         <InfoCard key={item._id} title={item.title} text={item.text} />
// // // //       ))}
// // // //     </div>
// // // //   );
// // // // }

// // // // 1. Define the component inside the same file
// // // function InfoCard({ title, text }) {
// // //   return (
// // //     <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
// // //       <h2 className="text-2xl font-semibold text-primary mb-4">{title}</h2>
// // //       <p className="text-gray-700">{text}</p>
// // //     </div>
// // //   );
// // // }

// // // // // 2. Export your main page
// // // export default async function About() {
// // //   const content = await client.fetch(`*[_type == "about"]`);

// // //   return (
// // //     <div className="bg-background min-h-screen text-text font-poppins">
// // //       {/* Hero */}
// // //       <section className="bg-hero-gradient text-white py-16 text-center">
// // //         <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-smoothPulse">
// // //           About Tech Talk Hub
// // //         </h1>
// // //         <p className="max-w-3xl mx-auto text-lg opacity-90 px-6">
// // //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// // //         </p>
// // //       </section>

// // //       {/* Hero Image with Tagline */}
// // //       <section className="relative w-full h-64 md:h-96 overflow-hidden flex items-center justify-center">
// // //         <Image
// // //           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
// // //           alt="Kids coding online"
// // //           fill
// // //           className="object-cover"
// // //           sizes="100vw"
// // //           priority
// // //         />
// // //       </section> {/* <--- YOU WERE MISSING THIS CLOSING TAG */}

// // //       <div className="bg-background min-h-screen">
// // //         {content.map((item) => (
// // //           <InfoCard key={item._id} title={item.title} text={item.text} />
// // //         ))}
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // // // export default async function About() {
// // // //   const content = await client.fetch(`*[_type == "about"]`);

// // // //   return (
// // // //   	<div className="bg-background min-h-screen text-text font-poppins">
// // // //       {/* Hero */}
// // // //       <section className="bg-hero-gradient text-white py-16 text-center">
// // // //         <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-smoothPulse">
// // // //           About Tech Talk Hub
// // // //         </h1>
// // // //         <p className="max-w-3xl mx-auto text-lg opacity-90 px-6">
// // // //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// // // //         </p>
// // // //       </section>

// // // //       {/* Hero Image with Tagline */}
// // // //       <section className="relative w-full h-64 md:h-96 overflow-hidden flex items-center justify-center">
// // // //         <Image
// // // //           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
// // // //           alt="Kids coding online"
// // // //           fill
// // // //           className="object-cover"
// // // //           sizes="100vw"
// // // //           priority
// // // //         />

// // // //     <div className="bg-background min-h-screen">
// // // //       {content.map((item) => (
// // // //         <InfoCard key={item._id} title={item.title} text={item.text} />
// // // //       ))}
// // // //     </div>
// // // //   );
// // // // }
// // // // import React from "react";
// // // // import Image from "next/image";

// // // // export default function About() {
// // // //   return (
// // // //     <div className="bg-background min-h-screen text-text font-poppins">
// // // //       {/* Hero */}
// // // //       <section className="bg-hero-gradient text-white py-16 text-center">
// // // //         <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-smoothPulse">
// // // //           About Tech Talk Hub
// // // //         </h1>
// // // //         <p className="max-w-3xl mx-auto text-lg opacity-90 px-6">
// // // //           Empowering Africa’s next generation of digital creators through engaging, hands-on coding education.
// // // //         </p>
// // // //       </section>

// // // //       {/* Hero Image with Tagline */}
// // // //       <section className="relative w-full h-64 md:h-96 overflow-hidden flex items-center justify-center">
// // // //         <Image
// // // //           src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80"
// // // //           alt="Kids coding online"
// // // //           fill
// // // //           className="object-cover"
// // // //           sizes="100vw"
// // // //           priority
// // // //         />
// // // //         <div className="absolute inset-0 bg-black/40" />
// // // //         <h2 className="relative z-10 text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
// // // //           Learn. <span className="text-secondary">Create.</span> <span className="text-accent">Innovate.</span>
// // // //         </h2>
// // // //       </section>

// // // //       {/* Content */}
// // // //       <section className="py-16 px-6 md:px-20 space-y-12">
// // // //         <InfoCard title="Who We Are" text="We are an online education and technology company specializing in digital skills training for children and teens." />
// // // //         <InfoCard title="Our Mission & Vision" text="Our Mission: To make coding and digital literacy accessible to every child in Africa. Our Vision: A future where African youth lead innovation in technology." />
// // // //         <InfoCard title="What We Offer" text="Curriculum for K1–Grade 12 including Scratch, Python, Web Development, Robotics, and AI." />
// // // //         <InfoCard title="How We Teach" text="100% online, live, interactive sessions led by trained instructors with personalized feedback." />
// // // //         <InfoCard title="Who We Serve" text="Students aged 5–18, parents, and schools aiming to integrate coding into their curriculum." />
// // // //         <InfoCard title="Our Reach" text="Currently serving students in Kenya, Uganda, Tanzania, South Africa, and Nigeria." />
// // // //       </section>

// // // //       {/* Footer */}
// // // //       <footer className="text-center py-10 text-sm text-gray-500 border-t">
// // // //         © {new Date().getFullYear()} Tech Talk Hub. All rights reserved.
// // // //       </footer>
// // // //     </div>
// // // //   );
// // // // }

// // // // function InfoCard({ title, text }) {
// // // //   return (
// // // //     <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
// // // //       <h2 className="text-2xl font-semibold text-primary mb-4">{title}</h2>
// // // //       <p className="text-gray-700">{text}</p>
// // // //     </div>
// // // //   );
// // // // }
