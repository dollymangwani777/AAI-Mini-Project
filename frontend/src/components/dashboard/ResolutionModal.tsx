import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Building2, 
  MapPin, 
  ShieldAlert, 
  FileText,
  Send
} from 'lucide-react';
import { Incident } from '../../types';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-semibold text-slate-400">Field Operator Dispatch</span>
              <span className="text-sm font-extrabold font-mono text-sky-400">
                {incident.ticket_number}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1 font-['Outfit']">
              {incident.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incident Summary Info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-5 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-400 block mb-0.5">Location</span>
            <span className="font-semibold text-slate-200">{incident.raw_location}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Assigned Department</span>
            <span className="font-semibold text-slate-200">{incident.assigned_department}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Severity Score</span>
            <span className={`font-bold ${
              incident.severity_level === 'CRITICAL' ? 'text-rose-400' :
              incident.severity_level === 'HIGH' ? 'text-amber-400' : 'text-sky-400'
            }`}>
              {incident.severity_score}/100 ({incident.severity_level})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Reports Clustered</span>
            <span className="font-semibold text-slate-200">
              {incident.reported_by_count} {incident.reported_by_count > 1 ? '(Repeat Cluster)' : 'Citizen Report'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Target SLA</span>
            <span className="font-semibold text-slate-200">{incident.sla_hours}h</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">SLA State</span>
            <span className={`font-bold ${incident.is_sla_breached ? 'text-rose-400' : 'text-emerald-400'}`}>
              {incident.is_sla_breached ? 'SLA BREACHED' : 'Within SLA Target'}
            </span>
          </div>
        </div>

        {/* Resolution Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Update Incident Workflow Status <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['IN_PROGRESS', 'RESOLVED', 'ESCALATED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    status === st
                      ? st === 'RESOLVED' 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                        : st === 'ESCALATED'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                        : 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Field Officer / Engineer in Charge
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={resolvedBy}
                onChange={(e) => setResolvedBy(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Remediation Notes / Field Verification Comments
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Pothole excavated, cold-mix asphalt applied, and road rolled smooth. Certified safe for traffic."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition shadow-lg shadow-sky-600/25 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Save & Record Audit'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
