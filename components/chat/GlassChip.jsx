export default function GlassChip({ icon: Icon, label }) {
  return (
    <button className="bg-[#1e222a]/70 backdrop-blur-xl border border-[#2f333d] px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium text-gray-200 hover:bg-[#252932] transition-all">
      <Icon size={14} className="opacity-80" />
      {label}
    </button>
  );
}
