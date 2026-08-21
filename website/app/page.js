import Image from "next/image";

import HeroBackground from "../components/HeroBackground";
import HeroContent from "../components/HeroContent";
import SliderWidget from "../components/Slider";
import AboutHighlight from "../components/AboutHighlight";
import CurriculumClientPage from "../components/CurriculumClientPage";
import AdmissionsPage from "../pages/admissions";
import TestimonialsPage from "../pages/TestimonialsPage";
import ContactPage from "../pages/contact";
import AppFooter from "../components/Footer";
import Pricing from "../pages/Pricing";
import NavBar from "../components/NavBar";
import StudentProjects from "../pages/StudentProjects";

import { client } from "../lib/sanity";
import { allLevelsQuery } from "../lib/queries";

import "./globals.css";

export const metadata = {
  title: "Tech Talk Hub | Learn Coding & Build the Future",

  description:
    "Live, personalized coding classes helping children aged 5–17 build practical technology skills, confidence and creativity.",

  openGraph: {
    title: "Tech Talk Hub | Learn Coding & Build the Future",

    description:
      "Live, personalized coding classes for children aged 5–17.",

    images: [
      {
        url: "/home-hero.png",
        width: 1448,
        height: 1086,
        alt: "Young African learner coding with Tech Talk Hub",
      },
    ],
  },
};

export default async function HomePage() {
  let levels = [];

  try {
    levels = await client.fetch(allLevelsQuery);
  } catch (error) {
    console.error("Failed to fetch levels from Sanity:", error);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <NavBar />

      {/* Hero */}
      <section id="hero" className="relative pt-20">
        <HeroBackground>
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="relative grid lg:min-h-[510px] lg:grid-cols-[1.08fr_0.92fr] lg:items-center xl:min-h-[530px]">
              {/* Hero content */}
              <div className="relative z-20 py-10 sm:py-12 lg:py-8">
                <HeroContent />
              </div>

              {/* Desktop image */}
              <div className="relative hidden h-full min-h-[510px] lg:block xl:min-h-[530px]">
                <div
                  className="pointer-events-none absolute inset-y-0 -left-8 -right-12 xl:-right-20"
                  style={{
                    maskImage:
                      "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 14%, black 30%, black 100%)",

                    WebkitMaskImage:
                      "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 14%, black 30%, black 100%)",
                  }}
                >
                  <Image
                    src="/home-hero.png"
                    alt="Young African learner coding with Tech Talk Hub"
                    fill
                    priority
                    sizes="(min-width: 1280px) 640px, 48vw"
                    className="object-contain object-right-bottom"
                  />

                  {/* Subtle image blending */}
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#F8F5FF]/35" />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#F1E8FF]/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>

            {/* Mobile image */}
            <div className="relative mx-auto -mt-6 h-[255px] w-full max-w-lg overflow-hidden sm:h-[340px] lg:hidden">
              <Image
                src="/home-hero.png"
                alt="Young African learner coding with Tech Talk Hub"
                fill
                priority
                sizes="(max-width: 640px) 100vw, 512px"
                className="object-contain object-center bottom-0"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#F1E8FF]/30 via-transparent to-transparent" />
            </div>
          </div>
        </HeroBackground>
      </section>

      {/* Technology slider */}
     <section className="relative z-20 border-b border-slate-100 bg-white py-2 sm:py-3">
        <div className="mx-auto max-w-7xl px-6">
          <SliderWidget />
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="bg-slate-50">
        <CurriculumClientPage initialLevels={levels} />
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-background py-10">
        <div className="mx-auto max-w-7xl px-6">
          <Pricing />
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-6">
          <AboutHighlight />
        </div>
      </section>

      {/* Admissions */}
    
      {/*  <section id="admissions" className="bg-background py-10">
        <div className="mx-auto max-w-7xl px-6">
          <AdmissionsPage />
        </div>
      </section> */}

      {/* Student projects */}
      <section id="projects" className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-6">
          <StudentProjects />
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <TestimonialsPage />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-background py-10">
        <div className="mx-auto max-w-7xl px-6">
          <ContactPage />
        </div>
      </section>

      <AppFooter />
    </main>
  );
}
// import Image from "next/image";

