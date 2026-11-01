import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  User
} from 'lucide-react';
import type { Incident } from '../../types';
import { api } from '../../services/api';

interface ResolutionModalProps {
  incident: Incident;
  onClose: () => void;
  onStatusUpdated: (updated: Incident) => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  incident,
  onClose,
  onStatusUpdated
}) => {
  const [status, setStatus] = useState<string>(incident.status);
  const [notes, setNotes] = useState<string>(incident.resolution_notes || '');
  const [resolvedBy, setResolvedBy] = useState<string>(incident.resolved_by || 'Field Engineer #304');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updated = await api.updateStatus(incident.id, {
        status,
        resolution_notes: notes,
        resolved_by: resolvedBy
      });
      onStatusUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update incident status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl relative max-h-[90vh] overflow-y-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase font-bold text-slate-500">Field Operator Dispatch</span>
              <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                {incident.ticket_number}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-['Outfit']">
              {incident.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incident Summary Info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-slate-500 block text-[10px]">Location</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{incident.raw_location}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Department</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{incident.assigned_department}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Severity</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">
              {incident.severity_score}/100 ({incident.severity_level})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Reported Count</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{incident.reported_by_count} Reports</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Target SLA</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{incident.sla_hours}h</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">SLA State</span>
            <span className={`font-bold ${incident.is_sla_breached ? 'text-rose-600' : 'text-emerald-600'}`}>
              {incident.is_sla_breached ? 'SLA Breached' : 'Within SLA Target'}
            </span>
          </div>
        </div>

        {/* Resolution Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Update Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['IN_PROGRESS', 'RESOLVED', 'ESCALATED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition ${
                    status === st
                      ? st === 'RESOLVED' 
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : st === 'ESCALATED'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Field Officer / Team in Charge
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                required
                value={resolvedBy}
                onChange={(e) => setResolvedBy(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Field Resolution Comments / Remediation Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Site inspected, repair team dispatched and work verified complete."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Save & Record Audit'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
