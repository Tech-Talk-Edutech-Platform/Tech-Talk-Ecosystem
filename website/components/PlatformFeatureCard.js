export default function PlatformFeatureCard({ title, description, icon, onClick }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col items-center text-center border border-slate-100">
      <div className="text-5xl mb-6 bg-slate-50 p-4 rounded-full">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>
      
      <button 
        onClick={onClick}
        className="text-pink-600 font-semibold text-sm hover:underline hover:text-pink-700 transition"
      >
        View Sample &rarr;
      </button>
    </div>
  );
}