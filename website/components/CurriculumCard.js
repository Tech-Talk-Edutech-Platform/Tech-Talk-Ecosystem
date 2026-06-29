import { urlFor } from '../lib/sanity';

export default function CurriculumCard({ level }) {
  return (
    <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl p-8 border border-slate-100 flex flex-col hover:-translate-y-2 transition-all duration-300">
      
      {/* Icon Container - Adds visual pop */}
      <div className="w-16 h-16 mb-6 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-pink-50 transition-colors">
        {level.levelImage && (
          <img 
            src={urlFor(level.levelImage).width(128).height(128).fit('crop').url()} 
            alt={level.title}
            className="w-10 h-10 object-contain"
          />
        )}
      </div>
      
      {/* Metadata Tags - Using more distinct colors */}
      <div className="flex gap-2 mb-5">
        <span className="text-[10px] font-bold tracking-wider bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">
          {level.difficultyLevel || 'Beginner'}
        </span>
        <span className="text-[10px] font-bold tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase">
          {level.duration || 'Flexible'}
        </span>
      </div>

      <h3 className="text-2xl font-bold text-slate-900 mb-3">{level.title || 'Untitled Track'}</h3>
      <p className="text-slate-500 mb-8 flex-grow text-sm leading-relaxed">
        {level.description || 'No description provided.'}
      </p>
      
      {/* Key Skills Section - Polished look */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Key Skills</p>
        <div className="flex flex-wrap gap-2">
          {(level.skills || []).map((skill) => (
            <span key={skill} className="bg-slate-50 px-3 py-1 rounded-md text-[11px] font-medium text-slate-600 border border-slate-100">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {/* Footer Outcome */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <p className="text-[11px] font-bold text-pink-600 uppercase tracking-widest">
          {level.activityCount ? `⚡ ${level.activityCount}+ Hands-on Activities` : '✨ Customized Learning'}
        </p>
      </div>
    </div>
  );
}