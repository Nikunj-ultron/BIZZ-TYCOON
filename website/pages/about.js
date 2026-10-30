import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
            About GASTECT
          </h1>
          <p className="text-slate-400 text-sm">Bizz Tycoons Competition (Dec 15, 2026)</p>
        </div>
        <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition">
          Back to Dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-8 text-slate-300">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">Problem Statement</h2>
          <p className="leading-relaxed">
            Gas leaks and residential fires cause thousands of tragic fatalities and immense property damage annually, often due to delayed detection, lack of remote alerts, and prohibitively expensive commercial safety systems (₹5,000–₹50,000).
          </p>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">Our Solution</h2>
          <p className="leading-relaxed">
            GASTECT is an ultra-affordable (₹1,200 BOM), dual-hazard IoT safety system. It combines Arduino Uno hardware, MQ2 gas sensors, IR flame detection, PIR motion awareness, and HC-05 Bluetooth telemetry with a Python WebSocket bridge and a lightning-fast Next.js dashboard.
          </p>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">Key Features</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>Real-time Gas Concentration (MQ2 PPM) & Flame IR monitoring</li>
            <li>Instant Visual & Audible alerts with 7-Segment display</li>
            <li>SQLite historical trend logging for analytics</li>
            <li>Touch sensor alarm silencing & PIR motion-aware safety</li>
            <li>One-command setup and execution (`./scripts/setup.sh` & `./scripts/start.sh`)</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
