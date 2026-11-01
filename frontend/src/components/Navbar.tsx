import React from 'react';
import { 
  Building2, 
  MapPin, 
  BarChart3, 
  RotateCw, 
  Search, 
  Activity,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'citizen' | 'dashboard' | 'track';
  setCurrentTab: (tab: 'citizen' | 'dashboard' | 'track') => void;
  activeCount: number;
  breachedCount: number;
  onReseed: () => void;
  isReseeding: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeCount,
  breachedCount,
  onReseed,
  isReseeding,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => setCurrentTab('citizen')}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-600 text-white shadow-md shadow-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                  CivicPulse <span className="text-sky-600 dark:text-sky-400">AI</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                  Smart City
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Grievance & Civic Redressal System
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentTab('citizen')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'citizen'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => setCurrentTab('track')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'track'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Ticket</span>
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Control Center</span>
              {breachedCount > 0 ? (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                  {breachedCount}
                </span>
              ) : activeCount > 0 ? (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {activeCount}
                </span>
              ) : null}
            </button>
          </nav>

          {/* Right Action: Light/Dark Toggle & Reseed */}
          <div className="flex items-center space-x-2">
            
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition active:scale-95"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Heartbeat Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="font-medium">Escalation: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">60s</strong></span>
            </div>

            {/* Demo Reseed */}
            <button
              onClick={onReseed}
              disabled={isReseeding}
              title="Reset sample data"
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${isReseeding ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