// import HeroBackground from "../components/HeroBackground";
// import HeroContent from "../components/HeroContent";
// import SliderWidget from "../components/Slider";
// import AboutHighlight from "../components/AboutHighlight";
// import CurriculumClientPage from "../components/CurriculumClientPage";
// import AdmissionsPage from "../pages/admissions";
// import TestimonialsPage from "../pages/TestimonialsPage";
// import ContactPage from "../pages/contact";
// import AppFooter from "../components/Footer";
// import Pricing from "../pages/Pricing";
// import NavBar from "../components/NavBar";
// import StudentProjects from "../pages/StudentProjects";

// import { client } from "../lib/sanity";
// import { allLevelsQuery } from "../lib/queries";

// import "./globals.css";

// export const metadata = {
//   title: "Tech Talk Hub | Learn Coding & Build the Future",
//   description:
//     "Live, personalized coding classes helping children aged 5–17 build practical technology skills, confidence and creativity.",

//   openGraph: {
//     title: "Tech Talk Hub | Learn Coding & Build the Future",
//     description:
//       "Live, personalized coding classes for children aged 5–17.",
//     images: [
//       {
//         url: "/home-hero.png",
//         width: 1448,
//         height: 1086,
//         alt: "Young African learner coding with Tech Talk Hub",
//       },
//     ],
//   },
// };

// export default async function HomePage() {
//   let levels = [];

//   try {
//     levels = await client.fetch(allLevelsQuery);
//   } catch (error) {
//     console.error(
//       "Failed to fetch levels from Sanity:",
//       error
//     );
//   }

//   return (
//     <main className="min-h-screen overflow-hidden bg-background">
//       <NavBar />

//       {/* Hero */}
//       <section
//         id="hero"
//         className="relative pt-20"
//       >
//         <HeroBackground>
//           <div className="relative mx-auto max-w-7xl px-6 lg:min-h-[560px] lg:px-12 xl:px-16">
//             {/* Hero text */}
//             <div className="relative z-20 flex items-center py-12 lg:min-h-[560px] lg:w-[55%] lg:py-10">
//               <HeroContent />
//             </div>

//             {/* Mobile image */}
//             <div className="relative mx-auto -mt-4 h-[300px] w-full max-w-xl overflow-hidden sm:h-[380px] lg:hidden">
//               <Image
//                 src="/home-hero.png"
//                 alt="Young African learner coding with Tech Talk Hub"
//                 fill
//                 priority
//                 sizes="100vw"
//                 className="object-contain object-center"
//               />

//               <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F8F5FF]/30 via-transparent to-[#F1E8FF]/60" />

//               <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-[#FF3F7F]/5" />
//             </div>

//             {/* Desktop image */}
//             <div
//               className="pointer-events-none absolute inset-y-0 -right-4 hidden w-[56%] lg:block xl:-right-8"
//               style={{
//                 maskImage:
//                   "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.38) 12%, black 28%, black 96%)",

//                 WebkitMaskImage:
//                   "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.38) 12%, black 28%, black 96%)",
//               }}
//             >
//               <Image
//                 src="/home-hero.png"
//                 alt="Young African learner coding with Tech Talk Hub"
//                 fill
//                 priority
//                 sizes="56vw"
//                 className="object-contain object-right-bottom"
//               />

//               {/* Soft left blend */}
//               <div className="absolute inset-0 bg-gradient-to-r from-[#F8F5FF]/75 via-transparent to-transparent" />

//               {/* Soft bottom blend */}
//               <div className="absolute inset-0 bg-gradient-to-t from-[#F1E8FF]/40 via-transparent to-transparent" />

//               {/* Gentle brand tint */}
//               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#FF3F7F]/5" />
//             </div>
//           </div>
//         </HeroBackground>
//       </section>

//       {/* Technology slider */}
//       <section className="relative z-20 bg-white py-7">
//         <div className="mx-auto max-w-7xl px-6">
//           <SliderWidget />
//         </div>
//       </section>

//       {/* Programs */}
//       <section
//         id="programs"
//         className="bg-slate-50"
//       >
//         <CurriculumClientPage
//           initialLevels={levels}
//         />
//       </section>

//       {/* Pricing */}
//       <section
//         id="pricing"
//         className="bg-background py-10"
//       >
//         <div className="mx-auto max-w-7xl px-6">
//           <Pricing />
//         </div>
//       </section>

