"use client";
import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '../lib/sanity';
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";

export default function FacultyGrid({ team }) {
  return (
    <section className="grid gap-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
      {team.map((member) => (
        <FacultyCard key={member._id} member={member} />
      ))}
    </section>
  );
}

function FacultyCard({ member }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full">
      <div className="flex flex-col items-center flex-grow">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 mb-6 relative shrink-0">
          {member.image && (
            <Image src={urlFor(member.image).width(200).height(200).url()} alt={member.name} fill className="object-cover" />
          )}
        </div>
        <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
        <p className="text-pink-600 font-semibold mb-3">{member.title}</p>
        
        <div className="text-center">
          <p className={`text-slate-500 text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
            {member.bio}
          </p>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-pink-600 text-xs font-bold mt-2 hover:underline">
            {isExpanded ? 'Show less' : '...more'}
          </button>
        </div>
      </div>

      <div className="flex justify-center space-x-6 text-slate-400 mt-auto pt-4 border-t border-slate-50">
        {member.linkedin && <a href={member.linkedin} className="hover:text-pink-600"><FaLinkedin size={20} /></a>}
        {member.twitter && <a href={member.twitter} className="hover:text-pink-600"><FaTwitter size={20} /></a>}
        {member.github && <a href={member.github} className="hover:text-pink-600"><FaGithub size={20} /></a>}
      </div>
    </article>
  );
}