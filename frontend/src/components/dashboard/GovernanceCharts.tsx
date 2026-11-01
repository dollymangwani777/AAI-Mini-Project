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
  Award, 
  Building2, 
  AlertOctagon,
  CheckCircle2
} from 'lucide-react';
import { AnalyticsOverview } from '../../types';

interface GovernanceChartsProps {
  analytics: AnalyticsOverview | null;
  loading: boolean;
}

export const GovernanceCharts: React.FC<GovernanceChartsProps> = ({ analytics, loading }) => {
  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800" />
        <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  // Format data for Department Resolution Speed Bar Chart
  const deptData = analytics.department_metrics.map((d) => ({
    name: d.department.replace('Department (PWD)', 'PWD').replace('Water Supply & Sewerage Board', 'Water Board').replace('Municipal Sanitation Unit', 'Sanitation').replace('Power Utility Board', 'Power Board').replace('Horticulture & Parks Wing', 'Parks'),
    ActualSpeed: d.avg_speed_hours,
    TargetSLA: d.target_sla_avg,
    Breaches: d.breaches
  }));

  return (
    <div className="space-y-6">
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Department Speed vs SLA Target */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                  Department Turnaround Speed vs. SLA
                </h3>
                <p className="text-xs text-slate-400">
                  Actual resolution hours compared against target SLA threshold (lower is better)
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} unit="h" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="ActualSpeed" name="Actual Speed (Hours)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="TargetSLA" name="Target SLA (Hours)" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weekly Complaint Volume vs Resolution Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                  Weekly Ingestion & Remediation Velocity
                </h3>
                <p className="text-xs text-slate-400">
                  New complaints ingested vs. tickets verified and closed daily
                </p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.weekly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="submitted" name="Grievances Submitted" stroke="#38bdf8" fillOpacity={1} fill="url(#colorSubmitted)" />
                <Area type="monotone" dataKey="resolved" name="Resolved & Verified" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Ward Efficiency Leaderboard */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                Ward Municipal Service Efficiency Leaderboard
              </h3>
              <p className="text-xs text-slate-400">
                Civic zones ranked by prompt resolution percentage and zero-SLA-breach compliance
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {analytics.ward_efficiency.slice(0, 6).map((ward, rank) => (
            <div 
              key={ward.ward_id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center space-x-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono ${
                  rank === 0 ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' :
                  rank === 1 ? 'bg-slate-300 text-slate-950' :
                  rank === 2 ? 'bg-amber-800 text-amber-100' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  #{rank + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{ward.ward_id}</h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{ward.ward_name}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-sky-400 font-mono">
                  {ward.efficiency_score}%
                </span>
                <div className="text-[10px] text-slate-400 flex items-center justify-end space-x-1.5 mt-0.5">
                  <span className="text-emerald-400">{ward.resolved} resolved</span>
                  {ward.breaches > 0 && (
                    <span className="text-rose-400">({ward.breaches} breached)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
