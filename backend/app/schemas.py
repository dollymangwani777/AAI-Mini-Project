from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

class ComplaintSubmissionRequest(BaseModel):
    description: str = Field(..., min_length=4, description="Detailed text of the citizen grievance")
    location: Optional[str] = Field(None, description="Informal or landmark location, e.g., 'Near Sector 14 market'")
    latitude: Optional[float] = Field(None, description="Direct GPS Latitude coordinate")
    longitude: Optional[float] = Field(None, description="Direct GPS Longitude coordinate")
    citizen_contact: Optional[str] = Field(None, description="Citizen email or phone number for status SMS/updates")
    image_url: Optional[str] = Field(None, description="Optional photo URL or base64 preview")

class AgentPipelineStep(BaseModel):
    agent_name: str
    action: str
    status: str
    output: Dict[str, Any]

class IncidentLogResponse(BaseModel):
    id: int
    ticket_number: str
    event_type: str
    actor: str
    message: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

class IncidentResponse(BaseModel):
    id: int
    ticket_number: str
    title: str
    raw_description: str
    issue_type: str
    detected_risks: List[str] = []
    urgency_hint: str
    severity_score: float
    severity_level: str
    ward_id: str
    ward_name: str
    raw_location: str
    latitude: float
    longitude: float
    assigned_department: str
    status: str
    escalation_level: int
    reported_by_count: int
    citizen_contact: Optional[str] = None
    image_url: Optional[str] = None
    sla_hours: int
    sla_deadline: datetime
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = None
    is_sla_breached: bool = False
    time_remaining_seconds: float = 0.0

    model_config = ConfigDict(from_attributes=True)

class ComplaintSubmissionResponse(BaseModel):
    ticket_number: str
    is_duplicate: bool
    parent_ticket: Optional[str] = None
    message: str
    incident: IncidentResponse
    pipeline_trace: List[AgentPipelineStep]

class DuplicateReportResponse(BaseModel):
    id: int
    ticket_number: str
    description: str
    raw_location: Optional[str] = None
    distance_meters: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TrackResponse(BaseModel):
    incident: IncidentResponse
    logs: List[IncidentLogResponse]
    duplicate_count: int
    duplicate_reports: List[DuplicateReportResponse] = []

class StatusUpdateRequest(BaseModel):
    status: str = Field(..., description="IN_PROGRESS, RESOLVED, or ESCALATED")
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = "Field Officer"

class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    weight: float
    title: str
    ticket_number: str
    severity_level: str
    issue_type: str
    ward_id: str

class AnalyticsOverviewResponse(BaseModel):
    total_incidents: int
    active_incidents: int
    resolved_incidents: int
    sla_breached_count: int
    escalated_count: int
    resolution_rate: float
    avg_resolution_time_hours: float
    city_efficiency_score: float
    issue_distribution: List[Dict[str, Any]]
    department_metrics: List[Dict[str, Any]]
    ward_efficiency: List[Dict[str, Any]]
    weekly_trend: List[Dict[str, Any]]
