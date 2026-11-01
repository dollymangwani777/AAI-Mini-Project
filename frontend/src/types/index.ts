export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED';

export interface Incident {
  id: number;
  ticket_number: string;
  title: string;
  raw_description: string;
  issue_type: string;
  detected_risks: string[];
  urgency_hint: string;
  severity_score: number;
  severity_level: SeverityLevel;
  ward_id: string;
  ward_name: string;
  raw_location: string;
  latitude: number;
  longitude: number;
  assigned_department: string;
  status: IncidentStatus;
  escalation_level: number;
  reported_by_count: number;
  citizen_contact?: string | null;
  image_url?: string | null;
  sla_hours: number;
  sla_deadline: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  resolution_notes?: string | null;
  resolved_by?: string | null;
  is_sla_breached: boolean;
  time_remaining_seconds: number;
}

export interface IncidentLog {
  id: number;
  ticket_number: string;
  event_type: string;
  actor: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AgentPipelineStep {
  agent_name: string;
  action: string;
  status: string;
  output: Record<string, any>;
}

export interface ComplaintSubmissionResponse {
  ticket_number: string;
  is_duplicate: boolean;
  parent_ticket?: string | null;
  message: string;
  incident: Incident;
  pipeline_trace: AgentPipelineStep[];
}

export interface TrackResponse {
  incident: Incident;
  logs: IncidentLog[];
  duplicate_count: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  title: string;
  ticket_number: string;
  severity_level: SeverityLevel;
  issue_type: string;
  ward_id: string;
}

export interface DepartmentMetric {
  department: string;
  total: number;
  active: number;
  resolved: number;
  breaches: number;
  avg_speed_hours: number;
  target_sla_avg: number;
}

export interface WardEfficiency {
  ward_id: string;
  ward_name: string;
  total: number;
  resolved: number;
  breaches: number;
  efficiency_score: number;
}

export interface AnalyticsOverview {
  total_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  sla_breached_count: number;
  escalated_count: number;
  resolution_rate: number;
  avg_resolution_time_hours: number;
  city_efficiency_score: number;
  issue_distribution: { issue_type: string; count: number; key: string }[];
  department_metrics: DepartmentMetric[];
  ward_efficiency: WardEfficiency[];
  weekly_trend: { day: string; submitted: number; resolved: number }[];
}
