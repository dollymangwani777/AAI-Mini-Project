import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  FileText, 
  Layers, 
  X, 
  Activity
} from 'lucide-react';
import { api } from '../../services/api';
import type { TrackResponse } from '../../types';

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
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm transition-colors ${isModal ? 'max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto' : ''}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            Grievance Redressal Tracking
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time SLA resolution countdown, municipal department routing, and audit trail.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Ticket Search Bar */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Enter ticket number (e.g. CP-2026-1001)..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-950 uppercase font-mono tracking-wider transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !ticketInput.trim()}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-xs disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track Ticket'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2 mb-5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Tracking Details */}
      {trackData && (
        <div className="space-y-5">
          
          {/* Top Banner: Status & Live SLA Countdown */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {trackData.incident.ticket_number}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  trackData.incident.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                  trackData.incident.status === 'ESCALATED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 animate-pulse' :
                  trackData.incident.status === 'IN_PROGRESS' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-400' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                }`}>
                  {trackData.incident.status}
                </span>
                {trackData.incident.escalation_level > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                    LEVEL {trackData.incident.escalation_level} ESCALATED
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                {trackData.incident.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{trackData.incident.raw_location}</span>
              </p>
            </div>

            {/* SLA Timer Clock */}
            <div className={`p-3 rounded-xl border flex flex-col items-end min-w-[170px] ${
              trackData.incident.status === 'RESOLVED'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : timeLeft.isBreached
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              <div className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider mb-0.5 text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                <span>
                  {trackData.incident.status === 'RESOLVED' 
                    ? 'Resolved in SLA' 
                    : timeLeft.isBreached 
                    ? 'SLA Breached By' 
                    : 'Time Remaining'}
                </span>
              </div>
              <div className="text-xl font-black font-mono tracking-tight">
                {trackData.incident.status === 'RESOLVED' ? (
                  <span className="text-emerald-600 dark:text-emerald-400">RESOLVED</span>
                ) : (
                  <span>
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Target: {new Date(trackData.incident.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Interactive Status Stepper */}
          <div className="py-2 px-1">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-sky-600 transition-all duration-300 -z-0"
                style={{ width: `${(getStatusStepIndex(trackData.incident.status) / 3) * 100}%` }}
              />

              {[
                { label: "1. Registered", sub: "Ingested & Triaged" },
                { label: "2. Dispatched", sub: trackData.incident.assigned_department },
                { label: trackData.incident.status === 'ESCALATED' ? "3. Escalated" : "3. In Progress", sub: "Field Investigation" },
                { label: "4. Resolved", sub: "Verified Fixed" }
              ].map((step, idx) => {
                const currentIdx = getStatusStepIndex(trackData.incident.status);
                const isPassed = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={idx} className="flex flex-col items-center z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPassed || (isCurrent && trackData.incident.status === 'RESOLVED')
                        ? 'bg-sky-600 text-white shadow-xs'
                        : isCurrent
                        ? trackData.incident.status === 'ESCALATED'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-sky-600 text-white ring-4 ring-sky-100 dark:ring-sky-950'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1.5 text-center">{step.label}</span>
                    <span className="text-[10px] text-slate-400 text-center max-w-[90px] truncate">{step.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duplicate Cluster Note */}
          {trackData.incident.reported_by_count > 1 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center space-x-2 text-xs">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>
                <strong>Reinforced Report:</strong> {trackData.incident.reported_by_count} independent citizen reports have clustered at this location, dynamically elevating priority.
              </span>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block mb-0.5 text-[11px]">Department</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{trackData.incident.assigned_department}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block mb-0.5 text-[11px]">Ward</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{trackData.incident.ward_id}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block mb-0.5 text-[11px]">Severity</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">{trackData.incident.severity_score}/100</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block mb-0.5 text-[11px]">SLA Target</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{trackData.incident.sla_hours} Hours</span>
            </div>
          </div>

          {/* Lifecycle Audit Timeline */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Audit Timeline ({trackData.logs.length} Events)</span>
            </h4>
            
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {trackData.logs.map((log) => (
                <div 
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        log.event_type === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        log.event_type === 'ESCALATED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        log.event_type === 'CLUSTER_MERGED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {log.event_type}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{log.actor}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 text-[11px]">{log.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
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
