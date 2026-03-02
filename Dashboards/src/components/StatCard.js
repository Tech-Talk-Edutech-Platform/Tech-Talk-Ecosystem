export default function StatCard({ title, value, icon: Icon, color = "blue" }) {
  const colorMap = {
    blue: "border-blue-500 text-blue-500",
    green: "border-emerald-500 text-emerald-500",
    purple: "border-indigo-500 text-indigo-500",
    amber: "border-amber-500 text-amber-500"
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow group">
      
      {/* Title + Icon on same line */}
      <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        {Icon && (
          <Icon
            size={20}
            className={colorMap[color]?.split(" ")[1] || "text-blue-500"}
          />
        )}
        {title}
      </h4>

      <span className="text-4xl font-black text-slate-900 tracking-tight">
        {value}
      </span>

      <div
        className={`w-10 h-1.5 rounded-full mt-3 border-b-4 transition-all group-hover:w-16 ${
          colorMap[color]?.split(" ")[0] || "border-blue-500"
        }`}
      />
    </div>
  );
}
