import React from 'react';
import { 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Zap, 
  TrendingUp, 
  ShieldAlert,
  Flame
} from 'lucide-react';
import { AnalyticsOverview } from '../../types';

interface KpiBarProps {
  analytics: AnalyticsOverview | null;
  loading: boolean;
}

export const KpiBar: React.FC<KpiBarProps> = ({ analytics, loading }) => {
  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* KPI 1: Active Incidents */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Incidents
          </span>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black font-['Outfit'] text-white">
            {analytics.active_incidents}
          </span>
          <span className="text-xs text-slate-400">
            / {analytics.total_incidents} total
          </span>
        </div>
        <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{analytics.resolution_rate}% Resolved Overall</span>
        </div>
      </div>

      {/* KPI 2: SLA Breaches & Escalations */}
      <div className={`backdrop-blur-md border rounded-2xl p-4 sm:p-5 relative overflow-hidden transition ${
        analytics.sla_breached_count > 0 
          ? 'bg-rose-950/20 border-rose-800/80 shadow-lg shadow-rose-950/30' 
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
            SLA Breaches
          </span>
          <div className={`p-2 rounded-xl ${
            analytics.sla_breached_count > 0 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black font-['Outfit'] text-rose-400">
            {analytics.sla_breached_count}
          </span>
          {analytics.escalated_count > 0 && (
            <span className="text-xs font-bold text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded-full border border-rose-700">
              {analytics.escalated_count} Escalated
            </span>
          )}
        </div>
        <div className="mt-2 text-[11px] text-rose-400/80 font-medium">
          Autonomous Escalation active every 60s
        </div>
      </div>

      {/* KPI 3: Average Resolution Time */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Avg Resolution Speed
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black font-['Outfit'] text-white">
            {analytics.avg_resolution_time_hours}
          </span>
          <span className="text-xs font-semibold text-slate-400">hours</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Target city SLA baseline: 24h
        </div>
      </div>

      {/* KPI 4: City Efficiency Score */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            City Efficiency Index
          </span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black font-['Outfit'] text-cyan-300">
            {analytics.city_efficiency_score}
          </span>
          <span className="text-xs font-semibold text-slate-400">/ 100</span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-sky-500 to-cyan-400 h-1.5 rounded-full"
            style={{ width: `${analytics.city_efficiency_score}%` }}
          />
        </div>
      </div>

    </div>
  );
};
