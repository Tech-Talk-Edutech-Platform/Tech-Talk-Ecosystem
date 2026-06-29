import React from "react";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";

const steps = [
  "📝 Fill out the online application form",
  "📅 Schedule a free trial class to meet our instructors",
  "📚 Get your personalized program recommendation",
  "🚀 Complete enrollment and start your coding adventure! 🎉",
];

const faqs = {
  "What is the age range for your programs?":
    "We offer programs for students from 6 to 18 years old.",
  "What if my child is a complete beginner?":
    "Our curriculum is designed to meet students at their current skill level, from absolute beginners to advanced coders.",
  "Do you offer online classes?":
    "Yes, all of our classes are held online, making them accessible to students everywhere.",
};

export default function AdmissionsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto font-poppins">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">
        Admissions
      </h2>

      {/* How to Apply Steps */}
      <div className="mb-12 text-center">
        <h3 className="text-xl font-bold mb-4 text-secondary">How to Apply</h3>
        <p className="mb-6 text-text">
          Our admissions process is simple and straightforward. Follow these steps to join the Tech Talk Hub family:
        </p>
        <ul className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <li
              key={index}
              className="flex items-center justify-start md:justify-center bg-white p-4 rounded-xl shadow-card border"
            >
              <FaCheckCircle className="text-accent mr-2 flex-shrink-0" />
              <span className="text-text text-left">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h3 className="text-xl font-bold mb-4 text-secondary">FAQs</h3>
        <div className="space-y-4">
          {Object.entries(faqs).map(([question, answer], index) => (
            <details
              key={index}
              className="group border rounded-xl bg-white p-4 shadow-card transition-all"
            >
              <summary className="flex justify-between items-center font-semibold text-primary cursor-pointer list-none">
                {question}
                <FiChevronDown className="transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-text">{answer}</p>
            </details>
          ))}
        </div>

        <div className="text-right mt-2">
          <Link href="/faq" className="text-sm text-accent hover:underline font-medium">
            See more FAQs →
          </Link>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="text-center">
        <Link href="/contact" className="inline-block bg-secondary text-white px-6 py-3 rounded-xl font-bold text-lg shadow-btn hover:opacity-90 transition animate-smoothPulse">
          Contact Our Admissions Team
        </Link>
      </div>
    </div>
  );
}