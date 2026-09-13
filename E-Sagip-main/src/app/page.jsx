'use client';

import { ArrowRight, Cross, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-['IBM_Plex_Sans'] text-[#211B19]">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#ECE5DA]">
        <div className="max-w-6xl mx-auto px-6 h-[76px] flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-3" aria-label="E-Sagip home">
            <img src="/logo.png" alt="E-Sagip Mobile Emergency App" className="w-[150px] h-auto object-contain" />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/login')} className="text-sm font-semibold hidden sm:block hover:text-[#B3261E]">Sign in</button>
            <button onClick={() => router.push('/register')} className="text-sm font-semibold px-5 py-2.5 rounded-md bg-[#B3261E] text-white hover:bg-[#8A1913] transition-colors shadow-sm">Register</button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28">
        <div className="grid md:grid-cols-[38.2fr_61.8fr] gap-16 items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] uppercase text-[#B3261E] mb-4">Unified emergency dispatch</p>
            <h1 className="font-['Space_Grotesk'] font-semibold text-4xl sm:text-5xl leading-[1.1] tracking-tight">Every call, routed while seconds still matter.</h1>
            <p className="mt-6 text-[15px] leading-relaxed text-[#726A64] max-w-[34ch]">A live queue, a shared map, and one clear record of every incident, dynamically tailored for Fire, Medical, and Police dispatchers.</p>
            <div className="mt-8 flex gap-4">
              <button onClick={() => router.push('/register')} className="flex items-center gap-2 px-6 py-3 bg-[#DC2626] text-white rounded-lg font-medium hover:bg-[#B91C1C] transition-colors">Start Dispatching <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ECE5DA] shadow-2xl overflow-hidden bg-white">
            <div className="flex items-center gap-4 px-5 py-4 border-b border-[#ECE5DA] bg-gray-50/50">
              <img src="/logo.png" alt="E-Sagip" className="w-[135px] h-auto object-contain" />
              <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />Live</span>
            </div>
            <div className="p-5 grid gap-3 bg-[#FAF7F2]">
              <div className="flex items-start gap-4 rounded-xl border border-red-200 border-l-4 border-l-red-600 bg-white p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 text-red-600"><Flame className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold">Fire · Holy Spirit</div><div className="text-xs text-gray-500 mt-1">Reported 2 min ago</div></div>
                <span className="font-['IBM_Plex_Mono'] text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">0.6 km</span>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-green-200 border-l-4 border-l-green-600 bg-white p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 text-green-600"><Cross className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold">Medical · Commonwealth</div><div className="text-xs text-gray-500 mt-1">Responder en route</div></div>
                <span className="font-['IBM_Plex_Mono'] text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">1.2 km</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