//       {/* About */}
//       <section
//         id="about"
//         className="bg-white py-10"
//       >
//         <div className="mx-auto max-w-7xl px-6">
//           <AboutHighlight />
//         </div>
//       </section>

//       {/* Admissions */}
//       <section
//         id="admissions"
//         className="bg-background py-10"
//       >
//         <div className="mx-auto max-w-7xl px-6">
//           <AdmissionsPage />
//         </div>
//       </section>

//       {/* Student projects */}
//       <section
//         id="projects"
//         className="bg-white py-10"
//       >
//         <div className="mx-auto max-w-7xl px-6">
//           <StudentProjects />
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section
//         id="testimonials"
//         className="bg-white py-10"
//       >
//         <div className="mx-auto max-w-7xl px-6">
//           <TestimonialsPage />
//         </div>
//       </section>

//       {/* Contact */}
//       <section
//         id="contact"
//         className="bg-background py-10"
//       >
//         <div className="mx-auto max-w-7xl px-6">
//           <ContactPage />
//         </div>
//       </section>

//       <AppFooter />
//     </main>
//   );
// }
// // import Image from "next/image";

// // import HeroBackground from "../components/HeroBackground";
// // import HeroContent from "../components/HeroContent";
// // import SliderWidget from "../components/Slider";
// // import AboutHighlight from "../components/AboutHighlight";
// // import CurriculumClientPage from "../components/CurriculumClientPage";
// // import AdmissionsPage from "../pages/admissions";
// // import TestimonialsPage from "../pages/TestimonialsPage";
// // import ContactPage from "../pages/contact";
// // import AppFooter from "../components/Footer";
// // import Pricing from "../pages/Pricing";
// // import NavBar from "../components/NavBar";
// // import StudentProjects from "../pages/StudentProjects";

// // import { client } from "../lib/sanity";
// // import { allLevelsQuery } from "../lib/queries";

// // import "./globals.css";

// // export const metadata = {
// //   title: "Tech Talk Hub | Learn Coding & Build the Future",

// //   description:
// //     "Live, personalized coding classes helping children aged 5–17 build practical technology skills, confidence and creativity.",

// //   openGraph: {
// //     title: "Tech Talk Hub | Learn Coding & Build the Future",

// //     description:
// //       "Live, personalized coding classes for children aged 5–17.",

// //     images: [
// //       {
// //         url: "/home-hero.png",
// //         width: 1448,
// //         height: 1086,
// //         alt: "Young African learner coding with Tech Talk Hub",
// //       },
// //     ],
// //   },
// // };

// // export default async function HomePage() {
// //   let levels = [];

// //   try {
// //     levels = await client.fetch(allLevelsQuery);
// //   } catch (error) {
// //     console.error(
// //       "Failed to fetch levels from Sanity:",
// //       error
// //     );
// //   }

// //   return (
// //     <main className="min-h-screen overflow-hidden bg-background">
// //       <NavBar />

// //       {/* Hero */}
// //       <section
// //         id="hero"
// //         className="relative"
// //       >
// //         <HeroBackground>
// //           <div className="relative mx-auto max-w-7xl px-6 lg:min-h-[520px] lg:px-12 xl:px-16">
// //             {/* Hero content */}
// //             <div className="relative z-20 flex items-center py-9 lg:min-h-[520px] lg:w-[57%] lg:py-8">
// //               <HeroContent />
// //             </div>

// //             {/* Mobile image */}
// //             <div className="relative mx-auto -mt-3 h-[280px] w-full max-w-xl overflow-hidden sm:h-[360px] lg:hidden">
// //               <Image
// //                 src="/home-hero.png"
// //                 alt="Young African learner coding with Tech Talk Hub"
// //                 fill
// //                 priority
// //                 sizes="100vw"
// //                 className="object-contain object-center"
// //               />

// //               <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F8F5FF]/20 via-transparent to-[#F1E8FF]/55" />

// //               <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-[#FF3F7F]/5" />
// //             </div>

// //             {/* Desktop blended image */}
// //             <div
// //               className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block"
// //               style={{
// //                 maskImage:
// //                   "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 14%, black 32%, black 96%)",

