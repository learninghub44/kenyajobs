// A compact colored hero banner used at the top of each listing page. Each page
// passes its own gradient so Remote/Entry Level/Graduate/Work-From-Home/Search
// each get a distinct visual identity instead of a plain white heading.
export default function PageHeader({ icon: Icon, title, subtitle, gradient, badge }) {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-7 px-6 sm:px-8 py-9 sm:py-11" style={{ background: gradient }}>
      <div className="absolute -top-12 -right-8 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 left-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />
      <div className="relative flex items-center gap-4">
        {Icon && (
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
            <Icon size={26} className="text-white" />
          </div>
        )}
        <div className="min-w-0">
          {badge && (
            <span className="inline-block text-xs font-semibold text-white/90 bg-white/15 border border-white/20 px-2.5 py-0.5 rounded-full mb-1.5">
              {badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 leading-tight">{title}</h1>
          {subtitle && <p className="text-white/80 text-sm sm:text-base">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
