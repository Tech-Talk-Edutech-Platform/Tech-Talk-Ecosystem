"use client";

import Link from "next/link";

export default function HeroContent() {
  return (
    <div className="md:max-w-lg text-center md:text-left">
      <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
        Unlock your child’s potential with{" "}
        <span className="text-secondary">expert-led</span> coding classes
      </h1>
      <p className="text-text text-lg mb-2">
        Live, personalized online sessions for kids aged 5–17:
      </p>
      <ul className="text-text text-base mb-6 space-y-2 list-inside text-left inline-block md:block">
        <li>💻 Learn from the comfort of home</li>
        <li>🎓 1-on-1 sessions with expert mentors</li>
        <li>🤖 AI-powered, adaptive learning paths</li>
        <li>📅 Flexible scheduling from anywhere</li>
      </ul>
      <div>
        <Link href="/book-class">
          <button className="bg-secondary text-background px-6 py-3 rounded-xl font-bold shadow-btn hover:bg-secondary-dark transition">
            Book a Free Trial
          </button>
        </Link>
      </div>
    </div>
  );
}