// //                 WebkitMaskImage:
// //                   "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 14%, black 32%, black 96%)",
// //               }}
// //             >
// //               <Image
// //                 src="/home-hero.png"
// //                 alt="Young African learner coding with Tech Talk Hub"
// //                 fill
// //                 priority
// //                 sizes="48vw"
// //                 className="object-contain object-right-bottom"
// //               />

// //               <div className="absolute inset-0 bg-gradient-to-r from-[#F8F5FF]/65 via-transparent to-transparent" />

// //               <div className="absolute inset-0 bg-gradient-to-t from-[#F1E8FF]/35 via-transparent to-transparent" />

// //               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#FF3F7F]/5" />
// //             </div>
// //           </div>
// //         </HeroBackground>
// //       </section>

// //       {/* Technology slider */}
// //       <section className="relative z-20 bg-white py-7">
// //         <div className="mx-auto max-w-7xl px-6">
// //           <SliderWidget />
// //         </div>
// //       </section>

// //       {/* Programs */}
// //       <section
// //         id="programs"
// //         className="bg-slate-50"
// //       >
// //         <CurriculumClientPage
// //           initialLevels={levels}
// //         />
// //       </section>

// //       {/* Pricing */}
// //       <section
// //         id="pricing"
// //         className="bg-background py-10"
// //       >
// //         <div className="mx-auto max-w-7xl px-6">
// //           <Pricing />
// //         </div>
// //       </section>

// //       {/* About */}
// //       <section
// //         id="about"
// //         className="bg-white py-10"
// //       >
// //         <div className="mx-auto max-w-7xl px-6">
// //           <AboutHighlight />
// //         </div>
// //       </section>

// //       {/* Admissions */}
// //       <section
// //         id="admissions"
// //         className="bg-background py-10"
// //       >
// //         <div className="mx-auto max-w-7xl px-6">
// //           <AdmissionsPage />
// //         </div>
// //       </section>

// //       {/* Student projects */}
// //       <section
// //         id="projects"
// //         className="bg-white py-10"
// //       >
// //         <div className="mx-auto max-w-7xl px-6">
// //           <StudentProjects />
// //         </div>
// //       </section>

// //       {/* Testimonials */}
// //       <section
// //         id="testimonials"
// //         className="bg-white py-10"
// //       >
// //         <div className="mx-auto max-w-7xl px-6">
// //           <TestimonialsPage />
// //         </div>
// //       </section>

// //       {/* Contact */}
// //       <section
// //         id="contact"
// //         className="bg-background py-10"
// //       >
// //         <div className="mx-auto max-w-7xl px-6">
// //           <ContactPage />
// //         </div>
// //       </section>

// //       <AppFooter />
// //     </main>
// //   );
// // }

// // // // import Image from "next/image";
// // // // import HeroBackground from "../components/HeroBackground";
// // // // import SliderWidget from "../components/Slider";
// // // // import AboutHighlight from "../components/AboutHighlight";
// // // // import CurriculumClientPage from "../components/CurriculumClientPage";
// // // // import AdmissionsPage from "../pages/admissions";
// // // // import TestimonialsPage from "../pages/TestimonialsPage";
// // // // import ContactPage from "../pages/contact";
// // // // import AppFooter from "../components/Footer";
// // // // import Pricing from "../pages/Pricing";
// // // // import HeroContent from "../components/HeroContent";
// // // // import NavBar from "../components/NavBar";
// // // // import StudentProjects from "../pages/StudentProjects";
// // // // import "./globals.css";
// // // // import { client } from "../lib/sanity";
// // // // import { allLevelsQuery } from "../lib/queries";

// // // // // SEO Metadata
// // // // export const metadata = {
// // // //   title: "Tech Talk Hub | Learn Coding & Build the Future",
// // // //   description:
// // // //     "Empowering the next generation with practical coding skills, mentorship, and world-class tech education.",
// // // //   openGraph: {
// // // //     title: "Tech Talk Hub | Learn Coding",
// // // //     description:
// // // //       "Empowering the next generation with practical coding skills.",
// // // //     images: [{ url: "/hero.png" }],
// // // //   },
// // // // };

// // // // export default async function HomePage() {
// // // //   let levels = [];

// // // //   try {
// // // //     levels = await client.fetch(allLevelsQuery);
// // // //   } catch (error) {
// // // //     console.error("Failed to fetch levels from Sanity:", error);
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen bg-background">
// // // //       <NavBar />

