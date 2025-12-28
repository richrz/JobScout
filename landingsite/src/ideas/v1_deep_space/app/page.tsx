import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative bg-cyber-grid">
      {/* Abstract Grid/Glow Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-electric-green/5 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Nav Placeholder (Minimal) */}
      <nav className="w-full flex justify-between items-center px-6 py-6 z-50 border-b border-white/5">
        <div className="font-mono text-sm tracking-widest text-electric-green uppercase">
          JobScout_Prism_v1.0
        </div>
        <div className="flex gap-6 text-xs font-mono text-zinc-400">
          <span>[ LOGIN ]</span>
          <span>[ STATUS: ONLINE ]</span>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">

        {/* Left: Typography / Signal */}
        <div className="lg:col-span-7 flex flex-col justify-center px-6 lg:px-20 py-20 z-10">
          <div className="mb-6 font-mono text-electric-green text-xs tracking-[0.2em] uppercase">
            &gt; System_Ready: Automated_Career_Ops
          </div>

          <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-white mb-8">
            MASSIVELY<br />
            SCALE.<br />
            <span className="text-zinc-500">UNMISTAKABLY</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">YOU.</span>
          </h1>

          <p className="max-w-md text-zinc-400 text-lg mb-12 border-l-2 border-electric-green pl-6">
            Stop being steered. Start steering.
            <br />
            The curated intelligence layer for AI careers.
          </p>

          <button className="group relative inline-flex items-center justify-start overflow-hidden bg-electric-green px-8 py-4 w-fit transition-all hover:bg-white">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative font-mono font-bold text-black tracking-wider group-hover:text-black transition-colors">
              [ INITIALIZE_SEARCH ]
            </span>
          </button>
        </div>

        {/* Right: The Scaled "Resume" Interface */}
        <div className="lg:col-span-5 relative bg-zinc-950/50 border-l border-white/5 flex items-center justify-center overflow-hidden">

          {/* Decorative Data Lines */}
          <div className="absolute inset-x-0 top-1/4 h-[1px] bg-gradient-to-r from-transparent via-electric-green/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-1/4 h-[1px] bg-gradient-to-r from-transparent via-electric-green/20 to-transparent" />

          {/* The "Card" - Scaled Up & Stabilized */}
          <div className="relative w-96 h-[500px] border border-electric-green/30 bg-black/90 backdrop-blur-md p-8 shadow-2xl shadow-electric-green/5 group cursor-default hover:border-electric-green/60 transition-colors">

            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-electric-green" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-electric-green" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-electric-green" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-electric-green" />

            {/* Header */}
            <div className="flex justify-between items-end border-b border-electric-green/20 pb-4 mb-6">
              <div className="font-mono text-xs text-electric-green">ID: CANDIDATE_0X9</div>
              <div className="font-mono text-[10px] text-zinc-500">STATUS: OPTIMIZED</div>
            </div>

            {/* Document Body Visualization */}
            <div className="space-y-4">
              {/* Name Block */}
              <div className="h-4 w-1/3 bg-zinc-800" />

              {/* Summary Block (The "Magic" Part) */}
              <div className="space-y-2 pt-4">
                <div className="h-2 w-full bg-zinc-800 overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 bg-electric-green w-3/4 animate-[pulse_2s_infinite]" />
                </div>
                <div className="h-2 w-full bg-zinc-800" />
                <div className="h-2 w-2/3 bg-zinc-800" />
              </div>

              {/* Skills Block */}
              <div className="pt-6 flex gap-2 flex-wrap">
                <div className="h-6 w-16 bg-electric-green/10 border border-electric-green/20 rounded-sm" />
                <div className="h-6 w-20 bg-electric-green/10 border border-electric-green/20 rounded-sm" />
                <div className="h-6 w-12 bg-electric-green/10 border border-electric-green/20 rounded-sm" />
              </div>
            </div>

            {/* Footer / Match Score */}
            <div className="absolute bottom-8 left-8 right-8">
              <div className="font-mono text-xs text-zinc-500 mb-2">&gt; AI_RELEVANCE_SCORE</div>
              <div className="text-4xl font-bold text-white tracking-tighter">
                98.2<span className="text-electric-green">%</span>
              </div>
            </div>

            {/* Animated Arrow */}
            <div className="absolute bottom-4 right-4 text-electric-green animate-bounce">
              ↓
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
