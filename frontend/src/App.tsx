import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ComplaintForm } from './components/citizen/ComplaintForm';
import { SubmissionStepper } from './components/citizen/SubmissionStepper';
import { TrackingModal } from './components/citizen/TrackingModal';
import { KpiBar } from './components/dashboard/KpiBar';
import { CityMap } from './components/dashboard/CityMap';
import { IncidentTable } from './components/dashboard/IncidentTable';
import { ResolutionModal } from './components/dashboard/ResolutionModal';
import { GovernanceCharts } from './components/dashboard/GovernanceCharts';
import { api } from './services/api';
import type { 
  Incident, 
  ComplaintSubmissionResponse, 
  AnalyticsOverview, 
  HeatmapPoint 
} from './types';
import { 
  CheckCircle2, 
  Search,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

export const App: React.FC = () => {
  // Theme state: defaults to 'light', remembers choice in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('civicpulse-theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const [currentTab, setCurrentTab] = useState<'citizen' | 'dashboard' | 'track'>('citizen');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Submission & Stepper State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResponse, setSubmissionResponse] = useState<ComplaintSubmissionResponse | null>(null);
  
  // Inspect / Resolution Modal
  const [inspectIncident, setInspectIncident] = useState<Incident | null>(null);

  // Tracking Ticket ID
  const [trackTicketNumber, setTrackTicketNumber] = useState<string>('');

  // Reseed State
  const [isReseeding, setIsReseeding] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize theme with HTML document class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('civicpulse-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Dashboard & Incidents Data
  const loadData = useCallback(async () => {
    try {
      const [incidentsData, analyticsData, heatmapData] = await Promise.all([
        api.getIncidents(),
        api.getAnalyticsOverview(),
        api.getHeatmapData()
      ]);
      setIncidents(incidentsData);
      setAnalytics(analyticsData);
      setHeatmapPoints(heatmapData);
    } catch (err) {
      console.error("Failed to load CivicPulse data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Real-time polling every 15s to capture autonomous escalation updates from APScheduler
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Citizen Complaint Submission
  const handleComplaintSubmit = async (data: {
    description: string;
    location: string;
    latitude?: number;
    longitude?: number;
    citizen_contact?: string;
    image_url?: string;
  }) => {
    setIsSubmitting(true);
    setSubmissionResponse(null);
    try {
      const res = await api.submitComplaint(data);
      setSubmissionResponse(res);

      const submittedTicket = res.ticket_number || res.parent_ticket || '';
      if (submittedTicket) {
        setTrackTicketNumber(submittedTicket);
        try {
          localStorage.setItem('civicpulse_last_ticket', submittedTicket);
          const raw = localStorage.getItem('civicpulse_my_tickets');
          const existing = raw ? JSON.parse(raw) : [];
          const updated = [
            {
              ticket: submittedTicket,
              title: res.incident?.title || data.description.slice(0, 40),
              status: res.incident?.status || 'SUBMITTED',
              timestamp: new Date().toISOString()
            },
            ...existing.filter((item: any) => item.ticket !== submittedTicket)
          ].slice(0, 8);
          localStorage.setItem('civicpulse_my_tickets', JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save ticket to localStorage:", e);
        }
      }

      showToast(res.is_duplicate 
        ? `Duplicate report matched and clustered into #${res.parent_ticket}` 
        : `Grievance registered as #${res.ticket_number}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to submit grievance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Update from Resolution Modal
  const handleStatusUpdated = (updated: Incident) => {
    showToast(`Ticket #${updated.ticket_number} marked ${updated.status}`);
    setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
    loadData();
  };

  // Handle Reseed Demo Data
  const handleReseed = async () => {
    setIsReseeding(true);
    try {
      await api.seedDatabase();
      showToast("Database successfully re-seeded with realistic mock incidents!");
      await loadData();
    } catch (err) {
      alert("Failed to reseed database.");
    } finally {
      setIsReseeding(false);
    }
  };

  const handleOpenTrack = (ticketNumber: string) => {
    setTrackTicketNumber(ticketNumber);
    setCurrentTab('track');
  };

  const activeCount = analytics?.active_incidents || incidents.filter(i => i.status !== 'RESOLVED').length;
  const breachedCount = analytics?.sla_breached_count || incidents.filter(i => i.is_sla_breached).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-sky-950 dark:text-sky-100 dark:border dark:border-sky-800 shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeCount={activeCount}
        breachedCount={breachedCount}
        onReseed={handleReseed}
        isReseeding={isReseeding}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* VIEW 1: CITIZEN REPORTING PORTAL */}
        {currentTab === 'citizen' && (
          <div className="space-y-6">
            
            {/* Clean Hero Header */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Civic Grievance Redressal
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] mt-0.5">
                  Report an Issue & Track Resolution
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mt-1">
                  Report potholes, overflowing garbage, broken water mains, or power faults. Multi-agent AI verifies location, eliminates duplicate tickets within 100m, and locks resolution deadlines.
                </p>
              </div>

              <button
                onClick={() => setCurrentTab('track')}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition active:scale-95 shrink-0 self-start sm:self-auto"
              >
                <Search className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Track Existing Ticket</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Reporting Form (7 cols) */}
              <div className="lg:col-span-7">
                <ComplaintForm
                  onSubmit={handleComplaintSubmit}
                  isLoading={isSubmitting}
                />
              </div>

              {/* Right Column: Submission Stepper / Explainer (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {(isSubmitting || submissionResponse) ? (
                  <SubmissionStepper
                    isLoading={isSubmitting}
                    response={submissionResponse}
                    onTrack={handleOpenTrack}
                    onReset={() => setSubmissionResponse(null)}
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
                    <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          How CivicPulse Redressal Works
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Autonomous multi-agent lifecycle
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-start space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          1
                        </span>
                        <div>
                          <strong className="text-slate-900 dark:text-slate-100 block">Semantic Understanding</strong>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">AI automatically extracts the hazard category, risks (traffic, public health), and urgency.</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <strong className="text-slate-900 dark:text-slate-100 block">100m Proximity Clustering</strong>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Haversine spatial check merges duplicate citizen complaints into parent incidents without creating spam tickets.</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          3
                        </span>
                        <div>
                          <strong className="text-slate-900 dark:text-slate-100 block">Department Dispatch & SLA</strong>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Routes to PWD, Sanitation, Water Board, or Power Board with a locked 6h to 72h SLA timer.</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          4
                        </span>
                        <div>
                          <strong className="text-slate-900 dark:text-slate-100 block">60s Escalation Daemon</strong>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Background scheduler escalates overdue tickets to District Supervisors and City Commissioners.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: SMART CITY OPERATIONS DASHBOARD (Control Center) */}
        {currentTab === 'dashboard' && (
          <div className="space-y-5">
            
            {/* Top KPI Bar */}
            <KpiBar analytics={analytics} loading={loading} />

            {/* Interactive City Map */}
            <CityMap
              incidents={incidents}
              heatmapPoints={heatmapPoints}
              onSelectIncident={(inc) => setInspectIncident(inc)}
              theme={theme}
            />

            {/* Incident Management Queue Table */}
            <IncidentTable
              incidents={incidents}
              onInspectIncident={(inc) => setInspectIncident(inc)}
              onRefresh={loadData}
            />

            {/* Governance & Transparency Charts (Recharts) */}
            <GovernanceCharts 
              analytics={analytics} 
              loading={loading} 
              theme={theme}
            />

          </div>
        )}

        {/* VIEW 3: CITIZEN TICKET TRACKING */}
        {currentTab === 'track' && (
          <div className="max-w-3xl mx-auto py-2">
            <TrackingModal
              initialTicket={trackTicketNumber || localStorage.getItem('civicpulse_last_ticket') || ''}
            />
          </div>
        )}

      </main>

      {/* Field Inspection & Resolution Modal */}
      {inspectIncident && (
        <ResolutionModal
          incident={inspectIncident}
          onClose={() => setInspectIncident(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3.5 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span>
            CivicPulse AI &bull; Smart City Grievance & Civic Issue Resolution System (PS-10)
          </span>
          <span className="text-[11px]">
            FastAPI &bull; React 19 Vite &bull; Tailwind CSS &bull; Leaflet &bull; Recharts
          </span>
        </div>
      </footer>

    </div>
  );
};

export default App;
