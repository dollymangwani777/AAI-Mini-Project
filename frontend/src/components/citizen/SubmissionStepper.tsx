import React from 'react';
import { 
  Bot, 
  MapPin, 
  Layers, 
  Gauge, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Copy,
  ExternalLink
} from 'lucide-react';
import { ComplaintSubmissionResponse } from '../../types';

interface SubmissionStepperProps {
  isLoading: boolean;
  response: ComplaintSubmissionResponse | null;
  onTrack: (ticketNumber: string) => void;
  onReset: () => void;
}

const AGENT_STEPS = [
  { id: 1, name: "Complaint Understanding Agent", icon: Bot, desc: "Extracting issue category, detected risks & urgency" },
  { id: 2, name: "Location Intelligence Agent", icon: MapPin, desc: "Binding GPS / informal address to City Ward geofence" },
  { id: 3, name: "Duplicate & Clustering Node", icon: Layers, desc: "Evaluating 100m radius Haversine proximity & duplicate merging" },
  { id: 4, name: "Priority & Severity Agent", icon: Gauge, desc: "Computing dynamic 0-100 severity score & risk weighting" },
  { id: 5, name: "Department Routing Agent", icon: Building2, desc: "Deterministically routing to accountable municipal unit" },
  { id: 6, name: "SLA & Deadline Assignment Agent", icon: Clock, desc: "Assigning strict turnaround deadline & countdown timer" }
];

export const SubmissionStepper: React.FC<SubmissionStepperProps> = ({
  isLoading,
  response,
  onTrack,
  onReset
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center animate-pulse">
            <Bot className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">
              Multi-Agent Ingestion Pipeline in Progress...
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous agents analyzing complaint semantics, geofencing, clustering, and routing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {AGENT_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id}
                className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 animate-pulse"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{step.name}</h4>
                  <p className="text-[11px] text-slate-500">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!response) return null;

  const { incident, is_duplicate, parent_ticket, pipeline_trace } = response;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Success / Clustered Header */}
      {is_duplicate ? (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-bold text-amber-300">
              Clustered with Active Existing Incident #{parent_ticket}
            </h4>
            <p className="text-xs text-amber-200/80 mt-1">
              {response.message} Instead of generating an isolated ticket, your grievance has reinforced this active incident’s priority!
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-bold text-emerald-300">
              Grievance Successfully Registered & Dispatched!
            </h4>
            <p className="text-xs text-emerald-200/80 mt-1">
              Your issue has been verified, prioritized, and routed to the municipal team. An SLA target has been officially locked.
            </p>
          </div>
        </div>
      )}

      {/* Ticket Details Summary Card */}
      <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-semibold text-slate-400">Tracking Ticket Number:</span>
            <span className="text-xl font-extrabold font-mono text-sky-400 tracking-wider">
              {incident.ticket_number}
            </span>
            <button
              onClick={() => handleCopyTicket(incident.ticket_number)}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Copy Ticket ID"
            >
              <Copy className="w-4 h-4" />
            </button>
            {copied && <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>}
          </div>
          <p className="text-sm font-semibold text-slate-200 mt-1">{incident.title}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              incident.severity_level === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
              incident.severity_level === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              incident.severity_level === 'MEDIUM' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
              'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {incident.severity_level} PRIORITY ({incident.severity_score}/100)
            </span>

            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {incident.assigned_department}
            </span>

            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {incident.ward_id} • {incident.ward_name}
            </span>

            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-950 text-sky-300 border border-sky-800">
              SLA: {incident.sla_hours}h
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => onTrack(incident.ticket_number)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-lg shadow-sky-600/20 active:scale-95"
          >
            <span>Live SLA Tracking</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs border border-slate-700 transition"
          >
            New Report
          </button>
        </div>
      </div>

      {/* Multi-Agent Execution Breakdown */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
          <span>Multi-Agent Execution Pipeline Trace</span>
        </h4>
        <div className="space-y-2.5">
          {pipeline_trace.map((step, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/90 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div className="flex items-start space-x-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-[11px] font-bold text-sky-400 border border-slate-700 shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <span className="font-bold text-slate-200">{step.agent_name}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.action}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800/80 text-sky-400 border border-slate-700">
                  {step.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
