import React from 'react';
import { 
  Building2, 
  ShieldAlert, 
  MapPin, 
  BarChart3, 
  RotateCw, 
  Search, 
  Activity,
  Layers
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'citizen' | 'dashboard' | 'track';
  setCurrentTab: (tab: 'citizen' | 'dashboard' | 'track') => void;
  activeCount: number;
  breachedCount: number;
  onReseed: () => void;
  isReseeding: boolean;
  onOpenTrackSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeCount,
  breachedCount,
  onReseed,
  isReseeding,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('citizen')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-lg shadow-sky-500/20">
              <Building2 className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent font-['Outfit']">
                  CivicPulse AI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                  PS-10
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Smart City Grievance & Resolution Platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('citizen')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                currentTab === 'citizen'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Citizen Portal</span>
            </button>

            <button
              onClick={() => setCurrentTab('track')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                currentTab === 'track'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Ticket</span>
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                currentTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">City Control Center</span>
              {breachedCount > 0 ? (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                  {breachedCount}
                </span>
              ) : activeCount > 0 ? (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-slate-700 text-slate-300">
                  {activeCount}
                </span>
              ) : null}
            </button>
          </nav>

          {/* Right Action / System Heartbeat */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Escalation Engine: <strong className="text-emerald-400 font-mono">60s Live</strong></span>
            </div>

            <button
              onClick={onReseed}
              disabled={isReseeding}
              title="Reset and reseed database with realistic mock incidents"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-sky-400 ${isReseeding ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Reset Demo Data</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
