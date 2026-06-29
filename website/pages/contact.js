"use client";
import React from "react";
import { FaEnvelope, FaPhone, FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div
      className="relative bg-hero-gradient text-white py-16 px-6 md:px-20 overflow-hidden font-poppins"
      style={{
        backgroundImage: 'url("/hero.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
        {/* Left Form */}
        <div className="w-full md:w-2/3">
          <h2 className="text-4xl font-bold text-white mb-4">Get In Touch</h2>
          <p className="mb-10 text-white/90 max-w-md">
            Don’t be shy. Give us a call or drop us a line. Let’s make some magic together.
          </p>
          <form 
            onSubmit={(e) => e.preventDefault()} 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/30 backdrop-blur-md p-6 rounded-xl shadow-card text-text"
          >
            <input
              type="text"
              placeholder="First Name"
              className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="tel"
              placeholder="Phone"
              className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="email"
              placeholder="Email"
              className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="text"
              placeholder="Group or Company"
              className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white md:col-span-2 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <textarea
              placeholder="How can we help?"
              rows="4"
              className="p-3 border border-white/50 rounded-xl bg-white/20 placeholder:text-white/80 text-white md:col-span-2 focus:outline-none focus:ring-2 focus:ring-accent"
            ></textarea>
            <button type="submit" className="bg-secondary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition md:col-span-2 animate-smoothPulse">
              ✉ SUBMIT
            </button>
          </form>
        </div>

        {/* Right Info Panel */}
        <div className="w-full md:w-1/3 bg-primary/80 p-6 rounded-xl backdrop-blur-md shadow-card">
          <h3 className="text-2xl font-semibold text-white mb-6">Contact Info</h3>
          <div className="mb-4 flex items-center space-x-3 text-white">
            <FaPhone className="text-accent" />
            <span>+254 704 494 504</span>
          </div>
          <div className="mb-4 flex items-center space-x-3 text-white">
            <FaEnvelope className="text-accent" />
            <span>admin@techtalkhub.com</span>
          </div>
          <div className="flex space-x-4 mt-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent">
              <FaTwitter />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent">
              <FaYoutube />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}