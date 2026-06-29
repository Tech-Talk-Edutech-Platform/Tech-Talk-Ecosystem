export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-10">
      <span className="text-sm font-bold tracking-wide text-slate-400 animate-pulse">
        {label}
      </span>
    </div>
  );
}
