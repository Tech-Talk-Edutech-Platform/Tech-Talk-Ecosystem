'use client';
import { useState } from 'react';
import CurriculumCard from './CurriculumCard';
import PlatformFeatureCard from './PlatformFeatureCard';
import LeadMagnetForm from './LeadMagnetForm';

export default function CurriculumClientPage({ initialLevels }) {
  const [showModal, setShowModal] = useState(false);
const [activeFeature, setActiveFeature] = useState(null);
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto pt-8 pb-12 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Our Coding Roadmap</h1>
        <p className="text-center text-slate-500 mb-10 text-sm max-w-2xl mx-auto italic">
          Our roadmap is a guide, not a cage. Every student begins with a placement assessment to ensure they start at the right challenge level.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {initialLevels.map((level) => (
            <CurriculumCard key={level._id} level={level} />
          ))}
        </div>
        
        <div className="text-center mt-12 flex flex-col md:flex-row justify-center gap-4">
          <a href="/book-class" className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition shadow-lg">
            Book a Placement Assessment
          </a>
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-white text-slate-800 px-8 py-3 rounded-full font-bold border-2 border-slate-200 hover:border-pink-600 transition shadow-sm"
          >
            Download Full Roadmap (PDF)
          </button>
        </div>
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl"
            >
              &times;
            </button>

            <h3 className="text-xl font-bold mb-4">Get the Roadmap PDF</h3>
            <LeadMagnetForm onClose={() => setShowModal(false)} />
            
            <button 
              onClick={() => setShowModal(false)} 
              className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

{activeFeature && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setActiveFeature(null)}>
    <div className="bg-white p-8 rounded-3xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
      <h2 className="text-2xl font-bold mb-4 capitalize">{activeFeature} Preview</h2>
      <div className="bg-slate-100 h-64 rounded-xl flex items-center justify-center mb-6">
        {/* Replace this div with your <Image /> or illustration */}
        <p className="text-slate-400">Illustration of {activeFeature} goes here</p>
      </div>
      <button onClick={() => setActiveFeature(null)} className="w-full bg-slate-900 text-white py-3 rounded-full font-bold">
        Close
      </button>
    </div>
  </div>
)}
      {/* The Tech Talk Advantage Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            The Tech Talk Advantage
            <div className="w-12 h-1 bg-pink-500 mx-auto mt-2 rounded-full"></div>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
          
          <PlatformFeatureCard 
  icon="📊" 
  title="Unified Dashboard" 
  description="A personalized hub for students to track progress." 
  onClick={() => setActiveFeature('dashboard')}
/>
            <PlatformFeatureCard 
              icon="📝" 
              title="Automated Exams" 
              description="Real-time assessments that provide instant feedback." 
              onClick={() => setActiveFeature('exams')}
            />
            <PlatformFeatureCard 
              icon="🏆" 
              title="Gamified Rewards" 
              description="Earn XP and climb the leaderboard."
              onClick={() => setActiveFeature('results')} 
            />
          </div>
        </div>
      </section>

    </div>
  );
}