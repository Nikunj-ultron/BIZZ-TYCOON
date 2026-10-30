import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusIndicator } from '../components/StatusIndicator';
import { Display } from '../components/Display';
import { SevenSegment } from '../components/SevenSegment';
import { HistoryGraph } from '../components/HistoryGraph';
import { Controls } from '../components/Controls';

export default function Home() {
  const [data, setData] = useState({
    ppm: 42,
    flame: 85,
    ldr: 650,
    motion: false,
    touch: false,
    battery: 95,
    status: 'SAFE'
  });
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        setData(json);
        setHistory(prev => [...prev.slice(-30), { timestamp: new Date().toLocaleTimeString(), ppm: json.ppm }]);
      } catch (e) {
        console.error('Parse error', e);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
            GASTECT Dashboard
          </h1>
          <p className="text-slate-400 text-sm">IoT Gas Leak & Fire Detection System | Bizz Tycoons</p>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/about" className="text-sm font-medium text-slate-300 hover:text-white transition">
            About Project
          </Link>
          <div className="flex items-center space-x-3">
            <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">{connected ? 'Connected to Bridge' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <StatusIndicator status={data.status} />
        </div>

        <Display label="Gas Concentration (MQ2)" value={data.ppm} unit="PPM" color={data.ppm >= 500 ? 'text-red-500' : data.ppm >= 200 ? 'text-yellow-500' : 'text-green-500'} />
        <Display label="Flame Sensor" value={data.flame} unit="IR" color={data.flame >= 400 ? 'text-red-500' : 'text-slate-200'} />
        <Display label="Battery Level" value={data.battery} unit="%" color="text-blue-400" />

        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <SevenSegment digit={data.ppm} />
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-center items-center">
            <span className="text-slate-400 text-sm mb-2">PIR Motion Status</span>
            <span className={`text-xl font-bold ${data.motion ? 'text-red-400' : 'text-green-400'}`}>
              {data.motion ? 'Motion Detected' : 'Clear'}
            </span>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-center items-center">
            <span className="text-slate-400 text-sm mb-2">Touch Sensor (Alarm Silence)</span>
            <span className={`text-xl font-bold ${data.touch ? 'text-yellow-400' : 'text-slate-400'}`}>
              {data.touch ? 'Touched / Silenced' : 'Normal'}
            </span>
          </div>
        </div>

        <div className="md:col-span-2">
          <HistoryGraph history={history} />
        </div>
        <div className="md:col-span-1">
          <Controls
            onTestAlarm={() => alert('Test alarm triggered!')}
            onReset={() => alert('System reset sent!')}
          />
        </div>
      </main>
    </div>
  );
}