// // // //       {/* =========================
// // // //           HERO SECTION
// // // //       ========================== */}
// // // //      {/* Hero Section */}
// // // // <section id="hero" className="relative pt-20">
// // // //   <HeroBackground>
// // // //     <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-10 md:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-10 xl:gap-16">

// // // //       {/* Hero Content */}
// // // //       <div className="w-full">
// // // //         <HeroContent />
// // // //       </div>

// // // //       {/* Hero Image */}
// // // //       <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl shadow-xl lg:max-w-none">
// // // //         <Image
// // // //           src="/hero.png"
// // // //           alt="Child learning coding with Tech Talk Hub"
// // // //           fill
// // // //           priority
// // // //           sizes="(max-width: 1023px) 100vw, 42vw"
// // // //           className="object-cover"
// // // //         />
// // // //       </div>

// // // //     </div>
// // // //   </HeroBackground>
// // // // </section>
// // // //       {/* =========================
// // // //           TECHNOLOGY SLIDER
// // // //       ========================== */}
// // // //       <section className="relative bg-white py-8">
// // // //         <div className="mx-auto max-w-7xl px-6">
// // // //           <SliderWidget />
// // // //         </div>
// // // //       </section>

// // // //       {/* =========================
// // // //           PROGRAMS
// // // //       ========================== */}
// // // //       <section id="programs" className="bg-slate-50">
// // // //         <CurriculumClientPage initialLevels={levels} />
// // // //       </section>

// // // //       {/* =========================
// // // //           PRICING
// // // //       ========================== */}
// // // //       <section id="pricing" className="bg-background py-10">
// // // //         <div className="mx-auto max-w-7xl px-6">
// // // //           <Pricing />
// // // //         </div>
// // // //       </section>

// // // //       {/* =========================
// // // //           ABOUT
// // // //       ========================== */}
// // // //       <section id="about" className="bg-white py-10">
// // // //         <div className="mx-auto max-w-7xl px-2">
// // // //           <AboutHighlight />
// // // //         </div>
// // // //       </section>

// // // //       {/* =========================
// // // //           ADMISSIONS
// // // //       ========================== */}
// // // //       <section id="admissions" className="bg-background py-10">
// // // //         <div className="mx-auto max-w-7xl px-6">
// // // //           <AdmissionsPage />
// // // //         </div>
// // // //       </section>

// // // //       {/* =========================
// // // //           STUDENT PROJECTS
// // // //       ========================== */}
// // // //       <section id="projects" className="bg-white py-10">
// // // //         <div className="mx-auto max-w-7xl px-6">
// // // //           <StudentProjects />
// // // //         </div>
// // // //       </section>

// // // //       {/* =========================
// // // //           TESTIMONIALS
// // // //       ========================== */}
// // // //       <section id="testimonials" className="bg-white py-10">
// // // //         <div className="mx-auto max-w-7xl px-6">
// // // //           <TestimonialsPage />
// // // //         </div>
// // // //       </section>

// // // //       {/* =========================
// // // //           CONTACT
// // // //       ========================== */}
// // // //       <section id="contact" className="bg-background py-10">
// // // //         <div className="mx-auto max-w-7xl px-6">
// // // //           <ContactPage />
// // // //         </div>
// // // //       </section>

// // // //       {/* Footer */}
// // // //       <AppFooter />
// // // //     </div>
// // // //   );
// // // // }
// // // import Image from "next/image";
// // // import HeroBackground from "../components/HeroBackground";
// // // import SliderWidget from "../components/Slider";
// // // import AboutHighlight from "../components/AboutHighlight";
// // // import CurriculumClientPage from "../components/CurriculumClientPage";
// // // // import Shop from "@/components/Shop"; 
// // // import AdmissionsPage from "../pages/admissions";
// // // import TestimonialsPage from "../pages/TestimonialsPage";
// // // import ContactPage from "../pages/contact";
// // // import AppFooter from "../components/Footer";
// // // import Pricing from "../pages/Pricing";
// // // import HeroContent from "../components/HeroContent";
// // // import NavBar from "../components/NavBar";
// // // import StudentProjects from "../pages/StudentProjects";
// // // import "./globals.css";
// // // import { client } from "../lib/sanity";
// // // import { allLevelsQuery } from "../lib/queries";
// // // import FacultyDirectoryPage from "../components/FacultyDirectory";


