import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Layers, 
  AlertOctagon, 
  CheckCircle2, 
  FileCheck2
} from 'lucide-react';
import type { Incident } from '../../types';

interface IncidentTableProps {
  incidents: Incident[];
  onInspectIncident: (inc: Incident) => void;
  onRefresh?: () => void;
}

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
        setDisplay(`Overdue -${h}h ${m}m`);
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
      <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Resolved</span>
      </span>
    );
  }

  if (breached) {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
        <AlertOctagon className="w-3 h-3" />
        <span>{display}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 text-xs font-mono text-slate-600 dark:text-slate-300">
      <Clock className="w-3.5 h-3.5 text-slate-400" />
      <span>{display}</span>
    </span>
  );
};

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onInspectIncident
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');

  const departments = Array.from(new Set(incidents.map(i => i.assigned_department)));

  const filtered = incidents.filter((inc) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = inc.ticket_number.toLowerCase().includes(q) ||
                    inc.title.toLowerCase().includes(q) ||
                    inc.raw_location.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (deptFilter !== 'ALL' && inc.assigned_department !== deptFilter) return false;
    if (severityFilter !== 'ALL' && inc.severity_level !== severityFilter) return false;
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

    if (slaFilter === 'BREACHED' && !inc.is_sla_breached) return false;
    if (slaFilter === 'ESCALATED' && inc.escalation_level === 0) return false;
    if (slaFilter === 'AT_RISK') {
      if (inc.status === 'RESOLVED' || inc.is_sla_breached || inc.time_remaining_seconds > 14400) return false;
    }

    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-colors">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center space-x-2">
            <span>Incident Queue & Triage</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
              {filtered.length} of {incidents.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time municipal grievance monitoring, SLA tracking, and resolution dispatch.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ticket, title, ward..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mr-1">
          <Filter className="w-3 h-3" />
          <span>Filter:</span>
        </div>

        {/* Dept */}
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
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
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
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
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
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
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="ALL">All SLA States</option>
          <option value="BREACHED">Breached SLA</option>
          <option value="ESCALATED">Escalated Only</option>
          <option value="AT_RISK">At Risk (&lt;4h)</option>
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
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Clean Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Ticket & Title</th>
              <th className="py-2.5 px-3">Ward</th>
              <th className="py-2.5 px-3">Department</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-2.5 text-center">Reports</th>
              <th className="py-2.5 px-3">SLA Status</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No grievances found matching the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((inc) => (
                <tr 
                  key={inc.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-850 transition ${
                    inc.escalation_level > 0 ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400 block text-xs">
                      {inc.ticket_number}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1 max-w-xs">
                      {inc.title}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                    <span className="font-semibold block">{inc.ward_id}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[120px]">
                      {inc.raw_location}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {inc.assigned_department}
                  </td>

                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity_level === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      inc.severity_level === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                      inc.severity_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {inc.severity_level} ({inc.severity_score})
                    </span>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    {inc.reported_by_count > 1 ? (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                        <Layers className="w-2.5 h-2.5" />
                        <span>{inc.reported_by_count}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">1</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    <SlaCountdownCell 
                      deadline={inc.sla_deadline}
                      status={inc.status}
                      isBreached={inc.is_sla_breached}
                    />
                  </td>

                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                      inc.status === 'ESCALATED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 animate-pulse' :
                      inc.status === 'IN_PROGRESS' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}>
                      {inc.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onInspectIncident(inc)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-600 text-slate-700 hover:text-white dark:bg-slate-800 dark:hover:bg-sky-600 dark:text-slate-300 dark:hover:text-white font-semibold text-xs border border-slate-200 dark:border-slate-700 transition"
                    >
                      <FileCheck2 className="w-3 h-3" />
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
