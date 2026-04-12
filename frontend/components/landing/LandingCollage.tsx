'use client';

export default function LandingCollage() {
  return (
    <div className="relative hidden h-[520px] w-full max-w-[440px] lg:block">
      
      {/* Background glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100/40 via-transparent to-slate-100/40 blur-3xl" />

      {/* ===== MAIN CARD (CODE) ===== */}
      <div className="absolute left-4 top-12 z-40 w-[300px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.15)]">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 px-5 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
          <span className="text-xs font-mono text-slate-400">main.tsx</span>
        </div>

        {/* Code */}
        <div className="bg-slate-950 px-5 py-6 font-mono text-sm text-blue-400 space-y-1">
          <div>
            const <span className="text-slate-300">buildProject</span> = () =&gt; {'{'}
          </div>
          <div className="pl-4 text-emerald-400">// ship it 🚀</div>
          <div className="pl-4 text-slate-300">
            return <span className="text-yellow-300">&lt;Innovation /&gt;</span>
          </div>
          <div>{'}'}</div>
        </div>

        {/* Footer avatars */}
        <div className="flex items-center gap-2 px-5 py-3">
          <div className="flex -space-x-2">
            <div className="h-7 w-7 rounded-full bg-blue-400 border-2 border-white" />
            <div className="h-7 w-7 rounded-full bg-purple-400 border-2 border-white" />
            <div className="h-7 w-7 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <span className="text-xs text-slate-500">+12 contributors</span>
        </div>
      </div>

      {/* ===== INTERNSHIP CARD ===== */}
      <div className="absolute right-0 top-0 z-30 w-[260px] rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Internship
          </span>
          <span className="text-xs text-slate-400">2h ago</span>
        </div>

        <h3 className="text-sm font-bold text-slate-900">
          Frontend Developer Intern
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Tech Startup • Remote
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">React • Next.js</span>
          <button className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            Apply
          </button>
        </div>
      </div>

      {/* ===== DISCUSSION CARD ===== */}
      <div className="absolute bottom-10 left-6 z-20 w-[260px] rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
        
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900">
            Discussion
          </h4>
          <span className="text-xs text-blue-600">12 replies</span>
        </div>

        <p className="text-sm text-slate-700">
          Best React architecture for scalable apps?
        </p>

        <div className="mt-4 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-slate-300" />
          <div className="h-6 w-6 rounded-full bg-slate-400" />
          <div className="h-6 w-6 rounded-full bg-slate-500 flex items-center justify-center text-[10px] text-white">
            +5
          </div>
        </div>
      </div>

      {/* ===== FLOATING SNIPPET ===== */}
      <div className="absolute right-2 top-1/2 z-10 w-[140px] rounded-xl border border-slate-100 bg-white p-3 shadow-md">
        <p className="text-xs font-mono text-slate-500">
          const x = 42
        </p>
        <p className="text-xs font-mono text-blue-600">
          return magic()
        </p>
      </div>

    </div>
  );
}