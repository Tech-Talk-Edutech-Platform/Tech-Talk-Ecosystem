"use client"; // Marked client side since it handles user clicks

import { useRouter } from "next/navigation";

export default function AboutHighlight() {
  const router = useRouter();

  return (
    <section className="py-8 px-3 md:px-20 text-center bg-white text-text font-poppins">
      <h2 className="text-3xl font-bold text-primary mb-4">Who We Are</h2>
      <p className="max-w-2xl mx-auto mb-6 text-lg">
        We’re an online edtech company empowering Africa’s next generation of digital creators through fun, hands-on coding lessons for kids and teens.
      </p>
      <button
        onClick={() => router.push("/about")}
        className="bg-secondary text-white px-6 py-3 rounded-xl shadow-btn hover:bg-primary transition"
      >
        Learn More →
      </button>
    </section>
  );
}