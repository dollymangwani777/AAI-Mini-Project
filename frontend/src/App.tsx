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
import { 
  Incident, 
  ComplaintSubmissionResponse, 
  AnalyticsOverview, 
  HeatmapPoint 
} from './types';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  Search,
  RotateCw,
  TrendingUp,
  Building2,
  Clock
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'citizen' | 'dashboard' | 'track'>('dashboard');
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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
      showToast(res.is_duplicate 
        ? `Duplicate matched! Clustered into #${res.parent_ticket}` 
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
    showToast(`Ticket #${updated.ticket_number} updated to ${updated.status}`);
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

  // Open Tracking View
  const handleOpenTrack = (ticketNumber: string) => {
    setTrackTicketNumber(ticketNumber);
    setCurrentTab('track');
  };

  const activeCount = analytics?.active_incidents || incidents.filter(i => i.status !== 'RESOLVED').length;
  const breachedCount = analytics?.sla_breached_count || incidents.filter(i => i.is_sla_breached).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-900/90 text-sky-100 border border-sky-700 shadow-2xl backdrop-blur-md animate-bounce text-xs font-semibold">
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
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* VIEW 1: CITIZEN REPORTING PORTAL */}
        {currentTab === 'citizen' && (
          <div className="space-y-6">
            
            {/* Citizen Portal Banner */}
            <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-900 border border-sky-900/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next-Generation Citizen Grievance Redressal</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
                  CivicPulse Ingestion AI
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
                  Report infrastructure damages, sanitary overflows, open manholes, or street hazards. Our autonomous 6-agent engine dedupes against existing incidents within 100m and enforces strict SLA targets.
                </p>
              </div>

              <button
                onClick={() => setCurrentTab('track')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95 shrink-0"
              >
                <Search className="w-4 h-4 text-sky-400" />
                <span>Track Existing Ticket</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Reporting Form (7 cols) */}
              <div className="lg:col-span-7">
                <ComplaintForm
                  onSubmit={handleComplaintSubmit}
                  isLoading={isSubmitting}
                />
              </div>

              {/* Right Column: Submission Stepper / Live Results (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {(isSubmitting || submissionResponse) ? (
                  <SubmissionStepper
                    isLoading={isSubmitting}
                    response={submissionResponse}
                    onTrack={handleOpenTrack}
                    onReset={() => setSubmissionResponse(null)}
                  />
                ) : (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-['Outfit']">
                          Autonomous Municipal Pipeline
                        </h3>
                        <p className="text-xs text-slate-400">
                          How CivicPulse handles every citizen report:
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <strong className="text-sky-400 block mb-0.5">1. Semantic Understanding</strong>
                        <span className="text-slate-400">LangChain structured extraction of issue types, hazards, and traffic/health danger risks.</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <strong className="text-sky-400 block mb-0.5">2. 100m Proximity Clustering</strong>
                        <span className="text-slate-400">Haversine spatial check against active tickets. Duplicate reports automatically reinforce parent priority without spamming field squads.</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <strong className="text-sky-400 block mb-0.5">3. Dynamic Severity & SLA Assignment</strong>
                        <span className="text-slate-400">Composite 0-100 scoring locking 6h (Critical), 24h (High), 48h (Medium), or 72h (Low) response deadlines.</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <strong className="text-sky-400 block mb-0.5">4. Autonomous 60s Escalation</strong>
                        <span className="text-slate-400">APScheduler daemon continuously monitors breached SLAs, elevating overdue tickets to District Supervisors and Commissioners.</span>
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
          <div className="space-y-6">
            
            {/* Top KPI Bar */}
            <KpiBar analytics={analytics} loading={loading} />

            {/* Interactive City Map */}
            <CityMap
              incidents={incidents}
              heatmapPoints={heatmapPoints}
              onSelectIncident={(inc) => setInspectIncident(inc)}
            />

            {/* Incident Management Queue Table */}
            <IncidentTable
              incidents={incidents}
              onInspectIncident={(inc) => setInspectIncident(inc)}
              onRefresh={loadData}
            />

            {/* Governance & Transparency Charts (Recharts) */}
            <GovernanceCharts analytics={analytics} loading={loading} />

          </div>
        )}

        {/* VIEW 3: CITIZEN TICKET TRACKING */}
        {currentTab === 'track' && (
          <div className="max-w-4xl mx-auto py-2">
            <TrackingModal
              initialTicket={trackTicketNumber || (incidents.length > 0 ? incidents[0].ticket_number : 'CP-2026-1001')}
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
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            CivicPulse AI &bull; Smart City Grievance & Civic Issue Resolution System (PS-10)
          </span>
          <span className="text-slate-400">
            Powered by FastAPI &bull; APScheduler &bull; React Vite &bull; Tailwind CSS &bull; Leaflet &bull; Recharts
          </span>
        </div>
      </footer>

    </div>
  );
};

export default App;
