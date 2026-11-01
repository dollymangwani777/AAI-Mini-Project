import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  FileText, 
  Layers, 
  X, 
  User, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { TrackResponse, Incident, IncidentLog } from '../../types';

interface TrackingModalProps {
  initialTicket?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  initialTicket = '',
  onClose,
  isModal = false
}) => {
  const [ticketInput, setTicketInput] = useState(initialTicket);
  const [trackData, setTrackData] = useState<TrackResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isBreached: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isBreached: false
  });

  const fetchTrackDetails = async (ticket: string) => {
    if (!ticket.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.trackComplaint(ticket);
      setTrackData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Grievance ticket not found. Please verify the ticket ID.");
      setTrackData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicket) {
      setTicketInput(initialTicket);
      fetchTrackDetails(initialTicket);
    }
  }, [initialTicket]);

  // Live countdown timer ticker
  useEffect(() => {
    if (!trackData?.incident) return;
    
    const calculateCountdown = () => {
      const deadline = new Date(trackData.incident.sla_deadline).getTime();
      const now = new Date().getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        const absDiff = Math.abs(diff);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isBreached: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isBreached: false });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [trackData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackDetails(ticketInput);
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 1;
      case 'IN_PROGRESS': return 2;
      case 'ESCALATED': return 2;
      case 'RESOLVED': return 3;
      default: return 1;
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl ${isModal ? 'max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto' : ''}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              Citizen Grievance Live Tracking
            </h2>
            <p className="text-xs text-slate-400">
              Real-time SLA countdown, departmental routing, and immutable resolution audit timeline.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Ticket Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Enter Ticket Number, e.g. CP-2026-1001"
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 uppercase font-mono tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !ticketInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition shadow-md shadow-sky-600/20 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2 mb-6">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Tracking Details */}
      {trackData && (
        <div className="space-y-6">
          
          {/* Top Banner: Status & Live SLA Countdown */}
          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold font-mono text-white">
                  {trackData.incident.ticket_number}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  trackData.incident.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  trackData.incident.status === 'ESCALATED' ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' :
                  trackData.incident.status === 'IN_PROGRESS' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                  'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {trackData.incident.status}
                </span>
                {trackData.incident.escalation_level > 0 && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-900 text-rose-200 border border-rose-700">
                    LEVEL {trackData.incident.escalation_level} ESCALATED
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mt-1">
                {trackData.incident.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{trackData.incident.raw_location}</span>
              </p>
            </div>

            {/* SLA Timer Clock */}
            <div className={`p-3.5 rounded-xl border flex flex-col items-end min-w-[200px] ${
              trackData.incident.status === 'RESOLVED'
                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                : timeLeft.isBreached
                ? 'bg-rose-950/50 border-rose-800 text-rose-300 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}>
              <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {trackData.incident.status === 'RESOLVED' 
                    ? 'Resolved in SLA' 
                    : timeLeft.isBreached 
                    ? 'SLA Breached By' 
                    : 'Target SLA Remaining'}
                </span>
              </div>
              <div className="text-2xl font-black font-mono tracking-tight">
                {trackData.incident.status === 'RESOLVED' ? (
                  <span className="text-emerald-400">RESOLVED</span>
                ) : (
                  <span>
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Target Deadline: {new Date(trackData.incident.sla_deadline).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Interactive Status Stepper */}
          <div className="py-2">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-0" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-sky-500 transition-all duration-500 -z-0"
                style={{ width: `${(getStatusStepIndex(trackData.incident.status) / 3) * 100}%` }}
              />

              {[
                { label: "1. Registered", sub: "Ingested & Analyzed" },
                { label: "2. Dispatched", sub: trackData.incident.assigned_department },
                { label: trackData.incident.status === 'ESCALATED' ? "3. Escalated" : "3. In Remediation", sub: "Field Investigation" },
                { label: "4. Resolved", sub: "Work Verified" }
              ].map((step, idx) => {
                const currentIdx = getStatusStepIndex(trackData.incident.status);
                const isPassed = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={idx} className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPassed || (isCurrent && trackData.incident.status === 'RESOLVED')
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 ring-4 ring-slate-900'
                        : isCurrent
                        ? trackData.incident.status === 'ESCALATED'
                          ? 'bg-rose-600 text-white ring-4 ring-rose-900/50 animate-pulse'
                          : 'bg-sky-600 text-white ring-4 ring-sky-950'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-200 mt-2 text-center">{step.label}</span>
                    <span className="text-[10px] text-slate-400 text-center max-w-[100px] truncate">{step.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clustered Repeat Report Indicator */}
          {trackData.incident.reported_by_count > 1 && (
            <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800 text-sky-200 flex items-center space-x-2.5 text-xs">
              <Layers className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                <strong>Crowdsource Reinforced:</strong> {trackData.incident.reported_by_count} independent citizen reports have clustered at this location, dynamically elevating priority.
              </span>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Assigned Department</span>
              <span className="font-bold text-slate-100">{trackData.incident.assigned_department}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Ward & Zone</span>
              <span className="font-bold text-slate-100">{trackData.incident.ward_id} • {trackData.incident.ward_name}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Severity Score</span>
              <span className="font-bold text-sky-400">{trackData.incident.severity_score}/100 ({trackData.incident.severity_level})</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">SLA Target</span>
              <span className="font-bold text-slate-100">{trackData.incident.sla_hours} Hours</span>
            </div>
          </div>

          {/* Immutable Audit Log Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Immutable Lifecycle Audit Timeline ({trackData.logs.length} events)</span>
            </h4>
            
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {trackData.logs.map((log) => (
                <div 
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        log.event_type === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        log.event_type === 'ESCALATED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        log.event_type === 'CLUSTER_MERGED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}>
                        {log.event_type}
                      </span>
                      <span className="font-semibold text-slate-200">{log.actor}</span>
                    </div>
                    <p className="text-slate-300 mt-1">{log.message}</p>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
