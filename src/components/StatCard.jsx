export default function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <Icon className="text-blue-400" size={22} />
      </div>

      <h2 className="mt-4 text-3xl font-bold text-white">{value}</h2>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}