// // // // Meta tags for SEO - Next.js reads this automatically on the server
// // // export const metadata = {
// // //   title: "Tech Talk Hub | Learn Coding & Build the Future",
// // //   description: "Empowering the next generation with practical coding skills, mentorship, and world-class tech education.",
// // //   openGraph: {
// // //     title: "Tech Talk Hub | Learn Coding",
// // //     description: "Empowering the next generation with practical coding skills.",
// // //     images: [{ url: "/hero.png" }],
// // //   },
// // // };

// // // export default async function HomePage() {


// // //   // const levels = await client.fetch(allLevelsQuery);
// // //   let levels = [];
// // //   try {
// // //     levels = await client.fetch(allLevelsQuery);
// // //   } catch (error) {
// // //     console.error("Failed to fetch levels from Sanity:", error);
// // //   }
// // //   return (
// // //     <div className="bg-background min-h-screen">
// // //       <NavBar />
      
// // //       {/* Hero Section 
// // //       // <section id="hero" className="relative min-h-screen flex items-center">*/}
// // //       <section id="hero" className="relative pt-17 min-h-screen flex items-center">
// // //         <HeroBackground>
// // //           <div className="px-6 md:px-24 py-16 flex flex-col md:flex-row items-center md:justify-between h-full space-y-8 md:space-y-0">
// // //             <HeroContent />
            
// // //             {/* Integrated foreground image using Next.js Image Optimization */}
// // //             <div className="relative w-82 md:w-180 h-auto aspect-[4/3] rounded-xl shadow-card overflow-hidden">
// // //               <Image
// // //                 src="/hero.png" // Put this image inside your website's 'public/' folder
// // //                 alt="Tech Talk Hub Hero"
// // //                 fill
// // //                 priority // Tells Next.js to load this instantly for better LCP scores
// // //                 className="object-cover"
// // //               />
// // //             </div>
// // //           </div>
// // //         </HeroBackground>
// // //       </section>

// // //       {/* Slider Section */}
// // //       <section className="bg-white relative -mt-12">
// // //         <div className="max-w-7xl mx-auto px-6">
// // //           <SliderWidget />
// // //         </div>
// // //       </section>

     
// // //     <section id="programs" className="bg-slate-50">
// // //   <CurriculumClientPage initialLevels={levels} />
// // // </section>



// // //       {/* Pricing Section */}
// // //       <section id="pricing" className="py-10 bg-background">
// // //         <div className="max-w-7xl mx-auto px-6">
// // //           <Pricing />
// // //         </div>
// // //       </section>

// // //       {/* About Section */}
// // //       <section id="about" className="py-10 bg-white">
// // //         <div className="max-w-7xl mx-auto px-2">
// // //           <AboutHighlight />
// // //         </div>
// // //       </section>

// // //       {/* Faculty Section */}
// // //       {/*  <section id="faculty" className="py-10 bg-white">
// // //         <div className="max-w-7xl mx-auto px-6">
// // //           <FacultyDirectoryPage />

// // //         </div>
// // //       </section> */}

// // //       {/* Admissions Section */}
// // //       <section id="admissions" className="py-10 bg-background">
// // //         <div className="max-w-7xl mx-auto px-6">
// // //           <AdmissionsPage />
// // //         </div>
// // //       </section>

// // //       {/* Projects Section */}
// // //       <section id="projects" className="py-10 bg-white">
// // //         <div className="max-w-7xl mx-auto px-6">
// // //           <StudentProjects />
// // //         </div>
// // //       </section>

// // //       {/* Testimonials Section */}
// // //       <section id="testimonials" className="py-10 bg-white">
// // //         <div className="max-w-7xl mx-auto px-6">
// // //           <TestimonialsPage />
// // //         </div>
// // //       </section>

// // //       {/* Contact Section */}
// // //       <section id="contact" className="py-10 bg-background">
// // //         <div className="max-w-7xl mx-auto px-6">
// // //           <ContactPage />
// // //         </div>
// // //       </section>

// // //       <AppFooter />
// // //     </div>
// // //   );
// // // }