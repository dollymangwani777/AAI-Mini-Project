import React from 'react';
import { 
  AlertOctagon, 
  Clock, 
  Zap, 
  TrendingUp, 
  Flame
} from 'lucide-react';
import type { AnalyticsOverview } from '../../types';

interface KpiBarProps {
  analytics: AnalyticsOverview | null;
  loading: boolean;
}

export const KpiBar: React.FC<KpiBarProps> = ({ analytics, loading }) => {
  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      
      {/* KPI 1: Active Incidents */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Incidents
          </span>
          <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Flame className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white">
            {analytics.active_incidents}
          </span>
          <span className="text-xs text-slate-400">
            / {analytics.total_incidents} total
          </span>
        </div>
        <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <TrendingUp className="w-3 h-3" />
          <span>{analytics.resolution_rate}% Resolved Overall</span>
        </div>
      </div>

      {/* KPI 2: SLA Breaches */}
      <div className={`border rounded-2xl p-4 shadow-xs transition-colors ${
        analytics.sla_breached_count > 0 
          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            SLA Breaches
          </span>
          <div className={`p-1.5 rounded-lg ${
            analytics.sla_breached_count > 0 
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 animate-pulse' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-['Outfit'] text-rose-600 dark:text-rose-400">
            {analytics.sla_breached_count}
          </span>
          {analytics.escalated_count > 0 && (
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full">
              {analytics.escalated_count} Escalated
            </span>
          )}
        </div>
        <div className="mt-1 text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium">
          Automated supervisor escalation
        </div>
      </div>

      {/* KPI 3: Average Resolution Speed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Resolution Speed
          </span>
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white">
            {analytics.avg_resolution_time_hours}
          </span>
          <span className="text-xs text-slate-500">hours</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Target city SLA: 24h
        </div>
      </div>

      {/* KPI 4: City Efficiency Index */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Efficiency Index
          </span>
          <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-2xl font-bold font-['Outfit'] text-sky-600 dark:text-sky-400">
            {analytics.city_efficiency_score}
          </span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
        <div className="mt-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-sky-600 dark:bg-sky-500 h-1.5 rounded-full"
            style={{ width: `${analytics.city_efficiency_score}%` }}
          />
        </div>
      </div>

    </div>
  );
};
