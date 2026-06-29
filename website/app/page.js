import Image from "next/image";
import HeroBackground from "../components/HeroBackground";
import SliderWidget from "../components/Slider";
import AboutHighlight from "../components/AboutHighlight";
import CurriculumClientPage from "../components/CurriculumClientPage";

import AdmissionsPage from "../pages/admissions";
import TestimonialsPage from "../pages/TestimonialsPage";
import ContactPage from "../pages/contact";
import AppFooter from "../components/Footer";
import Pricing from "../pages/Pricing";
import HeroContent from "../components/HeroContent";
import NavBar from "../components/NavBar";
import StudentProjects from "../pages/StudentProjects";
import "./globals.css";
import { client } from "../lib/sanity";
import { allLevelsQuery } from "../lib/queries";
import FacultyDirectoryPage from "../components/FacultyDirectory";

// Meta tags for SEO - Next.js reads this automatically on the server
export const metadata = {
  title: "Tech Talk Hub | Learn Coding & Build the Future",
  description: "Empowering the next generation with practical coding skills, mentorship, and world-class tech education.",
  openGraph: {
    title: "Tech Talk Hub | Learn Coding",
    description: "Empowering the next generation with practical coding skills.",
    images: [{ url: "/hero.png" }],
  },
};

export default async function HomePage() {
  const levels = await client.fetch(allLevelsQuery);
  return (
    <div className="bg-background min-h-screen">
      <NavBar />
      
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center">
        <HeroBackground>
          <div className="px-6 md:px-24 py-16 flex flex-col md:flex-row items-center md:justify-between h-full space-y-8 md:space-y-0">
            <HeroContent />
            
            {/* Integrated foreground image using Next.js Image Optimization */}
            <div className="relative w-82 md:w-106 h-auto aspect-[4/3] rounded-xl shadow-card overflow-hidden">
              <Image
                src="/hero.png" // Put this image inside your website's 'public/' folder
                alt="Tech Talk Hub Hero"
                fill
                priority // Tells Next.js to load this instantly for better LCP scores
                className="object-cover"
              />
            </div>
          </div>
        </HeroBackground>
      </section>

      {/* Slider Section */}
      <section className="bg-white relative -mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <SliderWidget />
        </div>
      </section>

     
      <section id="programs" className="bg-slate-50">
  <CurriculumClientPage initialLevels={levels} />
</section>

      {/* Pricing Section */}
      <section id="pricing" className="py-10 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <Pricing />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-2">
          <AboutHighlight />
        </div>
      </section>

      {/* Faculty Section */}
      <section id="faculty" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FacultyDirectoryPage />

        </div>
      </section>

      {/* Admissions Section */}
      <section id="admissions" className="py-10 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <AdmissionsPage />
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <StudentProjects />
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <TestimonialsPage />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-10 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <ContactPage />
        </div>
      </section>

      <AppFooter />
    </div>
  );
}