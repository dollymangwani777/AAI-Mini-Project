import React, { useState } from 'react';
import { 
  Bot, 
  MapPin, 
  Layers, 
  Gauge, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Copy,
  ExternalLink
} from 'lucide-react';
import type { ComplaintSubmissionResponse } from '../../types';

interface SubmissionStepperProps {
  isLoading: boolean;
  response: ComplaintSubmissionResponse | null;
  onTrack: (ticketNumber: string) => void;
  onReset: () => void;
}

const AGENT_STEPS = [
  { id: 1, name: "Complaint Understanding", icon: Bot, desc: "Semantic analysis of category and danger risks" },
  { id: 2, name: "Location Intelligence", icon: MapPin, desc: "Normalization of address & ward geofencing" },
  { id: 3, name: "Duplicate Clustering", icon: Layers, desc: "Haversine 100m proximity verification" },
  { id: 4, name: "Priority & Severity", icon: Gauge, desc: "Dynamic 0-100 hazard scoring" },
  { id: 5, name: "Department Routing", icon: Building2, desc: "Accountable municipal unit assignment" },
  { id: 6, name: "SLA Assignment", icon: Clock, desc: "Strict response deadline locking" }
];

export const SubmissionStepper: React.FC<SubmissionStepperProps> = ({
  isLoading,
  response,
  onTrack,
  onReset
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Bot className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Multi-Agent Ingestion in Progress...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analyzing text semantics, proximity clustering, and routing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {AGENT_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id}
                className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800"
              >
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{step.name}</h4>
                  <p className="text-[10px] text-slate-500">{step.desc}</p>
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      
      {/* Result Status Banner */}
      {is_duplicate ? (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-900 dark:text-amber-300">
              Clustered with Active Incident #{parent_ticket}
            </h4>
            <p className="mt-0.5 text-amber-700 dark:text-amber-300/80">
              {response.message}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300">
              Grievance Registered Successfully
            </h4>
            <p className="mt-0.5 text-emerald-700 dark:text-emerald-300/80">
              Assigned to {incident.assigned_department} with a {incident.sla_hours}-hour resolution deadline.
            </p>
          </div>
        </div>
      )}

      {/* Ticket Details Summary Card */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Ticket:</span>
            <span className="text-lg font-black font-mono text-sky-600 dark:text-sky-400 tracking-wider">
              {incident.ticket_number}
            </span>
            <button
              onClick={() => handleCopyTicket(incident.ticket_number)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Copy Ticket ID"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {copied && <span className="text-[10px] text-emerald-600 font-semibold">Copied!</span>}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onTrack(incident.ticket_number)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-xs"
            >
              <span>Track Ticket</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={onReset}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 transition"
            >
              New Report
            </button>
          </div>
        </div>

        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{incident.title}</p>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            incident.severity_level === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
            incident.severity_level === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
            incident.severity_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' :
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          }`}>
            {incident.severity_level} ({incident.severity_score}/100)
          </span>

          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {incident.assigned_department}
          </span>

          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {incident.ward_id}
          </span>

          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
            SLA: {incident.sla_hours}h
          </span>
        </div>
      </div>

      {/* Multi-Agent Breakdown */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Agent Execution Breakdown
        </h4>
        <div className="space-y-1.5">
          {pipeline_trace.map((step, idx) => (
            <div 
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-sky-600 dark:text-sky-400 shrink-0">
                  {idx + 1}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{step.agent_name}</span>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {step.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
