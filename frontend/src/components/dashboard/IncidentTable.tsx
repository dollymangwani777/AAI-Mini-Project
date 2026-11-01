import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Layers, 
  AlertOctagon, 
  ChevronRight, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  ArrowUpDown,
  Flame,
  FileCheck2
} from 'lucide-react';
import { Incident } from '../../types';

interface IncidentTableProps {
  incidents: Incident[];
  onInspectIncident: (inc: Incident) => void;
  onRefresh: () => void;
}

// Live updating countdown ticker cell
const SlaCountdownCell: React.FC<{ deadline: string; status: string; isBreached: boolean }> = ({
  deadline,
  status,
  isBreached
}) => {
  const [display, setDisplay] = useState('');
  const [breached, setBreached] = useState(isBreached);

  useEffect(() => {
    const update = () => {
      if (status === 'RESOLVED') {
        setDisplay('Completed');
        return;
      }
      const dl = new Date(deadline).getTime();
      const now = new Date().getTime();
      const diff = dl - now;

      if (diff <= 0) {
        setBreached(true);
        const abs = Math.abs(diff);
        const h = Math.floor(abs / (1000 * 60 * 60));
        const m = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
        setDisplay(`Breached -${h}h ${m}m`);
      } else {
        setBreached(false);
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setDisplay(`${h}h ${m}m ${s}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline, status]);

  if (status === 'RESOLVED') {
    return (
      <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-xs">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Resolved</span>
      </span>
    );
  }

  if (breached) {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800 animate-pulse">
        <AlertOctagon className="w-3.5 h-3.5" />
        <span>{display}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 text-xs font-mono text-slate-300">
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      <span>{display}</span>
    </span>
  );
};

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onInspectIncident,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');

  const departments = Array.from(new Set(incidents.map(i => i.assigned_department)));

  const filtered = incidents.filter((inc) => {
    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = inc.ticket_number.toLowerCase().includes(q) ||
                    inc.title.toLowerCase().includes(q) ||
                    inc.raw_location.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Dept
    if (deptFilter !== 'ALL' && inc.assigned_department !== deptFilter) return false;

    // Severity
    if (severityFilter !== 'ALL' && inc.severity_level !== severityFilter) return false;

    // Status
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

    // SLA Risk
    if (slaFilter === 'BREACHED' && !inc.is_sla_breached) return false;
    if (slaFilter === 'ESCALATED' && inc.escalation_level === 0) return false;
    if (slaFilter === 'AT_RISK') {
      if (inc.status === 'RESOLVED' || inc.is_sla_breached || inc.time_remaining_seconds > 14400) return false;
    }

    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
      
      {/* Table Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
            <span>Incident Queue & SLA Ticker</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {filtered.length} of {incidents.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time municipal grievance triage, SLA escalation monitoring, and field resolution triggers.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ticket, title, location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Filter Pill Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
        <div className="flex items-center space-x-1 text-xs text-slate-400 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Dept */}
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>

        {/* Severity */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ESCALATED">Escalated</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        {/* SLA Risk */}
        <select
          value={slaFilter}
          onChange={(e) => setSlaFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">All SLA States</option>
          <option value="BREACHED">Breached SLA Only</option>
          <option value="ESCALATED">Escalated Only</option>
          <option value="AT_RISK">At Risk (&lt;4h remaining)</option>
        </select>

        {(searchTerm || deptFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL' || slaFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setDeptFilter('ALL');
              setSeverityFilter('ALL');
              setStatusFilter('ALL');
              setSlaFilter('ALL');
            }}
            className="text-[11px] text-sky-400 hover:underline font-semibold ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Ticket & Title</th>
              <th className="py-3 px-3">Ward & Landmark</th>
              <th className="py-3 px-3">Assigned Department</th>
              <th className="py-3 px-3">Severity</th>
              <th className="py-3 px-3 text-center">Crowd Reports</th>
              <th className="py-3 px-3">SLA Target & Ticker</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No grievances found matching the current filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((inc) => (
                <tr 
                  key={inc.id}
                  className={`hover:bg-slate-850/60 transition group ${
                    inc.escalation_level > 0 ? 'bg-rose-950/10' : ''
                  }`}
                >
                  {/* Ticket & Title */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-extrabold text-sky-400 block">
                      {inc.ticket_number}
                    </span>
                    <span className="font-medium text-slate-200 line-clamp-1 max-w-xs">
                      {inc.title}
                    </span>
                  </td>

                  {/* Ward */}
                  <td className="py-3 px-3 text-slate-300">
                    <span className="font-semibold block">{inc.ward_id}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[140px]">
                      {inc.raw_location}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-3">
                    <span className="text-slate-200 font-medium">
                      {inc.assigned_department}
                    </span>
                  </td>

                  {/* Severity Badge */}
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                      inc.severity_level === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      inc.severity_level === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                      inc.severity_level === 'MEDIUM' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {inc.severity_level} ({inc.severity_score})
                    </span>
                  </td>

                  {/* Crowd Reports (Clustered) */}
                  <td className="py-3 px-3 text-center">
                    {inc.reported_by_count > 1 ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 text-[11px] font-bold">
                        <Layers className="w-3 h-3" />
                        <span>{inc.reported_by_count} Reports</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono">1</span>
                    )}
                  </td>

                  {/* SLA Countdown Timer */}
                  <td className="py-3 px-3">
                    <SlaCountdownCell 
                      deadline={inc.sla_deadline}
                      status={inc.status}
                      isBreached={inc.is_sla_breached}
                    />
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inc.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      inc.status === 'ESCALATED' ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' :
                      inc.status === 'IN_PROGRESS' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {inc.status}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onInspectIncident(inc)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 hover:border-sky-500 transition active:scale-95"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
