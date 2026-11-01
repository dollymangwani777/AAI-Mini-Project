import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Award
} from 'lucide-react';
import type { AnalyticsOverview } from '../../types';

interface GovernanceChartsProps {
  analytics: AnalyticsOverview | null;
  loading: boolean;
  theme?: 'light' | 'dark';
}

export const GovernanceCharts: React.FC<GovernanceChartsProps> = ({ 
  analytics, 
  loading,
  theme = 'light'
}) => {
  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
        <div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
        <div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = '#64748b';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  const deptData = analytics.department_metrics.map((d) => ({
    name: d.department.replace('Department (PWD)', 'PWD').replace('Water Supply & Sewerage Board', 'Water Board').replace('Municipal Sanitation Unit', 'Sanitation').replace('Power Utility Board', 'Power Board').replace('Horticulture & Parks Wing', 'Parks'),
    ActualSpeed: d.avg_speed_hours,
    TargetSLA: d.target_sla_avg
  }));

  return (
    <div className="space-y-4">
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Chart 1: Department Speed vs SLA Target */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Department Turnaround vs. SLA Target
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Average resolution hours compared against target SLA (lower is faster)
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={textColor} 
                  fontSize={10} 
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke={textColor} fontSize={10} unit="h" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder,
                    borderRadius: '0.75rem',
                    color: tooltipText,
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="ActualSpeed" name="Actual Speed (h)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="TargetSLA" name="Target SLA (h)" fill={isDark ? '#475569' : '#cbd5e1'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weekly Complaint Volume vs Resolution Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Weekly Redressal Velocity
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                New complaints ingested vs. tickets resolved daily
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.weekly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="day" stroke={textColor} fontSize={10} tickLine={false} />
                <YAxis stroke={textColor} fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderColor: tooltipBorder,
                    borderRadius: '0.75rem',
                    color: tooltipText,
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#0284c7" fillOpacity={1} fill="url(#colorSubmitted)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Ward Efficiency Leaderboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
              Ward Municipal Efficiency Leaderboard
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Civic zones ranked by prompt resolution speed and zero-breach compliance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {analytics.ward_efficiency.slice(0, 6).map((ward, rank) => (
            <div 
              key={ward.ward_id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${
                  rank === 0 ? 'bg-amber-500 text-white' :
                  rank === 1 ? 'bg-slate-400 text-white' :
                  rank === 2 ? 'bg-amber-700 text-white' :
                  'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  #{rank + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{ward.ward_id}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">{ward.ward_name}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 font-mono">
                  {ward.efficiency_score}%
                </span>
                <div className="text-[10px] text-slate-400 flex items-center justify-end space-x-1 mt-0.5">
                  <span className="text-emerald-600 dark:text-emerald-400">{ward.resolved} resolved</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
